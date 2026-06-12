import { useState, useEffect } from 'react';
import { PlusCircle, List, Trophy, Settings } from 'lucide-react';
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
    <div className="min-h-screen font-sans antialiased text-slate-900 bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight hidden sm:block">Tu Porra Mundial</h1>
            <h1 className="font-bold text-lg tracking-tight sm:hidden">Tu Porra</h1>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setView('leaderboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === 'leaderboard' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Ranking</span>
            </button>
            <button
              onClick={() => setView('form')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === 'form' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Porra</span>
            </button>
            <button
              onClick={() => setView('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === 'admin' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Resultados Oficiales</span>
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 pt-6 pb-24">
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
            className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
          >
            <PlusCircle className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
