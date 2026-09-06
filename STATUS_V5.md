# STATUS V5 — Brand convert complete kits + progression-aware 80/90

**Date:** 2026-09-06 (PT)
**Grok CLI:** exit 0 (grok-v5.log, effort xhigh, --prompt-file GROK_PROMPT_V5.md, --always-approve)
**Build:** tsc -b && vite build → exit 0
**Sanity:** vite-node src/lib/sanity.ts → exit 0

## 80% — simplified progression kit
Seed from-brand setup → rankTwins + discipline/goal penalty → nextSetups on target-brand twin → pick one front/tail/fuse/mast (covering twins + twin setup + small next steps + lane/band fallbacks). Compact cover of checked parts; drop padded family mids (keep min–max).

## 90% — fuller coverage / further progression
Clones 80%, then adds leftover greedy covers and up to two further nextSetups pieces.

## Complete kits
Both tiers always include front + tail + fuse + mast. Unchecked kinds get kit-only rows (e.g. kit fuse for complete setup).

## Sanity highlights
- full quiver 80%: HA 780 + Speed 180 + TC60 + Alloy 72 cm
- missing fuse → kit fuse TC60
- missing mast → kit mast
- unchecked all kinds: complete kit-only tiers
- overlap collapse + fuse ladder adjacency still green
