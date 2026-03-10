import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { fetchListings, saveLead } from './sheets';
import { getSession, setSession, clearSession } from './session';
import { msg, visitSlots, getLocationMap, getTypeMap } from './messages';
import { config } from './config';
import { scheduleReminder, startReminderPoller } from './reminder';

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

client.on('qr', (qr: string) => {
  console.log('\n\ud83d\udcf1 Scan this QR code with WhatsApp:\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log(`\u2705 ${config.businessName} WhatsApp Bot is ready!`);
  startReminderPoller(client);
});

client.on('auth_failure', () => {
  console.error('\u274c Authentication failed. Delete .wwebjs_auth and try again.');
});

client.on('message', async (message: Message) => {
  if (message.from.includes('@g.us')) return;

  const userId = message.from;
  const text = message.body.trim();
  const lower = text.toLowerCase();
  const session = getSession(userId);

  const locationMap = getLocationMap();
  const typeMap = getTypeMap();

  try {
    // ── Restart triggers ────────────────────────────────────────────
    if (['hi', 'hello', 'start', 'hey'].includes(lower)) {
      clearSession(userId);
      setSession(userId, { step: 'choose_type', phone: userId });
      await message.reply(msg.welcome());
      return;
    }

    // ── STEP: choose_type ─────────────────────────────────────────
    if (session.step === 'choose_type') {
      const type = typeMap[text];
      if (!type) { await message.reply(msg.invalidInput()); return; }
      setSession(userId, { step: 'choose_location', type });
      await message.reply(msg.chooseLocation());
      return;
    }

    // ── STEP: choose_location ────────────────────────────────────
    if (session.step === 'choose_location') {
      const location = locationMap[text];
      if (!location) { await message.reply(msg.invalidInput()); return; }
      setSession(userId, { step: 'min_budget', location });
      await message.reply(msg.askMinBudget());
      return;
    }

    // ── STEP: min_budget ──────────────────────────────────────────
    if (session.step === 'min_budget') {
      const amount = parseInt(text.replace(/[^0-9]/g, ''));
      if (isNaN(amount) || amount <= 0) {
        await message.reply('Please enter a valid number like *500000*');
        return;
      }
      setSession(userId, { step: 'max_budget', minBudget: amount });
      await message.reply(msg.askMaxBudget());
      return;
    }

    // ── STEP: max_budget → Fetch results ──────────────────────────
    if (session.step === 'max_budget') {
      const maxBudget = parseInt(text.replace(/[^0-9]/g, ''));
      if (isNaN(maxBudget) || maxBudget <= 0) {
        await message.reply('Please enter a valid number');
        return;
      }
      if (maxBudget <= (session.minBudget || 0)) {
        await message.reply('\u26a0\ufe0f Max budget must be greater than min. Please enter again.');
        return;
      }

      await message.reply(msg.searching());

      const listings = await fetchListings(
        session.type!,
        session.location!,
        session.minBudget!,
        maxBudget
      );

      setSession(userId, { maxBudget });

      if (listings.length === 0) {
        await message.reply(msg.noResults(session.minBudget!, maxBudget));
        clearSession(userId);
        return;
      }

      setSession(userId, { step: 'show_results', listings });
      await message.reply(msg.results(listings));
      return;
    }

    // ── STEP: show_results → Customer picks listing ───────────────
    if (session.step === 'show_results') {
      const index = parseInt(text) - 1;
      const listings = session.listings || [];
      if (isNaN(index) || index < 0 || index >= listings.length) {
        await message.reply(`Please reply with a number between 1 and ${listings.length}`);
        return;
      }
      setSession(userId, { step: 'choose_visit', chosenListing: listings[index] });
      await message.reply(msg.askVisitSlot());
      return;
    }

    // ── STEP: choose_visit → Confirm + Notify + Schedule reminder ─
    if (session.step === 'choose_visit') {
      const slot = visitSlots[text];
      if (!slot) { await message.reply(msg.invalidInput()); return; }

      const listing = session.chosenListing!;
      const budget = `\u20b9${session.minBudget?.toLocaleString()} \u2013 \u20b9${session.maxBudget?.toLocaleString()}`;

      // 1. Confirm to customer
      await message.reply(msg.visitConfirmed(listing, slot));

      // 2. Save lead to Google Sheet
      await saveLead({
        customerName: 'WhatsApp Customer',
        phone: userId.replace('@c.us', ''),
        propertyType: session.type || '',
        location: session.location || '',
        minBudget: session.minBudget || 0,
        maxBudget: session.maxBudget || 0,
        interestedIn: listing.title,
        visitDate: slot,
        timestamp: new Date().toLocaleString('en-IN'),
      });

      // 3. Notify assigned agent on WhatsApp
      const agentNumber = listing.agentNumber || config.defaultAgentNumber;
      if (agentNumber) {
        await client.sendMessage(
          agentNumber,
          msg.agentAlert(userId.replace('@c.us', ''), listing, slot, budget)
        );
      }

      // 4. Schedule follow-up reminder for customer
      scheduleReminder(userId, listing, slot);

      clearSession(userId);
      return;
    }

    // ── Default ───────────────────────────────────────────────────
    await message.reply(`Type *hi* to start searching! ${config.businessLogo}`);

  } catch (error) {
    console.error('Bot error:', error);
    await message.reply('\u26a0\ufe0f Something went wrong. Please type *hi* to try again.');
    clearSession(userId);
  }
});

client.initialize();
