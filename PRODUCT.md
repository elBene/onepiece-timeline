# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dois públicos com o mesmo peso:

- **Fã no meio da leitura ou do anime.** Quer se situar na história do mundo sem tomar spoiler. Volta ao site de tempos em tempos, à medida que avança.
- **Fã veterano de lore.** Já está em dia e quer a cronologia completa do mundo, com datas, fontes e divergências entre fontes.

Idioma: português do Brasil. Uso em desktop e celular (toque).

## Product Purpose

Mostrar, numa única linha do tempo horizontal, os acontecimentos do mundo de One Piece, da Antiguidade ao presente da obra, em ordem cronológica do mundo ou em ordem de publicação. Sucesso: o leitor encontra onde um acontecimento se encaixa na história sem ser exposto a nada além do ponto em que parou.

## Positioning

Uma cronologia do mundo (não um guia de episódios) que respeita o ponto de leitura de cada visitante: a proteção de spoiler esconde o conteúdo real dos eventos posteriores, sem mandá-lo ao navegador. Datas derivadas dos calendários oficiais (SBS vol. 113), cada evento com fonte estruturada e grau de confiança.

## Operating Context

- Site estático (Astro + TypeScript), dados em JSON validados por Zod no build, sem backend. Publicado no GitHub Pages em `/onepiece-timeline`.
- Dados coletados por pipeline Python a partir do wiki (Fandom) como pista, revisados à mão. Só eventos com `verified: true` saem do modo rascunho.
- Projeto pessoal de fã, para publicar e divulgar.

## Capabilities and Constraints

Preservar no redesign (confirmado pelo dono):
- A linha do tempo é **horizontal**, rolando de lado.
- Alternância **história** (cronológica) / **publicação** (por capítulo).
- **Zoom por importância**: Eras, Marcos, Eventos, Tudo.
- No detalhe do evento: **fontes, confiança da data e status** visíveis.
- Filtro por tema (tags).
- Proteção de spoilers: texto de evento oculto nunca vai para o DOM nem para o popup.

Proteção de spoiler, modelo desejado: o visitante informa até onde chegou **por saga/arco, ou por capítulo, ou por episódio do anime**. Episódio exige uma tabela de correspondência episódio → capítulo, que ainda não existe nos dados (eventos têm `revealed.ch` e `revealed.ep` opcionais).

Restrições técnicas: acessível pelo teclado, `prefers-reduced-motion`, leve com centenas de eventos (virtualização), nenhuma dependência de rede além de fontes self-hosted.

## Brand Commitments

- Nome: "Linha do Tempo de One Piece".
- **Direitos autorais (inegociável):** nenhum panel, capa, arte, logo, frame do anime ou imagem baixada. Ícones e ilustrações originais e genéricos; evitar símbolos reconhecíveis da obra (bandeiras pirata de personagens, silhuetas de personagens). Textos são resumos próprios e curtos.
- Rodapé permanente: projeto de fã sem fins oficiais; One Piece pertence a Eiichiro Oda, Shueisha e Toei Animation.

## Evidence on Hand

- `src/data/*.json`: 3+ eras, sagas, ~48 eventos, tags. Rascunho, ainda em verificação.
- `docs/fontes-de-dados.md`: calendários e fontes.
- Não há imagens, depoimentos ou números de audiência; nada disso deve ser inventado.

## Product Principles

1. Spoiler é confiança: nada além do ponto do leitor aparece, nem nomes de arco.
2. A cronologia do mundo vem primeiro; publicação é uma lente secundária.
3. Toda data mostra de onde veio e quão certa é.
4. Autoral sem copiar: a obra é evocada, nunca reproduzida.

## Accessibility & Inclusion

Operável pelo teclado com foco visível, `aria-label` nos pontos, contraste AA, `prefers-reduced-motion` desliga animações, alvos de toque de 44px no celular.
