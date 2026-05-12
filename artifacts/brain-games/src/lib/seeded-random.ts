// Xorshift32 — fast, deterministic PRNG from a seed
export function createRng(seed: number) {
  let s = (seed >>> 0) || 1;
  return () => {
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rng = createRng(seed);
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function seededSequence(length: number, seed: number): string {
  const rng = createRng(seed);
  return Array.from({ length }, () => Math.floor(rng() * 10).toString()).join("");
}
