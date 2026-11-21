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

A história do mundo é uma viagem: a linha do tempo é um cabo esticado de ponta a ponta no céu. Os marcos ficam pendurados nele como boias. O ano escolhido desce para um painel que boia sobre o mar. A página fica sempre no mesmo lugar sob o mesmo céu. O que muda é a hora do dia, que é o tema.

A composição vem do rascunho do dono no Figma: filtros à esquerda, controles no topo à direita, linha com marcas de régua, discos alternando em cima e embaixo e painel de detalhes embaixo, com os eventos do ano empilhados.

## Temas

São três céus, todos pintados em `src/lib/scene.ts`, sem nenhuma imagem baixada:

- **Mar azul** (`azul`, claro): dia aberto, cúmulos de topo branco e base azulada, banco de nuvens no horizonte, mar faiscando e uma gaivota genérica cruzando devagar. O destaque é vermelho de bandeira.
- **Mar dourado** (`ouro`, escuro): fim de tarde, sol encostado no horizonte, nuvens finas contra a luz e mar de escamas douradas que acendem e apagam. O destaque é ouro.
- **Céu estrelado** (`estrelas`, escuro): lua crescente com as pontas para cima e para a direita, que remete à lua da obra (pedido do dono) mas é desenhada como uma fase natural da lua, sem copiar brasão. Tem também caminho de luz no mar, nuvens noturnas e uma estrela cadente de vez em quando. O destaque é luz de lanterna.

O tema padrão segue `prefers-color-scheme`: claro vira `azul` e escuro vira `estrelas`. A escolha fica salva em `op-timeline:theme`. Os valores antigos `light` e `dark` são migrados.

As inspirações foram imagens de anime enviadas pelo dono. **Nenhuma delas é usada nem copiada.** Ficam fora personagens, navios reconhecíveis, bandeiras e qualquer silhueta da obra.

## Regras

1. **Só uma cor plena por tela: o destaque.** Ele marca o disco escolhido, o degrau escolhido, o LED do spoiler, as caixas marcadas e o foco. Todo o resto é tinta, papel e o próprio céu.
2. **O papel boia, não é cartão.** O painel, os filtros, as pílulas e as folhas usam `--paper` translúcido com desfoque, que funciona como um vidro de água. Nada de cartões aninhados.
3. **A haste conta a confiança da data**, com o mesmo código na linha e no painel: cheia para exata, fina para estimada, tracejada para inferida e pontilhada quando o evento está oculto.
4. **Evento oculto vira "Além do horizonte".** O disco fica tracejado, o título em itálico e nenhum texto real entra no DOM. Uma saga oculta vira "Mar ainda não navegado".
5. **Dela Gothic One só em títulos curtos.** Corpo, discos e dados ficam em Archivo, com números tabulares (`.num`).
6. **O texto sobre o céu sempre tem apoio.** Rótulos de saga e etiquetas ficam em pílulas de papel. Só a marca usa texto direto no céu, com sombra.
7. **O movimento acompanha a navegação.** Os discos surgem com a rolagem (`animation-timeline: view(inline)`), a lista do painel entra em cascata a cada ano novo e a troca de tema abre em círculo a partir do botão. Com `prefers-reduced-motion`, a cena pinta um quadro só e as animações somem.

## Componentes

- **Cabeçalho:** botão de filtros, marca (sol nascendo sobre ondas, desenho original), pílula de spoiler com LED, pílula "Foco" com contador e as três janelinhas de tema.
- **Mais filtros (rail):** ordem, quanto mostrar (Eras, Marcos, Eventos, Tudo), "Ir para" com as estações e o contador. Na área de trabalho é uma coluna recolhível. Com 900px ou menos vira gaveta com fundo escurecido.
- **Linha:** cabo de 3px em `--line`. Na ordem da história ela é um eixo de anos que vai do primeiro registro até o presente.
  - Cada ano com acontecimentos é **um nó só**. Se tiver marco, vira um disco com o marco legível mais importante. Se não tiver, vira um traço com o número do ano em pílula. Um selo mostra quantos acontecimentos o ano tem quando são mais de um.
  - Os anos vazios viram uma régua fina de 3px por ano, com um traço mais alto por década e um rótulo a cada 50 anos.
  - As eras são mastros com bandeira de ponta fendida.
  - As sagas são pílulas abaixo da linha.
  - As setas laterais somem com `pointer: coarse`.
- **Painel:**
  - Cabeçalho "Ano 1498 C.M. · era", e abaixo as sagas e a contagem.
  - Botões "Ano anterior" e "Próximo ano", que pulam os anos inteiramente protegidos.
  - O detalhe à esquerda tem título, data, capítulo e episódio, confiança, resumo, mais detalhes, temas e a seção "Detalhes" (fontes, confiança, status), sempre aberta.
  - À direita fica a lista completa daquele ano, empilhada e alinhada. Ela respeita o Foco, mas inclui o que o zoom tira da linha.
  - O bico no topo aponta para o centro da linha, onde fica o escolhido.

## Comportamento

- O painel mostra um **ano** de cada vez (`layout.groups`, chave `date.ago`).
- Clicar ou usar as setas do teclado na linha escolhe um evento. As setas laterais e os botões do painel trocam de ano.
- Quando a rolagem é do usuário e ele para, o painel passa para o marco mais perto do centro, mas só se ele for de outro ano.
