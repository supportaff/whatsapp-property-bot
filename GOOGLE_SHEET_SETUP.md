# Google Sheet Setup Guide

## Sheet 1: Listings

Create a tab named **Listings** with these exact columns:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| ID | Type | Title | Location | Price | Details | Agent Name | Agent WhatsApp |

### Example Rows:

| ID | Type | Title | Location | Price | Details | Agent Name | Agent WhatsApp |
|---|---|---|---|---|---|---|---|
| 1 | real estate | 3BHK Flat – Sholinganallur | OMR, Chennai | 6500000 | 1350 sqft, Car Parking, Ready to Move | Suresh Kumar | 919876543210@c.us |
| 2 | real estate | 2BHK Apartment – Velachery | Velachery, Chennai | 5200000 | 980 sqft, Semi-Furnished | Priya Raj | 919812345678@c.us |
| 3 | car | Toyota Innova 2022 | Anna Nagar, Chennai | 1800000 | Diesel, 45000 km, Single Owner | Karthik | 919900112233@c.us |

### Important:
- **Type** must contain `real estate` or `car` (lowercase)
- **Price** must be a plain number (no ₹ or commas)
- **Agent WhatsApp** format: `91XXXXXXXXXX@c.us` (country code + number + @c.us)

---

## Sheet 2: Leads

Create a tab named **Leads** with these headers in Row 1:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Timestamp | Customer Name | Phone | Property Type | Location | Budget | Interested In | Visit Date | Status |

Leave the rest of the rows empty — the bot will auto-fill them.

---

## Google Cloud Setup Steps

1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable **Google Sheets API**
4. Go to **IAM & Admin → Service Accounts**
5. Create a service account, download the JSON key
6. Copy `client_email` → paste into `GOOGLE_SERVICE_ACCOUNT_EMAIL` in `.env`
7. Copy `private_key` → paste into `GOOGLE_PRIVATE_KEY` in `.env`
8. **Share your Google Sheet** with the service account email (Editor access)
