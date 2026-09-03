---
name: Brand logo rail
description: The visual and motion direction for the homepage brand logo presentation.
---

The homepage brand area uses Burem’s real brand assets normalized onto a shared 140×60 transparent canvas. Display four columns on desktop and up to three on mobile through one shared 120×52 slot. Keep the staggered vertical movement, but do not use per-brand CSS scaling, blur, opacity, or zoom differences.

**Why:** Source logos have inconsistent viewBoxes, transparent padding, white canvas space, and aspect ratios. CSS scale overrides repeatedly caused one brand to look correct while another became too large, small, or blurry.

**How to apply:** Trim and re-center the source asset itself, regenerate the normalized files, and keep the carousel on the shared slot style. Preserve brand order, reduced-motion behavior, the Markalar dropdown, and brand detail routes.