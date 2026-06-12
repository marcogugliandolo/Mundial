import { useState, useEffect } from 'react';
import { PlusCircle, List, Globe, Settings, TrendingUp } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { Participant, PorraData } from './types';
import ParticipateForm from './components/ParticipateForm';
import Leaderboard from './components/Leaderboard';

export default function App() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [officialResults, setOfficialResults] = useState<PorraData | null>(null);
  const [view, setView] = useState<'leaderboard' | 'form' | 'admin'>('leaderboard');

  useEffect(() => {
    const saved = localStorage.getItem('porra_participants');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const valid = Array.isArray(parsed) ? parsed.filter((p: any) => p.knockout) : [];
        setParticipants(valid);
      } catch (e) {
        console.error('Error loading bets', e);
      }
    }
    
    const savedOfficial = localStorage.getItem('porra_official_results');
    if (savedOfficial) {
      try {
        setOfficialResults(JSON.parse(savedOfficial));
      } catch (e) {
        console.error('Error loading official results', e);
      }
    }
  }, []);

  const handleAddParticipant = (participant: Participant) => {
    const updated = [...participants, participant];
    setParticipants(updated);
    localStorage.setItem('porra_participants', JSON.stringify(updated));
    setView('leaderboard');
  };

  const handleSaveOfficialResults = (data: Participant) => {
    // We reuse Participant form, but ignore id/name/timestamp
    const { id, name, timestamp, ...porraData } = data;
    setOfficialResults(porraData);
    localStorage.setItem('porra_official_results', JSON.stringify(porraData));
    setView('leaderboard');
  };

  return (
    <div className="min-h-screen font-sans antialiased text-slate-800 bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-2 rounded-xl shadow-inner border border-white/10">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-extrabold text-xl tracking-tight text-white hidden sm:block">Porra Mundial</h1>
            <h1 className="font-extrabold text-lg tracking-tight text-white sm:hidden">Porra Mundial</h1>
          </div>
          
          <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5 backdrop-blur-md">
            <button
              onClick={() => setView('leaderboard')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                view === 'leaderboard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Ranking</span>
            </button>
            <button
              onClick={() => setView('form')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                view === 'form' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Porra</span>
            </button>
            <button
              onClick={() => setView('admin')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                view === 'admin' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Oficial</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8 pb-28">
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
            className="flex items-center justify-center w-14 h-14 bg-slate-900 border border-slate-700 text-white rounded-full shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all"
          >
            <PlusCircle className="w-6 h-6 text-indigo-400" />
          </button>
        </div>
      )}
    </div>
  );
}
