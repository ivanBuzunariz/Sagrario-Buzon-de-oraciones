import React, { useEffect, useState } from 'react';
import { Pause, Play, RefreshCw, RotateCcw } from 'lucide-react';
import { SPIRITUAL_VERSES } from '../utils/prayerStorage';

const PRESET_MINUTES = [1, 3, 5, 10];

export const CalmTimer: React.FC = () => {
  const [selectedMinutes, setSelectedMinutes] = useState(3);
  const [secondsLeft, setSecondsLeft] = useState(3 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [verseIndex, setVerseIndex] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const timerId = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isRunning]);

  const totalSeconds = selectedMinutes * 60;
  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedClock = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleSelectPreset = (mins: number) => {
    setIsRunning(false);
    setSelectedMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(selectedMinutes * 60);
  };

  const currentVerse = SPIRITUAL_VERSES[verseIndex];

  return (
    <section
      aria-labelledby="calm-heading"
      className="mx-auto max-w-3xl space-y-8"
    >
      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center sm:p-10 dark:border-zinc-800/80 dark:bg-[#111114]">
        <h2
          id="calm-heading"
          className="font-serif-display text-3xl font-semibold text-stone-900 dark:text-[#F3EFE6]"
        >
          Momento de silencio
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-600 dark:text-zinc-400">
          Aparta unos minutos sin distracciones para orar, escuchar y descansar el corazón.
        </p>

        {/* Preset durations */}
        <div
          role="group"
          aria-label="Duración del tiempo de oración"
          className="mt-6 inline-flex flex-wrap justify-center gap-1.5 rounded-xl bg-stone-100 p-1 dark:bg-zinc-900"
        >
          {PRESET_MINUTES.map((mins) => {
            const active = selectedMinutes === mins;
            return (
              <button
                key={mins}
                type="button"
                onClick={() => handleSelectPreset(mins)}
                className={`min-h-[40px] rounded-lg px-4 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white text-stone-900 shadow-sm dark:bg-[#1C1C21] dark:text-[#F3EFE6]'
                    : 'text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {mins} min
              </button>
            );
          })}
        </div>

        {/* Circular Timer Ring */}
        <div className="relative mx-auto mt-8 flex h-52 w-52 items-center justify-center">
          <svg className="h-52 w-52 -rotate-90" viewBox="0 0 200 200" aria-hidden="true">
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-stone-200 dark:text-zinc-800"
            />
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="text-[#9A7228] transition-[stroke-dashoffset] duration-500 ease-out dark:text-[#D4AF6A]"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-4xl font-semibold tracking-tight text-stone-900 tabular-nums dark:text-[#F3EFE6]"
              aria-live="off"
            >
              {formattedClock}
            </span>
            <span className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
              {secondsLeft === 0
                ? 'Amén · Tiempo completado'
                : isRunning
                  ? 'En oración y quietud'
                  : 'Listo para comenzar'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (secondsLeft === 0) {
                setSecondsLeft(selectedMinutes * 60);
              }
              setIsRunning((prev) => !prev);
            }}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#9A7228] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#846020] dark:bg-[#D4AF6A] dark:text-[#09090B] dark:hover:bg-[#E0BE7D]"
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4" aria-hidden="true" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" aria-hidden="true" />
                <span>{secondsLeft === 0 ? 'Volver a empezar' : 'Comenzar'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            aria-label="Reiniciar temporizador"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-stone-200 px-3.5 text-stone-600 transition-colors hover:bg-stone-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Contemplative Scripture Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 dark:border-zinc-800/80 dark:bg-[#111114]">
        <p className="font-serif-display text-2xl italic leading-relaxed text-stone-800 dark:text-[#F3EFE6]">
          “{currentVerse.text}”
        </p>
        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="text-xs font-medium text-stone-500 dark:text-zinc-400">
            {currentVerse.reference}
          </span>
          <button
            type="button"
            onClick={() => setVerseIndex((prev) => (prev + 1) % SPIRITUAL_VERSES.length)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Otro versículo</span>
          </button>
        </div>
      </div>
    </section>
  );
};
