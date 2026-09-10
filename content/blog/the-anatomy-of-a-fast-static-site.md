---
title: "The Anatomy of a Fast Static Site"
subtitle: "What loads, when it loads, and why the loading screen never lies to you."
excerpt: "A tour of the loading architecture behind this website: priorities, deduplication, idle-time preloading, and the rule that banned fake progress bars."
description: "How this static site orders its work: a five-phase loading vocabulary, a P0–P4 priority ladder, single-import scene loading, and honest indeterminate progress."
date: "2026-08-22"
author: "Parsa Tak"
category: "engineering"
tags: ["performance", "architecture", "loading", "static export"]
featured: false
cover:
  src: "/blog/images/loading-architecture.svg"
  alt: "A dark technical diagram with a red priority ladder from P0 to P4 and a pulsing core"
  width: 1200
  height: 630
---

Every performance problem on the web is, at some level, a scheduling problem. Code, styles, images, and data all want the same scarce resources: the network, the main thread, and the user's attention. A fast site is not one with nothing to load — it is one where the *order* of loading is designed.

This site is a static export served from GitHub Pages. No server, no runtime backend, no build-time image pipeline. Those constraints shape everything below, and they are worth having: they force the loading design to be explicit rather than delegated to a framework's defaults.

## Five honest phases

Loading UIs lie constantly. They display 73%, then 92%, then 99% — numbers connected to nothing measurable. This site forbids that. Every loading surface exposes one of five phases:

- `INITIALIZING` — application boot, before the shell is interactive.
- `LOADING` — a required resource is being fetched for the current view.
- `PREPARING` — data is resident; the view is being staged.
- `READY` — the view is usable.
- `ERROR` — a required resource failed, and recovery is offered.

For measurable work, the UI may show deterministic progress. For indeterminate work — which is most of it — it shows an indeterminate treatment. The rule is simple: the interface never claims a resource is loaded when it is not.

## The priority ladder

All loading work is classified on one ladder:

- **P0 — critical.** The app shell, the current scene's code, essential CSS.
- **P1 — near-critical.** The most probable next scene. Loaded as soon as the main thread goes idle.
- **P2 — predictive.** The adjacent previous scene, after a second idle gap.
- **P3 — background.** Secondary metadata. Nothing currently schedules P3 work.
- **P4 — user-triggered.** PDFs, audio, video. *Never* loaded automatically.

Heavy media being P4 is a hard law here. The Library contains books and media measured in megabytes; none of it moves until you press READ, LISTEN, or WATCH. A link existing is not consent to download.

## One import site per scene

The subtlest performance bug on this site was structural. Each scene had *two* dynamic import sites — one in the scene registry that rendered the component, one in the preloader that warmed it ahead of time. The bundler, doing exactly what it was told, emitted two chunk copies of every scene. Every navigation downloaded both.

The fix was architectural, not tactical: the preloader now owns the single import site per scene, and the registry resolves its lazy components through that same loader. One request, one module instance, one execution. Concurrent callers — a navigation, a hover, a background preload — all join the same in-flight promise through a shared resource store.

Deduplication at the data layer follows the same pattern. If several components request the same resource in the same tick, they share one flight; a failed request is evicted so the next caller can retry instead of inheriting a cached rejection.

## Idle is a resource

The background preloader treats idle time as a budget, not an invitation. It loads at most two scene chunks without user intent. It declines to work when the tab is hidden, when `save-data` is on, or when the connection reports 2G. Idle callbacks carry a long timeout precisely because this work is low priority — P1 and P2 must never compete with the user's actual request.

## The result

The outcome is a navigation model with three speeds:

1. **Preloaded scene** — the chunk is resident; the transition is a fade. The loading overlay has a built-in 180 ms delay, so for transitions that resolve inside the minimum window, no loader ever appears.
2. **Cold scene** — the chunk fetches; the overlay appears after its delay, states `LOADING`, and disappears when the scene mounts.
3. **Return visits** — everything is content-hashed and immutable, so the browser cache does the work and the network stays quiet.

None of this required a new framework, a state manager, or a query library. It required deciding what should load, in what order, and being honest about what has not loaded yet. That is most of performance engineering.

The constraints side of this story — why the site stays fully static — is covered in [Building Under Constraints](/blog/building-under-constraints/).
