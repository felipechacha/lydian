# Automated QA with agent-browser

> **Authorization required:** do not run this skill or any `qa:browser:*` command unless the user explicitly requests an automated QA run in the current task. Automated browser QA is a separate stage performed after development. During implementation, use code inspection/debugging, build and type checks, code-level tests, and `git diff --check`. A previous QA request does not authorize a future run.

The project uses the local `agent-browser` package for agent-driven exploratory QA. The dependency is pinned by `package-lock.json`, and all commands run through npm scripts.

## One-time setup

Install project dependencies and the Chrome for Testing runtime:

```bash
npm install
npm run qa:browser:install
npm run qa:browser:doctor
```

`agent-browser.json` keeps the browser on HTTPS while allowing the self-signed development certificate. Native scrollbars remain visible so screenshots reflect the real layout.

## Start the application

Run the front end in one terminal:

```bash
npm start
```

The QA target is always `https://localhost:4200`. The API must be available at `https://localhost:3000` for login and account flows.

## Start an automated QA session

Load the workflow documentation that matches the installed CLI version:

```bash
npm run qa:browser:skill
npm run qa:browser:skill:qa
```

Then open an isolated browser session:

```bash
npm run qa:browser:open
npm run qa:browser:snapshot
```

For visual debugging, open a visible browser window instead:

```bash
npm run qa:browser:open:headed
```

The usual automation loop is:

1. Take an interactive snapshot.
2. Identify the current `@eN` reference.
3. Click, fill, type, or inspect the element.
4. Wait for the expected URL, text, or load state.
5. Take a new snapshot before the next interaction.

Run an ad hoc command without a global installation:

```bash
npm run qa:browser -- --session lydian-qa get title
npm run qa:browser -- --session lydian-qa screenshot --full qa-artifacts/landing-page.png
```

Create `qa-artifacts/` before requesting an artifact. The directory is intentionally ignored by Git because reports, screenshots, videos, traces, and HAR files may contain user or session data.

## Baseline checks

With `npm start` running, the following scripts cover the first QA pass:

```bash
npm run qa:browser:snapshot
npm run qa:browser:errors
npm run qa:browser:a11y
npm run qa:browser:vitals
```

- `snapshot` exposes interactive elements in machine-readable JSON.
- `errors` reports uncaught browser exceptions.
- `a11y` checks WCAG A and AA rules with the embedded axe-core engine.
- `vitals` collects performance and hydration metrics.

## Authentication and session cookies

Login should be performed in the isolated `lydian-qa` session so the browser retains the secure session cookie between commands. Do not include credentials in npm scripts or command-line arguments. For an authenticated QA run, provide credentials interactively or configure the agent-browser authentication vault.

If a temporary state file is necessary, save it only under `qa-auth/`. Never commit that directory or copy its contents into a QA report.

## Evidence and reports

Use `qa-artifacts/` for all generated evidence. A typical issue should include:

- A concise description and severity.
- Exact reproduction steps.
- An annotated screenshot for a static visual issue.
- Step screenshots and a short video for an interaction or timing issue.
- Relevant console errors without credentials or session data.

## Finish

Always close the QA session when the run ends:

```bash
npm run qa:browser:close
```

The skill itself is located at `.agents/skills/agent-browser/SKILL.md`. It is a discovery stub that asks the installed CLI for the current core and QA workflows, keeping the instructions aligned with the package version.
