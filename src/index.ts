import { Client, LocalAuth, Message, MessageMedia } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { fetchListings, saveLead, Listing } from './sheets';
import { getSession, setSession, clearSession } from './session';
import { msg, visitSlots, budgetShortcuts, getLocationMap, getTypeMap } from './messages';
import { config } from './config';
import { scheduleReminder, cancelReminder, startReminderPoller } from './reminder';

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] },
});

client.on('qr', (qr: string) => {
  console.log('\n\ud83d\udcf1 Scan this QR with WhatsApp:\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log(`\u2705 ${config.businessName} Bot is ready!`);
  startReminderPoller(client);
});

client.on('auth_failure', () =>
  console.error('\u274c Auth failed. Delete .wwebjs_auth and retry.')
);

// ── Helper: send listing cards with images ──────────────────────────────
async function sendListingsWithImages(
  message: Message,
  listings: Listing[]
): Promise<void> {
  await message.reply(msg.resultsHeader(listings.length));

  for (let i = 0; i < listings.length; i++) {
    const item = listings[i];

    await client.sendMessage(message.from, msg.listingCard(item, i));

    if (item.imageUrl) {
      try {
        const media = await MessageMedia.fromUrl(item.imageUrl, {
          unsafeMime: true,
        });
        await client.sendMessage(message.from, media, {
          caption: `\ud83d\udcf8 Photo: ${item.title}`,
        });
      } catch (err) {
        console.error(`Image load failed for listing ${item.id}:`, err);
        await client.sendMessage(message.from, msg.noImageAvailable(i));
      }
    }
  }

  await client.sendMessage(message.from, msg.resultsFooter(listings.length));
}

// ── Main message handler ─────────────────────────────────────────────
client.on('message', async (message: Message) => {
  if (message.from.includes('@g.us')) return;

  const userId = message.from;
  const text = message.body.trim();
  const lower = text.toLowerCase();
  const session = getSession(userId);
  const locationMap = getLocationMap();
  const typeMap = getTypeMap();

  try {
    // ── Global: reschedule ──────────────────────────────────────────
    if (lower === 'reschedule' && session.chosenListing && session.confirmedSlot) {
      setSession(userId, { step: 'reschedule' });
      await message.reply(msg.askRescheduleSlot());
      return;
    }

    // ── Global: cancel ──────────────────────────────────────────────
    if (lower === 'cancel' && session.chosenListing && session.confirmedSlot) {
      const listing = session.chosenListing;
      const oldSlot = session.confirmedSlot;
      await message.reply(msg.cancelConfirmed(listing));
      const agentNumber = listing.agentNumber || config.defaultAgentNumber;
      if (agentNumber) {
        await client.sendMessage(
          agentNumber,
          msg.agentCancel(userId.replace('@c.us', ''), listing, oldSlot)
        );
      }
      cancelReminder(userId);
      clearSession(userId);
      return;
    }

    // ── Restart ─────────────────────────────────────────────────────
    if (['hi', 'hello', 'start', 'hey'].includes(lower)) {
      clearSession(userId);
      setSession(userId, { step: 'choose_type', phone: userId });
      await message.reply(msg.welcome());
      return;
    }

    // ── STEP: reschedule ────────────────────────────────────────
    if (session.step === 'reschedule') {
      const newSlot = visitSlots[text];
      if (!newSlot) { await message.reply(msg.invalidInput()); return; }
      const listing = session.chosenListing!;
      const oldSlot = session.confirmedSlot!;
      await message.reply(msg.rescheduleConfirmed(listing, newSlot));
      const agentNumber = listing.agentNumber || config.defaultAgentNumber;
      if (agentNumber) {
        await client.sendMessage(
          agentNumber,
          msg.agentReschedule(userId.replace('@c.us', ''), listing, oldSlot, newSlot)
        );
      }
      cancelReminder(userId);
      scheduleReminder(userId, listing, newSlot);
      setSession(userId, { confirmedSlot: newSlot, step: 'done' });
      return;
    }

    // ── STEP: choose_type ───────────────────────────────────────
    if (session.step === 'choose_type') {
      const type = typeMap[text];
      if (!type) { await message.reply(msg.invalidInput()); return; }
      setSession(userId, { step: 'choose_location', type });
      await message.reply(msg.chooseLocation());
      return;
    }

    // ── STEP: choose_location ──────────────────────────────────
    if (session.step === 'choose_location') {
      const location = locationMap[text];
      if (!location) { await message.reply(msg.invalidInput()); return; }
      setSession(userId, { step: 'choose_budget', location });
      await message.reply(msg.askBudget());
      return;
    }

    // ── STEP: choose_budget ─────────────────────────────────────
    if (session.step === 'choose_budget') {
      const shortcut = budgetShortcuts[text];
      if (!shortcut) { await message.reply(msg.invalidInput()); return; }

      if (shortcut === 'manual') {
        setSession(userId, { step: 'min_budget' });
        await message.reply(msg.askMinBudget());
      } else {
        setSession(userId, { step: 'max_budget', minBudget: shortcut.min, maxBudget: shortcut.max });
        await message.reply(msg.searching());
        const listings = await fetchListings(session.type!, session.location!, shortcut.min, shortcut.max);
        if (listings.length === 0) {
          await message.reply(msg.noResults(shortcut.min, shortcut.max));
          clearSession(userId);
          return;
        }
        setSession(userId, { step: 'show_results', listings });
        await sendListingsWithImages(message, listings);
      }
      return;
    }

    // ── STEP: min_budget ─────────────────────────────────────────
    if (session.step === 'min_budget') {
      const amount = parseInt(text.replace(/[^0-9]/g, ''));
      if (isNaN(amount) || amount < 0) {
        await message.reply('Please enter a valid number like *500000*');
        return;
      }
      setSession(userId, { step: 'max_budget', minBudget: amount });
      await message.reply(msg.askMaxBudget());
      return;
    }

    // ── STEP: max_budget ─────────────────────────────────────────
    if (session.step === 'max_budget') {
      const maxBudget = parseInt(text.replace(/[^0-9]/g, ''));
      if (isNaN(maxBudget) || maxBudget <= 0) {
        await message.reply('Please enter a valid number');
        return;
      }
      if (maxBudget <= (session.minBudget || 0)) {
        await message.reply('\u26a0\ufe0f Max must be greater than min. Try again.');
        return;
      }
      await message.reply(msg.searching());
      const listings = await fetchListings(session.type!, session.location!, session.minBudget!, maxBudget);
      setSession(userId, { maxBudget });
      if (listings.length === 0) {
        await message.reply(msg.noResults(session.minBudget!, maxBudget));
        clearSession(userId);
        return;
      }
      setSession(userId, { step: 'show_results', listings });
      await sendListingsWithImages(message, listings);
      return;
    }

    // ── STEP: show_results ────────────────────────────────────────
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

    // ── STEP: choose_visit ───────────────────────────────────────
    if (session.step === 'choose_visit') {
      const slot = visitSlots[text];
      if (!slot) { await message.reply(msg.invalidInput()); return; }
      const listing = session.chosenListing!;
      const budget = `\u20b9${session.minBudget?.toLocaleString()} \u2013 \u20b9${session.maxBudget?.toLocaleString()}`;
      await message.reply(msg.visitConfirmed(listing, slot));
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
      const agentNumber = listing.agentNumber || config.defaultAgentNumber;
      if (agentNumber) {
        await client.sendMessage(agentNumber, msg.agentAlert(userId.replace('@c.us', ''), listing, slot, budget));
      }
      scheduleReminder(userId, listing, slot);
      setSession(userId, { confirmedSlot: slot, step: 'done' });
      return;
    }

    // ── Default ──────────────────────────────────────────────────
    await message.reply(`Type *hi* to start searching! ${config.businessLogo}`);

  } catch (error) {
    console.error('Bot error:', error);
    await message.reply('\u26a0\ufe0f Something went wrong. Type *hi* to try again.');
    clearSession(userId);
  }
});

client.initialize();
