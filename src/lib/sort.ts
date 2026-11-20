import type { TimelineEvent } from './schema';
import type { Axis } from './state';

/** Valor usado para eventos sem capítulo ao ordenar por publicação. */
export const NO_CHAPTER = 99999;

export function sortEvents(events: readonly TimelineEvent[], axis: Axis): TimelineEvent[] {
  return events.slice().sort((a, b) =>
    axis === 'pub'
      ? (a.ch ?? NO_CHAPTER) - (b.ch ?? NO_CHAPTER)
      : a.t - b.t || (a.ch ?? 0) - (b.ch ?? 0),
  );
}

export function minT(events: readonly TimelineEvent[]): number {
  return Math.min(...events.map((e) => e.t));
}

export function minCh(events: readonly TimelineEvent[]): number {
  const v = events.map((e) => e.ch).filter((c): c is number => c !== null);
  return v.length ? Math.min(...v) : NO_CHAPTER;
}

export function maxCh(events: readonly TimelineEvent[]): number {
  const v = events.map((e) => e.ch).filter((c): c is number => c !== null);
  return v.length ? Math.max(...v) : 0;
}
