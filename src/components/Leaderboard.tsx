import { Participant } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils';

interface Props {
  participants: Participant[];
}

export default function Leaderboard({ participants }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (participants.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
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

  const sortedParticipants = [...participants].sort((a, b) => b.timestamp - a.timestamp);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24 max-w-2xl mx-auto space-y-4"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Porras Enviadas ({participants.length})</h2>
          <p className="text-sm text-slate-500">Haz clic en un participante para ver sus predicciones</p>
        </div>
      </div>

      {sortedParticipants.map((p) => {
        if (!p.knockout) return null;
        const isExpanded = expandedId === p.id;
        return (
          <div key={p.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all">
            <button 
              onClick={() => toggleExpand(p.id)}
              className="w-full px-5 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors text-left"
            >
              <div>
                <span className="font-bold text-slate-800 text-lg">{p.name}</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(p.timestamp).toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="shrink-0 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-md hidden sm:inline-block">
                  🏆 {p.knockout.champion}
                </span>
                {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
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
                  <div className="p-5 space-y-6 bg-slate-50 pb-6 text-sm">
                    {/* Campeón y España summary */}
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
