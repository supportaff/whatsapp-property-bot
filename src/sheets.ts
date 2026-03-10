import { google } from 'googleapis';
import { config } from './config';

const getAuth = () =>
  new google.auth.JWT(
    config.serviceAccountEmail,
    undefined,
    config.privateKey,
    ['https://www.googleapis.com/auth/spreadsheets']
  );

export interface Listing {
  id: string;
  type: string;
  title: string;
  location: string;
  price: number;
  details: string;
  agentName: string;
  agentNumber: string;
  imageUrl: string; // Google Drive direct download URL (column I)
}

export interface Lead {
  customerName: string;
  phone: string;
  propertyType: string;
  location: string;
  minBudget: number;
  maxBudget: number;
  interestedIn: string;
  visitDate: string;
  timestamp: string;
}

/**
 * Convert any Google Drive share link to a direct downloadable image URL.
 * Supports:
 *   https://drive.google.com/file/d/FILE_ID/view
 *   https://drive.google.com/open?id=FILE_ID
 *   https://drive.google.com/uc?id=FILE_ID  (already direct)
 */
export function toDriveDirectUrl(url: string): string {
  if (!url) return '';
  // Already a direct download link
  if (url.includes('uc?export=download') || url.includes('uc?id=')) return url;
  // /file/d/FILE_ID/view  or  /file/d/FILE_ID/
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;
  // ?id=FILE_ID
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
  return url;
}

export async function fetchListings(
  type: string,
  location: string,
  minBudget: number,
  maxBudget: number
): Promise<Listing[]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: config.sheetId,
    range: `${config.listingsTab}!A2:I1000`, // now reads column I for image
  });

  const rows = response.data.values || [];

  return rows
    .filter((row) => {
      const rowType = (row[1] || '').toLowerCase();
      const rowLocation = (row[3] || '').toLowerCase();
      const price = parseInt(row[4]);
      const typeMatch = rowType.includes(type.toLowerCase());
      const locationMatch = location === 'any' || rowLocation.includes(location.toLowerCase());
      const budgetMatch = price >= minBudget && price <= maxBudget;
      return typeMatch && locationMatch && budgetMatch;
    })
    .slice(0, config.maxResults)
    .map((row) => ({
      id: row[0] || '',
      type: row[1] || '',
      title: row[2] || '',
      location: row[3] || '',
      price: parseInt(row[4]) || 0,
      details: row[5] || '',
      agentName: row[6] || '',
      agentNumber: row[7] || config.defaultAgentNumber,
      imageUrl: toDriveDirectUrl(row[8] || ''), // column I
    }));
}

export async function saveLead(lead: Lead): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: config.sheetId,
    range: `${config.leadsTab}!A:I`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        lead.timestamp,
        lead.customerName,
        lead.phone,
        lead.propertyType,
        lead.location,
        `₹${lead.minBudget.toLocaleString()} - ₹${lead.maxBudget.toLocaleString()}`,
        lead.interestedIn,
        lead.visitDate,
        'New',
      ]],
    },
  });
}
