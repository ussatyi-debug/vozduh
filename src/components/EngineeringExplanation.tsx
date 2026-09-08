import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, FileCode } from 'lucide-react';

export const EngineeringExplanation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id="card-engineering-explanation" className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <button
        type="button"
        id="toggle-engineering-details"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
            Методика расчета и формулы (СП 60.13330 / Справочник Идельчика)
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-700">
          <span>{isOpen ? 'Скрыть' : 'Показать формулы'}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-700 space-y-4 leading-relaxed">
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">1. Скорость потока и динамическое давление:</h4>
            <p className="font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800">
              v = L / (3600 · S), где S = π · D² / 4 (м²)<br />
              Pдин = (ρ · v²) / 2, где ρ = 1.204 кг/м³ (воздух при +20 °C)
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-1">
              2. Потери давления на трение по длине (Формула Дарси — Вейсбаха):
            </h4>
            <p className="font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800">
              ΔPтр = λ · (L / D) · Pдин
            </p>
            <p className="mt-1">
              Коэффициент гидравлического трения λ рассчитывается по формуле Альтшуля:
            </p>
            <p className="font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 mt-1">
              λ = 0.11 · (ke / D + 68 / Re)^0.25
            </p>
            <p className="mt-1 text-slate-700">
              Где ke — эквивалентная шероховатость стенок воздуховода:
              <br />• Пластик (ПВХ гладкий): <strong>0.02 мм</strong>
              <br />• Оцинкованная сталь (шовный воздуховод): <strong>0.10 мм</strong>
              <br />• Гофра (гибкий ребристый рукав): <strong>2.00 мм</strong> (сопротивление выше в 2–3 раза)
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-1">
              3. Местные сопротивления (повороты под 90 градусов):
            </h4>
            <p className="font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800">
              ΔPмест = N · ζ90 · Pдин
            </p>
            <p className="mt-1 text-slate-700">
              Коэффициент местного сопротивления (КМС) ζ90:
              <br />• Отвод пластиковый скругленный: <strong>ζ = 0.35</strong>
              <br />• Колено стальное оцинкованное 4-секционное: <strong>ζ = 0.50</strong>
              <br />• Гофрированный поворот (со складками и сужением): <strong>ζ = 1.10</strong>
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-1">4. Суммарное сопротивление сети:</h4>
            <p className="font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800">
              ΔPполн = ΔPтр + ΔPмест (Па)<br />
              1 мм вод. ст. = 9.80665 Па
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
