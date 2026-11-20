import { h } from '../../lib/dom';
import { LAYOUT, yearLabel, type LayoutItem } from '../../lib/layout';
import { PRESENT } from '../../lib/calendar';

type Of<K extends LayoutItem['kind']> = Extract<LayoutItem, { kind: K }>;

const pos = (x: number, extra = '') => `--x:${x}px;${extra}`;

/** Era: um mastro alto na linha com o nome hasteado. */
export function EraMark(item: Of<'era'>): HTMLElement {
  return h('div', { class: 't-era', style: pos(item.x) }, [
    h('span', { class: 't-mast', 'aria-hidden': 'true' }),
    h('div', { class: 't-era-flag' }, [h('h2', {}, [item.era.name]), h('p', {}, [item.era.span])]),
  ]);
}

/** Saga: rótulo discreto logo abaixo da linha. O nome some quando nada dela foi revelado. */
export function SagaBand(item: Of<'saga'>): HTMLElement {
  return h('div', { class: `t-saga${item.hidden ? ' is-hidden' : ''}`, style: pos(item.x) }, [
    h('h3', {}, [item.name]),
    item.subtitle ? h('p', {}, [item.subtitle]) : null,
  ]);
}

/** Marco (importância 3): disco com nome e ano, preso à linha por uma haste. O traço da haste é a confiança da data. */
export function Marker(item: Of<'medallion'>): HTMLElement {
  const { view } = item;
  const label = view.hidden ? view.title : `${view.title}, ${view.when}, ${view.chapter}`;
  return h('div', { class: `t-ev ${item.side} conf-${view.conf}${view.hidden ? ' is-hidden' : ''}`, style: pos(item.x), 'data-ev': view.id }, [
    h('span', { class: 't-stem', 'aria-hidden': 'true' }),
    h('button', { type: 'button', class: 't-disc', 'data-id': view.id, 'aria-label': label, 'aria-describedby': 'hz-help' }, [
      h('span', { class: 't-title', 'aria-hidden': 'true' }, [view.title]),
      view.when ? h('span', { class: 't-year num', 'aria-hidden': 'true' }, [view.when]) : null,
    ]),
  ]);
}

/** Acontecimento menor: marca de régua na linha. A etiqueta aparece no hover, no foco e quando escolhido. */
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
      h('span', { class: 't-tip', 'aria-hidden': 'true' }, [h('b', {}, [view.title]), h('small', { class: 'num' }, [view.tip])]),
    ],
  );
}

/** Ano com acontecimentos: marca alta e o número em pílula, acima da linha. */
export function YearMark(item: Of<'year'>): HTMLElement {
  return h('div', { class: 't-yr', style: pos(item.x) }, [h('span', { class: 't-yr-mark', 'aria-hidden': 'true' }), h('b', { class: 'num' }, [item.label])]);
}

const mod = (a: number, n: number) => ((a % n) + n) % n;

/**
 * Anos sem registro: régua fina, um traço por ano e um mais alto por década.
 * Um rótulo a cada 50 anos, para que dê para se situar no meio de séculos vazios.
 */
export function Gap(item: Of<'gap'>): HTMLElement {
  const w = LAYOUT.emptyYear;
  const count = item.fromAgo - item.toAgo + 1;
  const y0 = PRESENT.kaienreki - item.fromAgo;
  const labels: HTMLElement[] = [];
  const step = 50;
  for (let k = mod(-y0, step); k < count; k += step) {
    if (k * w < 30 || (count - k) * w < 30) continue;
    labels.push(h('span', { class: 'num', style: `left:${k * w}px` }, [yearLabel(item.fromAgo - k)]));
  }
  return h(
    'div',
    {
      class: 't-gap',
      style: pos(item.x, `--w:${item.end - item.x}px;--dec:${mod(-y0, 10) * w}px;--yw:${w}px`),
      'aria-hidden': 'true',
    },
    labels,
  );
}
