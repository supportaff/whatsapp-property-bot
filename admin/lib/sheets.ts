import { google } from 'googleapis';

const SHEET_ID = process.env.ADMIN_SHEET_ID || '';
const TAB = 'Clients';

export const COLUMNS = [
  'id', 'name', 'phone', 'plan', 'status', 'fee',
  'startDate', 'renewalDate', 'sheetId', 'agentNumber', 'notes'
];

function getAuth() {
  return new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    undefined,
    (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
  );
}

export async function getClients() {
  const sheets = google.sheets({ version: 'v4', auth: getAuth() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${TAB}!A2:K1000`,
  });
  const rows = res.data.values || [];
  return rows
    .filter(row => row[0]) // skip empty rows
    .map(row => {
      const obj: Record<string, string> = {};
      COLUMNS.forEach((col, i) => { obj[col] = row[i] || ''; });
      return obj;
    });
}

export async function addClient(data: Record<string, string>) {
  const sheets = google.sheets({ version: 'v4', auth: getAuth() });
  const id = `C${Date.now()}`;
  const row = COLUMNS.map(col => col === 'id' ? id : (data[col] || ''));
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${TAB}!A:K`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  });
}

export async function updateClient(id: string, data: Record<string, string>) {
  const sheets = google.sheets({ version: 'v4', auth: getAuth() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${TAB}!A2:A1000`,
  });
  const rows = res.data.values || [];
  const rowIndex = rows.findIndex(r => r[0] === id);
  if (rowIndex === -1) return;
  const sheetRow = rowIndex + 2;
  const row = COLUMNS.map(col => col === 'id' ? id : (data[col] || ''));
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${TAB}!A${sheetRow}:K${sheetRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  });
}

export async function deleteClient(id: string) {
  const sheets = google.sheets({ version: 'v4', auth: getAuth() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${TAB}!A2:A1000`,
  });
  const rows = res.data.values || [];
  const rowIndex = rows.findIndex(r => r[0] === id);
  if (rowIndex === -1) return;
  const sheetRow = rowIndex + 2;
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `${TAB}!A${sheetRow}:K${sheetRow}`,
  });
}
