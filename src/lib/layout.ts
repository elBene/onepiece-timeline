import type { Era, Saga, TimelineData, TimelineEvent } from './schema';
import type { TimelineState } from './state';
import { passesTags, passesZoom } from './filters';
import { minCh, sortEvents } from './sort';
import { CALENDAR, yearOf } from './calendar';
import { HIDDEN_SAGA, isHidden, toView, type EventView } from './spoilers';

/**
 * Posições em px no eixo da linha. O x 0 é o começo da linha; a vista acrescenta meia
 * tela de folga dos dois lados para que qualquer ponto possa chegar ao centro.
 */
export const LAYOUT = {
  start: 40,
  eraGap: 220,
  sagaGap: 150,
  medallionOffset: 70,
  /** Marcos alternam em cima e embaixo: vizinhos podem ficar mais perto que o diâmetro. */
  medallionStep: 150,
  dotOffset: 16,
  /** Marcas na linha, como as de uma régua. */
  dotStep: { 2: 28, 1: 22 } as Record<number, number>,
  tailPadding: 60,
  /** Ordem da história: cada ano sem nada registrado ocupa só isto (px). */
  emptyYear: 3,
  /** Folga antes do rótulo de um ano com acontecimentos, e espaço do rótulo até o primeiro item. */
  yearLead: 24,
  yearPad: 40,
  yearTail: 16,
} as const;

export type LayoutItem =
  | { kind: 'era'; x: number; end: number; era: Era }
  | { kind: 'saga'; x: number; end: number; saga: Saga; name: string; hidden: boolean; subtitle: string }
  /** Ano com acontecimentos (ordem da história). */
  | { kind: 'year'; x: number; ago: number; label: string }
  /** Sequência de anos sem nada registrado, desenhada como régua fina. fromAgo é o mais antigo. */
  | { kind: 'gap'; x: number; end: number; fromAgo: number; toAgo: number }
  | { kind: 'medallion'; x: number; view: EventView; side: 'top' | 'bot' }
  | { kind: 'dot'; x: number; view: EventView; imp: 1 | 2 };

/** Marca do "Ir para": uma estação (era, ou saga na ordem de publicação). */
export interface Station {
  label: string;
  x: number;
}

/**
 * Ano mostrado no painel: tudo o que aconteceu nele (respeitando o Foco), mesmo o que o
 * zoom esconde da linha. Os nomes já vêm censurados pela trava de spoilers.
 */
export interface Group {
  ago: number;
  /** "Ano 1498 C.M." */
  label: string;
  ids: string[];
  /** Onde levar a linha ao escolher o ano. */
  x: number;
  eras: string[];
  sagas: string[];
  /** Tudo protegido: o painel não mostra nem o ano. */
  allHidden: boolean;
}

export interface HorizontalLayout {
  items: LayoutItem[];
  width: number;
  /** Ids dos eventos na linha, na ordem em que aparecem. */
  order: string[];
  /** Posição x (centro) de cada evento na linha. */
  xById: Record<string, number>;
  stations: Station[];
  groups: Group[];
  /** Índice do ano (em groups) de cada evento listado no painel. */
  groupOf: Record<string, number>;
  /** Versão censurada de cada evento listado no painel. */
  views: Record<string, EventView>;
}

/** "1498", ou "−3459" para anos antes do começo do calendário (só aritmética, ver calendar.ts). */
export function yearLabel(ago: number): string {
  const y = yearOf(ago, 'kaienreki');
  return y < 0 ? `−${-y}` : String(y);
}

export function computeHorizontalLayout(data: TimelineData, state: TimelineState): HorizontalLayout {
  const eraById = new Map(data.eras.map((e) => [e.id, e]));
  const sagaById = new Map(data.sagas.map((s) => [s.id, s]));
  const bySaga = new Map<string, TimelineEvent[]>();
  for (const e of data.events) {
    const list = bySaga.get(e.saga);
    if (list) list.push(e);
    else bySaga.set(e.saga, [e]);
  }
  const eventsOf = (saga: Saga) => bySaga.get(saga.id) ?? [];
  const tagged = data.events.filter((e) => passesTags(e, state.tags));
  const onLine = (e: TimelineEvent) => state.zoom !== 1 && passesZoom(e, state.zoom);
  // Nome da saga também é spoiler: some quando nada dela (com o Foco atual) foi revelado.
  const sagaHidden = (s: Saga) => eventsOf(s).filter((e) => passesTags(e, state.tags)).every((e) => isHidden(e, state));
  const sagaName = (s: Saga) => (sagaHidden(s) ? HIDDEN_SAGA : s.name);

  const items: LayoutItem[] = [];
  const order: string[] = [];
  const xById: Record<string, number> = {};
  const stations: Station[] = [];
  let x: number = LAYOUT.start;
  let majors = 0;

  const placeEvent = (e: TimelineEvent) => {
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
  };
  const yearX = new Map<number, number>();

  if (state.axis === 'chrono') {
    // Ordem da história: um eixo de anos, do primeiro registro até o presente.
    const byYear = new Map<number, TimelineEvent[]>();
    for (const e of sortEvents(tagged, 'chrono')) {
      const list = byYear.get(e.date.ago);
      if (list) list.push(e);
      else byYear.set(e.date.ago, [e]);
    }
    const firstAgo = data.events.reduce((m, e) => Math.max(m, e.date.ago), 0);
    const seenSaga = new Set<string>();
    const seenEra = new Set<string>();
    let gapFrom: number | null = null;
    let gapX = 0;
    const closeGap = (toAgo: number) => {
      if (gapFrom === null) return;
      items.push({ kind: 'gap', x: gapX, end: x, fromAgo: gapFrom, toAgo });
      gapFrom = null;
    };
    for (let ago = firstAgo; ago >= 0; ago--) {
      const evs = byYear.get(ago) ?? [];
      const hasMarker = evs.some((e) => !seenSaga.has(e.saga));
      if (!evs.some(onLine) && !hasMarker) {
        if (gapFrom === null) {
          gapFrom = ago;
          gapX = x;
        }
        x += LAYOUT.emptyYear;
        continue;
      }
      closeGap(ago + 1);
      x += LAYOUT.yearLead;
      yearX.set(ago, x);
      items.push({ kind: 'year', x, ago, label: yearLabel(ago) });
      x += LAYOUT.yearPad;
      for (const e of evs) {
        const saga = sagaById.get(e.saga);
        if (saga && !seenSaga.has(saga.id)) {
          seenSaga.add(saga.id);
          const era = eraById.get(saga.era);
          if (era && !seenEra.has(era.id)) {
            seenEra.add(era.id);
            items.push({ kind: 'era', x, end: x, era });
            stations.push({ label: era.name, x });
            x += LAYOUT.eraGap;
          }
          items.push({ kind: 'saga', x, end: x, saga, name: sagaName(saga), hidden: sagaHidden(saga), subtitle: '' });
          x += LAYOUT.sagaGap;
        }
        if (onLine(e)) placeEvent(e);
      }
      x += LAYOUT.yearTail;
    }
    closeGap(0);
  } else {
    // Ordem de publicação: sagas na ordem em que foram publicadas, sem eixo de anos.
    const byCh = (a: Saga, b: Saga) => minCh(eventsOf(a)) - minCh(eventsOf(b));
    for (const saga of data.sagas.slice().sort(byCh)) {
      const visible = eventsOf(saga).filter((e) => passesTags(e, state.tags));
      if (!visible.length) continue;
      const hidden = sagaHidden(saga);
      const sagaItem: Extract<LayoutItem, { kind: 'saga' }> = {
        kind: 'saga',
        x,
        end: x,
        saga,
        name: sagaName(saga),
        hidden,
        subtitle: eraById.get(saga.era)?.name ?? '',
      };
      items.push(sagaItem);
      if (!hidden) stations.push({ label: saga.name, x });
      x += LAYOUT.sagaGap;
      for (const e of sortEvents(visible, 'pub')) if (onLine(e)) placeEvent(e);
      sagaItem.end = x - 40;
    }
  }

  // Painel: um grupo por ano que aparece na linha, com tudo o que aconteceu nele.
  const groups: Group[] = [];
  const groupOf: Record<string, number> = {};
  const views: Record<string, EventView> = {};
  const lineYears: number[] = [];
  for (const id of order) {
    const e = data.events.find((ev) => ev.id === id)!;
    if (!lineYears.includes(e.date.ago)) lineYears.push(e.date.ago);
  }
  const yearOrder = state.axis === 'chrono' ? lineYears.slice().sort((a, b) => b - a) : lineYears;
  for (const ago of yearOrder) {
    const evs = sortEvents(
      tagged.filter((e) => e.date.ago === ago),
      'chrono',
    );
    const ids = evs.map((e) => e.id);
    const firstOnLine = ids.find((id) => xById[id] !== undefined);
    const eras: string[] = [];
    const sagas: string[] = [];
    for (const e of evs) {
      views[e.id] = toView(e, state);
      groupOf[e.id] = groups.length;
      const saga = sagaById.get(e.saga);
      if (!saga) continue;
      const era = eraById.get(saga.era)?.name;
      if (era && !eras.includes(era)) eras.push(era);
      const name = sagaName(saga);
      if (!sagas.includes(name)) sagas.push(name);
    }
    const allHidden = evs.every((e) => isHidden(e, state));
    groups.push({
      ago,
      label: `Ano ${yearLabel(ago)} ${CALENDAR.kaienreki.abbr}`,
      ids,
      x: yearX.get(ago) ?? (firstOnLine ? xById[firstOnLine]! : 0),
      eras: allHidden ? [] : eras,
      sagas: allHidden ? [] : sagas,
      allHidden,
    });
  }

  return { items, width: x + LAYOUT.tailPadding, order, xById, stations, groups, groupOf, views };
}
