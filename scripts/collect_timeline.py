"""Gera RASCUNHOS a partir da cronologia do One Piece Wiki ("World Timeline").

Uso:
    python collect_timeline.py              # aba Canon e aba Non-Canon
    python collect_timeline.py --refresh    # ignora o cache

Saída:
    drafts/world_timeline.json            (canon)
    drafts/world_timeline_noncanon.json   (filmes, jogos, especiais: canon = null, decidir à mão)

Cada parágrafo de um ano vira um rascunho, e listas "Births:"/"Deaths:" viram um
rascunho por pessoa. Os rascunhos trazem só fatos: anos antes do presente
(`date.ago`), capítulos, episódios, SBS, Vivre Cards, nomes das páginas linkadas.
`title`, `sum`, `more` e `saga` ficam vazios: são escritos à mão antes de `verified: true`.
"""
from __future__ import annotations

import argparse
import collections
import json
import sys
from pathlib import Path

from fandom import fetch_wikitext, page_url
from timeline import build_drafts

ROOT = Path(__file__).resolve().parent
DRAFTS = ROOT / "drafts"

PAGES = [
    # (página do wiki, prefixo do id, canon padrão, arquivo de saída)
    ("World Timeline", "wt", "manga", "world_timeline.json"),
    ("World Timeline/Non-Canon", "wtnc", None, "world_timeline_noncanon.json"),
]


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")  # console do Windows
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--refresh", action="store_true", help="ignora o cache local")
    args = ap.parse_args()

    DRAFTS.mkdir(exist_ok=True)
    for title, prefix, canon, filename in PAGES:
        page = fetch_wikitext(title, use_cache=not args.refresh)
        page_src = {"type": "wiki", "ref": page["title"], "url": page_url(page["title"]), "rev": page["revid"]}
        drafts = build_drafts(page["wikitext"], prefix=prefix, canon=canon, page_src=page_src)

        ids = collections.Counter(d["id"] for d in drafts)
        dup = [i for i, n in ids.items() if n > 1]
        for d in drafts:  # ids repetidos (mesmo ano, mesmos links e capítulos): sufixo pela ordem
            if d["id"] in dup:
                d["id"] = f"{d['id']}_{d['date']['seq']}"

        kinds = collections.Counter(d["kind"] or d["hint"]["kind_guess"] or "?" for d in drafts)
        out = {
            "page": page["title"],
            "revision": page["revid"],
            "url": page_url(page["title"]),
            "license_note": "Fatos e links extraídos do One Piece Wiki (Fandom, CC BY-SA). Nenhum texto copiado.",
            "reference": "date.ago = anos antes do presente pós-timeskip (Círculo Marítimo 1541 / Era do Céu 4131, SBS vol. 113).",
            "stats": {
                "events": len(drafts),
                "with_chapter": sum(1 for d in drafts if d["revealed"]["ch"]),
                "with_episode": sum(1 for d in drafts if d["revealed"]["ep"]),
                "without_source": sum(1 for d in drafts if len(d["src"]) == 1),
                "kinds": dict(kinds.most_common()),
            },
            "events": drafts,
        }
        path = DRAFTS / filename
        path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        s = out["stats"]
        print(f"{page['title']} (rev {page['revid']}): {s['events']} rascunhos, {s['with_chapter']} com capítulo, "
              f"{s['with_episode']} com episódio, {s['without_source']} sem citação -> {path.relative_to(ROOT.parent)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
