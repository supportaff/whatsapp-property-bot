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

  askMinBudget: () =>
    `\ud83d\udcb0 What is your *minimum budget* in \u20b9?\n\nType a number, e.g.\n\u2022 *500000* for \u20b95 Lakhs\n\u2022 *2000000* for \u20b920 Lakhs`,

  askMaxBudget: () =>
    `\ud83d\udcb0 And your *maximum budget* in \u20b9?`,

  searching: () =>
    `\ud83d\udd0d Searching listings for you... Please wait.`,

  noResults: (min: number, max: number) =>
    `\ud83d\ude14 No listings found between *\u20b9${min.toLocaleString()}* and *\u20b9${max.toLocaleString()}* in your preferred area.\n\nType *hi* to search again with different criteria.`,

  results: (listings: Listing[]) => {
    let text = `\u2705 Found *${listings.length} listing${listings.length > 1 ? 's' : ''}* matching your budget:\n\n`;
    listings.forEach((item, i) => {
      text += `*${i + 1}\ufe0f\u20e3 ${item.title}*\n`;
      text += `\ud83d\udccd ${item.location}\n`;
      text += `\ud83d\udcb5 \u20b9${item.price.toLocaleString()}\n`;
      text += `\ud83d\udccb ${item.details}\n`;
      text += `\ud83d\udc64 Agent: ${item.agentName} | \ud83d\udcde ${item.agentNumber.replace('@c.us', '')}\n\n`;
    });
    text += `\ud83d\udc49 Interested in a *site visit*? Reply with the listing number (e.g. *1*, *2*)\n\nOr type *hi* to search again.`;
    return text;
  },

  askVisitSlot: () =>
    `\ud83d\udcc5 When would you like to visit?\n\n1\ufe0f\u20e3 Tomorrow 10 AM\n2\ufe0f\u20e3 Tomorrow 3 PM\n3\ufe0f\u20e3 This Saturday 11 AM\n4\ufe0f\u20e3 This Sunday 11 AM\n\nReply with 1, 2, 3, or 4`,

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
    `\nType *hi* to search for more properties.`,

  visitReminder: (listing: Listing, slot: string) =>
    `\u23f0 *Visit Reminder!*\n\n` +
    `${config.businessLogo} *${config.businessName}*\n\n` +
    `This is a friendly reminder about your upcoming site visit:\n\n` +
    `\ud83c\udfe0 *${listing.title}*\n` +
    `\ud83d\udccd ${listing.location}\n` +
    `\ud83d\udcc5 ${slot}\n` +
    `\ud83d\udc64 Agent: ${listing.agentName} – ${listing.agentNumber.replace('@c.us', '')}\n\n` +
    `See you there! \ud83d\ude4f If you need to reschedule, type *hi*.`,

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

export const visitSlots: Record<string, string> = {
  '1': 'Tomorrow 10:00 AM',
  '2': 'Tomorrow 3:00 PM',
  '3': 'This Saturday 11:00 AM',
  '4': 'This Sunday 11:00 AM',
};

// Dynamically build location map from config
export function getLocationMap(): Record<string, string> {
  const map: Record<string, string> = {};
  config.businessLocations.forEach((loc, i) => {
    map[String(i + 1)] = loc.toLowerCase();
  });
  map[String(config.businessLocations.length + 1)] = 'any';
  return map;
}

// Dynamically build type map from config
export function getTypeMap(): Record<string, string> {
  const map: Record<string, string> = {};
  config.businessTypes.forEach((type, i) => {
    map[String(i + 1)] = type.toLowerCase();
  });
  return map;
}
