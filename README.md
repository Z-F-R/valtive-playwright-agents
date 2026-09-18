# Valtive Playwright Agents

Playwright + TypeScript end-to-end automation for the Valtive contact page and its embedded Calendly scheduling flow.

The project uses Playwright Test Agents and Playwright MCP during test planning and test generation, follows the Page Object Model, and publishes CI test results to Qase TestOps.

## Project scope

The automated flow:

1. Opens the Valtive contact page.
2. Verifies the contact page and embedded Calendly widget are loaded.
3. Discovers at least 40 unique available Calendly date/time slots.
4. Generates unique attendee data for the booking candidates.
5. Iterates through the selected slots and attempts to complete the booking flow.
6. Verifies the Calendly confirmation:

   * `You are scheduled`
   * `A calendar invitation has been sent to your email address.`

There is one Playwright test that performs the 40-slot flow. The 40 slots are iterations inside that test, not 40 separate Playwright tests.

## Calendly security limitation

Calendly currently blocks automated booking finalization from the Playwright/CI session with a security response (`stytch_block_verdict: true`).

The test detects the user-facing `This booking cannot be completed` state and marks the test as **skipped** instead of reporting a false pass.

The implementation for the 40-slot flow remains in place: it collects and validates 40 unique live slots and attempts the booking flow. A Calendly security block is treated as an external environment restriction.

The test does not attempt to bypass or spoof Calendly security controls.

## Project structure

```text
.github/
├── agents/
│   ├── playwright-test-generator.agent.md
│   ├── playwright-test-healer.agent.md
│   └── playwright-test-planner.agent.md
└── workflows/
    └── copilot-setup-steps.yml

specs/
└── valtive-contact-calendly-test-plan.md

tests/
├── data/
│   └── booking-candidates.ts
├── fixtures/
│   └── booking.fixture.ts
├── page-objects/
│   ├── calendly.page.ts
│   └── valtive-contact.page.ts
└── valtive-contact-booking.spec.ts

playwright.config.ts
qase.config.json
```

## Requirements

* Node.js 24+
* npm
* Google Chrome
* Qase account for CI reporting

## Installation

```bash
npm ci
```

## Running tests locally

Run the full suite:

```bash
npm test
```

Run in headed mode:

```bash
npm run test:headed
```

Run with Playwright Inspector:

```bash
npm run test:debug
```

Qase reporting is disabled for local runs. `qase.config.json` uses `mode: "off"` so local test runs do not create Qase TestOps runs.

## Test data

The booking fixture supports these optional environment variables:

* `CALENDLY_TEST_FIRST_NAME`
* `CALENDLY_TEST_LAST_NAME`
* `CALENDLY_TEST_EMAIL` — valid base email address; generated candidates use unique `+slot-N` aliases.
* `CALENDLY_TEST_MESSAGE`

If these variables are not provided, the fixture uses default values.

## Playwright configuration

The suite uses:

* TypeScript
* Playwright Test
* Chrome
* Page Object Model
* Playwright fixtures
* Web-first assertions
* 1 Playwright worker
* HTML report
* JUnit report
* screenshots on failure
* traces on failure
* video retained on failure

The Playwright Test Agent definitions are stored under `.github/agents/`.

The Playwright MCP configuration used by the agents is stored in `.vscode/mcp.json`.

## Qase TestOps

Qase is integrated through `playwright-qase-reporter`.

The repository contains only non-secret Qase configuration in `qase.config.json`:

* project: `DEMO`
* reporting mode: `off` by default
* run completion enabled
* fallback reporting enabled

The API token is never stored in the repository.

GitHub Actions enables Qase reporting with:

```text
QASE_MODE=testops
QASE_TESTOPS_API_TOKEN=<GitHub repository secret>
QASE_TESTOPS_PROJECT=DEMO
```

The repository secret is named:

```text
QASE_API_TOKEN
```

Each CI run creates a Qase TestOps run automatically and completes it when the Playwright run finishes.

## CI

GitHub Actions runs on:

* pushes to `main`
* pull requests targeting `main`
* manual `workflow_dispatch`

The workflow:

1. Checks out the repository.
2. Installs Node.js and npm dependencies.
3. Installs Chrome and its Linux dependencies.
4. Runs the Playwright test suite.
5. Uploads the Playwright HTML report as a GitHub Actions artifact.
6. Uploads test artifacts.
7. Sends the test results to Qase TestOps.

The Qase run contains a link back to the GitHub Actions build that produced the results.

GitHub Pages is not required for this project. Playwright reports are stored as GitHub Actions artifacts, while test results are stored in Qase.

## AI agents

The repository contains three Playwright Test Agent definitions:

* **Planner** — explores the application and creates test plans.
* **Generator** — turns test-plan scenarios into Playwright tests.
* **Healer** — investigates failing Playwright tests and proposes or applies fixes.

The project also contains the Playwright MCP configuration used by these agents.

Playwright's official agent workflow is based around planner → generator → healer, with the generated plans stored under `specs/` and tests under `tests/`.

## Reports

After a local run:

```text
playwright-report/
test-results/
```

Open the HTML report with:

```bash
npx playwright show-report
```

In CI, both directories are uploaded as GitHub Actions artifacts.

## Important external dependencies

The tests interact with live Valtive and Calendly services. Therefore, results can depend on:

* current Calendly availability;
* Calendly booking rules;
* external network conditions;
* Calendly security and anti-abuse checks.

The test does not attempt to bypass external security controls.
