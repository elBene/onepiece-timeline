import { createStore } from './store';
import { initialState } from './state';
import { loadSaved, save } from './persist';
import type { TimelineApi } from '../components/timeline/mount';

/** Estado único da página. Os scripts de Controles, Fita e Popup importam o mesmo módulo. */
export const store = createStore({ ...initialState, ...(typeof window === 'undefined' ? {} : loadSaved()) });
store.subscribe(save);

let api: TimelineApi | undefined;
export const setTimelineApi = (a: TimelineApi) => {
  api = a;
};
export const getTimelineApi = () => api;

/** Disparado no document após cada renderização da fita. detail: { shown: number; hidden: number } */
export const RENDERED_EVENT = 'timeline:rendered';
