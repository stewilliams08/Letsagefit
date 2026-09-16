/* ============================================================================
   LETSAGEFIT — MULTI-LOCATION AGELESS FITNESS SITE
   ----------------------------------------------------------------------------
   One brand, one design, one GoHighLevel. Each club is a URL path served from
   the same page template — letsagefit.com/<location>. Everything club-specific
   (market, phone, address, booking calendar) comes from site.config.js; GHL
   secrets come from env. Leads are captured with TCPA consent, tagged in GHL,
   then shown an on-page thank-you + that club's booking link.
   ============================================================================ */

const express = require("express");
const fs = require("fs");
const path = require("path");
const CONFIG = require("./site.config");
const { CONSENT_VERSION, buildConsentText } = require("./lib/consent");

const app = express();
const PORT = process.env.PORT || 3000;
const CLICK_LOG_PATH = process.env.CLICK_LOG_PATH || path.join("/tmp", "leads.json");

const LOCATIONS = CONFIG.locations || {};
const DEFAULT_LOCATION = CONFIG.defaultLocation ||
  (Object.keys(LOCATIONS)[0]);

// A "location-like" object so the shared consent lib can build the TCPA text.
// The legal entity + d/b/a are shared across every club, so consent is too.
const CONSENT_LOC = {
  legalEntity: CONFIG.legal && CONFIG.legal.legalEntity,
  dbaName:     CONFIG.legal && CONFIG.legal.dbaName,
  gymName:     CONFIG.brand && CONFIG.brand.name,
  locationKey: (CONFIG.brand && CONFIG.brand.domain) || "site",
};

// Fail fast at boot if the consent entity is misconfigured (never render generic text).
buildConsentText(CONSENT_LOC);

// ── Format a location's address block into one line ──
function formatAddress(a) {
  a = a || {};
  const cityLine = [[a.city, a.state].filter(Boolean).join(", "), a.zip].filter(Boolean).join(" ");
  return [a.street, cityLine].filter(Boolean).join(", ");
}

// ── Flat config the browser receives for a location (safe subset — no secrets) ──
function gymConfigFor(slug) {
  const loc = LOCATIONS[slug] || {};
  const a = loc.address || {};
  return {
    gymName: CONFIG.brand && CONFIG.brand.name,
    marketCity: loc.market || "",
    locationKey: slug,
    phone: loc.phone || "",
    address: formatAddress(a),
    addressParts: { street: a.street, city: a.city, state: a.state, zip: a.zip },
    scheduleUrl: loc.scheduleUrl || "",
    leadTag: CONFIG.leadTag || "",
  };
}

// ── Theme → CSS custom properties injected into the page's :root ──
function themeVars() {
  const t = CONFIG.theme || {};
  return [
    `--blue:${t.primary};`, `--blue-d:${t.primaryDark};`,
    `--coral:${t.accent};`, `--coral-d:${t.accentDark};`,
    `--navy:${t.navy};`, `--ink:${t.ink};`, `--body:${t.body};`,
    `--bg:${t.bg};`, `--soft:${t.soft};`,
    `--line:rgba(20,50,70,.12);`, `--amber:#E8A13A;`,
  ].join("");
}

// ── Optional Google Ads tag (only rendered when an id is configured) ──
function adsTag() {
  const id = CONFIG.analytics && CONFIG.analytics.googleAdsId;
  if (!id) return "";
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>\n` +
    `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}` +
    `gtag('js',new Date());gtag('config','${id}');</script>`;
}

// ── Consent label HTML for the checkbox (escape, then linkify Privacy/Terms) ──
function consentLabelHtml() {
  const escaped = buildConsentText(CONSENT_LOC)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped
    .replace("Privacy Policy", '<a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>')
    .replace("Terms", '<a href="/terms" target="_blank" rel="noopener">Terms</a>');
}

const TEMPLATE = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const PRIVACY_HTML = fs.readFileSync(path.join(__dirname, "privacy.html"), "utf8");
const TERMS_HTML = fs.readFileSync(path.join(__dirname, "terms.html"), "utf8");

// Legal pages are shared; fill brand + a representative phone (default club).
function fillBrand(html) {
  const b = CONFIG.brand || {};
  const defLoc = LOCATIONS[DEFAULT_LOCATION] || {};
  const phone = defLoc.phone || "";
  return html
    .replace(/\{\{BRAND_NAME\}\}/g, b.name || "")
    .replace(/\{\{PHONE\}\}/g, phone);
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Render the page for one location ──
function renderPage(slug) {
  const cfg = gymConfigFor(slug);
  const gymJson = JSON.stringify(cfg).replace(/</g, "\\u003c");
  const phoneDigits = String(cfg.phone || "").replace(/[^0-9]/g, "");
  return TEMPLATE
    .replace(/\{\{MARKET_CITY\}\}/g, esc(cfg.marketCity))
    .replace(/\{\{ADDRESS\}\}/g, esc(cfg.address))
    .replace(/\{\{PHONE_DIGITS\}\}/g, phoneDigits)
    .replace(/\{\{PHONE\}\}/g, esc(cfg.phone))
    .replace("{{THEME_VARS}}", themeVars())
    .replace("{{ADS_TAG}}", adsTag())
    .replace("{{GYM_CONFIG_JSON}}", gymJson)
    .replace(/\{\{CONSENT_LABEL\}\}/g, consentLabelHtml());
}

app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.json({ limit: "10kb" }));

// ── GoHighLevel credentials (from env only — one GHL for the whole brand) ──
function ghlCreds() {
  const token = process.env.GHL_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  return token && locationId ? { token, locationId } : null;
}

/* ── Lead capture ───────────────────────────────────────────────────────────
   POST /track-click  { action:'join', location, firstName,lastName,phone,email,
   consent, ... }  Upserts the contact in GoHighLevel (tagged leadTag + the
   location slug) with a TCPA consent record, logs it, returns ok. */
app.post("/track-click", async (req, res) => {
  try {
    const {
      action = "unknown", location = null, email = null, firstName = null, lastName = null,
      phone = null, consent = false,
      gclid = null, utmSource = null, utmMedium = null,
      utmCampaign = null, utmContent = null, utmTerm = null,
    } = req.body || {};

    const xff = req.headers["x-forwarded-for"];
    const ip = (xff ? String(xff).split(",")[0].trim() : null) || req.socket?.remoteAddress || null;
    const nowIso = new Date().toISOString();
    const isLead = action === "join" && !!email;

    // Server-side consent enforcement — never trust the client alone.
    if (isLead && consent !== true) {
      return res.status(400).json({ ok: false, error: "consent_required",
        message: "You must agree to the consent disclosure to continue." });
    }

    const consentRecord = isLead ? {
      consent_text: buildConsentText(CONSENT_LOC),
      consent_version: CONSENT_VERSION,
      consent_timestamp: nowIso,
      consent_ip: ip,
      consent_user_agent: req.headers["user-agent"] || null,
      consent_page_url: req.headers["referer"] || req.headers["referrer"] || null,
    } : null;

    const entry = {
      ts: nowIso, action, location,
      email: email ? email.trim().toLowerCase() : null,
      firstName, lastName, phone, consent: !!consent,
      gclid, utmSource, utmMedium, utmCampaign, utmContent, utmTerm,
      ip, userAgent: req.headers["user-agent"] || null, consentRecord,
    };

    // Durable log (never let a log-write failure break lead capture).
    try {
      fs.appendFileSync(CLICK_LOG_PATH, JSON.stringify(entry) + "\n", "utf8");
    } catch (logErr) {
      console.warn("[track-click] log write failed (continuing):", logErr.message);
    }
    console.log(`[track-click] ${nowIso} | ${action} | loc=${location || "?"} | email=${email || "none"}`);

    // Create/update the GoHighLevel contact (v2 API, Private Integration token).
    const creds = ghlCreds();
    if (creds && isLead) {
      const headers = { Authorization: `Bearer ${creds.token}`, Version: "2021-07-28", "Content-Type": "application/json" };
      const fullName = [firstName, lastName].filter(Boolean).join(" ") || undefined;
      // Brand tag on every lead, plus the location slug so you can tell clubs apart.
      const tags = [CONFIG.leadTag, LOCATIONS[location] ? "ageless-" + location : null].filter(Boolean);
      const customFields = consentRecord ? [
        { key: "consent_text", field_value: consentRecord.consent_text },
        { key: "consent_version", field_value: consentRecord.consent_version },
        { key: "consent_timestamp", field_value: consentRecord.consent_timestamp },
        { key: "consent_ip", field_value: consentRecord.consent_ip },
        { key: "consent_user_agent", field_value: consentRecord.consent_user_agent },
        { key: "consent_page_url", field_value: consentRecord.consent_page_url },
      ] : undefined;

      fetch("https://services.leadconnectorhq.com/contacts/upsert", {
        method: "POST", headers,
        body: JSON.stringify({
          locationId: creds.locationId,
          firstName: firstName || undefined, lastName: lastName || undefined, name: fullName,
          email: email || undefined, phone: phone || undefined,
          tags, customFields,
        }),
      })
        .then(async (r) => {
          const data = await r.json().catch(() => ({}));
          if (!r.ok) { console.warn(`[ghl] upsert ${r.status}:`, JSON.stringify(data).slice(0, 300)); return; }
          // Upsert doesn't reliably apply tags on existing contacts — apply explicitly.
          const id = data && data.contact && data.contact.id;
          if (id && tags.length) {
            fetch(`https://services.leadconnectorhq.com/contacts/${id}/tags`, {
              method: "POST", headers, body: JSON.stringify({ tags }),
            }).then(async (tr) => { if (!tr.ok) console.warn(`[ghl] add-tags ${tr.status}:`, (await tr.text()).slice(0, 200)); })
              .catch((e) => console.warn("[ghl] add-tags failed:", e.message));
          }
        })
        .catch((e) => console.warn("[ghl] upsert failed:", e.message));
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── Optional lead log viewer (protected by LOG_VIEW_TOKEN) ──
app.get("/leads", (req, res) => {
  const token = process.env.LOG_VIEW_TOKEN;
  if (!token || req.query.token !== token) return res.status(403).json({ error: "Unauthorized" });
  try {
    const lines = fs.existsSync(CLICK_LOG_PATH)
      ? fs.readFileSync(CLICK_LOG_PATH, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l))
      : [];
    res.json(lines);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/privacy", (_req, res) => res.type("html").send(fillBrand(PRIVACY_HTML)));
app.get("/terms", (_req, res) => res.type("html").send(fillBrand(TERMS_HTML)));

// Bare domain → default club (ads target the specific /<location> paths).
app.get("/", (_req, res) => res.redirect(302, "/" + DEFAULT_LOCATION));

// Each club: letsagefit.com/<location>
app.get("/:location", (req, res, next) => {
  const slug = String(req.params.location || "").toLowerCase();
  if (!LOCATIONS[slug]) return next();           // unknown → 404 handler
  res.type("html").send(renderPage(slug));
});

// 404 for anything else — send folks to the default club.
app.use((_req, res) => res.redirect(302, "/" + DEFAULT_LOCATION));

app.listen(PORT, () => {
  const slugs = Object.keys(LOCATIONS).join(", ");
  console.log(`${CONFIG.brand.name} multi-location site on port ${PORT} — locations: ${slugs}`);
});
