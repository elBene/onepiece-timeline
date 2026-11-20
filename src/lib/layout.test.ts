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

const data = parseTimelineData({ eras, sagas, events, tags });
const st = (patch: Partial<TimelineState> = {}): TimelineState => ({ ...initialState, ...patch });
const ev = (id: string) => data.events.find((e) => e.id === id)!;

describe('sort', () => {
  it('ordem da história usa t', () => {
    const ids = sortEvents(data.events, 'chrono').map((e) => e.id);
    expect(ids[0]).toBe('e1');
    expect(ids.indexOf('e5')).toBeLessThan(ids.indexOf('e8'));
  });
  it('ordem de publicação usa capítulo e deixa sem capítulo por último', () => {
    const ids = sortEvents(data.events.map((e) => (e.id === 'e3' ? { ...e, ch: null } : e)), 'pub').map((e) => e.id);
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
    expect(isHidden({ ...ev('e3'), ch: null }, on)).toBe(true);
    expect(isHidden(ev('e24'), { ...on, spoilerOn: false })).toBe(false);
  });
  it('a view de um evento oculto não contém texto real', () => {
    const e = ev('e24');
    const json = JSON.stringify(toView(e, on));
    expect(json).not.toContain(e.title);
    expect(json).not.toContain(e.sum);
    expect(json).not.toContain(e.when);
  });
});

describe('layout horizontal', () => {
  it('alterna marcos em cima e embaixo e acumula posições', () => {
    const l = computeHorizontalLayout(data, st({ zoom: 2 }));
    const sides = l.items.filter((i) => i.kind === 'medallion').map((i) => (i as { side: string }).side);
    expect(sides.slice(0, 4)).toEqual(['top', 'bot', 'top', 'bot']);
    expect(l.items[0]!.x).toBe(LAYOUT.start);
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
    const all = computeHorizontalLayout(data, st({ zoom: 4 })).order.length;
    const some = computeHorizontalLayout(data, st({ zoom: 4, tags: new Set(['strawhats']) })).order.length;
    expect(all).toBe(25);
    expect(some).toBeLessThan(all);
  });
  it('eventos ocultos não vazam texto para os itens do layout', () => {
    const l = computeHorizontalLayout(data, st({ zoom: 4, spoilerOn: true, lastChapter: 100 }));
    const json = JSON.stringify(l.items.filter((i) => i.kind === 'medallion' || i.kind === 'dot'));
    expect(json).not.toContain(ev('e24').title);
    expect(json).toContain(ev('e8').title);
  });
});
