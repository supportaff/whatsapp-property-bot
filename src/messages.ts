import { config } from './config';
import { Listing } from './sheets';

export const msg = {
  welcome: () =>
    `👋 Welcome to *${config.businessName}*!\n\nI'll help you find the perfect property in seconds. 🏠🚗\n\nWhat are you looking for?\n\n1️⃣ Real Estate (Flat / House / Plot)\n2️⃣ Car\n\nReply with *1* or *2*`,

  chooseLocation: () =>
    `📍 Which area do you prefer?\n\n1️⃣ Anna Nagar\n2️⃣ OMR\n3️⃣ Velachery\n4️⃣ Porur\n5️⃣ Tambaram\n6️⃣ Any Location\n\nReply with a number (1–6)`,

  askMinBudget: () =>
    `💰 What is your *minimum budget* in ₹?\n\nType a number, e.g.\n• *500000* for ₹5 Lakhs\n• *2000000* for ₹20 Lakhs`,

  askMaxBudget: () =>
    `💰 And your *maximum budget* in ₹?`,

  searching: () =>
    `🔍 Searching listings for you... Please wait a moment.`,

  noResults: (min: number, max: number) =>
    `😔 No listings found between *₹${min.toLocaleString()}* and *₹${max.toLocaleString()}* in your preferred area.\n\nType *hi* to search again with different criteria.`,

  results: (listings: Listing[]) => {
    let text = `✅ Found *${listings.length} listing${listings.length > 1 ? 's' : ''}* matching your budget:\n\n`;
    listings.forEach((item, i) => {
      text += `*${i + 1}️⃣ ${item.title}*\n`;
      text += `📍 ${item.location}\n`;
      text += `💵 ₹${item.price.toLocaleString()}\n`;
      text += `📋 ${item.details}\n`;
      text += `👤 Agent: ${item.agentName} | 📞 ${item.agentNumber.replace('@c.us', '')}\n\n`;
    });
    text += `👉 Interested in a *site visit*? Reply with the listing number (e.g. *1*, *2*, *3*)\n\nOr type *hi* to search again.`;
    return text;
  },

  askVisitSlot: () =>
    `📅 When would you like to visit?\n\n1️⃣ Tomorrow 10 AM\n2️⃣ Tomorrow 3 PM\n3️⃣ This Saturday 11 AM\n4️⃣ This Sunday 11 AM\n\nReply with 1, 2, 3, or 4`,

  visitConfirmed: (listing: Listing, slot: string) =>
    `✅ *Visit Confirmed!*\n\n🏠 Property: ${listing.title}\n📍 Location: ${listing.location}\n📅 Date & Time: ${slot}\n👤 Agent: ${listing.agentName}\n📞 ${listing.agentNumber.replace('@c.us', '')} will meet you there.\n\nWe'll send you a reminder the evening before. 🙏\n\nType *hi* to search for more properties.`,

  agentAlert: (phone: string, listing: Listing, slot: string, budget: string) =>
    `🔔 *New Lead Alert — ${config.businessName}*\n\n👤 Customer: ${phone}\n🏠 Interested In: ${listing.title}\n📍 ${listing.location}\n💰 Budget: ${budget}\n📅 Site Visit: ${slot}\n\n_Reply directly to the customer on WhatsApp._`,

  invalidInput: () =>
    `❌ I didn't understand that. Please reply with one of the options shown above.`,

  restart: () =>
    `🔄 Let's start over! Type *hi* to begin a new search.`,
};

export const visitSlots: Record<string, string> = {
  '1': 'Tomorrow 10:00 AM',
  '2': 'Tomorrow 3:00 PM',
  '3': 'This Saturday 11:00 AM',
  '4': 'This Sunday 11:00 AM',
};

export const locationMap: Record<string, string> = {
  '1': 'anna nagar',
  '2': 'omr',
  '3': 'velachery',
  '4': 'porur',
  '5': 'tambaram',
  '6': 'any',
};

export const typeMap: Record<string, string> = {
  '1': 'real estate',
  '2': 'car',
};
