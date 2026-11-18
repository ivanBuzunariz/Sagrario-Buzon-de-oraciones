import React, { useState } from 'react';
import { Delete, Lock } from 'lucide-react';
import { verifyPin } from '../utils/privacyLock';

interface PinLockScreenProps {
  pinHash: string;
  onUnlock: () => void;
}

const KEYPAD_DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ pinHash, onUnlock }) => {
  const [digits, setDigits] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const submitPin = async (candidate: string) => {
    setChecking(true);
    const valid = await verifyPin(candidate, pinHash);
    setChecking(false);

    if (valid) {
      setDigits('');
      setError('');
      onUnlock();
    } else {
      setDigits('');
      setError('PIN incorrecto. Inténtalo de nuevo.');
    }
  };

  const handleDigit = (digit: string) => {
    if (checking || digits.length >= 4) return;
    setError('');
    const next = digits + digit;
    setDigits(next);
    if (next.length === 4) {
      void submitPin(next);
    }
  };

  const handleBackspace = () => {
    if (checking) return;
    setError('');
    setDigits((prev) => prev.slice(0, -1));
  };

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F8F6F1] px-4 py-12 dark:bg-[#09090B]">
      <div className="w-full max-w-xs rounded-2xl border border-stone-200 bg-white p-8 text-center dark:border-zinc-800/80 dark:bg-[#111114]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200 bg-[#F8F6F1] text-[#9A7228] dark:border-zinc-800 dark:bg-[#09090B] dark:text-[#D4AF6A]">
          <Lock className="h-5 w-5" aria-hidden="true" />
        </div>

        <h1 className="mt-4 font-serif-display text-2xl font-semibold text-stone-900 dark:text-[#F3EFE6]">
          Sagrario protegido
        </h1>
        <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
          Introduce tu PIN de 4 dígitos para abrir tu buzón privado.
        </p>

        {/* PIN Dots */}
        <div className="mt-6 flex justify-center gap-3" aria-label={`Dígitos introducidos: ${digits.length} de 4`}>
          {[0, 1, 2, 3].map((idx) => (
            <span
              key={idx}
              className={`h-3 w-3 rounded-full border transition-colors ${
                idx < digits.length
                  ? 'border-[#9A7228] bg-[#9A7228] dark:border-[#D4AF6A] dark:bg-[#D4AF6A]'
                  : 'border-stone-300 dark:border-zinc-700'
              }`}
            />
          ))}
        </div>

        {error && (
          <p role="alert" className="mt-3 text-xs font-medium text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="mt-6 grid grid-cols-3 gap-2.5">
          {KEYPAD_DIGITS.map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="flex min-h-[52px] items-center justify-center rounded-xl border border-stone-200 bg-[#F8F6F1]/50 text-lg font-medium text-stone-900 transition-colors hover:bg-stone-100 active:scale-[0.97] dark:border-zinc-800 dark:bg-[#09090B] dark:text-[#F3EFE6] dark:hover:bg-zinc-900 tabular-nums"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="flex min-h-[52px] items-center justify-center rounded-xl border border-stone-200 bg-[#F8F6F1]/50 text-lg font-medium text-stone-900 transition-colors hover:bg-stone-100 active:scale-[0.97] dark:border-zinc-800 dark:bg-[#09090B] dark:text-[#F3EFE6] dark:hover:bg-zinc-900 tabular-nums"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            aria-label="Borrar último dígito"
            className="flex min-h-[52px] items-center justify-center rounded-xl border border-stone-200 bg-[#F8F6F1]/50 text-stone-600 transition-colors hover:bg-stone-100 active:scale-[0.97] dark:border-zinc-800 dark:bg-[#09090B] dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <Delete className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </main>
  );
};
