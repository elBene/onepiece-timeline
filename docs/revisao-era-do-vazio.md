# Revisão: Era do Vazio

Revisão feita em 2026-11-20 sobre os 30 rascunhos das seções *Before Void Century* e *Void Century* de `scripts/drafts/world_timeline.json` (wiki rev. 2137923).

**Resultado:** 23 eventos novos em `src/data/events.json`, mais o evento `e2` ajustado. Foi criada a era **Antiguidade** (`antiga`) com a saga **Mundo antigo** (`s_antigo`), para o que vem antes do Século Vazio. Os textos são próprios. Todos os eventos continuam com **`verified: false`**.

## Como foi conferido

- Cada capítulo citado pelo wiki foi comparado com o resumo da página do capítulo, também no wiki: 25 de 26 batem. O cap. 203 não confirma as datas de Robin; veja abaixo.
- Esse cruzamento usa duas páginas do mesmo wiki, então **não substitui a leitura do mangá**. Antes de marcar `verified: true`, confira cada item da tabela no capítulo.
- Datas ditas por personagens ("há 800 anos") contam a partir do momento da fala, e não do presente pós-timeskip. A diferença, de 2 a 30 anos, some dentro da precisão de século ou milênio usada.

## Eventos

| id | Anos atrás | Cap. / ep. | Observação |
|---|---|---|---|
| `v-arvore-ohara` | ~5000 | 392 / 275 | Idade só no Yellow Databook (p. 233) |
| `v-alubarna` | ~4000 | 188 / 115 | |
| `v-elbaf-instalacao` | ~3000 | 1144 | Estimativa de uma personagem → `inferida` |
| `v-shandora-auge` | ~1100 | 261 / 172 | **Divergência:** wiki diz 1139; o mangá diz "mais de 1100" |
| `v-zunesha-nasce` | ~1000 | 802 / 751 | |
| `v-bracos-pernas` | ~1000 | capa 884 | História de capa |
| `v-tontatta` | ~900 | 718 / 648 | |
| `v-joyboy-nika` | 900–800 | 1114 | Marco |
| `v-grande-reino` | 900–800 | 395 / 277 | Teoria de Ohara |
| `v-emet` | 900–800 | 1067 | |
| `e2` (promessa de Joy Boy) | 900–800 | 649 / 569 | Antes estava em ~800; o wiki coloca durante o século |
| `v-toki-nasce` | ~830 | 964 / 964 | Calculado a partir da fala dela → `inferida` |
| `v-shandora-queda` | ~800 | 261 / 172 | |
| `v-imu-gigantes` | ~800 | 1186 | Capítulo recente |
| `v-grande-guerra` | ~800 | 1115 | Marco. Trava no 1115 porque o texto cita a derrota do herói |
| `v-mar-sobe` | ~800 | 1115 | O wiki não cita capítulo; conferido pelo resumo do 1115 |
| `v-poneglyphs` | ~800 | 818 / 770 | |
| `v-plutao-wano` | ~800 | 1055 | |
| `v-governo-mundial` | ~800 | 497 / 391 | Marco |
| `v-censura` | ~800 | 395 / 277 | |
| `v-lili` | ~800 | 1084 | |
| `v-riku-dressrosa` | ~800 | 722 / 653, 726 / 658 | |
| `v-zunesha-crime` | ~800 | 1040 | |
| `v-enies-lobby` | ~800 | 426 / 308 | O wiki fala da Cipher Pol; o capítulo só confirma os 800 anos da ilha |

Eventos de capítulos recentes (1067 em diante) ainda não têm episódio: o anime não chegou lá ou o wiki não registra.

## Rascunhos não aproveitados

| Rascunho | Motivo |
|---|---|
| 4 datas de Alabasta (3892, 3871, 3825, 3806 anos atrás) | São a "leitura" que Robin inventa para enganar Crocodile (cap. 203). O Yellow Databook confirma que as datas são falsas. Não são história do mundo. Vale lembrar que é a única aparição da Era do Céu na obra. |
| Minks se isolam em Zou (~1000) | O wiki não cita fonte. Volta quando houver capítulo. |
| "O Século Vazio começa" (~900) | Já coberto pelo marco `e1` |
| Página "Void Century" (`drafts/s_void.json`) | Sem capítulos nem seções no infobox; nada a extrair |

## Decisões para o dono

1. ~~Saga "Mundo antigo" na era do Vazio~~ **Decidido:** era própria **Antiguidade** (`antiga`, ≈ 5000 a 1000 anos atrás, bandeira verde-musgo `--era-ancient`), com a saga Mundo antigo. A Era do Vazio volta a cobrir só ≈ 900 a 800 anos atrás.
2. **Eventos só de databook ou de capa** (`v-arvore-ohara`, `v-bracos-pernas`) entram como detalhe (importância 1). Se preferir uma linha só com a trama principal, um filtro por `canon`/fonte resolve.
3. A importância (`imp`) foi escolhida por mim: 3 para Joy Boy, a Grande Guerra e a fundação do Governo Mundial. Ajuste à vontade.
