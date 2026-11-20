---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: []
---

# Página principal: linha do tempo horizontal

Escopo: `src/pages/index.astro` e tudo que ela monta (cabeçalho, dial, fita, popup de evento, painéis de filtro e spoiler, rodapé). Modo: Experience (a cronologia é a obra; a interface recua), com controles tratados com rigor de Operate.

Público e tarefa: fã no meio da leitura e fã veterano de lore. Situar um acontecimento na história sem spoiler; explorar a cronologia inteira com fontes.

Restrições: linha horizontal, ordem história/publicação, zoom por importância, fontes e confiança visíveis no detalhe, spoiler por saga, capítulo ou episódio, nada de arte da obra, tema claro e escuro.

Decisões em aberto: tabela episódio→capítulo real (hoje derivada dos próprios eventos, de forma conservadora); capítulo final de cada arco nos dados.

## Direction contract

THESIS: A história do mundo como um registro de transmissões de Den Den Mushi recebidas em ordem, sintonizado por um dial. Recusa a timeline de cartões alternados numa linha central e o mapa náutico de pergaminho.

OWN-WORLD: Duas tintas e um sinal. Claro: papel de fita de telex frio (#ecebe6), tinta quase preta, sinal vermelho. Escuro: transmissão noturna (#0f0f11), tinta osso, o mesmo vermelho mais claro. Sem caixas, bordas ou divisórias; agrupamento por espaço e profundidade (nomes de era enormes e apagados no fundo). Archivo condensado nos títulos, Archivo normal no corpo, Martian Mono só para dados (datas, capítulos, contagens). Cor plena só nos marcos sintonizados. Confiança da data como traço da haste: exata cheia, estimada fina, inferida tracejada. Spoiler é estática (ruído animado) com "Sinal fora de alcance"; saga oculta vira "Frequência fora de alcance".

STORY: O visitante diz até onde chegou (saga, capítulo ou episódio), entende que só recebe o que já foi transmitido para ele, percorre a fita e abre uma transmissão para ler detalhes, fonte e confiança.

FIRST VIEWPORT: Topo: marca à esquerda; à direita "Li até ___" (controle principal), Temas e alternância de tema. Logo abaixo, o dial: escala fina de ponta a ponta com as eras como estações e uma agulha vermelha que mostra a posição; arrastar o dial sintoniza. Centro: a fita horizontal a ~55% da altura com marcos alternando acima e abaixo, título condensado grande, data em mono. Uma cabeça de leitura vertical fixa no centro: o marco sob ela fica "sintonizado" (vermelho, espiral de recepção). Rodapé da vista: zoom e ordem à esquerda, setas à direita, fora da área dos eventos.

FORM: Transmissões do Den Den Mushi, posição 7 da minha lista ordenada (sorteada). seed:5647079d5abdbdf8. Assinatura: sintonia pelo dial e cabeça de leitura que "recebe" o marco central; movimento de recepção (texto que se resolve da estática) uma vez por marco.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
