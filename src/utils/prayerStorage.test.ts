import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addPrayerNote,
  buildBackupPayload,
  computePrayerStats,
  createPrayer,
  deletePrayer,
  derivePrayerDisplayTitle,
  filterPrayers,
  loadPrayers,
  markPrayerAnswered,
  parseAndMergeBackup,
  reopenPrayer,
  savePrayers,
  togglePinPrayer,
} from './prayerStorage';

test('createPrayer validates body and sets defaults', () => {
  assert.throws(() => createPrayer({ body: '   ', category: 'peticion' }));

  const now = new Date('2026-11-18T10:00:00.000Z');
  const prayer = createPrayer({
    title: '  Paz en el hogar  ',
    body: '  Señor, te pido serenidad para esta semana.  ',
    category: 'peticion',
    verse: 'Filipenses 4:6',
    now,
  });

  assert.equal(prayer.title, 'Paz en el hogar');
  assert.equal(prayer.body, 'Señor, te pido serenidad para esta semana.');
  assert.equal(prayer.category, 'peticion');
  assert.equal(prayer.status, 'active');
  assert.equal(prayer.verse, 'Filipenses 4:6');
  assert.equal(prayer.createdAt, '2026-11-18T10:00:00.000Z');
  assert.equal(prayer.notes.length, 0);
});

test('derivePrayerDisplayTitle falls back gracefully when title is empty', () => {
  assert.equal(
    derivePrayerDisplayTitle({ title: 'Mi petición', body: 'Texto largo' }),
    'Mi petición'
  );
  assert.equal(
    derivePrayerDisplayTitle({ title: '', body: 'Gracias por este día nuevo.' }),
    'Gracias por este día nuevo.'
  );
});

test('markPrayerAnswered, reopenPrayer, addPrayerNote, togglePinPrayer, deletePrayer', () => {
  const p1 = createPrayer({
    title: 'Salud de mamá',
    body: 'Cuida su recuperación.',
    category: 'intercesion',
    now: new Date('2026-11-18T08:00:00.000Z'),
  });

  let list = [p1];
  list = addPrayerNote(list, p1.id, 'Hoy descansó mucho mejor.');
  assert.equal(list[0].notes.length, 1);
  assert.equal(list[0].notes[0].text, 'Hoy descansó mucho mejor.');

  list = markPrayerAnswered(list, p1.id, 'Los análisis salieron bien, gracias a Dios.');
  assert.equal(list[0].status, 'answered');
  assert.equal(list[0].answerNote, 'Los análisis salieron bien, gracias a Dios.');
  assert.ok(list[0].answeredAt);

  list = reopenPrayer(list, p1.id);
  assert.equal(list[0].status, 'active');
  assert.equal(list[0].answeredAt, undefined);

  list = togglePinPrayer(list, p1.id);
  assert.equal(list[0].isPinned, true);

  list = deletePrayer(list, p1.id);
  assert.equal(list.length, 0);
});

test('filterPrayers supports accent-insensitive Spanish search and pinned sorting', () => {
  const pOld = createPrayer({
    title: 'Sabiduría',
    body: 'Guíame en mi trabajo.',
    category: 'guia',
    now: new Date('2026-11-10T08:00:00.000Z'),
  });
  const pNew = createPrayer({
    title: 'Gratitud diaria',
    body: 'Gracias por la provisión.',
    category: 'gratitud',
    now: new Date('2026-11-18T08:00:00.000Z'),
  });

  let prayers = [pOld, pNew];
  prayers = togglePinPrayer(prayers, pOld.id);

  const all = filterPrayers(prayers, { status: 'all', category: 'all', search: '' });
  assert.equal(all[0].id, pOld.id); // pinned comes first

  const searchResult = filterPrayers(prayers, {
    status: 'all',
    category: 'all',
    search: 'sabiduria', // without accent
  });
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].id, pOld.id);
});

test('computePrayerStats returns accurate counts', () => {
  const p1 = createPrayer({ body: 'Oración 1', category: 'peticion' });
  const p2 = createPrayer({ body: 'Oración 2', category: 'gratitud' });
  const list = markPrayerAnswered([p1, p2], p1.id);

  const stats = computePrayerStats(list);
  assert.deepEqual(stats, {
    total: 2,
    active: 1,
    answered: 1,
    gratitudeCount: 1,
  });
});

test('backup export/import merges without duplicating IDs and rejects invalid JSON', () => {
  const p1 = createPrayer({ title: 'Uno', body: 'Primera oración', category: 'peticion' });
  const p2 = createPrayer({ title: 'Dos', body: 'Segunda oración', category: 'gratitud' });

  const backupJson = JSON.stringify(buildBackupPayload([p1, p2]));
  const merged = parseAndMergeBackup(backupJson, [p1]);

  assert.equal(merged.addedCount, 1);
  assert.equal(merged.prayers.length, 2);
  assert.throws(() => parseAndMergeBackup('{malformed', []));
});

test('loadPrayers and savePrayers persist safely via StorageLike', () => {
  const map = new Map<string, string>();
  const mockStorage = {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
  };

  const p1 = createPrayer({ title: 'Paz', body: 'Señor dame paz.', category: 'peticion' });
  savePrayers([p1], mockStorage);
  const loaded = loadPrayers(mockStorage);
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].body, 'Señor dame paz.');
});
