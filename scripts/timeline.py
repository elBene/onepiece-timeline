"""Parser da página "World Timeline" do One Piece Wiki (wikitext).

A página é escrita com dois templates:
- {{Timeline|38|events=...}}: um bloco por ano; o número é "anos antes do presente"
  pós-timeskip (C.M. 1541). "~800" = aproximado. TOP/BOTTOM só abrem e fecham a tabela.
- {{Qref|chap=1096|page=10|ep=1130|nota}}: citação estruturada. Com name=x, a mesma
  citação é reutilizada em outros pontos só como {{Qref|name=x}}.

Regra do projeto (CC BY-SA): daqui só saem FATOS (números, nomes de páginas
linkadas, títulos de seção). A prosa dos parágrafos e as notas livres das
citações nunca são copiadas para os rascunhos.
"""
from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass, field

# ---------------------------------------------------------------- wikitext básico


@dataclass
class Template:
    name: str
    params: list[str]  # parâmetros brutos, na ordem (sem o nome)
    start: int
    end: int

    def named(self) -> dict[str, str]:
        out = {}
        for p in self.params:
            k, sep, v = p.partition("=")
            if sep and re.fullmatch(r"\s*[\w ]+\s*", k):
                out[k.strip()] = v.strip()
        return out


def _split_top(inner: str, sep: str = "|") -> list[str]:
    """Divide pelo separador só no nível de cima (fora de {{ }} e [[ ]])."""
    parts, depth, buf, i = [], 0, [], 0
    while i < len(inner):
        two = inner[i : i + 2]
        if two in ("{{", "[["):
            depth += 1
            buf.append(two)
            i += 2
            continue
        if two in ("}}", "]]") and depth:
            depth -= 1
            buf.append(two)
            i += 2
            continue
        if inner[i] == sep and depth == 0:
            parts.append("".join(buf))
            buf = []
        else:
            buf.append(inner[i])
        i += 1
    parts.append("".join(buf))
    return parts


def find_templates(text: str, name_re: str) -> list[Template]:
    """Templates de nível de cima cujo nome casa com name_re (sem diferenciar maiúsculas)."""
    out, i, n = [], 0, len(text)
    pat = re.compile(name_re, re.I)
    while i < n:
        s = text.find("{{", i)
        if s < 0:
            break
        depth, j = 0, s
        while j < n:
            if text.startswith("{{", j):
                depth += 1
                j += 2
            elif text.startswith("}}", j):
                depth -= 1
                j += 2
                if depth == 0:
                    break
            else:
                j += 1
        if depth != 0:  # template sem fechamento: para aqui
            break
        parts = _split_top(text[s + 2 : j - 2])
        name = parts[0].strip()
        if pat.fullmatch(name):
            out.append(Template(name, parts[1:], s, j))
            i = j
        else:
            i = s + 2  # entra no template para achar os aninhados
    return out


LINK_RE = re.compile(r"\[\[([^\[\]|#]+)(?:#[^\[\]|]*)?(?:\|[^\[\]]*)?\]\]")
SKIP_LINK = re.compile(r"^(File|Image|Category|w|wikipedia|:Category):", re.I)


def links(text: str) -> list[str]:
    """Títulos de páginas linkadas, sem repetição, na ordem em que aparecem."""
    seen: list[str] = []
    for m in LINK_RE.finditer(text):
        t = m.group(1).strip()
        if t and not SKIP_LINK.match(t) and t not in seen:
            seen.append(t)
    return seen


# ---------------------------------------------------------------- citações

QREF_RE = r"qref(/ext)?"


def collect_named_refs(wikitext: str) -> dict[str, dict[str, str]]:
    """name -> parâmetros da definição (a ocorrência com mais campos além de name)."""
    out: dict[str, dict[str, str]] = {}
    for q in find_templates(wikitext, QREF_RE):  # find_templates desce em templates aninhados
        p = q.named()
        name = p.get("name")
        if name and len(p) > 1 and len(p) > len(out.get(name, {})):
            out[name] = p
    return out


def _int(v: str | None) -> int | None:
    if not v:
        return None
    m = re.match(r"\s*(\d+)", v)
    return int(m.group(1)) if m else None


DATABOOKS = {"yellow": "Yellow Databook", "red": "Red Databook", "blue": "Blue Databook", "green": "Green Databook", "blue deep": "Blue Deep"}


def citation_to_sources(p: dict[str, str]) -> list[dict]:
    """Converte os campos de uma Qref em fontes do schema do site (sem a nota livre)."""
    src: list[dict] = []

    def add(type_: str, ref: str, page: str | None = None) -> None:
        item = {"type": type_, "ref": ref}
        if page:
            item["page"] = page
        if item not in src:
            src.append(item)

    page = p.get("page") or None
    vol = p.get("vol") or p.get("volume")
    for key in ("chap", "chap2"):
        if _int(p.get(key)):
            add("manga", f"cap. {_int(p[key])}" + (f" (vol. {vol})" if vol else ""), page if key == "chap" else None)
    if _int(p.get("cover")) or _int(p.get("cover2")):
        for key in ("cover", "cover2"):
            if _int(p.get(key)):
                add("cover_story", f"capa do cap. {_int(p[key])}")
    if _int(p.get("sbs")):
        add("sbs", f"SBS vol. {_int(p['sbs'])}", page)
    data = (p.get("data") or "").lower()
    if data.startswith("vivre"):
        card = p.get("card") or p.get("excard")
        add("vivre_card", f"carta {card}" if card else "Vivre Card", page)
    elif data:
        add("databook", DATABOOKS.get(data, f"databook {data}"), page)
    if _int(p.get("magazine")):
        add("magazine", f"ONE PIECE Magazine vol. {_int(p['magazine'])}", page)
    if p.get("novel"):
        add("novel", f"novel {p['novel']}" + (f", cap. {p['nchap']}" if p.get("nchap") else ""))
    for key in ("ep", "ep1", "ep2"):
        if _int(p.get(key)):
            add("anime", f"ep. {_int(p[key])}")
    return src


# Campos conhecidos que viram fonte; o resto fica só em hint.citations.
CITATION_KEYS = {"name", "chap", "chap2", "page", "vol", "volume", "ep", "ep1", "ep2", "sbs", "data", "card",
                 "excard", "magazine", "cover", "cover2", "novel", "nchap", "other", "game", "chin"}


def citation_facts(p: dict[str, str]) -> dict[str, str]:
    """Só os campos factuais (números e códigos) de uma citação, para o revisor conferir."""
    return {k: v for k, v in p.items() if k in CITATION_KEYS and v}


# ---------------------------------------------------------------- blocos de ano


@dataclass
class YearBlock:
    label: str  # como está no wiki: "38", "~800"
    ago: int
    approx: bool
    section: str
    events: str  # wikitext bruto (não sai daqui)


def parse_year(label: str) -> tuple[int, bool] | None:
    m = re.fullmatch(r"\s*(~)?\s*(\d+)\s*", label)
    return (int(m.group(2)), bool(m.group(1))) if m else None


def year_blocks(wikitext: str) -> list[YearBlock]:
    heads = [(m.start(), m.group(1).strip()) for m in re.finditer(r"^===\s*(.+?)\s*===\s*$", wikitext, re.M)]
    out = []
    for t in find_templates(wikitext, r"timeline"):
        if not t.params:
            continue
        y = parse_year(t.params[0])
        if y is None:  # TOP, BOTTOM
            continue
        events = t.named().get("events", "")
        # named() corta espaços; pega o valor bruto para preservar quebras de parágrafo
        for p in t.params[1:]:
            k, _, v = p.partition("=")
            if k.strip() == "events":
                events = v
        section = next((h for pos, h in reversed(heads) if pos < t.start), "")
        out.append(YearBlock(t.params[0].strip(), y[0], y[1], section, events))
    return out


# ---------------------------------------------------------------- rascunhos


@dataclass
class Item:
    """Um acontecimento dentro de um bloco de ano (parágrafo ou pessoa numa lista)."""

    kind: str | None  # "nascimento"/"morte" quando a lista do wiki diz; senão None
    kind_guess: str | None
    links: list[str]
    citations: list[dict[str, str]] = field(default_factory=list)


KIND_GUESS = [  # ordem = prioridade; é só uma pista para o revisor
    ("nascimento", r"\bborn\b"),
    ("morte", r"\b(dies|died|killed|death of|executed|passes away|perish)"),
    ("guerra", r"\bwar\b"),
    ("batalha", r"\b(battle|defeat|fight|clash|incident)"),
    ("fundacao", r"\b(founded|founds|established|formed|built)\b"),
    ("governo", r"\b(king|queen|crowned|throne|reverie|world government)\b"),
    ("recompensa", r"\bbounty\b"),
    ("fruta", r"\b(eats|ate) the\b"),
    ("descoberta", r"\b(discover|finds)\b"),
    ("viagem", r"\b(sets sail|set sail|departs|journey|arrive)"),
]


def guess_kind(text: str) -> str | None:
    plain = LINK_RE.sub(lambda m: m.group(0).split("|")[-1].strip("[]"), text).lower()
    for kind, pat in KIND_GUESS:
        if re.search(pat, plain):
            return kind
    return None


LIST_RE = re.compile(r"^\s*'*\s*(Births|Deaths)\s*'*\s*:", re.I)


def _resolve(q: Template, named: dict[str, dict[str, str]]) -> dict[str, str]:
    p = q.named()
    if "name" in p and len(p) == 1:
        return named.get(p["name"], p)
    return p


def items_of(block: YearBlock, named: dict[str, dict[str, str]]) -> list[Item]:
    out: list[Item] = []
    for para in re.split(r"\n\s*\n", block.events):
        para = para.strip()
        if not para or re.match(r"^'*Note", para):
            continue
        qrefs = find_templates(para, QREF_RE)
        m = LIST_RE.match(para)
        if m:
            # "Births: [[A]], [[B]],{{Qref}} [[C]]{{Qref}}": a citação vale para os links desde a anterior.
            kind = "nascimento" if m.group(1).lower() == "births" else "morte"
            pos, pending = m.end(), []
            tokens = sorted([(l.start(), "link", l) for l in LINK_RE.finditer(para, m.end())] + [(q.start, "qref", q) for q in qrefs], key=lambda x: x[0])
            for _, typ, obj in tokens:
                if typ == "link":
                    t = obj.group(1).strip()
                    if not SKIP_LINK.match(t):
                        it = Item(kind, kind, [t])
                        out.append(it)
                        pending.append(it)
                else:
                    c = _resolve(obj, named)
                    for it in pending:
                        it.citations.append(c)
                    pending = []
            continue
        out.append(Item(None, guess_kind(para), links(para), [_resolve(q, named) for q in qrefs]))
    return out


def precision_for(ago: int, approx: bool) -> str:
    if not approx:
        return "ano"
    if ago >= 1000:
        return "milenio"
    if ago % 100 == 0:
        return "seculo"
    return "decada"


def stable_id(prefix: str, ago: int, item: Item) -> str:
    chaps = sorted({c.get("chap", "") for c in item.citations})
    key = f"{ago}|{item.kind}|{'|'.join(item.links[:3])}|{'|'.join(chaps)}"
    return f"{prefix}_{ago}_{hashlib.sha1(key.encode()).hexdigest()[:8]}"


def build_drafts(wikitext: str, *, prefix: str, canon: str | None, page_src: dict) -> list[dict]:
    named = collect_named_refs(wikitext)
    drafts: list[dict] = []
    for block in year_blocks(wikitext):
        for seq, item in enumerate(items_of(block, named)):
            src: list[dict] = []
            for c in item.citations:
                for s in citation_to_sources(c):
                    if s not in src:
                        src.append(s)
            chaps = [_int(c.get("chap")) for c in item.citations if _int(c.get("chap"))]
            eps = [_int(c.get(k)) for c in item.citations for k in ("ep", "ep1", "ep2") if _int(c.get(k))]
            anchor = block.section.replace(" ", "_")
            drafts.append(
                {
                    "id": stable_id(prefix, block.ago, item),
                    "saga": None,
                    "imp": 2,
                    "kind": item.kind,
                    "canon": canon,
                    "date": {
                        "ago": block.ago,
                        "precision": precision_for(block.ago, block.approx),
                        "conf": "estimada" if block.approx else "exata",
                        "seq": seq,
                    },
                    "revealed": {"ch": min(chaps) if chaps else None, "approx": True, "ep": min(eps) if eps else None},
                    "tags": [],
                    "title": "",
                    "sum": "",
                    "more": "",
                    "src": [{**page_src, "url": f"{page_src['url']}#{anchor}"} if anchor else page_src, *src],
                    "hint": {
                        "year_label": block.label,
                        "section": block.section,
                        "links": item.links,
                        "kind_guess": item.kind_guess,
                        "citations": [citation_facts(c) for c in item.citations],
                    },
                    "verified": False,
                }
            )
    return drafts
