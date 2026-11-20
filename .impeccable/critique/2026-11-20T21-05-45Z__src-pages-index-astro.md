---
target: a linha do tempo e menus de filtro
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\lucas\\Desktop\\onepiece-timeline\\src\\pages\\index.astro"
target_fingerprint: "sha256:ef4351c96f8537bff71bba3d39a9a2ee8150279c8f3f59352fac9f741168fe17"
target_path: "C:\\Users\\lucas\\Desktop\\onepiece-timeline\\src\\pages\\index.astro"
timestamp: 2026-11-20T21-05-45Z
slug: src-pages-index-astro
---
# Crítica: linha do tempo e menus de filtro

Método: dual-agent (A: revisão de design · B: detector + navegador)

## Heurísticas (25/40, Aceitável)
1 Status 2 · 2 Mundo real 3 · 3 Controle 2 · 4 Consistência 3 · 5 Prevenção de erros 1 · 6 Reconhecimento 3 · 7 Eficiência 3 · 8 Estética 3 · 9 Recuperação 2 · 10 Ajuda 3

## Especificidade
A corda é autoral (trança, bandeiras, timões, barquinho, pergaminho). A barra de controles é padrão de dashboard SaaS e não fala a língua do mapa náutico.
Detector: CLI 0 achados. Navegador: desktop 6 (hint perto da borda e linha longa, Timeline.astro:19; rótulo de saga coberto pela seta ›; 2 kicker-above-heading nas bandeiras = falso positivo; banner clip-path/listras = falso positivo pelo brief). Mobile 3 (h1 desbalanceado; kicker; banner).

## Problemas prioritários
- [P1] Nomes de saga/era vazam spoilers (layout.ts:66-76, ribbon do modal, intro index.astro:11).
- [P1] Campo de capítulo sem validação nem persistência (Controls.astro:38, 96-103; nenhum localStorage).
- [P1] Barra sticky (~200px, controls.css:7) + trilha de 600px não cabem em ~900px; no zoom Eras as bandeiras somem sob a barra.
- [P2] Contador e navegação mentem: "33 de 48" não conta ocultos; Anterior/Próximo passam por ocultos; setas nunca desabilitam.
- [P2] Abertura vazia (nenhum marco na primeira tela) e mobile com experiência de desktop (dica fala em mouse/Tab, controles ocupam a 1ª tela, alvos de 36px).

## Personas
Alex: sem busca, sem deep link, redigita capítulo, filtros OU sem aviso, sem Limpar, "Zoom" não muda escala.
Sam: parada extra em .hz-scroll com rótulo enganoso; medalhão sem aria-label (nome = resumo inteiro); aria-describedby do checkbox só repete "Spoilers"; anúncio do contador errado com spoiler.
Casey: controles ocupam a 1ª tela e não são sticky no mobile; alvos 36px; sem rótulo por toque; dica de desktop.

## Menores
Seta › cobre rótulos; chip pressionado pouco distinto; .seg sem hover; input desabilitado opacity .4 mostra "100"; fatos do popup quebram em coluna estreita; "Status: rascunho" exposto; eras somem em ordem de publicação sem aviso; hover do medalhão sem equivalente em foco; cópia "desative a proteção" em vez de "aumente o capítulo"; h1 sem text-wrap: balance.

## Perguntas
1. Por que o spoiler é a última linha e não a primeira pergunta, com a corda terminando no capítulo do leitor?
2. Zoom que não muda escala é zoom?
3. Os controles precisam ser barra de formulário, ou cabem numa bússola que abre um pergaminho?
