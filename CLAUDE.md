# CLAUDE.md — Radar — Forme Femine

## What this is
A curated exhibition tracker for African and Black diaspora artists showing worldwide.
Part of the Forme Femine ecosystem. Static site + Python CLI. No backend framework.

## Architecture
- Data: JSON files in data/ (exhibitions.json, artists.json, venues.json)
- CLI: Python, entry point is cli/wsw.py
- Site: vanilla HTML/CSS/JS in site/, no frameworks
- Build: CLI generates site/js/site-data.js from JSON sources
- Build: CLI generates individual exhibition pages at site/exhibition/{id}.html
- Build: CLI generates sitemap.xml and robots.txt in site/
- Submissions: form on about.html sends POST to /api/submit (Cloudflare Pages Function)
- Submissions stored in Cloudflare KV with namespace binding SUBMISSIONS
- functions/ directory contains Cloudflare Pages Functions (auto-detected by Cloudflare)
- Deploy: Cloudflare Pages from site/ directory

## Hard rules
- Straight quotes only in all JSON and code (no curly/smart quotes)
- All IDs are slugified with prefixes: exh-, art-, ven-
- No backend server, no database, no ORM, no framework
- site-data.js is GENERATED — never edit it directly
- site/exhibition/*.html are GENERATED — never edit them directly
- sitemap.xml and robots.txt are GENERATED — never edit them directly
- Footer reads "Radar by Forme Femine" with Forme Femine linked to formefemine.com, plus copyright year below
- Light mode is the default (no prefers-color-scheme; returning users who toggled to dark keep their choice via localStorage)
- All filtering is client-side
- Confidence field (verified, verified_date, confidence) is internal only — never render on public exhibition pages
- Artist lists on exhibition pages show only African/diaspora artists Radar tracks, not every artist in the show. The description and "group" tag communicate broader scope. No "...and more" suffixes.

## ID format
- Exhibitions: exh-{venue-slug}-{artist-or-title-slug}-{year} e.g. exh-tate-modern-el-anatsui-2026
- Artists: art-{name-slug} e.g. art-el-anatsui
- Venues: ven-{name-slug} e.g. ven-tate-modern

## Data schemas

### Exhibition (data/exhibitions.json)
Required fields: id, title, artist_ids (array of art- IDs), venue_id (ven- ID), city, country, region, start_date (YYYY-MM-DD), end_date (YYYY-MM-DD), type, admission, mediums (array), focus, source, added_date, status
Optional fields: description, url, image_url
type values: solo | group | fair | biennial | residency | screening | performance
focus values: dedicated | diaspora | significant | featured
  dedicated = exhibition is specifically about African artists/art
  diaspora = exhibition by or about artists of African descent from outside the continent (African American, Afro-Caribbean, Afro-Brazilian, Afro-Latino, etc.)
  significant = African or Black diaspora artists are a major presence but not exclusively so
  featured = one or more African or Black diaspora artists included in a broader show
admission values: free | paid | donation | rsvp
status values: upcoming | current | past
source values: manual | submission | scrape | api
region values: West Africa | East Africa | Southern Africa | North Africa | Central Africa | Europe | North America | South America | Caribbean | Middle East | Asia | Oceania

### Artist (data/artists.json)
Required fields: id, name, origin_country, origin_region, mediums (array)
Optional fields: based_in (array [city, country]), is_diaspora (boolean, default false), birth_year, website, notes
origin_region values: West Africa | East Africa | Southern Africa | North Africa | Central Africa | African American | Afro-Caribbean | Afro-Brazilian | Afro-European | Afro-Latinx

### Venue (data/venues.json)
Required fields: id, name, city, country, type
Optional fields: website, notes
type values: gallery | museum | institution | project-space | fair | biennial-venue | artist-run | university | online

## CLI namespace
Entry point: python cli/wsw.py
Commands: exhibition, artist, venue, build, stats, validate, verify, refresh

## Colours

### Light mode (default)
Background: #f5f3f0
Surface/cards: #ffffff
Border: #e5e2dd
Text primary: #1a1815
Text secondary: #6b6560
Accent: #8b6b3d (warm gold)
Accent hover: #725530
Status current: #2d7a4a
Status upcoming: #3a6db5
Status past: #8a8580

### Dark mode
Background: #0a0a0a
Surface/cards: #141414
Border: #1e1e1e
Text primary: #e8e4df
Text secondary: #8a8580
Accent: #c9a87c (warm gold)
Accent hover: #d4b88a
Status current: #4a9e6e
Status upcoming: #5b8dd4
Status past: #6b6560

## Verify command
Layer 1 only — stdlib, no external dependencies or API costs.
`python cli/wsw.py verify` fact-checks every exhibition and scores confidence:
- **high**: URL resolves (200), title or artist name confirmed on page, dates valid, all fields complete
- **medium**: URL resolves but content not confirmed, or minor warnings (no artist match, exhibition not on venue site)
- **low**: URL returns 404/error, date sanity fails, missing required fields, no URL and no venue website to cross-reference
Checks performed: URL resolution (HEAD/GET), page content matching (title + artist names), venue website cross-reference, date sanity (>2yr duration, start>end, placeholder dates), duplicate detection (difflib, 0.8 threshold), required field completeness.
Flags: `--dry-run` (print only, no save), `--quiet` (skip high-confidence results).
Results saved to exhibitions.json as `verified`, `verified_date`, `confidence` fields.
`refresh` runs: validate -> verify -> build.

## Mobile / CSS rules
- NEVER use `overflow-x: hidden` on html or body — it kills nested horizontal scroll (e.g. editorial carousels). Use `overflow-x: hidden` on body only if editorial cards use flex-wrap instead of scroll on mobile.
- Editorial cards ("Last Chance", "Just Opened"): on mobile (max-width: 639px) use `flex-wrap: wrap` with `width: calc(50% - 6px)` so two cards fit side-by-side without scroll. On desktop (640px+) use fixed-width cards (260px) with `overflow-x: auto` for horizontal scroll.
- Safari does not support `overflow-x: clip` reliably — avoid it.
- Always test mobile layout in Safari (iPhone) not just Chrome DevTools.

## Commit discipline
Run `python cli/wsw.py validate` before every commit.
