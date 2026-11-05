import { NewsCategory } from '../news/news.model';

export type SubscriptionFrequency = 'instant' | 'weekly';

export interface SubscriptionPreferences {
  frequency: SubscriptionFrequency;
  categories: NewsCategory[];
  organization_ids: number[];
}

export interface Subscription extends SubscriptionPreferences {
  email: string;
  confirmed: boolean;
  active: boolean;
  id?: number;
  manage_token?: string;
  message?: string;
}

export interface SubscriptionStats {
  active: number;
  instant: number;
  weekly: number;
  pending: number;
  unsubscribed: number;
  unsubscribed_30d: number;
  sent_7d: number;
  sent_30d: number;
  failed_30d: number;
  last_sent_at: string | null;
  hourly_limit: number;
}

export const FREQUENCY_OPTIONS: { value: SubscriptionFrequency; label: string; hint: string }[] = [
  { value: 'weekly', label: 'Nedeljni pregled', hint: 'Jedan mejl ponedeljkom ujutru sa svim vestima koje pratite.' },
  { value: 'instant', label: 'Odmah', hint: 'Mejl čim se objavi istaknuta vest: važan rok, seminar, takmičenje.' },
];
