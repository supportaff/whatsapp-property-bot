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
  imageUrl: string;
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
 */
export function toDriveDirectUrl(url: string): string {
  if (!url) return '';
  if (url.includes('uc?export=download') || url.includes('uc?id=')) return url;
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;
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
    range: `${config.listingsTab}!A2:I1000`,
  });

  const rows = response.data.values || [];

  return rows
    .filter((row) => {
      const rowType     = (row[1] || '').toLowerCase().trim();
      const rowLocation = (row[3] || '').toLowerCase().trim();
      const price       = parseInt(row[4]);

      // Type: partial match (e.g. "real estate" matches "real estate / villa")
      const typeMatch = rowType.includes(type.toLowerCase().trim());

      // Location: EXACT match against what the agent typed in the sheet,
      // OR 'any' means skip the location filter entirely
      const locationMatch =
        location === 'any' ||
        rowLocation === location.toLowerCase().trim();

      const budgetMatch = !isNaN(price) && price >= minBudget && price <= maxBudget;

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
      imageUrl: toDriveDirectUrl(row[8] || ''),
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
