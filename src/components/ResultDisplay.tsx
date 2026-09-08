import React from 'react';
import { Activity, AlertTriangle, CheckCircle2, Gauge, Zap } from 'lucide-react';
import { CalculationResult, DuctParams } from '../types';

interface ResultDisplayProps {
  params: DuctParams;
  result: CalculationResult;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ params, result }) => {
  const frictionPercent =
    result.totalResistancePa > 0
      ? Math.round((result.frictionLossPa / result.totalResistancePa) * 100)
      : 50;
  const bendsPercent = 100 - frictionPercent;

  // Рекомендуемое давление вентилятора (+15% запас)
  const recommendedFanPressure = Math.round(result.totalResistancePa * 1.15);

  const statusColors = {
    low: {
      badge: 'bg-slate-100 text-slate-700 border-slate-300',
      label: 'Тихий поток',
      bar: 'bg-slate-400',
    },
    optimal: {
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      label: 'Оптимально (1.5–3.5 м/с)',
      bar: 'bg-emerald-500',
    },
    moderate: {
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      label: 'Допустимо (3.5–5.0 м/с)',
      bar: 'bg-blue-500',
    },
    high: {
      badge: 'bg-amber-100 text-amber-900 border-amber-300',
      label: 'Шумный поток (5–7 м/с)',
      bar: 'bg-amber-500',
    },
    critical: {
      badge: 'bg-rose-100 text-rose-900 border-rose-300',
      label: 'Критично (>7 м/с)',
      bar: 'bg-rose-600',
    },
  }[result.velocityStatus];

  return (
    <div id="result-display" className="space-y-4">
      {/* 1. ГЛАВНАЯ КАРТОЧКА СОПРОТИВЛЕНИЯ */}
      <div
        id="card-total-resistance"
        className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 text-white shadow-md relative overflow-hidden"
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
              <Activity className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Сопротивление канала
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            {params.airflowM3h} м³/ч
          </span>
        </div>

        {/* Главная цифра Паскалей */}
        <div className="flex items-baseline justify-between gap-2 my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
              {result.totalResistancePa < 10
                ? result.totalResistancePa.toFixed(1)
                : Math.round(result.totalResistancePa)}
            </span>
            <span className="text-2xl font-bold text-blue-400">Па</span>
          </div>

          <div className="text-right">
            <span className="text-sm font-mono text-slate-300 block">
              {result.totalResistanceMmH2O.toFixed(2)} мм вод. ст.
            </span>
          </div>
        </div>

        {/* Рекомендуемый напор вентилятора */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Вентилятор с запасом (+15%):</span>
          <span className="font-mono font-bold text-emerald-400">
            ≥ {recommendedFanPressure} Па
          </span>
        </div>
      </div>

      {/* 2. СКОРОСТЬ ВОЗДУХА И ПОТЕРИ В ЕДИНОМ КОМПАКТНОМ БЛОКЕ */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Скорость потока */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Скорость потока
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold font-mono text-slate-900">
                {result.velocityMs.toFixed(2)} м/с
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColors.badge}`}>
                {statusColors.label}
              </span>
            </div>
          </div>

          {/* Индикаторная полоска */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full ${statusColors.bar} transition-all duration-300`}
              style={{ width: `${Math.min(100, (result.velocityMs / 8) * 100)}%` }}
            />
          </div>

          <p className="text-xs text-slate-600 mt-1.5 leading-normal">
            {result.velocityAdvice}
          </p>
        </div>

        <div className="border-t border-slate-100 pt-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block mb-2">
            Из чего складываются потери:
          </span>

          <div className="grid grid-cols-2 gap-2">
            {/* Трение */}
            <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100 flex flex-col justify-between">
              <span className="text-xs text-emerald-950 font-medium">Трение ({params.lengthM} м)</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-base font-bold font-mono text-emerald-900">
                  {result.frictionLossPa.toFixed(1)} Па
                </span>
                <span className="text-xs font-semibold text-emerald-600">{frictionPercent}%</span>
              </div>
            </div>

            {/* Повороты */}
            <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-100 flex flex-col justify-between">
              <span className="text-xs text-amber-950 font-medium">
                Повороты ({params.bends90} шт)
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-base font-bold font-mono text-amber-900">
                  {result.bendsLossPa.toFixed(1)} Па
                </span>
                <span className="text-xs font-semibold text-amber-600">{bendsPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
