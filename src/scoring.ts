import { PorraData, Participant } from './types';

export const POINTS = {
  GROUP_CLASSIFIED: 2,
  GROUP_EXACT_POS: 1,
  SEMIFINALIST: 5,
  FINALIST: 8,
  CHAMPION: 15,
  SPAIN_ELIMINATION: 8,
  SPAIN_SCORER: 6,
  PICHICHI: 10,
  BALON_ORO: 8,
  GUANTE_ORO: 6,
  REVELACION: 7,
  DECEPCION: 5,
  MAS_GOLEADORA: 6,
  MAS_TARJETAS: 6,
  PENALTIS: 3,
  MEJOR_CONMEBOL: 4,
  MEJOR_CAF: 4,
  MEJOR_AFC: 4,
};

export interface ScoreDetail {
  category: string;
  points: number;
}

export interface ScoreResult {
  total: number;
  details: ScoreDetail[];
  tiebreakerDistance: number;
  exactTiebreakerHit: boolean;
}

export function calculateScore(p: PorraData, official: PorraData): ScoreResult {
  const details: ScoreDetail[] = [
    { category: 'Fase de Grupos', points: 0 },
    { category: 'Fase Final', points: 0 },
    { category: 'Especial España', points: 0 },
    { category: 'Premios Individuales', points: 0 },
    { category: 'Rendimiento', points: 0 },
    { category: 'Estadísticas', points: 0 },
    { category: 'Continentes', points: 0 },
  ];

  // Fase de grupos
  p.groupPhase.forEach((group, idx) => {
    const off = official.groupPhase[idx];
    const offClassified = [off.first, off.second];
    
    // Clasificados
    if (offClassified.includes(group.first)) details[0].points += POINTS.GROUP_CLASSIFIED;
    if (offClassified.includes(group.second)) details[0].points += POINTS.GROUP_CLASSIFIED;
    
    // Posición exacta
    if (group.first === off.first) details[0].points += POINTS.GROUP_EXACT_POS;
    if (group.second === off.second) details[0].points += POINTS.GROUP_EXACT_POS;
  });

  // Fase Final
  p.knockout.semifinalists.forEach(s => {
    if (official.knockout.semifinalists.includes(s)) details[1].points += POINTS.SEMIFINALIST;
  });
  p.knockout.finalists.forEach(f => {
    if (official.knockout.finalists.includes(f)) details[1].points += POINTS.FINALIST;
  });
  if (p.knockout.champion === official.knockout.champion) {
    details[1].points += POINTS.CHAMPION;
  }

  // Especial España
  if (p.spain.eliminationStage === official.spain.eliminationStage) details[2].points += POINTS.SPAIN_ELIMINATION;
  if (p.spain.topScorer === official.spain.topScorer) details[2].points += POINTS.SPAIN_SCORER;

  // Premios
  if (p.awards.pichichi === official.awards.pichichi) details[3].points += POINTS.PICHICHI;
  if (p.awards.balonDeOro === official.awards.balonDeOro) details[3].points += POINTS.BALON_ORO;
  if (p.awards.guanteDeOro === official.awards.guanteDeOro) details[3].points += POINTS.GUANTE_ORO;

  // Rendimiento
  if (p.stats.revelacion === official.stats.revelacion) details[4].points += POINTS.REVELACION;
  if (p.stats.decepcion === official.stats.decepcion) details[4].points += POINTS.DECEPCION;

  // Estadísticas
  if (p.stats.masGoleadora === official.stats.masGoleadora) details[5].points += POINTS.MAS_GOLEADORA;
  if (p.stats.masTarjetas === official.stats.masTarjetas) details[5].points += POINTS.MAS_TARJETAS;
  if (p.stats.penaltisFaseFinal === official.stats.penaltisFaseFinal) details[5].points += POINTS.PENALTIS;

  // Continentes
  if (p.stats.mejorConmebol === official.stats.mejorConmebol) details[6].points += POINTS.MEJOR_CONMEBOL;
  if (p.stats.mejorCaf === official.stats.mejorCaf) details[6].points += POINTS.MEJOR_CAF;
  if (p.stats.mejorAfc === official.stats.mejorAfc) details[6].points += POINTS.MEJOR_AFC;

  const total = details.reduce((acc, curr) => acc + curr.points, 0);

  let tiebreakerDistance = 999;
  let exactTiebreakerHit = false;
  if (typeof p.stats.golesFinal === 'number' && typeof official.stats.golesFinal === 'number') {
    if (p.stats.golesFinal <= official.stats.golesFinal) {
      tiebreakerDistance = official.stats.golesFinal - p.stats.golesFinal;
      if (tiebreakerDistance === 0) exactTiebreakerHit = true;
    }
  }

  return { total, details, tiebreakerDistance, exactTiebreakerHit };
}
