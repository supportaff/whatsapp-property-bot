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

// Fetch listings filtered by type, location, and budget
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
    range: `${config.listingsTab}!A2:H1000`,
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
    }));
}

// Save lead to Google Sheet Leads tab
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
