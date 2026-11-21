# Linha do Tempo de One Piece

Site público e estático (Astro + TypeScript) com a linha do tempo do mundo de One Piece, em português do Brasil. Projeto de fã, sem fins oficiais.

Publicado em https://elbene.github.io/onepiece-timeline/.

## O que tem

- Uma linha horizontal com todos os anos, do primeiro registro até o presente. Cada ano com acontecimentos aparece como um nó só, com a contagem.
- Um painel que mostra o ano escolhido: a lista completa daquele ano e o detalhe de cada evento, com fontes e o grau de confiança da data.
- Ordem pela história ou pela publicação, e zoom por importância (Eras, Marcos, Eventos, Tudo).
- Proteção de spoilers por saga, por capítulo ou por episódio. O texto dos eventos ocultos nunca chega ao navegador.
- Três temas pintados em código: Mar azul, Mar dourado e Céu estrelado.

## Comandos

```bash
npm install
npm run dev      # servidor local em localhost:4321/onepiece-timeline/
npm test         # testes unitários (Vitest)
npm run check    # tipos (astro check)
npm run build    # gera ./dist (valida os JSONs com Zod)
```

O push na `main` publica o site no GitHub Pages pelo workflow `.github/workflows/deploy.yml`.

## Estrutura

- `src/data/`: `eras.json`, `sagas.json`, `events.json` e `tags.json`, validados no build por `src/lib/schema.ts`.
- `src/lib/`: calendários, ordenação, filtros, spoilers, layout da linha, estado e a cena em canvas, com testes.
- `src/components/`: cabeçalho, linha do tempo (rail, linha e painel do ano) e os nós da linha.
- `src/styles/`: tokens dos três temas e estilos por área.
- `scripts/`: pipeline Python que gera rascunhos a partir do wiki (veja `scripts/README.md`).
- `docs/`: fontes de dados e registros de revisão.
- `DESIGN.md`: o sistema visual "Céu e Mar". `PRODUCT.md` descreve o público e o propósito do site.
- `prototype.html`: o protótipo original, mantido só como histórico.

## Dados

- Cada evento guarda `date.ago` (quantos anos antes do presente pós-timeskip) e o site calcula os anos nos calendários Círculo Marítimo e Era do Céu (SBS vol. 113).
- `revealed` diz em que capítulo ou episódio o leitor descobre o evento.
- `src` é uma lista de fontes estruturadas.
- Só eventos com `verified: true` saem do modo rascunho.

## Direitos autorais

Os textos são resumos próprios, e as ilustrações são originais, desenhadas em código. Nenhuma imagem ou trecho da obra é usado. One Piece pertence a Eiichiro Oda, Shueisha e Toei Animation.
