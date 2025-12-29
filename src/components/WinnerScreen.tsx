
import React from 'react';
import { Role, Player, GameData, ImposterStrategy } from '../types';
import { Trophy, Ghost, Shield, Frown, ExternalLink } from 'lucide-react';

interface WinnerScreenProps {
  winner: Role | null;
  players: Player[];
  gameData: GameData | null;
  categoryName: string;
  onReset: () => void;
  onRestart: () => void;
}

const WinnerScreen: React.FC<WinnerScreenProps> = ({ winner, players, gameData, categoryName, onReset, onRestart }) => {
  const isCivilianWin = winner === Role.CIVILIAN;
  
  // Players who were accused (voted off)
  const accusedPlayers = players.filter(p => p.isEliminated);
  const accusedNames = accusedPlayers.map(p => p.name).join(", ");
  const allImposters = players.filter(p => p.role === Role.IMPOSTER);

  return (
    <div className="bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl text-center w-full max-h-[90vh] flex flex-col animate-in zoom-in">
      <div className="mb-4 flex-shrink-0">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-2xl ${
          isCivilianWin ? 'bg-indigo-600 shadow-indigo-500/50' : 'bg-red-600 shadow-red-500/50'
        }`}>
          {isCivilianWin ? <Trophy className="text-white w-8 h-8" /> : <Frown className="text-white w-8 h-8" />}
        </div>
        <h2 className={`text-3xl font-black mb-1 tracking-tight ${
          isCivilianWin ? 'text-indigo-400' : 'text-red-400'
        }`}>
          {isCivilianWin ? 'CIVILIANS WIN!' : 'IMPOSTER WINS!'}
        </h2>
        <div className="inline-block px-3 py-1 bg-slate-900 border border-slate-700 rounded-full mb-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Category: <span className="text-white">{categoryName}</span>
          </p>
        </div>
        <p className="text-slate-400 font-medium text-xs">
          {isCivilianWin 
            ? `Fantastic! ${accusedNames} were correctly caught.` 
            : `Wrong guess! The group accused ${accusedNames}.`}
        </p>
      </div>

      <div className="overflow-y-auto pr-2 custom-scrollbar space-y-6 flex-1">
        <div className="grid grid-cols-1 gap-3 text-left">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">The Civilian Word</div>
            <div className="text-xl font-black text-white break-words uppercase tracking-tighter">{gameData?.word}</div>
          </div>
          
          {gameData?.strategy === ImposterStrategy.WRONG_WORD && (
            <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/30">
              <div className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">The Imposter's Word</div>
              <div className="text-xl font-black text-red-100 break-words uppercase tracking-tighter">{gameData?.imposterWord}</div>
            </div>
          )}

          {gameData?.strategy === ImposterStrategy.HINT && (
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">The Imposter's Hint</div>
              <div className="text-base font-bold text-white italic">"{gameData?.hint}"</div>
            </div>
          )}

          {gameData?.strategy === ImposterStrategy.BLIND && (
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Imposter Strategy</div>
              <div className="text-base font-bold text-white">Blind Mode (No info given)</div>
            </div>
          )}
        </div>

        {gameData?.sources && gameData.sources.length > 0 && (
          <div className="text-left bg-slate-900/40 p-3 rounded-xl border border-slate-700/50">
            <h3 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <ExternalLink className="w-3 h-3" /> Sources & Verification
            </h3>
            <div className="flex flex-wrap gap-2">
              {gameData.sources.map((source, idx) => (
                <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 flex items-center gap-1">
                  {source.title || 'Source'}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="text-left">
          <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2">Players Summary</h3>
          <div className="grid grid-cols-1 gap-2">
            {players.map(player => {
              const isAccused = player.isEliminated;
              return (
                <div key={player.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isAccused ? 'bg-slate-700 border-white shadow-lg' : 'bg-slate-900 border-slate-800 opacity-80'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 text-sm">{player.name}</span>
                    {isAccused && <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded font-black uppercase">Accused</span>}
                  </div>
                  <div className={`text-[8px] font-black uppercase px-2 py-1 rounded-md flex items-center gap-1 ${
                    player.role === Role.IMPOSTER ? 'bg-red-900/40 text-red-400' : 'bg-indigo-900/40 text-indigo-400'
                  }`}>
                    {player.role === Role.IMPOSTER ? <Ghost className="w-2.5 h-2.5"/> : <Shield className="w-2.5 h-2.5"/>}
                    {player.role}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 flex-shrink-0 grid grid-cols-2 gap-3">
        <button onClick={onRestart} className="py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black rounded-xl transition-all shadow-lg text-sm uppercase tracking-widest">
          Rematch
        </button>
        <button onClick={onReset} className="py-4 bg-slate-700 hover:bg-slate-600 text-white font-black rounded-xl transition-all text-sm uppercase tracking-widest">
          New Category
        </button>
      </div>
    </div>
  );
};

export default WinnerScreen;
