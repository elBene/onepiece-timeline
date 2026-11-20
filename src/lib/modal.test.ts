import { describe, expect, it } from 'vitest';
import eras from '../data/eras.json';
import sagas from '../data/sagas.json';
import events from '../data/events.json';
import tags from '../data/tags.json';
import { parseTimelineData } from './schema';
import { toModalView } from './modal';
import { formatWhen } from './calendar';

const data = parseTimelineData({ eras, sagas, events, tags });

// Os dados reais já têm capítulo em todos os eventos; força um sem capítulo para testar a regra.
const noCh = { ...data, events: data.events.map((e) => (e.id === 'e3' ? { ...e, revealed: { ...e.revealed, ch: null } } : e)) };

describe('toModalView', () => {
  it('fonte estruturada vira texto legível', () => {
    const fonte = toModalView(data, { spoilerOn: false, lastChapter: 0 }, 'e1')!.facts.find((f) => f.label === 'Fonte');
    expect(fonte?.value).toBe('Mangá, cap. 395 · Anime, ep. 277');
  });
  it('evento visível traz texto, tags e fatos', () => {
    const v = toModalView(data, { spoilerOn: true, lastChapter: 100 }, 'e8')!;
    expect(v.hidden).toBe(false);
    expect(v.title).toBe('Luffy zarpa');
    expect(v.tags).toContain('Chapéus de Palha');
    expect(v.facts.map((f) => f.label)).toEqual([
      'Calendários',
      'Distância',
      'Revelado em',
      'Tipo',
      'Fonte',
      'Confiança da data',
      'Status',
    ]);
    expect(v.when).toBe('1539 C.M.');
    expect(v.facts[0]!.value).toBe('Círculo Marítimo 1539 · Era do Céu 4129');
    expect(v.facts[2]!.value).toBe('cap. 1 · ep. 4');
  });
  it('evento oculto não vaza nenhum texto do evento', () => {
    const e = data.events.find((x) => x.id === 'e24')!;
    const v = toModalView(data, { spoilerOn: true, lastChapter: 100 }, 'e24')!;
    const json = JSON.stringify(v);
    for (const s of [e.title, e.sum, e.more, formatWhen(e.date), ...e.src.map((x) => x.ref)]) expect(json).not.toContain(s);
    expect(v.tags).toEqual([]);
    expect(v.facts).toEqual([]);
  });
  it('evento sem capítulo fica oculto com spoilers ligados', () => {
    expect(toModalView(noCh, { spoilerOn: true, lastChapter: 5000 }, 'e3')!.hidden).toBe(true);
  });
  it('divergências entre fontes aparecem como fatos', () => {
    const conflicts = [{ note: 'Vivre Card dá outra idade', src: ['vivre_card' as const, 'manga' as const] }];
    const d = { ...data, events: data.events.map((e) => (e.id === 'e8' ? { ...e, conflicts } : e)) };
    const v = toModalView(d, { spoilerOn: false, lastChapter: 1 }, 'e8')!;
    expect(v.facts.find((f) => f.label === 'Divergência')?.value).toBe('Vivre Card dá outra idade');
  });
  it('id inexistente retorna null', () => {
    expect(toModalView(data, { spoilerOn: false, lastChapter: 1 }, 'nope')).toBeNull();
  });
  it('status vem do campo verified, não de texto fixo', () => {
    const base = data.events.find((x) => x.id === 'e8')!;
    const status = (verified: boolean) => {
      const d = { ...data, events: data.events.map((e) => (e.id === 'e8' ? { ...base, verified } : e)) };
      return toModalView(d, { spoilerOn: false, lastChapter: 1 }, 'e8')!.facts.find((f) => f.label === 'Status')!.value;
    };
    expect(status(false)).toBe('rascunho a verificar');
    expect(status(true)).toBe('verificado');
  });
});
