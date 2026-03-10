# 🏠 WhatsApp Property & Car Listing Bot

A WhatsApp bot for real estate agents and car dealers. Customers chat, enter their budget, and the bot fetches matching listings live from Google Sheets — then notifies the assigned agent automatically.

---

## ✨ Features

- 🏠 Real Estate + 🚗 Car listing support
- 📍 Location preference filtering
- 💰 Budget-based search (min–max)
- 📊 Live Google Sheets integration
- 👤 Auto lead saving to Sheets
- 🔔 Instant WhatsApp alert to assigned agent
- 📅 Site visit booking
- ♻️ Session management per customer

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/supportaff/whatsapp-property-bot
cd whatsapp-property-bot
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
# Fill in your values in .env
```

See `.env.example` for all required variables.

### 3. Setup Google Sheets

See [GOOGLE_SHEET_SETUP.md](./GOOGLE_SHEET_SETUP.md) for step-by-step instructions.

### 4. Run the Bot

```bash
# Development
npm run dev

# Production (build first)
npm run build
npm start
```

Scan the QR code with your WhatsApp to link the number.

---

## ⚠️ Vercel Deployment Note

> **whatsapp-web.js uses a persistent browser session (Puppeteer).**  
> Vercel is a **serverless** platform — it does NOT support persistent processes or Puppeteer reliably.

### ✅ Recommended Hosting Options:
- **Oracle Cloud Free Tier** (recommended — always free)
- **AWS Lightsail** (~$5/month)
- **Railway.app** (~$5/month, easy deployment)
- **Render.com** (free tier available)

### Deploy to Oracle Cloud / Any Linux VPS:

```bash
npm install -g pm2
npm run build
pm2 start dist/index.js --name property-bot
pm2 save
pm2 startup
```

---

## 📋 Environment Variables

| Variable | Description |
|---|---|
| `SHEET_ID` | Your Google Sheet ID from the URL |
| `SHEET_LISTINGS_TAB` | Sheet tab name for listings (default: Listings) |
| `SHEET_LEADS_TAB` | Sheet tab name for leads (default: Leads) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email from Google Cloud |
| `GOOGLE_PRIVATE_KEY` | Private key from service account JSON |
| `BUSINESS_NAME` | Your brand name shown in messages |
| `MAX_RESULTS` | Max listings to show per search (default: 5) |
| `DEFAULT_AGENT_NUMBER` | Fallback agent number if none in sheet |

---

## 🗂️ Project Structure

```
src/
├── index.ts       # Main bot entry point & message handler
├── sheets.ts      # Google Sheets fetch & lead saving
├── session.ts     # Per-user conversation state
├── messages.ts    # All bot message templates
└── config.ts      # Environment config loader
```
