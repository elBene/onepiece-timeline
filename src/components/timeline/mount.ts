import type { TimelineData } from '../../lib/schema';
import type { Store } from '../../lib/store';
import type { TimelineState } from '../../lib/state';
import { computeHorizontalLayout, type HorizontalLayout, type LayoutItem } from '../../lib/layout';
import { h } from '../../lib/dom';
import { RENDERED_EVENT } from '../../lib/app';
import { EraMark, SagaBand, Tick, Transmission } from './nodes';

export interface TimelineApi {
  /** Eventos exibidos, na ordem da fita. */
  getOrder(): string[];
  /** Eventos exibidos e não protegidos, na ordem da fita. */
  getReadable(): string[];
  centerOn(id: string): void;
  /** Garante que o evento esteja montado, leva a fita até ele e move o foco para o botão dele. */
  focusEvent(id: string): void;
}

/** Evento disparado no document quando o usuário abre um evento (clique ou Enter). */
export const OPEN_EVENT = 'timeline:open';

/** Folga (px) renderizada além da área visível, para a rolagem não mostrar espaço vazio. */
const WINDOW_MARGIN = 700;
/** Distância (px) da cabeça de leitura em que um marco ou uma marca é "sintonizado". */
const TUNE_MAJOR = 170;
const TUNE_MINOR = 26;

function query<T extends Element>(root: ParentNode, sel: string): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`Elemento não encontrado: ${sel}`);
  return el;
}

/** Faixa horizontal (px) que o nó de um item ocupa a partir do x dele. */
function extent(item: LayoutItem): [number, number] {
  switch (item.kind) {
    case 'era':
      return [item.x - 8, item.x + 900];
    case 'saga':
      return [item.x - 8, Math.max(item.end, item.x + 260)];
    case 'medallion':
      return [item.x - 30, item.x + 300];
    default:
      return [item.x - 30, item.x + 200];
  }
}

function buildNode(item: LayoutItem): HTMLElement {
  if (item.kind === 'era') return EraMark(item);
  if (item.kind === 'saga') return SagaBand(item);
  if (item.kind === 'medallion') return Transmission(item);
  return Tick(item);
}

function eventButton(node: HTMLElement): HTMLButtonElement | null {
  return node instanceof HTMLButtonElement ? node : node.querySelector<HTMLButtonElement>('button[data-id]');
}

export function mountTimeline(root: HTMLElement, data: TimelineData, store: Store<TimelineState>): TimelineApi {
  const scroller = query<HTMLElement>(root, '[data-scroll]');
  const track = query<HTMLElement>(root, '[data-track]');
  const dial = query<HTMLElement>(root, '[data-dial]');
  const dialStations = query<HTMLElement>(root, '[data-dial-stations]');
  const dialNeedle = query<HTMLElement>(root, '[data-dial-needle]');
  const dialWindow = query<HTMLElement>(root, '[data-dial-window]');
  const prevBtn = query<HTMLButtonElement>(root, '[data-prev]');
  const nextBtn = query<HTMLButtonElement>(root, '[data-next]');
  const reduceMq = matchMedia('(prefers-reduced-motion: reduce)');
  const tape = h('div', { class: 't-tape', 'aria-hidden': 'true' });
  let layout: HorizontalLayout = { items: [], width: 0, order: [], xById: {}, stations: [] };
  let axis: TimelineState['axis'] = 'chrono';
  /** Só os itens perto da área visível existem no DOM (índice em layout.items -> nó). */
  const mounted = new Map<number, HTMLElement>();
  const itemIndexById = new Map<string, number>();
  const orderPos = new Map<string, number>();
  const hiddenIds = new Set<string>();
  /** Marcos já "recebidos" nesta renderização: a animação de recepção roda uma vez por marco. */
  const received = new Set<string>();
  let activeId: string | null = null;
  let tunedId: string | null = null;
  let stationEls: HTMLElement[] = [];
  let first = true;

  const behavior = (): ScrollBehavior => (reduceMq.matches ? 'auto' : 'smooth');
  /** Meia tela: com essa folga, o x da fita sob a cabeça de leitura é exatamente scrollLeft. */
  const pad = () => scroller.clientWidth / 2;
  const headX = () => scroller.scrollLeft;

  /* ---------- Dial ---------- */
  function renderStations() {
    stationEls = layout.stations.map((st) =>
      h('span', { class: 'dial-st', style: `left:${((st.x / Math.max(1, layout.width)) * 100).toFixed(3)}%` }, [st.label]),
    );
    dialStations.replaceChildren(...stationEls);
  }

  function updateDial() {
    const w = Math.max(1, layout.width);
    const x = Math.min(w, Math.max(0, headX()));
    const frac = x / w;
    dialNeedle.style.setProperty('--f', frac.toFixed(4));
    dialWindow.style.setProperty('--f', frac.toFixed(4));
    dialWindow.style.setProperty('--wf', Math.min(1, scroller.clientWidth / w).toFixed(4));
    let current = -1;
    layout.stations.forEach((st, i) => {
      if (st.x <= x + 1) current = i;
    });
    stationEls.forEach((el, i) => el.classList.toggle('on', i === current));
    dial.setAttribute('aria-valuenow', String(Math.round(frac * 100)));
    dial.setAttribute('aria-valuetext', layout.stations[current]?.label ?? 'Início');
    const max = scroller.scrollWidth - scroller.clientWidth;
    prevBtn.disabled = scroller.scrollLeft <= 1;
    nextBtn.disabled = scroller.scrollLeft >= max - 1;
  }

  function tuneTo(frac: number, smooth = false) {
    const left = Math.max(0, Math.min(1, frac)) * layout.width;
    scroller.scrollTo({ left, behavior: smooth ? behavior() : 'auto' });
  }

  let dialDown = false;
  const fracAt = (clientX: number) => {
    const r = dial.getBoundingClientRect();
    return (clientX - r.left) / r.width;
  };
  dial.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dialDown = true;
    dial.classList.add('tuning');
    try {
      dial.setPointerCapture(e.pointerId);
    } catch {
      /* ignorado */
    }
    tuneTo(fracAt(e.clientX), true);
  });
  dial.addEventListener('pointermove', (e) => {
    if (dialDown) tuneTo(fracAt(e.clientX));
  });
  const endDial = () => {
    dialDown = false;
    dial.classList.remove('tuning');
  };
  dial.addEventListener('pointerup', endDial);
  dial.addEventListener('pointercancel', endDial);
  dial.addEventListener('keydown', (e) => {
    const x = headX();
    let left: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') left = x + scroller.clientWidth * 0.4;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') left = x - scroller.clientWidth * 0.4;
    else if (e.key === 'PageDown') left = layout.stations.find((s) => s.x > x + 2)?.x ?? layout.width;
    else if (e.key === 'PageUp') left = [...layout.stations].reverse().find((s) => s.x < x - 2)?.x ?? 0;
    else if (e.key === 'Home') left = 0;
    else if (e.key === 'End') left = layout.width;
    if (left === null) return;
    e.preventDefault();
    scroller.scrollTo({ left, behavior: behavior() });
  });

  /* ---------- Cabeça de leitura ---------- */
  function updateTuned() {
    const x = headX();
    let best: string | null = null;
    let bestD = Infinity;
    for (const item of layout.items) {
      if (item.kind !== 'medallion' && item.kind !== 'dot') continue;
      const d = Math.abs(item.x - x);
      const limit = item.kind === 'medallion' ? TUNE_MAJOR : TUNE_MINOR;
      if (d <= limit && d < bestD) {
        bestD = d;
        best = item.view.id;
      }
    }
    if (best === tunedId) return;
    if (tunedId) track.querySelector(`[data-ev="${CSS.escape(tunedId)}"]`)?.classList.remove('tuned');
    tunedId = best;
    if (best) markTuned(best);
  }

  function markTuned(id: string) {
    const node = track.querySelector<HTMLElement>(`[data-ev="${CSS.escape(id)}"]`);
    if (!node) return;
    node.classList.add('tuned');
    if (!received.has(id) && node.classList.contains('t-ev') && !node.classList.contains('is-hidden') && !reduceMq.matches) {
      received.add(id);
      node.classList.remove('rx');
      void node.offsetWidth;
      node.classList.add('rx');
    }
  }

  /* ---------- Janela virtual ---------- */
  function decorate(node: HTMLElement, item: LayoutItem) {
    if (item.kind === 'saga' && axis === 'pub') node.querySelector('h3')?.setAttribute('aria-level', '2');
    if (item.kind !== 'medallion' && item.kind !== 'dot') return;
    const id = item.view.id;
    const btn = eventButton(node);
    if (!btn) return;
    btn.tabIndex = id === activeId ? 0 : -1;
    if (item.view.hidden) {
      btn.setAttribute('aria-label', `Sinal fora de alcance, ${(orderPos.get(id) ?? 0) + 1} de ${layout.order.length}`);
    }
    if (axis === 'pub') node.querySelector('h4')?.setAttribute('aria-level', '3');
    if (id === tunedId) node.classList.add('tuned');
  }

  /** Garante um (e só um) botão de evento na ordem de Tab, mesmo quando o ativo saiu da janela. */
  function ensureTabStop() {
    const buttons = [...mounted.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, n]) => eventButton(n))
      .filter((b): b is HTMLButtonElement => !!b);
    if (!buttons.length) return;
    if (!buttons.some((b) => b.dataset.id === activeId)) {
      const x = headX();
      const pick =
        buttons.reduce<HTMLButtonElement | null>((best, b) => {
          const d = Math.abs((layout.xById[b.dataset.id!] ?? 0) - x);
          return !best || d < Math.abs((layout.xById[best.dataset.id!] ?? 0) - x) ? b : best;
        }, null) ?? buttons[0]!;
      activeId = pick.dataset.id!;
    }
    for (const b of buttons) b.tabIndex = b.dataset.id === activeId ? 0 : -1;
  }

  function updateWindow() {
    const p = pad();
    const left = scroller.scrollLeft - p - WINDOW_MARGIN;
    const right = scroller.scrollLeft + p + WINDOW_MARGIN;
    const wanted = new Set<number>();
    layout.items.forEach((item, i) => {
      const [a, b] = extent(item);
      if (b >= left && a <= right) wanted.add(i);
    });
    for (const [i, el] of mounted) {
      if (!wanted.has(i)) {
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
      }
      next = el;
    }
    ensureTabStop();
  }

  function sizeTrack() {
    track.style.setProperty('--pad', `${pad()}px`);
    track.style.width = `${layout.width + pad() * 2}px`;
  }

  function render(state: TimelineState) {
    // Mantém o ponto sob a cabeça de leitura quando possível: o mesmo evento, ou a mesma fração.
    const keepId = tunedId ?? activeId;
    const keepFrac = layout.width ? headX() / layout.width : 0;
    layout = computeHorizontalLayout(data, state);
    axis = state.axis;
    itemIndexById.clear();
    orderPos.clear();
    hiddenIds.clear();
    received.clear();
    tunedId = null;
    layout.order.forEach((id, i) => orderPos.set(id, i));
    layout.items.forEach((item, i) => {
      if (item.kind === 'medallion' || item.kind === 'dot') {
        itemIndexById.set(item.view.id, i);
        if (item.view.hidden) hiddenIds.add(item.view.id);
      }
    });
    if (activeId && !itemIndexById.has(activeId)) activeId = null;
    for (const el of mounted.values()) el.remove();
    mounted.clear();
    sizeTrack();
    const fixed: Node[] = [tape];
    if (layout.items.length === 0) fixed.push(h('p', { class: 't-empty' }, ['Nenhuma transmissão nesses temas. Desmarque algum em “Temas”.']));
    track.replaceChildren(...fixed);
    renderStations();

    let target: number;
    if (first) {
      // Primeira visita: começa sintonizado no primeiro marco, não num trecho vazio.
      const firstMajor = layout.items.find((i) => i.kind === 'medallion');
      target = firstMajor ? firstMajor.x : 0;
      first = false;
    } else if (keepId && layout.xById[keepId] !== undefined) target = layout.xById[keepId]!;
    else target = keepFrac * layout.width;
    scroller.scrollLeft = target;

    updateWindow();
    updateTuned();
    updateDial();
    document.dispatchEvent(new CustomEvent(RENDERED_EVENT, { detail: { shown: layout.order.length, hidden: hiddenIds.size } }));
  }

  function centerOn(id: string) {
    const x = layout.xById[id];
    if (x === undefined) return;
    scroller.scrollTo({ left: x, behavior: behavior() });
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
      scroller.scrollLeft = x;
      updateWindow();
      btn = findButton(id);
    }
    if (!btn) return;
    btn.focus({ preventScroll: true });
    centerOn(id);
  }

  /* ---------- Navegação ---------- */
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
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      updateDial();
      updateWindow();
      updateTuned();
    });
  };
  scroller.addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => {
    const x = headX();
    sizeTrack();
    scroller.scrollLeft = x;
    onScroll();
  });

  /** Setas: pulam para o marco seguinte (ou anterior) em vez de uma página cega. */
  const jump = (dir: 1 | -1) => () => {
    const x = headX();
    const majors = layout.items.filter((i) => i.kind === 'medallion').map((i) => i.x);
    const target = dir > 0 ? majors.find((m) => m > x + 4) : [...majors].reverse().find((m) => m < x - 4);
    scroller.scrollTo({ left: target ?? (dir > 0 ? layout.width : 0), behavior: behavior() });
  };
  prevBtn.addEventListener('click', jump(-1));
  nextBtn.addEventListener('click', jump(1));

  track.addEventListener('click', (e) => {
    const target = (e.target as Element).closest<HTMLElement>('button[data-id]');
    if (!target) return;
    document.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { id: target.dataset.id, origin: target } }));
  });

  // Uma parada de Tab para a fita inteira; as setas percorrem os eventos.
  track.addEventListener('focusin', (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('button[data-id]');
    if (!btn || btn.dataset.id === activeId) return;
    const old = activeId ? findButton(activeId) : null;
    if (old) old.tabIndex = -1;
    activeId = btn.dataset.id!;
    btn.tabIndex = 0;
    centerOn(activeId);
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

  // Etiqueta das marcas: Esc a dispensa sem tirar o foco (WCAG 1.4.13). Volta ao sair da marca.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    track.querySelectorAll('.t-tick:hover, .t-tick:focus-visible, .t-tick.tuned').forEach((d) => d.classList.add('tip-off'));
  });
  const reenableTip = (e: Event) => (e.target as Element).closest?.('.t-tick')?.classList.remove('tip-off');
  track.addEventListener('mouseout', reenableTip);
  track.addEventListener('focusout', reenableTip);

  store.subscribe(render);
  render(store.get());

  return {
    getOrder: () => layout.order,
    getReadable: () => layout.order.filter((id) => !hiddenIds.has(id)),
    centerOn,
    focusEvent,
  };
}
