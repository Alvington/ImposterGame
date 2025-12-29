
import React, { useState, useEffect } from 'react';
import { Users, Layers, Zap, Plus, Bookmark, Copy, Check, Ghost, Brain, EyeOff, Loader2 } from 'lucide-react';
import { Difficulty, CustomCategory, ImposterStrategy, LobbySettings } from '../types';
import { storageService } from '../services/storageService';
import CustomCategoryModal from './CustomCategoryModal';

interface SetupScreenProps {
  onStart: (playerNames: string[], numImposters: number, category: string, duration: number, difficulty: Difficulty, strategy: ImposterStrategy, customCategory?: CustomCategory) => void;
  isOnline?: boolean;
  roomCode?: string | null;
  isHost?: boolean;
  lobbyPlayers?: { name: string, peerId: string }[];
  syncedSettings?: LobbySettings;
  onSettingsChange?: (settings: LobbySettings) => void;
}

const CATEGORIES = [
  "Christmas", "Bible", "Animals & Nature", "Anime", "Famous People", 
  "Food & Drink", "Brands", "Fashion & Clothes", "Film & TV", 
  "Games", "Music", "Sports", "World & Flags", "Transport", 
  "Easter", "Pop Culture", "Silly & Random"
];

const STORAGE_KEY_NAMES = 'imposter_player_names_cache';
const STORAGE_KEY_COUNT = 'imposter_player_count_cache';

const SetupScreen: React.FC<SetupScreenProps> = ({ 
  onStart, isOnline, roomCode, isHost, lobbyPlayers = [], syncedSettings, onSettingsChange 
}) => {
  const [numPlayers, setNumPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COUNT);
      return saved ? Math.min(Math.max(parseInt(saved), 3), 12) : 4;
    } catch (e) { return 4; }
  });

  const [playerNames, setPlayerNames] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NAMES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { /* ignore corrupted storage */ }
    return ["", "", "", ""];
  });

  const [numImposters, setNumImposters] = useState(syncedSettings?.numImposters || 1);
  const [duration, setDuration] = useState(syncedSettings?.duration || 180);
  const [selectedCategory, setSelectedCategory] = useState(syncedSettings?.category || "Silly & Random");
  const [difficulty, setDifficulty] = useState<Difficulty>(syncedSettings?.difficulty || Difficulty.AVERAGE);
  const [strategy, setStrategy] = useState<ImposterStrategy>(syncedSettings?.strategy || ImposterStrategy.HINT);
  
  const [copied, setCopied] = useState(false);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isOnline && !isHost && syncedSettings) {
      setNumImposters(syncedSettings.numImposters);
      setDuration(syncedSettings.duration);
      setSelectedCategory(syncedSettings.category);
      setDifficulty(syncedSettings.difficulty);
      setStrategy(syncedSettings.strategy);
    }
  }, [syncedSettings, isOnline, isHost]);

  useEffect(() => {
    if (isOnline && isHost && onSettingsChange) {
      onSettingsChange({
        category: selectedCategory,
        difficulty,
        strategy,
        numImposters,
        duration
      });
    }
  }, [selectedCategory, difficulty, strategy, numImposters, duration, isOnline, isHost]);

  useEffect(() => {
    if (!isOnline) {
      try {
        localStorage.setItem(STORAGE_KEY_COUNT, numPlayers.toString());
        localStorage.setItem(STORAGE_KEY_NAMES, JSON.stringify(playerNames));
      } catch (e) { /* Storage failed */ }
    }
  }, [numPlayers, playerNames, isOnline]);

  useEffect(() => {
    setCustomCategories(storageService.getCustomCategories());
  }, []);

  useEffect(() => {
    if (!isOnline) {
      setPlayerNames(prev => {
        const next = [...prev];
        if (numPlayers > next.length) {
          while (next.length < numPlayers) next.push("");
        } else if (numPlayers < next.length) {
          return next.slice(0, numPlayers);
        }
        return next;
      });
    }
  }, [numPlayers, isOnline]);

  const handleCopy = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNameChange = (index: number, value: string) => {
    const nextNames = [...playerNames];
    nextNames[index] = value;
    setPlayerNames(nextNames);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOnline && !isHost) return;
    const finalNames = isOnline 
      ? lobbyPlayers.map(p => p.name)
      : playerNames.slice(0, numPlayers).map((name, i) => name.trim() || `Player ${i + 1}`);
    
    const custom = customCategories.find(c => c.name === selectedCategory);
    onStart(finalNames, numImposters, selectedCategory, duration, difficulty, strategy, custom);
  };

  const handleSaveCustom = (category: CustomCategory) => {
    storageService.saveCustomCategory(category);
    setCustomCategories(storageService.getCustomCategories());
    setSelectedCategory(category.name);
    setIsModalOpen(false);
  };

  const currentCount = isOnline ? lobbyPlayers.length : numPlayers;

  return (
    <div className="bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl w-full max-h-[92vh] flex flex-col relative animate-in fade-in zoom-in">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h2 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
          <Users className="text-indigo-400" />
          {isOnline ? (isHost ? 'Online Lobby (Host)' : 'Online Lobby') : 'Game Setup'}
        </h2>
        {isOnline && roomCode && (
          <button onClick={handleCopy} className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl flex items-center gap-2 hover:bg-slate-700 transition-all">
            <span className="text-xs font-black text-cyan-400">{roomCode}</span>
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-slate-500" />}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Imposter Strategy</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: ImposterStrategy.HINT, icon: Brain, label: 'Hint', sub: 'Clue given' },
                  { id: ImposterStrategy.WRONG_WORD, icon: Ghost, label: 'Wrong Word', sub: 'Related word' },
                  { id: ImposterStrategy.BLIND, icon: EyeOff, label: 'Blind', sub: 'No info' }
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    disabled={isOnline && !isHost}
                    onClick={() => setStrategy(s.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                      strategy === s.id 
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg scale-[1.05]' 
                        : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                    } ${(isOnline && !isHost) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <s.icon className={`w-5 h-5 ${strategy === s.id ? 'text-white' : 'text-slate-500'}`} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase">{s.label}</span>
                      <span className={`text-[8px] font-medium opacity-60 ${strategy === s.id ? 'text-indigo-100' : 'text-slate-600'}`}>{s.sub}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <Zap className="w-3 h-3" /> Difficulty
              </label>
              <div className="grid grid-cols-4 gap-1">
                {Object.values(Difficulty).map(d => (
                  <button
                    key={d}
                    type="button"
                    disabled={isOnline && !isHost}
                    onClick={() => setDifficulty(d)}
                    className={`px-1 py-2 text-[8px] font-black rounded-lg border transition-all uppercase tracking-tighter ${
                      difficulty === d 
                        ? 'bg-cyan-600 border-cyan-400 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-500'
                    } ${(isOnline && !isHost) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {!isOnline && (
                <div>
                  <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Players: {numPlayers}</label>
                  <input type="range" min="3" max="12" value={numPlayers} onChange={(e) => setNumPlayers(parseInt(e.target.value))} className="w-full accent-indigo-500" />
                </div>
              )}
              <div className={isOnline ? 'col-span-2' : ''}>
                <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Imposters: {numImposters}</label>
                <input 
                  type="range" 
                  min="1" 
                  max={Math.max(1, Math.floor(currentCount / 2))} 
                  value={numImposters} 
                  disabled={isOnline && !isHost}
                  onChange={(e) => setNumImposters(parseInt(e.target.value))} 
                  className={`w-full accent-red-500 ${(isOnline && !isHost) ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <Layers className="w-3 h-3" /> Category
                </label>
                {!isOnline || isHost ? (
                  <button type="button" onClick={() => setIsModalOpen(true)} className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">+ Custom</button>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar-thin">
                {customCategories.map(cat => (
                  <button key={cat.id} type="button" disabled={isOnline && !isHost} onClick={() => setSelectedCategory(cat.name)} className={`w-full px-3 py-2 text-[10px] font-black rounded-lg border transition-all truncate ${selectedCategory === cat.name ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                    {cat.name}
                  </button>
                ))}
                {CATEGORIES.map(cat => (
                  <button key={cat} type="button" disabled={isOnline && !isHost} onClick={() => setSelectedCategory(cat)} className={`px-3 py-2 text-[10px] font-black rounded-lg border transition-all ${selectedCategory === cat ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              {isOnline ? `Participants (${lobbyPlayers.length})` : 'Player Names'}
            </label>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar-thin">
              {isOnline ? (
                lobbyPlayers.length === 0 ? (
                  <div className="p-8 bg-slate-900/50 border border-slate-700 border-dashed rounded-2xl text-center">
                    <p className="text-slate-500 text-xs font-medium">Waiting for players...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {lobbyPlayers.map((p, i) => (
                      <div key={p.peerId} className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-200">{p.name}</span>
                        {i === 0 && <span className="text-[8px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 font-black uppercase">Host</span>}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                playerNames.slice(0, numPlayers).map((name, index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder={`Player ${index + 1}`}
                    value={name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm text-slate-200 outline-none"
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {(!isOnline || isHost) ? (
          <button 
            type="submit" 
            disabled={isOnline && lobbyPlayers.length < 3}
            className={`w-full py-5 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-black rounded-2xl transition-all shadow-xl active:scale-95 text-xl tracking-tighter uppercase sticky bottom-0 z-10 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale`}
          >
            {isOnline && lobbyPlayers.length < 3 ? 'Waiting for 3+ Players...' : 'Start Game'}
          </button>
        ) : (
          <div className="w-full py-5 bg-slate-900/80 border border-slate-700 text-slate-400 font-black rounded-2xl flex items-center justify-center gap-3 sticky bottom-0 z-10 animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm uppercase tracking-widest">Waiting for Host...</span>
          </div>
        )}
      </form>

      {isModalOpen && (
        <CustomCategoryModal onClose={() => setIsModalOpen(false)} onSave={handleSaveCustom} />
      )}
    </div>
  );
};

export default SetupScreen;
