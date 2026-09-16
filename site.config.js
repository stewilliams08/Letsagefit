/* ============================================================================
   SITE CONFIG  —  the ONLY file you edit to add/adjust locations.
   ----------------------------------------------------------------------------
   letsagefit.com is a multi-location Ageless Fitness site. One brand, one
   design, one GoHighLevel — each club just differs by market, phone, address,
   and booking calendar. Add a club by copying a block under `locations` below.
   Secrets (the GoHighLevel token + location id) live in environment variables
   instead — see .env.example. Every lead is tagged `leadTag` in GHL.
   ============================================================================ */

/* ── COLOR PRESETS ──────────────────────────────────────────────────────────
   Pick one with THEME_PRESET, or set `theme:` to your own object. Each preset
   is bright & light with a warm CTA color. */
const THEME_PRESETS = {
  // Teal + Coral — health/wellness with a warm CTA (the Ageless default)
  teal:  { primary: "#0E9AA3", primaryDark: "#0B7B83", accent: "#EF6144", accentDark: "#DB4E31",
           navy: "#15324A", ink: "#1A2A38", body: "#53636E", bg: "#F4FAFB", soft: "#E7F4F5" },
  // Trust Blue + Coral — clinical, credible, high-trust
  blue:  { primary: "#1E6FA6", primaryDark: "#17567F", accent: "#EF6144", accentDark: "#DB4E31",
           navy: "#15324A", ink: "#1A2A38", body: "#53636E", bg: "#F3F7FB", soft: "#E6F0F8" },
  // Vitality Green + Gold — natural, energetic, "wellness"
  green: { primary: "#2E8B57", primaryDark: "#246B43", accent: "#E0912F", accentDark: "#C6791C",
           navy: "#1E3A2E", ink: "#1B2A22", body: "#52635B", bg: "#F5FAF6", soft: "#E7F3EA" },
};

const THEME_PRESET = "teal";   // ← "blue" or "green" recolors the whole site

module.exports = {

  // ── Brand (shared across every location) ──────────────────────────────────
  brand: {
    name:       "Ageless Fitness",          // full brand name (nav, footer, SEO)
    logoLead:   "Ageless",                  // logo: first part (in the ink color)
    logoAccent: "Fitness",                  // logo: second part (in the accent color)
    domain:     "letsagefit.com",           // used for canonical + schema URL
  },

  theme: THEME_PRESETS[THEME_PRESET],

  // ── Legal (used verbatim in the TCPA consent text — shared) ───────────────
  legal: {
    legalEntity: "Williams Fortitude Fitness LLC",  // the operating LLC that texts leads
    dbaName:     "Ageless Fitness",                 // the d/b/a the customer recognizes
  },

  // GHL tag applied to EVERY lead from EVERY location (triggers your workflow).
  leadTag: "ageless",

  // ── Analytics (optional — leave null to disable) ──────────────────────────
  analytics: {
    googleAdsId: null,                      // e.g. "AW-1234567890", or null for none
  },

  // Which location `/` redirects direct visitors to. Ads point at the specific
  // paths (/bloomington, /ellettsville) so this only affects the bare domain.
  defaultLocation: "bloomington",

  // ── LOCATIONS ─────────────────────────────────────────────────────────────
  //   Each key becomes a URL path:  letsagefit.com/<key>
  //   Copy a block to add a club. `scheduleUrl` is that club's GHL booking
  //   calendar; leave it blank ("") to hide the on-page booking button.
  locations: {
    bloomington: {
      market:     "Bloomington",            // the market shown on the page
      phone:      "812-334-7979",
      address:    { street: "2894 E 3rd St, Ste 160", city: "Bloomington", state: "IN", zip: "47401" },
      scheduleUrl:"https://api.leadconnectorhq.com/widget/booking/sU4fo5UIGNVapADDsgUH",
    },
    ellettsville: {
      market:     "Ellettsville",
      phone:      "812-558-5444",
      address:    { street: "4264 N Cypress Ln", city: "Bloomington", state: "IN", zip: "47404" },
      scheduleUrl:"",                       // ← paste the Ellettsville GHL booking calendar URL
    },
  },
};
