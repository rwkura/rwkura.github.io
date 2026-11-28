# AGENTS.md

Guidance for AI coding agents working on the **Sydney Harbour Runners (SHR)** website (`https://sydneyharbourrunners.org`).

## Project Overview

- **Stack:** Jekyll 4 static site customized from the Minimal Mistakes theme (`air` skin), deployed to GitHub Pages from `master`.
- **CI / Deployment:**
  - `.github/workflows/jekyll.yml` builds with Ruby `3.3.6` on `ubuntu-24.04` (`JEKYLL_ENV=production bundle exec jekyll build`) and deploys `_site/` to GitHub Pages on pushes to `master`, manual dispatch, or after `"Update 2nd line"` completes.
  - `.github/workflows/removeRow.yml` (`"Update 2nd line"`) runs every Tuesday at `10:00 UTC` (`0 10 * * 2`), deletes line 2 of `_data/dates.csv` (`sed -i '2d' "./_data/dates.csv"`), and auto-commits.
- **Upstream theme leftovers (ignore for site work):** `README.md`, `CHANGELOG.md`, `package.json`, `Rakefile`, `minimal-mistakes-jekyll.gemspec`, `docs/`, `test/`, `.travis.yml`, and `.github/workflows/build.yml` come from Minimal Mistakes upstream. `docs/` and `test/` are excluded in `_config.yml`. Do not use `rake` or `npm` to build the site.

## Build & Local Preview

```bash
# Install Ruby gems locally (vendor/bundle and .bundle are gitignored)
bundle config set --local path vendor/bundle
bundle install --jobs=4 --retry=3

# Production build check (matches CI)
JEKYLL_ENV=production bundle exec jekyll build

# Local dev server with live reload
bundle exec jekyll serve --livereload
```

- Editing `_config.yml` requires restarting `jekyll serve`.
- `Gemfile.lock` is gitignored; do not force-commit it.
- Verify changes with `JEKYLL_ENV=production bundle exec jekyll build` and inspect generated HTML in `_site/`.
- Dart Sass deprecation warnings from `_sass/minimal-mistakes/` are expected upstream theme noise and do not fail the build.

## Repository Layout

### Content & Data
- `_data/dates.csv` — Weekly run schedule. Drives both `/schedule/` and the Homepage "Next Run" banner (`site.data.dates[0]`). Ignore `_data/dates copy.csv` (old backup).
- `_data/navigation.yml` — Top navigation links (`Schedule`, `Courses`, `Pacers`, `Friends`, `FB`).
- `_courses/*.md` — Route pages (`/courses/<slug>/`). GPX downloads live in `assets/gpx_files/`.
- `_pacers/*.md` — Volunteer pacer profiles (`/pacers/<slug>/`).
- `_friends/*.md` — Club partners & member discounts (`/friends/<slug>/`).
- `_archive/` — Retired pacers/partners kept for reference (not published).
- `assets/images/` — Photos and logos (prefer `.webp` for new assets).
- `assets/docs/SHR-Waiver.pdf` — Participant waiver linked in the footer.

### Pages & Custom Layouts
- `index.html` → `_layouts/home.html` — Next Run status banner, hero, club highlights, and Quick Questions FAQ.
- `_pages/schedule.html` → `layout: archive` + `_includes/schedule-course.html` — Schedule table and GPX import guides.
- `_pages/courses.md` → `_layouts/courses.html` — Distance filter bar and course cards with Strava embeds and GPX download links.
- `_pages/pacers.md` → `_layouts/pacers.html` — Pacer grid cards.
- `_pages/friends.md` → `_layouts/friends.html` — Partner cards sorted by `order`.
- `_layouts/single.html` — Detail page layout for individual courses, pacers, and friends (adds `← Back to <Collection>` and `page.distance`).

### Custom Includes, CSS & JS
- `_includes/head/custom.html` — Loads Google Fonts (`Archivo` + `Source Sans 3`) and includes `_includes/schema.html` (SportsClub + FAQPage JSON-LD) on `/`.
- `_includes/masthead.html` & `_includes/footer.html` — Pure-CSS site header/navigation (no JS menu script; the `FB` nav item is rendered as a separate CTA) and footer.
- `_includes/icon.html` — Inline SVG icons (`facebook-square`, `facebook`, `instagram`, `twitter`, `linkedin`, `calendar`, `map-pin`, `route`, `users`, `download`). Font Awesome CDN is intentionally not used.
- `_includes/scripts.html` — Conditionally loads `assets/js/strava-lazy.js` only on pages containing `strava-embed-placeholder` (no global JS bundle or jQuery).
- `assets/css/main.scss` — Imports Minimal Mistakes (`_sass/minimal-mistakes/skins/_air.scss` + partials), followed by the custom **Editorial Athletic Design System** (`--shr-*` CSS variables and `.shr-*` classes).
- `assets/js/strava-lazy.js` — IntersectionObserver lazy loader for `.strava-embed-placeholder` widgets **and** click handlers for the `/courses/` distance filter buttons.

### SEO & AI Discoverability
- `llms.txt`, `robots.txt`, `_includes/schema.html`, and `_config.yml` (`description`, `social`) describe club basics.
- If club details change (meeting time, Cockle Bay Wharf Bird Fountain location, Short 6–8 km / Long 11–13 km distances, pace groups 4:30–6:15 min/km, recommended 6:15/km or faster), keep `_config.yml`, `_layouts/home.html`, `_layouts/pacers.html`, `_includes/schema.html`, and `llms.txt` in sync.

## Content Conventions & Gotchas

### 1. Weekly Schedule (`_data/dates.csv`)
Columns: `Date,Time,Status,Short Course,Long Course,Extra Long Course`

- **Exact status string:** Running weeks **must** use `We are running!` — both `_layouts/home.html` and `_pages/schedule.html` compare `Status == "We are running!"`. Non-running weeks use descriptive text such as `Not running - holiday break!`.
- **Single-quoted course links:** Always use single quotes for `href` in `_data/dates.csv`, e.g. `<a href='/courses/gardens-short/'>Gardens Short</a>` (or `N/A` / empty). `_layouts/home.html` extracts the course URL using `split:"href='"` to look up distances, so double quotes will break homepage distance badges.
- **Extra Long column:** Hidden automatically on `/schedule/` unless at least one row has a non-empty, non-`N/A` value.
- **Auto-deletion of row 2:** Because `.github/workflows/removeRow.yml` runs `sed -i '2d'`, row 2 must always be the upcoming Tuesday (no blank lines at the top), and the file should keep a trailing newline.

### 2. Courses (`_courses/<slug>.md`)
```yaml
---
title: "Course Name"
excerpt: " "
distance: "9.2km"
---
```
- Keep `distance` at the **top level** of front matter (not indented under `header:`). `_layouts/courses.html` parses the numeric value to bucket courses into `short` (`< 10`), `long` (`10–15`), and `super` (`>= 15`).
- Set `hidden: true` to keep a course URL live while hiding it from `/courses/`.
- **Double-quoted GPX links:** Use double quotes for the GPX anchor (`<a href="/assets/gpx_files/<slug>.gpx">GPX File</a>`). `_layouts/courses.html` parses GPX links by splitting on `href="` and checking for `.gpx`.
- **Strava embed + filter script coupling:** `_includes/scripts.html` only loads `assets/js/strava-lazy.js` when `content contains 'strava-embed-placeholder'`. Do not break that class name if modifying course cards or `_layouts/courses.html`.

### 3. Pacers (`_pacers/<name>.md`)
```yaml
---
title: "Name"
excerpt: "Long Course - 5:00-5:30/km"
header:
  image: /assets/images/<name>.webp
  teaser: assets/images/<name>.webp
  image_width: 400
  image_height: 500
---
```
- `excerpt` renders as the pace badge on `/pacers/`. If the first body paragraph contains the same string as `excerpt`, `_layouts/pacers.html` automatically strips it from the card preview so it isn't duplicated.
- Include `image_width` and `image_height` matching the `.webp` dimensions to prevent layout shift.
- To retire a pacer, move the file to `_archive/pacers/` (or set `hidden: true`).

### 4. Friends (`_friends/<slug>.md`)
- Include numeric `order:` in front matter to control display order on `/friends/` (ascending).
- Provide `.webp` logo in `assets/images/` with `image_width` and `image_height`.

### 5. Styling, Performance & Jekyll Hygiene
- **Design system:** Keep edits aligned with the Editorial Athletic style in `assets/css/main.scss` (`Archivo` headings, `Source Sans 3` body, warm paper `#f7f6f2`, ink `#161719`, harbour blue `#0c749a` / `#4dbfea`, crisp `#ddd9d0` borders, `3px` radius).
- **Performance:** Do not reintroduce jQuery, `assets/js/main.min.js`, or Font Awesome CDN. Add new icons to `_includes/icon.html` as inline SVGs.
- **Root files in `_config.yml`:** Any non-dot markdown/config file added at the repo root (such as `AGENTS.md`) **must** be listed under `exclude:` in `_config.yml` so Jekyll does not publish it into `_site/`.
