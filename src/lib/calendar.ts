import type { EventDate } from './schema';

/**
 * Calendários in-universe. Fonte: SBS vol. 113, p. 49 (Oda).
 * Os anos atuais valem para o presente pós-timeskip; os dois calendários estão em uso.
 * A obra não diz quando cada calendário começou: anos ≤ 0 são só aritmética.
 */
export const PRESENT = { kaienreki: 1541, tenreki: 4131 } as const;

/** Luffy zarpa aos 17 (nasceu em 1522 C.M.), dois anos antes do presente. */
export const DEPARTURE_AGO = 2;

export const CALENDAR = {
  kaienreki: { name: 'Círculo Marítimo', abbr: 'C.M.' },
  tenreki: { name: 'Era do Céu', abbr: 'E.C.' },
} as const;

export type CalendarId = keyof typeof CALENDAR;

export function yearOf(ago: number, cal: CalendarId): number {
  return PRESENT[cal] - ago;
}

const MONTHS = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];

function isApprox(d: EventDate): boolean {
  return d.conf !== 'exata' || d.precision === 'decada' || d.precision === 'seculo' || d.precision === 'milenio';
}

/** "1503", "641 a 741", "21 jun. 1120". Sem sufixo de calendário. */
function yearText(d: EventDate, cal: CalendarId): string {
  const start = yearOf(d.ago, cal);
  if (d.agoEnd !== undefined) return `${start} a ${yearOf(d.agoEnd, cal)}`;
  if (d.month !== undefined) return `${d.day ? `${d.day} ` : ''}${MONTHS[d.month - 1]} ${start}`;
  return String(start);
}

/** Rótulo curto da época, no calendário principal (Círculo Marítimo): "≈ 1503 C.M.". */
export function formatWhen(d: EventDate, cal: CalendarId = 'kaienreki'): string {
  return `${isApprox(d) ? '≈ ' : ''}${yearText(d, cal)} ${CALENDAR[cal].abbr}`;
}

/** Distância até o presente: "38 anos antes de hoje", "há 900 a 800 anos", "hoje". */
export function formatAgo(d: EventDate): string {
  const pre = isApprox(d) ? '≈ ' : '';
  if (d.agoEnd !== undefined) return `${pre}de ${d.ago} a ${d.agoEnd} anos antes de hoje`;
  if (d.ago === 0) return 'ano atual da história';
  return `${pre}${d.ago} ${d.ago === 1 ? 'ano' : 'anos'} antes de hoje`;
}

/** Linha completa com os dois calendários, para o popup. */
export function formatBothCalendars(d: EventDate): string {
  const pre = isApprox(d) ? '≈ ' : '';
  return `${pre}${CALENDAR.kaienreki.name} ${yearText(d, 'kaienreki')} · ${CALENDAR.tenreki.name} ${yearText(d, 'tenreki')}`;
}

/** Ordem da história: mais antigo primeiro (maior ago), depois seq, depois mês e dia. */
export function compareDates(a: EventDate, b: EventDate): number {
  return b.ago - a.ago || (a.month ?? 0) - (b.month ?? 0) || (a.day ?? 0) - (b.day ?? 0) || a.seq - b.seq;
}
