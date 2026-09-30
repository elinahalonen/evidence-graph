---
name: kb-publishing
description: 'Validate and publish this VitePress knowledge base or diagnose its GitHub Pages workflow. Use for release readiness, broken builds, invalid frontmatter, base-path problems, skipped deployment, Pages troubleshooting, or explicitly requested publication. Distinguishes local checks from remote changes and requires authorization before pushing, enabling publishing, or deploying.'
---

# Knowledge-base publishing

Read [AGENTS.md](../../../AGENTS.md), the [README](../../../README.md), and [the workflow](../../../.github/workflows/deploy-site.yml). Local checks require Node.js 22.12+ and npm. Remote inspection needs an authenticated GitHub client; never request credentials in chat.

## Operating modes

- **Readiness:** inspect and validate locally, then report; do not publish or change remote settings.
- **Diagnosis:** start with the named failure and read-only logs; identify the failing or skipped condition before changing anything.
- **Publish:** confirm the intended repository, branch, audience, and authorization for required remote actions. Editing content does not itself authorize committing, pushing, enabling Pages, or deploying.

Reuse authorization already explicit in the request. Ask only when the action or scope is unresolved. Do not combine an unrelated infrastructure upgrade with a deployment repair.

## Local checks

1. Inspect the branch and worktree; preserve unrelated and staged changes. Check that publication material has been reviewed for accuracy, sources, secrets, and private information. `graph: false` and editorial status are not publication exclusions.
2. Use `npm ci` when installation is needed, then run the gates below. If one fails, fix the owning page or module within scope and rerun that check before expanding the investigation.
3. Inspect frontmatter and examples when YAML fails. Tabs are invalid indentation; use inline arrays or spaces. Quote date strings, keep booleans typed, and confirm array-valued properties match any `.join()` bindings. Do not disable link checking or casually upgrade pinned dependencies to hide a failure.
4. Build and preview with the intended URL prefix. Keep the base consistent between build and preview.
5. Check the home page, a nested article, a section/block link, rendered metadata, search, full graph, graph-to-article navigation, and the local graph dialog. Check a narrow viewport for usable navigation and overflow. Wait for client initialization and canvas rendering before automated interaction; visible server-rendered HTML alone does not prove event handlers are attached.
6. Record what passed and what was not tested. Unit fixtures do not validate the actual vault, and a successful build does not establish factual accuracy or a successful deployment.

```sh
npm test
npm run typecheck
npm run docs:build
```

Replace this example prefix with the actual host path; use `/` for root hosting:

```sh
VITEPRESS_BASE=/my-repository/ npm run docs:build
VITEPRESS_BASE=/my-repository/ npm run docs:preview
```

## Pages diagnosis and publication

1. Derive the repository from its configured remote. Inspect the relevant run and individual job/step conclusions, not just its overall green status.
2. Verify Pages uses **GitHub Actions** as its source and the repository variable `DEPLOY_PAGES` equals the exact string `true`. Check the workflow's current event and branch conditions; it requires a non-PR run on `main`.
3. If **Configure GitHub Pages**, **Upload Pages artifact**, and **deploy** are skipped, inspect that gate before changing source code. Template files do not set the new repository's variables or Pages configuration.
4. Make remote changes only when authorized. Do not inspect unrelated secrets or add personal tokens to files. Use existing authentication and the workflow's built-in token.
5. After correcting settings, trigger a new authorized run; changing a variable alone does not start one. Do not commit or push local edits unless requested.
6. Follow the specific run until build and deploy finish. Read a failed step's log rather than repeatedly retrying. Distinguish errors from nonblocking action-runtime deprecation warnings.
7. Check the returned public URL, a nested page, and graph navigation with the correct prefix. Report a live-browser problem separately from workflow success and investigate only within scope.

Turning off the flag stops future deployments but does not unpublish an existing site. Unpublishing and access-control changes are separate decisions.

## Examples and completion

- "Check release readiness, but do not deploy": run local checks and report blockers without remote mutations.
- "The Pages run is green but nothing deployed": inspect skipped steps and the variable/event/branch gate.
- "Publish the reviewed main branch": verify the target and settings, execute the authorized run, and verify the live result.

Report the mode, checks, outcomes, changed code or remote settings, and unresolved blockers. For publication, include the specific run and site URL. Distinguish **built**, **deployed**, and **live site verified**; do not claim a skipped or unobserved stage.
