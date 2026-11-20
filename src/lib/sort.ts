import type { TimelineEvent } from './schema';
import type { Axis } from './state';
import { compareDates } from './calendar';

/** Valor usado para eventos sem capítulo ao ordenar por publicação. */
export const NO_CHAPTER = 99999;

const chOf = (e: TimelineEvent, missing: number) => e.revealed.ch ?? missing;

export function sortEvents(events: readonly TimelineEvent[], axis: Axis): TimelineEvent[] {
  return events.slice().sort((a, b) =>
    axis === 'pub'
      ? chOf(a, NO_CHAPTER) - chOf(b, NO_CHAPTER)
      : compareDates(a.date, b.date) || chOf(a, 0) - chOf(b, 0),
  );
}

/** Evento mais antigo da lista (na ordem da história), ou undefined se vazia. */
export function earliest(events: readonly TimelineEvent[]): TimelineEvent | undefined {
  return events.reduce<TimelineEvent | undefined>(
    (best, e) => (best === undefined || compareDates(e.date, best.date) < 0 ? e : best),
    undefined,
  );
}

export function minCh(events: readonly TimelineEvent[]): number {
  const v = events.map((e) => e.revealed.ch).filter((c): c is number => c !== null);
  return v.length ? Math.min(...v) : NO_CHAPTER;
}

export function maxCh(events: readonly TimelineEvent[]): number {
  const v = events.map((e) => e.revealed.ch).filter((c): c is number => c !== null);
  return v.length ? Math.max(...v) : 0;
}
