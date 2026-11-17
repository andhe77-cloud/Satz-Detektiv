import React from 'react';
import { CampusLessonRange, CampusLessonStop, CampusMaxLesson } from '../../core/types';

export const CAMPUS_LESSON_STOPS: CampusLessonStop[] = [0, 10, 20, 30, 40, 50, 60, 68];

interface LessonRangeSliderProps {
  value: CampusLessonRange;
  onChange: (next: CampusLessonRange) => void;
  cardCount?: number;
  label?: string;
}

export const LessonRangeSlider: React.FC<LessonRangeSliderProps> = ({
  value,
  onChange,
  cardCount,
  label = 'Lektionsbereich (Von – Bis)',
}) => {
  const fromIdx = Math.max(0, CAMPUS_LESSON_STOPS.indexOf(value.from));
  const rawToIdx = CAMPUS_LESSON_STOPS.indexOf(value.to);
  const toIdx = rawToIdx > fromIdx ? rawToIdx : Math.min(CAMPUS_LESSON_STOPS.length - 1, fromIdx + 1);
  const maxIdx = CAMPUS_LESSON_STOPS.length - 1;

  const leftPct = (fromIdx / maxIdx) * 100;
  const rightPct = (toIdx / maxIdx) * 100;
  const effectiveStart = value.from === 0 ? 1 : value.from + 1;

  const handleFromChange = (nextIdx: number) => {
    const clampedIdx = Math.min(nextIdx, toIdx - 1);
    const nextFrom = CAMPUS_LESSON_STOPS[Math.max(0, clampedIdx)];
    onChange({ from: nextFrom, to: value.to });
  };

  const handleToChange = (nextIdx: number) => {
    const clampedIdx = Math.max(nextIdx, fromIdx + 1);
    const nextTo = CAMPUS_LESSON_STOPS[Math.min(maxIdx, clampedIdx)] as CampusMaxLesson;
    onChange({ from: value.from, to: nextTo });
  };

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs">
        <span className="font-semibold text-[#241C16] dark:text-[#F2ECE1]">{label}:</span>
        <span className="font-mono-tab font-bold text-[#9B2C2C] dark:text-[#E06C65] text-sm">
          {value.from} – {value.to}
        </span>
        <span className="text-[#6A5A4C] dark:text-[#B9AA98]">
          (Lektion {effectiveStart}–{value.to}
          {typeof cardCount === 'number' ? ` · ${cardCount} Karten` : ''})
        </span>
      </div>

      {/* Dual-thumb range track */}
      <div className="relative h-8 flex items-center select-none px-0.5">
        <div className="relative w-full h-2 rounded-full bg-[#DED4C3] dark:bg-[#3A312A]">
          <div
            className="absolute top-0 bottom-0 rounded-full bg-[#9B2C2C] dark:bg-[#E06C65]"
            style={{
              left: `${leftPct}%`,
              width: `${Math.max(0, rightPct - leftPct)}%`,
            }}
          />
        </div>

        <input
          type="range"
          min={0}
          max={maxIdx}
          step={1}
          value={fromIdx}
          aria-label="Campus Von-Lektion"
          onChange={(e) => handleFromChange(Number(e.target.value))}
          className={`dual-range-input absolute inset-x-0 w-full h-8 ${
            fromIdx >= maxIdx - 2 ? 'z-20' : 'z-10'
          }`}
        />
        <input
          type="range"
          min={0}
          max={maxIdx}
          step={1}
          value={toIdx}
          aria-label="Campus Bis-Lektion"
          onChange={(e) => handleToChange(Number(e.target.value))}
          className="dual-range-input absolute inset-x-0 w-full h-8 z-10"
        />
      </div>

      {/* Tick labels */}
      <div className="flex items-center justify-between text-[11px] font-mono-tab text-[#6A5A4C] dark:text-[#B9AA98] px-0.5">
        {CAMPUS_LESSON_STOPS.map((stop) => {
          const inRange = stop >= value.from && stop <= value.to;
          return (
            <span
              key={stop}
              className={
                inRange
                  ? 'font-bold text-[#241C16] dark:text-[#F2ECE1]'
                  : 'opacity-70'
              }
            >
              {stop}
            </span>
          );
        })}
      </div>
    </div>
  );
};
