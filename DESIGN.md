---
name: Linha do Tempo de One Piece
description: A linha do tempo como um cabo esticado no céu, com o painel de detalhes boiando sobre o mar. Três céus pintados em código.
colors:
  azul-sky-1: "#2c77c9"
  azul-sky-2: "#6fb1e8"
  azul-sky-3: "#cfe8f7"
  azul-sea-1: "#4fa9de"
  azul-sea-2: "#1b6db4"
  azul-sea-3: "#0b4a87"
  azul-ink: "#0c2338"
  azul-muted: "#4c6478"
  azul-paper: "#f7fafc"
  azul-line: "#0c2338"
  azul-accent: "#d2361d"
  ouro-sky-1: "#2a1204"
  ouro-sky-2: "#9a4a0c"
  ouro-sky-3: "#f4b43a"
  ouro-sea-2: "#2b1503"
  ouro-ink: "#fbecc8"
  ouro-muted: "#c6aa76"
  ouro-paper: "#1e0f04"
  ouro-line: "#ffe7a6"
  ouro-accent: "#ffc23a"
  estrelas-sky-1: "#03081c"
  estrelas-sky-2: "#0d1a44"
  estrelas-sky-3: "#22386f"
  estrelas-sea-2: "#08122e"
  estrelas-ink: "#e6ecff"
  estrelas-muted: "#94a2c8"
  estrelas-paper: "#070d22"
  estrelas-line: "#d5defb"
  estrelas-accent: "#ffd36b"
typography:
  display:
    fontFamily: "'Dela Gothic One', 'Archivo Variable', sans-serif"
    fontWeight: 400
    use: "marca, cabeçalho do painel, título do evento, bandeiras de era, títulos das folhas"
  body:
    fontFamily: "'Archivo Variable', system-ui, sans-serif"
    fontSize: "16px"
    lineHeight: 1.5
  disc-title:
    fontFamily: "'Archivo Variable', system-ui, sans-serif"
    fontSize: "clamp(.7rem, 1.55vh, .8rem)"
    fontWeight: 750
    fontStretch: "92%"
    lineHeight: 1.12
rounded:
  pill: "999px"
  panel: "24px"
  rail: "22px"
  sheet: "20px"
  step: "14px"
motion:
  ease-out: "cubic-bezier(.16, 1, .3, 1)"
  ease-spring: "cubic-bezier(.34, 1.4, .64, 1)"
---

# Céu e Mar

## Tese

A história do mundo é uma viagem: a linha do tempo é um cabo esticado de ponta a ponta no céu. Os marcos ficam pendurados nele como boias. O trecho escolhido desce para um painel que boia sobre o mar. A página fica sempre no mesmo lugar sob o mesmo céu. O que muda é a hora do dia, que é o tema.

A composição vem do rascunho do dono no Figma: filtros à esquerda, controles no topo à direita, linha com marcas de régua, discos alternando em cima e embaixo e painel de detalhes embaixo, com os eventos em escada.

## Temas

São três céus, todos pintados em `src/lib/scene.ts`, sem nenhuma imagem baixada:

- **Mar azul** (`azul`, claro): dia aberto, cúmulos de topo branco e base azulada, banco de nuvens no horizonte, mar faiscando e uma gaivota genérica cruzando devagar. O destaque é vermelho de bandeira.
- **Mar dourado** (`ouro`, escuro): fim de tarde, sol encostado no horizonte, nuvens finas contra a luz e mar de escamas douradas que acendem e apagam. O destaque é ouro.
- **Céu estrelado** (`estrelas`, escuro): lua cheia com crateras discretas, caminho de luz no mar, nuvens noturnas iluminadas por cima e uma estrela cadente de vez em quando. O destaque é luz de lanterna.

O tema padrão segue `prefers-color-scheme`: claro vira `azul` e escuro vira `estrelas`. A escolha fica salva em `op-timeline:theme`. Os valores antigos `light` e `dark` são migrados.

As inspirações foram imagens de anime enviadas pelo dono. **Nenhuma delas é usada nem copiada.** Ficam fora personagens, navios reconhecíveis, bandeiras e qualquer silhueta da obra.

## Regras

1. **Só uma cor plena por tela: o destaque.** Ele marca o disco escolhido, o degrau escolhido, o LED do spoiler, as caixas marcadas e o foco. Todo o resto é tinta, papel e o próprio céu.
2. **O papel boia, não é cartão.** O painel, os filtros, as pílulas e as folhas usam `--paper` translúcido com desfoque, que funciona como um vidro de água. Nada de cartões aninhados.
3. **A haste conta a confiança da data**, com o mesmo código na linha e no painel: cheia para exata, fina para estimada, tracejada para inferida e pontilhada quando o evento está oculto.
4. **Evento oculto vira "Além do horizonte".** O disco fica tracejado, o título em itálico e nenhum texto real entra no DOM. Uma saga oculta vira "Mar ainda não navegado".
5. **Dela Gothic One só em títulos curtos.** Corpo, discos e dados ficam em Archivo, com números tabulares (`.num`).
6. **O texto sobre o céu sempre tem apoio.** Rótulos de saga e etiquetas ficam em pílulas de papel. Só a marca usa texto direto no céu, com sombra.
7. **O movimento acompanha a navegação.** Os discos surgem com a rolagem (`animation-timeline: view(inline)`), o painel desce em escada a cada trecho novo e a troca de tema abre em círculo a partir do botão. Com `prefers-reduced-motion`, a cena pinta um quadro só e as animações somem.

## Componentes

- **Cabeçalho:** botão de filtros, marca (sol nascendo sobre ondas, desenho original), pílula de spoiler com LED, pílula "Foco" com contador e as três janelinhas de tema.
- **Mais filtros (rail):** ordem, quanto mostrar (Eras, Marcos, Eventos, Tudo), "Ir para" com as estações e o contador. Na área de trabalho é uma coluna recolhível. Com 900px ou menos vira gaveta com fundo escurecido.
- **Linha:** cabo de 3px em `--line`.
  - Os marcos são discos com nome e ano.
  - Os eventos menores são marcas de régua, com etiqueta no hover, no foco e na seleção.
  - As eras são mastros com bandeira de ponta fendida.
  - As sagas são pílulas abaixo da linha.
  - As setas laterais somem com `pointer: coarse`.
- **Painel:**
  - Cabeçalho com a época do marco e a era, e abaixo a saga e a contagem.
  - Botões Anterior e Próximo, que percorrem só os eventos legíveis.
  - O detalhe à esquerda tem título, data, capítulo e episódio, confiança, resumo, mais detalhes, temas e "Fontes e confiança" em um `<details>`.
  - A escada à direita tem os eventos do trecho em degraus.
  - O bico no topo aponta para o centro da linha, onde fica o escolhido.

## Comportamento

- Um **trecho** é um marco mais os eventos menores que vêm depois dele, sem atravessar saga (`layout.groups`).
- Clicar, usar as setas do teclado ou usar Anterior e Próximo escolhe o evento e o centraliza.
- Quando a rolagem é do usuário e ele para, o painel passa para o marco mais perto do centro, mas só se for de outro trecho.
