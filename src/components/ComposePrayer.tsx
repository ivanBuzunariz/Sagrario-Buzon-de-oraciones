import React, { useState } from 'react';
import { Check, Lock, Send } from 'lucide-react';
import type { PrayerCategory } from '../types/prayer';
import { CATEGORY_LABELS, CATEGORY_PROMPTS } from '../utils/prayerStorage';

interface ComposePrayerProps {
  onSubmit: (data: {
    title: string;
    body: string;
    category: PrayerCategory;
    verse: string;
  }) => void;
  compact?: boolean;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

const CATEGORIES: PrayerCategory[] = [
  'peticion',
  'gratitud',
  'intercesion',
  'guia',
  'perdon',
];

export const ComposePrayer: React.FC<ComposePrayerProps> = ({
  onSubmit,
  compact = false,
  inputRef,
}) => {
  const [category, setCategory] = useState<PrayerCategory>('peticion');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [verse, setVerse] = useState('');
  const [error, setError] = useState('');
  const [justSealed, setJustSealed] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) {
      setError('Escribe tu oración antes de depositarla en el buzón.');
      return;
    }

    setError('');
    onSubmit({
      title,
      body,
      category,
      verse,
    });

    setTitle('');
    setBody('');
    setVerse('');
    setJustSealed(true);
    window.setTimeout(() => {
      setJustSealed(false);
    }, 3200);
  };

  return (
    <section
      aria-labelledby="compose-heading"
      className={`rounded-2xl border border-stone-200 bg-white dark:border-zinc-800/80 dark:bg-[#111114] ${
        compact ? 'p-6' : 'mx-auto max-w-2xl p-6 sm:p-8'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            id="compose-heading"
            className="font-serif-display text-2xl font-semibold tracking-tight text-stone-900 dark:text-[#F3EFE6]"
          >
            Depositar en el buzón
          </h2>
          <p className="mt-1 text-sm text-stone-600 dark:text-zinc-400">
            Lo que escribas permanece guardado únicamente en este dispositivo.
          </p>
        </div>
        <Lock
          className="mt-1 h-4 w-4 shrink-0 text-stone-400 dark:text-zinc-500"
          aria-hidden="true"
        />
      </div>

      <form onSubmit={handleFormSubmit} className="mt-6 space-y-5" noValidate>
        <div>
          <span className="block text-xs font-medium text-stone-600 dark:text-zinc-400">
            Intención
          </span>
          <div
            role="group"
            aria-label="Categoría de la oración"
            className="mt-2 flex flex-wrap gap-1.5"
          >
            {CATEGORIES.map((cat) => {
              const selected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  aria-pressed={selected}
                  className={`min-h-[40px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF6A] whitespace-nowrap shrink-0 ${
                    selected
                      ? 'bg-[#9A7228] text-white dark:bg-[#D4AF6A] dark:text-[#09090B]'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor={compact ? 'prayer-title-side' : 'prayer-title-full'}
            className="block text-xs font-medium text-stone-600 dark:text-zinc-400"
          >
            Título breve (opcional)
          </label>
          <input
            id={compact ? 'prayer-title-side' : 'prayer-title-full'}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="Ej. Paz para mi familia"
            className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#F8F6F1]/60 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#9A7228] focus:outline-none dark:border-zinc-800 dark:bg-[#09090B] dark:text-[#F3EFE6] dark:placeholder:text-zinc-600 dark:focus:border-[#D4AF6A]"
          />
        </div>

        <div>
          <label
            htmlFor={compact ? 'prayer-body-side' : 'prayer-body-full'}
            className="block text-xs font-medium text-stone-600 dark:text-zinc-400"
          >
            Tu oración
          </label>
          <textarea
            ref={inputRef}
            id={compact ? 'prayer-body-side' : 'prayer-body-full'}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              if (error) setError('');
            }}
            rows={compact ? 6 : 8}
            placeholder={CATEGORY_PROMPTS[category]}
            className="mt-1.5 w-full resize-y rounded-xl border border-stone-200 bg-[#F8F6F1]/60 px-3.5 py-3 text-[15px] leading-relaxed text-stone-900 placeholder:text-stone-400 focus:border-[#9A7228] focus:outline-none dark:border-zinc-800 dark:bg-[#09090B] dark:text-[#F3EFE6] dark:placeholder:text-zinc-600 dark:focus:border-[#D4AF6A]"
          />
          {error && (
            <p role="alert" className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={compact ? 'prayer-verse-side' : 'prayer-verse-full'}
            className="block text-xs font-medium text-stone-600 dark:text-zinc-400"
          >
            Cita o promesa personal (opcional)
          </label>
          <input
            id={compact ? 'prayer-verse-side' : 'prayer-verse-full'}
            type="text"
            value={verse}
            onChange={(e) => setVerse(e.target.value)}
            maxLength={120}
            placeholder="Ej. Salmo 23:1"
            className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#F8F6F1]/60 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#9A7228] focus:outline-none dark:border-zinc-800 dark:bg-[#09090B] dark:text-[#F3EFE6] dark:placeholder:text-zinc-600 dark:focus:border-[#D4AF6A]"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {justSealed ? (
            <span
              role="status"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-[#D4AF6A]"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Oración depositada en silencio
            </span>
          ) : (
            <span className="text-xs text-stone-500 dark:text-zinc-500">
              Guardado privado local
            </span>
          )}

          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#9A7228] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#846020] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF6A] dark:bg-[#D4AF6A] dark:text-[#09090B] dark:hover:bg-[#E0BE7D] whitespace-nowrap shrink-0"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            <span>Depositar en el buzón</span>
          </button>
        </div>
      </form>
    </section>
  );
};
