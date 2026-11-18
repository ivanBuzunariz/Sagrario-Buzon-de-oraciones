import type {
  AppSettings,
  Prayer,
  PrayerBackup,
  PrayerCategory,
  PrayerFilterOptions,
  PrayerStats,
} from '../types/prayer';

export const PRAYERS_STORAGE_KEY = 'sagrario_prayers_v1';
export const SETTINGS_STORAGE_KEY = 'sagrario_settings_v1';

export const CATEGORY_LABELS: Record<PrayerCategory, string> = {
  peticion: 'Petición',
  gratitud: 'Gratitud',
  intercesion: 'Intercesión',
  guia: 'Guía',
  perdon: 'Perdón',
};

export const CATEGORY_PROMPTS: Record<PrayerCategory, string> = {
  peticion: 'Entrega aquello que pesa hoy en tu corazón con total sinceridad…',
  gratitud: 'Agradece por una bendición recibida, grande o silenciosa…',
  intercesion: 'Pon el nombre y la necesidad de alguien a quien amas…',
  guia: 'Pide claridad, discernimiento y paz para una decisión…',
  perdon: 'Abre tu corazón para soltar cargas, pedir perdón o perdonar…',
};

export interface SpiritualVerse {
  text: string;
  reference: string;
}

export const SPIRITUAL_VERSES: SpiritualVerse[] = [
  {
    text: 'Mas tú, cuando ores, entra en tu aposento, y cerrada la puerta, ora a tu Padre que está en secreto.',
    reference: 'Mateo 6:6',
  },
  {
    text: 'Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias.',
    reference: 'Filipenses 4:6',
  },
  {
    text: 'Echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros.',
    reference: '1 Pedro 5:7',
  },
  {
    text: 'Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas que tú no conoces.',
    reference: 'Jeremías 33:3',
  },
  {
    text: 'Jehová es mi pastor; nada me faltará. En lugares de delicados pastos me hará descansar.',
    reference: 'Salmo 23:1-2',
  },
  {
    text: 'La paz os dejo, mi paz os doy; no se turbe vuestro corazón, ni tenga miedo.',
    reference: 'Juan 14:27',
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  discreetMode: false,
  pinHash: null,
};

function generateId(): string {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `pr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function normalizeSpanish(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export interface CreatePrayerInput {
  title?: string;
  body: string;
  category: PrayerCategory;
  verse?: string;
  now?: Date;
}

export function createPrayer(input: CreatePrayerInput): Prayer {
  const cleanBody = input.body.trim();
  if (!cleanBody) {
    throw new Error('Escribe tu oración antes de depositarla en el buzón.');
  }

  const timestamp = (input.now ?? new Date()).toISOString();
  const cleanTitle = (input.title ?? '').trim();
  const cleanVerse = (input.verse ?? '').trim();

  return {
    id: generateId(),
    title: cleanTitle,
    body: cleanBody,
    category: input.category,
    status: 'active',
    isPinned: false,
    verse: cleanVerse || undefined,
    notes: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function derivePrayerDisplayTitle(prayer: Pick<Prayer, 'title' | 'body'>): string {
  if (prayer.title.trim().length > 0) {
    return prayer.title.trim();
  }
  const firstLine = prayer.body.trim().split('\n')[0] ?? '';
  if (firstLine.length <= 54) {
    return firstLine;
  }
  return `${firstLine.slice(0, 51).trimEnd()}…`;
}

export function markPrayerAnswered(
  prayers: Prayer[],
  id: string,
  answerNote?: string,
  now?: Date
): Prayer[] {
  const timestamp = (now ?? new Date()).toISOString();
  const cleanAnswer = (answerNote ?? '').trim();
  return prayers.map((prayer) =>
    prayer.id === id
      ? {
          ...prayer,
          status: 'answered',
          answeredAt: timestamp,
          answerNote: cleanAnswer || prayer.answerNote,
          updatedAt: timestamp,
        }
      : prayer
  );
}

export function reopenPrayer(prayers: Prayer[], id: string, now?: Date): Prayer[] {
  const timestamp = (now ?? new Date()).toISOString();
  return prayers.map((prayer) =>
    prayer.id === id
      ? {
          ...prayer,
          status: 'active',
          answeredAt: undefined,
          updatedAt: timestamp,
        }
      : prayer
  );
}

export function addPrayerNote(
  prayers: Prayer[],
  id: string,
  text: string,
  now?: Date
): Prayer[] {
  const cleanText = text.trim();
  if (!cleanText) {
    throw new Error('Escribe una nota antes de guardarla.');
  }
  const timestamp = (now ?? new Date()).toISOString();
  return prayers.map((prayer) =>
    prayer.id === id
      ? {
          ...prayer,
          notes: [
            ...prayer.notes,
            {
              id: generateId(),
              text: cleanText,
              createdAt: timestamp,
            },
          ],
          updatedAt: timestamp,
        }
      : prayer
  );
}

export function togglePinPrayer(prayers: Prayer[], id: string): Prayer[] {
  return prayers.map((prayer) =>
    prayer.id === id
      ? {
          ...prayer,
          isPinned: !prayer.isPinned,
        }
      : prayer
  );
}

export function deletePrayer(prayers: Prayer[], id: string): Prayer[] {
  return prayers.filter((prayer) => prayer.id !== id);
}

export function filterPrayers(
  prayers: Prayer[],
  options: PrayerFilterOptions
): Prayer[] {
  const normalizedQuery = normalizeSpanish(options.search);

  return prayers
    .filter((prayer) => {
      if (options.status !== 'all' && prayer.status !== options.status) {
        return false;
      }
      if (options.category !== 'all' && prayer.category !== options.category) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }

      const haystack = normalizeSpanish(
        [
          prayer.title,
          prayer.body,
          prayer.verse ?? '',
          prayer.answerNote ?? '',
          ...prayer.notes.map((n) => n.text),
        ].join(' ')
      );

      return haystack.includes(normalizedQuery);
    })
    .sort((a, b) => {
      const pinDiff = Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned));
      if (pinDiff !== 0) return pinDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export function computePrayerStats(prayers: Prayer[]): PrayerStats {
  let active = 0;
  let answered = 0;
  let gratitudeCount = 0;

  for (const prayer of prayers) {
    if (prayer.status === 'answered') {
      answered += 1;
    } else {
      active += 1;
    }
    if (prayer.category === 'gratitud') {
      gratitudeCount += 1;
    }
  }

  return {
    total: prayers.length,
    active,
    answered,
    gratitudeCount,
  };
}

export function buildBackupPayload(prayers: Prayer[], now?: Date): PrayerBackup {
  return {
    app: 'sagrario',
    version: 1,
    exportedAt: (now ?? new Date()).toISOString(),
    prayers,
  };
}

const VALID_CATEGORIES = new Set<PrayerCategory>([
  'peticion',
  'gratitud',
  'intercesion',
  'guia',
  'perdon',
]);

function isValidPrayerRecord(item: unknown): item is Prayer {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.body === 'string' &&
    candidate.body.trim().length > 0 &&
    typeof candidate.title === 'string' &&
    typeof candidate.category === 'string' &&
    VALID_CATEGORIES.has(candidate.category as PrayerCategory) &&
    (candidate.status === 'active' || candidate.status === 'answered') &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string' &&
    Array.isArray(candidate.notes)
  );
}

export function parseAndMergeBackup(
  rawJson: string,
  existingPrayers: Prayer[]
): { prayers: Prayer[]; addedCount: number } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error('El archivo no tiene un formato JSON válido.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('La copia de respaldo no es válida.');
  }

  const record = parsed as Record<string, unknown>;
  const list = Array.isArray(parsed) ? parsed : record.prayers;

  if (!Array.isArray(list)) {
    throw new Error('No se encontró una lista de oraciones en el archivo.');
  }

  const validIncoming = list.filter(isValidPrayerRecord);
  if (list.length > 0 && validIncoming.length === 0) {
    throw new Error('Las oraciones del archivo no coinciden con el formato de Sagrario.');
  }

  const existingIds = new Set(existingPrayers.map((p) => p.id));
  const newEntries = validIncoming.filter((p) => !existingIds.has(p.id));

  return {
    prayers: [...newEntries, ...existingPrayers],
    addedCount: newEntries.length,
  };
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function loadPrayers(storage?: StorageLike): Prayer[] {
  const store = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!store) return [];
  try {
    const raw = store.getItem(PRAYERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidPrayerRecord);
  } catch {
    return [];
  }
}

export function savePrayers(prayers: Prayer[], storage?: StorageLike): void {
  const store = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!store) return;
  store.setItem(PRAYERS_STORAGE_KEY, JSON.stringify(prayers));
}

export function loadSettings(storage?: StorageLike): AppSettings {
  const store = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!store) return DEFAULT_SETTINGS;
  try {
    const raw = store.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      theme: parsed.theme === 'light' ? 'light' : 'dark',
      discreetMode: Boolean(parsed.discreetMode),
      pinHash: typeof parsed.pinHash === 'string' && parsed.pinHash.length > 0 ? parsed.pinHash : null,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings, storage?: StorageLike): void {
  const store = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!store) return;
  store.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function formatSpanishDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
