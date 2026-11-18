export type PrayerCategory =
  | 'peticion'
  | 'gratitud'
  | 'intercesion'
  | 'guia'
  | 'perdon';

export type PrayerStatus = 'active' | 'answered';

export interface PrayerNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface Prayer {
  id: string;
  title: string;
  body: string;
  category: PrayerCategory;
  status: PrayerStatus;
  isPinned?: boolean;
  verse?: string;
  answerNote?: string;
  answeredAt?: string;
  notes: PrayerNote[];
  createdAt: string;
  updatedAt: string;
}

export type ThemeMode = 'dark' | 'light';

export interface AppSettings {
  theme: ThemeMode;
  discreetMode: boolean;
  pinHash: string | null;
}

export interface PrayerBackup {
  app: 'sagrario';
  version: 1;
  exportedAt: string;
  prayers: Prayer[];
}

export interface PrayerFilterOptions {
  status: 'all' | PrayerStatus;
  category: 'all' | PrayerCategory;
  search: string;
}

export interface PrayerStats {
  total: number;
  active: number;
  answered: number;
  gratitudeCount: number;
}
