import { useEffect, useRef, useState } from 'react';
import { CalmTimer } from './components/CalmTimer';
import { ComposePrayer } from './components/ComposePrayer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PinLockScreen } from './components/PinLockScreen';
import { PrayerDetailModal } from './components/PrayerDetailModal';
import { PrayerMailbox } from './components/PrayerMailbox';
import { PrivacySettings } from './components/PrivacySettings';
import { PWAInstallButton } from './components/PWAInstallButton';
import { TopBar, type AppView } from './components/TopBar';
import type { AppSettings, Prayer, PrayerCategory } from './types/prayer';
import {
  addPrayerNote,
  createPrayer,
  deletePrayer,
  loadPrayers,
  loadSettings,
  markPrayerAnswered,
  reopenPrayer,
  savePrayers,
  saveSettings,
  SPIRITUAL_VERSES,
  togglePinPrayer,
} from './utils/prayerStorage';

export default function App() {
  const [prayers, setPrayers] = useState<Prayer[]>(() => loadPrayers());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [activeView, setActiveView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'write') return 'escribir';
    }
    return 'buzon';
  });
  const [selectedPrayerId, setSelectedPrayerId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(() => Boolean(loadSettings().pinHash));
  const composeInputRef = useRef<HTMLTextAreaElement | null>(null);

  // Persist prayers to localStorage
  useEffect(() => {
    savePrayers(prayers);
  }, [prayers]);

  // Persist settings and sync dark/light theme class + browser theme-color
  useEffect(() => {
    saveSettings(settings);
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', settings.theme === 'dark' ? '#09090B' : '#F8F6F1');
    }
  }, [settings]);

  const selectedPrayer = prayers.find((p) => p.id === selectedPrayerId) ?? null;

  const handleCreatePrayer = (data: {
    title: string;
    body: string;
    category: PrayerCategory;
    verse: string;
  }) => {
    const created = createPrayer(data);
    setPrayers((prev) => [created, ...prev]);
    if (activeView === 'escribir') {
      setActiveView('buzon');
    }
  };

  const handleMarkAnswered = (id: string, answerNote?: string) => {
    setPrayers((prev) => markPrayerAnswered(prev, id, answerNote));
  };

  const handleReopen = (id: string) => {
    setPrayers((prev) => reopenPrayer(prev, id));
  };

  const handleAddNote = (id: string, text: string) => {
    setPrayers((prev) => addPrayerNote(prev, id, text));
  };

  const handleTogglePin = (id: string) => {
    setPrayers((prev) => togglePinPrayer(prev, id));
  };

  const handleDeletePrayer = (id: string) => {
    setPrayers((prev) => deletePrayer(prev, id));
    setSelectedPrayerId(null);
  };

  const handleUpdateSettings = (patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const handleQuickCompose = () => {
    if (window.innerWidth >= 1024 && activeView === 'buzon') {
      composeInputRef.current?.focus();
      composeInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setActiveView('escribir');
    }
  };

  if (isLocked && settings.pinHash) {
    return (
      <PinLockScreen
        pinHash={settings.pinHash}
        onUnlock={() => setIsLocked(false)}
      />
    );
  }

  // Quiet daily scripture verse based on day of month
  const dailyVerse = SPIRITUAL_VERSES[new Date().getDate() % SPIRITUAL_VERSES.length];

  return (
    <div className="min-h-screen bg-[#F8F6F1] text-stone-900 transition-colors dark:bg-[#09090B] dark:text-[#F3EFE6]">
      <TopBar
        activeView={activeView}
        onSelectView={setActiveView}
        onQuickCompose={handleQuickCompose}
        discreetMode={settings.discreetMode}
        onToggleDiscreet={() =>
          handleUpdateSettings({ discreetMode: !settings.discreetMode })
        }
        hasPin={Boolean(settings.pinHash)}
        onLockNow={() => setIsLocked(true)}
      />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 md:pb-16 md:pt-10">
        {activeView === 'buzon' && (
          <>
            {/* Quiet contemplative header strip */}
            <div className="mb-8 flex flex-col justify-between gap-4 border-b border-stone-200/80 pb-6 sm:flex-row sm:items-end dark:border-zinc-800/80">
              <div className="max-w-2xl">
                <p className="font-serif-display text-lg italic leading-relaxed text-stone-600 sm:text-xl dark:text-zinc-300">
                  “{dailyVerse.text}”
                </p>
                <p className="mt-1 text-xs text-stone-500 dark:text-zinc-500">
                  {dailyVerse.reference} · Buzón personal guardado en este dispositivo
                </p>
              </div>
              <div className="shrink-0">
                <PWAInstallButton variant="compact" />
              </div>
            </div>

            <PrayerMailbox
              prayers={prayers}
              discreetMode={settings.discreetMode}
              onToggleDiscreet={() =>
                handleUpdateSettings({ discreetMode: !settings.discreetMode })
              }
              onCreatePrayer={handleCreatePrayer}
              onSelectPrayer={(prayer) => setSelectedPrayerId(prayer.id)}
              onGoToWriteMobile={() => setActiveView('escribir')}
              composeInputRef={composeInputRef}
            />
          </>
        )}

        {activeView === 'escribir' && (
          <div className="py-2">
            <ComposePrayer onSubmit={handleCreatePrayer} />
          </div>
        )}

        {activeView === 'calma' && <CalmTimer />}

        {activeView === 'privacidad' && (
          <PrivacySettings
            settings={settings}
            prayers={prayers}
            onUpdateSettings={handleUpdateSettings}
            onImportPrayers={(merged) => setPrayers(merged)}
            onClearAllPrayers={() => setPrayers([])}
            onLockNow={() => setIsLocked(true)}
          />
        )}
      </main>

      {selectedPrayer && (
        <PrayerDetailModal
          prayer={selectedPrayer}
          discreetMode={settings.discreetMode}
          onClose={() => setSelectedPrayerId(null)}
          onMarkAnswered={handleMarkAnswered}
          onReopen={handleReopen}
          onAddNote={handleAddNote}
          onTogglePin={handleTogglePin}
          onDelete={handleDeletePrayer}
        />
      )}

      <OfflineIndicator />
    </div>
  );
}
