/**
 * Cena de fundo pintada em canvas: céu, nuvens, sol ou lua e o mar faiscando.
 * Tudo é gerado aqui (nenhuma imagem externa). As cores vêm dos tokens de cada tema.
 * Com prefers-reduced-motion, pinta um quadro só e para.
 */
type Theme = 'azul' | 'ouro' | 'estrelas';

interface Cloud {
  sprite: HTMLCanvasElement;
  x: number;
  y: number;
  speed: number;
}
interface Glint {
  x: number;
  y: number;
  w: number;
  h: number;
  phase: number;
  speed: number;
  amp: number;
}

/** Gerador determinístico: a mesma cena a cada visita, sem piscar entre recargas. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gauss = (r: () => number) => (r() + r() + r() - 1.5) / 1.5;

function readTheme(): Theme {
  const t = document.documentElement.dataset.theme;
  return t === 'ouro' || t === 'estrelas' ? t : 'azul';
}

/** Nuvem em estilo de animação: topo claro e iluminado, base achatada e sombreada. */
function cloudSprite(r: () => number, w: number, light: string, shade: string, rim: string): HTMLCanvasElement {
  const h = w * 0.55;
  const c = document.createElement('canvas');
  c.width = Math.ceil(w);
  c.height = Math.ceil(h);
  const g = c.getContext('2d')!;
  const base = h * 0.86;
  const n = 7 + Math.floor(r() * 5);
  const lumps: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const x = w * (0.12 + t * 0.76) + gauss(r) * w * 0.03;
    // Mais alto no meio, como um cúmulo.
    const rad = w * (0.07 + 0.11 * Math.sin(Math.PI * t) * (0.6 + r() * 0.6));
    lumps.push([x, base - rad * (0.35 + r() * 0.5), rad]);
  }
  g.save();
  g.beginPath();
  g.rect(0, 0, w, base);
  g.clip();
  g.fillStyle = shade;
  for (const [x, y, rad] of lumps) {
    g.beginPath();
    g.arc(x, y, rad, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = rim;
  for (const [x, y, rad] of lumps) {
    g.beginPath();
    g.arc(x - rad * 0.04, y - rad * 0.1, rad * 0.95, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = light;
  for (const [x, y, rad] of lumps) {
    g.beginPath();
    g.arc(x - rad * 0.08, y - rad * 0.22, rad * 0.86, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
  return c;
}

export function mountScene(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const bg = document.createElement('canvas');
  const bgc = bg.getContext('2d')!;
  let W = 0;
  let H = 0;
  let horizon = 0;
  let dpr = 1;
  let theme: Theme = readTheme();
  let clouds: Cloud[] = [];
  let glints: Glint[] = [];
  let glintColor = '#fff';
  let moon = { x: 0, y: 0, r: 0 };
  let raf = 0;
  let last = 0;
  let time = 0;
  let nextStar = 6;
  let star: { x: number; y: number; t: number } | null = null;

  const cssVar = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  function paintBackground() {
    const r = rng(theme === 'azul' ? 11 : theme === 'ouro' ? 23 : 37);
    bg.width = W * dpr;
    bg.height = H * dpr;
    bgc.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sky = bgc.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, cssVar('--sky-1'));
    sky.addColorStop(0.55, cssVar('--sky-2'));
    sky.addColorStop(1, cssVar('--sky-3'));
    bgc.fillStyle = sky;
    bgc.fillRect(0, 0, W, horizon);
    const sea = bgc.createLinearGradient(0, horizon, 0, H);
    sea.addColorStop(0, cssVar('--sea-1'));
    sea.addColorStop(0.45, cssVar('--sea-2'));
    sea.addColorStop(1, cssVar('--sea-3'));
    bgc.fillStyle = sea;
    bgc.fillRect(0, horizon, W, H - horizon);

    if (theme === 'azul') {
      // Névoa clara no horizonte e brilho largo onde o sol bate no mar.
      const haze = bgc.createLinearGradient(0, horizon - H * 0.08, 0, horizon + H * 0.06);
      haze.addColorStop(0, 'rgb(255 255 255 / 0)');
      haze.addColorStop(0.6, 'rgb(255 255 255 / .38)');
      haze.addColorStop(1, 'rgb(255 255 255 / 0)');
      bgc.fillStyle = haze;
      bgc.fillRect(0, horizon - H * 0.08, W, H * 0.14);
      const glow = bgc.createRadialGradient(W * 0.5, horizon + H * 0.04, 0, W * 0.5, horizon + H * 0.04, W * 0.42);
      glow.addColorStop(0, 'rgb(220 245 255 / .45)');
      glow.addColorStop(1, 'rgb(220 245 255 / 0)');
      bgc.fillStyle = glow;
      bgc.fillRect(0, horizon, W, H - horizon);
    }

    if (theme === 'ouro') {
      const sx = W * 0.66;
      const sy = horizon - H * 0.035;
      const sr = Math.min(W, H) * 0.07;
      const halo = bgc.createRadialGradient(sx, sy, sr * 0.5, sx, sy, Math.max(W, H) * 0.55);
      halo.addColorStop(0, 'rgb(255 214 120 / .75)');
      halo.addColorStop(0.25, 'rgb(255 170 50 / .28)');
      halo.addColorStop(1, 'rgb(255 140 20 / 0)');
      bgc.fillStyle = halo;
      bgc.fillRect(0, 0, W, H);
      bgc.save();
      bgc.beginPath();
      bgc.rect(0, 0, W, horizon);
      bgc.clip();
      bgc.fillStyle = '#fff1bf';
      bgc.beginPath();
      bgc.arc(sx, sy, sr, 0, Math.PI * 2);
      bgc.fill();
      bgc.restore();
      // Nuvens finas e compridas, contra a luz.
      for (let i = 0; i < 9; i++) {
        const y = H * (0.08 + r() * 0.42);
        const w = W * (0.18 + r() * 0.35);
        const x = r() * W - w * 0.3;
        bgc.fillStyle = `rgb(70 28 6 / ${0.25 + r() * 0.3})`;
        bgc.beginPath();
        bgc.ellipse(x + w / 2, y, w / 2, 2 + r() * 5, 0, 0, Math.PI * 2);
        bgc.fill();
      }
      // Textura do mar: escamas de ouro mais apagadas, que os brilhos animados acendem.
      for (let i = 0; i < 1400; i++) {
        const t = Math.pow(r(), 1.5);
        const y = horizon + t * (H - horizon);
        const w = 3 + t * 34 * (0.5 + r());
        bgc.fillStyle = `rgb(255 ${150 + Math.floor(r() * 60)} 40 / ${0.08 + r() * 0.2})`;
        bgc.beginPath();
        bgc.ellipse(r() * W, y, w / 2, 0.6 + t * 4, 0, 0, Math.PI * 2);
        bgc.fill();
      }
    }

    if (theme === 'estrelas') {
      for (let i = 0; i < Math.round((W * horizon) / 2600); i++) {
        const y = Math.pow(r(), 1.3) * horizon * 0.96;
        bgc.fillStyle = `rgb(235 240 255 / ${0.25 + r() * 0.7})`;
        const s = r() < 0.08 ? 1.6 : 0.5 + r() * 0.8;
        bgc.fillRect(r() * W, y, s, s);
      }
      moon = { x: W * (W < 700 ? 0.8 : 0.78), y: H * 0.15, r: Math.min(W, H) * 0.06 };
      const halo = bgc.createRadialGradient(moon.x, moon.y, moon.r, moon.x, moon.y, moon.r * 6);
      halo.addColorStop(0, 'rgb(200 215 255 / .32)');
      halo.addColorStop(1, 'rgb(200 215 255 / 0)');
      bgc.fillStyle = halo;
      bgc.fillRect(0, 0, W, horizon);
      const disc = bgc.createRadialGradient(moon.x - moon.r * 0.3, moon.y - moon.r * 0.3, moon.r * 0.1, moon.x, moon.y, moon.r);
      disc.addColorStop(0, '#f8faff');
      disc.addColorStop(1, '#cfd9f2');
      bgc.fillStyle = disc;
      bgc.beginPath();
      bgc.arc(moon.x, moon.y, moon.r, 0, Math.PI * 2);
      bgc.fill();
      bgc.fillStyle = 'rgb(120 135 175 / .16)';
      for (const [dx, dy, s] of [[-0.3, -0.1, 0.22], [0.25, 0.2, 0.16], [0.05, -0.4, 0.12], [-0.1, 0.4, 0.1], [0.4, -0.25, 0.08]]) {
        bgc.beginPath();
        bgc.arc(moon.x + dx! * moon.r, moon.y + dy! * moon.r, s! * moon.r, 0, Math.PI * 2);
        bgc.fill();
      }
      // Caminho de luz da lua no mar.
      const path = bgc.createLinearGradient(0, horizon, 0, H);
      path.addColorStop(0, 'rgb(190 205 255 / .22)');
      path.addColorStop(1, 'rgb(190 205 255 / .04)');
      bgc.fillStyle = path;
      bgc.beginPath();
      bgc.moveTo(moon.x - moon.r * 0.8, horizon);
      bgc.lineTo(moon.x + moon.r * 0.8, horizon);
      bgc.lineTo(moon.x + W * 0.2, H);
      bgc.lineTo(moon.x - W * 0.2, H);
      bgc.fill();
    }

    // Linha do horizonte.
    bgc.fillStyle = theme === 'azul' ? 'rgb(255 255 255 / .5)' : theme === 'ouro' ? 'rgb(255 220 140 / .45)' : 'rgb(200 215 255 / .2)';
    bgc.fillRect(0, horizon - 0.5, W, 1);
  }

  function makeClouds() {
    const r = rng(theme === 'azul' ? 5 : 9);
    clouds = [];
    if (theme === 'ouro') return;
    const night = theme === 'estrelas';
    const light = night ? '#2b3c72' : '#ffffff';
    const rim = night ? '#1d2b58' : '#eef6fc';
    const shade = night ? '#121c42' : '#c4dcef';
    const count = night ? 5 : W < 700 ? 6 : 9;
    for (let i = 0; i < count; i++) {
      const depth = 0.4 + r() * 0.6;
      const w = Math.min(W * 0.5, 160 + depth * 300) * (W < 700 ? 0.7 : 1);
      const yBand = night ? 0.06 + r() * 0.38 : 0.04 + r() * 0.5;
      clouds.push({
        sprite: cloudSprite(r, w, light, shade, rim),
        x: r() * (W + w) - w,
        y: horizon * yBand + (depth - 0.5) * 40,
        speed: (night ? 3 : 6) + depth * (night ? 5 : 12),
      });
    }
    // Banco de nuvens baixas sobre o horizonte (só de dia).
    if (!night) {
      for (let x = -80; x < W + 80; x += 110 + r() * 90) {
        const w = 120 + r() * 160;
        const s = cloudSprite(r, w, light, shade, rim);
        clouds.push({ sprite: s, x, y: horizon - s.height * 0.86 + 2, speed: 1.5 });
      }
    }
  }

  function makeGlints() {
    const r = rng(theme === 'azul' ? 3 : theme === 'ouro' ? 7 : 13);
    glints = [];
    const n = theme === 'ouro' ? 900 : theme === 'azul' ? 520 : 260;
    glintColor = theme === 'ouro' ? '#ffd257' : theme === 'azul' ? '#ffffff' : '#e3eaff';
    for (let i = 0; i < n; i++) {
      const t = Math.pow(r(), theme === 'estrelas' ? 1.2 : 1.7);
      const y = horizon + 2 + t * (H - horizon);
      let x: number;
      if (theme === 'estrelas') x = moon.x + gauss(r) * (moon.r * 0.8 + t * W * 0.16);
      else if (theme === 'azul') x = r() < 0.6 ? W * 0.5 + gauss(r) * W * (0.18 + t * 0.2) : r() * W;
      else x = r() * W;
      const w = (theme === 'ouro' ? 4 : 2) + t * (theme === 'ouro' ? 30 : 16) * (0.4 + r());
      glints.push({ x, y, w, h: Math.max(1, t * (theme === 'ouro' ? 4 : 2.4)), phase: r() * 6.28, speed: 0.8 + r() * 2.2, amp: 0.35 + r() * 0.65 });
    }
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const hv = parseFloat(cssVar('--horizon')) || 58;
    horizon = Math.round((H * hv) / 100);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    paintBackground();
    makeClouds();
    makeGlints();
    draw();
  }

  function draw() {
    ctx!.setTransform(1, 0, 0, 1, 0, 0);
    ctx!.drawImage(bg, 0, 0);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const c of clouds) {
      const w = c.sprite.width;
      let x = (c.x + time * c.speed) % (W + w);
      if (x > W) x -= W + w;
      ctx!.drawImage(c.sprite, x, c.y);
    }
    ctx!.fillStyle = glintColor;
    for (const g of glints) {
      const s = Math.sin(time * g.speed + g.phase);
      const a = s > 0 ? s * s * g.amp : 0;
      if (a < 0.04) continue;
      ctx!.globalAlpha = a;
      ctx!.fillRect(g.x - g.w / 2, g.y, g.w, g.h);
    }
    ctx!.globalAlpha = 1;
    if (theme === 'azul') drawGull();
    if (theme === 'estrelas') drawShootingStar();
  }

  /** Uma gaivota genérica cruza o céu bem devagar. */
  function drawGull() {
    const period = 70;
    const p = (time % period) / period;
    const x = -40 + p * (W + 80);
    const y = horizon * 0.42 + Math.sin(time * 0.6) * 10;
    const flap = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(time * 5));
    const s = W < 700 ? 7 : 9;
    ctx!.strokeStyle = 'rgb(20 45 75 / .75)';
    ctx!.lineWidth = 1.6;
    ctx!.lineCap = 'round';
    ctx!.beginPath();
    ctx!.moveTo(x - s, y);
    ctx!.quadraticCurveTo(x - s / 2, y - s * flap, x, y);
    ctx!.quadraticCurveTo(x + s / 2, y - s * flap, x + s, y);
    ctx!.stroke();
  }

  /** De vez em quando, uma estrela cadente. */
  function drawShootingStar() {
    if (!star && time > nextStar) {
      star = { x: W * (0.15 + Math.random() * 0.5), y: horizon * (0.05 + Math.random() * 0.25), t: 0 };
    }
    if (!star) return;
    star.t += 1 / 60;
    const k = star.t / 0.9;
    if (k >= 1) {
      star = null;
      nextStar = time + 12 + Math.random() * 18;
      return;
    }
    const len = 120;
    const hx = star.x + k * 260;
    const hy = star.y + k * 110;
    const grad = ctx!.createLinearGradient(hx - len, hy - len * 0.42, hx, hy);
    grad.addColorStop(0, 'rgb(235 240 255 / 0)');
    grad.addColorStop(1, `rgb(235 240 255 / ${0.9 * (1 - k)})`);
    ctx!.strokeStyle = grad;
    ctx!.lineWidth = 1.4;
    ctx!.beginPath();
    ctx!.moveTo(hx - len, hy - len * 0.42);
    ctx!.lineTo(hx, hy);
    ctx!.stroke();
  }

  function loop(now: number) {
    raf = requestAnimationFrame(loop);
    const dt = (now - last) / 1000;
    // ~30 quadros por segundo bastam para nuvens e brilhos; poupa bateria.
    if (dt < 0.032) return;
    last = now;
    time += Math.min(dt, 0.1);
    draw();
  }

  function start() {
    cancelAnimationFrame(raf);
    if (reduce.matches || document.hidden) {
      draw();
      return;
    }
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }

  new MutationObserver(() => {
    const t = readTheme();
    if (t === theme) return;
    theme = t;
    resize();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  let rt: ReturnType<typeof setTimeout> | undefined;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(resize, 120);
  });
  document.addEventListener('visibilitychange', start);
  reduce.addEventListener('change', start);
  // Um instante inicial para que nuvens e gaivota não comecem sempre no mesmo lugar.
  time = 8;
  resize();
  start();
}
