# Valtive contact form and Calendly booking flow

## Application Overview

This plan covers the Valtive contact journey and the embedded Calendly scheduling flow. It focuses on the form, the inline booking widget, and the confirmation states required for a successful booking. It does not test unrelated pages or functionality.

## Test Scenarios

### 1. contact-and-booking-flow

**Seed:** `seed.spec.ts`

#### 1.1. Contact page loads with required form and embedded scheduler

**File:** `specs/contact-and-booking-flow/contact-page-loads.spec.ts`

**Steps:**
  1. Open https://valtive.io/contact-valtive/ in a fresh browser context.
    - expect: The page loads successfully.
    - expect: The Valtive contact page heading is visible.
    - expect: The contact form is present and the Calendly iframe is visible.
  2. Identify the main UI regions and form controls.
    - expect: The Valtive header and footer are present.
    - expect: The form includes the required fields for name, email, and message.
    - expect: The iframe loads a Calendly date/time picker.

#### 1.2. Successful submission of the Valtive contact form

**File:** `specs/contact-and-booking-flow/contact-form-submission.spec.ts`

**Steps:**
  1. Attempt to submit the form with empty fields.
    - expect: Validation or required-field behavior prevents submission.
    - expect: The user remains on the form and no booking flow starts until valid values are entered.
  2. Fill the form with valid data and submit it.
    - expect: The form accepts valid input.
    - expect: The user proceeds to the Calendly booking flow or reaches the expected next step without a hard error.

#### 1.3. Calendly booking flow exposes a valid date and time selection path

**File:** `specs/contact-and-booking-flow/calendly-embed-loads.spec.ts`

**Steps:**
  1. Switch into the Calendly iframe and verify the embedded scheduling widget loads.
    - expect: The inline Calendly widget is visible.
    - expect: The header identifies the meeting type, such as a 30 Minute Meeting.
    - expect: The date picker is active and the month navigation is visible.
  2. Select a bookable day and inspect the available time slots.
    - expect: The selected date is marked as having times available.
    - expect: A list of time slots appears for the chosen date.
    - expect: The user can proceed to the next booking step.

#### 1.4. Book 40 unique available time slots using generated test data

**File:** `specs/contact-and-booking-flow/book-40-unique-slots.spec.ts`

**Steps:**
  1. Generate a data set of 40 unique booking candidates using different date/time combinations and unique attendee values.
    - expect: Each candidate uses a unique attendee name and email.
    - expect: Each candidate selects a different slot from the available calendars so that no slot is duplicated within the run.
    - expect: The generator avoids reusing the exact same date and time combination.
  2. For each candidate, complete the contact form with the generated data and reach the Calendly widget.
    - expect: The form submission succeeds with unique values.
    - expect: The user lands inside the embedded Calendly date/time picker for each run.
  3. Select a unique available slot, continue through booking details, and finalize the booking.
    - expect: The selected slot is accepted by Calendly.
    - expect: The booking flow reaches a confirmation state.
    - expect: The confirmation includes the required text, 'You are scheduled' and 'A calendar invitation has been sent to your email address.'

#### 1.5. Negative and edge-case coverage for form and scheduling flow

**File:** `specs/contact-and-booking-flow/negative-and-edge-cases.spec.ts`

**Steps:**
  1. Submit invalid contact-form data such as blank values or malformed email addresses.
    - expect: The form rejects invalid input.
    - expect: The user sees validation feedback and cannot continue.
  2. Attempt to choose a day with no available times and verify the UI remains blocked.
    - expect: No booking is created for a non-bookable date or time.
    - expect: The UI continues to show only valid bookable options.
  3. Run the booking suite in parallel or repeated order with fresh browser state.
    - expect: Each scenario is independent.
    - expect: No test depends on shared booking state or reused credentials.
