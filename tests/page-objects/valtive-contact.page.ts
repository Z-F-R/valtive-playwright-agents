import { expect, type Locator, type Page } from '@playwright/test';

export class ValtiveContactPage {
  readonly page: Page;
  readonly calendlyFrame: Locator;

  constructor(page: Page) {
    this.page = page;
    this.calendlyFrame = page.locator('iframe[title="Select a Date & Time - Calendly"]');
  }

  async goto() {
    await this.page.goto('https://valtive.io/contact-valtive/');
    await expect(this.page).toHaveURL(/\/contact-valtive\//i);
    await expect(this.page.locator('h1')).toContainText(/Contact Valtive/i);
    await this.expectCalendlyEmbedded();
  }

  async expectCalendlyEmbedded() {
    await expect(this.calendlyFrame).toBeVisible();
  }
}
