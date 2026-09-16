/* ============================================================================
   CLIENT SITE CONFIG  —  the ONLY file you edit to set up a new client.
   ----------------------------------------------------------------------------
   Everything a site needs that differs per client lives here. Secrets (the
   GoHighLevel token + location id) go in environment variables instead — see
   .env.example. Drop the client's photos in /assets/ with the names listed
   under `media` below.
   ============================================================================ */

/* ── COLOR PRESETS ──────────────────────────────────────────────────────────
   Pick one below with THEME_PRESET, or set `theme:` to your own object to
   fully customize. Each preset is bright & light with a warm CTA color. */
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

const THEME_PRESET = "teal";   // ← change to "blue" or "green" to recolor the whole site

module.exports = {

  // ── Brand ────────────────────────────────────────────────────────────────
  brand: {
    name:       "Ageless Fitness",          // full brand name (nav, footer, SEO)
    logoLead:   "Ageless",                  // logo: first part (in the ink color)
    logoAccent: "Fitness",                  // logo: second part (in the accent color)
    tagline:    "Personal training for adults 55+ — strength, balance, and independence.",
    domain:     "letsagefit.com",           // used for canonical + schema URL
    city:       "Ellettsville, IN",
  },

  // ── Colors ────────────────────────────────────────────────────────────────
  theme: THEME_PRESETS[THEME_PRESET],       // or replace with your own {primary, accent, ...}

  // ── Contact / location ────────────────────────────────────────────────────
  contact: {
    phone:   "812-558-5444",
    email:   "",                            // optional (blank = hidden)
    address: { street: "4264 N Cypress Ln", city: "Bloomington", state: "IN", zip: "47404" },
  },

  // ── Legal (used verbatim in the TCPA consent text) ────────────────────────
  legal: {
    legalEntity: "Williams Fortitude Fitness LLC",  // the operating LLC that texts leads
    dbaName:     "Ageless Fitness",                 // the d/b/a the customer recognizes
  },

  // ── Offer + lead handling ─────────────────────────────────────────────────
  offer: {
    leadTag:       "ageless",               // GHL tag applied to every lead (triggers your workflow)
    scheduleUrl:   "https://api.leadconnectorhq.com/widget/booking/sU4fo5UIGNVapADDsgUH",
    ctaLabel:      "Book Your Free Consultation",
    scheduleLabel: "Schedule My Consultation",
  },

  // ── Analytics (optional — leave null to disable) ──────────────────────────
  analytics: {
    googleAdsId: null,                      // e.g. "AW-1234567890", or null for none
  },

  // ── Media ────────────────────────────────────────────────────────────────
  media: {
    // YouTube video ids for the testimonials row (empty array hides the row).
    videoIds: [],
    // Photos go in /assets/ with these names (each slot hides until its file exists):
    //   hero.jpg      → hero background
    //   program-1.jpg → "One-on-One" card      program-2.jpg → "Small-Group" card
    //   why.jpg       → "Why Choose" band       cta.jpg       → CTA band
  },
};
