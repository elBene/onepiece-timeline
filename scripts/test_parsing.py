import unittest

from parsing import infobox_range, summary_headings

HTML = """
<div data-source="chapter"><h3>Manga</h3><div><b>Chapters:</b> 1-7, 7 chapters</div></div>
<div data-source="episode"><h3>Anime</h3><div><b>Episodes:</b> 1-4, 4 episodes</div></div>
<div data-source="single"><div><b>Chapters:</b> 1,053</div></div>
"""

SECTIONS = [
    {"toclevel": 1, "line": "Summary"},
    {"toclevel": 2, "line": "Primeiro <i>capítulo</i>"},
    {"toclevel": 2, "line": "Segundo"},
    {"toclevel": 1, "line": "Characters"},
    {"toclevel": 2, "line": "Não deve entrar"},
]


class ParsingTest(unittest.TestCase):
    def test_range(self):
        self.assertEqual(infobox_range(HTML, "chapter"), {"start": 1, "end": 7})
        self.assertEqual(infobox_range(HTML, "episode"), {"start": 1, "end": 4})

    def test_single_with_thousands_separator(self):
        self.assertEqual(infobox_range(HTML, "single"), {"start": 1053, "end": 1053})

    def test_missing_field(self):
        self.assertIsNone(infobox_range(HTML, "volume"))

    def test_summary_headings_only_under_summary(self):
        self.assertEqual(summary_headings(SECTIONS), ["Primeiro capítulo", "Segundo"])


if __name__ == "__main__":
    unittest.main()
