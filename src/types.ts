export interface GroupPhasePrediction {
  group: string;
  first: string;
  second: string;
}

export interface KnockoutPrediction {
  semifinalists: string[]; // 4
  finalists: string[]; // 2
  champion: string;
}

export interface SpainPrediction {
  eliminationStage: string;
  topScorer: string;
}

export interface AwardsPrediction {
  pichichi: string;
  balonDeOro: string;
  guanteDeOro: string;
}

export interface StatsPrediction {
  revelacion: string;
  decepcion: string;
  masGoleadora: string;
  masTarjetas: string;
  penaltisFaseFinal: 'Sí' | 'No' | '';
  mejorConmebol: string;
  mejorCaf: string;
  mejorAfc: string;
  golesFinal: number | '';
}

export interface PorraData {
  groupPhase: GroupPhasePrediction[];
  knockout: KnockoutPrediction;
  spain: SpainPrediction;
  awards: AwardsPrediction;
  stats: StatsPrediction;
}

export interface Participant extends PorraData {
  id: string;
  name: string;
  timestamp: number;
}

