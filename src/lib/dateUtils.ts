/**
 * Utilidades de fecha y hora para Hora Local Colombiana (America/Bogota)
 */

export function getColombianDate(): Date {
  const now = new Date();
  return now;
}

export function formatColombianDateTime(dateStr?: string | Date): string {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '';

  return date.toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatColombianTime(dateStr?: string | Date): string {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '';

  return date.toLocaleTimeString('es-CO', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatColombianShortDate(dateStr?: string | Date): string {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export interface NextWeekRange {
  startDate: Date;
  endDate: Date;
  startFormatted: string;
  endFormatted: string;
  days: {
    dayIndex: number; // 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
    name: string;
    shortName: string;
    date: Date;
    isoString: string;
    formatted: string;
    dateNumber: number;
    monthName: string;
  }[];
}

export function getNextWeekRange(baseDate: Date = new Date()): NextWeekRange {
  const current = new Date(baseDate);
  const day = current.getDay(); // 0 is Sun, 1 is Mon...
  // Days until next Monday:
  const daysUntilNextMonday = day === 0 ? 1 : 8 - day;
  const nextMonday = new Date(current);
  nextMonday.setDate(current.getDate() + daysUntilNextMonday);
  nextMonday.setHours(8, 0, 0, 0);

  const nextSunday = new Date(nextMonday);
  nextSunday.setDate(nextMonday.getDate() + 6);
  nextSunday.setHours(21, 0, 0, 0);

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayShortNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(nextMonday);
    d.setDate(nextMonday.getDate() + i);
    const dayIdx = d.getDay();
    days.push({
      dayIndex: dayIdx,
      name: dayNames[dayIdx],
      shortName: dayShortNames[dayIdx],
      date: d,
      isoString: d.toISOString(),
      formatted: d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
      dateNumber: d.getDate(),
      monthName: d.toLocaleDateString('es-CO', { month: 'short' }),
    });
  }

  return {
    startDate: nextMonday,
    endDate: nextSunday,
    startFormatted: nextMonday.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }),
    endFormatted: nextSunday.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }),
    days,
  };
}
