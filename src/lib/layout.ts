import type { Era, Saga, TimelineData, TimelineEvent } from './schema';
import type { TimelineState } from './state';
import { passesTags, passesZoom } from './filters';
import { earliest, minCh, sortEvents } from './sort';
import { compareDates } from './calendar';
import { HIDDEN_SAGA, isHidden, toView, type EventView } from './spoilers';

/**
 * Posições em px no eixo da fita. O x 0 é o começo da fita; a vista acrescenta meia
 * tela de folga dos dois lados para que qualquer ponto possa passar pela cabeça de leitura.
 */
export const LAYOUT = {
  start: 40,
  eraGap: 360,
  sagaGap: 180,
  medallionOffset: 40,
  medallionStep: 330,
  dotOffset: 22,
  dotStep: { 2: 60, 1: 46 } as Record<number, number>,
  tailPadding: 40,
} as const;

export type LayoutItem =
  | { kind: 'era'; x: number; end: number; era: Era }
  | { kind: 'saga'; x: number; end: number; saga: Saga; name: string; hidden: boolean; subtitle: string }
  | { kind: 'medallion'; x: number; view: EventView; side: 'top' | 'bot' }
  | { kind: 'dot'; x: number; view: EventView; imp: 1 | 2 };

/** Marca do dial: uma estação (era, ou saga na ordem de publicação). */
export interface Station {
  label: string;
  x: number;
}

export interface HorizontalLayout {
  items: LayoutItem[];
  width: number;
  /** Ids dos eventos exibidos, na ordem em que aparecem (usado por Anterior/Próximo). */
  order: string[];
  /** Posição x (centro) de cada evento exibido. */
  xById: Record<string, number>;
  stations: Station[];
}

export function computeHorizontalLayout(data: TimelineData, state: TimelineState): HorizontalLayout {
  const eraById = new Map(data.eras.map((e) => [e.id, e]));
  // Agrupa uma vez: antes, cada comparação de ordenação refiltrava todos os eventos.
  const bySaga = new Map<string, TimelineEvent[]>();
  for (const e of data.events) {
    const list = bySaga.get(e.saga);
    if (list) list.push(e);
    else bySaga.set(e.saga, [e]);
  }
  const eventsOf = (saga: Saga) => bySaga.get(saga.id) ?? [];
  const byT = (a: Saga, b: Saga) => {
    const ea = earliest(eventsOf(a));
    const eb = earliest(eventsOf(b));
    if (!ea || !eb) return (ea ? 0 : 1) - (eb ? 0 : 1);
    return compareDates(ea.date, eb.date);
  };
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
  const stations: Station[] = [];
  let x: number = LAYOUT.start;
  let majors = 0;
  const visibleOf = (s: Saga) => eventsOf(s).filter((e) => passesTags(e, state.tags));
  const hasVisible = (s: Saga) => visibleOf(s).length > 0;

  for (const g of groups) {
    if (!g.sagas.some(hasVisible)) continue;
    let eraItem: Extract<LayoutItem, { kind: 'era' }> | undefined;
    if (g.era) {
      eraItem = { kind: 'era', x, end: x, era: g.era };
      items.push(eraItem);
      stations.push({ label: g.era.name, x });
      x += LAYOUT.eraGap;
    }
    for (const saga of g.sagas) {
      if (!hasVisible(saga)) continue;
      // Nome da saga também é spoiler: some quando nada dela foi revelado ao leitor.
      const hidden = visibleOf(saga).every((e) => isHidden(e, state));
      const name = hidden ? HIDDEN_SAGA : saga.name;
      const subtitle = g.era ? '' : (eraById.get(saga.era)?.name ?? '');
      const sagaItem: Extract<LayoutItem, { kind: 'saga' }> = { kind: 'saga', x, end: x, saga, name, hidden, subtitle };
      items.push(sagaItem);
      if (!g.era && !hidden) stations.push({ label: saga.name, x });
      x += LAYOUT.sagaGap;
      if (state.zoom !== 1) {
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
            items.push({ kind: 'medallion', x: cx, view, side });
            x += LAYOUT.medallionStep;
          } else {
            const cx = x + LAYOUT.dotOffset;
            xById[e.id] = cx;
            items.push({ kind: 'dot', x: cx, view, imp: e.imp as 1 | 2 });
            x += LAYOUT.dotStep[e.imp]!;
          }
        }
      }
      sagaItem.end = x - 40;
    }
    if (eraItem) eraItem.end = x;
  }
  return { items, width: x + LAYOUT.tailPadding, order, xById, stations };
}
