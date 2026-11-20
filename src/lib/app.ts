import { createStore } from './store';
import { initialState } from './state';
import type { TimelineApi } from '../components/timeline/mount';

/** Estado único da página. Os scripts de Controles, Corda e Popup importam o mesmo módulo. */
export const store = createStore(initialState);

let api: TimelineApi | undefined;
export const setTimelineApi = (a: TimelineApi) => {
  api = a;
};
export const getTimelineApi = () => api;

/** Disparado no document após cada renderização da corda. detail: { shown: number } */
export const RENDERED_EVENT = 'timeline:rendered';
