import { describe, expect, it } from 'vitest';
import { compareDates, formatAgo, formatBothCalendars, formatWhen, PRESENT, yearOf } from './calendar';
import { EventDateSchema, type EventDate } from './schema';

const d = (patch: Partial<EventDate>): EventDate => ({ ago: 0, precision: 'ano', conf: 'exata', seq: 0, ...patch });

describe('calendário (SBS vol. 113)', () => {
  it('presente pós-timeskip: C.M. 1541 e E.C. 4131', () => {
    expect(yearOf(0, 'kaienreki')).toBe(1541);
    expect(yearOf(0, 'tenreki')).toBe(4131);
    expect(PRESENT.tenreki - PRESENT.kaienreki).toBe(2590);
  });
  it('Luffy nasce 19 anos antes do presente: C.M. 1522 / E.C. 4112', () => {
    expect(yearOf(19, 'kaienreki')).toBe(1522);
    expect(yearOf(19, 'tenreki')).toBe(4112);
  });
  it('rótulos', () => {
    expect(formatWhen(d({ ago: 38 }))).toBe('1503 C.M.');
    expect(formatWhen(d({ ago: 38 }), 'tenreki')).toBe('4093 E.C.');
    expect(formatWhen(d({ ago: 38, conf: 'estimada' }))).toBe('≈ 1503 C.M.');
    expect(formatWhen(d({ ago: 900, agoEnd: 800, precision: 'seculo', conf: 'estimada' }))).toBe('≈ 641 a 741 C.M.');
    expect(formatWhen(d({ ago: 421, month: 6, day: 21, precision: 'dia' }))).toBe('21 jun. 1120 C.M.');
    expect(formatBothCalendars(d({ ago: 38 }))).toBe('Círculo Marítimo 1503 · Era do Céu 4093');
  });
  it('distância até o presente', () => {
    expect(formatAgo(d({ ago: 0 }))).toBe('ano atual da história');
    expect(formatAgo(d({ ago: 1 }))).toBe('1 ano antes de hoje');
    expect(formatAgo(d({ ago: 24 }))).toBe('24 anos antes de hoje');
    expect(formatAgo(d({ ago: 900, agoEnd: 800, precision: 'seculo' }))).toBe('≈ de 900 a 800 anos antes de hoje');
  });
  it('ordena do mais antigo para o mais recente, desempatando por seq', () => {
    const list = [d({ ago: 2, seq: 2 }), d({ ago: 38 }), d({ ago: 2, seq: 1 }), d({ ago: 0 })];
    expect(list.sort(compareDates).map((x) => `${x.ago}/${x.seq}`)).toEqual(['38/0', '2/1', '2/2', '0/0']);
  });
  it('schema rejeita intervalo invertido e dia sem mês', () => {
    expect(() => EventDateSchema.parse(d({ ago: 800, agoEnd: 900 }))).toThrow();
    expect(() => EventDateSchema.parse(d({ ago: 10, day: 3 }))).toThrow();
    expect(EventDateSchema.parse({ ago: 5, precision: 'ano', conf: 'exata' }).seq).toBe(0);
  });
});
