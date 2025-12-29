
import React, { useState, useEffect } from 'react';
import { Player, Role } from '../types';
import { Skull, MessageSquare, Clock, PlayCircle, CheckCircle2, UserCheck, Users } from 'lucide-react';

interface GamePlayScreenProps {
  players: Player[];
  onEliminate: (ids: number[]) => void;
  duration: number;
}

const GamePlayScreen: React.FC<GamePlayScreenProps> = ({ players, onEliminate, duration }) => {
  const [isVoting, setIsVoting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [timerActive, setTimerActive] = useState(true);
  const [selectedSuspectIds, setSelectedSuspectIds] = useState<number[]>([]);

  const initialImposterCount = players.filter(p => p.role === Role.IMPOSTER).length;

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) {
      if (timeLeft <= 0 && !isVoting) {
        setIsVoting(true);
        setTimerActive(false);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, timerActive, isVoting]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleSuspect = (id: number) => {
    setSelectedSuspectIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(pId => pId !== id);
      }
      if (prev.length < initialImposterCount) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleConfirmVote = () => {
    if (selectedSuspectIds.length === initialImposterCount) {
      onEliminate(selectedSuspectIds);
    }
  };

  const isLowTime = timeLeft <= 10;
  const canLockIn = selectedSuspectIds.length === initialImposterCount;

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto p-2">
      <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">
        {/* Timer UI */}
        <div className={`flex items-center justify-center gap-3 mb-6 p-4 rounded-2xl border transition-all duration-300 ${
          isLowTime && timerActive
            ? 'bg-red-900/20 border-red-500/50 animate-pulse' 
            : 'bg-slate-900 border-slate-700'
        }`}>
          <Clock className={`w-6 h-6 ${isLowTime && timerActive ? 'text-red-500' : 'text-cyan-400'}`} />
          <span className={`text-3xl font-mono font-bold ${isLowTime && timerActive ? 'text-red-500' : 'text-white'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {!isVoting ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="text-indigo-400" />
                Discussion Phase
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-700 rounded-full">
                <Users className="w-3 h-3 text-slate-300" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  {players.length} Players
                </span>
              </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 mb-6">
              <p className="text-slate-400 text-sm leading-relaxed">
                Describe your secret. Be subtle. The Imposter is listening!
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">
                  Target: Find {initialImposterCount} {initialImposterCount === 1 ? 'Imposter' : 'Imposters'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {players.map(player => (
                <div 
                  key={player.id}
                  className="p-4 rounded-xl border border-slate-700 bg-slate-900/40 text-center shadow-sm"
                >
                  <div className="font-black text-slate-300 text-xs uppercase truncate">{player.name}</div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => {
                setTimerActive(false);
                setIsVoting(true);
              }}
              className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group active:scale-95 uppercase tracking-widest text-sm"
            >
              <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Start Voting
            </button>
          </>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-red-400 mb-1 flex items-center gap-2 uppercase tracking-tighter">
                  <Skull className="w-6 h-6" />
                  Accusation
                </h2>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                  Select exactly {initialImposterCount} {initialImposterCount === 1 ? 'player' : 'players'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-slate-500 uppercase">Selected</div>
                <div className="text-2xl font-black text-white">{selectedSuspectIds.length}<span className="text-slate-600">/{initialImposterCount}</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {players.map(player => {
                const isSelected = selectedSuspectIds.includes(player.id);
                return (
                  <button 
                    key={player.id}
                    type="button"
                    onClick={() => handleToggleSuspect(player.id)}
                    className={`w-full p-4 flex items-center justify-between rounded-xl transition-all border-2 text-left group ${
                      isSelected 
                        ? 'bg-red-900/30 border-red-500 text-white shadow-lg' 
                        : 'bg-slate-900/50 border-slate-700 hover:border-slate-600 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors font-black text-xs ${
                        isSelected ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-600'
                      }`}>
                        {player.name[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-lg tracking-tight uppercase">{player.name}</span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-6 h-6 text-red-400 animate-in zoom-in" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-700">
              <button 
                type="button"
                disabled={!canLockIn}
                onClick={handleConfirmVote}
                className={`w-full py-5 flex items-center justify-center gap-3 font-black rounded-2xl transition-all text-xl uppercase tracking-widest active:scale-95 ${
                  canLockIn 
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_4px_20px_rgba(220,38,38,0.4)]' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed grayscale'
                }`}
              >
                <UserCheck className="w-6 h-6" />
                {canLockIn ? 'Lock In Suspects' : `Choose ${initialImposterCount} Suspects`}
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  setIsVoting(false);
                  setSelectedSuspectIds([]);
                  setTimerActive(true);
                }}
                className="w-full mt-4 text-slate-500 hover:text-slate-300 text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                Return to Discussion
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};

export default GamePlayScreen;
