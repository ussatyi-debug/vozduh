import React, { useState, useEffect } from 'react';

interface SmartNumberInputProps {
  id: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  className?: string;
  ariaLabel?: string;
}

export const SmartNumberInput: React.FC<SmartNumberInputProps> = ({
  id,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  className = '',
  ariaLabel,
}) => {
  const [localText, setLocalText] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);

  // Синхронизируем локальный ввод с внешним value, если поле ввода не активно
  useEffect(() => {
    if (!isFocused) {
      setLocalText(String(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalText(raw);

    // Если введено число, передаем его наверх БЕЗ принудительного округления/зажатия до min,
    // чтобы пользователь мог свободно стереть и ввести, например, "100" (не блокируя на "1")
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      // Передаем значение в родительский компонент, если оно положительное
      if (parsed >= 0) {
        onChange(parsed);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    let num = parseFloat(localText);
    if (isNaN(num) || localText.trim() === '') {
      num = min;
    } else {
      if (num < min) num = min;
      if (num > max) num = max;
    }
    // Округляем до разумного шага
    if (step >= 1) {
      num = Math.round(num);
    }
    setLocalText(String(num));
    onChange(num);
  };

  const handleStep = (direction: 'up' | 'down') => {
    const current = parseFloat(localText) || value;
    const delta = direction === 'up' ? step : -step;
    let next = current + delta;
    if (next < min) next = min;
    if (next > max) next = max;
    if (step >= 1) next = Math.round(next);
    setLocalText(String(next));
    onChange(next);
  };

  return (
    <div className={`inline-flex items-center rounded-lg border border-slate-200 bg-white shadow-2xs ${className}`}>
      {/* Кнопка минус для быстрого шага (удобно на смартфонах) */}
      <button
        type="button"
        id={`${id}-step-down`}
        onClick={() => handleStep('down')}
        disabled={value <= min}
        aria-label="Уменьшить"
        className="flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-l-lg transition-colors cursor-pointer text-base font-bold select-none active:bg-slate-200"
      >
        −
      </button>

      {/* Поле свободного ввода */}
      <div className="flex items-baseline px-2">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          aria-label={ariaLabel || id}
          value={localText}
          onFocus={() => setIsFocused(true)}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="w-14 sm:w-16 text-center font-bold text-slate-900 text-sm sm:text-base bg-transparent outline-none select-all"
        />
        {unit && <span className="text-xs font-medium text-slate-500 select-none">{unit}</span>}
      </div>

      {/* Кнопка плюс для быстрого шага */}
      <button
        type="button"
        id={`${id}-step-up`}
        onClick={() => handleStep('up')}
        disabled={value >= max}
        aria-label="Увеличить"
        className="flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-r-lg transition-colors cursor-pointer text-base font-bold select-none active:bg-slate-200"
      >
        +
      </button>
    </div>
  );
};
