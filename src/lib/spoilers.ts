import type { Revealed, TimelineEvent } from './schema';
import type { TimelineState } from './state';
import { formatWhen } from './calendar';

export const HIDDEN_TITLE = 'Evento oculto';

type SpoilerState = Pick<TimelineState, 'spoilerOn' | 'lastChapter'>;

/** A trava é o capítulo em que o evento é revelado, não a data em que acontece. */
export function isHidden(e: { revealed: Pick<Revealed, 'ch'> }, s: SpoilerState): boolean {
  return s.spoilerOn && (e.revealed.ch === null || e.revealed.ch > s.lastChapter);
}

export function chapterLabel(r: Pick<Revealed, 'ch' | 'approx'>): string {
  return r.ch === null ? 'cap. a confirmar' : (r.approx ? '≈ cap. ' : 'cap. ') + r.ch;
}

export function episodeLabel(r: Pick<Revealed, 'ep'>): string {
  return r.ep === null ? '' : `ep. ${r.ep}`;
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
  /** Linha secundária da etiqueta das bolinhas. */
  tip: string;
}

export function toView(e: TimelineEvent, s: SpoilerState): EventView {
  if (isHidden(e, s)) {
    return {
      id: e.id,
      hidden: true,
      title: HIDDEN_TITLE,
      sum: `Aparece depois do capítulo ${s.lastChapter}.`,
      when: '• • •',
      chapter: '',
      tip: 'Protegido contra spoilers',
    };
  }
  const chapter = chapterLabel(e.revealed);
  const when = formatWhen(e.date);
  return { id: e.id, hidden: false, title: e.title, sum: e.sum, when, chapter, tip: `${when} · ${chapter}` };
}
