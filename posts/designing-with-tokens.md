---
title: "Designing with Tokens: Light and Dark Mode"
date: 2026-07-15
tags: [design, css, dark-mode]
---
# Designing with Tokens: Light and Dark Mode

This site's visual language comes from an editorial design system: a white canvas, dark ink type, and a handful of signature surface colors reserved for full-bleed callouts. Every color, spacing value, and radius is expressed as a CSS custom property rather than a hardcoded value.

## Why tokens

Tokens make dark mode tractable. Instead of writing separate dark-mode rules for every component, the components themselves only ever reference variables like `--color-canvas` or `--color-ink`. Flipping the theme is just a matter of redefining those variables:

1. `prefers-color-scheme: dark` sets the default when no manual preference exists
2. A `data-theme="dark"` or `data-theme="light"` attribute on `<html>` overrides the OS setting
3. The choice is written to `localStorage` so it survives a reload

## Signature colors stay put

![A grid of colorful signature cards](signature-cards-placeholder.png)

One deliberate choice: the signature surface colors (coral, forest, cream) are **not** redefined between light and dark mode. Those cards carry their own background and their own contrast, so inverting them would fight the brand rather than support it.

## Result

The same markup renders correctly in both themes without any JavaScript re-render — only the custom property values change.
