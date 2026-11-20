import type { Era, Saga, TimelineData, TimelineEvent } from './schema';
import type { TimelineState } from './state';
import { passesTags, passesZoom } from './filters';
import { minCh, minT, sortEvents } from './sort';
import { toView, type EventView } from './spoilers';
import { DEFAULT_FLAG_COLOR, ERA_FLAG_COLORS, EVENT_ICONS, DEFAULT_ICON, SAGA_PALETTE } from './theme';

export const LAYOUT = {
  start: 80,
  eraGap: 270,
  sagaGap: 150,
  medallionOffset: 55,
  medallionStep: 290,
  dotOffset: 22,
  dotStep: { 2: 48, 1: 36 } as Record<number, number>,
  tailPadding: 160,
} as const;

export type LayoutItem =
  | { kind: 'era'; x: number; era: Era; color: string }
  | { kind: 'saga'; x: number; saga: Saga; subtitle: string }
  | { kind: 'medallion'; x: number; view: EventView; side: 'top' | 'bot'; color: string; icon: string }
  | { kind: 'dot'; x: number; view: EventView; imp: 1 | 2; color: string };

export interface HorizontalLayout {
  items: LayoutItem[];
  width: number;
  /** Ids dos eventos exibidos, na ordem em que aparecem (usado por Anterior/Próximo). */
  order: string[];
  /** Posição x (centro) de cada evento exibido. */
  xById: Record<string, number>;
}

export function computeHorizontalLayout(data: TimelineData, state: TimelineState): HorizontalLayout {
  const eraById = new Map(data.eras.map((e) => [e.id, e]));
  const eventsOf = (saga: Saga) => data.events.filter((e) => e.saga === saga.id);
  const byT = (a: Saga, b: Saga) => minT(eventsOf(a)) - minT(eventsOf(b));
  const byCh = (a: Saga, b: Saga) => minCh(eventsOf(a)) - minCh(eventsOf(b));

  const groups: { era: Era | null; sagas: Saga[] }[] =
    state.axis === 'chrono'
      ? data.eras
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((era) => ({ era, sagas: data.sagas.filter((s) => s.era === era.id).sort(byT) }))
      : [{ era: null, sagas: data.sagas.slice().sort(byCh) }];

  const items: LayoutItem[] = [];
  const order: string[] = [];
  const xById: Record<string, number> = {};
  let x: number = LAYOUT.start;
  let majors = 0;
  const hasVisible = (s: Saga) => eventsOf(s).some((e) => passesTags(e, state.tags));

  for (const g of groups) {
    if (!g.sagas.some(hasVisible)) continue;
    if (g.era) {
      items.push({ kind: 'era', x, era: g.era, color: ERA_FLAG_COLORS[g.era.id] ?? DEFAULT_FLAG_COLOR });
      x += LAYOUT.eraGap;
    }
    for (const saga of g.sagas) {
      if (!hasVisible(saga)) continue;
      const color = SAGA_PALETTE[data.sagas.indexOf(saga) % SAGA_PALETTE.length]!;
      const subtitle = g.era ? '' : (eraById.get(saga.era)?.name ?? '');
      items.push({ kind: 'saga', x, saga, subtitle });
      x += LAYOUT.sagaGap;
      if (state.zoom === 1) continue;

      const shown = sortEvents(eventsOf(saga), state.axis).filter(
        (e: TimelineEvent) => passesTags(e, state.tags) && passesZoom(e, state.zoom),
      );
      for (const e of shown) {
        const view = toView(e, state);
        order.push(e.id);
        if (e.imp === 3) {
          const side = majors++ % 2 === 0 ? 'top' : 'bot';
          const cx = x + LAYOUT.medallionOffset;
          xById[e.id] = cx;
          items.push({ kind: 'medallion', x: cx, view, side, color, icon: EVENT_ICONS[e.id] ?? DEFAULT_ICON });
          x += LAYOUT.medallionStep;
        } else {
          const cx = x + LAYOUT.dotOffset;
          xById[e.id] = cx;
          items.push({ kind: 'dot', x: cx, view, imp: e.imp as 1 | 2, color });
          x += LAYOUT.dotStep[e.imp]!;
        }
      }
    }
  }
  return { items, width: x + LAYOUT.tailPadding, order, xById };
}
