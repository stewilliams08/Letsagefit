# Fitness Site Starter

A rebrandable, single-client lead-gen website (the "Ageless" design). Spin up a
new client site by editing **one config file** and dropping in their photos — no
code changes. Each client gets its own repo, domain, GoHighLevel account, and
(optional) ad tag, so nothing is shared between clients.

## What a new client needs
1. Their **branding** (name, colors, tagline)
2. Their **contact info** (phone, address)
3. The **legal entity** that will text their leads (for the TCPA consent line)
4. A **GoHighLevel** sub-account (Private Integration token + Location ID)
5. A **booking calendar** link (GHL Calendars → the calendar's booking link)
6. **Photos** (5) and optionally **testimonial video** links
7. A **domain**

## Set up a new client (≈10 minutes)
1. **Create a new empty GitHub repo** for the client (e.g. `client-ageless-oxford`).
2. **Copy this starter into it** (or use it as a template repo → "Use this template").
3. **Edit `site.config.js`** — brand, theme colors, contact, legal entity/dba,
   offer (leadTag + `scheduleUrl`), analytics id (or leave `null`), video ids.
4. **Add photos** to `/assets/` named exactly:
   - `hero.jpg` (hero background), `program-1.jpg`, `program-2.jpg`,
     `why.jpg` (Why-Choose band), `cta.jpg` (CTA band).
   - Landscape JPGs, ~1600px wide, ideally < 400 KB each.
5. **Deploy to Railway** (or any Node host):
   - New project → deploy from the repo.
   - Set env vars (see `.env.example`): `GHL_TOKEN`, `GHL_LOCATION_ID`, and
     `CLICK_LOG_PATH` (point at a Railway Volume, e.g. `/data/leads.json`).
6. **Point the domain**: add the client's domain in Railway → Settings → Domains,
   then add the CNAME it gives you at the client's registrar.
7. In the client's **GoHighLevel**, create the `consent_*` custom fields and a
   workflow triggered by the `leadTag` you set, so new leads get worked.

## How it works
- `site.config.js` — the only file you edit per client (brand, colors, contact,
  legal, offer, analytics, media). Colors are injected as CSS variables.
- `server.js` — serves the page, captures leads into GoHighLevel with a TCPA
  consent record (env-based credentials), shows an on-page thank-you + booking link.
- `index.html` — the page (config-driven brand, colors, photos, videos, CTA).
- `lib/consent.js` — the single source of truth for the consent text.
- `privacy.html` / `terms.html` — legal pages (brand + phone filled from config).

## Run locally
```bash
npm install
cp .env.example .env   # fill in GHL_TOKEN / GHL_LOCATION_ID (optional for a visual preview)
npm start              # http://localhost:3000
```

## Notes
- **No client-specific values are hardcoded** — no ad tag, no GHL account, no brand.
  The ad tag only renders if you set `analytics.googleAdsId`.
- The legal pages are a starting point, not legal advice — have counsel review
  before a client goes live, and confirm the `dbaName` is a real registered d/b/a.
