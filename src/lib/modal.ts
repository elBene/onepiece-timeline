import { SOURCE_LABEL, type TimelineData } from './schema';
import type { TimelineState } from './state';
import { chapterLabel, isHidden } from './spoilers';

const IMP_LABEL: Record<number, string> = { 3: 'Marco', 2: 'Evento', 1: 'Detalhe' };

/** Tudo o que o popup pode exibir. Para eventos ocultos, não contém nenhum texto do evento. */
export interface ModalView {
  id: string;
  hidden: boolean;
  ribbon: string;
  title: string;
  when: string;
  stampNote: string;
  sum: string;
  more: string;
  tags: string[];
  facts: { label: string; value: string }[];
}

export function toModalView(
  data: TimelineData,
  state: Pick<TimelineState, 'spoilerOn' | 'lastChapter'>,
  id: string,
): ModalView | null {
  const e = data.events.find((x) => x.id === id);
  if (!e) return null;
  const saga = data.sagas.find((s) => s.id === e.saga);
  const era = data.eras.find((x) => x.id === saga?.era);
  const ribbon = ['Registro do diário de bordo', era?.name, saga?.name].filter(Boolean).join(' · ');

  if (isHidden(e, state)) {
    return {
      id,
      hidden: true,
      ribbon,
      title: 'Evento oculto',
      when: '• • •',
      stampNote: 'protegido',
      sum: `Este acontecimento aparece depois do capítulo ${state.lastChapter}. Desative a proteção contra spoilers para ver.`,
      more: '',
      tags: [],
      facts: [],
    };
  }
  return {
    id,
    hidden: false,
    ribbon,
    title: e.title,
    when: e.when,
    stampNote: `${chapterLabel(e)} · ${IMP_LABEL[e.imp]}`,
    sum: e.sum,
    more: e.more,
    tags: e.tags.map((t) => data.tags[t] ?? t),
    facts: [
      { label: 'Fonte', value: e.src.map((x) => `${SOURCE_LABEL[x.type]}, ${x.ref}`).join(' · ') },
      { label: 'Confiança da data', value: e.conf },
      { label: 'Status', value: e.verified ? 'verificado' : 'rascunho a verificar' },
    ],
  };
}
