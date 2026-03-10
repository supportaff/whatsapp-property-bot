import { config } from './config';
import { Listing } from './sheets';

export const msg = {
  welcome: () => {
    const types = config.businessTypes
      .map((t, i) => `${i + 1}\ufe0f\u20e3 ${t}`)
      .join('\n');
    return (
      `${config.businessLogo} Welcome to *${config.businessName}*!\n` +
      `_${config.businessTagline}_\n\n` +
      `I'll help you find the perfect listing in seconds. \u23f1\ufe0f\n\n` +
      `What are you looking for?\n\n${types}\n\n` +
      `Reply with a number (1\u2013${config.businessTypes.length})`
    );
  },

  chooseLocation: () => {
    const locs = config.businessLocations
      .map((l, i) => `${i + 1}\ufe0f\u20e3 ${l}`)
      .join('\n');
    const anyNum = config.businessLocations.length + 1;
    return `\ud83d\udccd Which area in *${config.businessCity}* do you prefer?\n\n${locs}\n${anyNum}\ufe0f\u20e3 Any Location\n\nReply with a number`;
  },

  // ── Budget shortcut menu instead of typing raw numbers ────────────────────
  askBudget: () =>
    `\ud83d\udcb0 Select your *budget range*:\n\n` +
    `1\ufe0f\u20e3 Below \u20b930 Lakhs\n` +
    `2\ufe0f\u20e3 \u20b930L \u2013 \u20b960L\n` +
    `3\ufe0f\u20e3 \u20b960L \u2013 \u20b91 Crore\n` +
    `4\ufe0f\u20e3 \u20b91 Crore \u2013 \u20b92 Crore\n` +
    `5\ufe0f\u20e3 Above \u20b92 Crore\n` +
    `6\ufe0f\u20e3 Enter manually\n\n` +
    `Reply with a number (1\u20136)`,

  askMinBudget: () =>
    `\ud83d\udcb0 Enter your *minimum budget* in \u20b9:\n\nExample: *500000* for \u20b95 Lakhs`,

  askMaxBudget: () =>
    `\ud83d\udcb0 Now enter your *maximum budget* in \u20b9:`,

  searching: () =>
    `\ud83d\udd0d Searching listings for you... Please wait.`,

  noResults: (min: number, max: number) =>
    `\ud83d\ude14 No listings found between *\u20b9${min.toLocaleString()}* and *\u20b9${max.toLocaleString()}* in your preferred area.\n\nType *hi* to search again with different criteria.`,

  // Text summary of a single listing (sent before image)
  listingCard: (item: Listing, index: number) =>
    `*${index + 1}\ufe0f\u20e3 ${item.title}*\n` +
    `\ud83d\udccd ${item.location}\n` +
    `\ud83d\udcb5 \u20b9${item.price.toLocaleString()}\n` +
    `\ud83d\udccb ${item.details}\n` +
    `\ud83d\udc64 Agent: ${item.agentName} | \ud83d\udcde ${item.agentNumber.replace('@c.us', '')}`,

  resultsHeader: (count: number) =>
    `\u2705 Found *${count} listing${count > 1 ? 's' : ''}* matching your budget:\n`,

  resultsFooter: (count: number) =>
    `\ud83d\udc49 Interested in a *site visit*? Reply with the listing number (e.g. *1*${count > 1 ? `, *2*` : ''})\n\nOr type *hi* to search again.`,

  noImageAvailable: (index: number) =>
    `\ud83d\udcf8 No photo available for listing ${index + 1}.`,

  askVisitSlot: () =>
    `\ud83d\udcc5 When would you like to visit?\n\n` +
    `1\ufe0f\u20e3 Tomorrow 10 AM\n` +
    `2\ufe0f\u20e3 Tomorrow 3 PM\n` +
    `3\ufe0f\u20e3 This Saturday 11 AM\n` +
    `4\ufe0f\u20e3 This Sunday 11 AM\n\n` +
    `Reply with 1, 2, 3, or 4`,

  visitConfirmed: (listing: Listing, slot: string) =>
    `\u2705 *Visit Confirmed!*\n\n` +
    `${config.businessLogo} *${config.businessName}*\n\n` +
    `\ud83c\udfe0 Property: ${listing.title}\n` +
    `\ud83d\udccd Location: ${listing.location}\n` +
    `\ud83d\udcc5 Date & Time: ${slot}\n` +
    `\ud83d\udc64 Agent: ${listing.agentName}\n` +
    `\ud83d\udcde ${listing.agentNumber.replace('@c.us', '')} will meet you there.\n\n` +
    `\u23f0 You will receive a reminder before your visit.\n\n` +
    (config.businessWebsite ? `\ud83c\udf10 ${config.businessWebsite}\n` : '') +
    `\nTo *reschedule* or *cancel*, type that word anytime.`,

  // ── Reschedule / Cancel ──────────────────────────────────────────────
  askRescheduleSlot: () =>
    `\ud83d\udd04 *Reschedule Visit*\n\nPlease choose a new time slot:\n\n` +
    `1\ufe0f\u20e3 Tomorrow 10 AM\n` +
    `2\ufe0f\u20e3 Tomorrow 3 PM\n` +
    `3\ufe0f\u20e3 This Saturday 11 AM\n` +
    `4\ufe0f\u20e3 This Sunday 11 AM\n\n` +
    `Reply with 1, 2, 3, or 4`,

  rescheduleConfirmed: (listing: Listing, newSlot: string) =>
    `\u2705 *Visit Rescheduled!*\n\n` +
    `\ud83c\udfe0 ${listing.title}\n` +
    `\ud83d\udcc5 New Time: *${newSlot}*\n` +
    `\ud83d\udc64 Agent: ${listing.agentName} – ${listing.agentNumber.replace('@c.us', '')}\n\n` +
    `We'll send you a reminder before the visit. \ud83d\ude4f`,

  cancelConfirmed: (listing: Listing) =>
    `\u274c *Visit Cancelled*\n\n` +
    `Your visit to *${listing.title}* has been cancelled.\n\n` +
    `Type *hi* to search for properties again. \ud83d\ude4f`,

  agentReschedule: (phone: string, listing: Listing, oldSlot: string, newSlot: string) =>
    `\ud83d\udd04 *Visit Rescheduled \u2014 ${config.businessName}*\n\n` +
    `\ud83d\udc64 Customer: +${phone}\n` +
    `\ud83c\udfe0 Property: ${listing.title}\n` +
    `\u274c Old Slot: ${oldSlot}\n` +
    `\u2705 New Slot: ${newSlot}\n\n` +
    `_Please confirm with the customer._`,

  agentCancel: (phone: string, listing: Listing, slot: string) =>
    `\u274c *Visit Cancelled \u2014 ${config.businessName}*\n\n` +
    `\ud83d\udc64 Customer: +${phone}\n` +
    `\ud83c\udfe0 Property: ${listing.title}\n` +
    `\ud83d\udcc5 Was Scheduled: ${slot}\n\n` +
    `_The customer cancelled their visit._`,

  visitReminder: (listing: Listing, slot: string) =>
    `\u23f0 *Visit Reminder!*\n\n` +
    `${config.businessLogo} *${config.businessName}*\n\n` +
    `This is a friendly reminder about your upcoming site visit:\n\n` +
    `\ud83c\udfe0 *${listing.title}*\n` +
    `\ud83d\udccd ${listing.location}\n` +
    `\ud83d\udcc5 ${slot}\n` +
    `\ud83d\udc64 Agent: ${listing.agentName} \u2013 ${listing.agentNumber.replace('@c.us', '')}\n\n` +
    `See you there! \ud83d\ude4f\nTo reschedule or cancel, type that word.`,

  agentAlert: (phone: string, listing: Listing, slot: string, budget: string) =>
    `\ud83d\udd14 *New Lead Alert \u2014 ${config.businessName}*\n\n` +
    `\ud83d\udc64 Customer: +${phone}\n` +
    `\ud83c\udfe0 Interested In: ${listing.title}\n` +
    `\ud83d\udccd ${listing.location}\n` +
    `\ud83d\udcb0 Budget: ${budget}\n` +
    `\ud83d\udcc5 Site Visit: ${slot}\n\n` +
    `_Contact the customer directly on WhatsApp or call them._`,

  invalidInput: () =>
    `\u274c I didn't understand that. Please reply with one of the options shown above.`,
};

// ── Budget shortcut ranges ────────────────────────────────────────────────
export const budgetShortcuts: Record<string, { min: number; max: number } | 'manual'> = {
  '1': { min: 0,         max: 3000000   },  // Below 30L
  '2': { min: 3000000,   max: 6000000   },  // 30L – 60L
  '3': { min: 6000000,   max: 10000000  },  // 60L – 1Cr
  '4': { min: 10000000,  max: 20000000  },  // 1Cr – 2Cr
  '5': { min: 20000000,  max: 999999999 },  // Above 2Cr
  '6': 'manual',                             // Enter manually
};

export const visitSlots: Record<string, string> = {
  '1': 'Tomorrow 10:00 AM',
  '2': 'Tomorrow 3:00 PM',
  '3': 'This Saturday 11:00 AM',
  '4': 'This Sunday 11:00 AM',
};

export function getLocationMap(): Record<string, string> {
  const map: Record<string, string> = {};
  config.businessLocations.forEach((loc, i) => {
    map[String(i + 1)] = loc.toLowerCase();
  });
  map[String(config.businessLocations.length + 1)] = 'any';
  return map;
}

export function getTypeMap(): Record<string, string> {
  const map: Record<string, string> = {};
  config.businessTypes.forEach((type, i) => {
    map[String(i + 1)] = type.toLowerCase();
  });
  return map;
}
