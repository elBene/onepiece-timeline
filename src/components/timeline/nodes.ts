import { h, svg } from '../../lib/dom';
import { spiralSvg } from '../../lib/glyphs';
import type { LayoutItem } from '../../lib/layout';

type Of<K extends LayoutItem['kind']> = Extract<LayoutItem, { kind: K }>;

const pos = (x: number, extra = '') => `--x:${x}px;${extra}`;

/** Era: nome enorme e apagado no fundo, como uma estação no dial. */
export function EraMark(item: Of<'era'>): HTMLElement {
  return h('div', { class: 't-era', style: pos(item.x, `--w:${Math.max(240, item.end - item.x - 160)}px`), 'data-ghost': item.era.name }, [
    h('h2', {}, [item.era.name]),
    h('p', { class: 'mono' }, [item.era.span]),
  ]);
}

/** Saga: faixa de frequência sob a fita. O nome some quando nada dela foi revelado. */
export function SagaBand(item: Of<'saga'>): HTMLElement {
  return h('div', { class: `t-saga${item.hidden ? ' is-hidden' : ''}`, style: pos(item.x, `--w:${Math.max(60, item.end - item.x)}px`) }, [
    h('span', { class: 't-saga-rule', 'aria-hidden': 'true' }),
    h('h3', {}, [item.name]),
    item.subtitle ? h('p', { class: 'mono' }, [item.subtitle]) : null,
  ]);
}

/** Marco (importância 3): transmissão completa, presa à fita por uma haste cujo traço é a confiança da data. */
export function Transmission(item: Of<'medallion'>): HTMLElement {
  const { view } = item;
  const body = view.hidden
    ? [h('h4', {}, [view.title]), h('span', { class: 't-static static', 'aria-hidden': 'true' })]
    : [
        h('h4', {}, [view.title]),
        h('span', { class: 't-when mono' }, [svg(spiralSvg('t-spiral')), view.when, h('span', { class: 't-ch' }, [view.chapter])]),
        h('p', {}, [view.sum]),
      ];
  return h('div', { class: `t-ev ${item.side} conf-${view.conf}${view.hidden ? ' is-hidden' : ''}`, style: pos(item.x), 'data-ev': view.id }, [
    h('span', { class: 't-stem', 'aria-hidden': 'true' }),
    h('span', { class: 't-node', 'aria-hidden': 'true' }),
    h('button', { type: 'button', class: 't-txt', 'data-id': view.id, 'aria-describedby': 'hz-help' }, body),
  ]);
}

/** Acontecimento menor: marca na fita. A etiqueta aparece no hover, no foco e quando passa pela cabeça de leitura. */
export function Tick(item: Of<'dot'>): HTMLElement {
  const { view } = item;
  return h(
    'button',
    {
      type: 'button',
      class: `t-tick imp${item.imp}${view.hidden ? ' is-hidden' : ''}`,
      'data-id': view.id,
      'data-ev': view.id,
      style: pos(item.x),
      'aria-label': view.hidden ? view.title : `${view.title}, ${view.when}, ${view.chapter}`,
      'aria-describedby': 'hz-help',
    },
    [
      h('span', { class: 't-mark', 'aria-hidden': 'true' }),
      h('span', { class: 't-tip', 'aria-hidden': 'true' }, [h('b', {}, [view.title]), h('small', { class: 'mono' }, [view.tip])]),
    ],
  );
}
