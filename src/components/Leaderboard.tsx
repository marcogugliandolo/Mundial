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
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="w-24 h-24 bg-emerald-900/40 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-emerald-500/20">
          <Trophy className="w-12 h-12 text-emerald-400" />
        </div>
        <h3 className="text-3xl font-display text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] tracking-wide mt-2">AÚN NO HAY PORRAS</h3>
        <p className="text-slate-400 mt-3 max-w-sm mx-auto font-medium">
          Sé el primero en hacer tu pronóstico para el Mundial. Los resultados oficiales se sumarán automáticamente al ranking.
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-display text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] tracking-wide">RANKING GENERAL</h2>
          <p className="text-sm text-slate-400 font-medium mt-1">
            {officialResults 
              ? "Clasificación basada en resultados oficiales" 
              : "Aún no hay resultados oficiales. Mostrando últimas predicciones."}
          </p>
        </div>
        {!officialResults && (
          <div className="bg-emerald-900/50 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 ml-2 shadow-[0_0_10px_rgba(16,185,129,0.2)] border border-emerald-500/30">
            <AlertCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Resultados</span> Pendientes
          </div>
        )}
      </div>

      {rankedParticipants.map(({ p, score }, idx) => {
        if (!p.knockout) return null;
        const isExpanded = expandedId === p.id;
        
        let rankBadge = null;
        if (officialResults) {
          if (idx === 0) rankBadge = <div className="absolute -top-4 -left-4 w-9 h-9 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.5)] border border-yellow-300 font-display text-yellow-950 text-xl z-10 transform -rotate-6">1</div>;
          else if (idx === 1) rankBadge = <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-slate-300 to-slate-500 rounded-xl flex items-center justify-center shadow-[0_0_10px_rgba(148,163,184,0.4)] border border-slate-300 font-display text-slate-900 text-lg z-10 transform -rotate-3">2</div>;
          else if (idx === 2) rankBadge = <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl flex items-center justify-center shadow-[0_0_10px_rgba(217,119,6,0.4)] border border-amber-500 font-display text-amber-50 text-lg z-10 transform rotate-3">3</div>;
          else rankBadge = <div className="absolute -top-2 -left-2 w-7 h-7 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-600 font-display text-slate-400 text-base z-10">{idx + 1}</div>;
        }

        return (
          <div key={p.id} className={cn(
            "relative bg-slate-900 border rounded-2xl overflow-visible transition-all duration-200",
            officialResults && idx === 0 ? "border-yellow-500/50 shadow-[0_0_20px_rgba(250,204,21,0.15)] ring-1 ring-yellow-500/20" : "border-white/10 shadow-none hover:shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          )}>
            {rankBadge}
            <button 
              onClick={() => toggleExpand(p.id)}
              className={cn(
                "w-full px-5 py-4 sm:pl-8 flex justify-between items-center transition-colors text-left rounded-2xl",
                isExpanded ? "bg-slate-800/80" : "hover:bg-slate-800/50",
                officialResults && idx === 0 && !isExpanded ? "bg-gradient-to-r from-yellow-500/10 to-transparent" : ""
              )}
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 text-lg leading-none truncate">{p.name}</span>
                  {officialResults && idx === 0 && <Trophy className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-2">
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
                    <span className="text-3xl font-display text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)] leading-none tracking-tight">{score.total} <span className="text-sm font-sans font-bold text-emerald-600/80 drop-shadow-none">pts</span></span>
                    {score.tiebreakerDistance !== 999 && (
                       <span className={cn(
                         "text-[10px] uppercase font-bold tracking-wider mt-1.5 px-1.5 py-0.5 rounded",
                         score.exactTiebreakerHit ? "bg-emerald-900/80 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400 border border-white/5"
                       )}>
                         Desempate: {score.exactTiebreakerHit ? 'PERFECTO' : `+${score.tiebreakerDistance}`}
                       </span>
                    )}
                  </div>
                ) : (
                  <span className="shrink-0 bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-lg hidden sm:flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-emerald-500" />
                    {p.knockout.champion}
                  </span>
                )}
                <div className="w-8 flex justify-end">
                  {isExpanded ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
                </div>
              </div>
            </button>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-white/5"
                >
                  <div className="p-5 space-y-6 bg-slate-950 pb-6 text-sm relative rounded-b-2xl">
                    
                    {score && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900 p-3 rounded-xl border border-white/5 mb-6 shadow-inner">
                        {score.details.map((d, i) => (
                           <div key={i} className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">{d.category}</span>
                              <span className="font-bold text-slate-200 text-lg">{d.points} <span className="text-xs text-slate-500">pts</span></span>
                           </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900 p-3 rounded-xl border border-white/5 shadow-inner">
                        <span className="block text-xs text-slate-500 uppercase font-semibold mb-1">Campeón</span>
                        <span className="font-bold text-emerald-400">{p.knockout.champion}</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-white/5 shadow-inner">
                        <span className="block text-xs text-slate-500 uppercase font-semibold mb-1">Final España</span>
                        <span className="font-bold text-emerald-400">{p.spain.eliminationStage}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <h4 className="font-bold text-slate-300 border-b border-white/10 pb-1">Fase Final</h4>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-slate-300">
                         <div><span className="text-slate-500 w-24 inline-block">Finalistas:</span> {p.knockout.finalists.join(' y ')}</div>
                         <div><span className="text-slate-500 w-24 inline-block">Semifinalistas:</span> {p.knockout.semifinalists.join(', ')}</div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <h4 className="font-bold text-slate-300 border-b border-white/10 pb-1">Premios</h4>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-slate-300">
                         <div><span className="text-slate-500 w-24 inline-block">Pichichi:</span> {p.awards.pichichi}</div>
                         <div><span className="text-slate-500 w-24 inline-block">Balón Oro:</span> {p.awards.balonDeOro}</div>
                         <div><span className="text-slate-500 w-24 inline-block">Guante Oro:</span> {p.awards.guanteDeOro}</div>
                         <div><span className="text-slate-500 w-24 inline-block">Gol. España:</span> {p.spain.topScorer}</div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <h4 className="font-bold text-slate-300 border-b border-white/10 pb-1">Estadísticas y otros</h4>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-slate-300">
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
