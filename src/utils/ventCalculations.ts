import { CalculationResult, CurvePoint, DuctMaterial, DuctParams, MaterialInfo } from '../types';

export const MATERIALS: Record<DuctMaterial, MaterialInfo> = {
  plastic: {
    id: 'plastic',
    name: 'Пластик (ПВХ)',
    nameRu: 'Пластик (ПВХ)',
    shortDesc: 'Минимальное трение, идеально гладкие стенки',
    roughnessMm: 0.02,
    bendZeta: 0.35,
    color: '#0284c7', // Sky 600
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  zinc: {
    id: 'zinc',
    name: 'Цинк (Оцинкованная сталь)',
    nameRu: 'Цинк (Оцинковка)',
    shortDesc: 'Классический жесткий воздуховод со швами',
    roughnessMm: 0.1,
    bendZeta: 0.5,
    color: '#475569', // Slate 600
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  corrugated: {
    id: 'corrugated',
    name: 'Гофра (Гибкий канал)',
    nameRu: 'Гофра (Гибкий)',
    shortDesc: 'Ребристая спираль, повышенное сопротивление и завихрения',
    roughnessMm: 2.0,
    bendZeta: 1.1,
    color: '#d97706', // Amber 600
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
  },
};

// Физические константы при 20 °C и нормальном давлении
const AIR_DENSITY = 1.204; // кг/м³ (плотность сухого воздуха при 20°C)
const KINEMATIC_VISCOSITY = 15.06e-6; // м²/с (кинематическая вязкость воздуха)

/**
 * Расчет аэродинамического сопротивления воздуховода
 */
export function calculateDuctResistance(params: DuctParams): CalculationResult {
  const { diameterMm, material, lengthM, bends90, airflowM3h } = params;
  const matInfo = MATERIALS[material];

  // Геометрия
  const diameterM = Math.max(diameterMm, 1) / 1000;
  const crossSectionArea = (Math.PI * Math.pow(diameterM, 2)) / 4; // м²

  // Расход и скорость
  const safeAirflow = Math.max(airflowM3h, 0.1);
  const flowM3s = safeAirflow / 3600;
  const velocityMs = flowM3s / crossSectionArea;

  // Динамическое давление: Pd = 0.5 * rho * v^2
  const dynamicPressurePa = 0.5 * AIR_DENSITY * Math.pow(velocityMs, 2);

  // Число Рейнольдса: Re = (v * D) / nu
  const reynoldsNumber = (velocityMs * diameterM) / KINEMATIC_VISCOSITY;

  // Коэффициент гидравлического трения лямбда (по формуле Альтшуля)
  let frictionFactor = 0.02;
  if (reynoldsNumber < 2000) {
    // Ламинарный режим (крайне редкий в вентсистемах)
    frictionFactor = 64 / Math.max(reynoldsNumber, 10);
  } else {
    // Турбулентный режим (типичный для вентиляции)
    const relativeRoughness = matInfo.roughnessMm / diameterMm;
    frictionFactor = 0.11 * Math.pow(relativeRoughness + 68 / reynoldsNumber, 0.25);
  }

  // Потери на трение по длине (Дарси-Вейсбах): dP = lambda * (L / D) * Pd
  const frictionLossPa = frictionFactor * (lengthM / diameterM) * dynamicPressurePa;
  const specificFrictionLossPaPerM = frictionLossPa / Math.max(lengthM, 0.001);

  // Потери на местных сопротивлениях (повороты 90°): dP_мест = N * zeta * Pd
  const bendsLossPa = Math.max(0, bends90) * matInfo.bendZeta * dynamicPressurePa;

  // Полное сопротивление сети
  const totalResistancePa = frictionLossPa + bendsLossPa;

  // Перевод в мм вод. ст. (1 мм вод. ст. ≈ 9.80665 Па)
  const totalResistanceMmH2O = totalResistancePa / 9.80665;

  // Характеристика сети K = dP / L^2
  const resistanceCoeffK = totalResistancePa / Math.pow(safeAirflow, 2);

  // Ориентировочная потребляемая мощность вентилятора (при КПД ~ 55%)
  const aeroPowerWatts = (safeAirflow * totalResistancePa) / 3600;
  const approxFanPowerWatts = aeroPowerWatts / 0.55;

  // Оценка скорости воздуха
  let velocityStatus: CalculationResult['velocityStatus'] = 'optimal';
  let velocityAdvice = 'Идеальная скорость для тихой вентиляции жилых помещений.';

  if (velocityMs < 1.5) {
    velocityStatus = 'low';
    velocityAdvice = 'Низкая скорость потока. Подходит для естественной тяги и бесшумной работы.';
  } else if (velocityMs <= 3.5) {
    velocityStatus = 'optimal';
    velocityAdvice = 'Оптимальный диапазон (1.5–3.5 м/с) для квартир и домов. Минимальный аэродинамический шум.';
  } else if (velocityMs <= 5.0) {
    velocityStatus = 'moderate';
    velocityAdvice = 'Допустимая скорость для магистральных каналов или мощной вытяжки. Возможен легкий шум воздуха.';
  } else if (velocityMs <= 7.0) {
    velocityStatus = 'high';
    velocityAdvice = 'Повышенная скорость (5–7 м/с). Заметный шум и свист в канале. Рекомендуется увеличить диаметр трубы.';
  } else {
    velocityStatus = 'critical';
    velocityAdvice = 'Критически высокая скорость (>7 м/с)! Сильный гул, турбулентность и скачок сопротивления. Обязательно увеличьте диаметр!';
  }

  return {
    velocityMs,
    dynamicPressurePa,
    reynoldsNumber,
    frictionFactor,
    frictionLossPa,
    specificFrictionLossPaPerM,
    bendsLossPa,
    totalResistancePa,
    totalResistanceMmH2O,
    resistanceCoeffK,
    approxFanPowerWatts,
    velocityStatus,
    velocityAdvice,
  };
}

/**
 * Построение точек аэродинамической кривой сопротивления P(Q)
 */
export function generateResistanceCurve(params: DuctParams, maxFlowMultiplier = 1.6, pointsCount = 20): CurvePoint[] {
  const currentFlow = Math.max(params.airflowM3h, 50);
  const maxFlow = Math.max(currentFlow * maxFlowMultiplier, 200);
  const step = maxFlow / pointsCount;

  const points: CurvePoint[] = [];

  for (let i = 0; i <= pointsCount; i++) {
    const flow = i === 0 ? 5 : Math.round(i * step);
    const res = calculateDuctResistance({
      ...params,
      airflowM3h: flow,
    });
    points.push({
      airflow: flow,
      pressure: res.totalResistancePa,
      velocity: res.velocityMs,
    });
  }

  return points;
}

/**
 * Стандартные типоразмеры круглых воздуховодов в диапазоне 50-250 мм
 */
export const STANDARD_DIAMETERS = [50, 60, 80, 100, 110, 125, 140, 150, 160, 180, 200, 220, 250];

/**
 * Типичные сценарии расхода воздуха для быстрой установки
 */
export interface AirflowPreset {
  id: string;
  name: string;
  flowM3h: number;
  description: string;
}

export const AIRFLOW_PRESETS: AirflowPreset[] = [
  { id: 'bath', name: 'Санузел / Ванная', flowM3h: 60, description: 'Вытяжка санузла (50–90 м³/ч)' },
  { id: 'room', name: 'Жилая комната', flowM3h: 120, description: 'Воздухообмен на 2–3 человек' },
  { id: 'kitchen', name: 'Кухонная вытяжка', flowM3h: 250, description: 'Стандартный 1–2 режим вытяжки' },
  { id: 'kitchen_boost', name: 'Турбо-вытяжка', flowM3h: 400, description: 'Интенсивный режим вытяжки плиты' },
  { id: 'house', name: 'Коттедж / Приток', flowM3h: 600, description: 'Магистраль общеобменной системы' },
];
