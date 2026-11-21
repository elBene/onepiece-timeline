# Linha do Tempo de One Piece

Site público (projeto pessoal, para publicar e divulgar) com a linha do tempo dos acontecimentos do mundo de One Piece. Idioma da interface e dos textos: **português do Brasil**.

## Estado atual

- Projeto **Astro 7 + TypeScript**, com saída estática e dados em JSON validados por Zod no build. Não tem backend.
- **Deploy:** GitHub Pages pelo workflow `.github/workflows/deploy.yml`, a cada push na `main`. O endereço é https://elbene.github.io/onepiece-timeline/, e por isso `base: '/onepiece-timeline'` em `astro.config.mjs`.
- **Visual:** redesign "Céu e Mar" (veja Design e `DESIGN.md`). Existe só a vista horizontal; a vertical saiu.
- **Dados** em `src/data/`: 4 eras, 13 sagas, 48 eventos e 4 tags. A Era do Vazio já foi revisada a partir do wiki (`docs/revisao-era-do-vazio.md`), mas **nenhum evento tem `verified: true`** ainda.
- `prototype.html`: protótipo original, guardado só como histórico. Não é mais a referência visual.
- `PRODUCT.md` descreve o público, que tem dois grupos com o mesmo peso: o fã no meio da leitura ou do anime, que não quer spoiler, e o veterano de lore, que quer a cronologia completa com fontes. Também registra o propósito do produto.

## Comandos

```bash
npm run dev      # localhost:4321/onepiece-timeline/
npm test         # Vitest
npm run check    # astro check (tipos)
npm run build    # gera ./dist e valida os JSONs
```

Os scripts Python ficam em `scripts/` (veja `scripts/README.md`). Os testes deles rodam com `python -m unittest discover -q -p "test_*.py"`.

## Estrutura

```
src/
  pages/index.astro        página única
  layouts/Base.astro       fontes, canvas da cena, script de tema, rodapé
  components/
    Header.astro           marca, spoiler, Foco (temas), troca de tema
    Timeline.astro         filtros (rail), linha, painel do ano
    timeline/mount.ts      montagem no cliente: virtualização, seleção, teclado, arrasto, painel
    timeline/nodes.ts      EraMark, SagaBand, Marker (disco), Tick (traço), Gap (régua de anos vazios)
  lib/
    schema.ts, data.ts     schema Zod e leitura dos JSONs
    calendar.ts            anos de calendário derivados de date.ago
    sort.ts, filters.ts    ordem história/publicação, zoom, tags
    spoilers.ts, modal.ts  modelos censurados (EventView, ModalView) para eventos ocultos
    layout.ts              eixo de anos, nós por ano, grupos do painel
    store.ts, state.ts, persist.ts   estado e localStorage
    scene.ts               céu e mar pintados em canvas
  styles/                  tokens, global, header, rail, timeline, panel
scripts/                   pipeline de coleta (Python, só biblioteca padrão)
docs/                      fontes de dados e revisões
```

## Funcionalidades a preservar

**Linha horizontal**
- Na ordem da história, a linha é um eixo com todos os anos, do primeiro registro até o presente. Os anos vazios ficam comprimidos numa régua fina.
- Cada ano com acontecimentos é um nó só, com selo de contagem. É um disco se tiver marco (importância 3) e um traço com o ano em pílula se não tiver. Os discos alternam em cima e embaixo.
- A etiqueta do traço aparece ao passar o mouse **e ao focar pelo teclado**.
- Eras são mastros com bandeira; sagas são pílulas abaixo da linha.
- Navegação:
  - arrastar com o mouse ou com o toque nativo;
  - setas laterais por ano, que somem com `pointer: coarse`;
  - rolagem vertical convertida em horizontal;
  - setas do teclado entre os nós;
  - "Ir para" no rail.
- Só é renderizado o que está perto da área visível (±600px).

**Painel do ano** (substitui o popup)
- Cabeçalho com o ano no Círculo Marítimo e a era. Abaixo, as sagas e a contagem.
- Lista completa daquele ano, empilhada. Respeita o Foco e inclui o que o zoom tira da linha.
- Detalhe do evento escolhido: título, data, capítulo, episódio, resumo, mais detalhes e temas. A seção **"Detalhes"** (calendários, fontes, confiança, divergências, status) fica sempre aberta.
- "Ano anterior" e "Próximo ano" trocam de ano e pulam os anos inteiramente protegidos.

**Controles**
- Ordem: **história** (cronológica) ou **publicação** (por capítulo, agrupando por ano dentro de cada saga).
- Zoom: Eras, Marcos, Eventos, Tudo.
- Foco por tema (Chapéus de Palha, Marinha e Governo, Grandes piratas, Passado).
- Três temas visuais (Mar azul, Mar dourado, Céu estrelado).
- **Proteção de spoilers** por saga/arco, por capítulo ou por episódio do anime.
  - Eventos posteriores (ou sem capítulo) viram "Além do horizonte", e sagas ocultas viram "Mar ainda não navegado".
  - **O texto real não pode ir para o DOM** de um evento oculto, nem para o painel. Os componentes só recebem os modelos censurados de `spoilers.ts` e `modal.ts`.

## Modelo de dados

Cada evento em `events.json`:

| campo | significado |
|---|---|
| `id` | identificador estável |
| `saga` | id da saga (a era vem da saga) |
| `imp` | 3 marco, 2 evento, 1 detalhe |
| `kind` | tipo: nascimento, morte, batalha, guerra, fundacao, descoberta, fruta, recompensa, governo, viagem, incidente, outro |
| `canon` | manga, sbs, databook, anime-only, filler, filme, novel |
| `date` | quando aconteceu: `ago` (anos antes do presente pós-timeskip), `agoEnd` (fim de intervalo), `month`/`day`, `precision`, `conf` (exata, estimada, inferida), `seq` (desempate no mesmo ano) |
| `revealed` | quando o leitor descobre: `ch` (null se desconhecido), `approx`, `ep`. É a trava de spoilers e a ordem de publicação |
| `tags` | ids de tags |
| `title`, `sum`, `more` | textos próprios, escritos pelo autor do site |
| `src` | fontes estruturadas (`type`, `ref`, `page`, `url`, `rev`) |
| `conflicts` | divergências entre fontes (`note`, `src`) |
| `verified` | `false` por padrão. Só eventos verificados saem do modo rascunho |

**Calendários (SBS vol. 113):** presente pós-timeskip = Círculo Marítimo 1541 = Era do Céu 4131. Os anos são derivados de `date.ago` em `src/lib/calendar.ts`; nunca digite anos de calendário no JSON. Detalhes e fontes em `docs/fontes-de-dados.md`.

Já feito: `src` estruturado, episódio do anime (`revealed.ep`) e `canon`, campo `verified` e calendários derivados (Círculo Marítimo e Era do Céu).

Ainda previsto:
1. Verificar os eventos no mangá e marcar `verified: true`.
2. Criar uma tabela episódio → capítulo, para que a trava por episódio funcione também em eventos sem `ep`.
3. Pensar em personagens e locais como entidades ligadas aos eventos (filtros por personagem e ilha).

## Dados e fontes

- Fontes: Fandom (One Piece Wiki), mangá, databooks, SBS e registros oficiais.
- **O Fandom é CC BY-SA.** Se reaproveitar texto dele, é preciso atribuição e mesma licença. A decisão atual é **escrever resumos próprios** e usar o wiki só como pista, citando a fonte.
- Pipeline em Python (`scripts/`): coleta via API MediaWiki do Fandom, gera **rascunhos** em JSON. Todo evento passa por revisão manual antes de `verified: true`.
- Fontes divergem (teoria misturada com fato, mangá vs. anime). Em conflito, prevalece fonte oficial; registrar a divergência no campo de detalhes.
- Capítulos marcados com `approx: true` são aproximados e **precisam ser conferidos** antes de `verified: true`.
- Cada lote revisado ganha um registro em `docs/` (exemplo: `docs/revisao-era-do-vazio.md`).

## Direitos autorais (regra inegociável, o site será público)

- **Não usar** panels, capas, artes, logos, frames do anime nem imagens baixadas de qualquer fonte.
- Ícones, ilustrações e as cenas dos temas são **originais e genéricos**, desenhados em código. Evitar símbolos reconhecíveis da obra (bandeiras pirata, silhuetas de personagens, navios conhecidos, brasões).
- Imagens de referência enviadas pelo dono servem só de inspiração: não são usadas nem copiadas.
- Textos são resumos próprios, curtos. Não copiar trechos do mangá, do anime ou do wiki.
- Rodapé permanente: projeto de fã sem fins oficiais; One Piece pertence a Eiichiro Oda, Shueisha e Toei Animation.

## Design

Sistema **"Céu e Mar"**. A fonte da verdade é o `DESIGN.md`; este resumo serve só de orientação. O `prototype.html` não é mais referência: o comportamento esperado está em "Funcionalidades a preservar".

- **Tese:** a linha do tempo é um cabo esticado no céu, e o ano escolhido desce para um painel que boia sobre o mar. O tema escolhe a hora do dia.
- **Três temas** (`:root[data-theme]`), pintados em canvas por `src/lib/scene.ts`, sem nenhuma imagem baixada:
  - `azul`: claro, dia, destaque vermelho `#d2361d`;
  - `ouro`: escuro, fim de tarde, destaque ouro `#ffc23a`;
  - `estrelas`: escuro, noite com lua crescente, destaque `#ffd36b`.
  - O tema padrão segue `prefers-color-scheme` e a escolha fica salva em `op-timeline:theme`.
- **Tokens** em `src/styles/tokens.css`, por tema: `--sky-*`, `--sea-*`, `--ink`, `--muted`, `--paper` (translúcido), `--paper-solid`, `--line`, `--line-ink`, `--accent`, `--on-accent`, `--select` e `--shade`. Não existem cores por saga.
- **Fontes** self-hosted via fontsource: **Dela Gothic One** só em títulos curtos e **Archivo** (variável) no resto, com números tabulares (`.num`).
- **Regras:**
  - só uma cor plena por tela, o destaque;
  - painéis, filtros e pílulas são papel translúcido com desfoque, sem cartões aninhados;
  - a haste mostra a confiança da data: cheia para exata, fina para estimada, tracejada para inferida e pontilhada quando oculta;
  - texto sobre o céu sempre fica em pílula de papel.
- **Linha (ordem da história):** um eixo com todos os anos, do primeiro registro até o presente.
  - Cada ano com acontecimentos é **um nó só**: disco, se tiver marco, ou traço com o ano em pílula. Um selo mostra a contagem.
  - Os anos vazios viram uma régua fina de 3px por ano.
  - As eras são mastros com bandeira, e as sagas são pílulas abaixo da linha.
- **Painel por ano** (substitui o popup):
  - mostra a lista completa do ano, empilhada;
  - o detalhe do evento tem a seção "Detalhes" (fontes, confiança, status) sempre aberta;
  - "Ano anterior" e "Próximo ano" trocam de ano.
- **Movimento:** os discos surgem com a rolagem (`animation-timeline: view()`) e a troca de tema abre em círculo. Com `prefers-reduced-motion`, a cena pinta um quadro só.

## Qualidade

- Acessibilidade: tudo operável pelo teclado, foco visível, `aria-label` nos pontos, `prefers-reduced-motion` desliga animações, contraste legível.
- Responsivo: a vista horizontal precisa funcionar em celular com toque (arrastar nativo, sem setas laterais).
- Performance: o site deve continuar leve com centenas de eventos. A linha já renderiza só o que está perto da área visível.
- Nenhuma dependência de rede: as fontes são self-hosted via fontsource.
- Testes: testes unitários para ordenação, filtros, spoilers, painel e layout (Vitest), e validação de schema dos JSONs no build. Rode `npm test`, `npm run check` e `npm run build` antes de commitar.
- Git: trabalho em branch e PR para a `main`, nunca commit direto na `main`, porque o push na `main` publica o site.

## Próximos passos

1. Revisar e mesclar o redesign "Céu e Mar" (branch `redesign/ceu-e-mar`).
2. Revisar East Blue a partir de `scripts/drafts/s_east.json`, depois as demais sagas.
3. Começar a marcar `verified: true` nos eventos conferidos no mangá.
4. Atravessar mais rápido os séculos vazios: hoje a linha tem uns 15 mil px só de anos sem registro.
5. Testar com leitor de tela.

## Sobre o dono

Lucas trabalha com análise de produto em comércio exterior, desenvolve em VBA e Python e estuda Engenharia de Software. Python é a linguagem natural para os scripts de coleta.
