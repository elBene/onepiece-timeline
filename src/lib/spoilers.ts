import type { TimelineEvent } from './schema';
import type { TimelineState } from './state';

export const HIDDEN_TITLE = 'Evento oculto';

type SpoilerState = Pick<TimelineState, 'spoilerOn' | 'lastChapter'>;

export function isHidden(e: Pick<TimelineEvent, 'ch'>, s: SpoilerState): boolean {
  return s.spoilerOn && (e.ch === null || e.ch > s.lastChapter);
}

export function chapterLabel(e: Pick<TimelineEvent, 'ch' | 'approx'>): string {
  return e.ch === null ? 'cap. a confirmar' : (e.approx ? '≈ cap. ' : 'cap. ') + e.ch;
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
  const chapter = chapterLabel(e);
  return { id: e.id, hidden: false, title: e.title, sum: e.sum, when: e.when, chapter, tip: `${e.when} · ${chapter}` };
}
