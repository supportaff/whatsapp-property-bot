import { Client } from 'whatsapp-web.js';
import { msg } from './messages';
import { config } from './config';
import { Listing } from './sheets';

export interface ScheduledReminder {
  userId: string;
  listing: Listing;
  slot: string;
  visitDateTime: Date;
  reminderTime: Date;
  sent: boolean;
}

const reminders = new Map<string, ScheduledReminder>(); // keyed by userId

function parseSlotToDate(slot: string): Date {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const saturday = new Date(now);
  saturday.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7 || 7));

  const sunday = new Date(now);
  sunday.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));

  const slotMap: Record<string, { date: Date; hour: number; minute: number }> = {
    'Tomorrow 10:00 AM':      { date: tomorrow,  hour: 10, minute: 0 },
    'Tomorrow 3:00 PM':       { date: tomorrow,  hour: 15, minute: 0 },
    'This Saturday 11:00 AM': { date: saturday,  hour: 11, minute: 0 },
    'This Sunday 11:00 AM':   { date: sunday,    hour: 11, minute: 0 },
  };

  const matched = slotMap[slot];
  if (!matched) return new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const d = new Date(matched.date);
  d.setHours(matched.hour, matched.minute, 0, 0);
  return d;
}

export function scheduleReminder(userId: string, listing: Listing, slot: string): void {
  if (!config.remindersEnabled) return;

  const visitDateTime = parseSlotToDate(slot);
  const reminderTime = new Date(
    visitDateTime.getTime() - config.reminderHoursBefore * 60 * 60 * 1000
  );

  if (reminderTime <= new Date()) {
    console.log(`\u26a0\ufe0f Reminder time already passed for ${userId}`);
    return;
  }

  reminders.set(userId, { userId, listing, slot, visitDateTime, reminderTime, sent: false });
  console.log(`\ud83d\udcc5 Reminder set for ${userId} at ${reminderTime.toLocaleString('en-IN')}`);
}

// Cancel a reminder (used on reschedule or cancel)
export function cancelReminder(userId: string): void {
  if (reminders.has(userId)) {
    reminders.delete(userId);
    console.log(`\ud83d\uddd1\ufe0f Reminder cancelled for ${userId}`);
  }
}

export function startReminderPoller(client: Client): void {
  if (!config.remindersEnabled) {
    console.log('\ud83d\udd15 Reminders disabled');
    return;
  }
  console.log('\u23f0 Reminder poller started (every 60s)');

  setInterval(async () => {
    const now = new Date();
    for (const [userId, reminder] of reminders.entries()) {
      if (!reminder.sent && now >= reminder.reminderTime) {
        try {
          await client.sendMessage(userId, msg.visitReminder(reminder.listing, reminder.slot));
          reminder.sent = true;
          console.log(`\u2705 Reminder sent to ${userId}`);
        } catch (err) {
          console.error(`\u274c Reminder failed for ${userId}:`, err);
        }
      }
      // Clean up sent reminders older than 48h
      if (reminder.sent && now.getTime() - reminder.visitDateTime.getTime() > 48 * 60 * 60 * 1000) {
        reminders.delete(userId);
      }
    }
  }, 60 * 1000);
}
