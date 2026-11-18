import React from 'react';
import { Eye, EyeOff, Feather, Inbox, Lock, Shield, Wind } from 'lucide-react';

export type AppView = 'buzon' | 'escribir' | 'calma' | 'privacidad';

interface TopBarProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  onQuickCompose: () => void;
  discreetMode: boolean;
  onToggleDiscreet: () => void;
  hasPin: boolean;
  onLockNow: () => void;
}

const NAV_ITEMS: { id: AppView; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'buzon', label: 'Buzón', icon: Inbox },
  { id: 'escribir', label: 'Escribir', icon: Feather },
  { id: 'calma', label: 'Calma', icon: Wind },
  { id: 'privacidad', label: 'Privacidad', icon: Shield },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  onSelectView,
  onQuickCompose,
  discreetMode,
  onToggleDiscreet,
  hasPin,
  onLockNow,
}) => {
  return (
    <>
      {/* Desktop 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 hidden border-b border-stone-200/80 bg-[#F8F6F1]/90 backdrop-blur-md md:block dark:border-zinc-800/80 dark:bg-[#09090B]/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => onSelectView('buzon')}
            className="font-serif-display text-2xl font-semibold tracking-tight text-stone-900 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF6A] dark:text-[#F3EFE6] whitespace-nowrap shrink-0"
          >
            Sagrario
          </button>

          {/* Zone 2: Clean single-line navigation links */}
          <nav aria-label="Navegación principal" className="flex items-center gap-7">
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectView(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF6A] whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-stone-950 dark:text-[#F3EFE6]'
                      : 'text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-[#F3EFE6]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-[1px] h-[2px] bg-[#9A7228] dark:bg-[#D4AF6A]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onQuickCompose}
              className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-[#9A7228] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#846020] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF6A] dark:bg-[#D4AF6A] dark:text-[#09090B] dark:hover:bg-[#E0BE7D] whitespace-nowrap shrink-0"
            >
              Nueva petición
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Compact Sticky Header + Top Tab Bar (92px total, leaves bottom clear of Netlify watermark) */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[#F8F6F1]/95 backdrop-blur-md md:hidden dark:border-zinc-800/80 dark:bg-[#09090B]/95">
        <div className="flex h-12 items-center justify-between px-4">
          <button
            type="button"
            onClick={() => onSelectView('buzon')}
            className="font-serif-display text-2xl font-semibold tracking-tight text-stone-900 dark:text-[#F3EFE6] whitespace-nowrap shrink-0"
          >
            Sagrario
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleDiscreet}
              aria-label={discreetMode ? 'Mostrar textos de oraciones' : 'Activar modo discreto'}
              aria-pressed={discreetMode}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-stone-600 transition-colors hover:bg-stone-200/60 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              {discreetMode ? (
                <EyeOff className="h-5 w-5 text-[#9A7228] dark:text-[#D4AF6A]" aria-hidden="true" />
              ) : (
                <Eye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            {hasPin && (
              <button
                type="button"
                onClick={onLockNow}
                aria-label="Bloquear buzón ahora"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-stone-600 transition-colors hover:bg-stone-200/60 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                <Lock className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <nav
          aria-label="Navegación móvil"
          className="grid h-11 grid-cols-4 items-center border-t border-stone-200/60 px-2 dark:border-zinc-800/60"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex min-h-[44px] items-center justify-center gap-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-[#9A7228] dark:text-[#D4AF6A]'
                    : 'text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-0 h-[2px] bg-[#9A7228] dark:bg-[#D4AF6A]"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </header>
    </>
  );
};
