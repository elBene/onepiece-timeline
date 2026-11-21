import type { Revealed, Saga, TimelineData, TimelineEvent } from './schema';
import type { TimelineState } from './state';
import { formatWhen } from './calendar';
import { maxCh, minCh } from './sort';

export const HIDDEN_TITLE = 'Além do horizonte';
export const HIDDEN_SAGA = 'Mar ainda não navegado';

type SpoilerState = Pick<TimelineState, 'spoilerOn' | 'lastChapter'> &
  Partial<Pick<TimelineState, 'spoilerMode' | 'lastEpisode'>>;

/**
 * A trava é quando o evento é revelado, não quando acontece.
 * No modo episódio, eventos com episódio conhecido comparam pelo episódio;
 * os demais caem no limite de capítulo derivado (conservador).
 */
export function isHidden(e: { revealed: Pick<Revealed, 'ch'> & Partial<Pick<Revealed, 'ep'>> }, s: SpoilerState): boolean {
  if (!s.spoilerOn) return false;
  if (s.spoilerMode === 'ep' && s.lastEpisode !== undefined && e.revealed.ep != null) {
    return e.revealed.ep > s.lastEpisode;
  }
  return e.revealed.ch === null || e.revealed.ch > s.lastChapter;
}

export function chapterLabel(r: Pick<Revealed, 'ch' | 'approx'>): string {
  return r.ch === null ? 'cap. a confirmar' : (r.approx ? '≈ cap. ' : 'cap. ') + r.ch;
}

export function episodeLabel(r: Pick<Revealed, 'ep'>): string {
  return r.ep === null ? '' : `ep. ${r.ep}`;
}

/** Sagas que correspondem a arcos de publicação, na ordem em que foram publicadas. */
export function arcSagas(data: TimelineData): Saga[] {
  const evs = (s: Saga) => data.events.filter((e) => e.saga === s.id);
  return data.sagas.filter((s) => s.arc).sort((a, b) => minCh(evs(a)) - minCh(evs(b)));
}

/**
 * Capítulo-limite de quem chegou ao fim de uma saga: o maior capítulo entre os
 * eventos dela. Conservador: nunca libera algo publicado depois do que está nos dados.
 */
export function chapterForSaga(data: TimelineData, sagaId: string): number {
  return maxCh(data.events.filter((e) => e.saga === sagaId));
}

/** Capítulo-limite de quem viu até um episódio: o maior capítulo já adaptado até ele, segundo os dados. */
export function chapterForEpisode(data: TimelineData, ep: number): number {
  return maxCh(data.events.filter((e: TimelineEvent) => e.revealed.ep !== null && e.revealed.ep <= ep));
}

/**
 * O que a interface pode mostrar de um evento. Para eventos ocultos, o texto real
 * NUNCA entra aqui: os componentes só recebem esta versão, então nada vaza para o DOM.
 */
export interface EventView {
  id: string;
  hidden: boolean;
  title: string;
  sum: string;
  when: string;
  chapter: string;
  /** "ep. 4", ou vazio. */
  episode: string;
  imp: 1 | 2 | 3;
  /** Linha secundária da etiqueta das marcas pequenas. */
  tip: string;
  /** Confiança da data; 'oculta' quando o evento está protegido. */
  conf: 'exata' | 'estimada' | 'inferida' | 'oculta';
}

export function toView(e: TimelineEvent, s: SpoilerState): EventView {
  if (isHidden(e, s)) {
    return {
      id: e.id,
      hidden: true,
      title: HIDDEN_TITLE,
      sum: 'Acontece depois do ponto em que você está na história.',
      when: '',
      chapter: '',
      episode: '',
      imp: e.imp as 1 | 2 | 3,
      tip: 'Protegido contra spoilers',
      conf: 'oculta',
    };
  }
  const chapter = chapterLabel(e.revealed);
  const when = formatWhen(e.date);
  return {
    id: e.id,
    hidden: false,
    title: e.title,
    sum: e.sum,
    when,
    chapter,
    episode: episodeLabel(e.revealed),
    imp: e.imp as 1 | 2 | 3,
    tip: `${when} · ${chapter}`,
    conf: e.date.conf,
  };
}
