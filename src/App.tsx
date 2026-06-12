import { useState, useEffect } from 'react';
import { PlusCircle, Settings, TrendingUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Participant, PorraData } from './types';
import ParticipateForm from './components/ParticipateForm';
import Leaderboard from './components/Leaderboard';

const SoccerBallIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="12 16 15.8 13.2 14.4 8.8 9.6 8.8 8.2 13.2" />
    <path d="M12 16v6" />
    <path d="M15.8 13.2l5.7 1.9" />
    <path d="M14.4 8.8l3.5-4.9" />
    <path d="M9.6 8.8L6.1 3.9" />
    <path d="M8.2 13.2L2.5 15.1" />
  </svg>
);

export default function App() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [officialResults, setOfficialResults] = useState<PorraData | null>(null);
  const [view, setView] = useState<'leaderboard' | 'form' | 'admin'>('leaderboard');

  useEffect(() => {
    fetch('/api/participants')
      .then(res => res.json())
      .then(data => {
        const valid = Array.isArray(data) ? data.filter((p: any) => p.knockout) : [];
        setParticipants(valid);
      })
      .catch(e => console.error('Error loading bets', e));

    fetch('/api/official')
      .then(res => res.json())
      .then(data => {
        setOfficialResults(data);
      })
      .catch(e => console.error('Error loading official results', e));
  }, []);

  const handleAddParticipant = async (participant: Participant) => {
    try {
      await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(participant),
      });
      setParticipants(prev => [...prev, participant]);
      setView('leaderboard');
    } catch (e) {
      console.error('Error saving participant', e);
      alert('Error guardando la porra. Inténtalo de nuevo.');
    }
  };

  const handleSaveOfficialResults = async (data: Participant) => {
    const { id, name, timestamp, ...porraData } = data;
    try {
      await fetch('/api/official', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(porraData),
      });
      setOfficialResults(porraData);
      setView('leaderboard');
    } catch (e) {
      console.error('Error saving official results', e);
      alert('Error guardando los resultados. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="min-h-screen font-sans antialiased text-slate-100 bg-slate-950 selection:bg-emerald-500/30 selection:text-emerald-200 w-full relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-10" />
      
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-2 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-white/20"
            >
              <SoccerBallIcon className="w-5 h-5 text-slate-950 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
            </motion.div>
            <h1 className="font-display text-2xl tracking-widest text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)] hidden sm:block mt-1">PORRA MUNDIAL</h1>
            <h1 className="font-display text-xl tracking-widest text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)] sm:hidden mt-1">PORRA MUNDIAL</h1>
          </div>
          
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/5 backdrop-blur-md">
            <button
              onClick={() => setView('leaderboard')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                view === 'leaderboard' ? 'bg-slate-800 text-emerald-400 shadow-sm shadow-emerald-900/20 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Ranking</span>
            </button>
            <button
              onClick={() => setView('form')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                view === 'form' ? 'bg-slate-800 text-emerald-400 shadow-sm shadow-emerald-900/20 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Porra</span>
            </button>
            <button
              onClick={() => setView('admin')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                view === 'admin' ? 'bg-emerald-600 text-slate-950 shadow-sm border border-emerald-400' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Oficial</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8 pb-28 relative z-10">
        <AnimatePresence mode="wait">
          {view === 'leaderboard' ? (
            <Leaderboard 
              key="leaderboard" 
              participants={participants} 
              officialResults={officialResults} 
            />
          ) : view === 'admin' ? (
            <ParticipateForm 
              key="admin" 
              onSubmit={handleSaveOfficialResults} 
              onCancel={() => setView('leaderboard')} 
              isAdmin={true}
              initialData={officialResults}
            />
          ) : (
            <ParticipateForm 
              key="form" 
              onSubmit={handleAddParticipant} 
              onCancel={() => setView('leaderboard')} 
              isAdmin={false}
            />
          )}
        </AnimatePresence>
      </main>

      {view === 'leaderboard' && (
        <div className="fixed bottom-6 right-6 z-20">
          <button
            onClick={() => setView('form')}
            className="flex items-center justify-center w-14 h-14 bg-emerald-600 border border-emerald-400 text-slate-950 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all"
          >
            <PlusCircle className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
