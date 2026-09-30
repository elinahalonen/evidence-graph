---
title: Writing pages
description: Author linked Markdown with properties, tags, anchors, and reusable conventions.
aliases: ["Authoring guide"]
kind: how-to
audience: [author, maintainer]
tags: [guide, knowledge/authoring, knowledge/metadata]
status: maintained
updated: "2026-09-30"
---

# Writing pages

| Property | Current value |
| --- | --- |
| Kind | {{ $frontmatter.kind }} |
| Audience | {{ $frontmatter.audience.join(', ') }} |
| Tags | {{ $frontmatter.tags.join(', ') }} |
| Status | {{ $frontmatter.status }} |
| Updated | {{ $frontmatter.updated }} |

## Add a page

Create a Markdown file inside the repository's `vault/` directory. Folders become sidebar groups. Use a descriptive filename, an optional frontmatter title, and a single top-level heading:

```md
---
title: Your page title
---

# Your page title

Start writing here.
```

The sidebar label uses the frontmatter title, then the first top-level heading, then the filename. A folder's `index.md` supplies its overview page and group title. Pages and folders are ordered alphabetically by filename, with pages before folders.

Restart the development server after adding, moving, or renaming pages, or changing titles or wiki links. Navigation and graph data are generated when the server starts and during production builds.

## Page properties

The table above reads this page's actual frontmatter through VitePress bindings. Strings, lists, and booleans can express useful editorial properties without adding a database or a new component:

```yaml
title: Your page title
description: A concise summary of the page.
aliases: ["An alternative name in Obsidian"]
kind: how-to
audience: [author, maintainer]
tags: [guide, knowledge/authoring]
status: maintained
updated: "2026-09-30"
graph: true
```

Quote dates when you want a string rather than a YAML date value. Use unquoted `true` or `false` for booleans. Keep tag spelling consistent across pages; slash-separated tags can form a hierarchy in Obsidian.

The template uses `title` for labels and `graph: false` for graph exclusion. VitePress uses `description` as page metadata. The remaining properties are editorial conventions: they do not implement review scheduling, draft exclusion, access control, tag filtering, or ordering.

Obsidian can use the `aliases` list, but this site's wiki-link resolver still requires a filename or path. To display a friendly name on the website, use a link label such as [[./using-the-site|the reader guide]].

::: details Render a property in Markdown
The metadata table uses expressions such as these:

```md
Status: {{ $frontmatter.status }}
Topics: {{ $frontmatter.tags.join(', ') }}
```

These expressions are evaluated by VitePress on the published page. Obsidian stores the frontmatter properties but does not evaluate Vue expressions in its Markdown preview. Keep essential information in ordinary prose when it must read identically in both editors.
:::

## Link pages

Wiki links can use a vault-relative path, a unique filename, or an explicit relative path. Use a full path when filenames are duplicated.

```md
[[guide/using-the-site]]
[[guide/using-the-site|Using the site]]
[[./graph-views|Graph views]]
[[guide/using-the-site#Search|Search help]]
[[#Add a page]]
```

A missing or ambiguous page target fails the build. Use the displayed source filename to find and correct the link. Heading text is converted to a URL anchor; check that the target heading exists.

For a block link, put an identifier on its own line and reference it with `#^`:

```md
^section-reference

[[your-page#^section-reference|Read this section]]
```

Inside a Markdown table, escape the alias separator as `\|`. Ordinary Markdown links also work, but only wiki links contribute connections to the [[guide/graph-views|graph views]]. Wiki embeds such as `![[image.png]]` are not supported; use Markdown image syntax instead.

The examples below are live links, not code samples:

| Link type | Example |
| --- | --- |
| Relative page and label | [[./using-the-site\|Reader guide]] |
| Heading on another page | [[./graph-views#Find a page\|Find a graph node]] |
| Named block on another page | [[./using-the-site#^search-workflow\|Search workflow]] |
| Heading on this page | [[#Page properties\|Properties reference]] |

::: tip Stable references
Use a named block for a passage that needs a stable target when headings change. Use descriptive link labels to explain why a reader should follow the connection.
:::

## Add assets

Keep images next to their page and reference them with a relative Markdown path. VitePress processes those assets for the deployment base path.

Files placed in `vault/public/` are copied to the published site unchanged. Do not put private material there.

## Choose graph visibility

Set `graph: false` in a page's frontmatter to remove it from both graph views. The page still appears in navigation and search and remains publicly accessible. This setting is not access control.

Hidden files and directories, including local editor configuration, are excluded from page discovery. All other Markdown pages under `vault/` are intended for publication. Keep drafts and confidential material outside the published vault.

## Preview and check

From the repository root, run:

```sh
npm ci
npm run docs:dev
```

Open the URL printed by the server. To validate changes before publishing:

```sh
npm test
npm run typecheck
npm run docs:build
npm run docs:preview
```

The build checks page links. The preview serves the generated site so you can check [[guide/using-the-site|navigation and search]] and both graph views before deployment.
