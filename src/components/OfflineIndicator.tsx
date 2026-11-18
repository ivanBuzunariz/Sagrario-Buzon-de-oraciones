import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-4 right-4 top-24 z-40 mx-auto flex max-w-md items-center gap-2.5 rounded-xl border border-amber-500/30 bg-stone-900/95 px-4 py-2.5 text-xs font-medium text-amber-200 shadow-lg backdrop-blur-md md:bottom-5 md:left-5 md:right-auto md:top-auto dark:bg-[#141418]/95"
    >
      <WifiOff className="h-4 w-4 shrink-0 text-[#D4AF6A]" aria-hidden="true" />
      <span>Sin conexión — Tus oraciones siguen guardadas en este dispositivo.</span>
    </div>
  );
};
