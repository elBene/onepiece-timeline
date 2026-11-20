export type Axis = 'chrono' | 'pub';
/** 1 Eras, 2 Marcos, 3 Eventos, 4 Tudo */
export type Zoom = 1 | 2 | 3 | 4;

export interface TimelineState {
  axis: Axis;
  zoom: Zoom;
  tags: ReadonlySet<string>;
  spoilerOn: boolean;
  /** Último capítulo lido. Só vale quando spoilerOn. */
  lastChapter: number;
}

export const initialState: TimelineState = {
  axis: 'chrono',
  zoom: 3,
  tags: new Set(),
  spoilerOn: false,
  lastChapter: 100,
};
