import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    if (variant === 'card') {
      return (
        <p className="text-xs text-stone-600 dark:text-zinc-400">
          Aplicación instalada en este dispositivo.
        </p>
      );
    }
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#9A7228] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#846020] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF6A] dark:bg-[#D4AF6A] dark:text-[#09090B] dark:hover:bg-[#E0BE7D] whitespace-nowrap shrink-0"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        <span>Instalar aplicación</span>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowGuide(true)}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF6A] dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900 whitespace-nowrap shrink-0"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        <span>{isIOS ? 'Instalar en iPhone / iPad' : 'Cómo instalar como app'}</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-guide-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-[#111114]">
            <div className="flex items-start justify-between gap-4">
              <h3
                id="pwa-guide-title"
                className="font-serif-display text-2xl font-semibold text-stone-900 dark:text-[#F3EFE6]"
              >
                Instalar Sagrario como app
              </h3>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Cerrar guía de instalación"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {isIOS ? (
              <ol className="mt-4 space-y-3 text-sm leading-relaxed text-stone-700 dark:text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <span className="font-semibold text-[#9A7228] dark:text-[#D4AF6A]">1.</span>
                  <span>
                    Pulsa el botón <strong className="inline-flex items-center gap-1 font-semibold"><Share className="inline h-3.5 w-3.5" aria-hidden="true" /> Compartir</strong> en la barra de Safari.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-semibold text-[#9A7228] dark:text-[#D4AF6A]">2.</span>
                  <span>Desliza hacia abajo y selecciona <strong>Añadir a pantalla de inicio</strong>.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-semibold text-[#9A7228] dark:text-[#D4AF6A]">3.</span>
                  <span>Confirma pulsando <strong>Añadir</strong> para abrir Sagrario sin barras de navegador y sin conexión.</span>
                </li>
              </ol>
            ) : (
              <ol className="mt-4 space-y-3 text-sm leading-relaxed text-stone-700 dark:text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <span className="font-semibold text-[#9A7228] dark:text-[#D4AF6A]">1.</span>
                  <span>En Chrome, Edge o Brave, abre el menú del navegador o busca el icono de instalar en la barra de direcciones.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-semibold text-[#9A7228] dark:text-[#D4AF6A]">2.</span>
                  <span>Selecciona <strong>Instalar Sagrario</strong> (o <strong>Añadir a la pantalla de inicio</strong> en Android).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-semibold text-[#9A7228] dark:text-[#D4AF6A]">3.</span>
                  <span>Tus oraciones permanecerán guardadas localmente y funcionarán incluso sin conexión a internet.</span>
                </li>
              </ol>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="min-h-[44px] rounded-xl bg-stone-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
