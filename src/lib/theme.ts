/** Apresentação (cores e ícones). Fica fora dos JSONs de dados de propósito. */

/** Paleta das sagas: cada saga herda uma cor pela posição em sagas.json. */
export const SAGA_PALETTE = ['#e0502f', '#e3aa2c', '#3b8aa3', '#6fbf8e', '#c46b8a', '#8a7bd1'];

/** Cor da bandeira de cada era. */
export const ERA_FLAG_COLORS: Record<string, string> = {
  void: '#5b47a3',
  roger: '#8f5a1c',
  gpe: '#1d7188',
};
export const DEFAULT_FLAG_COLOR = '#3b8aa3';

/** Traços de ícones genéricos (viewBox 24). Originais, sem símbolos da obra. */
export const ICON_PATHS: Record<string, string> = {
  crown: 'M3 18h18l-1.5-10-4.5 4-3-7-3 7-4.5-4z',
  flame: 'M12 3c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4 0-7 1-10z',
  hat: 'M3 15c0-1.2 4-2.2 9-2.2s9 1 9 2.2-4 2.8-9 2.8-9-1.6-9-2.8z M7.5 13.6C7.5 9 9.5 6.5 12 6.5s4.5 2.5 4.5 7.1',
  ship: 'M4 16h16l-3 4H7z M12 3v13 M12 4.5c4 2 6 5 6 9h-6',
  scroll: 'M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M8 9h8 M8 13h8 M8 17h4',
  compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M15.5 8.5l-2 5-5 2 2-5z',
  swords: 'M6 4l12 12 M18 4L6 16 M4 8l4-4 M20 8l-4-4',
  star: 'M12 3l2.2 6.3L21 12l-6.8 2.7L12 21l-2.2-6.3L3 12l6.8-2.7z',
  anchor: 'M12 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4z M12 7v14 M5 13a7 7 0 0 0 14 0 M8 11h8',
};
export const DEFAULT_ICON = 'star';

/** Ícone por evento (marcos). Eventos sem entrada usam o padrão. */
export const EVENT_ICONS: Record<string, string> = {
  e1: 'scroll', e4: 'compass', e5: 'crown', e6: 'flame', e7: 'hat', e8: 'ship', e13: 'flame',
  e15: 'compass', e17: 'swords', e18: 'anchor', e19: 'hat', e23: 'star', e24: 'swords',
};
