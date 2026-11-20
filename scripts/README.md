# Pipeline de coleta (Python)

Gera **rascunhos** de eventos a partir do One Piece Wiki (Fandom), via API MediaWiki. Só biblioteca padrão, Python 3.10+.

```bash
cd scripts
python collect_timeline.py           # cronologia do wiki (World Timeline, abas Canon e Non-Canon)
python collect.py                    # páginas de arco de sources.json
python collect.py --saga s_east      # uma saga
python collect.py --refresh          # ignora o cache (.cache/, fora do Git); vale para os dois
python -m unittest discover -q -p "test_*.py"   # testes
```

> O HTML do Fandom recusa leitores automáticos (HTTP 402). Use sempre a API (`fandom.py`), que respeita 1 requisição por segundo e guarda cache.

## Cronologia: `collect_timeline.py`

Lê o wikitext de **World Timeline** e **World Timeline/Non-Canon** e gera:

- `drafts/world_timeline.json` (canon, `canon: "manga"` por padrão)
- `drafts/world_timeline_noncanon.json` (filmes, jogos, especiais: `canon: null`, decidir à mão)

Como o wiki é lido:

| No wiki | No rascunho |
|---|---|
| `{{Timeline\|38\|events=...}}` | `date.ago = 38`, `precision: "ano"`, `conf: "exata"` |
| `{{Timeline\|~800\|...}}` | `date.ago = 800`, `conf: "estimada"`, `precision` por magnitude (milênio, século, década) |
| cada parágrafo do bloco | um rascunho (`date.seq` = ordem no bloco) |
| `Births:` / `Deaths:` com lista | um rascunho por pessoa, `kind` = nascimento/morte; a citação vale para os nomes desde a anterior |
| `{{Qref\|chap=..\|page=..\|ep=..}}` | `src` (mangá, anime) e `revealed.ch`/`revealed.ep` = o **menor** capítulo/episódio citado |
| `sbs=`, `data=vivre card\|card=`, `data=yellow`, `magazine=`, `cover=`, `novel=` | `src` do tipo correspondente |
| `{{Qref\|name=x}}` | resolvida pela definição com o mesmo `name` na página |
| `[[Página\|rótulo]]` | `hint.links` (nomes de personagens, lugares, organizações) |

`date.ago` conta anos antes do presente pós-timeskip (Círculo Marítimo 1541 / Era do Céu 4131, SBS vol. 113). O site deriva os anos dos dois calendários.

Pistas para o revisor, em `hint`: `section` (período do wiki), `links`, `kind_guess` (palpite por palavra-chave, **não confiável**), `citations` (só os campos numéricos de cada citação).

Ficam de fora: a prosa dos parágrafos, as notas livres das citações, parágrafos `Note`. Os ids (`wt_<ago>_<hash>`) são estáveis enquanto o parágrafo mantiver ano, links e capítulos.

**O que conferir na revisão:**
- `revealed.ch` vem com `approx: true`. Eventos citados só por SBS ou Vivre Card ficam com `ch: null`: descubra o capítulo em que o fato aparece ao leitor (ou o volume do SBS).
- `saga`, `imp`, `kind`, `tags`, `title`, `sum`, `more`.

## Arcos: `collect.py`

`drafts/<saga>.json`, com um evento-esqueleto por subseção do resumo de cada página de arco:

- `revealed.ch`, `revealed.ep`, `hint.chapters`, `hint.episodes`: números lidos do infobox (fatos). Capítulo e episódio de início do arco servem só de ponto de partida.
- `src`: página, URL e revisão do wiki (para atribuição e conferência).
- `hint.heading`: título da seção, **só como pista** de qual momento descrever.
- `title`, `sum`, `more`, `kind`, `date.ago`, `tags`: **vazios**. Escritos à mão.
- `verified: false`.

Para incluir mais sagas, adicione as páginas em `sources.json` (ids de saga de `src/data/sagas.json`).

## Regras

1. **Nenhuma prosa do wiki é copiada** (CC BY-SA). O rascunho tem fatos e links; o texto do site é próprio.
2. Revisão manual: confira capítulo/episódio no mangá, escreva `title`/`sum`/`more`, defina `saga`, `imp`, `kind`, `date` (`ago`, `precision`, `conf`, `seq`), `tags`, e só então marque `verified: true`.
3. Em conflito entre fontes, prevalece a oficial; registre a divergência em `conflicts`.
4. Correções oficiais de Vivre Card: https://one-piece.com/vivre/revision.php

Os rascunhos ainda **não** entram no site: o schema do site só aceita eventos completos. A mesclagem (rascunho verificado → `src/data/events.json`) é o próximo passo.
