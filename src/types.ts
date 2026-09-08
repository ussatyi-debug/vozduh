export type DuctMaterial = 'plastic' | 'zinc' | 'corrugated';

export interface MaterialInfo {
  id: DuctMaterial;
  name: string;
  nameRu: string;
  shortDesc: string;
  roughnessMm: number; // ke in mm
  bendZeta: number; // КМС поворота 90 градусов
  color: string;
  badgeBg: string;
}

export interface DuctParams {
  diameterMm: number; // 50 to 250 mm
  material: DuctMaterial;
  lengthM: number; // 2 to 400 m (1m step)
  bends90: number; // 0 to 20+ turns
  airflowM3h: number; // расход воздуха в м³/ч
}

export interface CalculationResult {
  velocityMs: number; // скорость потока (м/с)
  dynamicPressurePa: number; // динамическое давление (Па)
  reynoldsNumber: number; // число Рейнольдса
  frictionFactor: number; // коэффициент трения λ (лямбда)
  frictionLossPa: number; // потери на трение по длине (Па)
  specificFrictionLossPaPerM: number; // удельные потери (Па/м)
  bendsLossPa: number; // потери на поворотах (Па)
  totalResistancePa: number; // суммарное сопротивление (Па)
  totalResistanceMmH2O: number; // суммарное сопротивление (мм вод. ст.)
  resistanceCoeffK: number; // ΔP = K * L^2 (Па / (м³/ч)²)
  approxFanPowerWatts: number; // ориентировочная мощность вентилятора (Вт)
  velocityStatus: 'low' | 'optimal' | 'moderate' | 'high' | 'critical';
  velocityAdvice: string;
}

export interface CurvePoint {
  airflow: number;
  pressure: number;
  velocity: number;
}
