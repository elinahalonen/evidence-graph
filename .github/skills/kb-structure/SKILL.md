---
name: kb-structure
description: 'Plan and improve the information architecture of this Markdown knowledge base. Use when organizing topics, creating overview pages, reviewing a taxonomy or tag vocabulary, finding duplicate explanations or isolated pages, repairing wiki links, or moving and renaming articles. Covers meaningful connections and URL migration; not bulk factual drafting or deployment.'
---

# Knowledge-base structure

Read [AGENTS.md](../../../AGENTS.md), the [README](../../../README.md), and [graph semantics](../../../vault/guide/graph-views.md). Use the existing page index and link parser; do not invent a second taxonomy or graph engine for an editorial task.

## Inputs

Identify the topic boundary, intended readers, existing entry points, and whether URL changes are authorized. For an audit request, report findings without editing. For a new topic, identify reader questions before creating folders.

## Procedure

1. **Inspect the bounded topic.** List its pages, read the overview and headings, and follow relevant links. Include cross-folder callers when considering a move. Avoid a repository-wide rewrite for a local organization problem.
2. **Map questions to canonical pages.** Identify duplicate definitions, missing context, and overloaded pages. Reuse an existing page when it already serves the purpose. Separate concepts, procedures, and reference material only where that helps readers.
3. **Review discoverability.** Check overview links and surrounding explanations. An isolated graph node is a clue, not proof of a defect: regular Markdown links can provide navigation without edges. Root home/graph pages and `graph: false` pages are intentionally absent from the graph.
4. **Review properties consistently.** Check tag spelling, audiences, and editorial statuses against nearby pages. Propose a small vocabulary when needed, but do not invent tag-browser behavior, typed graph edges, metadata-based ordering, or access control.
5. **Propose the smallest structure.** State page purposes, canonical definitions, overview links, folder changes, and URL effects. Seek a migration decision before changing established paths unless the user already authorized it. Prefer title and overview improvements when URLs must stay stable.
6. **Inventory callers before a move.** Find old wiki targets, relative links, Markdown URLs, heading references, asset paths, configured navigation, and known external consumers. The template creates no automatic redirects. Agree on a compatibility strategy rather than silently breaking public links.
7. **Implement approved changes together.** Preserve unique information and sources when consolidating. Update incoming and outgoing references and affected navigation in the same change. Avoid unrelated layout or infrastructure edits.
8. **Validate.** Run `npm run docs:build`, search again for old paths, and inspect remaining hits rather than blindly rewriting examples or quotations. Restart the dev server and check the sidebar, moved routes, section anchors, and graph connections.
9. **Report.** List canonical pages, moves, repaired relationships, remaining gaps, compatibility decisions, and checks. Do not commit or publish without authorization.

## Read-only graph inspection

With Node.js 22.12+ and the npm dependencies installed, run this from the repository root to list nodes without wiki-link connections:

```sh
node --input-type=module -e "import { createVault } from './apps/site/.vitepress/vault.mjs'; const { graph } = createVault('vault'); console.log(graph.nodes.filter(node => node.degree === 0).map(node => node.id).join('\n'));"
```

An unresolved wiki link makes indexing fail; report or repair that blocker first. Interpret the output in context and do not add artificial links just to remove isolated nodes.

## Example and implementation facts

Request: "Review this topic and propose a simpler structure without changing published URLs."

Keep paths stable. Improve titles and overview links first. Identify a canonical location for duplicated definitions and explain how other pages can retain their unique material while linking to it. Present moves as a separate decision.

- Sidebar order uses filenames, with pages before folders; a frontmatter `order` field has no effect.
- A folder index supplies the group's title and overview link. Nested indexes can still be graph nodes.
- Wiki targets resolve filenames/paths, not titles or aliases.
- Tags classify material editorially; links express the relationships used by this graph.
- Connections are untyped, undirected, and deduplicated. Describe relationship meaning in prose.

Done means readers have clear entry points and canonical explanations, approved moves have callers updated, and the actual vault builds. Report external URL compatibility and unresolved editorial decisions separately.
