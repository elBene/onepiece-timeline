# Linha do Tempo de One Piece

Site público (projeto pessoal, para publicar e divulgar) com a linha do tempo dos acontecimentos do mundo de One Piece. Idioma da interface e dos textos: **português do Brasil**.

## Estado atual

- `prototype.html`: protótipo em um único HTML (CSS + JS inline) com duas vistas. **É a referência visual e de comportamento.** Abra no navegador para ver.
- `data/*.json`: dados de exemplo extraídos do protótipo (3 eras, 12 sagas, 25 eventos, 4 tags). **Rascunho, não validado.**
- Decisão do dono: **a vista horizontal é a principal.** A vertical vira vista secundária (ou pode ser removida na primeira versão, se atrasar).

## Tarefa

Migrar o protótipo para um projeto de verdade, componentizado, versionado em Git e pronto para deploy estático.

### Stack sugerida (pode propor alternativa justificada)
- **Astro** + TypeScript, saída estática.
- Dados em JSON validado por schema (Zod), lido em build time. Nada de backend.
- Animações: CSS + JS puro primeiro. GSAP só se o ganho for claro.
- Deploy estático (Vercel, Netlify ou Cloudflare Pages).

### Estrutura esperada
```
src/
  components/   Timeline horizontal, EventMedallion, EventDot, EraFlag, SagaLabel, EventModal, Controls
  data/         eras.json, sagas.json, events.json, tags.json
  lib/          ordenação, filtros, spoilers, layout (cálculo de posição x)
  styles/       tokens + estilos globais
scripts/        pipeline de coleta (Python)
```

## Funcionalidades do protótipo a preservar

**Vista horizontal (principal)**
- Corda trançada atravessando a tela; eras são bandeiras em mastros; sagas são rótulos sob a corda.
- Eventos de importância 3 ("marcos") são medalhões em forma de timão com ícone, alternando em cima e embaixo, ligados à corda por linha pontilhada, com título, época e resumo curto.
- Eventos de importância 2 e 1 são bolinhas na corda. Etiqueta (nome, época, capítulo) aparece ao passar o mouse **e ao focar pelo teclado**.
- Clique em qualquer evento abre um popup em pergaminho: ribbon (era e saga), título, carimbo da época, resumo, detalhes, tags, fonte, confiança da data, status, botões Anterior/Próximo (também setas do teclado), Esc fecha, foco preso no popup, foco volta ao elemento de origem.
- Navegação: arrastar com mouse, setas laterais, rolagem vertical convertida em horizontal enquanto houver espaço, barra de progresso com barquinho.
- Elementos entram com animação suave ao aparecer na tela.

**Controles (valem para as duas vistas)**
- Ordem: **história** (cronológica) ou **publicação** (por capítulo).
- Zoom: Eras, Marcos, Eventos, Tudo.
- Filtro por tema (Chapéus de Palha, Marinha e Governo, Grandes piratas, Passado).
- **Proteção de spoilers:** o usuário informa o último capítulo lido. Eventos posteriores (ou sem capítulo) ficam ocultos. **O texto real não pode ir para o DOM** de um evento oculto, nem para o popup.

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

**Calendários (SBS vol. 113):** presente pós-timeskip = Círculo Marítimo 1541 = Era do Céu 4131. Os anos são derivados de `date.ago` em `src/lib/calendar.ts`; nunca digite anos de calendário no JSON. Detalhes e fontes em `docs/fontes-de-dados.md`.

Melhorias previstas, na ordem:
1. Trocar `src` (texto) por lista estruturada: tipo (mangá, anime, databook, SBS, wiki), referência (capítulo ou episódio) e URL quando houver.
2. Adicionar episódio do anime e marcar canon (mangá, anime, filler).
3. Adicionar campo `verified` (boolean). Só eventos verificados saem do modo rascunho.
4. ~~Definir um calendário in-universe real~~ Feito: `date.ago` + calendários derivados (Círculo Marítimo e Era do Céu).
5. Pensar em personagens e locais como entidades ligadas aos eventos (filtros por personagem e ilha).

## Dados e fontes

- Fontes: Fandom (One Piece Wiki), mangá, databooks, SBS e registros oficiais.
- **O Fandom é CC BY-SA.** Se reaproveitar texto dele, é preciso atribuição e mesma licença. A decisão atual é **escrever resumos próprios** e usar o wiki só como pista, citando a fonte.
- Pipeline em Python (`scripts/`): coleta via API MediaWiki do Fandom, gera **rascunhos** em JSON. Todo evento passa por revisão manual antes de `verified: true`.
- Fontes divergem (teoria misturada com fato, mangá vs. anime). Em conflito, prevalece fonte oficial; registrar a divergência no campo de detalhes.
- Os capítulos marcados com `approx: true` no JSON atual vieram de memória e **precisam ser conferidos**.

## Direitos autorais (regra inegociável, o site será público)

- **Não usar** panels, capas, artes, logos, frames do anime nem imagens baixadas de qualquer fonte.
- Ícones, medalhões e ilustrações são **originais e genéricos**. Evitar símbolos reconhecíveis da obra (bandeiras pirata dos personagens, silhuetas de personagens).
- Textos são resumos próprios, curtos. Não copiar trechos do mangá, do anime ou do wiki.
- Rodapé permanente: projeto de fã sem fins oficiais; One Piece pertence a Eiichiro Oda, Shueisha e Toei Animation.

## Design

Mapa náutico noturno. Tokens do protótipo:
- `--bg #0a1b28`, `--bg2 #102a3b`, `--ink #efe4cb`, `--muted #9fb1ba`, `--gold #e3aa2c`, `--red #e0502f`, `--sea #3b8aa3`, `--line #27475a`, `--card #12303f`
- Títulos: **Pirata One**. Corpo: **Hanken Grotesk**.
- Cada saga tem uma cor da paleta (medalhões, linhas e bolinhas herdam a cor da saga). Cada era tem cor de bandeira própria.
- Popup em pergaminho (tinta escura sobre fundo areia, borda rasgada via `clip-path`, carimbo vermelho para a época).
- Ondas animadas no fundo (canvas).

## Qualidade

- Acessibilidade: tudo operável pelo teclado, foco visível, `aria-label` nos pontos, `prefers-reduced-motion` desliga animações, contraste legível.
- Responsivo: a vista horizontal precisa funcionar em celular com toque (arrastar nativo, sem setas laterais).
- Performance: o site deve continuar leve com centenas de eventos (virtualizar ou renderizar só o que está perto da área visível, se necessário).
- Nenhuma dependência de rede além das fontes do Google (idealmente self-host).
- Testes: ao menos testes unitários para ordenação, filtros, spoilers e layout; validação de schema dos JSONs no build.

## Primeiros passos sugeridos

1. Criar o projeto Astro, copiar `data/*.json` para `src/data/` e criar o schema Zod.
2. Portar a vista horizontal para componentes, com visual idêntico ao `prototype.html`.
3. Portar controles, spoilers e popup.
4. Configurar deploy estático e publicar uma versão de teste.
5. Criar o pipeline Python de coleta e começar a expandir e verificar os dados (primeiro Era do Vazio e East Blue, depois as demais sagas).
6. Decidir se a vista vertical entra na primeira versão.

## Sobre o dono

Lucas trabalha com análise de produto em comércio exterior, desenvolve em VBA e Python e estuda Engenharia de Software. Python é a linguagem natural para os scripts de coleta.
