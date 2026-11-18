import React, { useRef, useState } from 'react';
import {
  Check,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Moon,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';
import type { AppSettings, Prayer, ThemeMode } from '../types/prayer';
import { buildBackupPayload, parseAndMergeBackup } from '../utils/prayerStorage';
import { hashPin, isValidPin } from '../utils/privacyLock';
import { PWAInstallButton } from './PWAInstallButton';

interface PrivacySettingsProps {
  settings: AppSettings;
  prayers: Prayer[];
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onImportPrayers: (merged: Prayer[], addedCount: number) => void;
  onClearAllPrayers: () => void;
  onLockNow: () => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  settings,
  prayers,
  onUpdateSettings,
  onImportPrayers,
  onClearAllPrayers,
  onLockNow,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const [pinError, setPinError] = useState('');
  const [backupMessage, setBackupMessage] = useState('');
  const [backupError, setBackupError] = useState('');
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSetTheme = (theme: ThemeMode) => {
    onUpdateSettings({ theme });
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinMessage('');

    if (!isValidPin(pinInput)) {
      setPinError('El PIN debe tener exactamente 4 números.');
      return;
    }
    if (pinInput !== pinConfirm) {
      setPinError('Los dos códigos PIN no coinciden.');
      return;
    }

    const hashed = await hashPin(pinInput);
    onUpdateSettings({ pinHash: hashed });
    setPinInput('');
    setPinConfirm('');
    setPinMessage('Bloqueo con PIN activado en este dispositivo.');
  };

  const handleRemovePin = () => {
    onUpdateSettings({ pinHash: null });
    setPinMessage('Bloqueo con PIN desactivado.');
    setPinError('');
  };

  const handleExportBackup = () => {
    setBackupError('');
    const payload = buildBackupPayload(prayers);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const dateStamp = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sagrario-respaldo-${dateStamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setBackupMessage(`Copia privada exportada (${prayers.length} oraciones).`);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackupError('');
    setBackupMessage('');

    try {
      const text = await file.text();
      const result = parseAndMergeBackup(text, prayers);
      onImportPrayers(result.prayers, result.addedCount);
      setBackupMessage(
        result.addedCount > 0
          ? `Se restauraron ${result.addedCount} oraciones en tu buzón.`
          : 'Todas las oraciones del respaldo ya estaban en este dispositivo.'
      );
    } catch (err) {
      setBackupError(
        err instanceof Error ? err.message : 'No se pudo leer el archivo de respaldo.'
      );
    } finally {
      e.target.value = '';
    }
  };

  return (
    <section aria-labelledby="privacy-heading" className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2
          id="privacy-heading"
          className="font-serif-display text-3xl font-semibold text-stone-900 dark:text-[#F3EFE6]"
        >
          Privacidad, seguridad y copias
        </h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-zinc-400">
          Tus oraciones no salen de este navegador. Todo se almacena de forma local en tu dispositivo.
        </p>
      </div>

      {/* Theme & Discreet Mode */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-6 dark:border-zinc-800/80 dark:bg-[#111114]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-[#F3EFE6]">
              Apariencia de lectura
            </h3>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-zinc-400">
              Modo oscuro activado por defecto para menor brillo y mayor discreción.
            </p>
          </div>
          <div className="inline-flex rounded-xl bg-stone-100 p-1 dark:bg-zinc-900 shrink-0">
            <button
              type="button"
              onClick={() => handleSetTheme('dark')}
              aria-pressed={settings.theme === 'dark'}
              className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                settings.theme === 'dark'
                  ? 'bg-[#1C1C21] text-[#F3EFE6] shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 dark:text-zinc-400'
              }`}
            >
              <Moon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Oscuro</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetTheme('light')}
              aria-pressed={settings.theme === 'light'}
              className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                settings.theme === 'light'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-200'
              }`}
            >
              <Sun className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Papel claro</span>
            </button>
          </div>
        </div>

        <div className="border-t border-stone-200 pt-5 dark:border-zinc-800">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-[#F3EFE6]">
                Modo discreto en la lista
              </h3>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-zinc-400">
                Oculta el contenido de tus peticiones en el listado hasta que las abras manualmente.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ discreetMode: !settings.discreetMode })}
              aria-pressed={settings.discreetMode}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                settings.discreetMode
                  ? 'border-[#9A7228] bg-[#9A7228]/10 text-[#9A7228] dark:border-[#D4AF6A] dark:bg-[#D4AF6A]/10 dark:text-[#D4AF6A]'
                  : 'border-stone-200 text-stone-700 hover:bg-stone-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900'
              }`}
            >
              {settings.discreetMode ? (
                <>
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                  <span>Textos ocultos</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  <span>Textos visibles</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* PIN Lock */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-zinc-800/80 dark:bg-[#111114]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-[#F3EFE6]">
              <KeyRound className="h-4 w-4 text-[#9A7228] dark:text-[#D4AF6A]" aria-hidden="true" />
              <span>Bloqueo privado con PIN (4 dígitos)</span>
            </h3>
            <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
              Protege el acceso al buzón en este dispositivo con un código cifrado localmente.
            </p>
          </div>

          {settings.pinHash && (
            <button
              type="button"
              onClick={onLockNow}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-stone-200 px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900 whitespace-nowrap shrink-0"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Bloquear ahora</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSavePin} className="mt-5 grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="pin-new" className="block text-xs text-stone-500 dark:text-zinc-400">
              {settings.pinHash ? 'Nuevo PIN (4 dígitos)' : 'PIN de 4 dígitos'}
            </label>
            <input
              id="pin-new"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="mt-1 min-h-[44px] w-full rounded-xl border border-stone-200 bg-[#F8F6F1]/60 px-3.5 text-sm tracking-widest text-stone-900 focus:border-[#9A7228] focus:outline-none dark:border-zinc-800 dark:bg-[#09090B] dark:text-[#F3EFE6] dark:focus:border-[#D4AF6A]"
            />
          </div>
          <div>
            <label htmlFor="pin-confirm" className="block text-xs text-stone-500 dark:text-zinc-400">
              Confirmar PIN
            </label>
            <input
              id="pin-confirm"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinConfirm}
              onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="mt-1 min-h-[44px] w-full rounded-xl border border-stone-200 bg-[#F8F6F1]/60 px-3.5 text-sm tracking-widest text-stone-900 focus:border-[#9A7228] focus:outline-none dark:border-zinc-800 dark:bg-[#09090B] dark:text-[#F3EFE6] dark:focus:border-[#D4AF6A]"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="min-h-[44px] flex-1 rounded-xl bg-[#9A7228] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#846020] dark:bg-[#D4AF6A] dark:text-[#09090B] dark:hover:bg-[#E0BE7D]"
            >
              {settings.pinHash ? 'Actualizar PIN' : 'Activar PIN'}
            </button>
            {settings.pinHash && (
              <button
                type="button"
                onClick={handleRemovePin}
                className="min-h-[44px] rounded-xl border border-stone-200 px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                Quitar
              </button>
            )}
          </div>
        </form>

        {pinError && (
          <p role="alert" className="mt-2.5 text-xs font-medium text-rose-600 dark:text-rose-400">
            {pinError}
          </p>
        )}
        {pinMessage && (
          <p role="status" className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-[#D4AF6A]">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{pinMessage}</span>
          </p>
        )}
      </div>

      {/* Backup Export / Import & Clear */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5 dark:border-zinc-800/80 dark:bg-[#111114]">
        <div>
          <h3 className="text-sm font-semibold text-stone-900 dark:text-[#F3EFE6]">
            Copia de seguridad local
          </h3>
          <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
            Como tus datos viven únicamente en este navegador, exporta un archivo privado si cambias de dispositivo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportBackup}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-stone-300 px-4 py-2 text-xs font-medium text-stone-800 transition-colors hover:bg-stone-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Exportar copia (.json)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-stone-300 px-4 py-2 text-xs font-medium text-stone-800 transition-colors hover:bg-stone-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            <span>Importar copia (.json)</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
          />

          {prayers.length > 0 && !confirmClearAll && (
            <button
              type="button"
              onClick={() => setConfirmClearAll(true)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 sm:ml-auto dark:text-rose-400 dark:hover:bg-rose-950/30"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span>Vaciar buzón</span>
            </button>
          )}

          {confirmClearAll && (
            <div className="flex items-center gap-2 sm:ml-auto">
              <button
                type="button"
                onClick={() => setConfirmClearAll(false)}
                className="min-h-[40px] rounded-xl px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAllPrayers();
                  setConfirmClearAll(false);
                  setBackupMessage('Se vació el buzón local.');
                }}
                className="min-h-[40px] rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
              >
                Confirmar borrado total
              </button>
            </div>
          )}
        </div>

        {backupError && (
          <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
            {backupError}
          </p>
        )}
        {backupMessage && (
          <p role="status" className="text-xs font-medium text-emerald-700 dark:text-[#D4AF6A]">
            {backupMessage}
          </p>
        )}
      </div>

      {/* PWA Installation Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-zinc-800/80 dark:bg-[#111114]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-[#F3EFE6]">
              Instalar como aplicación nativa (PWA)
            </h3>
            <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
              Úsala a pantalla completa desde tu móvil o escritorio, incluso sin conexión.
            </p>
          </div>
          <PWAInstallButton variant="card" />
        </div>
      </div>
    </section>
  );
};
