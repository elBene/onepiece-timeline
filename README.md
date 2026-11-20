# Linha do Tempo de One Piece

Site público e estático (Astro + TypeScript) com a linha do tempo do mundo de One Piece, em português do Brasil. Projeto de fã, sem fins oficiais.

## Comandos

```bash
npm install
npm run dev      # servidor local em localhost:4321
npm test         # testes unitários (Vitest)
npm run check    # tipos (astro check)
npm run build    # gera ./dist (valida os JSONs com Zod)
```

## Estrutura

- `src/data/`: `eras.json`, `sagas.json`, `events.json`, `tags.json`, validados por `src/lib/schema.ts` no build.
- `src/lib/`: ordenação, filtros, spoilers, layout e popup (com testes).
- `src/components/`: timeline horizontal, controles, popup, ondas.
- `scripts/`: pipeline Python que gera rascunhos a partir do wiki (ver `scripts/README.md`).
- `prototype.html`: protótipo de referência visual.

## Dados

Cada evento tem `src`, uma lista de fontes `{ type, ref, url? }` com `type` em `manga`, `anime`, `databook`, `sbs` ou `wiki`. Só eventos com `verified: true` saem do modo rascunho.

Os textos são resumos próprios; nenhuma imagem ou trecho da obra é usado. One Piece pertence a Eiichiro Oda, Shueisha e Toei Animation.
