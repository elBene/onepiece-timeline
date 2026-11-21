import { describe, expect, it } from 'vitest';
import eras from '../data/eras.json';
import sagas from '../data/sagas.json';
import events from '../data/events.json';
import tags from '../data/tags.json';
import { parseTimelineData } from './schema';
import { initialState, type TimelineState } from './state';
import { computeHorizontalLayout, LAYOUT } from './layout';
import { sortEvents } from './sort';
import { passesTags, passesZoom } from './filters';
import { isHidden, toView } from './spoilers';
import { formatWhen } from './calendar';

const data = parseTimelineData({ eras, sagas, events, tags });
const st = (patch: Partial<TimelineState> = {}): TimelineState => ({ ...initialState, ...patch });
const ev = (id: string) => data.events.find((e) => e.id === id)!;

describe('sort', () => {
  it('ordem da história usa a data (anos antes de hoje)', () => {
    const ids = sortEvents(data.events, 'chrono').map((e) => e.id);
    expect(ids[0]).toBe('v-arvore-ohara');
    expect(ids.indexOf('v-tontatta')).toBeLessThan(ids.indexOf('e1'));
    expect(ids.indexOf('e1')).toBeLessThan(ids.indexOf('v-grande-guerra'));
    expect(ids.indexOf('e5')).toBeLessThan(ids.indexOf('e8'));
  });
  it('ordem de publicação usa capítulo e deixa sem capítulo por último', () => {
    const ids = sortEvents(data.events.map((e) => (e.id === 'e3' ? { ...e, revealed: { ...e.revealed, ch: null } } : e)), 'pub').map((e) => e.id);
    expect(ids[ids.length - 1]).toBe('e3');
  });
});

describe('filters', () => {
  it('zoom', () => {
    expect(passesZoom(ev('e1'), 1)).toBe(false);
    expect(passesZoom(ev('e10'), 3)).toBe(false);
    expect(passesZoom(ev('e10'), 4)).toBe(true);
    expect(passesZoom(ev('e2'), 2)).toBe(false);
    expect(passesZoom(ev('e1'), 2)).toBe(true);
  });
  it('tags', () => {
    expect(passesTags(ev('e1'), new Set())).toBe(true);
    expect(passesTags(ev('e1'), new Set(['strawhats']))).toBe(false);
    expect(passesTags(ev('e1'), new Set(['marinha']))).toBe(true);
  });
});

describe('spoilers', () => {
  const on = { spoilerOn: true, lastChapter: 100 };
  it('oculta eventos depois do capítulo ou sem capítulo', () => {
    expect(isHidden(ev('e8'), on)).toBe(false);
    expect(isHidden(ev('e24'), on)).toBe(true);
    expect(isHidden({ ...ev('e3'), revealed: { ...ev('e3').revealed, ch: null } }, on)).toBe(true);
    expect(isHidden(ev('e24'), { ...on, spoilerOn: false })).toBe(false);
  });
  it('a view de um evento oculto não contém texto real', () => {
    const e = ev('e24');
    const json = JSON.stringify(toView(e, on));
    expect(json).not.toContain(e.title);
    expect(json).not.toContain(e.sum);
    expect(json).not.toContain(formatWhen(e.date));
  });
});

describe('layout horizontal', () => {
  it('alterna marcos em cima e embaixo e acumula posições', () => {
    const l = computeHorizontalLayout(data, st({ zoom: 2 }));
    const sides = l.items.filter((i) => i.kind === 'medallion').map((i) => (i as { side: string }).side);
    expect(sides.slice(0, 4)).toEqual(['top', 'bot', 'top', 'bot']);
    expect(l.items[0]!.x).toBe(LAYOUT.start + LAYOUT.yearLead);
  });
  it('zoom Eras não tem eventos', () => {
    const l = computeHorizontalLayout(data, st({ zoom: 1 }));
    expect(l.order).toHaveLength(0);
    expect(l.items.some((i) => i.kind === 'era')).toBe(true);
  });
  it('ordem de publicação não tem bandeiras de era', () => {
    const l = computeHorizontalLayout(data, st({ axis: 'pub' }));
    expect(l.items.some((i) => i.kind === 'era')).toBe(false);
  });
  it('filtro por tema remove eventos', () => {
    const all = Object.keys(computeHorizontalLayout(data, st({ zoom: 4 })).groupOf).length;
    const some = Object.keys(computeHorizontalLayout(data, st({ zoom: 4, tags: new Set(['strawhats']) })).groupOf).length;
    expect(all).toBe(data.events.length);
    expect(some).toBeLessThan(all);
  });
  it('eventos ocultos não vazam texto para os itens do layout', () => {
    const l = computeHorizontalLayout(data, st({ zoom: 4, spoilerOn: true, lastChapter: 100 }));
    const json = JSON.stringify(l.items.filter((i) => i.kind === 'medallion' || i.kind === 'dot'));
    expect(json).not.toContain(ev('e24').title);
    expect(json).toContain(ev('e8').title);
  });
});

describe('eixo de anos e painel por ano', () => {
  it('cada ano é um nó só na linha, com a contagem do ano', () => {
    const l = computeHorizontalLayout(data, st({ zoom: 4 }));
    const nodes = l.items.filter((i) => i.kind === 'medallion' || i.kind === 'dot');
    expect(nodes).toHaveLength(l.groups.length);
    for (const n of nodes) {
      if (n.kind !== 'medallion' && n.kind !== 'dot') continue;
      const g = l.groups[l.groupOf[n.view.id]!]!;
      expect(n.count).toBe(g.ids.length);
    }
  });
  it('a ordem da história cobre todos os anos, do primeiro registro até hoje', () => {
    const l = computeHorizontalLayout(data, st({ zoom: 4 }));
    const firstAgo = Math.max(...data.events.map((e) => e.date.ago));
    const covered = new Set<number>();
    for (const g of l.groups) covered.add(g.ago);
    for (const i of l.items) if (i.kind === 'gap') for (let a = i.fromAgo; a >= i.toAgo; a--) covered.add(a);
    for (let a = firstAgo; a >= 0; a--) expect(covered.has(a)).toBe(true);
  });
  it('ano vazio ocupa bem menos espaço que um ano com acontecimentos', () => {
    const l = computeHorizontalLayout(data, st({ zoom: 4 }));
    const gap = l.items.find((i) => i.kind === 'gap')!;
    if (gap.kind !== 'gap') throw new Error();
    expect((gap.end - gap.x) / (gap.fromAgo - gap.toAgo + 1)).toBe(LAYOUT.emptyYear);
  });
  it('cada ano do painel lista tudo daquele ano, mesmo o que o zoom tira da linha', () => {
    const l = computeHorizontalLayout(data, st({ zoom: 2 }));
    for (const g of l.groups) {
      const all = data.events.filter((e) => e.date.ago === g.ago).map((e) => e.id).sort();
      expect([...g.ids].sort()).toEqual(all);
    }
    expect(l.groups.map((g) => g.ago)).toEqual([...l.groups.map((g) => g.ago)].sort((a, b) => b - a));
  });
  it('ano todo protegido não mostra eras nem sagas', () => {
    const l = computeHorizontalLayout(data, st({ zoom: 4, spoilerOn: true, lastChapter: 0 }));
    expect(l.groups.every((g) => g.allHidden && g.eras.length === 0 && g.sagas.length === 0)).toBe(true);
    const json = JSON.stringify(l.views);
    expect(json).not.toContain(ev('e8').title);
  });
});
