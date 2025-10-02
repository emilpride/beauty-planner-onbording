"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type DatePickerProps = {
  value?: Date | null;
  min?: Date;
  max?: Date;
  onConfirm: (date: Date) => void;
  onCancel?: () => void;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function clampDate(d: Date, min?: Date, max?: Date) {
  if (min && d < min) return min;
  if (max && d > max) return max;
  return d;
}
function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DatePicker({ value, min, max, onConfirm, onCancel }: DatePickerProps) {
  const today = useMemo(() => new Date(), []);
  const minClamped = min ? startOfMonth(min) : undefined;
  const maxClamped = max ? endOfMonth(max) : undefined;

  const initial = clampDate(value ? new Date(value) : today, min, max);
  const [visibleMonth, setVisibleMonth] = useState<Date>(startOfMonth(initial));
  const [selected, setSelected] = useState<Date | null>(value ?? null);
  const [yearOpen, setYearOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (value) {
      setSelected(value);
      setVisibleMonth(startOfMonth(value));
    }
  }, [value]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setYearOpen(false);
        setMonthOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const years = useMemo(() => {
    const ys: number[] = [];
    const start = min ? min.getFullYear() : today.getFullYear() - 120;
    const end = max ? max.getFullYear() : today.getFullYear();
    for (let y = end; y >= start; y--) ys.push(y);
    return ys;
  }, [min, max, today]);

  const daysMatrix = useMemo(() => {
    const start = startOfMonth(visibleMonth);
    const end = endOfMonth(visibleMonth);

    const startWeekday = (start.getDay() + 6) % 7; // make Monday=0
    const totalDays = end.getDate();

    const rows: Array<Array<{ date: Date | null; outside: boolean; disabled: boolean }>> = [];

    // Leading days from previous month
    const leading: Array<{ date: Date | null; outside: boolean; disabled: boolean }>= [];
    if (startWeekday > 0) {
      const prevEnd = endOfMonth(new Date(start.getFullYear(), start.getMonth() - 1, 1));
      for (let i = startWeekday - 1; i >= 0; i--) {
        const d = new Date(prevEnd.getFullYear(), prevEnd.getMonth(), prevEnd.getDate() - (startWeekday - 1 - i));
        const disabled = (min && d < min) || (max && d > max) || true; // always disabled for outside
        leading.push({ date: d, outside: true, disabled });
      }
    }

    const current: Array<{ date: Date | null; outside: boolean; disabled: boolean }> = [];
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), i);
      const disabled = (min && d < min) || (max && d > max) ? true : false;
      current.push({ date: d, outside: false, disabled });
    }

    const cells = [...leading, ...current];
    // Trailing to fill last week
    while (cells.length % 7 !== 0) {
      const last = cells[cells.length - 1]?.date ?? end;
      const d = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
      const disabled = (min && d < min) || (max && d > max) || true; // always disabled for outside
      cells.push({ date: d, outside: true, disabled });
    }

    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }

    return rows;
  }, [visibleMonth, min, max]);

  function onChangeYear(y: number) {
    const d = new Date(visibleMonth);
    d.setFullYear(y);
    setVisibleMonth(startOfMonth(clampDate(d, minClamped, maxClamped)));
  }
  function onChangeMonth(m: number) {
    const d = new Date(visibleMonth);
    d.setMonth(m);
    setVisibleMonth(startOfMonth(clampDate(d, minClamped, maxClamped)));
  }

  return (
    <div className="w-full select-none" ref={containerRef}>
      <div className="flex items-center justify-center gap-2">
        {/* Year dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setYearOpen((v) => !v); setMonthOpen(false); }}
            className="px-2 py-1 rounded-full bg-gray-100 text-xs font-medium text-text-primary flex items-center gap-1 shadow-sm"
          >
            {visibleMonth.getFullYear()}
            <span className="text-gray-500">▾</span>
          </button>
          {yearOpen && (
            <div className="absolute left-1/2 z-20 mt-2 w-28 -translate-x-1/2 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5 max-h-64 overflow-y-auto scrollbar-none">
              {years.map((y) => {
                const isActive = y === visibleMonth.getFullYear();
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => { onChangeYear(y); setYearOpen(false); }}
                    className={[
                      "w-full text-center rounded-lg py-2 text-sm",
                      isActive ? "text-primary font-semibold" : "text-gray-500 hover:bg-gray-50",
                    ].join(' ')}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Month dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setMonthOpen((v) => !v); setYearOpen(false); }}
            className="px-2 py-1 rounded-full bg-gray-100 text-xs font-medium text-text-primary flex items-center gap-1 shadow-sm"
          >
            {MONTHS[visibleMonth.getMonth()]}
            <span className="text-gray-500">▾</span>
          </button>
          {monthOpen && (
            <div className="absolute left-1/2 z-20 mt-2 w-32 -translate-x-1/2 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5 max-h-64 overflow-y-auto scrollbar-none">
              {MONTHS.map((m, idx) => {
                const isActive = idx === visibleMonth.getMonth();
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { onChangeMonth(idx); setMonthOpen(false); }}
                    className={[
                      "w-full text-center rounded-lg py-2 text-sm",
                      isActive ? "text-primary font-semibold" : "text-gray-500 hover:bg-gray-50",
                    ].join(' ')}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-7 text-center text-[11px] text-text-secondary">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
          <div key={d} className="py-0.5">{d}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {daysMatrix.map((week, i) => (
          <div key={i} className="contents">
            {week.map((cell, j) => {
              const isSelected = selected && cell.date && isSameDay(selected, cell.date);
              const isToday = cell.date && isSameDay(cell.date, today);
              return (
                <button
                  type="button"
                  key={j}
                  disabled={!cell.date || cell.disabled}
                  onClick={() => cell.date && setSelected(cell.date)}
                  className={[
                    "relative h-8 w-8 mx-auto flex items-center justify-center rounded-full text-xs",
                    cell.outside ? "text-gray-400" : "text-text-primary",
                    cell.disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-primary/10",
                    isSelected ? "bg-primary text-white hover:bg-primary" : "",
                    !isSelected && isToday ? "ring-1 ring-primary/40" : "",
                  ].join(' ')}
                >
                  {cell.date?.getDate() ?? ''}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-medium text-text-primary hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!selected}
          onClick={() => selected && onConfirm(clampDate(selected, min ?? undefined, max ?? undefined))}
          className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-50"
        >
          OK
        </button>
      </div>
    </div>
  );
}
