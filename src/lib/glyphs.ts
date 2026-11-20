/** Traços desenhados para o site (viewBox 0 0 32 32). Genéricos, sem símbolos da obra. */

/** Espiral de recepção: a concha que gira enquanto uma transmissão chega. */
export const SPIRAL_PATH =
  'M16 16.5a1.6 1.6 0 1 1 1.7-1.6c0 2-1.8 3.4-3.7 3.4-2.6 0-4.4-2.2-4.4-4.8 0-3.4 2.8-5.9 6.1-5.9 4.1 0 7.1 3.3 7.1 7.4 0 4.8-3.9 8.6-8.7 8.6';

export function spiralSvg(cls = 'spiral'): string {
  return `<svg class="${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="${SPIRAL_PATH}" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`;
}
