import React, { useMemo, useState } from 'react';
import { ChevronDown, Eye, EyeOff, Inbox, Pin, Search, X } from 'lucide-react';
import type { Prayer, PrayerCategory, PrayerFilterOptions } from '../types/prayer';
import {
  CATEGORY_LABELS,
  computePrayerStats,
  derivePrayerDisplayTitle,
  filterPrayers,
  formatSpanishDate,
} from '../utils/prayerStorage';
import { ComposePrayer } from './ComposePrayer';

interface PrayerMailboxProps {
  prayers: Prayer[];
  discreetMode: boolean;
  onToggleDiscreet: () => void;
  onCreatePrayer: (data: {
    title: string;
    body: string;
    category: PrayerCategory;
    verse: string;
  }) => void;
  onSelectPrayer: (prayer: Prayer) => void;
  onGoToWriteMobile: () => void;
  composeInputRef: React.RefObject<HTMLTextAreaElement | null>;
}

const STATUS_TABS: { id: PrayerFilterOptions['status']; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'active', label: 'En espera' },
  { id: 'answered', label: 'Respondidas' },
];

export const PrayerMailbox: React.FC<PrayerMailboxProps> = ({
  prayers,
  discreetMode,
  onToggleDiscreet,
  onCreatePrayer,
  onSelectPrayer,
  onGoToWriteMobile,
  composeInputRef,
}) => {
  const [statusFilter, setStatusFilter] = useState<PrayerFilterOptions['status']>('all');
  const [categoryFilter, setCategoryFilter] = useState<PrayerFilterOptions['category']>('all');
  const [search, setSearch] = useState('');

  const stats = useMemo(() => computePrayerStats(prayers), [prayers]);

  const filteredPrayers = useMemo(
    () =>
      filterPrayers(prayers, {
        status: statusFilter,
        category: categoryFilter,
        search,
      }),
    [prayers, statusFilter, categoryFilter, search]
  );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
      {/* Desktop Left Column: Distraction-free Compose Box */}
      <div className="hidden lg:col-span-5 lg:block">
        <ComposePrayer compact onSubmit={onCreatePrayer} inputRef={composeInputRef} />
      </div>

      {/* Main Column: Private Prayer Mailbox List */}
      <section aria-labelledby="mailbox-heading" className="lg:col-span-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1
              id="mailbox-heading"
              className="font-serif-display text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl dark:text-[#F3EFE6]"
            >
              Tu buzón privado
            </h1>
            <p className="mt-1 text-xs text-stone-500 tabular-nums dark:text-zinc-400">
              {stats.total === 0
                ? 'Sin oraciones guardadas todavía'
                : `${stats.active} en espera · ${stats.answered} ${stats.answered === 1 ? 'respondida' : 'respondidas'} · ${stats.total} en total`}
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleDiscreet}
            aria-pressed={discreetMode}
            className={`hidden min-h-[40px] items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors md:inline-flex whitespace-nowrap shrink-0 ${
              discreetMode
                ? 'border-[#9A7228] bg-[#9A7228]/10 text-[#9A7228] dark:border-[#D4AF6A] dark:bg-[#D4AF6A]/10 dark:text-[#D4AF6A]'
                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100 dark:border-zinc-800 dark:bg-[#111114] dark:text-zinc-300 dark:hover:bg-zinc-900'
            }`}
          >
            {discreetMode ? (
              <>
                <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Modo discreto activo</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Modo discreto</span>
              </>
            )}
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-zinc-500"
                aria-hidden="true"
              />
              <label htmlFor="mailbox-search" className="sr-only">
                Buscar en tus oraciones
              </label>
              <input
                id="mailbox-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por palabra, promesa o nota…"
                className="min-h-[44px] w-full rounded-xl border border-stone-200 bg-white pl-10 pr-9 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#9A7228] focus:outline-none dark:border-zinc-800 dark:bg-[#111114] dark:text-[#F3EFE6] dark:placeholder:text-zinc-500 dark:focus:border-[#D4AF6A]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 dark:text-zinc-500 dark:hover:text-zinc-200"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="relative sm:w-52">
              <label htmlFor="category-filter" className="sr-only">
                Filtrar por categoría
              </label>
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value as PrayerFilterOptions['category'])
                }
                className="min-h-[44px] w-full appearance-none rounded-xl border border-stone-200 bg-white pl-3.5 pr-9 text-sm text-stone-700 focus:border-[#9A7228] focus:outline-none dark:border-zinc-800 dark:bg-[#111114] dark:text-zinc-200 dark:focus:border-[#D4AF6A]"
              >
                <option value="all">Todas las intenciones</option>
                {(Object.keys(CATEGORY_LABELS) as PrayerCategory[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-zinc-500"
                aria-hidden="true"
              />
            </div>
          </div>

          <div
            role="group"
            aria-label="Filtrar por estado"
            className="inline-flex rounded-xl bg-stone-200/70 p-1 dark:bg-zinc-900"
          >
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  aria-pressed={active}
                  className={`min-h-[38px] rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white text-stone-900 shadow-sm dark:bg-[#1C1C21] dark:text-[#F3EFE6]'
                      : 'text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Prayer List or Empty State */}
        <div className="mt-6" data-testid="prayer-list">
          {prayers.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center sm:p-12 dark:border-zinc-800/80 dark:bg-[#111114]">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200 bg-[#F8F6F1] text-[#9A7228] dark:border-zinc-800 dark:bg-[#09090B] dark:text-[#D4AF6A]">
                <Inbox className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-4 font-serif-display text-2xl font-semibold text-stone-900 dark:text-[#F3EFE6]">
                Tu buzón está en silencio
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-600 dark:text-zinc-400">
                Deposita aquí tus peticiones, agradecimientos o intercesiones. Todo permanece privado y guardado únicamente en este dispositivo.
              </p>
              <button
                type="button"
                onClick={onGoToWriteMobile}
                className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#9A7228] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#846020] lg:hidden dark:bg-[#D4AF6A] dark:text-[#09090B] dark:hover:bg-[#E0BE7D]"
              >
                Escribir primera oración
              </button>
            </div>
          ) : filteredPrayers.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center dark:border-zinc-800/80 dark:bg-[#111114]">
              <p className="text-sm text-stone-600 dark:text-zinc-400">
                Ninguna oración coincide con los filtros actuales.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setSearch('');
                }}
                className="mt-3 min-h-[40px] rounded-xl px-4 py-2 text-xs font-medium text-[#9A7228] hover:bg-stone-100 dark:text-[#D4AF6A] dark:hover:bg-zinc-900"
              >
                Mostrar todas las oraciones
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredPrayers.map((prayer) => {
                const displayTitle = derivePrayerDisplayTitle(prayer);
                return (
                  <li key={prayer.id}>
                    <button
                      type="button"
                      onClick={() => onSelectPrayer(prayer)}
                      className="w-full rounded-2xl border border-stone-200 bg-white p-5 text-left transition-colors hover:border-stone-300 hover:bg-stone-50/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF6A] dark:border-zinc-800/80 dark:bg-[#111114] dark:hover:border-zinc-700 dark:hover:bg-[#16161A]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-zinc-400">
                          <span>{CATEGORY_LABELS[prayer.category]}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{formatSpanishDate(prayer.createdAt)}</span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={
                              prayer.status === 'answered'
                                ? 'font-medium text-emerald-700 dark:text-[#D4AF6A]'
                                : ''
                            }
                          >
                            {prayer.status === 'answered' ? 'Respondida' : 'En espera'}
                          </span>
                          {prayer.notes.length > 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">
                                {prayer.notes.length} {prayer.notes.length === 1 ? 'nota' : 'notas'}
                              </span>
                            </>
                          )}
                        </div>

                        {prayer.isPinned && (
                          <Pin
                            className="h-3.5 w-3.5 shrink-0 text-[#9A7228] dark:text-[#D4AF6A]"
                            aria-label="Fijada"
                          />
                        )}
                      </div>

                      <h3 className="mt-2 font-serif-display text-xl font-semibold leading-snug text-stone-900 dark:text-[#F3EFE6]">
                        {discreetMode ? 'Oración privada' : displayTitle}
                      </h3>

                      <p
                        className={`mt-1.5 line-clamp-2 text-sm leading-relaxed text-stone-600 dark:text-zinc-400 ${
                          discreetMode ? 'select-none blur-[5px]' : ''
                        }`}
                      >
                        {discreetMode
                          ? 'Contenido oculto en modo discreto para proteger tu privacidad.'
                          : prayer.body}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};
