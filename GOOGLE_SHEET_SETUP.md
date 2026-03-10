# Google Sheet Setup Guide

## Sheet 1: Listings

Create a tab named **Listings** with these exact columns (A to I):

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| ID | Type | Title | Location | Price | Details | Agent Name | Agent WhatsApp | Image URL |

### Example Rows:

| ID | Type | Title | Location | Price | Details | Agent Name | Agent WhatsApp | Image URL |
|---|---|---|---|---|---|---|---|---|
| 1 | real estate | 3BHK Flat – Sholinganallur | OMR, Chennai | 6500000 | 1350 sqft, Car Parking | Suresh | 919876543210@c.us | https://drive.google.com/file/d/FILE_ID/view |
| 2 | car | Toyota Innova 2022 | Anna Nagar | 1800000 | Diesel, 45000 km | Karthik | 919900112233@c.us | https://drive.google.com/file/d/FILE_ID/view |

### 📷 How to Add Property Images (Google Drive)

1. Upload the property photo to **Google Drive**
2. Right-click the file → **Share** → set to **"Anyone with the link"**
3. Copy the share link (looks like: `https://drive.google.com/file/d/1ABCxyz.../view`)
4. Paste this URL in **column I** of the Listings sheet
5. The bot will automatically convert it to a downloadable image URL

> ⚠️ **Important:** The file must be shared as "Anyone with the link" or the bot cannot download it.

### Important Rules:
- **Type** must contain `real estate` or `car` (lowercase)
- **Price** must be a plain number (no ₹ or commas) e.g. `6500000`
- **Agent WhatsApp** format: `91XXXXXXXXXX@c.us`
- **Image URL** is optional — if empty, the bot skips the photo

---

## Sheet 2: Leads

Create a tab named **Leads** with these headers in Row 1:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Timestamp | Customer Name | Phone | Property Type | Location | Budget | Interested In | Visit Date | Status |

Leave remaining rows empty — the bot auto-fills them.

---

## Google Cloud Setup

1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable **Google Sheets API**
4. Go to **IAM & Admin → Service Accounts** → Create service account
5. Download the JSON key file
6. Copy `client_email` → paste as `GOOGLE_SERVICE_ACCOUNT_EMAIL` in `.env`
7. Copy `private_key` → paste as `GOOGLE_PRIVATE_KEY` in `.env`
8. **Share your Google Sheet** with the service account email (Editor access)
