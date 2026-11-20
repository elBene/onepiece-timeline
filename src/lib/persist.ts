import type { SpoilerMode, TimelineState, Zoom, Axis } from './state';

const KEY = 'op-timeline:v1';

/** O que vale a pena lembrar entre visitas. Temas (tags) não: são exploração do momento. */
export type Saved = Pick<
  TimelineState,
  'axis' | 'zoom' | 'spoilerOn' | 'spoilerMode' | 'spoilerSaga' | 'lastChapter' | 'lastEpisode'
>;

const MODES: SpoilerMode[] = ['saga', 'ch', 'ep'];

/** Lê o estado salvo, descartando qualquer campo inválido. Nunca lança. */
export function loadSaved(): Partial<Saved> {
  let raw: unknown;
  try {
    raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
  } catch {
    return {};
  }
  if (!raw || typeof raw !== 'object') return {};
  const r = raw as Record<string, unknown>;
  const out: Partial<Saved> = {};
  if (r.axis === 'chrono' || r.axis === 'pub') out.axis = r.axis as Axis;
  if (r.zoom === 1 || r.zoom === 2 || r.zoom === 3 || r.zoom === 4) out.zoom = r.zoom as Zoom;
  if (typeof r.spoilerOn === 'boolean') out.spoilerOn = r.spoilerOn;
  if (MODES.includes(r.spoilerMode as SpoilerMode)) out.spoilerMode = r.spoilerMode as SpoilerMode;
  if (typeof r.spoilerSaga === 'string' || r.spoilerSaga === null) out.spoilerSaga = r.spoilerSaga as string | null;
  if (Number.isInteger(r.lastChapter) && (r.lastChapter as number) >= 0) out.lastChapter = r.lastChapter as number;
  if (Number.isInteger(r.lastEpisode) && (r.lastEpisode as number) >= 1) out.lastEpisode = r.lastEpisode as number;
  return out;
}

export function save(s: TimelineState): void {
  const out: Saved = {
    axis: s.axis,
    zoom: s.zoom,
    spoilerOn: s.spoilerOn,
    spoilerMode: s.spoilerMode,
    spoilerSaga: s.spoilerSaga,
    lastChapter: s.lastChapter,
    lastEpisode: s.lastEpisode,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(out));
  } catch {
    /* modo privado ou armazenamento bloqueado: segue sem lembrar */
  }
}
