export interface Country {
  name: string;
  n1: number;
  n2: number;
  T: number;
  p10: number;
  p25: number;
  p50: number;
  n7: number;
  t7: number | null;
  p7_10: number;
  p7_25: number;
  p7_50: number;
  risk: 'bajo' | 'moderado' | 'alto' | 'muyalto';
  box: string;
}

export interface GRData {
  name: string;
  cum: number[];
  box: string;
}

export interface Bin {
  lo: number;
  hi: number | null;
  n: number;
}

export interface Sample {
  logl: number;
  b: number;
}

export interface CurvePoint {
  m: number;
  med: number;
  p5: number;
  p95: number;
}

export interface CountryMCMC extends GRData {
  bins: Bin[];
  samples: Sample[];
  acceptRate: number;
  totalEvents: number;
  bMed: number;
  bP5: number;
  bP95: number;
  lam6Med: number;
  curve: CurvePoint[];
}
