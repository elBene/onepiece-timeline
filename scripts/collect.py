"""Gera RASCUNHOS de eventos a partir do One Piece Wiki.

Uso:
    python scripts/collect.py                 # todas as sagas de sources.json
    python scripts/collect.py --saga s_east   # só uma saga
    python scripts/collect.py --refresh       # ignora o cache

Saída: scripts/drafts/<saga>.json. Os rascunhos trazem apenas fatos e links
(capítulos, episódios, títulos de seção como pista). `title`, `sum` e `more`
ficam VAZIOS de propósito: o texto é escrito à mão, com palavras próprias, e só
depois o evento recebe `verified: true`.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

from fandom import fetch_page, page_url
from parsing import infobox_range, summary_headings

ROOT = Path(__file__).resolve().parent
DRAFTS = ROOT / "drafts"
SAGAS_JSON = ROOT.parent / "src" / "data" / "sagas.json"


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def build_page_drafts(saga_id: str, title: str, refresh: bool) -> tuple[dict, list[dict]]:
    page = fetch_page(title, use_cache=not refresh)
    chapters = infobox_range(page["html"], "chapter")
    episodes = infobox_range(page["html"], "episode")
    headings = summary_headings(page["sections"]) or [None]
    source = {
        "type": "wiki",
        "ref": page["title"],
        "url": page_url(page["title"]),
        "rev": page["revid"],
    }
    base = f"draft_{saga_id}_{slug(page['title'])}"
    drafts = []
    for i, heading in enumerate(headings, start=1):
        drafts.append(
            {
                "id": f"{base}_{i}",
                "saga": saga_id,
                "imp": 2,
                "kind": None,
                "canon": "manga",
                # ago = anos antes do presente pós-timeskip (C.M. 1541); os anos dos calendários são derivados no site
                "date": {"ago": None, "precision": "ano", "conf": "estimada", "seq": 0},
                "revealed": {
                    "ch": chapters["start"] if chapters else None,
                    "approx": True,
                    "ep": episodes["start"] if episodes else None,
                },
                "tags": [],
                "title": "",
                "sum": "",
                "more": "",
                "src": [source],
                "hint": {
                    "heading": heading,
                    "chapters": chapters,
                    "episodes": episodes,
                },
                "verified": False,
            }
        )
    meta = {"page": page["title"], "revision": page["revid"], "chapters": chapters, "episodes": episodes, "stubs": len(drafts)}
    return meta, drafts


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")  # console do Windows
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--saga", action="append", help="id da saga (pode repetir)")
    ap.add_argument("--refresh", action="store_true", help="ignora o cache local")
    args = ap.parse_args()

    sources = {k: v for k, v in json.loads((ROOT / "sources.json").read_text(encoding="utf-8")).items() if not k.startswith("_")}
    known = {s["id"] for s in json.loads(SAGAS_JSON.read_text(encoding="utf-8"))}
    wanted = args.saga or list(sources)

    for saga_id in wanted:
        if saga_id not in sources:
            print(f"Saga sem fontes em sources.json: {saga_id}", file=sys.stderr)
            return 1
        if saga_id not in known:
            print(f"Saga inexistente em sagas.json: {saga_id}", file=sys.stderr)
            return 1

    DRAFTS.mkdir(exist_ok=True)
    for saga_id in wanted:
        pages, drafts = [], []
        for title in sources[saga_id]:
            meta, d = build_page_drafts(saga_id, title, args.refresh)
            pages.append(meta)
            drafts.extend(d)
            ch = meta["chapters"]
            print(f"  {meta['page']}: caps {ch['start']}-{ch['end']}" if ch else f"  {meta['page']}: sem capítulos no infobox", f"({meta['stubs']} rascunhos)")
        out = {
            "saga": saga_id,
            "license_note": "Fatos e links extraídos do One Piece Wiki (Fandom, CC BY-SA). Nenhum texto copiado.",
            "pages": pages,
            "events": drafts,
        }
        path = DRAFTS / f"{saga_id}.json"
        path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{saga_id}: {len(drafts)} rascunhos -> {path.relative_to(ROOT.parent)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
