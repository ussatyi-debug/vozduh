import React from 'react';
import { CircleDot, CornerDownRight, Layers, Ruler, Wind } from 'lucide-react';
import { DuctMaterial, DuctParams } from '../types';
import { MATERIALS } from '../utils/ventCalculations';
import { SmartNumberInput } from './SmartNumberInput';

interface ParameterControlsProps {
  params: DuctParams;
  onChange: (updated: Partial<DuctParams>) => void;
}

const POPULAR_DIAMETERS = [100, 110, 125, 150, 160, 200];
const POPULAR_LENGTHS = [2, 5, 10, 20, 50, 100];
const POPULAR_BENDS = [0, 1, 2, 3, 4, 6];

export const ParameterControls: React.FC<ParameterControlsProps> = ({ params, onChange }) => {
  return (
    <div id="parameter-controls" className="space-y-4">
      {/* 1. ДИАМЕТР ВОЗДУХОВОДА */}
      <div id="control-diameter" className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <label htmlFor="diameter-input" className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600 text-xs font-bold">1</span>
            <CircleDot className="h-4 w-4 text-blue-600" />
            <span>Диаметр (D)</span>
          </label>
          <SmartNumberInput
            id="diameter-input"
            value={params.diameterMm}
            min={50}
            max={250}
            step={5}
            unit="мм"
            ariaLabel="Диаметр воздуховода в миллиметрах"
            onChange={(val) => onChange({ diameterMm: val })}
          />
        </div>

        {/* Слайдер диаметра */}
        <input
          id="diameter-slider"
          type="range"
          min={50}
          max={250}
          step={1}
          value={params.diameterMm}
          onChange={(e) => onChange({ diameterMm: Number(e.target.value) })}
          className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none my-2"
        />

        {/* Быстрые типоразмеры */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Стандарт:</span>
          {POPULAR_DIAMETERS.map((dia) => (
            <button
              key={dia}
              type="button"
              id={`dia-preset-${dia}`}
              onClick={() => onChange({ diameterMm: dia })}
              className={`px-2 py-0.5 text-xs font-medium rounded-md transition-colors border cursor-pointer ${
                params.diameterMm === dia
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Ø {dia}
            </button>
          ))}
        </div>
      </div>

      {/* 2. МАТЕРИАЛ КАНАЛА */}
      <div id="control-material" className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 text-xs font-bold">2</span>
          <Layers className="h-4 w-4 text-indigo-600" />
          <span className="text-sm font-semibold text-slate-900">Материал воздуховода</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['plastic', 'zinc', 'corrugated'] as DuctMaterial[]).map((matKey) => {
            const mat = MATERIALS[matKey];
            const isSelected = params.material === matKey;

            return (
              <button
                key={matKey}
                type="button"
                id={`material-${matKey}`}
                onClick={() => onChange({ material: matKey })}
                className={`py-2.5 px-2 rounded-xl text-center border-2 transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold shadow-2xs'
                    : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="text-xs sm:text-sm block">{mat.nameRu}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">k = {mat.roughnessMm} мм</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ДЛИНА ВОЗДУХОВОДА */}
      <div id="control-length" className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <label htmlFor="length-input" className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 text-xs font-bold">3</span>
            <Ruler className="h-4 w-4 text-emerald-600" />
            <span>Длина (L)</span>
          </label>
          <SmartNumberInput
            id="length-input"
            value={params.lengthM}
            min={1}
            max={400}
            step={1}
            unit="м"
            ariaLabel="Длина воздуховода в метрах"
            onChange={(val) => onChange({ lengthM: val })}
          />
        </div>

        {/* Слайдер длины */}
        <input
          id="length-slider"
          type="range"
          min={1}
          max={400}
          step={1}
          value={params.lengthM}
          onChange={(e) => onChange({ lengthM: Number(e.target.value) })}
          className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none my-2"
        />

        {/* Быстрые кнопки длины */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Быстро:</span>
          {POPULAR_LENGTHS.map((len) => (
            <button
              key={len}
              type="button"
              id={`len-preset-${len}`}
              onClick={() => onChange({ lengthM: len })}
              className={`px-2 py-0.5 text-xs font-medium rounded-md transition-colors border cursor-pointer ${
                params.lengthM === len
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {len} м
            </button>
          ))}
        </div>
      </div>

      {/* 4. ПОВОРОТЫ 90° */}
      <div id="control-bends" className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <label htmlFor="bends-input" className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-50 text-amber-600 text-xs font-bold">4</span>
            <CornerDownRight className="h-4 w-4 text-amber-600" />
            <span>Повороты 90°</span>
          </label>
          <SmartNumberInput
            id="bends-input"
            value={params.bends90}
            min={0}
            max={30}
            step={1}
            unit="шт"
            ariaLabel="Количество поворотов под 90 градусов"
            onChange={(val) => onChange({ bends90: val })}
          />
        </div>

        {/* Быстрые кнопки количества поворотов */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {POPULAR_BENDS.map((b) => (
            <button
              key={b}
              type="button"
              id={`bends-preset-${b}`}
              onClick={() => onChange({ bends90: b })}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors border cursor-pointer ${
                params.bends90 === b
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {b === 0 ? 'Без поворотов (0)' : `${b} шт`}
            </button>
          ))}
        </div>
      </div>

      {/* 5. РАСХОД ВОЗДУХА */}
      <div id="control-airflow" className="rounded-xl border border-blue-100 bg-blue-50/20 p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <label htmlFor="airflow-input" className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white text-xs font-bold">Q</span>
            <Wind className="h-4 w-4 text-blue-600" />
            <span>Расход воздуха</span>
          </label>
          <SmartNumberInput
            id="airflow-input"
            value={params.airflowM3h}
            min={10}
            max={3000}
            step={10}
            unit="м³/ч"
            ariaLabel="Расход воздуха в кубических метрах в час"
            onChange={(val) => onChange({ airflowM3h: val })}
          />
        </div>

        {/* Слайдер расхода */}
        <input
          id="airflow-slider"
          type="range"
          min={20}
          max={600}
          step={10}
          value={params.airflowM3h}
          onChange={(e) => onChange({ airflowM3h: Number(e.target.value) })}
          className="w-full accent-blue-600 cursor-pointer h-2 bg-blue-200/60 rounded-lg appearance-none my-2"
        />

        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <button
            type="button"
            onClick={() => onChange({ airflowM3h: 60 })}
            className={`px-2 py-0.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
              params.airflowM3h === 60 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            Санузел (60)
          </button>
          <button
            type="button"
            onClick={() => onChange({ airflowM3h: 120 })}
            className={`px-2 py-0.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
              params.airflowM3h === 120 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            Комната (120)
          </button>
          <button
            type="button"
            onClick={() => onChange({ airflowM3h: 250 })}
            className={`px-2 py-0.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
              params.airflowM3h === 250 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            Вытяжка (250)
          </button>
          <button
            type="button"
            onClick={() => onChange({ airflowM3h: 400 })}
            className={`px-2 py-0.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
              params.airflowM3h === 400 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            Турбо (400)
          </button>
        </div>
      </div>
    </div>
  );
};
