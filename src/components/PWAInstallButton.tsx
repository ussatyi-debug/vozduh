import React, { useState } from 'react';
import { Download, Check, Smartphone, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // Если приложение уже установлено и запущено с иконки рабочего стола
  if (isInstalled) {
    return (
      <div
        id="badge-pwa-installed"
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold"
        title="Приложение установлено и работает 100% автономно без интернета"
      >
        <Check className="h-3.5 w-3.5 text-emerald-600" />
        <span className="hidden sm:inline">Офлайн-приложение</span>
        <span className="sm:hidden">Офлайн</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        id="btn-install-app"
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
        title="Установить приложение на телефон или компьютер"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Установить</span>
      </button>

      {/* ПОНЯТНАЯ И КРАТКАЯ ПОДСКАЗКА, ЕСЛИ БРАУЗЕР НЕ ОТКРЫЛ ДИАЛОГ АВТОМАТИЧЕСКИ */}
      {showGuide && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Smartphone className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Установка на устройство
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-2.5 text-xs text-slate-600 mb-4">
                <p>
                  1. Внизу экрана Safari нажмите кнопку <strong>«Поделиться»</strong> (квадрат со стрелкой вверх).
                </p>
                <p>
                  2. Прокрутите меню вниз и выберите <strong>«На экран "Домой"»</strong>.
                </p>
                <p>
                  3. Нажмите <strong>«Добавить»</strong>. Приложение появится на рабочем столе и будет работать без интернета.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs text-slate-600 mb-4">
                <p>
                  1. В браузере (Chrome / Яндекс / Edge) нажмите <strong>меню (три точки ⋮)</strong> в правом верхнем углу.
                </p>
                <p>
                  2. Выберите пункт <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong>.
                </p>
                <p>
                  3. Приложение установится на телефон с собственной иконкой и будет работать <strong>полностью офлайн</strong> без доступа к интернету.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </>
  );
};
