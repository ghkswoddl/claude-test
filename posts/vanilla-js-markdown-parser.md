---
title: "Building a Markdown Parser in Vanilla JS"
date: 2026-07-10
tags: [javascript, markdown, tutorial]
---
# Building a Markdown Parser in Vanilla JS

Most blog engines reach for a markdown library. This one doesn't — it ships a small two-pass parser instead: a block pass that splits source into paragraphs, headings, lists, and code fences, followed by an inline pass that handles bold, italic, links, and inline code.

## Why not use a library?

The project's constraint was **no framework, no bundler, no build step** for serving the site. Installing an npm package for markdown would mean either vendoring a large single file or introducing a package manager into the runtime path. A hand-rolled parser covering the common subset was simpler.

## The block pass

The block pass is a line-by-line state machine. Fenced code blocks are the trickiest part:

```js
const fenceMatch = line.match(/^```(\w*)\s*$/);
if (fenceMatch) {
  const lang = fenceMatch[1];
  // collect lines until the closing fence
}
```

Everything inside a fence is escaped but never run through inline parsing — that's what keeps `<script>` tags and stray asterisks from corrupting code samples.

## What it supports

- Headings, from `h1` through `h6`
- **Bold** and *italic* text
- `inline code` and fenced code blocks
- Links and images
- Single-level ordered and unordered lists
- Blockquotes, like this one:

> A parser doesn't need to be complete to be useful — it needs to cover what you actually write.

Tables, nested lists, and footnotes are explicitly out of scope for now.
