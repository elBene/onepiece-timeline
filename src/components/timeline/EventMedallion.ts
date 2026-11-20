import { h, svg } from '../../lib/dom';
import type { LayoutItem } from '../../lib/layout';
import { ICON_PATHS } from '../../lib/theme';

function wheelSvg(): SVGElement {
  let spokes = '';
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    spokes +=
      `<line x1="${(50 + 43 * Math.cos(a)).toFixed(1)}" y1="${(50 + 43 * Math.sin(a)).toFixed(1)}" ` +
      `x2="${(50 + 49 * Math.cos(a)).toFixed(1)}" y2="${(50 + 49 * Math.sin(a)).toFixed(1)}" ` +
      `stroke="currentColor" stroke-width="5" stroke-linecap="round"/>`;
  }
  return svg(
    `<svg class="wheel" viewBox="0 0 100 100" aria-hidden="true">${spokes}` +
      `<circle cx="50" cy="50" r="43" fill="#0a1b28" stroke="currentColor" stroke-width="2"/>` +
      `<circle cx="50" cy="50" r="33" fill="none" stroke="currentColor" stroke-width="8" opacity=".35"/>` +
      `<circle cx="50" cy="50" r="33" fill="none" stroke="currentColor" stroke-width="8" stroke-dasharray="104 104" transform="rotate(-90 50 50)"/>` +
      `<circle cx="50" cy="50" r="25" fill="#102a3b"/></svg>`,
  );
}

function iconSvg(name: string): SVGElement {
  const d = ICON_PATHS[name] ?? ICON_PATHS.star!;
  return svg(
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`,
  );
}

/** Marco (importância 3): medalhão em forma de timão, ligado à corda por linha pontilhada. */
export function EventMedallion(item: Extract<LayoutItem, { kind: 'medallion' }>): HTMLElement {
  const { view } = item;
  const icon = h('span', { class: 'ic' }, [view.hidden ? '?' : iconSvg(item.icon)]);
  return h(
    'div',
    {
      class: `hz-ev imp3 ${item.side}${view.hidden ? ' hid' : ''}`,
      style: `left:${item.x}px;--c:${item.color}`,
    },
    [
      h('div', { class: 'med', 'data-id': view.id, 'aria-hidden': 'true' }, [wheelSvg(), icon]),
      h('span', { class: 'conn' }),
      h('span', { class: 'node' }),
      h('button', { type: 'button', class: 'txt', 'data-id': view.id }, [
        h('span', { class: 'when' }, [view.when]),
        h('h4', {}, [view.title]),
        h('p', {}, [view.sum]),
      ]),
    ],
  );
}
