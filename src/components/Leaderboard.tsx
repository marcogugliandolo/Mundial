import { Participant, PorraData } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Clock, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '../utils';
import { calculateScore } from '../scoring';

interface Props {
  participants: Participant[];
  officialResults: PorraData | null;
  key?: string;
}

export default function Leaderboard({ participants, officialResults }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const rankedParticipants = useMemo(() => {
    if (!officialResults) {
      return [...participants].sort((a, b) => b.timestamp - a.timestamp).map(p => ({ p, score: null }));
    }

    const scored = participants.map(p => {
      const score = calculateScore(p, officialResults);
      return { p, score };
    });

    return scored.sort((a, b) => {
      // 1. Puntos totales
      if (b.score!.total !== a.score!.total) return b.score!.total - a.score!.total;
      
      // 2. Empate: Distancia en goles (menor distancia gana, 0 es perfecto)
      if (a.score!.tiebreakerDistance !== b.score!.tiebreakerDistance) {
         return a.score!.tiebreakerDistance - b.score!.tiebreakerDistance;
      }
      
      // 3. Fecha más temprana (quien envió primero)
      return a.p.timestamp - b.p.timestamp;
    });
  }, [participants, officialResults]);

  if (participants.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <Trophy className="w-10 h-10 text-blue-300" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800">Aún no hay porras</h3>
        <p className="text-slate-500 mt-2 max-w-xs mx-auto">
          Sé el primero en hacer tu pronóstico para el Mundial.
        </p>
      </motion.div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24 max-w-3xl mx-auto space-y-4"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Ranking ({participants.length})</h2>
          <p className="text-sm text-slate-500">
            {officialResults 
              ? "Clasificación basada en resultados oficiales" 
              : "Aún no hay resultados oficiales. Mostrando últimas predicciones."}
          </p>
        </div>
        {!officialResults && (
          <div className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 ml-2">
            <AlertCircle className="w-4 h-4" />
            Sin Puntuar
          </div>
        )}
      </div>

      {rankedParticipants.map(({ p, score }, idx) => {
        if (!p.knockout) return null;
        const isExpanded = expandedId === p.id;
        
        let rankBadge = null;
        if (officialResults) {
          if (idx === 0) rankBadge = <div className="absolute -top-3 -left-3 w-8 h-8 bg-yellow-400 rounded-full border-4 border-white flex items-center justify-center shadow-lg font-black text-yellow-900 text-sm z-10">1</div>;
          else if (idx === 1) rankBadge = <div className="absolute -top-3 -left-3 w-8 h-8 bg-slate-300 rounded-full border-4 border-white flex items-center justify-center shadow-sm font-black text-slate-700 text-sm z-10">2</div>;
          else if (idx === 2) rankBadge = <div className="absolute -top-3 -left-3 w-8 h-8 bg-amber-600 rounded-full border-4 border-white flex items-center justify-center shadow-sm font-black text-amber-100 text-sm z-10">3</div>;
          else rankBadge = <div className="absolute -top-3 -left-3 w-8 h-8 bg-slate-100 rounded-full border-4 border-white flex items-center justify-center font-bold text-slate-400 text-sm z-10">{idx + 1}</div>;
        }

        return (
          <div key={p.id} className={cn(
            "relative bg-white border rounded-2xl overflow-visible transition-all",
            officialResults && idx === 0 ? "border-yellow-300 shadow-md ring-1 ring-yellow-400/20" : "border-slate-200 shadow-sm"
          )}>
            {rankBadge}
            <button 
              onClick={() => toggleExpand(p.id)}
              className={cn(
                "w-full px-5 py-4 sm:pl-8 flex justify-between items-center transition-colors text-left rounded-2xl",
                isExpanded ? "bg-slate-50" : "hover:bg-slate-50",
                officialResults && idx === 0 && !isExpanded ? "bg-gradient-to-r from-yellow-50 to-white" : ""
              )}
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-lg leading-none truncate">{p.name}</span>
                  {officialResults && idx === 0 && <Trophy className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="truncate">
                    {new Date(p.timestamp).toLocaleString(undefined, {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {score ? (
                  <div className="flex flex-col items-end mr-2">
                    <span className="text-2xl font-black text-blue-600 leading-none tracking-tight">{score.total} <span className="text-sm font-bold text-blue-400">pts</span></span>
                    {score.tiebreakerDistance !== 999 && (
                       <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                         Empate: {score.exactTiebreakerHit ? 'PLENO' : `+${score.tiebreakerDistance}`}
                       </span>
                    )}
                  </div>
                ) : (
                  <span className="shrink-0 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-md hidden sm:inline-block">
                    🏆 {p.knockout.champion}
                  </span>
                )}
                <div className="w-8 flex justify-end">
                  {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                </div>
              </div>
            </button>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-slate-100"
                >
                  <div className="p-5 space-y-6 bg-slate-50 pb-6 text-sm relative">
                    
                    {score && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200 mb-6 shadow-sm">
                        {score.details.map((d, i) => (
                           <div key={i} className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">{d.category}</span>
                              <span className="font-bold text-slate-700 text-lg">{d.points} <span className="text-xs text-slate-400">pts</span></span>
                           </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="block text-xs text-slate-500 uppercase font-semibold mb-1">Campeón</span>
                        <span className="font-bold text-slate-800">{p.knockout.champion}</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="block text-xs text-slate-500 uppercase font-semibold mb-1">Final España</span>
                        <span className="font-bold text-slate-800">{p.spain.eliminationStage}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <h4 className="font-bold text-slate-700 border-b pb-1">Fase Final</h4>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-slate-700">
                         <div><span className="text-slate-500 w-24 inline-block">Finalistas:</span> {p.knockout.finalists.join(' y ')}</div>
                         <div><span className="text-slate-500 w-24 inline-block">Semifinalistas:</span> {p.knockout.semifinalists.join(', ')}</div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <h4 className="font-bold text-slate-700 border-b pb-1">Premios</h4>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-slate-700">
                         <div><span className="text-slate-500 w-24 inline-block">Pichichi:</span> {p.awards.pichichi}</div>
                         <div><span className="text-slate-500 w-24 inline-block">Balón Oro:</span> {p.awards.balonDeOro}</div>
                         <div><span className="text-slate-500 w-24 inline-block">Guante Oro:</span> {p.awards.guanteDeOro}</div>
                         <div><span className="text-slate-500 w-24 inline-block">Gol. España:</span> {p.spain.topScorer}</div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <h4 className="font-bold text-slate-700 border-b pb-1">Estadísticas y otros</h4>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-slate-700">
                         <div><span className="text-slate-500 w-24 inline-block">Revelación:</span> {p.stats.revelacion}</div>
                         <div><span className="text-slate-500 w-24 inline-block">Decepción:</span> {p.stats.decepcion}</div>
                         <div><span className="text-slate-500 w-24 inline-block">Más Goles:</span> {p.stats.masGoleadora}</div>
                         <div><span className="text-slate-500 w-24 inline-block">Más Tarjetas:</span> {p.stats.masTarjetas}</div>
                         <div><span className="text-slate-500 w-24 inline-block">Mejor CONMEBOL:</span> {p.stats.mejorConmebol}</div>
                         <div><span className="text-slate-500 w-24 inline-block">Mejor CAF:</span> {p.stats.mejorCaf}</div>
                         <div><span className="text-slate-500 w-24 inline-block">Mejor AFC:</span> {p.stats.mejorAfc}</div>
                         <div><span className="text-slate-500 w-24 inline-block">Penaltis final:</span> {p.stats.penaltisFaseFinal}</div>
                         <div><span className="text-slate-500 w-24 inline-block">Goles final:</span> {p.stats.golesFinal}</div>
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </motion.div>
  );
}
