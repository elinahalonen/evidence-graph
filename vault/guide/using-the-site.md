---
title: Using the site
description: Find, read, and share information in a linked knowledge base.
kind: how-to
audience: [reader, contributor]
tags: [guide, site/navigation, site/search]
status: maintained
updated: "2026-09-30"
---

# Using the site

Audience: **{{ $frontmatter.audience.join(', ') }}**. Topics: **{{ $frontmatter.tags.join(', ') }}**.

::: tip Choose an entry point
Use [[#Search|full-text search]] when you know a word or phrase. Use [[./graph-views|the graph]] when you want to explore relationships between pages.
:::

## Navigate

Use the sidebar to browse pages by folder. Select a folder heading to expand or collapse its pages. On smaller screens, open **Menu** to see the same navigation.

The top navigation links to the home page, this guide, and the full graph. Inside an article, **On this page** lists its section headings. The links below an article move to the previous or next page.

## Search

^search-workflow

Select **Search** in the header, or press `Cmd+K` on macOS and `Ctrl+K` on Windows or Linux. Search matches page titles and text.

Use the arrow keys to select a result and `Enter` to open it. Press `Escape` to close search. Search runs locally in your browser; it does not send your query to an external search service.

Graph search is separate: it finds page names and paths within the graph. See [[guide/graph-views|Graph views]] for its controls.

## Follow connections

Links in an article open related pages. On wider screens, the local graph beside the article shows its directly connected pages. The full graph is available from **Graph** in the top navigation on any screen size.

## Share a page

Copy the page URL from your browser. To share a particular section, hover over its heading and copy the heading's link. Graph selections and zoom positions are temporary and are not included in the URL.

The [[#^search-workflow|search workflow]] also has a named block anchor. Authors can use that target from another page without depending on the section heading's wording.

::: details Links for common tasks

| Task | Start here |
| --- | --- |
| Find a phrase | [[#Search\|Search this site]] |
| Explore a concept's neighbors | [[./graph-views#Use the local graph\|Local graph]] |
| Connect a new article | [[./writing-pages#Link pages\|Link pages]] |

:::

## Change appearance

Use the appearance switch in the header to select a light or dark theme. On smaller screens, it is inside the navigation menu.

## Contribute

The site is read-only in the browser. Pages are Markdown files in the repository; [[guide/writing-pages|Writing pages]] explains how to add and connect them.
