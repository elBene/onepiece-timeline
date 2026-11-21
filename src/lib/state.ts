export type Axis = 'chrono' | 'pub';
/** 1 Eras, 2 Marcos, 3 Eventos, 4 Tudo */
export type Zoom = 1 | 2 | 3 | 4;
/** Como o visitante informa até onde chegou. */
export type SpoilerMode = 'saga' | 'ch' | 'ep';

export interface TimelineState {
  axis: Axis;
  zoom: Zoom;
  tags: ReadonlySet<string>;
  spoilerOn: boolean;
  spoilerMode: SpoilerMode;
  /** Saga (arco) escolhida no modo 'saga'. */
  spoilerSaga: string | null;
  /** Limite efetivo em capítulos. Nos modos 'saga' e 'ep' é derivado dos dados. */
  lastChapter: number;
  /** Último episódio visto. Só vale no modo 'ep'. */
  lastEpisode: number;
}

export const initialState: TimelineState = {
  axis: 'chrono',
  zoom: 3,
  tags: new Set(),
  spoilerOn: false,
  spoilerMode: 'saga',
  spoilerSaga: null,
  lastChapter: 100,
  lastEpisode: 1,
};
