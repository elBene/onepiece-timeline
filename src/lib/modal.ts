import { CANON_LABEL, KIND_LABEL, SOURCE_LABEL, type TimelineData } from './schema';
import type { TimelineState } from './state';
import { chapterLabel, episodeLabel, HIDDEN_TITLE, isHidden, type EventView } from './spoilers';
import { formatAgo, formatBothCalendars, formatWhen } from './calendar';

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
  conf: EventView['conf'];
}

export function toModalView(
  data: TimelineData,
  state: Pick<TimelineState, 'spoilerOn' | 'lastChapter'> & Partial<Pick<TimelineState, 'spoilerMode' | 'lastEpisode'>>,
  id: string,
): ModalView | null {
  const e = data.events.find((x) => x.id === id);
  if (!e) return null;
  const saga = data.sagas.find((s) => s.id === e.saga);
  const era = data.eras.find((x) => x.id === saga?.era);
  const ribbon = [era?.name, saga?.name].filter(Boolean).join(' · ');

  if (isHidden(e, state)) {
    // Nem era nem saga: o nome do arco já seria spoiler.
    return {
      id,
      hidden: true,
      ribbon: 'Transmissão protegida',
      title: HIDDEN_TITLE,
      when: '',
      stampNote: '',
      sum: 'Esta transmissão chega depois do ponto em que você está. Avance o seu ponto em “Li até” para recebê-la.',
      more: '',
      tags: [],
      facts: [],
      conf: 'oculta',
    };
  }
  const ep = episodeLabel(e.revealed);
  const facts = [
    { label: 'Calendários', value: formatBothCalendars(e.date) },
    { label: 'Distância', value: formatAgo(e.date) },
    { label: 'Revelado em', value: [chapterLabel(e.revealed), ep].filter(Boolean).join(' · ') },
    { label: 'Tipo', value: `${KIND_LABEL[e.kind]} · ${CANON_LABEL[e.canon]}` },
    {
      label: 'Fonte',
      value: e.src.map((x) => `${SOURCE_LABEL[x.type]}, ${x.ref}${x.page ? `, p. ${x.page}` : ''}`).join(' · '),
    },
    { label: 'Confiança da data', value: e.date.conf },
    ...e.conflicts.map((c) => ({ label: 'Divergência', value: c.note })),
    { label: 'Status', value: e.verified ? 'verificado' : 'rascunho a verificar' },
  ];
  return {
    id,
    hidden: false,
    ribbon,
    title: e.title,
    when: formatWhen(e.date),
    stampNote: `${chapterLabel(e.revealed)} · ${IMP_LABEL[e.imp]}`,
    sum: e.sum,
    more: e.more,
    tags: e.tags.map((t) => data.tags[t] ?? t),
    facts,
    conf: e.date.conf,
  };
}
