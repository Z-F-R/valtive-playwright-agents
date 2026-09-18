# Valtive Playwright agents

## Install and run

```bash
npm ci
npm test
```

The existing interactive commands are `npm run test:headed` and `npm run test:debug`.

## Test data

The booking fixture accepts these optional environment variables:

- `CALENDLY_TEST_FIRST_NAME`
- `CALENDLY_TEST_LAST_NAME`
- `CALENDLY_TEST_EMAIL` — a valid base address; generated candidates use unique `+slot-N` aliases.
- `CALENDLY_TEST_MESSAGE`

The suite uses Valtive's live contact page and embedded live Calendly calendar, so availability and booking acceptance are external dependencies. The single test performs 40 real booking attempts and verifies Calendly's confirmation after each successful submission.
