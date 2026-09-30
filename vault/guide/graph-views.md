---
title: Graph views
description: Explore page relationships using full and local knowledge graphs.
kind: reference
audience: [reader, author]
tags: [guide, site/graph, knowledge/relationships]
status: maintained
updated: "2026-09-30"
---

# Graph views

The [[graph|full graph]] shows pages as nodes and wiki links as connections. A connection appears when either page links to the other. Repeated links between the same pair of pages count as one connection.

Topics: **{{ $frontmatter.tags.join(', ') }}**.

::: info Two ways to find information
Graph search looks for page names and paths. For a phrase inside an article, use [[./using-the-site#^search-workflow|the site's search workflow]].
:::

## Explore the full graph

- Select a node to see its title and connected pages in **Page details**.
- Select **Open page** in the details panel, or double-click a node, to read the article.
- Drag empty space to pan. Drag a node to move it.
- Scroll over the graph to zoom, or use **Zoom in** and **Zoom out**. On touch screens, use the zoom buttons and drag to pan.
- Use **Fit graph** to bring all nodes into view.
- Use **Reset graph** to clear the search and selection and restore the layout.
- Use **Enter fullscreen** when your browser supports it. **Exit fullscreen** or `Escape` returns to the page.

Hover over a toolbar icon to see its name. The selected node is orange, its neighbors are teal, and other nodes are blue.

## Find a page

Type a page name or path into **Find a page**. Matching nodes are highlighted, and matching pages appear in the details panel. Select a result to center it and inspect its connections.

The **Page details** button also opens a list of all pages when no search is active. This list and the connection buttons can be used with the keyboard without interacting with the canvas.

## Use the local graph

On wide article layouts, **Local graph** shows the current page and its immediate neighbors. Select a neighboring node to open that page. Expand **connected pages** for ordinary links to the same neighbors.

Use **Expand local graph** to open a larger view in a dialog. Close it with **Close local graph** or `Escape`. **Open full graph** switches to the complete graph.

The local graph is hidden in narrow article layouts; the full graph remains available through the top navigation.

## What appears

^graph-inclusion

The home page and the graph page are excluded from the graph. Other Markdown pages appear unless their frontmatter sets `graph: false`. Pages can appear without any connections.

Connections come from wiki links in the page text. Ordinary Markdown links, inline code, and fenced code examples do not create graph connections. See [[guide/writing-pages#Link pages|Link pages]] for the supported syntax.

::: warning Visibility is not privacy
Excluding a page from the graph does not remove it from publication or search. Read [[./writing-pages#Choose graph visibility|the visibility rules]] before using `graph: false`.
:::

## Tags and relationships

This page has the frontmatter tags `guide`, `site/graph`, and `knowledge/relationships`. The shared `guide` tag classifies it alongside the other guides, but tags do not create graph edges. The nested tag names are useful in Obsidian; the website displays them as text, without a tag browser or tag filters.

| Relationship | Linked page |
| --- | --- |
| Reader workflow | [[./using-the-site\|Using the site]] |
| Authoring reference | [[./writing-pages#Page properties\|Page properties]] |
| Local rule | [[#^graph-inclusion\|Graph inclusion]] |

::: details Why a link may not appear as an edge
A normal Markdown link is still useful navigation, but the graph reads wiki links. A wiki link inside a fenced code example demonstrates syntax without creating a connection. Multiple wiki links to the same page produce a single connection, and links to the current page do not produce self-edges.
:::

For navigation and full-text search outside the graph, see [[guide/using-the-site|Using the site]].
