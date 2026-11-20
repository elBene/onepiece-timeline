import { h } from '../../lib/dom';
import type { LayoutItem } from '../../lib/layout';

export function SagaLabel(item: Extract<LayoutItem, { kind: 'saga' }>): HTMLElement {
  return h('div', { class: 'hz-saga', style: `left:${item.x}px` }, [
    h('div', { class: 'lab' }, [
      h('h3', {}, [item.saga.name]),
      item.subtitle ? h('small', {}, [item.subtitle]) : null,
    ]),
  ]);
}
