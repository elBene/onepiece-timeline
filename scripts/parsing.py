"""Funções puras para extrair FATOS (números e títulos de seção) das páginas do wiki."""
from __future__ import annotations

import re

_TAG = re.compile(r"<[^>]+>")
_RANGE = re.compile(r"(\d[\d,]*)(?:\s*[-–]\s*(\d[\d,]*))?")


def _text(html: str) -> str:
    return re.sub(r"\s+", " ", _TAG.sub(" ", html)).strip()


def _num(s: str) -> int:
    return int(s.replace(",", ""))


def infobox_range(html: str, source: str) -> dict | None:
    """Lê o intervalo de um campo do infobox ('chapter' ou 'episode'). Ex.: '1-7, 7 chapters' -> {start:1,end:7}."""
    m = re.search(rf'data-source="{source}"[^>]*>(.*?)</div>\s*</div>', html, re.S)
    if not m:
        return None
    text = _text(m.group(1))
    label = re.search(r"(?:Chapters?|Episodes?):\s*(.*)", text)
    body = label.group(1) if label else text
    r = _RANGE.search(body)
    if not r:
        return None
    start = _num(r.group(1))
    end = _num(r.group(2)) if r.group(2) else start
    return {"start": start, "end": end}


def summary_headings(sections: list[dict]) -> list[str]:
    """Títulos das subseções de 'Summary' (nomes de capítulos/episódios, usados só como pista)."""
    out: list[str] = []
    in_summary = False
    for s in sections:
        if s.get("toclevel") == 1:
            in_summary = s.get("line") == "Summary"
            continue
        if in_summary and s.get("toclevel") == 2:
            line = _text(s["line"])
            if line:
                out.append(line)
    return out
