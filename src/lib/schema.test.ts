import { describe, expect, it } from 'vitest';
import eras from '../data/eras.json';
import sagas from '../data/sagas.json';
import events from '../data/events.json';
import tags from '../data/tags.json';
import { parseTimelineData } from './schema';

const raw = { eras, sagas, events, tags };
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

describe('schema', () => {
  it('os JSONs do site são válidos', () => {
    expect(() => parseTimelineData(raw)).not.toThrow();
  });
  it('verified ausente vira false', () => {
    expect(parseTimelineData(raw).events.every((e) => e.verified === false)).toBe(true);
  });
  it('rejeita saga inexistente', () => {
    const e = clone(events);
    e[0].saga = 'nao_existe';
    expect(() => parseTimelineData({ ...raw, events: e })).toThrow(/saga inexistente/);
  });
  it('rejeita tag inexistente', () => {
    const e = clone(events);
    e[0].tags = ['nao_existe'];
    expect(() => parseTimelineData({ ...raw, events: e })).toThrow(/tag inexistente/);
  });
  it('rejeita id de evento duplicado', () => {
    const e = clone(events);
    e[1].id = e[0].id;
    expect(() => parseTimelineData({ ...raw, events: e })).toThrow(/duplicado/);
  });
  it('rejeita era inexistente numa saga', () => {
    const s = clone(sagas);
    s[0].era = 'nao_existe';
    expect(() => parseTimelineData({ ...raw, sagas: s })).toThrow(/era inexistente/);
  });
  it('rejeita importância e confiança inválidas', () => {
    const e = clone(events);
    (e[0] as { imp: number }).imp = 4;
    expect(() => parseTimelineData({ ...raw, events: e })).toThrow();
    const f = clone(events);
    (f[0] as { date: { conf: string } }).date.conf = 'talvez';
    expect(() => parseTimelineData({ ...raw, events: f })).toThrow();
  });
  it('rejeita tipo, canon e data inválidos', () => {
    for (const patch of [{ kind: 'festa' }, { canon: 'fanfic' }, { date: { ago: -1, precision: 'ano', conf: 'exata' } }]) {
      const e = clone(events);
      Object.assign(e[0] as object, patch);
      expect(() => parseTimelineData({ ...raw, events: e })).toThrow();
    }
  });
  it('conflicts ausente vira lista vazia', () => {
    expect(parseTimelineData(raw).events.every((e) => Array.isArray(e.conflicts))).toBe(true);
  });
  it('rejeita fonte sem itens, com tipo desconhecido ou URL inválida', () => {
    for (const src of [[], [{ type: 'blog', ref: 'x' }], [{ type: 'wiki', ref: 'x', url: 'nao-e-url' }]]) {
      const e = clone(events);
      (e[0] as { src: unknown }).src = src;
      expect(() => parseTimelineData({ ...raw, events: e })).toThrow();
    }
  });
});
