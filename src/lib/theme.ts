/** Apresentação (cores e ícones). Fica fora dos JSONs de dados de propósito. */

/** Paleta das sagas: cada saga herda uma cor pela posição em sagas.json. */
export const SAGA_PALETTE = ['var(--red)', 'var(--gold)', 'var(--sea)', 'var(--jade)', 'var(--rose)', 'var(--violet)'];

/** Cor da bandeira de cada era. */
export const ERA_FLAG_COLORS: Record<string, string> = {
  antiga: 'var(--era-ancient)',
  void: 'var(--era-void)',
  roger: 'var(--era-roger)',
  gpe: 'var(--era-gpe)',
};
export const DEFAULT_FLAG_COLOR = 'var(--era-default)';

/** Traços de ícones genéricos (viewBox 24). Originais, sem símbolos da obra. */
export const ICON_PATHS: Record<string, string> = {
  crown: 'M3 18h18l-1.5-10-4.5 4-3-7-3 7-4.5-4z',
  flame: 'M12 3c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4 0-7 1-10z',
  lantern: 'M12 2v2 M9 4h6 M8 9c0-2.8 1.8-5 4-5s4 2.2 4 5v8c0 2-1.8 3-4 3s-4-1-4-3z M8 12h8 M8 16h8',
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
  e1: 'scroll', 'v-grande-guerra': 'swords', 'v-governo-mundial': 'crown', e4: 'compass', e5: 'crown', e6: 'flame', e7: 'lantern', e8: 'ship', e13: 'flame',
  e15: 'compass', e17: 'swords', e18: 'anchor', e19: 'lantern', e23: 'star', e24: 'swords',
};
