import json
import unittest

from timeline import (
    build_drafts,
    citation_to_sources,
    collect_named_refs,
    find_templates,
    links,
    parse_year,
    precision_for,
    year_blocks,
)

# Wikitext sintético no formato da página "World Timeline" (não é texto do wiki).
WIKI = """
==Calendars==
Texto.{{Qref|name=sbs113|sbs=113|page=49}}

===Void Century===
{{Timeline|TOP}}
{{Timeline|~900|events=
Algo começa com [[Joy Boy]].{{Qref|chap=392|page=4|ep=275|Nota livre que NAO pode vazar.}}
}}
{{Timeline|BOTTOM}}

===Great Pirate Era-Before Luffy's Journey===
{{Timeline|TOP}}
{{Timeline|19|events=
Frase secreta sobre [[Boa Hancock|Hancock]] e [[File:X.png]].{{Qref|chap=521|page=14}}

Births: [[Usopp]], [[Monkey D. Luffy]],{{Qref|name=sbs4|sbs=4|page=28}} [[Kaya]],{{Qref|data=vivre card|card=0123}} [[Olav]]

'''Note''': observação editorial.
}}
{{Timeline|2|events=
Alguém usa {{Nihongo|"Algo"|漢字|Kanji}} e [[Monkey D. Luffy]] parte.{{Qref|name=sbs4}}{{Qref|cover=884}}
}}
{{Timeline|BOTTOM}}
"""

PAGE = {"type": "wiki", "ref": "World Timeline", "url": "https://example.org/wiki/World_Timeline", "rev": 1}


class WikitextTest(unittest.TestCase):
    def test_find_templates_nested(self):
        t = find_templates("a {{X|1|{{Y|2}}|k=v}} b {{Y|3}}", r"y")
        self.assertEqual([x.params for x in t], [["2"], ["3"]])

    def test_links_skip_files_and_dedupe(self):
        self.assertEqual(links("[[A|a]] [[File:B.png]] [[A]] [[C#sec|c]]"), ["A", "C"])

    def test_parse_year(self):
        self.assertEqual(parse_year("~800"), (800, True))
        self.assertEqual(parse_year(" 38 "), (38, False))
        self.assertIsNone(parse_year("TOP"))

    def test_precision(self):
        self.assertEqual(precision_for(38, False), "ano")
        self.assertEqual(precision_for(5000, True), "milenio")
        self.assertEqual(precision_for(900, True), "seculo")
        self.assertEqual(precision_for(830, True), "decada")


class CitationTest(unittest.TestCase):
    def test_named_refs_are_resolved_from_definition(self):
        refs = collect_named_refs(WIKI)
        self.assertEqual(refs["sbs4"], {"name": "sbs4", "sbs": "4", "page": "28"})
        self.assertEqual(refs["sbs113"]["sbs"], "113")

    def test_sources_mapping(self):
        self.assertEqual(
            citation_to_sources({"chap": "867", "page": "13-15", "vol": "86", "ep": "880"}),
            [{"type": "manga", "ref": "cap. 867 (vol. 86)", "page": "13-15"}, {"type": "anime", "ref": "ep. 880"}],
        )
        self.assertEqual(citation_to_sources({"data": "vivre card", "card": "0996"}), [{"type": "vivre_card", "ref": "carta 0996"}])
        self.assertEqual(citation_to_sources({"data": "yellow", "page": "233"}), [{"type": "databook", "ref": "Yellow Databook", "page": "233"}])
        self.assertEqual(citation_to_sources({"magazine": "6", "page": "55"}), [{"type": "magazine", "ref": "ONE PIECE Magazine vol. 6", "page": "55"}])
        self.assertEqual(citation_to_sources({"cover": "884"}), [{"type": "cover_story", "ref": "capa do cap. 884"}])
        self.assertEqual(citation_to_sources({"game": "UC1"}), [])


class DraftsTest(unittest.TestCase):
    def setUp(self):
        self.drafts = build_drafts(WIKI, prefix="wt", canon="manga", page_src=PAGE)

    def test_year_blocks_skip_top_bottom_and_track_section(self):
        blocks = year_blocks(WIKI)
        self.assertEqual([(b.ago, b.approx, b.section) for b in blocks], [
            (900, True, "Void Century"),
            (19, False, "Great Pirate Era-Before Luffy's Journey"),
            (2, False, "Great Pirate Era-Before Luffy's Journey"),
        ])

    def test_one_draft_per_paragraph_and_per_person(self):
        # 1 (~900) + 1 parágrafo + 4 nascimentos (19) + 1 (2); a "Note" é ignorada
        self.assertEqual(len(self.drafts), 7)
        births = [d for d in self.drafts if d["kind"] == "nascimento"]
        self.assertEqual([d["hint"]["links"] for d in births], [["Usopp"], ["Monkey D. Luffy"], ["Kaya"], ["Olav"]])

    def test_list_citation_applies_to_links_since_previous_one(self):
        by = {d["hint"]["links"][0]: d for d in self.drafts if d["kind"] == "nascimento"}
        self.assertEqual(by["Usopp"]["src"][1:], [{"type": "sbs", "ref": "SBS vol. 4", "page": "28"}])
        self.assertEqual(by["Monkey D. Luffy"]["src"][1:], [{"type": "sbs", "ref": "SBS vol. 4", "page": "28"}])
        self.assertEqual(by["Kaya"]["src"][1:], [{"type": "vivre_card", "ref": "carta 0123"}])
        self.assertEqual(by["Olav"]["src"], [{**PAGE, "url": PAGE["url"] + "#Great_Pirate_Era-Before_Luffy's_Journey"}])

    def test_dates_and_revealed(self):
        first = self.drafts[0]
        self.assertEqual(first["date"], {"ago": 900, "precision": "seculo", "conf": "estimada", "seq": 0})
        self.assertEqual(first["revealed"], {"ch": 392, "approx": True, "ep": 275})
        self.assertEqual(first["canon"], "manga")
        last = self.drafts[-1]
        self.assertEqual(last["date"]["ago"], 2)
        self.assertIsNone(last["revealed"]["ch"])  # só SBS e capa: capítulo de revelação fica para o revisor
        self.assertIn({"type": "cover_story", "ref": "capa do cap. 884"}, last["src"])

    def test_no_wiki_prose_in_output(self):
        out = json.dumps(self.drafts, ensure_ascii=False)
        for prose in ("Algo começa", "Frase secreta", "Nota livre", "observação editorial", "漢字", "parte."):
            self.assertNotIn(prose, out)
        for d in self.drafts:
            self.assertEqual((d["title"], d["sum"], d["more"]), ("", "", ""))
            self.assertFalse(d["verified"])

    def test_ids_are_stable_between_runs(self):
        again = build_drafts(WIKI, prefix="wt", canon="manga", page_src=PAGE)
        self.assertEqual([d["id"] for d in self.drafts], [d["id"] for d in again])


if __name__ == "__main__":
    unittest.main()
