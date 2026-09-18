import { expect, test } from './fixtures/booking.fixture';
import { generateBookingCandidates } from './data/booking-candidates';
import { CalendlyPage } from './page-objects/calendly.page';
import { ValtiveContactPage } from './page-objects/valtive-contact.page';

test.describe('Valtive contact and Calendly booking flow', () => {
  test('books 40 different live Calendly slots and verifies the booking confirmations', async ({
    page,
    bookingAccount,
  }) => {
    test.setTimeout(45 * 60_000);

    const contactPage = new ValtiveContactPage(page);

    await contactPage.goto();

    const calendlyPage = new CalendlyPage(page);

    await calendlyPage.expectLoaded();

    const slots = await calendlyPage.collectAvailableSlots(40);
    const candidates = generateBookingCandidates(slots, bookingAccount, 40);

    expect(candidates).toHaveLength(40);
    expect(
      new Set(
        candidates.map(({ dateLabel, time }) => `${dateLabel}::${time}`),
      ).size,
    ).toBe(40);
    expect(
      new Set(candidates.map(({ attendee }) => attendee.email)).size,
    ).toBe(40);

    for (const [index, candidate] of candidates.entries()) {
      await test.step(`Book live slot ${index + 1} of 40`, async () => {
        await calendlyPage.selectSlot(candidate);
        await calendlyPage.fillGuestDetails(candidate.attendee);
        await calendlyPage.confirmBooking();

        const bookingResult = await calendlyPage.waitForBookingResult();

        if (bookingResult === 'security-block') {
          test.skip(
            true,
            'Calendly blocked the automated booking session with a security restriction.',
          );
        }

        if (index < candidates.length - 1) {
          await contactPage.goto();
          await calendlyPage.expectLoaded();
        }
      });
    }
  });
});