import { useState, useEffect, FormEvent } from 'react';
import { Participant, GroupPhasePrediction, PorraData } from '../types';
import { GROUPS, ALL_TEAMS, SPAIN_STAGES, SPAIN_PLAYERS, PICHICHI_CANDIDATES, BALON_DE_ORO_CANDIDATES, GUANTE_DE_ORO_CANDIDATES, CONMEBOL_TEAMS, CAF_TEAMS, AFC_TEAMS } from '../data';
import { Save, User, ChevronRight, ChevronLeft, Flag, Trophy, Target, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

interface Props {
  onSubmit: (participant: Participant) => void;
  onCancel: () => void;
  isAdmin?: boolean;
  initialData?: PorraData | null;
  key?: string;
}

export default function ParticipateForm({ onSubmit, onCancel, isAdmin = false, initialData }: Props) {
  const [step, setStep] = useState(isAdmin ? 2 : 1);
  const [name, setName] = useState(isAdmin ? 'Resultados Oficiales' : '');
  
  // State for Step 2: Groups
  const [groupPhase, setGroupPhase] = useState<GroupPhasePrediction[]>(
    initialData?.groupPhase || GROUPS.map(g => ({ group: g.name, first: '', second: '' }))
  );
  
  // State for Step 3: Knockout
  const [semifinalists, setSemifinalists] = useState<string[]>(
    initialData?.knockout.semifinalists || ['', '', '', '']
  );
  const [finalists, setFinalists] = useState<string[]>(
    initialData?.knockout.finalists || ['', '']
  );
  const [champion, setChampion] = useState<string>(
    initialData?.knockout.champion || ''
  );

  // State for Step 4: Spain & Awards
  const [eliminationStage, setEliminationStage] = useState(initialData?.spain.eliminationStage || '');
  const [topScorer, setTopScorer] = useState(initialData?.spain.topScorer || '');
  const [pichichi, setPichichi] = useState(initialData?.awards.pichichi || '');
  const [balonDeOro, setBalonDeOro] = useState(initialData?.awards.balonDeOro || '');
  const [guanteDeOro, setGuanteDeOro] = useState(initialData?.awards.guanteDeOro || '');

  // State for Step 5: Stats
  const [revelacion, setRevelacion] = useState(initialData?.stats.revelacion || '');
  const [decepcion, setDecepcion] = useState(initialData?.stats.decepcion || '');
  const [masGoleadora, setMasGoleadora] = useState(initialData?.stats.masGoleadora || '');
  const [masTarjetas, setMasTarjetas] = useState(initialData?.stats.masTarjetas || '');
  const [penaltisFaseFinal, setPenaltisFaseFinal] = useState<'Sí' | 'No' | ''>(initialData?.stats.penaltisFaseFinal || '');
  const [mejorConmebol, setMejorConmebol] = useState(initialData?.stats.mejorConmebol || '');
  const [mejorCaf, setMejorCaf] = useState(initialData?.stats.mejorCaf || '');
  const [mejorAfc, setMejorAfc] = useState(initialData?.stats.mejorAfc || '');
  const [golesFinal, setGolesFinal] = useState<number | ''>(initialData?.stats.golesFinal ?? '');

  const updateGroup = (groupName: string, field: 'first' | 'second', val: string) => {
    setGroupPhase(prev => prev.map(g => g.group === groupName ? { ...g, [field]: val } : g));
  };

  const isStep1Valid = name.trim().length > 0;
  const isStep2Valid = groupPhase.every(g => g.first && g.second && g.first !== g.second);
  const isStep3Valid = 
    semifinalists.every(s => s) && new Set(semifinalists).size === 4 &&
    finalists.every(f => f) && new Set(finalists).size === 2 &&
    finalists.every(f => semifinalists.includes(f)) &&
    champion && finalists.includes(champion);
  const isStep4Valid = eliminationStage && topScorer && pichichi && balonDeOro && guanteDeOro;
  const isStep5Valid = revelacion && decepcion && masGoleadora && masTarjetas && penaltisFaseFinal && mejorConmebol && mejorCaf && mejorAfc && golesFinal !== '';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isStep5Valid) return;

    onSubmit({
      id: isAdmin ? 'admin' : crypto.randomUUID(),
      name: name.trim(),
      groupPhase,
      knockout: { semifinalists, finalists, champion },
      spain: { eliminationStage, topScorer },
      awards: { pichichi, balonDeOro, guanteDeOro },
      stats: { revelacion, decepcion, masGoleadora, masTarjetas, penaltisFaseFinal, mejorConmebol, mejorCaf, mejorAfc, golesFinal },
      timestamp: Date.now()
    });
  };

  const renderSelect = (label: string, value: string, setValue: (v: string) => void, options: string[], placeholder: string = "Selecciona...") => (
    <div className="flex flex-col gap-1.5 ">
      <label className="text-sm font-semibold text-slate-300">{label}</label>
      <select 
        value={value} 
        onChange={e => setValue(e.target.value)}
        className="h-11 px-3 bg-slate-800 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-200 text-sm appearance-none shadow-inner"
      >
        <option value="" disabled className="text-slate-500">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="mb-8 p-4 bg-slate-900 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-display text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] tracking-wide">
              {isAdmin && "Resultados Oficiales - "}
              {step === 1 && "Paso 1: Identificación"}
              {step === 2 && "Paso 2: Fase de Grupos"}
              {step === 3 && "Paso 3: Fase Final"}
              {step === 4 && "Paso 4: España y Premios"}
              {step === 5 && "Paso 5: Rendimiento"}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {isAdmin ? "Ingresa los resultados reales para calcular los puntos." : "Completando tu porra para el Mundial de 48 selecciones."}
            </p>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].filter(s => !(isAdmin && s === 1)).map(s => (
              <div key={s} className={cn(
                "h-2 w-10 sm:w-12 rounded-full transition-colors",
                s === step ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : s < step ? "bg-emerald-900/60" : "bg-slate-800"
              )} />
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {step === 1 && !isAdmin && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <div className="bg-slate-900 p-6 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/5">
                <label className="block text-sm font-semibold text-slate-300 mb-2">Tu Nombre o Alias</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Marco o Diego"
                    className="pl-10 w-full h-12 bg-slate-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-100 shadow-inner"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <div className="bg-emerald-900/30 text-emerald-400 p-4 rounded-xl text-sm font-medium border border-emerald-500/20 flex gap-3 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                <Flag className="shrink-0" />
                <p>Clasifican 2 selecciones por grupo. Asegúrate de acertar también la POSICIÓN EXACTA (1º o 2º) para ganar más puntos.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GROUPS.map((g, idx) => (
                  <div key={g.name} className="bg-slate-900 p-4 rounded-xl shadow-lg border border-white/5">
                    <div className="font-bold text-slate-200 mb-3">{g.name}</div>
                    <div className="space-y-3">
                      {renderSelect("1º Clasificado", groupPhase[idx].first, (v) => updateGroup(g.name, 'first', v), g.teams)}
                      {renderSelect("2º Clasificado", groupPhase[idx].second, (v) => updateGroup(g.name, 'second', v), g.teams)}
                      {groupPhase[idx].first && groupPhase[idx].first === groupPhase[idx].second && (
                        <p className="text-red-400/90 text-xs font-semibold">Selecciones duplicadas no válidas.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <div className="bg-slate-900 p-6 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/5 space-y-6">
                <div>
                  <h3 className="text-2xl font-display text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] tracking-wide border-b border-white/10 pb-2 mb-4 uppercase">Semifinalistas (4)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map(i => renderSelect(`Semifinalista ${i + 1}`, semifinalists[i], (v) => {
                      const newArr = [...semifinalists];
                      newArr[i] = v;
                      setSemifinalists(newArr);
                    }, ALL_TEAMS))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-display text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] tracking-wide border-b border-white/10 pb-2 mb-4 mt-6 uppercase">Finalistas (2)</h3>
                  <p className="text-xs text-slate-500 mb-4">Solo puedes elegir de entre los semifinalistas que has seleccionado.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[0, 1].map(i => renderSelect(`Finalista ${i + 1}`, finalists[i], (v) => {
                      const newArr = [...finalists];
                      newArr[i] = v;
                      setFinalists(newArr);
                    }, semifinalists.filter(s => s)))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-display text-slate-200 tracking-wide border-b border-white/10 pb-2 mb-4 mt-6 uppercase">Campeón</h3>
                  {renderSelect("Campeón del Mundo", champion, setChampion, finalists.filter(f => f))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <div className="bg-slate-900 p-6 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/5 space-y-6">
                 <div>
                  <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                    <Target className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    <h3 className="text-2xl font-display text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] tracking-wide uppercase">Especial España</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderSelect("Puesto de eliminación", eliminationStage, setEliminationStage, SPAIN_STAGES)}
                    {renderSelect("Máximo goleador España", topScorer, setTopScorer, SPAIN_PLAYERS)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2 mt-6">
                    <Trophy className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                    <h3 className="text-2xl font-display text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] tracking-wide uppercase">Premios Individuales</h3>
                  </div>
                  <div className="space-y-4">
                    {renderSelect("Pichichi / Bota de Oro", pichichi, setPichichi, PICHICHI_CANDIDATES)}
                    {renderSelect("Balón de Oro", balonDeOro, setBalonDeOro, BALON_DE_ORO_CANDIDATES)}
                    {renderSelect("Guante de Oro", guanteDeOro, setGuanteDeOro, GUANTE_DE_ORO_CANDIDATES)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <div className="bg-slate-900 p-6 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/5 space-y-6">
                 <div>
                  <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                    <Activity className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <h3 className="text-2xl font-display text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] tracking-wide uppercase">Estadísticas</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderSelect("Selección Revelación", revelacion, setRevelacion, ALL_TEAMS)}
                    {renderSelect("Selección Decepción", decepcion, setDecepcion, ALL_TEAMS)}
                    {renderSelect("Selección más goleadora", masGoleadora, setMasGoleadora, ALL_TEAMS)}
                    {renderSelect("Selección con más tarjetas", masTarjetas, setMasTarjetas, ALL_TEAMS)}
                    {renderSelect("¿Penaltis en fase final?", penaltisFaseFinal, v => setPenaltisFaseFinal(v as 'Sí'|'No'), ['Sí', 'No'])}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-display text-slate-200 tracking-wide border-b border-white/10 pb-2 mb-4 mt-6 uppercase">Mejor por Continente</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderSelect("CONMEBOL (Sudamérica)", mejorConmebol, setMejorConmebol, CONMEBOL_TEAMS)}
                    {renderSelect("CAF (África)", mejorCaf, setMejorCaf, CAF_TEAMS)}
                    {renderSelect("AFC (Asia/Oceanía)", mejorAfc, setMejorAfc, AFC_TEAMS)}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-display text-slate-200 tracking-wide border-b border-white/10 pb-2 mb-4 mt-6 uppercase">Desempate</h3>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-300">Goles totales en la Final (Cercanía sin pasarse)</label>
                    <input
                      type="number"
                      min="0"
                      value={golesFinal}
                      onChange={e => setGolesFinal(e.target.value ? parseInt(e.target.value, 10) : '')}
                      placeholder="Ej. 3"
                      className="h-11 px-3 bg-slate-800 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-100 shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/90 backdrop-blur-md border-t border-white/10 flex justify-center gap-3 z-10">
          <div className="w-full max-w-3xl flex gap-3">
            {(step === 1 && !isAdmin) || (step === 2 && isAdmin) ? (
              <button
                type="button"
                onClick={onCancel}
                className="w-1/3 py-3.5 px-4 bg-slate-800 text-slate-300 font-semibold rounded-xl hover:bg-slate-700 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="w-1/3 py-3.5 px-4 bg-slate-800 text-slate-300 font-semibold rounded-xl hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-5 h-5" />
                Atrás
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && isStep1Valid) setStep(2);
                  if (step === 2 && isStep2Valid) setStep(3);
                  if (step === 3 && isStep3Valid) setStep(4);
                  if (step === 4 && isStep4Valid) setStep(5);
                }}
                disabled={
                  (step === 1 && !isStep1Valid) ||
                  (step === 2 && !isStep2Valid) ||
                  (step === 3 && !isStep3Valid) ||
                  (step === 4 && !isStep4Valid)
                }
                className={cn(
                  "flex-1 py-3.5 px-4 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1",
                  "bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                )}
              >
                Siguiente
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
               <button
                type="submit"
                disabled={!isStep5Valid}
                className={cn(
                  "flex-1 py-3.5 px-4 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                  "bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                )}
              >
                <Save className="w-5 h-5" />
                {isAdmin ? "Guardar Resultados" : "Guardar Porra"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
