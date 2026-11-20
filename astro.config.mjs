// @ts-check
import { defineConfig } from 'astro/config';

// Publicação no GitHub Pages: https://elbene.github.io/onepiece-timeline/
// Se mudar de host (domínio próprio, Cloudflare, Netlify, Vercel), ajuste `site` e remova `base`.
export default defineConfig({
  site: 'https://elbene.github.io',
  base: '/onepiece-timeline',
  output: 'static',
});
