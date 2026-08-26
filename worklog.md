# Parsa Tak WEB — Project Worklog

## Project

**Website:** https://parsaetak.github.io/WEB/  
**Repository:** https://github.com/Parsaetak/WEB  
**Content repository:** https://github.com/Parsaetak/Contents

**Owner / Designer:** Parsa Tak  
**Project identity:** Parsa Tak / SHEYTAN  
**Current date:** 2026-08-26

---

# 1. Project Purpose

The WEB project is a personal interactive website for Parsa Tak.

The site should feel like a living digital environment rather than a conventional portfolio.

Primary goals:

- Present Parsa Tak's identity, ideas, systems, projects, and media.
- Make the website visually distinctive and entertaining.
- Keep technical infrastructure mostly invisible to visitors.
- Prioritise smooth interaction, fast foreground rendering, and deferred background work.
- Allow the site to evolve continuously as new projects and media are created.
- Support a growing personal media library backed by the public `Contents` repository.

---

# 2. Core UX Principle

## Front-end

The user should primarily experience:

- visual design
- typography
- motion
- interaction
- books
- art
- audio
- video
- projects
- ideas

The visitor should NOT be exposed unnecessarily to:

- GitHub branches
- SHA values
- raw repository paths
- implementation details
- technical loading systems
- internal architecture
- unnecessary HUD-like micro labels
- duplicated explanatory text

## Background

Technical work should happen invisibly whenever possible:

- scene code splitting
- dynamic imports
- idle preloading
- media discovery
- manifest loading
- animation throttling
- visibility detection
- caching
- deferred media loading

The foreground should remain the highest priority.

---

# 3. Current Scene Architecture

Current scenes:

1. Home
2. About
3. Systems
4. RED Magic
5. Work
6. Library

Scene ID type currently contains:

- `home`
- `about`
- `systems`
- `magic`
- `work`
- `library`

Scene navigation is defined in:

`components/LivingShell.tsx`

Scene implementation mapping is defined in:

`components/SceneRegistry.tsx`

Scene preloading is handled by:

`components/ScenePreloader.tsx`

---

# 4. Current Scene Responsibilities

## Home

Purpose:

- establish identity
- establish overall direction
- provide the strongest first impression
- introduce major ideas without excessive explanation
- retain RED MAGIC as a distinctive part of the Home experience

Important:

RED MAGIC is intentionally allowed on Home because it gives the website character.

Do not remove RED MAGIC from Home merely because a dedicated RED MAGIC scene exists.

Home should introduce and express the concept.

The dedicated RED MAGIC scene should contain the deeper explanation.

---

## About

Purpose:

- explain who Parsa Tak is
- explain working philosophy
- explain practice and creative direction

Current conceptual structure includes:

- identity
- IN PRACTICE
- statement about researching, building, writing and creating
- BASED AROUND
- OUTPUT

Avoid repeating the same exact explanation elsewhere unless another scene presents a genuinely different concept.

---

## Systems

Purpose:

- contain the technical/intellectual systems
- AI Instructions
- REP
- USEF

Do not duplicate these detailed frameworks in Home or unrelated scenes.

---

## RED Magic

Purpose:

- own the deeper RED MAGIC concept
- explain the living computational experiment
- contain its principles and long-term direction

Home may reference and visually express RED MAGIC, but the dedicated scene owns the detailed explanation.

---

## Work

Purpose:

- projects and completed work
- selected outputs
- project presentation

Avoid duplicating Systems, RED MAGIC, or About content here.

---

## Library

Purpose:

- public-facing media experience
- books
- audio
- video
- visual art
- future published media

The Library should feel like a media gallery / publishing surface.

It should NOT feel like a GitHub repository browser.

---

# 5. Legal / Attribution

The project already contains:

`LICENSE.md`

and:

`TRADEMARKS.md`

Current trademark direction includes:

- Parsa Tak™
- SHEYTAN™
- RED MAGIC™
- RED THEORY™
- REP™
- USEF™

Global legal presentation is handled through `LivingShell.tsx`.

Do not recreate or duplicate legal text unnecessarily throughout scenes.

---

# 6. Content Repository

Current public content repository:

`Parsaetak/Contents`

The repository is intentionally kept public for the current architecture.

Current branches:

- `AI-Tests`
- `AI-frameworks`
- `Archive-old-files`
- `Books`
- `Projects`

The repository default branch is currently:

`Projects`

This is important when constructing direct manifest URLs.

---

# 7. Library Architecture

The Library does NOT download complete media when the Library scene opens.

Current intended flow:

```text
Enter Library
      ↓
load lightweight library.json
      ↓
show catalogue / preview
      ↓
user selects a work
      ↓
show editorial preview
      ↓
user explicitly opens work
      ↓
load full media
