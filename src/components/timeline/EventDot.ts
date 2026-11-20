import { h } from '../../lib/dom';
import type { LayoutItem } from '../../lib/layout';

/** Bolinha na corda (importância 2 e 1). Etiqueta aparece no hover e no foco do teclado. */
export function EventDot(item: Extract<LayoutItem, { kind: 'dot' }>): HTMLElement {
  const { view } = item;
  return h(
    'button',
    {
      type: 'button',
      class: `dot-h imp${item.imp}`,
      'data-id': view.id,
      style: `left:${item.x - 14}px;--c:${item.color}`,
      'aria-label': view.hidden ? view.title : `${view.title}, ${view.when}, ${view.chapter}`,
    },
    [h('span', { class: 'tip', 'aria-hidden': 'true' }, [h('b', {}, [view.title]), h('small', {}, [view.tip])])],
  );
}
