import { describe, expect, it } from 'vitest';
import eras from '../data/eras.json';
import sagas from '../data/sagas.json';
import events from '../data/events.json';
import tags from '../data/tags.json';
import { parseTimelineData } from './schema';
import { toModalView } from './modal';

const data = parseTimelineData({ eras, sagas, events, tags });

describe('toModalView', () => {
  it('evento visível traz texto, tags e fatos', () => {
    const v = toModalView(data, { spoilerOn: true, lastChapter: 100 }, 'e8')!;
    expect(v.hidden).toBe(false);
    expect(v.title).toBe('Luffy zarpa');
    expect(v.tags).toContain('Chapéus de Palha');
    expect(v.facts.map((f) => f.label)).toEqual(['Fonte', 'Confiança da data', 'Status']);
  });
  it('evento oculto não vaza nenhum texto do evento', () => {
    const e = data.events.find((x) => x.id === 'e24')!;
    const v = toModalView(data, { spoilerOn: true, lastChapter: 100 }, 'e24')!;
    const json = JSON.stringify(v);
    for (const s of [e.title, e.sum, e.more, e.when, e.src]) expect(json).not.toContain(s);
    expect(v.tags).toEqual([]);
    expect(v.facts).toEqual([]);
  });
  it('evento sem capítulo fica oculto com spoilers ligados', () => {
    expect(toModalView(data, { spoilerOn: true, lastChapter: 5000 }, 'e3')!.hidden).toBe(true);
  });
  it('id inexistente retorna null', () => {
    expect(toModalView(data, { spoilerOn: false, lastChapter: 1 }, 'nope')).toBeNull();
  });
});
