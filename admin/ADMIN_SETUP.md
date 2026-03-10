# Admin Dashboard Setup

## 1. Create Admin Google Sheet

Create a NEW Google Sheet (separate from client sheets) and name it `Bot Admin`.

Add a tab called `Clients` with these headers in Row 1:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| id | name | phone | plan | status | fee | startDate | renewalDate | sheetId | agentNumber | totalLeads | totalMessages | lastActive | notes |

## 2. Share with Service Account
Share the sheet with your service account email as Editor.

## 3. Setup .env
```
cd admin
cp .env.example .env
nano .env
```

Fill in:
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_strong_password
ADMIN_SHEET_ID=your_new_admin_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY="..."
```

## 4. Run Locally
```bash
cd admin
npm install
npm run dev
```
Open: http://localhost:3001

## 5. Deploy on Vercel (Free)
- Push to GitHub (already done)
- Go to vercel.com → Import repo
- Set root directory to `admin`
- Add environment variables
- Deploy!

## 6. What You Can Do
- ✅ Add / Edit / Remove clients
- ✅ Track plan, status, renewal date, monthly fee
- ✅ See total leads per client
- ✅ Direct link to each client's Google Sheet
- ✅ Search and filter clients
- ✅ See total monthly revenue
- ✅ Password protected — only you can access
