import { h } from '../../lib/dom';
import type { LayoutItem } from '../../lib/layout';

export function EraFlag(item: Extract<LayoutItem, { kind: 'era' }>): HTMLElement {
  return h('div', { class: 'hz-era', style: `left:${item.x}px;--c:${item.color}` }, [
    h('span', { class: 'mast' }),
    h('div', { class: 'flag' }, [h('small', {}, [item.era.span]), h('h2', {}, [item.era.name])]),
  ]);
}
