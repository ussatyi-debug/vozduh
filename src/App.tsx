import React, { useState, useMemo } from 'react';
import {
  Fan,
  RotateCcw,
  Share2,
  Check,
  BarChart2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DuctMaterial, DuctParams } from './types';
import { calculateDuctResistance, MATERIALS } from './utils/ventCalculations';
import { ParameterControls } from './components/ParameterControls';
import { ResultDisplay } from './components/ResultDisplay';
import { ResistanceChart } from './components/ResistanceChart';
import { ComparisonTable } from './components/ComparisonTable';
import { EngineeringExplanation } from './components/EngineeringExplanation';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

const DEFAULT_PARAMS: DuctParams = {
  diameterMm: 125, // от 50 до 250 мм
  material: 'plastic', // пластик / гофра / цинк
  lengthM: 10, // от 1 до 400 м
  bends90: 2, // количество поворотов под 90°
  airflowM3h: 180, // расход воздуха м³/ч
};

export default function App() {
  const [params, setParams] = useState<DuctParams>(DEFAULT_PARAMS);
  const [copied, setCopied] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Перерасчет при изменении любых параметров
  const result = useMemo(() => calculateDuctResistance(params), [params]);

  const handleParamChange = (updated: Partial<DuctParams>) => {
    setParams((prev) => ({ ...prev, ...updated }));
  };

  const handleReset = () => {
    setParams(DEFAULT_PARAMS);
  };

  const handleCopySummary = () => {
    const mat = MATERIALS[params.material].nameRu;
    const summary = `Расчет вентиляции:
• Диаметр: Ø${params.diameterMm} мм
• Материал: ${mat}
• Длина: ${params.lengthM} м
• Поворотов 90°: ${params.bends90} шт.
• Расход: ${params.airflowM3h} м³/ч
-------------------------------
• Сопротивление: ${Math.round(result.totalResistancePa)} Па (${result.totalResistanceMmH2O.toFixed(2)} мм вод. ст.)
• Скорость: ${result.velocityMs.toFixed(2)} м/с
• Трение по длине: ${result.frictionLossPa.toFixed(1)} Па
• Потери на поворотах: ${result.bendsLossPa.toFixed(1)} Па
• Рекомендуемый напор вентилятора: ≥ ${Math.round(result.totalResistancePa * 1.15)} Па`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-12">
      {/* ШАПКА ПРИЛОЖЕНИЯ */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-2xs">
              <Fan className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Калькулятор вентиляции
              </h1>
              <span className="text-[11px] text-slate-500 hidden sm:block">
                Аэродинамическое сопротивление воздуховодов
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* КНОПКА УСТАНОВКИ НА УСТРОЙСТВО / ИНДИКАТОР ОФЛАЙН-ПРИЛОЖЕНИЯ */}
            <PWAInstallButton />

            <button
              type="button"
              id="button-copy-summary"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
              title="Скопировать расчет в буфер обмена"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Share2 className="h-3.5 w-3.5 text-slate-500" />
              )}
              <span className="hidden sm:inline">{copied ? 'Скопировано' : 'Копировать'}</span>
            </button>

            <button
              type="button"
              id="button-reset-params"
              onClick={handleReset}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              title="Сбросить параметры к стандартным"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6">
        {/* СЕТКА: ВВОД ДАННЫХ И РЕЗУЛЬТАТЫ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* ВВОД ПАРАМЕТРОВ (5 параметров) */}
          <div className="md:col-span-7">
            <ParameterControls params={params} onChange={handleParamChange} />
          </div>

          {/* ГЛАВНЫЙ РЕЗУЛЬТАТ */}
          <div className="md:col-span-5 md:sticky md:top-20">
            <ResultDisplay params={params} result={result} />
          </div>
        </div>

        {/* ДОПОЛНИТЕЛЬНЫЙ БЛОК: ГРАФИК, СРАВНЕНИЕ И ФОРМУЛЫ */}
        <div className="mt-8 border-t border-slate-200 pt-5">
          <button
            type="button"
            id="toggle-analytics-btn"
            onClick={() => setShowAnalytics((prev) => !prev)}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer text-left shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <BarChart2 className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-900 block">
                  График сопротивления, сравнение диаметров и формулы
                </span>
                <span className="text-[11px] text-slate-500">
                  {showAnalytics ? 'Нажмите, чтобы свернуть детали' : 'Нажмите, чтобы развернуть подробную инженерную справку'}
                </span>
              </div>
            </div>
            <div className="text-slate-400">
              {showAnalytics ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </button>

          {showAnalytics && (
            <div className="mt-5 space-y-6 animate-fade-in">
              {/* АЭРОДИНАМИЧЕСКИЙ ГРАФИК */}
              <ResistanceChart params={params} />

              {/* ТАБЛИЦА СРАВНЕНИЯ МАТЕРИАЛОВ И ДИАМЕТРОВ */}
              <ComparisonTable
                params={params}
                onApplyDiameter={(d) => handleParamChange({ diameterMm: d })}
                onApplyMaterial={(m) => handleParamChange({ material: m })}
              />

              {/* СПРАВКА ПО ФОРМУЛАМ И МЕТОДИКЕ */}
              <EngineeringExplanation />
            </div>
          )}
        </div>
      </main>

      {/* ИНДИКАТОР ОФЛАЙН РЕЖИМА */}
      <OfflineIndicator />
    </div>
  );
}
