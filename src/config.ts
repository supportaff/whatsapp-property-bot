import dotenv from 'dotenv';
dotenv.config();

export const config = {
  sheetId: process.env.SHEET_ID || '',
  listingsTab: process.env.SHEET_LISTINGS_TAB || 'Listings',
  leadsTab: process.env.SHEET_LEADS_TAB || 'Leads',
  serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
  privateKey: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  businessName: process.env.BUSINESS_NAME || 'Sri Homes',
  maxResults: parseInt(process.env.MAX_RESULTS || '5'),
  defaultAgentNumber: process.env.DEFAULT_AGENT_NUMBER || '',
};
