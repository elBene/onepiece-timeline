import type { TimelineEvent } from './schema';
import type { Zoom } from './state';

export function passesTags(e: TimelineEvent, tags: ReadonlySet<string>): boolean {
  return tags.size === 0 || e.tags.some((t) => tags.has(t));
}

/** Eras (1) não mostra eventos; Marcos (2) só imp 3; Eventos (3) imp >= 2; Tudo (4) todos. */
export function passesZoom(e: TimelineEvent, zoom: Zoom): boolean {
  if (zoom === 1) return false;
  return e.imp >= (zoom === 2 ? 3 : zoom === 3 ? 2 : 1);
}
