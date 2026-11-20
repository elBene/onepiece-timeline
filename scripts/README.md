# Pipeline de coleta (Python)

Gera **rascunhos** de eventos a partir do One Piece Wiki (Fandom). Só biblioteca padrão, Python 3.10+.

```bash
cd scripts
python collect.py                  # todas as sagas de sources.json
python collect.py --saga s_east    # uma saga
python collect.py --refresh        # ignora o cache (.cache/, fora do Git)
python -m unittest -q test_parsing # testes do parser
```

## O que sai

`drafts/<saga>.json`, com um evento-esqueleto por subseção do resumo de cada página:

- `ch`, `hint.chapters`, `hint.episodes`: números lidos do infobox (fatos).
- `src`: página, URL e revisão do wiki (para atribuição e conferência).
- `hint.heading`: título da seção, **só como pista** de qual momento descrever.
- `title`, `sum`, `more`, `when`, `t`, `tags`: **vazios**. Escritos à mão.
- `verified: false`.

## Regras

1. **Nenhuma prosa do wiki é copiada** (CC BY-SA). O rascunho tem fatos e links; o texto do site é próprio.
2. Revisão manual: confira capítulo/episódio no mangá, escreva `title`/`sum`/`more`, defina `imp`, `t`, `when`, `tags`, e só então marque `verified: true`.
3. Em conflito entre fontes, prevalece a oficial; registre a divergência em `more`.
4. Para incluir mais sagas, adicione as páginas em `sources.json` (ids de saga de `src/data/sagas.json`).

Os rascunhos ainda **não** entram no site: o schema do site só aceita eventos completos. A mesclagem (rascunho verificado → `src/data/events.json`) é o próximo passo.
