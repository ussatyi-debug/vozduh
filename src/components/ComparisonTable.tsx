import React from 'react';
import { ArrowRight, Layers, SlidersHorizontal } from 'lucide-react';
import { DuctMaterial, DuctParams } from '../types';
import { calculateDuctResistance, MATERIALS, STANDARD_DIAMETERS } from '../utils/ventCalculations';

interface ComparisonTableProps {
  params: DuctParams;
  onApplyDiameter: (dia: number) => void;
  onApplyMaterial: (mat: DuctMaterial) => void;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  params,
  onApplyDiameter,
  onApplyMaterial,
}) => {
  const currentResult = calculateDuctResistance(params);

  // Сравнение по материалам при текущих D, L, поворотах
  const materialComparisons = (['plastic', 'zinc', 'corrugated'] as DuctMaterial[]).map((mat) => {
    const res = calculateDuctResistance({ ...params, material: mat });
    const diffPa = res.totalResistancePa - currentResult.totalResistancePa;
    const percentDiff =
      currentResult.totalResistancePa > 0
        ? (diffPa / currentResult.totalResistancePa) * 100
        : 0;

    return {
      material: mat,
      name: MATERIALS[mat].nameRu,
      roughness: MATERIALS[mat].roughnessMm,
      totalPa: res.totalResistancePa,
      frictionPa: res.frictionLossPa,
      bendsPa: res.bendsLossPa,
      diffPa,
      percentDiff,
      isCurrent: params.material === mat,
    };
  });

  // Соседние диаметры для сравнения эффекта масштабирования
  const currentDiaIndex = STANDARD_DIAMETERS.findIndex((d) => d === params.diameterMm);
  const diametersToCompare = STANDARD_DIAMETERS.filter((dia) => {
    return [100, 125, 160, 200].includes(dia) || dia === params.diameterMm;
  }).slice(0, 5);

  return (
    <div id="card-comparison" className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col gap-5">
      {/* СРАВНЕНИЕ МАТЕРИАЛОВ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-semibold text-slate-900">
              Сравнение сопротивления по материалам
            </span>
          </div>
          <span className="text-xs text-slate-700">при Ø{params.diameterMm} мм, L={params.lengthM} м</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold">
                <th className="py-2.5 px-3 rounded-l-lg">Материал</th>
                <th className="py-2.5 px-2 text-right">Шероховатость</th>
                <th className="py-2.5 px-2 text-right">Трение L</th>
                <th className="py-2.5 px-2 text-right">Повороты 90°</th>
                <th className="py-2.5 px-3 text-right">Итого ΔP</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Разница</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materialComparisons.map((row) => (
                <tr
                  key={row.material}
                  onClick={() => !row.isCurrent && onApplyMaterial(row.material)}
                  className={`transition-colors cursor-pointer ${
                    row.isCurrent
                      ? 'bg-blue-50/70 font-semibold'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-2.5 px-3 flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: MATERIALS[row.material].color }}
                    />
                    <span className="text-slate-900">{row.name}</span>
                    {row.isCurrent && (
                      <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-medium">
                        Текущий
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                    {row.roughness} мм
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                    {row.frictionPa.toFixed(1)} Па
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                    {row.bendsPa.toFixed(1)} Па
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {row.totalPa.toFixed(1)} Па
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {row.isCurrent ? (
                      <span className="text-slate-600">—</span>
                    ) : row.diffPa < 0 ? (
                      <span className="text-emerald-700 font-bold">
                        {row.percentDiff.toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-rose-700 font-bold">
                        +{row.percentDiff.toFixed(0)}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ВЛИЯНИЕ ДИАМЕТРА НА СОПРОТИВЛЕНИЕ */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-900">
              Влияние диаметра на сопротивление (Закон 1/D⁵)
            </span>
          </div>
          <span className="text-[11px] text-slate-700">Материал: {MATERIALS[params.material].nameRu}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          {[100, 125, 160, 200].map((d) => {
            const res = calculateDuctResistance({ ...params, diameterMm: d });
            const isSelected = params.diameterMm === d;

            return (
              <button
                key={d}
                type="button"
                id={`dia-compare-${d}`}
                onClick={() => onApplyDiameter(d)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900">Ø {d} мм</span>
                  <span className="text-[11px] text-slate-700 font-mono">{res.velocityMs.toFixed(1)} м/с</span>
                </div>
                <div className="text-sm font-mono font-bold text-blue-700">
                  {res.totalResistancePa.toFixed(1)} <span className="text-[11px] font-normal text-slate-700">Па</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
