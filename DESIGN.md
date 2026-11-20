---
name: Linha do Tempo de One Piece
description: A história do mundo como registro de transmissões de Den Den Mushi, sintonizado por um dial.
colors:
  telex-paper: "#ecebe6"
  paper-surface: "#f7f6f2"
  carbon-ink: "#16150f"
  graphite-ink: "#3b3932"
  dust-muted: "#5d5a52"
  faint-tick: "#c4c1b7"
  hairline: "#d6d3ca"
  signal-red: "#c0371b"
  on-signal: "#ffffff"
  static-bg: "#d3d0c7"
  static-ink: "#6f6c63"
  ghost: "rgb(22 21 15 / .055)"
  fill: "rgb(22 21 15 / .07)"
  fill-2: "rgb(22 21 15 / .11)"
  night-broadcast: "#0f0f11"
  night-surface: "#18181b"
  bone-ink: "#ebe6da"
  bone-ink-2: "#c4beb1"
  night-muted: "#9a958a"
  night-faint: "#3a3935"
  night-hairline: "#2a2a2d"
  signal-ember: "#ee6c4c"
  on-signal-night: "#160904"
  night-static-bg: "#5b5954"
  night-static-ink: "#8b877d"
  night-ghost: "rgb(235 230 218 / .05)"
  night-fill: "rgb(235 230 218 / .08)"
  night-fill-2: "rgb(235 230 218 / .13)"
typography:
  display-ghost:
    fontFamily: "'Archivo Variable', 'Arial Narrow', sans-serif"
    fontSize: "clamp(7rem, 22vh, 12rem)"
    fontWeight: 850
    lineHeight: 0.85
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 62"
  headline:
    fontFamily: "'Archivo Variable', 'Arial Narrow', sans-serif"
    fontSize: "clamp(2.2rem, 6vw, 3.3rem)"
    fontWeight: 780
    lineHeight: 0.92
    letterSpacing: "-0.012em"
    fontVariation: "'wdth' 66"
  title-marco:
    fontFamily: "'Archivo Variable', 'Arial Narrow', sans-serif"
    fontSize: "clamp(1.7rem, 3.6vh, 2.15rem)"
    fontWeight: 750
    lineHeight: 0.93
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 68"
  title-marco-tuned:
    fontFamily: "'Archivo Variable', 'Arial Narrow', sans-serif"
    fontSize: "clamp(2.4rem, 5.4vh, 3.3rem)"
    fontWeight: 750
    lineHeight: 0.93
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 68"
  title:
    fontFamily: "'Archivo Variable', 'Arial Narrow', sans-serif"
    fontSize: "1.65rem"
    fontWeight: 750
    lineHeight: 1
    fontVariation: "'wdth' 72"
  station:
    fontFamily: "'Archivo Variable', 'Arial Narrow', sans-serif"
    fontSize: "0.98rem"
    fontWeight: 650
    lineHeight: 1.1
    fontVariation: "'wdth' 80"
  body:
    fontFamily: "'Archivo Variable', system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  body-lead:
    fontFamily: "'Archivo Variable', system-ui, sans-serif"
    fontSize: "1.12rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Archivo Variable', system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 550
    lineHeight: 1.2
  data:
    fontFamily: "'Martian Mono Variable', ui-monospace, monospace"
    fontSize: "0.72rem"
    fontWeight: 400
    letterSpacing: "0"
    fontFeature: "'tnum'"
    fontVariation: "'wdth' 87"
rounded:
  static: "4px"
  check: "5px"
  row: "8px"
  control: "10px"
  sheet: "14px"
  card: "16px"
  bottom-sheet: "18px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "22px"
  xxl: "28px"
  gutter: "clamp(16px, 4vw, 48px)"
  touch: "44px"
components:
  button-primary:
    backgroundColor: "{colors.carbon-ink}"
    textColor: "{colors.telex-paper}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  button-quiet:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  button-quiet-hover:
    backgroundColor: "{colors.fill-2}"
  pill:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.carbon-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  pill-hover:
    backgroundColor: "{colors.fill-2}"
  icon-button:
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.pill}"
    size: "44px"
  icon-button-hover:
    backgroundColor: "{colors.ghost}"
  field:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "44px"
  tag:
    backgroundColor: "{colors.telex-paper}"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
  sheet:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.sheet}"
    padding: "22px 22px 18px"
    width: "min(380px, calc(100vw - 32px))"
  transmission-card:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.card}"
    padding: "0 28px 8px"
    width: "min(640px, 100%)"
  tooltip:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
---

# Design System: Linha do Tempo de One Piece

## Overview

**Creative North Star: "Transmissões do Den Den Mushi"**

A história do mundo chega como um registro de transmissões recebidas em ordem. O visitante sintoniza um dial; uma cabeça de leitura fixa no centro da tela "recebe" o marco que passa por ela. O sistema é feito de duas tintas e um sinal: no tema claro, papel frio de fita de telex com tinta quase preta; no tema escuro, uma transmissão noturna com tinta cor de osso. A cor plena existe só para o sinal, que marca estado: o que está sintonizado, onde a agulha está, o que está ligado, onde está o foco, o que deu erro.

Não há caixas em volta do conteúdo. A fita é uma linha, os marcos pendem dela por hastes, as eras são nomes enormes e apagados no fundo, e o agrupamento acontece por espaço e profundidade, não por bordas. Linhas existem, mas como instrumentos do mundo (fita, haste, escala do dial, faixa de frequência da saga), nunca como molduras de cartão. Só o que flutua (painéis, etiqueta, folha de transmissão) ganha superfície e sombra.

O que o leitor ainda não alcançou não aparece: vira estática gerada (ruído `feTurbulence`) e a frase "Sinal fora de alcance". O vocabulário visual é original e genérico; o único glifo da casa é a espiral de recepção, desenhada para o site.

**Key Characteristics:**
- Dois temas completos via `:root[data-theme]`, com fallback para `prefers-color-scheme` sem JavaScript.
- Um único acento (o sinal), reservado a estado e à marca.
- Archivo condensado nos títulos, Archivo normal no corpo, Martian Mono só para dados.
- Sem caixas, bordas ou divisórias no conteúdo; profundidade por nomes-fantasma de era.
- Confiança da data codificada no traço da haste.
- Spoiler como estática, nunca como texto borrado ou cadeado.
- Movimento de recepção: o texto se resolve da estática, uma vez por marco.

## Colors

Monocromia quente-fria com um sinal vermelho; cada token existe em duas tintas (claro e escuro) e troca inteiro com o tema.

### Primary
- **Vermelho de Sinal** (signal-red no claro, signal-ember no escuro): o marco sintonizado (haste, nó, data, espiral), a agulha do dial, a cabeça de leitura, o sublinhado do segmento ativo, o LED do controle "Li até" quando ligado, interruptores e caixas marcadas, o anel de foco, mensagens de erro e campo inválido, a data na folha de transmissão e a espiral da marca. Texto sobre ele usa on-signal / on-signal-night.

### Neutral
- **Papel de Telex** (telex-paper) / **Transmissão Noturna** (night-broadcast): fundo da página; também o fundo das etiquetas de tema e do trilho dos segmentos dentro de painéis.
- **Superfície** (paper-surface / night-surface): só para camadas que flutuam: painéis, etiqueta do evento menor, folha de transmissão, polegar do interruptor.
- **Tinta de Carbono** (carbon-ink) / **Tinta de Osso** (bone-ink): texto principal, a fita, títulos sintonizados, botão primário.
- **Grafite** (graphite-ink / bone-ink-2): títulos de marco fora da cabeça de leitura, nomes de saga, texto de detalhes.
- **Poeira** (dust-muted / night-muted): metadados, datas fora de sintonia, resumos de marco, legendas, marcas de escala maiores.
- **Traço Fraco** (faint-tick / night-faint): escala fina do dial, botões desabilitados, trilho do interruptor desligado, barra de rolagem.
- **Fio** (hairline / night-hairline): só como o fio de 1px que fecha a sombra das camadas flutuantes.
- **Fantasma** (ghost / night-ghost): nomes de era no fundo, janela do dial, hover de áreas transparentes.
- **Preenchimento** (fill, fill-2 e variantes noturnas): o fundo tonal de controles (pílulas, campos, botão discreto) e seu hover.
- **Estática** (static-bg, static-ink e variantes noturnas): base do ruído de spoiler e a marca oculta sintonizada.

### Named Rules
**The Two Inks and a Signal Rule.** Tudo é tinta sobre papel em dois tons; a única cor plena é o sinal. Nenhuma saga, era ou tema ganha cor própria.

**The Signal Is State Rule.** O sinal marca estado (sintonizado, selecionado, ligado, foco, erro) e a marca. Ele nunca preenche uma superfície grande nem decora texto corrido.

**The Theme Pair Rule.** Todo token novo nasce com o par claro e escuro em `tokens.css`; nenhum valor de cor fica fixo num componente.

## Typography

**Display Font:** Archivo Variable condensado (eixo `wdth` de 62% a 80%), com fallback 'Arial Narrow'
**Body Font:** Archivo Variable em largura normal, com fallback system-ui
**Label/Mono Font:** Martian Mono Variable (`wdth` 87%, algarismos tabulares), com fallback ui-monospace

**Character:** Uma só família em duas larguras: condensada e pesada como manchete de telex nos títulos, aberta e calma no corpo. O mono é a voz da máquina: só dados.

### Hierarchy
- **Display fantasma** (850, clamp(7rem,22vh,12rem), 0.85, `wdth` 62): nome da era, no fundo, na cor fantasma. É desenho, não texto lido; o título legível fica ao lado.
- **Headline** (780, clamp(2.2rem,6vw,3.3rem), 0.92, `wdth` 66): título da folha de transmissão.
- **Título de marco** (750, clamp(1.7rem,3.6vh,2.15rem) e, sintonizado, clamp(2.4rem,5.4vh,3.3rem), 0.93, `wdth` 68): o título cresce ao passar pela cabeça de leitura.
- **Título** (750, 1.65rem, 1, `wdth` 72): nome legível da era, títulos de painel, marca.
- **Estação** (600–650, 0.86–0.98rem, `wdth` 80): estações do dial e nomes de saga.
- **Body** (400, 16px, 1.5): texto geral; resumo da folha em 1.12rem com máximo de 60ch; detalhes com 62ch.
- **Label** (550, 0.85–0.92rem): controles, rótulos de campo, segmentos.
- **Dados** (Martian Mono, 0.68–0.8rem, tabular): datas, capítulos, contagens, intervalos de era, número digitado em "Li até".

### Named Rules
**The Mono Is Data Rule.** Martian Mono aparece só em datas, capítulos, contagens e no aviso de sinal oculto. Nunca em títulos ou rótulos de interface.

**The Condensed Headline Rule.** Títulos usam Archivo entre 62% e 80% de largura e peso 600–850; quanto maior o título, mais estreito.

## Layout

A vista principal é uma fita horizontal a cerca de 56% da altura da área de eventos (54% em celular), com uma cabeça de leitura vertical fixa no centro. Marcos alternam acima e abaixo, presos por hastes de 64px (48px em celular). Acima da fita, o dial ocupa a largura toda com as eras como estações; abaixo da área de eventos, uma barra com zoom, ordem e contagem à esquerda e setas à direita. A área de eventos tem altura entre 440px e 680px.

Margem lateral única para cabeçalho, dial, barra e rodapé: clamp(16px,4vw,48px). Alvos de toque têm 44px. O ritmo interno usa passos de 4, 8, 12, 16, 22 e 28px.

Em telas até 640px: o cabeçalho quebra em duas linhas (marca e tema; "Li até" e Temas ao alcance do polegar), o dial mostra só a estação atual, as setas somem (arrastar nativo), o resumo do marco cai para duas linhas, e painéis e a folha de transmissão viram folhas de baixo com cantos superiores arredondados e respeito à área segura. Em telas baixas (até 700px de altura), o resumo também cai para duas linhas.

## Elevation & Depth

Híbrido: o conteúdo da fita é plano e ganha profundidade por camadas tonais (nome-fantasma da era atrás, fita e hastes na frente, o marco sintonizado em tinta plena). Sombras existem apenas em camadas que flutuam sobre a fita, sempre como par: um fio de 1px na cor do fio mais uma sombra difusa na cor de sombra do tema.

### Shadow Vocabulary
- **Etiqueta** (`box-shadow: 0 1px 0 var(--hair), 0 10px 30px var(--shade)`): etiqueta do evento menor.
- **Painel** (`box-shadow: 0 1px 0 var(--hair), 0 18px 50px var(--shade)`): painéis "Li até" e Temas.
- **Folha** (`box-shadow: 0 1px 0 var(--hair), 0 30px 80px var(--shade)`): folha de transmissão.
- **Polegar** (`box-shadow: 0 1px 2px var(--shade)` / `0 1px 3px var(--shade)`): polegar do interruptor e segmento escolhido.

### Named Rules
**The Ghost Depth Rule.** Profundidade no conteúdo vem do nome de era enorme na cor fantasma atrás da fita, não de cartões, bordas ou sombras.

**The Float-Only Shadow Rule.** Só o que flutua (painel, etiqueta, folha) tem superfície e sombra. Nada preso à fita ganha sombra.

## Shapes

Formas macias e sem contorno. Controles são pílulas (999px); campos e áreas de clique de marco têm 10px; painéis 14px; a folha de transmissão 16px; folhas de baixo 18px só nos cantos superiores. Caixas de seleção 5px, blocos de estática 4–6px. Nenhum componente usa borda de contorno: estados de campo aparecem como anel interno de 1.5px (inválido em sinal) e caixas desmarcadas como anel interno na cor de poeira.

As linhas do mundo são os instrumentos: a fita (1px de tinta), a haste do marco, a escala do dial (marcas de 1px a cada 8px e marcas maiores a cada 64px) e a faixa da saga (régua em L de 1px, tracejada quando a saga está oculta). A haste carrega a confiança da data: exata em 2.5px cheia, estimada em 1px cheia, inferida em 1.5px tracejada, oculta em 1px pontilhada. A folha de transmissão repete o mesmo código num traço de 28px ao lado da data.

## Components

### Buttons
Tonais e silenciosos, sem contorno.
- **Shape:** pílula (999px), altura 44px.
- **Primary:** fundo de tinta, texto de papel, peso 600, 0 20px; hover reduz opacidade para 0.86.
- **Quiet:** fundo de preenchimento, texto de tinta; hover sobe para preenchimento 2.
- **Icon:** círculo transparente de 44px com traço SVG de 1.8px em 22px; hover em fantasma; desabilitado em traço fraco.
- **Focus:** anel de 2px no sinal com 3px de afastamento, em todo o site.

### Chips
- **Pílula de controle** (cabeçalho): preenchimento tonal, 40px de altura (44px em celular), peso 550; pode levar um contador (pílula de tinta com número) ou um LED de 9px com anel no sinal, preenchido quando a proteção está ligada.
- **Etiqueta de tema** (folha): pílula com fundo de página, texto grafite, 0.8rem, 3px 10px.

### Cards / Containers
- **Corner Style:** 14px (painel), 16px (folha), 10px (etiqueta).
- **Background:** superfície do tema.
- **Shadow Strategy:** ver Elevation & Depth; fio mais sombra difusa.
- **Border:** nenhuma.
- **Internal Padding:** 22px no painel, 28px laterais na folha (20px em celular), 8px 12px na etiqueta.

### Inputs / Fields
- **Style:** preenchimento tonal, sem borda, 10px de raio, 44px de altura; número em Martian Mono; cursor no sinal. O select usa seta desenhada em SVG.
- **Focus:** anel de 2px no sinal, afastamento 1px.
- **Error:** anel interno de 1.5px no sinal e mensagem em sinal, 0.82rem, peso 550.
- **Segmentos de painel:** trilho em pílula com fundo de página e 4px de respiro; opção escolhida sobe para superfície com sombra de polegar.
- **Interruptor:** trilho de 42×24px em traço fraco, sinal quando ligado; polegar desliza 18px.
- **Caixa de seleção:** 20px, anel interno de poeira; marcada, preenchida no sinal com visto em on-signal.

### Navigation
- **Cabeçalho:** marca à esquerda (espiral de 28px no sinal mais o nome em título condensado, segunda palavra em peso 450); à direita "Li até", Temas e alternância de tema.
- **Barra de zoom e ordem:** botões de texto sem fundo em poeira; ativo vira tinta com sublinhado de 2px no sinal que cresce da esquerda (escala, 420ms).
- **Dial:** escala de ponta a ponta, eras como estações com fio vertical, janela fantasma mostrando o trecho visível e agulha de 2px no sinal com cabeça de 10px; arrastar sintoniza (cursor ew-resize, agulha engrossa para 3px).

### Transmissão (marco)
O componente assinatura. Haste, nó de 10px (anel de 2px, vazio) e um bloco de texto clicável: título condensado, linha de dados com espiral de 14px, data e capítulo, e resumo de até três linhas. Fora da cabeça de leitura fica em grafite com haste a 55% de opacidade. Sintonizado: haste, nó, data e espiral no sinal, título em tinta e maior, resumo em grafite, e a espiral gira (2.4s, linear). A primeira vez que entra em cena, o texto se resolve da estática (760ms: desfoque e recorte que se abre, com uma varredura de ruído por cima). Oculto: título em mono "Sinal fora de alcance" e um bloco de estática de 180×42px.

### Marca (evento menor)
Traço vertical de 2px por 26px na fita (detalhe: 1.5px por 14px em poeira), dentro de um alvo de 44px. Hover, foco ou passagem pela cabeça de leitura: o traço cresce para 34px no sinal e a etiqueta flutuante aparece (título condensado e dados em mono). Oculta: bloco de estática de 6×18px.

### Folha de transmissão
Abre como uma tela que liga: recorte que se expande a partir de uma linha horizontal no meio (520ms) sobre um véu do fundo a 72%. Linha de era e saga em poeira, título em headline, data no sinal com o traço de confiança, resumo, detalhes, etiquetas e uma lista de fatos (rótulo de 9.5rem e valor). Navegação Anterior/Próximo no pé; ao trocar de evento o corpo se resolve de novo. Em celular é folha de baixo.

### Painéis
Popover nativo que sai do botão (Esc e clique fora fecham), entra com fade e deslocamento de 8px; em celular sobe de baixo (24px).

## Do's and Don'ts

### Do:
- **Do** usar o sinal só para estado (sintonizado, selecionado, ligado, foco, erro) e para a espiral da marca.
- **Do** definir cada cor nova em par, claro e escuro, em `tokens.css`, e referenciá-la por variável.
- **Do** codificar a confiança da data pelo traço: exata 2.5px cheia, estimada 1px cheia, inferida tracejada, oculta pontilhada.
- **Do** representar conteúdo além do capítulo lido como estática gerada (ruído `feTurbulence` em data URI) com "Sinal fora de alcance" ou "Frequência fora de alcance", sem o texto real no DOM.
- **Do** agrupar por espaço e por camadas tonais; usar linhas apenas como instrumentos (fita, haste, dial, faixa de saga).
- **Do** manter alvos de toque de 44px e a margem lateral clamp(16px,4vw,48px).
- **Do** desligar todo movimento sob `prefers-reduced-motion`: recepção, espiral girando, estática tremendo, abertura da folha, troca de tema por view transition, chamada do LED.
- **Do** desenhar ícones como traço SVG inline original (1.8px em 24px; espiral 2.6px em 32px).

### Don't:
- **Don't** colocar caixas, bordas de contorno ou divisórias em volta de conteúdo da fita ou da folha.
- **Don't** dar cor própria a sagas, eras ou temas; a paleta é tinta, papel e um sinal.
- **Don't** usar Martian Mono em títulos ou rótulos de interface, nem Archivo em largura normal em títulos.
- **Don't** pôr sombra em nada preso à fita.
- **Don't** usar panels, capas, artes, logos, frames ou símbolos reconhecíveis da obra (bandeiras pirata, silhuetas); o único glifo temático é a espiral original.
- **Don't** repetir a animação de recepção num marco que já foi recebido.
