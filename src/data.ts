import { Country, GRData } from './types';

export const countries: Country[] = [
  { name: "México (sur/Pacífico)", n1: 130, n2: 73, T: 0.94, p10: 100.0, p25: 100.0, p50: 100.0, n7: 31, t7: 4.09, p7_10: 91.3, p7_25: 99.8, p7_50: 100.0, risk: "muyalto", box: "14.5–18.5°N, 99.5–92.0°O" },
  { name: "Costa Rica", n1: 75, n2: 41, T: 1.66, p10: 99.8, p25: 100.0, p50: 100.0, n7: 11, t7: 11.52, p7_10: 58.0, p7_25: 88.6, p7_50: 98.7, risk: "muyalto", box: "8.0–11.3°N, 86.0–82.5°O" },
  { name: "Panamá", n1: 67, n2: 45, T: 1.66, p10: 99.8, p25: 100.0, p50: 100.0, n7: 6, t7: 21.11, p7_10: 37.7, p7_25: 69.4, p7_50: 90.6, risk: "muyalto", box: "7.0–9.9°N, 83.1–77.0°O" },
  { name: "Nicaragua", n1: 63, n2: 40, T: 1.82, p10: 99.6, p25: 100.0, p50: 100.0, n7: 6, t7: 21.11, p7_10: 37.7, p7_25: 69.4, p7_50: 90.6, risk: "muyalto", box: "10.7–15.0°N, 87.7–83.0°O" },
  { name: "Guatemala", n1: 72, n2: 38, T: 1.76, p10: 99.7, p25: 100.0, p50: 100.0, n7: 8, t7: 15.84, p7_10: 46.8, p7_25: 79.4, p7_50: 95.7, risk: "muyalto", box: "13.7–17.8°N, 92.3–88.2°O" },
  { name: "Honduras", n1: 29, n2: 17, T: 4.13, p10: 91.1, p25: 99.8, p50: 100.0, n7: 5, t7: 25.34, p7_10: 32.6, p7_25: 62.7, p7_50: 86.1, risk: "alto", box: "12.9–16.5°N, 89.4–83.0°O" },
  { name: "El Salvador", n1: 24, n2: 13, T: 5.20, p10: 85.4, p25: 99.2, p50: 100.0, n7: 3, t7: 42.23, p7_10: 21.1, p7_25: 44.7, p7_50: 69.4, risk: "alto", box: "13.1–14.5°N, 90.2–87.6°O" },
  { name: "República Dominicana", n1: 20, n2: 6, T: 8.07, p10: 71.0, p25: 95.5, p50: 99.8, n7: 2, t7: 63.34, p7_10: 14.6, p7_25: 32.6, p7_50: 54.6, risk: "moderado", box: "17.4–20.1°N, 72.1–68.0°O" },
  { name: "Puerto Rico", n1: 15, n2: 4, T: 10.5, p10: 61.5, p25: 90.7, p50: 99.1, n7: 1, t7: 126.0, p7_10: 7.6, p7_25: 17.9, p7_50: 32.6, risk: "moderado", box: "17.5–19.5°N, 67.5–65.0°O" },
  { name: "Cuba", n1: 12, n2: 3, T: 15.2, p10: 48.2, p25: 80.6, p50: 96.2, n7: 1, t7: 126.0, p7_10: 7.6, p7_25: 17.9, p7_50: 32.6, risk: "moderado", box: "19.0–23.5°N, 85.0–74.0°O" },
  { name: "Haití", n1: 25, n2: 12, T: 6.5, p10: 78.0, p25: 97.0, p50: 100.0, n7: 3, t7: 45.0, p7_10: 20.0, p7_25: 42.0, p7_50: 65.0, risk: "alto", box: "17.5–20.5°N, 75.0–71.5°O" },
  { name: "Jamaica", n1: 18, n2: 7, T: 9.0, p10: 68.0, p25: 93.0, p50: 99.5, n7: 1, t7: 95.0, p7_10: 10.0, p7_25: 23.0, p7_50: 41.0, risk: "moderado", box: "17.0–19.0°N, 79.0–76.0°O" },
  { name: "Belice", n1: 2, n2: 2, T: 43.69, p10: 20.5, p25: 43.6, p50: 68.2, n7: 0, t7: null, p7_10: 0, p7_25: 0, p7_50: 0, risk: "bajo", box: "15.8–18.5°N, 89.3–87.5°O" },
];

export const grRawData: GRData[] = [
  { name: "México (sur/Pacífico)", cum: [537, 180, 63, 27, 12], box: "14.5–18.5°N, 99.5–92.0°O" },
  { name: "Costa Rica", cum: [216, 82, 33, 10, 4], box: "8.0–11.3°N, 86.0–82.5°O" },
  { name: "Panamá", cum: [160, 66, 33, 9, 1], box: "7.0–9.9°N, 83.1–77.0°O" },
  { name: "Nicaragua", cum: [264, 109, 34, 11, 2], box: "10.7–15.0°N, 87.7–83.0°O" },
  { name: "Guatemala", cum: [261, 102, 30, 10, 2], box: "13.7–17.8°N, 92.3–88.2°O" },
  { name: "Honduras", cum: [125, 49, 14, 6, 2], box: "12.9–16.5°N, 89.4–83.0°O" },
  { name: "El Salvador", cum: [86, 42, 11, 4, 1], box: "13.1–14.5°N, 90.2–87.6°O" },
  { name: "República Dominicana", cum: [54, 18, 2, 1, 0], box: "17.4–20.1°N, 72.1–68.0°O" },
  { name: "Puerto Rico", cum: [68, 22, 3, 1, 0], box: "17.5–19.5°N, 67.5–65.0°O" },
  { name: "Cuba", cum: [45, 12, 1, 0, 0], box: "19.0–23.5°N, 85.0–74.0°O" },
  { name: "Haití", cum: [70, 28, 8, 3, 1], box: "17.5–20.5°N, 75.0–71.5°O" },
  { name: "Jamaica", cum: [45, 16, 4, 1, 0], box: "17.0–19.0°N, 79.0–76.0°O" },
  { name: "Belice", cum: [7, 2, 2, 0, 0], box: "15.8–18.5°N, 89.3–87.5°O" },
];

export const T_MCMC = 46.6786;
export const THRESHOLDS = [5.0, 5.5, 6.0, 6.5, 7.0];
export const riskLabels = {
  bajo: "Bajo",
  moderado: "Moderado",
  alto: "Alto",
  muyalto: "Muy alto",
};
