import React, { useState } from 'react';
import { TrendingUp, ZoomIn } from 'lucide-react';
import { DuctParams } from '../types';
import { calculateDuctResistance, generateResistanceCurve } from '../utils/ventCalculations';

interface ResistanceChartProps {
  params: DuctParams;
}

export const ResistanceChart: React.FC<ResistanceChartProps> = ({ params }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ flow: number; pressure: number; velocity: number } | null>(null);

  // Генерируем точки для графика
  const points = generateResistanceCurve(params, 1.8, 30);
  const currentResult = calculateDuctResistance(params);

  // Границы осей
  const maxFlow = Math.max(...points.map((p) => p.airflow));
  const maxPressure = Math.max(...points.map((p) => p.pressure), currentResult.totalResistancePa * 1.2, 10);

  // Размеры SVG
  const width = 500;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 55 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Функция масштабирования
  const scaleX = (flow: number) => padding.left + (flow / maxFlow) * innerWidth;
  const scaleY = (pressure: number) => padding.top + innerHeight - (pressure / maxPressure) * innerHeight;

  // Построение пути кривой
  const pathD = points.reduce((acc, pt, idx) => {
    const x = scaleX(pt.airflow);
    const y = scaleY(pt.pressure);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Заливка под графиком
  const areaD = `${pathD} L ${scaleX(points[points.length - 1].airflow)} ${scaleY(0)} L ${scaleX(0)} ${scaleY(0)} Z`;

  // Текущая точка
  const curX = scaleX(params.airflowM3h);
  const curY = scaleY(currentResult.totalResistancePa);

  // Сетки оси Y (4 деления)
  const yTicks = [0, maxPressure * 0.25, maxPressure * 0.5, maxPressure * 0.75, maxPressure];
  // Сетки оси X (4 деления)
  const xTicks = [0, maxFlow * 0.25, maxFlow * 0.5, maxFlow * 0.75, maxFlow];

  return (
    <div id="card-resistance-chart" className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-slate-900">
            Аэродинамическая характеристика сети (P — Q)
          </span>
        </div>
        <span className="text-xs text-slate-700 font-mono">
          ΔP ~ V² (квадратичный рост)
        </span>
      </div>

      <div className="relative w-full aspect-[2/1] sm:aspect-[2.3/1] select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Сетка Y */}
          {yTicks.map((val, idx) => {
            const y = scaleY(val);
            return (
              <g key={`y-${idx}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-700 font-mono"
                >
                  {Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* Сетка X */}
          {xTicks.map((val, idx) => {
            const x = scaleX(val);
            return (
              <g key={`x-${idx}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                />
                <text
                  x={x}
                  y={height - padding.bottom + 16}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-700 font-mono"
                >
                  {Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* Подписи осей */}
          <text
            x={padding.left - 36}
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90 ${padding.left - 36} ${height / 2})`}
            className="text-[11px] font-medium fill-slate-700"
          >
            Сопротивление (Па)
          </text>
          <text
            x={width / 2}
            y={height - 8}
            textAnchor="middle"
            className="text-[11px] font-medium fill-slate-700"
          >
            Расход воздуха (м³/ч)
          </text>

          {/* Заливка кривой */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Градиент заливки */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Сама кривая характеристики */}
          <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />

          {/* Рабочая точка текущего расчета */}
          <g transform={`translate(${curX}, ${curY})`}>
            {/* Пульсирующий ореол */}
            <circle r="10" fill="#3b82f6" opacity="0.25" className="animate-ping" />
            <circle r="6" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2" />
          </g>

          {/* Невидимые интерактивные области для ховера */}
          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={scaleX(pt.airflow)}
              cy={scaleY(pt.pressure)}
              r="12"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() =>
                setHoveredPoint({
                  flow: pt.airflow,
                  pressure: pt.pressure,
                  velocity: pt.velocity,
                })
              }
            />
          ))}

          {/* Ховер-точка при наведении */}
          {hoveredPoint && (
            <g transform={`translate(${scaleX(hoveredPoint.flow)}, ${scaleY(hoveredPoint.pressure)})`}>
              <circle r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
            </g>
          )}
        </svg>

        {/* Тултип при наведении или инфо о рабочей точке */}
        <div className="absolute top-2 right-4 bg-slate-900/90 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-xs font-mono shadow-md border border-slate-700 flex items-center gap-3 pointer-events-none">
          {hoveredPoint ? (
            <>
              <span className="text-amber-300 font-semibold">{hoveredPoint.flow} м³/ч</span>
              <span>→</span>
              <span className="text-blue-300 font-bold">{hoveredPoint.pressure.toFixed(1)} Па</span>
              <span className="text-slate-400">({hoveredPoint.velocity.toFixed(1)} м/с)</span>
            </>
          ) : (
            <>
              <span className="text-emerald-400 font-semibold">{params.airflowM3h} м³/ч</span>
              <span>→</span>
              <span className="text-white font-bold">{currentResult.totalResistancePa.toFixed(1)} Па</span>
              <span className="text-slate-300">({currentResult.velocityMs.toFixed(1)} м/с)</span>
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-600 mt-2 text-center">
        Синяя точка — текущая рабочая точка вашей вентиляционной шахты. Наведите курсор на кривую для просмотра других расходов.
      </p>
    </div>
  );
};
