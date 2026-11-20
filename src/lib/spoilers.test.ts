import { describe, expect, it } from 'vitest';
import { chapterLabel, episodeLabel, isHidden } from './spoilers';
import { maxCh, minCh, NO_CHAPTER } from './sort';

describe('spoilers (bordas)', () => {
  const on = { spoilerOn: true, lastChapter: 100 };
  it('o último capítulo lido ainda é visível', () => {
    expect(isHidden({ revealed: { ch: 100 } }, on)).toBe(false);
    expect(isHidden({ revealed: { ch: 101 } }, on)).toBe(true);
  });
  it('rótulo de capítulo', () => {
    expect(chapterLabel({ ch: null, approx: false })).toBe('cap. a confirmar');
    expect(chapterLabel({ ch: 12, approx: true })).toBe('≈ cap. 12');
    expect(chapterLabel({ ch: 12, approx: false })).toBe('cap. 12');
  });
  it('rótulo de episódio', () => {
    expect(episodeLabel({ ep: null })).toBe('');
    expect(episodeLabel({ ep: 1130 })).toBe('ep. 1130');
  });
  it('minCh e maxCh ignoram eventos sem capítulo', () => {
    expect(minCh([])).toBe(NO_CHAPTER);
    expect(maxCh([])).toBe(0);
  });
});
