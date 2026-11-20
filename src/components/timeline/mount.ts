import type { TimelineData } from '../../lib/schema';
import type { Store } from '../../lib/store';
import type { TimelineState } from '../../lib/state';
import { computeHorizontalLayout, type HorizontalLayout, type LayoutItem } from '../../lib/layout';
import { toModalView } from '../../lib/modal';
import { HIDDEN_TITLE, type EventView } from '../../lib/spoilers';
import { h } from '../../lib/dom';
import { RENDERED_EVENT } from '../../lib/app';
import { EraMark, Gap, Marker, SagaBand, Tick, YearMark } from './nodes';

export interface TimelineApi {
  /** Eventos exibidos, na ordem da linha. */
  getOrder(): string[];
  /** Eventos exibidos e não protegidos, na ordem da linha. */
  getReadable(): string[];
  centerOn(id: string): void;
  select(id: string): void;
}

/** Folga (px) renderizada além da área visível, para a rolagem não mostrar espaço vazio. */
const WINDOW_MARGIN = 600;
/** Ao parar de rolar, escolhe o marco mais perto do centro dentro desta distância (px). */
const SETTLE_MAJOR = 220;
const SETTLE_MINOR = 40;

const CONF_LABEL: Record<EventView['conf'], string> = {
  exata: 'data exata',
  estimada: 'data estimada',
  inferida: 'data inferida',
  oculta: '',
};

function query<T extends Element>(root: ParentNode, sel: string): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`Elemento não encontrado: ${sel}`);
  return el;
}

/** Faixa horizontal (px) que o nó de um item ocupa a partir do x dele. */
function extent(item: LayoutItem): [number, number] {
  switch (item.kind) {
    case 'era':
      return [item.x - 10, item.x + 280];
    case 'saga':
      return [item.x - 10, item.x + 180];
    case 'medallion':
      return [item.x - 80, item.x + 80];
    case 'year':
      return [item.x - 40, item.x + 60];
    case 'gap':
      return [item.x, item.end];
    default:
      return [item.x - 110, item.x + 110];
  }
}

function buildNode(item: LayoutItem): HTMLElement {
  if (item.kind === 'era') return EraMark(item);
  if (item.kind === 'saga') return SagaBand(item);
  if (item.kind === 'medallion') return Marker(item);
  if (item.kind === 'year') return YearMark(item);
  if (item.kind === 'gap') return Gap(item);
  return Tick(item);
}

const eventButton = (node: HTMLElement): HTMLButtonElement | null =>
  node instanceof HTMLButtonElement ? node : node.querySelector<HTMLButtonElement>('button[data-id]');

export function mountTimeline(root: HTMLElement, data: TimelineData, store: Store<TimelineState>): TimelineApi {
  const scroller = query<HTMLElement>(root, '[data-scroll]');
  const track = query<HTMLElement>(root, '[data-track]');
  const prevBtn = query<HTMLButtonElement>(root, '[data-prev]');
  const nextBtn = query<HTMLButtonElement>(root, '[data-next]');
  const stationsBox = query<HTMLElement>(root, '[data-stations]');
  const panel = query<HTMLElement>(root, '[data-panel]');
  const pnHead = query<HTMLElement>(panel, '[data-pn-head]');
  const pnSub = query<HTMLElement>(panel, '[data-pn-sub]');
  const pnDetail = query<HTMLElement>(panel, '[data-pn-detail]');
  const pnStair = query<HTMLElement>(panel, '[data-pn-stair]');
  const pnPrev = query<HTMLButtonElement>(panel, '[data-pn-prev]');
  const pnNext = query<HTMLButtonElement>(panel, '[data-pn-next]');
  const reduceMq = matchMedia('(prefers-reduced-motion: reduce)');
  const line = h('div', { class: 't-line', 'aria-hidden': 'true' });

  let layout: HorizontalLayout = { items: [], width: 0, order: [], xById: {}, stations: [], groups: [], groupOf: {}, views: {} };
  let state = store.get();
  const mounted = new Map<number, HTMLElement>();
  const itemIndexById = new Map<string, number>();
  let readable: string[] = [];
  /** Botão da linha que está na ordem de Tab (um só). */
  let activeId: string | null = null;
  /** Evento mostrado no painel. */
  let selectedId: string | null = null;
  let shownGroup = -1;
  let stationEls: HTMLButtonElement[] = [];
  let first = true;
  /** Rolagens feitas pelo código não trocam a seleção ao parar. */
  let quietUntil = 0;

  const behavior = (): ScrollBehavior => (reduceMq.matches ? 'auto' : 'smooth');
  const pad = () => scroller.clientWidth / 2;
  /** Com meia tela de folga dos dois lados, o x da linha no centro da vista é scrollLeft. */
  const centerX = () => scroller.scrollLeft;

  /* ---------- Estações (lista "Ir para" do painel lateral) ---------- */
  function renderStations() {
    stationEls = layout.stations.map((st) => {
      const b = h('button', { type: 'button', class: 'st' }, [st.label]) as HTMLButtonElement;
      b.addEventListener('click', () => {
        const id = layout.order.find((oid) => (layout.xById[oid] ?? -1) >= st.x);
        if (id) select(id, { center: true });
        else scroller.scrollTo({ left: st.x, behavior: behavior() });
      });
      return b;
    });
    stationsBox.replaceChildren(...stationEls);
  }

  function updateStations() {
    const x = centerX();
    let current = -1;
    layout.stations.forEach((st, i) => {
      if (st.x <= x + 1) current = i;
    });
    stationEls.forEach((el, i) => {
      if (i === current) el.setAttribute('aria-current', 'true');
      else el.removeAttribute('aria-current');
    });
    const max = scroller.scrollWidth - scroller.clientWidth;
    prevBtn.disabled = scroller.scrollLeft <= 1;
    nextBtn.disabled = scroller.scrollLeft >= max - 1;
  }

  /* ---------- Janela virtual ---------- */
  function decorate(node: HTMLElement, item: LayoutItem) {
    if (item.kind === 'saga' && state.axis === 'pub') node.querySelector('h3')?.setAttribute('aria-level', '2');
    if (item.kind !== 'medallion' && item.kind !== 'dot') return;
    const id = item.view.id;
    const btn = eventButton(node);
    if (!btn) return;
    btn.tabIndex = id === activeId ? 0 : -1;
    const on = id === selectedId;
    node.classList.toggle('is-selected', on);
    btn.setAttribute('aria-pressed', String(on));
  }

  function ensureTabStop() {
    const buttons = [...mounted.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, n]) => eventButton(n))
      .filter((b): b is HTMLButtonElement => !!b);
    if (!buttons.length) return;
    if (!buttons.some((b) => b.dataset.id === activeId)) {
      const sel = buttons.find((b) => b.dataset.id === selectedId);
      const x = centerX();
      const pick =
        sel ??
        buttons.reduce<HTMLButtonElement>((best, b) => {
          const d = Math.abs((layout.xById[b.dataset.id!] ?? 0) - x);
          return d < Math.abs((layout.xById[best.dataset.id!] ?? 0) - x) ? b : best;
        }, buttons[0]!);
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

  /* ---------- Painel ---------- */
  function stairItem(v: EventView, i: number): HTMLElement {
    const on = v.id === selectedId;
    const meta = v.hidden ? 'Protegido contra spoilers' : [v.when, v.chapter, v.episode].filter(Boolean).join(' · ');
    const btn = h(
      'button',
      {
        type: 'button',
        class: `step imp${v.imp}${v.hidden ? ' is-hidden' : ''}`,
        'data-id': v.id,
        'aria-pressed': String(on),
        style: `--i:${i}`,
      },
      [h('span', { class: 'step-dot', 'aria-hidden': 'true' }), h('b', {}, [v.title]), h('small', { class: 'num' }, [meta])],
    );
    return h('li', {}, [btn]);
  }

  function renderDetail(id: string) {
    const v = toModalView(data, state, id);
    if (!v) return;
    const meta = [v.when, v.chapter, v.episode].filter(Boolean);
    const children: (Node | null)[] = [
      h('h3', { class: 'pn-title' }, [v.title]),
      meta.length
        ? h('p', { class: 'pn-meta num' }, [
            h('span', { class: `conf conf-${v.conf}`, 'aria-hidden': 'true' }),
            h('span', {}, [meta.join(' · ')]),
            v.conf !== 'oculta' ? h('span', { class: 'pn-conf' }, [CONF_LABEL[v.conf]]) : null,
          ])
        : null,
      h('p', { class: 'pn-sum' }, [v.sum]),
      v.more ? h('p', { class: 'pn-more' }, [v.more]) : null,
      v.tags.length ? h('ul', { class: 'pn-tags', 'aria-label': 'Temas' }, v.tags.map((t) => h('li', {}, [t]))) : null,
    ];
    if (v.facts.length) {
      children.push(
        h('section', { class: 'pn-facts', 'aria-label': 'Detalhes' }, [
          h('h4', {}, ['Detalhes']),
          h('dl', {}, v.facts.map((f) => h('div', {}, [h('dt', {}, [f.label]), h('dd', {}, [f.value])]))),
        ]),
      );
    }
    pnDetail.replaceChildren(h('article', { class: `pn-card${v.hidden ? ' is-hidden' : ''}` }, children));
    pnDetail.scrollTop = 0;
  }

  const countLabel = (n: number) => `${n} ${n === 1 ? 'acontecimento' : 'acontecimentos'}`;

  function renderPanel(animate: boolean) {
    panel.classList.toggle('is-empty', !selectedId);
    if (!selectedId) {
      shownGroup = -1;
      pnHead.textContent = state.zoom === 1 ? 'Só eras e sagas' : 'Nada por aqui';
      pnSub.textContent = '';
      pnStair.replaceChildren();
      pnDetail.replaceChildren(
        h('p', { class: 'pn-empty' }, [
          state.zoom === 1
            ? 'Para ver os acontecimentos, escolha Marcos, Eventos ou Tudo em “Mais filtros”.'
            : 'Nenhum acontecimento com esse foco. Desmarque algum tema em “Foco”.',
        ]),
      );
      pnPrev.disabled = pnNext.disabled = true;
      return;
    }
    const gi = layout.groupOf[selectedId] ?? -1;
    const group = layout.groups[gi];
    if (group && gi !== shownGroup) {
      shownGroup = gi;
      pnHead.textContent = group.allHidden ? HIDDEN_TITLE : [group.label, ...group.eras].join(' · ');
      const n = countLabel(group.ids.length);
      pnSub.textContent = group.allHidden ? n : [...group.sagas, n].join(' · ');
      pnStair.replaceChildren(...group.ids.map((id, i) => stairItem(layout.views[id]!, i)));
      pnStair.classList.remove('in');
      if (animate && !reduceMq.matches) {
        void pnStair.offsetWidth;
        pnStair.classList.add('in');
      }
    } else {
      pnStair
        .querySelectorAll<HTMLElement>('button[data-id]')
        .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === selectedId)));
    }
    renderDetail(selectedId);
    if (animate && !reduceMq.matches) {
      pnDetail.classList.remove('swap');
      void pnDetail.offsetWidth;
      pnDetail.classList.add('swap');
    }
    pnPrev.disabled = yearStep(-1) === null;
    pnNext.disabled = yearStep(1) === null;
  }

  /** Ano anterior ou seguinte que tenha algo legível (anos todo protegidos ficam de fora). */
  function yearStep(dir: 1 | -1): number | null {
    if (!selectedId) return null;
    const at = layout.groupOf[selectedId] ?? -1;
    for (let g = at + dir; g >= 0 && g < layout.groups.length; g += dir) if (!layout.groups[g]!.allHidden) return g;
    return null;
  }

  function selectYear(g: number) {
    const group = layout.groups[g];
    if (!group) return;
    const id = group.ids.find((i) => !layout.views[i]?.hidden && layout.xById[i] !== undefined) ?? group.ids.find((i) => !layout.views[i]?.hidden) ?? group.ids[0];
    if (id) select(id, { center: true });
  }

  function markSelectedOnLine() {
    for (const [i, node] of mounted) {
      const item = layout.items[i]!;
      if (item.kind !== 'medallion' && item.kind !== 'dot') continue;
      const on = item.view.id === selectedId;
      node.classList.toggle('is-selected', on);
      eventButton(node)?.setAttribute('aria-pressed', String(on));
    }
  }

  function select(id: string, opts: { center?: boolean } = {}) {
    if (layout.groupOf[id] === undefined) return;
    if (id !== selectedId) {
      selectedId = id;
      markSelectedOnLine();
      renderPanel(true);
    }
    if (opts.center) centerOn(id);
  }

  /** Evento mais perto de x: prefere marcos; cai para uma marca só se ela estiver bem perto. */
  function nearest(x: number, majorLimit = SETTLE_MAJOR): string | null {
    let best: string | null = null;
    let bestD = Infinity;
    let minor: string | null = null;
    let minorD = Infinity;
    for (const item of layout.items) {
      if (item.kind !== 'medallion' && item.kind !== 'dot') continue;
      const d = Math.abs(item.x - x);
      if (item.kind === 'medallion' && d < bestD) {
        bestD = d;
        best = item.view.id;
      } else if (item.kind === 'dot' && d < minorD) {
        minorD = d;
        minor = item.view.id;
      }
    }
    if (best && bestD <= majorLimit) return best;
    if (minor && minorD <= SETTLE_MINOR) return minor;
    return majorLimit === Infinity ? (best ?? minor) : null;
  }

  /* ---------- Renderização ---------- */
  function render(next: TimelineState) {
    state = next;
    const keepId = selectedId;
    const keepFrac = layout.width ? centerX() / layout.width : 0;
    layout = computeHorizontalLayout(data, state);
    itemIndexById.clear();
    layout.items.forEach((item, i) => {
      if (item.kind === 'medallion' || item.kind === 'dot') itemIndexById.set(item.view.id, i);
    });
    readable = layout.order.filter((id) => !layout.views[id]?.hidden);
    if (activeId && !itemIndexById.has(activeId)) activeId = null;
    for (const el of mounted.values()) el.remove();
    mounted.clear();
    sizeTrack();
    track.replaceChildren(line);
    renderStations();

    let target: number;
    if (first) {
      first = false;
      selectedId = nearest(0, Infinity);
      // Começa no primeiro marco, não num trecho vazio.
      const firstMajor = layout.items.find((i) => i.kind === 'medallion');
      if (firstMajor && firstMajor.kind === 'medallion') selectedId = firstMajor.view.id;
      target = selectedId ? layout.xById[selectedId]! : 0;
    } else if (keepId && layout.groupOf[keepId] !== undefined) {
      selectedId = keepId;
      target = layout.xById[keepId] ?? layout.groups[layout.groupOf[keepId]!]!.x;
    } else {
      target = keepFrac * layout.width;
      selectedId = nearest(target, Infinity);
    }
    quietUntil = performance.now() + 400;
    scroller.scrollLeft = target;
    shownGroup = -1;
    updateWindow();
    updateStations();
    renderPanel(false);
    document.dispatchEvent(
      new CustomEvent(RENDERED_EVENT, { detail: { shown: layout.order.length, hidden: layout.order.length - readable.length } }),
    );
  }

  function centerOn(id: string) {
    // Eventos que o zoom tirou da linha levam ao ano deles.
    const x = layout.xById[id] ?? layout.groups[layout.groupOf[id] ?? -1]?.x;
    if (x === undefined) return;
    quietUntil = performance.now() + 900;
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
      quietUntil = performance.now() + 400;
      scroller.scrollLeft = x;
      updateWindow();
      btn = findButton(id);
    }
    btn?.focus({ preventScroll: true });
  }

  /* ---------- Navegação na linha ---------- */
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
    if (moved) {
      setTimeout(() => (moved = false), 0);
      onScroll();
    }
  };
  scroller.addEventListener('pointerup', endDrag);
  scroller.addEventListener('pointercancel', endDrag);
  scroller.addEventListener('lostpointercapture', endDrag);
  addEventListener('blur', endDrag);
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
  let settle: ReturnType<typeof setTimeout> | undefined;
  function onScroll() {
    if (!frame) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        updateWindow();
        updateStations();
      });
    }
    clearTimeout(settle);
    settle = setTimeout(() => {
      // Parou de rolar por conta própria: o painel acompanha o marco que ficou no centro.
      if (performance.now() < quietUntil || down) return;
      const id = nearest(centerX());
      if (!id || !selectedId) return;
      if (layout.groupOf[id] !== layout.groupOf[selectedId]) select(id);
    }, 180);
  }
  scroller.addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => {
    const x = centerX();
    sizeTrack();
    quietUntil = performance.now() + 400;
    scroller.scrollLeft = x;
    onScroll();
  });

  /** Setas laterais: pulam para o ano seguinte (ou anterior) com acontecimentos. */
  const jump = (dir: 1 | -1) => () => {
    const x = centerX();
    const years = layout.groups.map((g, i) => ({ x: g.x, i })).sort((a, b) => a.x - b.x);
    const target = dir > 0 ? years.find((y) => y.x > x + 4) : [...years].reverse().find((y) => y.x < x - 4);
    if (target) selectYear(target.i);
    else scroller.scrollTo({ left: dir > 0 ? layout.width : 0, behavior: behavior() });
  };
  prevBtn.addEventListener('click', jump(-1));
  nextBtn.addEventListener('click', jump(1));

  track.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLElement>('button[data-id]');
    if (btn) select(btn.dataset.id!, { center: true });
  });

  // Uma parada de Tab para a linha inteira; as setas percorrem os eventos e o painel acompanha.
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
    if (n !== i) {
      focusEvent(order[n]!);
      select(order[n]!, { center: true });
    }
  });

  // Etiqueta das marcas: Esc a dispensa sem tirar o foco (WCAG 1.4.13).
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    track.querySelectorAll('.t-tick:hover, .t-tick:focus-visible').forEach((d) => d.classList.add('tip-off'));
  });
  const reenableTip = (e: Event) => (e.target as Element).closest?.('.t-tick')?.classList.remove('tip-off');
  track.addEventListener('mouseout', reenableTip);
  track.addEventListener('focusout', reenableTip);

  /* ---------- Painel: lista do ano e Ano anterior/Próximo ano ---------- */
  pnStair.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLElement>('button[data-id]');
    if (btn) select(btn.dataset.id!, { center: true });
  });
  const step = (dir: 1 | -1) => {
    const g = yearStep(dir);
    if (g !== null) selectYear(g);
  };
  pnPrev.addEventListener('click', () => step(-1));
  pnNext.addEventListener('click', () => step(1));

  store.subscribe(render);
  render(store.get());

  return {
    getOrder: () => layout.order,
    getReadable: () => readable,
    centerOn,
    select: (id) => select(id, { center: true }),
  };
}
