import type { TimelineData } from '../../lib/schema';
import type { Store } from '../../lib/store';
import type { TimelineState } from '../../lib/state';
import { computeHorizontalLayout, type HorizontalLayout, type LayoutItem } from '../../lib/layout';
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
  /** Garante que o evento esteja montado, leva a corda até ele e move o foco para o botão dele. */
  focusEvent(id: string): void;
}

/** Evento disparado no document quando o usuário abre um evento (clique ou Enter). */
export const OPEN_EVENT = 'timeline:open';

/** Folga (px) renderizada além da área visível, para a rolagem não mostrar espaço vazio. */
const WINDOW_MARGIN = 700;

function query<T extends Element>(root: ParentNode, sel: string): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`Elemento não encontrado: ${sel}`);
  return el;
}

/** Faixa horizontal (px) que o nó de um item ocupa a partir do x dele. */
function extent(item: LayoutItem): [number, number] {
  switch (item.kind) {
    case 'era':
      return [item.x - 4, item.x + 240];
    case 'saga':
      return [item.x - 4, item.x + 140];
    case 'medallion':
      return [item.x - 110, item.x + 230];
    default:
      return [item.x - 16, item.x + 16];
  }
}

function buildNode(item: LayoutItem): HTMLElement {
  if (item.kind === 'era') return EraFlag(item);
  if (item.kind === 'saga') return SagaLabel(item);
  if (item.kind === 'medallion') return EventMedallion(item);
  return EventDot(item);
}

function eventButton(node: HTMLElement): HTMLButtonElement | null {
  return node instanceof HTMLButtonElement ? node : node.querySelector<HTMLButtonElement>('button.txt');
}

export function mountTimeline(root: HTMLElement, data: TimelineData, store: Store<TimelineState>): TimelineApi {
  const scroller = query<HTMLElement>(root, '[data-scroll]');
  const track = query<HTMLElement>(root, '[data-track]');
  const prog = query<HTMLElement>(root, '[data-prog]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rope = h('div', { class: 'rope' });
  let layout: HorizontalLayout = { items: [], width: 0, order: [], xById: {} };
  let axis: TimelineState['axis'] = 'chrono';
  /** Só os itens perto da área visível existem no DOM (índice em layout.items -> nó). */
  const mounted = new Map<number, HTMLElement>();
  const itemIndexById = new Map<string, number>();
  const orderPos = new Map<string, number>();
  let activeId: string | null = null;

  function updateProgress() {
    const max = scroller.scrollWidth - scroller.clientWidth;
    prog.style.setProperty('--hp', max > 0 ? (scroller.scrollLeft / max).toFixed(4) : '0');
  }

  /** Itens que entram fora da tela surgem com animação suave ao aparecer. */
  const io: IntersectionObserver | undefined =
    reduce || !('IntersectionObserver' in window)
      ? undefined
      : new IntersectionObserver(
          (entries) =>
            entries.forEach((en) => {
              if (en.isIntersecting) {
                en.target.classList.remove('pre');
                io?.unobserve(en.target);
              }
            }),
          { root: scroller },
        );

  function decorate(node: HTMLElement, item: LayoutItem) {
    if (item.kind === 'saga' && axis === 'pub') node.querySelector('h3')?.setAttribute('aria-level', '2');
    if (item.kind !== 'medallion' && item.kind !== 'dot') return;
    const id = item.view.id;
    const btn = eventButton(node);
    if (!btn) return;
    btn.tabIndex = id === activeId ? 0 : -1;
    if (item.view.hidden) {
      btn.setAttribute('aria-label', `Evento oculto, ${(orderPos.get(id) ?? 0) + 1} de ${layout.order.length}`);
    }
    if (axis === 'pub') node.querySelector('h4')?.setAttribute('aria-level', '3');
  }

  /** Garante um (e só um) botão de evento na ordem de Tab, mesmo quando o ativo saiu da janela. */
  function ensureTabStop() {
    const buttons = [...mounted.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, n]) => eventButton(n))
      .filter((b): b is HTMLButtonElement => !!b);
    if (!buttons.length) return;
    if (!buttons.some((b) => b.dataset.id === activeId)) {
      const left = scroller.scrollLeft;
      const pick = buttons.find((b) => (layout.xById[b.dataset.id!] ?? 0) >= left) ?? buttons[0]!;
      activeId = pick.dataset.id!;
    }
    for (const b of buttons) b.tabIndex = b.dataset.id === activeId ? 0 : -1;
  }

  function updateWindow() {
    const left = scroller.scrollLeft - WINDOW_MARGIN;
    const viewRight = scroller.scrollLeft + scroller.clientWidth;
    const right = viewRight + WINDOW_MARGIN;
    const wanted = new Set<number>();
    layout.items.forEach((item, i) => {
      const [a, b] = extent(item);
      if (b >= left && a <= right) wanted.add(i);
    });
    for (const [i, el] of mounted) {
      if (!wanted.has(i)) {
        io?.unobserve(el);
        el.remove();
        mounted.delete(i);
      }
    }
    // De trás para frente: cada nó novo entra antes do vizinho seguinte, mantendo a ordem de Tab.
    let next: HTMLElement | null = null;
    for (const i of [...wanted].sort((a, b) => b - a)) {
      let el = mounted.get(i);
      if (!el) {
        const item = layout.items[i]!;
        el = buildNode(item);
        decorate(el, item);
        track.insertBefore(el, next);
        mounted.set(i, el);
        if (io && (item.kind === 'medallion' || item.kind === 'dot') && extent(item)[0] > viewRight) {
          el.classList.add('pre');
          io.observe(el);
        }
      }
      next = el;
    }
    ensureTabStop();
  }

  function render(state: TimelineState) {
    layout = computeHorizontalLayout(data, state);
    axis = state.axis;
    itemIndexById.clear();
    orderPos.clear();
    layout.order.forEach((id, i) => orderPos.set(id, i));
    layout.items.forEach((item, i) => {
      if (item.kind === 'medallion' || item.kind === 'dot') itemIndexById.set(item.view.id, i);
    });
    if (activeId && !itemIndexById.has(activeId)) activeId = null;
    for (const el of mounted.values()) {
      io?.unobserve(el);
      el.remove();
    }
    mounted.clear();
    track.style.width = `${layout.width}px`;
    const fixed: Node[] = [rope];
    if (layout.items.length === 0) fixed.push(h('div', { class: 'empty' }, ['Nenhum evento com esse filtro.']));
    track.replaceChildren(...fixed);
    updateWindow();
    updateProgress();
    document.dispatchEvent(new CustomEvent(RENDERED_EVENT, { detail: { shown: layout.order.length } }));
  }

  function centerOn(id: string) {
    const x = layout.xById[id];
    if (x === undefined) return;
    scroller.scrollTo({ left: x - scroller.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
  }

  function findButton(id: string): HTMLButtonElement | null {
    const i = itemIndexById.get(id);
    const node = i === undefined ? undefined : mounted.get(i);
    return node ? eventButton(node) : null;
  }

  function focusEvent(id: string) {
    const x = layout.xById[id];
    if (x === undefined) return;
    let btn = findButton(id);
    if (!btn) {
      // Fora da janela: salta direto (sem animação) para montar o item antes de focar.
      scroller.scrollLeft = Math.max(0, x - scroller.clientWidth / 2);
      updateWindow();
      btn = findButton(id);
    }
    if (!btn) return;
    btn.focus({ preventScroll: true });
    const inView = x > scroller.scrollLeft + 90 && x < scroller.scrollLeft + scroller.clientWidth - 90;
    if (!inView) centerOn(id);
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
  scroller.addEventListener('lostpointercapture', endDrag);
  addEventListener('blur', endDrag);
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

  let frame = 0;
  const onScroll = () => {
    updateProgress();
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      updateWindow();
    });
  };
  scroller.addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  const page = (dir: 1 | -1) => () =>
    scroller.scrollBy({ left: dir * scroller.clientWidth * 0.7, behavior: reduce ? 'auto' : 'smooth' });
  query(root, '[data-prev]').addEventListener('click', page(-1));
  query(root, '[data-next]').addEventListener('click', page(1));

  track.addEventListener('click', (e) => {
    const target = (e.target as Element).closest<HTMLElement>('[data-id]');
    if (!target) return;
    document.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { id: target.dataset.id, origin: target } }));
  });

  // Uma parada de Tab para a corda inteira; as setas percorrem os eventos.
  track.addEventListener('focusin', (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('button[data-id]');
    if (!btn || btn.dataset.id === activeId) return;
    const old = activeId ? findButton(activeId) : null;
    if (old) old.tabIndex = -1;
    activeId = btn.dataset.id!;
    btn.tabIndex = 0;
  });
  track.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const btn = (e.target as Element).closest<HTMLButtonElement>('button[data-id]');
    if (!btn) return;
    const order = layout.order;
    const i = order.indexOf(btn.dataset.id!);
    let n = -1;
    if (e.key === 'ArrowRight') n = Math.min(order.length - 1, i + 1);
    else if (e.key === 'ArrowLeft') n = Math.max(0, i - 1);
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = order.length - 1;
    if (n < 0 || i < 0) return;
    e.preventDefault();
    if (n !== i) focusEvent(order[n]!);
  });

  // Etiqueta dos pontos: Esc a dispensa sem tirar o foco (WCAG 1.4.13). Volta ao sair do ponto.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    track.querySelectorAll('.dot-h:hover, .dot-h:focus-visible').forEach((d) => d.classList.add('tip-off'));
  });
  const reenableTip = (e: Event) => (e.target as Element).closest?.('.dot-h')?.classList.remove('tip-off');
  track.addEventListener('mouseout', reenableTip);
  track.addEventListener('focusout', reenableTip);

  // Texto maior (ajuste de fonte do navegador) pede mais altura acima e abaixo da corda.
  // A sonda mede 1rem; quando o tamanho muda, o ResizeObserver recalcula --d.
  const probe = h('div', { 'aria-hidden': 'true', style: 'position:absolute;visibility:hidden;width:1rem;height:0;pointer-events:none' });
  root.append(probe);
  const applyScale = () => {
    const scale = probe.getBoundingClientRect().width / 16 || 1;
    const d = Math.max(0, Math.round(131 * (scale - 1)));
    track.style.setProperty('--d', `${d}px`);
  };
  if ('ResizeObserver' in window) new ResizeObserver(applyScale).observe(probe);
  applyScale();

  store.subscribe(render);
  render(store.get());

  return { getOrder: () => layout.order, centerOn, focusEvent };
}
