import { Bin, Sample, CurvePoint, GRData, CountryMCMC } from '../types';
import { T_MCMC, THRESHOLDS } from '../data';

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeGaussian(rng: () => number) {
  let spare: number | null = null;
  return function () {
    if (spare !== null) {
      const v = spare;
      spare = null;
      return v;
    }
    let u, v, s;
    do {
      u = rng() * 2 - 1;
      v = rng() * 2 - 1;
      s = u * u + v * v;
    } while (s === 0 || s >= 1);
    const mul = Math.sqrt((-2 * Math.log(s)) / s);
    spare = v * mul;
    return u * mul;
  };
}

function loglik(logl: number, b: number, bins: Bin[]) {
  if (b < 0.3 || b > 2.2) return -Infinity;
  if (logl < -3 || logl > 3) return -Infinity;
  let ll = 0;
  for (const { lo, hi, n } of bins) {
    const lamLo = Math.pow(10, logl - b * (lo - 6.0));
    const lamHi = hi !== null ? Math.pow(10, logl - b * (hi - 6.0)) : 0;
    const e = T_MCMC * (lamLo - lamHi);
    if (e <= 0) return -Infinity;
    ll += n * Math.log(e) - e;
  }
  return ll;
}

function runMCMC(bins: Bin[], seed: number) {
  const rng = mulberry32(seed);
  const gauss = makeGaussian(rng);
  const iters = 10000;
  const burn = 3000;
  let logl = 0.0;
  let b = 1.0;
  let curLL = loglik(logl, b, bins);
  let s1 = 0.15;
  let s2 = 0.15;
  let accWindow = 0;
  let acceptedTotal = 0;
  const samples: Sample[] = [];

  for (let it = 0; it < iters; it++) {
    const logl2 = logl + gauss() * s1;
    const b2 = b + gauss() * s2;
    const ll2 = loglik(logl2, b2, bins);
    if (Math.log(rng() + 1e-300) < ll2 - curLL) {
      logl = logl2;
      b = b2;
      curLL = ll2;
      accWindow++;
      acceptedTotal++;
    }
    if (it < burn && (it + 1) % 200 === 0) {
      const rate = accWindow / 200;
      const factor = rate > 0.4 ? 1.15 : rate < 0.2 ? 0.87 : 1.0;
      s1 *= factor;
      s2 *= factor;
      accWindow = 0;
    }
    if (it >= burn) samples.push({ logl, b });
  }
  return { samples, acceptRate: acceptedTotal / iters };
}

function binsFromCum(cum: number[]): Bin[] {
  const bins: Bin[] = [];
  for (let i = 0; i < THRESHOLDS.length - 1; i++) {
    bins.push({ lo: THRESHOLDS[i], hi: THRESHOLDS[i + 1], n: cum[i] - cum[i + 1] });
  }
  bins.push({ lo: THRESHOLDS[THRESHOLDS.length - 1], hi: null, n: cum[cum.length - 1] });
  return bins;
}

export function lambdasAt(samples: Sample[], M: number, forcedB?: number): number[] {
  const arr = new Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const b = forcedB !== undefined ? forcedB : samples[i].b;
    arr[i] = Math.pow(10, samples[i].logl - b * (M - 6.0));
  }
  return arr;
}

export function pctSorted(sortedArr: number[], p: number): number {
  const idx = Math.min(sortedArr.length - 1, Math.max(0, Math.round(p * (sortedArr.length - 1))));
  return sortedArr[idx];
}

export function computeMCMCData(grData: GRData[]): CountryMCMC[] {
  return grData.map((c, i) => {
    const bins = binsFromCum(c.cum);
    const { samples, acceptRate } = runMCMC(bins, 1000 + i * 97);
    const totalEvents = c.cum[0];
    const bs = samples.map((s) => s.b).sort((a, b) => a - b);
    const bMed = pctSorted(bs, 0.5);
    const bP5 = pctSorted(bs, 0.05);
    const bP95 = pctSorted(bs, 0.95);
    const l6 = samples.map((s) => Math.pow(10, s.logl)).sort((a, b) => a - b);
    const lam6Med = pctSorted(l6, 0.5);

    const gridM: number[] = [];
    for (let m = 5.0; m <= 8.001; m += 0.06) gridM.push(Math.round(m * 1000) / 1000);

    const curve: CurvePoint[] = gridM.map((m) => {
      const lam = lambdasAt(samples, m).sort((a, b) => a - b);
      return {
        m,
        med: pctSorted(lam, 0.5),
        p5: pctSorted(lam, 0.05),
        p95: pctSorted(lam, 0.95),
      };
    });

    return {
      ...c,
      bins,
      samples,
      acceptRate,
      totalEvents,
      bMed,
      bP5,
      bP95,
      lam6Med,
      curve,
    };
  });
}
