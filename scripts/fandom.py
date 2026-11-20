"""Cliente mínimo da API MediaWiki do One Piece Wiki (Fandom).

Só biblioteca padrão. Respostas ficam em scripts/.cache (fora do Git) para não
repetir requisições. O texto do wiki é CC BY-SA: este projeto o usa só como pista
(números de capítulo/episódio, títulos de seções, links), nunca copia prosa.
"""
from __future__ import annotations

import hashlib
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://onepiece.fandom.com/api.php"
WIKI_URL = "https://onepiece.fandom.com/wiki/"
USER_AGENT = "onepiece-timeline-fanproject/0.1 (projeto de fã sem fins comerciais; script de coleta)"
CACHE_DIR = Path(__file__).parent / ".cache"
MIN_INTERVAL = 1.0  # segundos entre requisições reais

_last_request = 0.0


def _cache_path(params: dict) -> Path:
    key = hashlib.sha256(json.dumps(params, sort_keys=True).encode()).hexdigest()[:24]
    return CACHE_DIR / f"{key}.json"


def api_get(params: dict, use_cache: bool = True) -> dict:
    global _last_request
    params = {"format": "json", "formatversion": "2", **params}
    path = _cache_path(params)
    if use_cache and path.exists():
        return json.loads(path.read_text(encoding="utf-8"))

    wait = MIN_INTERVAL - (time.monotonic() - _last_request)
    if wait > 0:
        time.sleep(wait)
    url = f"{API}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    _last_request = time.monotonic()

    if "error" in data:
        raise RuntimeError(f"Erro da API para {params.get('page')}: {data['error']}")
    CACHE_DIR.mkdir(exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    return data


def fetch_page(title: str, use_cache: bool = True) -> dict:
    """Retorna {title, revid, html, sections} de uma página (segue redirecionamentos)."""
    data = api_get(
        {
            "action": "parse",
            "page": title,
            "prop": "text|sections|revid",
            "redirects": "1",
            "disablelimitreport": "1",
        },
        use_cache=use_cache,
    )["parse"]
    return {
        "title": data["title"],
        "revid": data["revid"],
        "html": data["text"],
        "sections": data["sections"],
    }


def fetch_wikitext(title: str, use_cache: bool = True) -> dict:
    """Retorna {title, revid, wikitext} de uma página (segue redirecionamentos)."""
    data = api_get(
        {"action": "parse", "page": title, "prop": "wikitext|revid", "redirects": "1"},
        use_cache=use_cache,
    )["parse"]
    return {"title": data["title"], "revid": data["revid"], "wikitext": data["wikitext"]}


def page_url(title: str) -> str:
    return WIKI_URL + urllib.parse.quote(title.replace(" ", "_"), safe="_:()!',-")
