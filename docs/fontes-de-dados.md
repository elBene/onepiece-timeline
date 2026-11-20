# Fontes de dados e modelo para as vistas Ano, Arcos e Eras

Pesquisa feita em 2026-11-20. Marcações usadas aqui:
**[conferido]** = li a fonte nesta pesquisa; **[a conferir]** = veio de fonte secundária ou de memória e precisa de checagem antes de virar dado.

---

## 1. Descobertas que mudam o projeto

### 1.1 Os dois calendários agora têm ano oficial

Oda respondeu no **SBS do volume 113, p. 49** (a resposta circulou em novembro de 2025):

| Calendário | Japonês | Nomes em inglês | Ano atual | Observações |
|---|---|---|---|---|
| **Círculo Marítimo** | 海円暦 *Kaienreki* | Age of the Sea Circle; VIZ "Age of Kaien"; Funimation "Sea Ephemeris" | **1541** | Usado por Noland no diário de bordo (cap. 228, ep. 148: ano 1120 e 1122). Meses e dias batem com o calendário gregoriano. |
| **Era do Céu** | 天暦 *Tenreki* | Age of Heaven; Funimation "Sky Ephemeris" | **4131** | Aparece só quando Robin "lê" o Poneglyph de Alabasta para Crocodile (cap. 203, ep. 123). Ela estava mentindo, e o Yellow Databook diz que aquelas datas foram inventadas. Não se sabe como divide meses e dias. |

- **O ano atual é o pós-timeskip.** O wiki registra 4131 "após o timeskip de dois anos" **[conferido: One Piece Wiki, World Timeline, seção Calendars]**.
- Os dois calendários **estão em uso hoje**. A obra não diz qual região usa qual **[conferido]**.
- Diferença fixa: **Tenreki = Kaienreki + 2590**.
- Luffy nasceu em 5 de maio de **Kaienreki 1522 / Tenreki 4112**. Usopp nasceu em 1º de abril de 1522 **[a conferir: só a ScreenRant cita; confira no SBS 113]**.
- Ano zero de cada calendário: **a obra não informa**. Há teorias (o Kaienreki começaria no fim do Século Vazio), mas sem confirmação. Não exiba ano zero como fato.

**Conversão usada no projeto** (anos antes do presente pós-timeskip = `ago`):

```
kaienreki = 1541 - ago
tenreki   = 4131 - ago
ano relativo à partida de Luffy = (1539 - kaienreki)    # Luffy zarpa em 1539, aos 17
```

> Atenção: a **Library of Ohara v5.0** (janeiro de 2024) é anterior ao SBS 113 e usa 1522/1524 como presente. Datas absolutas de lá **estão deslocadas em 17 anos**. Os valores "N anos atrás" continuam úteis.

### 1.2 O One Piece Wiki já tem uma cronologia estruturada e legível por máquina

A página **World Timeline** (aba *Canon*) e a subpágina **World Timeline/Non-Canon** estão escritas com templates fáceis de parsear **[conferido via API]**:

- `{{Timeline|38|events=...}}`: o número é **"anos atrás" a partir do presente pós-timeskip**. Por exemplo, God Valley = 38 e a execução de Roger = 24. Valores com `~` são aproximados (`~800`, `~5000`).
- São 152 blocos de ano, de `~5000` até `0`, em 9 seções: *Before Void Century*, *Void Century*, *After Void Century – Before Current Century*, *Past Century Before God Valley Incident*, *God Valley Incident – Roger's Execution*, *Great Pirate Era – Before Luffy's Journey*, *Start of Luffy's Journey – Summit War of Marineford*, timeskip e pós-timeskip.
- As citações vêm em `{{Qref|...}}` com campos estruturados. São 714 ao todo. Contagem por campo: `chap` 344, `page` 319, `ep` 278, `sbs` 55, `vol` 23, `data` 17 (`vivre` 15, `yellow` 2), `card` 11, `magazine` 4, `cover` 4, `novel` 3.
- Nascimentos, mortes, guerras, fundações e incidentes já aparecem na página. É a base mais completa para a vista **Ano**.
- **Acesso:** a API MediaWiki (`/api.php?action=parse&prop=wikitext`) responde normalmente com `curl` e é o que o `scripts/fandom.py` já usa. Já o HTML do site **recusa leitores automáticos** (HTTP 402). Use só a API.

### 1.3 Inconsistência nos dados atuais

O `t` de `src/data/events.json` mistura duas referências:

- `e3` (God Valley, −38) e `e4` (−24) seguem o padrão do wiki, que conta a partir do **presente pós-timeskip**.
- `e5` (execução de Roger, −22) e `e6` (Ohara, −20) contam a partir da **partida de Luffy**.

Pela referência da partida, God Valley é −36. Isso se resolve com a melhoria 4 do CLAUDE.md: guardar `ago` ou o ano Kaienreki e derivar o resto.

> **Resolvido:** os eventos agora usam `date.ago` (anos antes do presente pós-timeskip), com os valores do wiki: God Valley 38, Roger chega a Laugh Tale 25, execução 24, Ohara 22, chapéu de palha 12, pré-timeskip 2, pós-timeskip 0. Os episódios em `revealed.ep` vieram das citações da World Timeline que trazem o mesmo capítulo; o do ep. 1 (execução de Roger) foi anotado de memória. Todos continuam `verified: false`.

---

## 2. Catálogo de fontes

### 2.1 Oficiais (primárias)

Ordem de autoridade em caso de conflito:

| # | Fonte | O que fornece | Como citar | Acesso |
|---|---|---|---|---|
| 1 | **Mangá** (capítulos, Shueisha) | Fatos, "N anos atrás" ditos por personagens, capítulo em que o fato é **revelado** | `cap. 1096, p. 10` | MANGA Plus (oficial e gratuito, últimos capítulos) e volumes físicos |
| 2 | **SBS** (perguntas e respostas nos volumes) | Aniversários, idades, alturas, **os anos dos calendários (SBS 113)**, esclarecimentos de Oda | `SBS vol. 113, p. 49` | Volumes impressos; o wiki transcreve cada SBS |
| 3 | **Vivre Card – One Piece Visual Dictionary** (2018 em diante, coleção de cartas) | Idade, aniversário, origem, estreia, "N anos atrás" de muitos personagens, eventos antigos | `Vivre Card, carta X` | Físico. **Tem erros**: algumas cartas contradizem o mangá, e a editora publica correções no site oficial (https://one-piece.com/vivre/revision.php, citado pelo wiki). Oda confirmou a legitimidade da coleção no SBS 108 **[a conferir]**. |
| 4 | **Databooks**: Red (2002), Blue (2002), Yellow (2007), Green (2007), Blue Deep (2012) **[anos a conferir]** | Idades, cronologias, dados de personagens, notas como "as datas de Robin no cap. 203 foram inventadas" (Yellow) | `Yellow Databook, p. X` | Físico |
| 5 | **ONE PIECE Magazine** (2017 em diante) | Entrevistas com Oda, extras de lore, às vezes datas | `ONE PIECE Magazine vol. X` | Físico |
| 6 | **Histórias de capa** (cover stories) | Eventos paralelos canônicos (o que aconteceu com vilões derrotados etc.) | `cap. X (capa)` | Mangá |
| 7 | **Anime (Toei)** | Número do episódio, data de exibição, e se o conteúdo é canon, anime-only ou filler | `ep. 1130` | Site da Toei, Crunchyroll e o `Episode Box` de cada episódio no wiki |
| 8 | **Filmes, novels, one-shots** (Chapter 0, Romance Dawn, novels "A" de Ace, Film RED etc.) | Contexto. O canon varia; trate cada um caso a caso | `Filme: Strong World` | Físico ou streaming |

### 2.2 Secundárias (pistas com citação)

| Fonte | Para que serve | Licença e uso | Status |
|---|---|---|---|
| **One Piece Wiki (Fandom)**: World Timeline, World Timeline/Non-Canon, páginas de arco, capítulo, episódio e personagem | Esqueleto da cronologia com citação por entrada. `Episode Box` traz número, data de exibição e título. Infobox de personagem traz aniversário, idade, estreia e status (vivo ou morto). Páginas de arco dão intervalos de capítulos e episódios. | **CC BY-SA**: só fatos e números, prosa própria (regra já vigente) | API **[conferida]** |
| **Library of Ohara – "The One Piece Timeline" v5.0** | Cronologia comentada, boa para marcar o que é inferência ou especulação e entradas com mês e dia. Usa títulos de época (Era dos Escravos, Século Vazio, séculos 600…1100, Era de Rocks, Era de Roger, Grande Era dos Piratas). | Sem licença formal. O autor pede crédito se a cronologia for exibida inteira. Use como pista. | Lida em parte. **Anterior ao SBS 113** |
| **Library of Ohara – análises de capítulo e posts sobre o Vivre Card** | Lista de novidades de cada carta e de cada capítulo | Idem | Pista |
| **Wikipedia** (listas de capítulos e episódios) | Datas de publicação dos capítulos e de exibição dos episódios | CC BY-SA | Pista |
| **Jikan / MyAnimeList API** (`api.jikan.moe/v4/anime/21/episodes`) | Lista de episódios com flags `filler` e `recap` | Gratuita, com limite de requisições | **Não respondeu** nesta pesquisa; testar de novo |
| **Anime Filler List** | Classificação de episódios em canon, misto e filler | Ver os termos de uso antes de raspar | Pista |
| **Fóruns** (Arlong Park, Worstgen), **TV Tropes** | Debates sobre datas conflitantes | Só leitura | Pista fraca |
| Sites de notícias (ScreenRant, Sportskeeda, Epicstream, Looper) | Avisos de novidades (SBS, Vivre Card) | Só leitura | **Pouco confiáveis**, com números divergentes. Nunca use como fonte final. |

---

## 3. Modelo de dados proposto para as três vistas

### 3.1 Duas datas diferentes por evento (ponto central)

Para cada evento há duas datas:

- **Quando aconteceu** no mundo (ano in-universe). Alimenta a vista **Ano** e a **Eras**.
- **Quando foi revelado** ao leitor (capítulo e episódio). Alimenta a vista **Arcos**, a ordem de publicação e a **proteção de spoilers**.

Exemplo: God Valley aconteceu em Kaienreki 1503, mas foi revelado no cap. 957 (Wano), com mais detalhes no cap. 1096 (Egghead).

### 3.2 Campos sugeridos (evolução de `events.json`)

```jsonc
{
  "id": "god-valley-incident",
  "title": "...", "sum": "...", "more": "...",           // textos próprios
  "kind": "incidente",          // nascimento | morte | batalha | guerra | fundacao | descoberta
                                // | fruta | recompensa | governo | viagem | incidente | outro
  "imp": 3,

  // --- quando aconteceu ---
  "date": {
    "ago": 38,                  // anos antes do presente pós-timeskip (Kaienreki 1541)
    "agoMax": null,             // para intervalos: 38..40
    "month": null, "day": null, // só se a fonte der (calendário Kaienreki ≈ gregoriano)
    "precision": "ano",         // dia | mes | ano | intervalo | decada | seculo | milenio
    "basis": "explicita",       // explicita (dita na obra) | calculada (de idades) | inferida
    "conf": "exata"             // mantém o campo atual
  },
  // kaienreki/tenreki são DERIVADOS em lib/, nunca digitados à mão

  "historicalEras": ["rocks"],  // ids de eras in-universe (vista Eras); pode ter mais de uma
  "storyPhase": "pre-luffy",    // pre-luffy | pre-timeskip | timeskip | pos-timeskip

  // --- quando foi revelado ---
  "revealed": { "ch": 957, "ep": 958 },   // primeira menção = trava de spoiler
  "appearances": [                        // onde o evento é mostrado ou aprofundado
    { "ch": 1096, "ep": 1130, "arc": "egghead" }
  ],

  // --- vínculos ---
  "characters": ["rocks-d-xebec", "gol-d-roger", "monkey-d-garp"],
  "places": ["god-valley"],
  "orgs": ["rocks-pirates", "roger-pirates", "marinha"],

  // --- origem ---
  "canon": "manga",             // manga | sbs | databook | anime-only | filler | filme | novel
  "src": [
    { "type": "manga", "ref": "cap. 1096", "page": "10" },
    { "type": "anime", "ref": "ep. 1130" },
    { "type": "vivre_card", "ref": "carta ..." },
    { "type": "wiki", "ref": "World Timeline", "url": "...", "rev": 123456 }
  ],
  "conflicts": [                // divergências entre fontes (hoje vão em "more")
    { "note": "Vivre Card diz X, mangá diz Y", "src": ["vivre_card", "manga"] }
  ],
  "verified": false
}
```

Ampliar `SourceTypeSchema` para: `manga, sbs, databook, vivre_card, magazine, cover_story, anime, film, novel, wiki, fan`. Acrescentar `page`, `rev` e `card` opcionais.

### 3.3 Entidades novas (melhoria 5 do CLAUDE.md, necessária para a vista Ano)

- **`characters.json`**: `id`, `name`, `birth` (`{month, day}`), `born` (`ago` + `precision`; costuma ser calculado da idade, com margem de ±1 ano), `died` (id do evento), `debut` (`{ch, ep}`), `affiliations`. Nascimentos e mortes na vista Ano saem daqui.
  Ao calcular o nascimento a partir da idade, a obra não deixa claro se a idade muda no aniversário ou em 1º de janeiro (a Library of Ohara adota 1º de janeiro). Marque `basis: "calculada"` e `precision: "ano"` com margem.
- **`places.json`**: ilhas, mares, reinos (filtro por ilha).
- **`historical-eras.json`**: para a vista Eras, separado das "sagas" atuais.
- **`arcs.json`**: arco → saga, intervalo de capítulos e intervalo de episódios (já disponível na infobox das páginas de arco do wiki). É a base da vista Arcos e do mapeamento capítulo ↔ episódio.

### 3.4 Eras in-universe (vista Eras), proposta inicial

| id | Nome | Intervalo (`ago`) | Base |
|---|---|---|---|
| `antiguidade` | Antiguidade / antes do Século Vazio | ~5000 a ~900 | wiki: Before Void Century (Árvore do Conhecimento ~5000) |
| `vazio` | Século Vazio | ~900 a ~800 | cap. 395 e outros |
| `governo` | Fundação do Governo Mundial e séculos seguintes | ~800 a ~100 | wiki: After Void Century |
| `rocks` | Era de Rocks | até God Valley (38) | cap. 957 e 1096; "era de Rocks" é termo usado na obra **[confira o nome exato]** |
| `roger` | Era de Roger | 38 a 24 | God Valley → execução |
| `grande-era` | Grande Era dos Piratas (*Daikaizoku Jidai*) | 24 até hoje | nome oficial, dito na execução de Roger |
| `nova-era` | Nova era / "Era dos Quatro Imperadores" pós-Wano | a definir | confirme se a obra dá um nome oficial |

Regra: só ganha nome de era o que **a obra chama assim**. Agrupamentos do site (como "Antiguidade") recebem um selo "classificação do site".

### 3.5 Como cada vista usa os dados

- **Ano.** Eixo em Kaienreki, com Tenreki ao lado: `1503 C.M. · 4093 E.C.`. Passar o mouse destaca o ano. Clicar abre a lista daquele ano, com eventos, nascimentos (de `characters.born`) e mortes. Eventos com `precision` maior que um ano aparecem como faixa ou num grupo "por volta de". **Escala:** de ~5000 até 0 a escala linear não funciona. Use escala por trechos (milênios → séculos → anos) ou deixe o zoom atual decidir a granularidade.
- **Arcos.** Ordena por `revealed.ch` (ou por `appearances` dentro do arco atual) e agrupa por `arcs.json`. É a "ordem de publicação" atual, enriquecida com episódio.
- **Eras.** Agrupa por `historicalEras` e ordena por `ago`.
- **Spoilers.** Continua por capítulo (`revealed.ch`). Vale adicionar o modo "último episódio assistido", que usa `revealed.ep` para quem só vê o anime. Eventos anime-only ou filler só aparecem se o usuário quiser.

---

## 4. Outras informações relevantes a capturar

- **Tipo de evento** (nascimento, morte, batalha, ingestão de Akuma no Mi, recompensa, fundação, coroação).
- **Canon** do evento (mangá, anime-only, filler, filme, novel), com filtro.
- **Arco de revelação** e **arco em que ocorre**, que só coincidem no presente.
- **Personagens, locais e organizações** envolvidos (filtros por personagem e ilha).
- **Mês e dia** quando houver: aniversários e o diário de Noland. Permite um "aconteceu neste dia" no calendário.
- **Idade dos personagens no evento**, calculada: "Roger tinha X anos".
- **Divergências** entre fontes (mangá × anime × Vivre Card), com selo visual.
- **Data real de publicação** do capítulo e do episódio, para um modo "como os leitores descobriram ao longo dos anos" (o wiki tem a página *Real-Life Timeline*).
- **Volume** do mangá (além do capítulo), para quem lê em tankobon.

---

## 5. Próximos passos sugeridos (pipeline)

1. **Feito** (`scripts/collect_timeline.py`): coletor de **World Timeline** e **World Timeline/Non-Canon** via API. Parsear `{{Timeline|N|events=...}}` e `{{Qref|...}}` para gerar rascunhos com `ago`, `revealed.ch` (o menor `chap`), `ep`, `sbs`, `data` e links para personagens. Guardar a revisão (`revid`) para atribuição. **Sem copiar prosa.**
2. Coletar o mapeamento **arco → capítulos e episódios** das páginas de arco (já parcialmente feito) e criar `arcs.json`.
3. Coletar infobox de personagens (aniversário, idade pré e pós-timeskip, estreia, status) para `characters.json`.
4. Episódios: `Episode Box` do wiki (número, data) + Jikan (`filler`/`recap`) para a classificação de canon.
5. Corrigir a referência de `t` nos eventos atuais (seção 1.3) ao migrar para `date.ago`.
6. Conferir manualmente no material impresso os itens **[a conferir]**, principalmente o SBS 113 e o nascimento de Usopp.

## Referências consultadas

- One Piece Wiki – World Timeline (via API): https://onepiece.fandom.com/wiki/World_Timeline
- One Piece Wiki – World Timeline/Non-Canon: https://onepiece.fandom.com/wiki/World_Timeline/Non-Canon
- One Piece Wiki – Real-Life Timeline: https://onepiece.fandom.com/wiki/Real-Life_Timeline
- Library of Ohara – The One Piece Timeline v5.0: https://thelibraryofohara.com/the-one-piece-timeline/
- Library of Ohara – Vivre Card Databook: https://thelibraryofohara.com/2018/09/01/everything-you-need-to-know-about-the-vivre-card-databook
- ScreenRant – calendários do SBS 113: https://screenrant.com/one-piece-official-timeline-years-manga-anime/
- Artur (Library of Ohara) no X – SBS 113: https://x.com/newworldartur/status/1985457130896232843 (não foi possível abrir)
- Sportskeeda – confiabilidade do Vivre Card: https://www.sportskeeda.com/anime/why-vivre-cards-aren-t-always-reliable-source-information-one-piece
- Sportskeeda – Vivre Card é canon?: https://sportskeeda.com/anime/one-piece-is-vivre-card-databook-canon-explained
- Wikiwand – Lists of One Piece episodes: https://www.wikiwand.com/en/articles/Lists_of_One_Piece_episodes
- epguides – One Piece: https://epguides.com/OnePiece/
