import { expect, type FrameLocator, type Page } from '@playwright/test';

export type BookingSlot = {
  dateLabel: string;
  time: string;
};

export type GuestDetails = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
};

export class CalendlyPage {
  readonly page: Page;
  readonly frame: FrameLocator;

  constructor(page: Page) {
    this.page = page;
    this.frame = page.frameLocator(
      'iframe[title="Select a Date & Time - Calendly"]',
    );
  }

  async expectLoaded() {
    await expect(
      this.frame.locator('[data-testid="calendar"]'),
    ).toBeVisible();

    await expect
      .poll(async () => {
        const dateButtons = this.frame.getByRole('button', {
          name: /Times available/i,
        });
        const dateCount = await dateButtons.count();

        for (let index = 0; index < dateCount; index += 1) {
          const label = await dateButtons.nth(index).getAttribute('aria-label');

          if (label && !label.includes('No times available')) {
            return true;
          }
        }

        return false;
      })
      .toBe(true);
  }

  async collectAvailableSlots(requiredCount: number): Promise<BookingSlot[]> {
    const slots = await this.collectSlotsFromDisplayedMonth(requiredCount);

    if (slots.length < requiredCount) {
      throw new Error(
        `Only ${slots.length} unique Calendly slots were discovered in the current month. At least ${requiredCount} are required.`,
      );
    }

    return slots;
  }

  async collectSlotsFromDisplayedMonth(
    requiredCount: number,
  ): Promise<BookingSlot[]> {
    const slots: BookingSlot[] = [];
    const seenSlots = new Set<string>();
    const processedDates = new Set<string>();

    const today = new Date();
    const currentDay = today.getDate();

    while (slots.length < requiredCount) {
      const dateButtons = this.frame.getByRole('button', {
        name: /Times available/i,
      });

      const dateCount = await dateButtons.count();

      let foundDate = false;

      for (let index = 0; index < dateCount; index += 1) {
        if (slots.length >= requiredCount) {
          break;
        }

        const dateButton = dateButtons.nth(index);

        if (!(await dateButton.isVisible())) {
          continue;
        }

        const dateLabel = await dateButton.getAttribute('aria-label');

        if (!dateLabel || dateLabel.includes('No times available')) {
          continue;
        }

        if (processedDates.has(dateLabel)) {
          continue;
        }

        const dayMatch = dateLabel.match(
          /,\s+[A-Za-z]+\s+(\d{1,2})\s+-\s+Times available/i,
        );

        if (!dayMatch) {
          continue;
        }

        const day = Number(dayMatch[1]);

        if (day < currentDay) {
          continue;
        }

        foundDate = true;
        processedDates.add(dateLabel);

        console.log(`Opening date: ${dateLabel}`);

        await this.openDateAndWaitForTimes(dateButton);

        const timeButtons = this.frame.locator(
          'button[data-container="time-button"]',
        );

        await expect(timeButtons.first()).toBeVisible();

        const timeCount = await timeButtons.count();

        console.log(`Found ${timeCount} time slots for ${dateLabel}`);

        for (let timeIndex = 0; timeIndex < timeCount; timeIndex += 1) {
          const timeButton = timeButtons.nth(timeIndex);
          const time = await timeButton.getAttribute('data-start-time');

          if (!time) {
            continue;
          }

          const key = `${dateLabel}::${time}`;

          if (seenSlots.has(key)) {
            continue;
          }

          seenSlots.add(key);

          slots.push({
            dateLabel,
            time,
          });

          if (slots.length >= requiredCount) {
            break;
          }
        }

        if (slots.length < requiredCount) {
          const previousPageButton = this.frame.locator(
            'button[aria-label="Go to previous page"]',
          );

          if (await previousPageButton.count()) {
            await expect(previousPageButton).toBeVisible();
            await previousPageButton.click();

            await expect(
              this.frame.locator('[data-testid="calendar"]'),
            ).toBeVisible();
          }
        }

        break;
      }

      if (!foundDate) {
        break;
      }
    }

    const previousPageButton = this.frame.locator(
      'button[aria-label="Go to previous page"]',
    );

    if (await previousPageButton.count()) {
      await expect(previousPageButton).toBeVisible();
      await previousPageButton.click();

      await expect(
        this.frame.locator('[data-testid="calendar"]'),
      ).toBeVisible();
    }

    return slots;
  }

  async selectSlot(slot: BookingSlot) {
    const dateButton = this.frame.getByRole('button', {
      name: slot.dateLabel,
      exact: true,
    });

    await expect(dateButton).toBeVisible();

    await this.openDateAndWaitForTimes(dateButton);

    const timeButton = this.frame.locator(
      `button[data-container="time-button"][data-start-time="${slot.time}"]`,
    );

    await expect(timeButton).toBeVisible();
    await timeButton.click();

    const nextButton = this.frame.getByRole('button', {
      name: `Next ${slot.time}`,
      exact: true,
    });

    await expect(nextButton).toBeVisible();

    await this.openGuestFormAndWait(nextButton);
  }

  private async openDateAndWaitForTimes(
    dateButton: ReturnType<FrameLocator['getByRole']>,
  ) {
    const timePicker = this.frame.locator(
      '[data-component="spotpicker-times"]',
    );

    await dateButton.click();

    try {
      await expect(timePicker).toBeVisible();
    } catch {
      await expect(dateButton).toBeVisible();
      await dateButton.click();
      await expect(timePicker).toBeVisible();
    }
  }

  private async openGuestFormAndWait(
    nextButton: ReturnType<FrameLocator['getByRole']>,
  ) {
    const firstNameInput = this.frame.getByLabel(/first name/i);

    await nextButton.click();

    try {
      await expect(firstNameInput).toBeVisible();
    } catch {
      if (await nextButton.count()) {
        await expect(nextButton).toBeVisible();
        await nextButton.click();
      }

      await expect(firstNameInput).toBeVisible();
    }
  }

  async fillGuestDetails(details: GuestDetails) {
    const firstNameInput = this.frame.getByLabel(/first name/i);
    const lastNameInput = this.frame.getByLabel(/last name/i);
    const emailInput = this.frame.getByLabel(/email/i);

    await expect(firstNameInput).toBeVisible();
    await firstNameInput.fill(details.firstName);

    await expect(lastNameInput).toBeVisible();
    await lastNameInput.fill(details.lastName);

    await expect(emailInput).toBeVisible();
    await emailInput.fill(details.email);

    const messageInput = this.frame.getByLabel(/message/i);

    if (await messageInput.count()) {
      await messageInput.fill(details.message);
    }
  }

  async confirmBooking() {
    const scheduleButton = this.frame.getByRole('button', {
      name: /schedule event|schedule/i,
    });

    await expect(scheduleButton).toBeVisible();
    await scheduleButton.click();
  }

  async waitForBookingResult(): Promise<'success' | 'security-block'> {
    const scheduledMessage = this.frame.getByText('You are scheduled', {
      exact: false,
    });

    const invitationMessage = this.frame.getByText(
      'A calendar invitation has been sent to your email address.',
      { exact: false },
    );

    const securityMessage = this.frame.getByText(
      'This booking cannot be completed',
      { exact: false },
    );

    await expect
      .poll(
        async () => {
          if (await scheduledMessage.isVisible()) {
            return 'success';
          }

          if (await securityMessage.isVisible()) {
            return 'security-block';
          }

          return null;
        },
        {
          timeout: 15_000,
        },
      )
      .not.toBeNull();

    if (await securityMessage.isVisible()) {
      return 'security-block';
    }

    await expect(scheduledMessage).toBeVisible();
    await expect(invitationMessage).toBeVisible();

    return 'success';
  }

  async expectSuccessfulBooking() {
    await expect(
      this.frame.getByText('You are scheduled', { exact: false }),
    ).toBeVisible();

    await expect(
      this.frame.getByText(
        'A calendar invitation has been sent to your email address.',
        { exact: false },
      ),
    ).toBeVisible();
  }
}