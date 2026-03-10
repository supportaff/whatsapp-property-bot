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

// In-memory reminder store (persists as long as process is running)
const reminders: ScheduledReminder[] = [];

// Parse visit slot string into a future Date
function parseSlotToDate(slot: string): Date {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  // Find next Saturday
  const saturday = new Date(now);
  const daysUntilSat = (6 - now.getDay() + 7) % 7 || 7;
  saturday.setDate(now.getDate() + daysUntilSat);

  // Find next Sunday
  const sunday = new Date(now);
  const daysUntilSun = (7 - now.getDay()) % 7 || 7;
  sunday.setDate(now.getDate() + daysUntilSun);

  const slotMap: Record<string, { date: Date; hour: number; minute: number }> = {
    'Tomorrow 10:00 AM': { date: tomorrow, hour: 10, minute: 0 },
    'Tomorrow 3:00 PM':  { date: tomorrow, hour: 15, minute: 0 },
    'This Saturday 11:00 AM': { date: saturday, hour: 11, minute: 0 },
    'This Sunday 11:00 AM':   { date: sunday,   hour: 11, minute: 0 },
  };

  const matched = slotMap[slot];
  if (!matched) {
    // fallback: 24 hours from now
    const fallback = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return fallback;
  }

  const visitDate = new Date(matched.date);
  visitDate.setHours(matched.hour, matched.minute, 0, 0);
  return visitDate;
}

// Schedule a reminder for a customer
export function scheduleReminder(
  userId: string,
  listing: Listing,
  slot: string
): void {
  if (!config.remindersEnabled) return;

  const visitDateTime = parseSlotToDate(slot);
  const reminderTime = new Date(
    visitDateTime.getTime() - config.reminderHoursBefore * 60 * 60 * 1000
  );

  // Only schedule if reminder time is in the future
  if (reminderTime <= new Date()) {
    console.log(`⚠️ Reminder time already passed for ${userId}, skipping.`);
    return;
  }

  reminders.push({
    userId,
    listing,
    slot,
    visitDateTime,
    reminderTime,
    sent: false,
  });

  console.log(
    `📅 Reminder scheduled for ${userId} at ${reminderTime.toLocaleString('en-IN')} (${config.reminderHoursBefore}h before visit)`
  );
}

// Start the reminder poller — checks every minute
export function startReminderPoller(client: Client): void {
  if (!config.remindersEnabled) {
    console.log('🔕 Reminders are disabled (REMINDERS_ENABLED=false)');
    return;
  }

  console.log('⏰ Reminder poller started (checks every 60 seconds)');

  setInterval(async () => {
    const now = new Date();

    for (const reminder of reminders) {
      if (!reminder.sent && now >= reminder.reminderTime) {
        try {
          await client.sendMessage(
            reminder.userId,
            msg.visitReminder(reminder.listing, reminder.slot)
          );
          reminder.sent = true;
          console.log(`✅ Reminder sent to ${reminder.userId}`);
        } catch (err) {
          console.error(`❌ Failed to send reminder to ${reminder.userId}:`, err);
        }
      }
    }

    // Clean up sent reminders older than 48 hours
    const cutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const before = reminders.length;
    reminders.splice(
      0,
      reminders.length,
      ...reminders.filter((r) => !r.sent || r.visitDateTime > cutoff)
    );
    if (reminders.length < before) {
      console.log(`🧹 Cleaned up ${before - reminders.length} old reminders`);
    }
  }, 60 * 1000); // every 60 seconds
}
