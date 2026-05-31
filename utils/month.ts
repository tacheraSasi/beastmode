export type MonthKey = `${number}-${string}`;

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function getMonthKey(date: Date): MonthKey {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}-${pad2(month)}` as MonthKey;
}

export function parseMonthKey(monthKey: string): { year: number; month: number } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(monthKey);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export function monthKeyToDate(monthKey: MonthKey): Date {
  const parsed = parseMonthKey(monthKey);
  if (!parsed) return new Date();
  return new Date(parsed.year, parsed.month - 1, 1, 0, 0, 0, 0);
}

export function getMonthDateRange(monthKey: MonthKey): { start: Date; end: Date } {
  const { year, month } = parseMonthKey(monthKey) ?? {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  };

  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  // last day of month
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

export function addMonths(date: Date, deltaMonths: number): Date {
  const next = new Date(date);
  next.setDate(1);
  next.setMonth(next.getMonth() + deltaMonths);
  next.setHours(0, 0, 0, 0);
  return next;
}

