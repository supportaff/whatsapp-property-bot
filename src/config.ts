import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Google Sheets
  sheetId: process.env.SHEET_ID || '',
  listingsTab: process.env.SHEET_LISTINGS_TAB || 'Listings',
  leadsTab: process.env.SHEET_LEADS_TAB || 'Leads',
  serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
  privateKey: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),

  // Bot Search
  maxResults: parseInt(process.env.MAX_RESULTS || '5'),
  defaultAgentNumber: process.env.DEFAULT_AGENT_NUMBER || '',

  // ── Business Branding (set per agent/client) ──────────────────────
  businessName: process.env.BUSINESS_NAME || 'My Property Hub',
  businessTagline: process.env.BUSINESS_TAGLINE || 'Find your perfect property today!',
  businessPhone: process.env.BUSINESS_PHONE || '',
  businessCity: process.env.BUSINESS_CITY || 'Chennai',
  businessLocations: (process.env.BUSINESS_LOCATIONS || 'Anna Nagar,OMR,Velachery,Porur,Tambaram').split(','),
  businessTypes: (process.env.BUSINESS_TYPES || 'Real Estate,Car').split(','),
  businessWebsite: process.env.BUSINESS_WEBSITE || '',
  businessLogo: process.env.BUSINESS_LOGO_EMOJI || '🏠',

  // ── Follow-up Reminders ───────────────────────────────────────────
  // Hours before the visit to send the reminder (default: 12 hours before)
  reminderHoursBefore: parseInt(process.env.REMINDER_HOURS_BEFORE || '12'),
  // Enable or disable reminders
  remindersEnabled: process.env.REMINDERS_ENABLED !== 'false',
};
