import type { TimelineData } from '../../lib/schema';
import type { Store } from '../../lib/store';
import type { TimelineState } from '../../lib/state';
import { computeHorizontalLayout, type HorizontalLayout } from '../../lib/layout';
import { h } from '../../lib/dom';
import { RENDERED_EVENT } from '../../lib/app';
import { EraFlag } from './EraFlag';
import { SagaLabel } from './SagaLabel';
import { EventMedallion } from './EventMedallion';
import { EventDot } from './EventDot';

export interface TimelineApi {
  /** Eventos exibidos, na ordem da corda. */
  getOrder(): string[];
  centerOn(id: string): void;
}

/** Evento disparado no document quando o usuário abre um evento (clique ou Enter). */
export const OPEN_EVENT = 'timeline:open';

function query<T extends Element>(root: ParentNode, sel: string): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`Elemento não encontrado: ${sel}`);
  return el;
}

export function mountTimeline(root: HTMLElement, data: TimelineData, store: Store<TimelineState>): TimelineApi {
  const scroller = query<HTMLElement>(root, '[data-scroll]');
  const track = query<HTMLElement>(root, '[data-track]');
  const prog = query<HTMLElement>(root, '[data-prog]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let layout: HorizontalLayout = { items: [], width: 0, order: [], xById: {} };
  let io: IntersectionObserver | undefined;

  function updateProgress() {
    const max = scroller.scrollWidth - scroller.clientWidth;
    prog.style.setProperty('--hp', max > 0 ? (scroller.scrollLeft / max).toFixed(4) : '0');
  }

  /** Elementos que entram fora da tela surgem com animação suave ao aparecer. */
  function setupReveal() {
    io?.disconnect();
    if (reduce || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.remove('pre');
            observer.unobserve(en.target);
          }
        }),
      { root: scroller },
    );
    io = observer;
    const base = scroller.getBoundingClientRect().left;
    track.querySelectorAll('.hz-ev, .dot-h').forEach((el) => {
      if (el.getBoundingClientRect().left - base > scroller.clientWidth) {
        el.classList.add('pre');
        observer.observe(el);
      }
    });
  }

  function render(state: TimelineState) {
    layout = computeHorizontalLayout(data, state);
    const nodes: Node[] = [h('div', { class: 'rope' })];
    for (const item of layout.items) {
      if (item.kind === 'era') nodes.push(EraFlag(item));
      else if (item.kind === 'saga') nodes.push(SagaLabel(item));
      else if (item.kind === 'medallion') nodes.push(EventMedallion(item));
      else nodes.push(EventDot(item));
    }
    if (layout.items.length === 0) nodes.push(h('div', { class: 'empty' }, ['Nenhum evento com esse filtro.']));
    track.style.width = `${layout.width}px`;
    track.replaceChildren(...nodes);
    setupReveal();
    updateProgress();
    document.dispatchEvent(new CustomEvent(RENDERED_EVENT, { detail: { shown: layout.order.length } }));
  }

  function centerOn(id: string) {
    const x = layout.xById[id];
    if (x === undefined) return;
    scroller.scrollTo({ left: x - scroller.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
  }

  // Arrastar com o mouse (toque usa a rolagem nativa).
  let down = false;
  let moved = false;
  let startX = 0;
  let startLeft = 0;
  scroller.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.pointerType === 'touch') return;
    down = true;
    moved = false;
    startX = e.clientX;
    startLeft = scroller.scrollLeft;
  });
  scroller.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 5) {
      moved = true;
      scroller.classList.add('drag');
      try {
        scroller.setPointerCapture(e.pointerId);
      } catch {
        /* ignorado */
      }
    }
    if (moved) scroller.scrollLeft = startLeft - dx;
  });
  const endDrag = () => {
    if (!down) return;
    down = false;
    scroller.classList.remove('drag');
    if (moved) setTimeout(() => (moved = false), 0);
  };
  scroller.addEventListener('pointerup', endDrag);
  scroller.addEventListener('pointercancel', endDrag);
  // Depois de um arrasto, o clique que o navegador gera não deve abrir evento.
  scroller.addEventListener(
    'click',
    (e) => {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
      }
    },
    true,
  );

  // Rolagem vertical vira horizontal enquanto houver espaço.
  scroller.addEventListener(
    'wheel',
    (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = scroller.scrollWidth - scroller.clientWidth;
      if ((e.deltaY > 0 && scroller.scrollLeft < max - 1) || (e.deltaY < 0 && scroller.scrollLeft > 1)) {
        e.preventDefault();
        scroller.scrollLeft += e.deltaY;
      }
    },
    { passive: false },
  );

  scroller.addEventListener('scroll', updateProgress, { passive: true });
  addEventListener('resize', updateProgress);

  const page = (dir: 1 | -1) => () =>
    scroller.scrollBy({ left: dir * scroller.clientWidth * 0.7, behavior: reduce ? 'auto' : 'smooth' });
  query(root, '[data-prev]').addEventListener('click', page(-1));
  query(root, '[data-next]').addEventListener('click', page(1));

  track.addEventListener('click', (e) => {
    const target = (e.target as Element).closest<HTMLElement>('[data-id]');
    if (!target) return;
    document.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { id: target.dataset.id, origin: target } }));
  });

  store.subscribe(render);
  render(store.get());

  return { getOrder: () => layout.order, centerOn };
}
