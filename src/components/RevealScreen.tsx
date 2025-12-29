
import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { Eye, EyeOff, User, ArrowRight, ShieldCheck } from 'lucide-react';

interface RevealScreenProps {
  player: Player;
  onNext: () => void;
  isLast: boolean;
  isOnline?: boolean;
}

const RevealScreen: React.FC<RevealScreenProps> = ({ player, onNext, isLast, isOnline }) => {
  const [revealed, setRevealed] = useState(false);

  // Robustly reset revealed state whenever the player component is re-used
  useEffect(() => {
    setRevealed(false);
  }, [player.id, player.name]);

  const handleNext = () => {
    // Only allow next if revealed to prevent accidental skipping
    if (revealed) {
      onNext();
    }
  };

  return (
    <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl text-center w-full max-w-lg animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-6">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 ${
          isOnline ? 'bg-cyan-900/30 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-slate-700 border-slate-600'
        }`}>
          {isOnline ? <ShieldCheck className="text-cyan-400" /> : <User className="text-slate-400" />}
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight uppercase">{player.name}</h2>
        <p className="text-slate-400 mt-2 font-medium">
          {isOnline ? 'Confirm your secret identity' : `Pass the device to ${player.name}`}
        </p>
      </div>

      <div className="my-10 relative group">
        {!revealed ? (
          <button 
            onClick={() => setRevealed(true)}
            className="w-full py-14 bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-indigo-500 hover:bg-slate-900/80 transition-all cursor-pointer group active:scale-[0.98]"
          >
            <EyeOff className="w-12 h-12 text-slate-600 group-hover:text-indigo-400 transition-colors" />
            <span className="text-slate-500 font-black group-hover:text-indigo-300 uppercase tracking-widest text-xs">Tap to Reveal Your Secret</span>
          </button>
        ) : (
          <div className="w-full py-12 bg-indigo-900/20 border-2 border-indigo-500/50 rounded-2xl animate-in zoom-in duration-300 shadow-[0_0_25px_rgba(99,102,241,0.15)]">
            <div className="mb-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Your Secret Info</div>
            <div className="text-4xl font-black text-white px-4 break-words uppercase tracking-tighter leading-tight">
              {player.secret}
            </div>
            <div className={`mt-5 text-[10px] font-bold px-3 py-1 rounded-full inline-block ${
              player.role === 'IMPOSTER' ? 'bg-red-900/40 text-red-400' : 'bg-green-900/40 text-green-400'
            }`}>
              {player.role === 'IMPOSTER' ? 'ROLE: IMPOSTER (HINT ONLY)' : 'ROLE: CIVILIAN (THE WORD)'}
            </div>
          </div>
        )}
      </div>

      <button 
        disabled={!revealed}
        onClick={handleNext}
        className={`w-full py-4 flex items-center justify-center gap-2 font-black rounded-xl transition-all shadow-lg text-sm tracking-widest uppercase ${
          revealed 
            ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white hover:from-indigo-500 hover:to-cyan-500 active:scale-95' 
            : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
        }`}
      >
        {isOnline ? 'ENTER GAME' : (isLast ? 'START THE ROUND' : 'I\'VE SEEN IT - NEXT PLAYER')}
        <ArrowRight className="w-5 h-5" />
      </button>

      {!revealed && (
        <p className="mt-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest">Make sure no one else is looking!</p>
      )}
    </div>
  );
};

export default RevealScreen;
