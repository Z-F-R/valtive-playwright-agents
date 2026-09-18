# Valtive contact form and Calendly booking flow

## Scope

This test plan covers the Valtive contact page and the embedded Calendly scheduling widget used to book a meeting.

The implementation focuses on the live booking flow required by the assignment: discovering 40 unique available Calendly slots, generating unique attendee data, attempting the bookings, and verifying Calendly's booking confirmation.

## Automated scenario

### Book 40 unique live Calendly slots

**Implementation:** `tests/valtive-contact-booking.spec.ts`

**Page Objects:**
- `tests/page-objects/valtive-contact.page.ts`
- `tests/page-objects/calendly.page.ts`

**Fixture:**
- `tests/fixtures/booking.fixture.ts`

**Test data generator:**
- `tests/data/booking-candidates.ts`

### Preconditions

- The Valtive contact page is available.
- The embedded Calendly scheduler is available.
- At least 40 unique bookable date/time slots are available.
- A valid base email address is available for generated attendee addresses.

### Steps and expected results

1. Open `https://valtive.io/contact-valtive/`.
   - The contact page loads successfully.
   - The page heading contains `Contact Valtive`.
   - The Calendly iframe is visible.

2. Load the Calendly scheduler.
   - The Calendly calendar is visible.
   - At least one date with available times is present.

3. Collect available booking slots.
   - Available dates are discovered from the live Calendly calendar.
   - Time slots are collected from the selected dates.
   - Date/time combinations are deduplicated.
   - At least 40 unique slots are required; otherwise the test fails.

4. Generate booking candidates.
   - Exactly 40 candidates are created.
   - Every candidate has a unique email address.
   - Every candidate uses a unique date/time combination.

5. For each of the 40 candidates:
   - Select the candidate's date.
   - Select the candidate's time.
   - Continue to the guest details form.
   - Fill first name, last name, email, and message.
   - Submit the booking with `Schedule Event`.

6. Verify the booking result.
   - A successful booking must display `You are scheduled`.
   - A successful booking must display `A calendar invitation has been sent to your email address.`

### External Calendly security condition

During CI execution, Calendly may reject automated booking finalization with the following user-facing state:

`This booking cannot be completed`

When this external security restriction is returned, the test is intentionally marked as **skipped**.

The test does not bypass or spoof Calendly security controls and does not report a blocked booking as a false pass.

## Architecture

The implementation uses:

- Playwright Test
- TypeScript
- Page Object Model
- Custom Playwright fixture
- Generated unique test data
- Playwright `test.step()` for the booking iterations
- Web-first assertions

## Reporting and CI

Test results are uploaded automatically to Qase TestOps from GitHub Actions.

The CI workflow also stores the Playwright HTML report and test artifacts as GitHub Actions artifacts.

## Limitations

The booking flow depends on live Calendly availability and Calendly's external booking and security rules.

The automation therefore cannot guarantee that 40 bookings can be finalized from every execution environment.

The implementation verifies the required booking confirmation when Calendly accepts the booking and explicitly handles an external Calendly security block as a skipped result.