# Site template

A generic Markdown site with VitePress, local search, automatic navigation, wiki links, and full-page and per-page graph views. The starter pages document the site itself. No external services or private package registry are required.

Authors work in Markdown or Obsidian, readers browse the published website, and maintainers review and publish changes with Git and GitHub Actions. No database, hosted search service, or AI service is required. This repository supplies the publishing infrastructure; you supply the subject matter and evidence.

## Contents

- [Start locally](#start-locally)
- [Repository layout](#repository-layout)
- [Build a knowledge base](#build-a-knowledge-base)
- [Authoring reference](#authoring-reference)
- [Work with agents](#work-with-agents)
- [Review and maintain](#review-and-maintain)
- [Customize](#customize)
- [Validate and preview](#validate-and-preview)
- [Publish to GitHub Pages](#publish-to-github-pages)
- [Use as a repository template](#use-as-a-repository-template)
- [Troubleshooting](#troubleshooting)

## Start locally

Use Node.js 22.12 or later and npm. A `.nvmrc` is included for Node.js 22.

Create a repository using **Use this template** on GitHub, then clone it. If you use nvm, run `nvm install` and `nvm use`. Run the following commands from your new repository's root:

```sh
npm ci
npm run docs:dev
```

Open the URL printed by VitePress. If a port is occupied, VitePress chooses another. To choose one yourself, run `npm run docs:dev -- --port 5174`.

The site includes guides for [using the site](vault/guide/using-the-site.md), [graph views](vault/guide/graph-views.md), and [writing pages](vault/guide/writing-pages.md). They form a small, connected demo rather than a separate example knowledge base.

Stop your server with `Ctrl+C`. Restart it after inventory, title, wiki-link, or graph-visibility changes. Plain text changes can use live preview; the generated sidebar and graph are indexed at startup and during production builds.

## Repository layout

```text
apps/site/.vitepress/
  config.mjs          Site identity, navigation, and build configuration
  vault.mjs           Page index, wiki-link parsing, sidebar, and graph data
  theme/              Default-theme extension and graph components
vault/                Markdown pages; can also be opened as an Obsidian vault
tests/                Vault and graph-data regression tests
.github/workflows/    Validation and optional GitHub Pages deployment
.github/skills/       Task-specific knowledge-base workflows for agents
AGENTS.md             Shared repository instructions for agents
```

VitePress configuration and theme code live outside the vault. Add your pages under `vault/`; titles and folders determine the sidebar. Restart the development server after changing the page inventory, titles, or wiki links so the index and graph are regenerated.

The vault is publication input. The README, agent instructions, and skills live outside it and are not automatically published. Generated output belongs to the build; do not edit or commit it.

## Build a knowledge base

### Define readers and scope

Start with the questions your readers need answered and the sources you are allowed to publish. Choose a coherent subject, name the intended audience, and identify someone who can verify the information. A small useful topic is a better starting point than an empty, elaborate folder tree.

Keep credentials, private notes, personal data, and restricted source material outside the publication directory. A private Git repository does not automatically make a GitHub Pages site private; check the hosting access options before publishing.

### Give pages clear responsibilities

Use a home page to explain the subject, topic overviews to orient readers, and focused articles to answer individual questions. Separate concepts, procedures, and reference material where it helps readers. Split a page when its sections serve different purposes or need independent maintenance, not just because it is long.

Prefer one canonical explanation per concept. Link to it from other articles rather than duplicating definitions. Use folders for browsing and links for relationships that cross folder boundaries.

Choose stable, descriptive filenames such as `decision-log.md`. Lowercase, hyphenated names are a useful convention, not a parser requirement. Filenames determine routes; changing a display title need not change a URL.

### Make the first topic

1. Set the site title and description in [the configuration](apps/site/.vitepress/config.mjs).
2. Replace [the home page](vault/index.md) with a short introduction and useful topic links.
3. Create one focused Markdown page with a clear H1 and supported information.
4. Link it from an overview and to relevant existing concepts. Explain why those relationships matter.
5. Restart the dev server, inspect the page and graph, and run `npm run docs:build`.
6. Review the rendered result and its evidence before publishing.

Remove the starter guides when your material replaces them, updating incoming links and the configured **Guide** navigation item at the same time.

## Authoring reference

### Pages and properties

Use one top-level heading and optional YAML frontmatter. Keep only properties and sections that help maintain the page:

```md
---
title: Your page title
description: A concise summary of the page.
kind: how-to
audience: [author, maintainer]
tags: [guide, knowledge/authoring]
status: maintained
updated: "2026-09-30"
---

# Your page title

State the purpose, scope, and supported answer.

## Sources

Identify the evidence used to maintain this page.
```

Inline YAML arrays work well with Markdown editors that prefer tabs. If you use block-style YAML, indent with spaces, never tabs. Quote dates when you want strings; use unquoted `true` and `false` for booleans.

| Property | What it does |
| --- | --- |
| `title` | Supplies sidebar and graph labels and the page title. Write the visible Markdown H1 separately. |
| `description` | Supplies VitePress page description metadata. |
| `graph: false` | Removes a page from graph views, not from navigation, search, or publication. |
| `kind`, `audience`, `status`, `updated` | Editorial properties, with no automatic policy or review enforcement. |
| `tags` | Tags usable in Obsidian and explicitly renderable in the site; no website tag browser or tag filters are implemented. |
| `aliases` | Alternative names for Obsidian; the site's wiki-link resolver still requires a path or filename. |

VitePress has additional native page options. The existing [graph page](vault/graph.md), for example, uses `layout: page`. Custom `order`, draft status, or owner fields do not implement sorting, publication exclusion, or access control.

The [writing guide](vault/guide/writing-pages.md#page-properties) renders its actual properties in a table using `$frontmatter` expressions. Those bindings run in VitePress, not Obsidian's Markdown preview. Keep essential information in plain prose when both views must read identically. Because the demos render tags in their article text, those displayed values can also be found by site search; frontmatter alone is not a custom tag index.

### Wiki links and anchors

Use wiki links for relationships you want readers to explore in the graph. These examples target the starter guides:

```md
[[guide/using-the-site]]
[[guide/using-the-site|Reader guide]]
[[guide/using-the-site#Search|Search help]]
[[guide/using-the-site#^search-workflow|Search workflow]]
```

Prefer vault-relative paths across topic folders. `./` and `../` resolve relative to the current page. A bare filename can resolve when it is unique; duplicate names require more explicit paths. Match path case exactly, especially when moving between macOS and Linux-based deployment.

For a non-relative target, resolution tries a vault-relative page, its folder index, a page relative to the current directory, then a unique filename. A frontmatter title or alias is not a substitute for the file path.

Use `[[#Section heading]]` for the current page. For a stable named passage, put an identifier such as `^search-workflow` on its own line and link with `#^search-workflow`. Block identifiers use letters, digits, and hyphens, starting with a letter or digit. Inline block IDs are not implemented.

Inside Markdown tables, escape an alias separator as `\|`. The [writing guide's live examples](vault/guide/writing-pages.md#link-pages) demonstrate this alongside page, heading, block, and same-page links. Missing or ambiguous page targets fail the build. Check heading and block destinations in the browser as well; resolving a page is not proof that a fragment exists.

### Tags and meaningful connections

Choose a small, consistent tag vocabulary. The demos use `guide` as a shared tag and slash-separated tags such as `site/search` or `knowledge/authoring`. Obsidian understands nested tags. The website displays explicitly rendered tags as text, without interpreting them as graph relationships.

The graph contains discovered Markdown pages except the root home page, root graph page, and pages with boolean `graph: false`. Nested folder overview pages can be graph nodes. Connections come only from wiki links in article text: either direction produces one undirected connection, duplicate links are combined, and self-links produce no edge. Markdown links and code examples do not create edges.

Do not add links just to make the graph dense. State whether a linked page supplies evidence, a definition, a prerequisite, or further reading. The graph does not infer or label these meanings.

### Navigation, search, and assets

Sidebar labels use `title`, then the first H1, then the filename. Files sort by filename, with pages before folders. A folder's `index.md` supplies its group title and overview link. The root home and graph pages are published but omitted from the generated sidebar.

Hidden files/directories, dependency folders, and public-asset directories are excluded from Markdown indexing. These rules are not access control. Keep private material outside the published source and review everything you commit.

Site search indexes the built pages locally in the browser. Graph search matches page names and paths, not full article text. See [Using the site](vault/guide/using-the-site.md) for navigation and keyboard controls, and [Graph views](vault/guide/graph-views.md) for graph interactions.

Keep images beside their page and use relative Markdown image paths with useful alternative text. VitePress processes imported assets for the deployment base. An optional `vault/public/` directory copies files unchanged to the site root; those files are not indexed as articles but are still published. Account for the deployment prefix when linking to public files.

Open the publication directory itself as an Obsidian vault if desired. This template supports a subset of Obsidian conventions, not every plugin or rendering feature. Wiki embeds such as `![[image.png]]` or `![[another-page]]` are unsupported; use Markdown images and links.

### Advanced demo map

| Demo | Examples to inspect |
| --- | --- |
| [Using the site](vault/guide/using-the-site.md) | Audience and nested tags, same-page links, a named search block, a tip callout, and a collapsible table of aliased links. |
| [Graph views](vault/guide/graph-views.md) | Cross-page block links, tagged editorial classification, graph-inclusion anchor, info/warning callouts, and a relationship table. |
| [Writing pages](vault/guide/writing-pages.md) | Live frontmatter table, aliases and typed YAML properties, literal binding examples, and a live comparison of wiki-link forms. |

## Work with agents

[AGENTS.md](AGENTS.md) defines repository-wide boundaries, evidence standards, publication precautions, and validation expectations. Ask an assistant to read it before editing. The skills provide focused procedures on demand:

| Skill | Use it for |
| --- | --- |
| [kb-authoring](.github/skills/kb-authoring/SKILL.md) | Draft or update supported articles, properties, source references, and meaningful links. |
| [kb-structure](.github/skills/kb-structure/SKILL.md) | Plan topic overviews, review a tag vocabulary, consolidate duplicate explanations, and migrate paths deliberately. |
| [kb-publishing](.github/skills/kb-publishing/SKILL.md) | Validate readiness, diagnose build/Pages failures, and publish when authorized. |

VS Code Copilot supports repository skills under `.github/skills/`. Request a skill by name or use the available skills picker. Discovery depends on client settings; other clients may use different locations. If needed, explicitly ask the agent to read the linked file or configure its supported skill path. Avoid maintaining divergent instruction copies.

Give the agent the audience, approved sources, permitted files, and desired outcome. Specify whether you want a proposal, edits, a commit, or a deployment. A request to draft material is not permission to publish it.

```text
Read AGENTS.md and use kb-authoring.
Audience: new contributors.
Sources: the approved notes attached to this request.
Scope: the contributor topic pages and their overview links.
Outcome: explain the process, connect related concepts, and flag unanswered questions.
Do not invent policy, change the theme, commit, push, or deploy.
```

Other useful requests are "Use kb-structure to review duplicate definitions without changing URLs" and "Use kb-publishing to check release readiness without deploying." Human review remains necessary: a passing build checks technical structure, not factual truth or permission to publish.

## Review and maintain

Use branches and pull requests when collaborating. Review the rendered article as well as its diff. Check the intended audience, supporting evidence, sources, assets, incoming/outgoing links, and whether a canonical explanation already exists.

Keep facts, interpretation, and unresolved questions distinct. For time-sensitive material, record relevant dates or versions and revisit it periodically. An owner or review date can be an editorial convention, but the site does not enforce a schedule or verify that a review happened.

Moving or renaming a file changes its URL. Search for old wiki and Markdown references, update callers in the same change, and consider links shared outside the repository. No redirects are generated automatically; agree on a compatibility approach before breaking established paths.

Use the graph to notice isolated or heavily connected pages, then inspect their writing before deciding whether something is wrong. Keep unapproved drafts outside the publication source: neither status metadata, `graph: false`, nor an obscure route makes a page private. Search and build assets may contain its published text.

## Customize

- Change the package name in [package.json](package.json).
- Set `title`, `description`, and navigation in [the site configuration](apps/site/.vitepress/config.mjs).
- Replace [the home page](vault/index.md), then add or remove guide pages. Update links when removing pages.
- Adjust [theme styles](apps/site/.vitepress/theme/style.css), using VitePress CSS variables.
- Keep [the graph page](vault/graph.md) to expose the full graph. The theme adds the local graph to article sidebars automatically on wide screens.

Most knowledge-base development belongs in Markdown. If new behavior is required, [vault.mjs](apps/site/.vitepress/vault.mjs) owns indexing, link resolution, and graph generation; [theme/index.ts](apps/site/.vitepress/theme/index.ts) integrates the graph components. Extend [the regression tests](tests/vault.test.mjs) for publishing logic and update the relevant guidance when changing its behavior.

## Validate and preview

```sh
npm test
npm run typecheck
npm run docs:build
npm run docs:preview
```

The generated site is in `apps/site/.vitepress/dist/`. Missing or ambiguous wiki-link targets fail the build. Standard internal Markdown links are also checked by VitePress.

`npm test` checks temporary fixtures for the custom index and graph; it does not replace building your actual vault. `npm run typecheck` checks Vue and TypeScript. `docs:preview` serves the last production build, so rebuild after changing content.

The build is not a complete heading, external-link, factual, or accessibility audit. The README and agent files live outside the publication source and need separate link and metadata checks.

For a deployment below a URL prefix:

```sh
VITEPRESS_BASE=/my-repository/ npm run docs:build
VITEPRESS_BASE=/my-repository/ npm run docs:preview
```

Use the same base for build and preview. Check the home page, a nested article, property values, section/block links, search, full graph, graph-to-article navigation, local graph dialog, and a narrow-screen layout before publishing.

Use `/` for root-hosted sites and custom domains. Base paths apply to page links, graph navigation, and bundled assets. This template uses a VitePress 2 prerelease; the lockfile fixes installed versions. TypeScript is pinned to a release compatible with the Vue type checker.

## Publish to GitHub Pages

The workflow validates pull requests and pushes to `main`. Deployment is disabled until you opt in, so using this template does not publish its vault automatically.

1. In the new repository, choose **Settings > Pages > Source > GitHub Actions**.
2. Under **Settings > Secrets and variables > Actions > Variables**, create `DEPLOY_PAGES` with value `true`.
3. Push to `main`, or run the **Validate and deploy site** workflow manually from `main`.

The workflow obtains the base path from GitHub Pages, builds the site, uploads the static output, and deploys using the built-in `GITHUB_TOKEN`. No personal access token is needed. Pull requests never deploy. If you rename the default branch, update the workflow's branch filters and deployment conditions.

A run can have a successful build while **Configure GitHub Pages**, **Upload Pages artifact**, and **deploy** are skipped. Check the exact `DEPLOY_PAGES=true` variable, the non-PR event, and the `main` branch condition before treating the build as a deployment. Setting the variable alone does not trigger a run; push or start a new run afterward.

Check both build and deploy results, then open the returned site URL and verify a nested page and graph navigation. Turning off the deployment flag stops future deployments but does not remove an already published site; unpublishing is a separate Pages operation.

Other static hosts can serve the same output directory. Set `VITEPRESS_BASE` to the host's path prefix and configure clean-URL routing to serve `.html` files and directory indexes. Authentication or restricted access must come from the hosting platform; this static template does not implement it.

## Use as a repository template

Enable **Settings > General > Template repository** on GitHub, then select **Use this template** to create a new repository. Install from the lockfile, customize the site identity, and replace the starter guides with your own pages. Publishing remains opt-in in each new repository.

Template files do not configure the new repository's Pages source or variables. Check those settings independently for every new knowledge base.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| A new page or connection is missing locally | Restart after index-affecting changes. Confirm the file is Markdown and not excluded. |
| YAML parsing fails | Remove tab indentation; use spaces or inline arrays. Check quotes, colons, and property types. |
| An array property binding fails | Ensure the property exists and is a YAML list before using `.join()`. |
| A wiki link fails the build | Match the path and case; disambiguate repeated filenames. Titles and aliases are not page targets. |
| A heading or block link lands incorrectly | Confirm the target heading or standalone block ID still exists and inspect its fragment. |
| A page is missing from the graph | Check graph exclusion, discovery rules, and the special root home/graph pages. |
| A tag or link creates no graph connection | Tags do not create edges; use a wiki link in prose between included graph pages. |
| An old URL fails after a move | Update callers and decide on compatibility handling; no redirect is generated automatically. |
| Pages build is green but deployment is missing | Check the exact opt-in variable, event/branch gate, and skipped steps; trigger a new run after correction. |
| Pages configuration fails | Confirm Pages is available and its source is GitHub Actions, then inspect the failed step's log. |
| Links or assets break only on the host | Check the deployment base and reproduce with a subpath production preview. |
| Type checking fails after upgrades | Verify TypeScript and Vue-checker compatibility before changing application code. |
| An agent does not discover a skill | Check client settings and frontmatter; explicitly reference the skill file. |
