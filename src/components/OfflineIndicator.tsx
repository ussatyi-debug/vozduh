import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      aria-label="Уведомление о сетевом подключении"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900/95 text-white px-4 py-2.5 text-xs font-medium shadow-xl border border-slate-700 backdrop-blur-xs animate-fade-in"
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
        <WifiOff className="h-3.5 w-3.5" />
      </div>
      <div>
        <span className="font-semibold block text-slate-100">Офлайн-режим</span>
        <span className="text-[11px] text-slate-400">Калькулятор работает полностью автономно</span>
      </div>
    </aside>
  );
};
