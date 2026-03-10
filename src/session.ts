import { Listing } from './sheets';

export type Step =
  | 'start'
  | 'choose_type'
  | 'choose_location'
  | 'choose_budget'       // new: budget shortcut menu
  | 'min_budget'          // only reached if manual entry chosen
  | 'max_budget'
  | 'show_results'
  | 'choose_visit'
  | 'reschedule'          // new: reschedule flow
  | 'done';

export interface Session {
  step: Step;
  type?: string;
  location?: string;
  minBudget?: number;
  maxBudget?: number;
  listings?: Listing[];
  chosenListing?: Listing;
  confirmedSlot?: string;  // saved so reschedule/cancel can reference it
  phone?: string;
}

const sessions = new Map<string, Session>();

export function getSession(userId: string): Session {
  if (!sessions.has(userId)) sessions.set(userId, { step: 'start' });
  return sessions.get(userId)!;
}

export function setSession(userId: string, data: Partial<Session>): void {
  const existing = getSession(userId);
  sessions.set(userId, { ...existing, ...data });
}

export function clearSession(userId: string): void {
  sessions.delete(userId);
}
