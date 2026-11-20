type Attrs = Record<string, string | undefined>;

/** Cria um elemento. Textos entram sempre via textContent (nunca innerHTML). */
export function h(
  tag: string,
  attrs: Attrs = {},
  children: (Node | string | null | undefined)[] = [],
): HTMLElement {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined) node.setAttribute(k, v);
  for (const c of children) if (c != null) node.append(c);
  return node;
}

/** Cria um SVG a partir de marcação ESTÁTICA do próprio código (nunca de dados). */
export function svg(markup: string): SVGElement {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstElementChild as SVGElement;
}
