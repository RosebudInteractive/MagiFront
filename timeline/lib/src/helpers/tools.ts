import { Event } from '../types/event';
import { Period } from '../types/period';

export const VERTICAL_STEP = 50;

export function calcEventPointPosition(event: Event.DataItem, needCorrectionOnBC: boolean): number {
  const needCorrectYear = needCorrectionOnBC && event.year > 1;

  const year = needCorrectYear ? event.year - 1 : event.year;

  return year
      + (event.month ? (event.month - 1) / 12 : 0)
      + (event.day ? (event.day - 1) / (12 * 30) : 0);
}

export function isArrayEquals(array1: any[], array2: any[]): boolean {
  return array1.length === array2.length && array1.every((value, index) => value === array2[index]);
}

export function calcScaleY(level: number, top: number): number {
  if (level === 0) return 1;

  const height = (level + 1) * VERTICAL_STEP - top;
  const noScaleHeight = VERTICAL_STEP - top;

  return height / noScaleHeight;
}

export function calcDisplayDate(
  day: number | undefined,
  month: number | undefined,
  year: number,
  showBC: boolean = false,
): string {
  const BC = year < 1;
  const absYear = Math.abs(year);
  const dayText = day ? `${day}.` : '';
  const monthText = month ? `${month}.` : '';

  return `${dayText}${monthText}${absYear}${showBC && BC ? ' до н.э.' : ''}`;
}

export function calcPeriodPoints(period: Period.DataItem, needCorrectionOnBC: boolean):
{ start: number, end: number } {
  const needCorrectStartYear = needCorrectionOnBC && period.startYear > 1;
  const needCorrectEndYear = needCorrectionOnBC && period.endYear > 1;

  const startYear = needCorrectStartYear ? period.startYear - 1 : period.startYear;
  const endYear = needCorrectEndYear ? period.endYear - 1 : period.endYear;

  const start = startYear
      + (period.startMonth ? (period.startMonth - 1) / 12 : 0)
      + (period.startDay ? period.startDay / (12 * 30) : 0);
  const end = endYear
      + (period.endMonth ? (period.endMonth - 1) / 12 : 0)
      + (period.endDay ? period.endDay / (12 * 30) : 0);

  return { start, end };
}

export function hexToRgb(hex: string): { r: number, g: number, b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : { r: 0, g: 0, b: 0 };
}

export function transformEventToVisual(item: Event.DataItem): Event.VisualItem {
  return {
    ...item,
    displayDate: '',
    calculatedDate: 0,
    width: 0,
    left: 0,
    y: 0,
    xStart: 0,
    xEnd: 0,
    yLevel: 0,
    visible: true,
    offset: 0,
  };
}

export function transformPeriodToVisual(item: Period.DataItem): Period.VisualItem {
  return {
    ...item,
    displayDate: '',
    calculatedDateStart: 0,
    calculatedDateEnd: 0,
    width: 0,
    left: 0,
    y: 0,
    xStart: 0,
    xEnd: 0,
    yLevel: 0,
    visible: true,
    offset: 0,
    title: '',
  };
}
