/* ============================================================================
   TCPA CONSENT — shared source of truth
   ----------------------------------------------------------------------------
   The consent disclosure is rendered per-location from the legal entity that
   actually operates each club. buildConsentText() is the single authority: it
   is used both to render the checkbox label AND to record what the visitor
   agreed to (so the two can never drift). If a location has no legalEntity we
   throw — we never fall back to generic text.
   ============================================================================ */

// Bump this whenever the consent wording changes, so records are auditable.
const CONSENT_VERSION = "2026-08-19-v1";

/**
 * Build the exact TCPA consent disclosure for a location.
 * @param {{legalEntity?:string, dbaName?:string, locationKey?:string, city?:string}} location
 * @returns {string} the full plain-text disclosure
 * @throws if legalEntity is missing (no generic fallback allowed)
 */
function buildConsentText(location) {
  location = location || {};
  if (!location.legalEntity) {
    const name = location.locationKey || location.city || "unknown";
    throw new Error(
      `TCPA consent misconfigured: location "${name}" has no legalEntity. ` +
      `Set legalEntity (and dbaName) in gym-config.js — refusing to render generic consent text.`
    );
  }
  const legalEntity = location.legalEntity;
  const dbaName = location.dbaName || location.gymName || "";
  return (
    "By checking this box, I agree to receive marketing calls and text messages — " +
    "including calls using an autodialer, prerecorded or artificial voice, or " +
    "AI-generated voice, and including automated texts — from " +
    legalEntity + " d/b/a " + dbaName + " and its service providers at the number " +
    "I provided. Consent is not a condition of purchase. Msg & data rates may apply; " +
    "message frequency varies. Reply STOP to opt out, HELP for help. " +
    "See our Privacy Policy and Terms."
  );
}

module.exports = { CONSENT_VERSION, buildConsentText };
