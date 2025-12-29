
import React, { useState, useEffect, useRef } from 'react';
import { GameState, Role, Player, GameData, Difficulty, CustomCategory, GameMode, NetworkMessage, ImposterStrategy, LobbySettings } from './types';
import { generateGameData } from './services/geminiService';
import SetupScreen from './components/SetupScreen';
import RevealScreen from './components/RevealScreen';
import GamePlayScreen from './components/GamePlayScreen';
import WinnerScreen from './components/WinnerScreen';
import ModeSelection from './components/ModeSelection';
import Peer, { DataConnection } from 'peerjs';

interface GameConfig {
  playerNames: string[];
  numImposters: number;
  category: string;
  duration: number;
  difficulty: Difficulty;
  strategy: ImposterStrategy;
  customCategory?: CustomCategory;
}

const LOADING_MESSAGES = [
  "Generating unique secrets...",
  "Thinking of anti-tropes...",
  "Calibrating imposter data...",
  "Polishing the crystal ball...",
];

const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [winner, setWinner] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [roundDuration, setRoundDuration] = useState(180);
  const [lastConfig, setLastConfig] = useState<GameConfig | null>(null);
  
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [myPeerId, setMyPeerId] = useState<string | null>(null);
  const [myName, setMyName] = useState<string>('');
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [lobbyPlayers, setLobbyPlayers] = useState<{name: string, peerId: string}[]>([]);
  
  const [syncedSettings, setSyncedSettings] = useState<LobbySettings>({
    category: "Silly & Random",
    difficulty: Difficulty.AVERAGE,
    strategy: ImposterStrategy.HINT,
    numImposters: 1,
    duration: 180
  });

  const peerRef = useRef<Peer | null>(null);

  useEffect(() => {
    let interval: number | undefined;
    if (isLoading) {
      interval = window.setInterval(() => {
        setLoadingStep(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const initPeer = (name: string, customId?: string) => {
    const safeName = name.trim() || 'Host';
    setMyName(safeName);
    
    // Cleanup previous instance if it exists
    if (peerRef.current) {
      peerRef.current.destroy();
    }

    const id = customId || Math.random().toString(36).substring(2, 7).toUpperCase();
    const peer = new Peer(id);
    peerRef.current = peer;
    
    peer.on('open', (id) => { 
      setMyPeerId(id); 
      setRoomCode(id);
      setLobbyPlayers([{ name: safeName, peerId: id }]);
      setIsLoading(false);
    });

    peer.on('connection', (conn) => {
      conn.on('open', () => {
        if (isHost) {
          conn.send({ type: 'SETTINGS_SYNC', settings: syncedSettings });
        }
      });
      conn.on('data', (data: any) => handleNetworkMessage(data as NetworkMessage, conn));
      setConnections(prev => [...prev, conn]);
    });

    peer.on('error', (err) => {
      console.error("Peer Error:", err);
      setIsLoading(false);
      if (err.type === 'peer-unavailable') { 
        alert("Room code not found!"); 
        setGameMode(null);
      }
    });
  };

  const handleNetworkMessage = (msg: NetworkMessage, conn?: DataConnection) => {
    switch (msg.type) {
      case 'JOIN':
        if (isHost) {
          setLobbyPlayers(prev => {
            const newList = [...prev, { name: msg.name, peerId: msg.peerId }];
            broadcast({ type: 'LOBBY_UPDATE', players: newList });
            return newList;
          });
        }
        break;
      case 'LOBBY_UPDATE':
        setLobbyPlayers(msg.players);
        break;
      case 'SETTINGS_SYNC':
        setSyncedSettings(msg.settings);
        break;
      case 'START_GAME':
        setGameData(msg.gameData);
        setPlayers(msg.players);
        setRoundDuration(msg.duration);
        setGameState(GameState.REVEAL);
        setIsLoading(false);
        break;
      case 'VOTE_SYNC': 
        resolveVote(msg.suspectIds, false);
        break;
      case 'RESET': 
        resetGame(false); 
        break;
    }
  };

  const broadcast = (msg: NetworkMessage) => {
    connections.forEach(conn => {
      if (conn.open) conn.send(msg);
    });
  };

  const onSettingsChange = (settings: LobbySettings) => {
    if (isHost) {
      setSyncedSettings(settings);
      broadcast({ type: 'SETTINGS_SYNC', settings });
    }
  };

  const startGame = async (
    playerNames: string[], 
    numImposters: number, 
    category: string, 
    duration: number, 
    difficulty: Difficulty,
    strategy: ImposterStrategy,
    customCategory?: CustomCategory
  ) => {
    setIsLoading(true);
    setRoundDuration(duration);
    
    const finalNames = gameMode === GameMode.ONLINE ? lobbyPlayers.map(p => p.name) : playerNames;
    setLastConfig({ playerNames: finalNames, numImposters, category, duration, difficulty, strategy, customCategory });
    
    try {
      const data = await generateGameData(category, difficulty, strategy, customCategory?.items);
      setGameData(data);

      const numPlayers = finalNames.length;
      const roles: Role[] = [];
      for (let i = 0; i < numImposters; i++) roles.push(Role.IMPOSTER);
      for (let i = 0; i < numPlayers - numImposters; i++) roles.push(Role.CIVILIAN);

      for (let i = roles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [roles[i], roles[j]] = [roles[j], roles[i]];
      }

      const initialPlayers: Player[] = finalNames.map((name, i) => {
        let secret = data.word;
        if (roles[i] === Role.IMPOSTER) {
          if (strategy === ImposterStrategy.BLIND) secret = "???";
          else if (strategy === ImposterStrategy.WRONG_WORD) secret = data.imposterWord || "Confusion";
          else secret = data.hint || "Hint Error";
        }
        return {
          id: i,
          name: name.trim() || `Player ${i + 1}`,
          role: roles[i],
          isEliminated: false,
          secret,
          peerId: gameMode === GameMode.ONLINE ? lobbyPlayers[i].peerId : undefined
        };
      });

      setPlayers(initialPlayers);
      setCurrentPlayerIndex(0);
      setGameState(GameState.REVEAL);

      if (gameMode === GameMode.ONLINE && isHost) {
        broadcast({ type: 'START_GAME', gameData: data, players: initialPlayers, duration, category });
      }
    } catch (err) { 
      console.error(err); 
      setIsLoading(false);
    } finally { 
      setIsLoading(false); 
    }
  };

  const resolveVote = (suspectIds: number[], shouldBroadcast = true) => {
    const selectedPlayers = players.filter(p => suspectIds.includes(p.id));
    const allImpostersCount = players.filter(p => p.role === Role.IMPOSTER).length;
    
    const updatedPlayers = players.map(p => ({ 
      ...p, 
      isEliminated: suspectIds.includes(p.id) 
    }));
    setPlayers(updatedPlayers);

    const allSuspectsAreImposters = selectedPlayers.every(p => p.role === Role.IMPOSTER);
    const caughtAllImposters = selectedPlayers.length === allImpostersCount && allSuspectsAreImposters;

    if (caughtAllImposters) setWinner(Role.CIVILIAN);
    else setWinner(Role.IMPOSTER);
    
    setGameState(GameState.WINNER);
    
    if (shouldBroadcast && gameMode === GameMode.ONLINE) {
      broadcast({ type: 'VOTE_SYNC', suspectIds }); 
    }
  };

  const resetGame = (shouldBroadcast = true) => {
    setGameState(GameState.SETUP);
    setPlayers([]);
    setGameData(null);
    setWinner(null);
    if (shouldBroadcast && gameMode === GameMode.ONLINE && isHost) {
      broadcast({ type: 'RESET' });
    }
  };

  const joinRoom = (code: string, myName: string) => {
    setIsLoading(true);
    setMyName(myName);
    const peer = new Peer();
    peerRef.current = peer;
    
    peer.on('open', (id) => {
      setMyPeerId(id);
      const conn = peer.connect(code.toUpperCase());
      
      conn.on('open', () => {
        setConnections([conn]);
        conn.send({ type: 'JOIN', name: myName, peerId: id });
        setRoomCode(code.toUpperCase());
        setIsHost(false);
        setIsLoading(false);
      });

      conn.on('data', (data) => handleNetworkMessage(data as NetworkMessage));
      
      conn.on('close', () => {
        alert("Disconnected from host");
        setGameMode(null);
      });
    });

    peer.on('error', (err) => {
      console.error("Peer Join Error:", err);
      setIsLoading(false);
      setGameMode(null);
      alert("Could not connect to room. Please check the code.");
    });
  };

  const myPlayer = gameMode === GameMode.ONLINE 
    ? (players.find(p => p.peerId === myPeerId) || players[0]) 
    : players[currentPlayerIndex];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
      </div>

      <header className="mb-6 text-center z-10">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight mb-1">IMPOSTER</h1>
        <p className="text-slate-400 font-medium text-sm flex items-center justify-center gap-2">
          {gameMode === GameMode.ONLINE && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
          {gameMode === GameMode.ONLINE ? `Online: ${roomCode || 'Connecting...'}` : 'Pass & Play'}
        </p>
      </header>

      <main className="w-full max-w-2xl z-10 flex items-center justify-center min-h-[400px]">
        {isLoading && (
          <div className="w-full max-w-lg flex flex-col items-center justify-center p-12 bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl transition-all duration-500">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-xl font-bold text-white mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300" key={loadingStep}>{LOADING_MESSAGES[loadingStep]}</p>
          </div>
        )}

        {!isLoading && !gameMode && (
          <ModeSelection 
            onSelect={(mode, name) => { 
              setGameMode(mode); 
              if (mode === GameMode.ONLINE) { 
                setIsHost(true); 
                setIsLoading(true);
                initPeer(name || "Host"); 
              } 
            }} 
            onJoin={(code, name) => { 
              setGameMode(GameMode.ONLINE); 
              joinRoom(code, name); 
            }} 
          />
        )}

        {!isLoading && gameMode && gameState === GameState.SETUP && (
          <SetupScreen 
            onStart={startGame} 
            isOnline={gameMode === GameMode.ONLINE} 
            roomCode={roomCode} 
            isHost={isHost} 
            lobbyPlayers={lobbyPlayers}
            syncedSettings={syncedSettings}
            onSettingsChange={onSettingsChange}
          />
        )}

        {!isLoading && gameMode && gameState === GameState.REVEAL && (
          <RevealScreen 
            key={myPeerId || currentPlayerIndex} 
            player={myPlayer || players[currentPlayerIndex]} 
            onNext={() => {
              if (gameMode === GameMode.LOCAL) {
                if (currentPlayerIndex < players.length - 1) setCurrentPlayerIndex(prev => prev + 1);
                else setGameState(GameState.PLAYING);
              } else {
                setGameState(GameState.PLAYING);
              }
            }} 
            isLast={gameMode === GameMode.ONLINE || currentPlayerIndex === players.length - 1} 
            isOnline={gameMode === GameMode.ONLINE} 
          />
        )}

        {!isLoading && gameMode && gameState === GameState.PLAYING && (
          <GamePlayScreen players={players} onEliminate={resolveVote} duration={roundDuration} />
        )}

        {!isLoading && gameMode && gameState === GameState.WINNER && (
          <WinnerScreen 
            winner={winner} 
            players={players} 
            gameData={gameData} 
            categoryName={lastConfig?.category || "Unknown"} 
            onReset={() => resetGame()} 
            onRestart={() => startGame(lastConfig!.playerNames, lastConfig!.numImposters, lastConfig!.category, lastConfig!.duration, lastConfig!.difficulty, lastConfig!.strategy, lastConfig!.customCategory)} 
          />
        )}
      </main>

      <footer className="mt-6 text-slate-500 text-xs z-10">{gameMode === GameMode.ONLINE ? 'P2P Network Active' : 'Offline Mode'} • Powered by Gemini</footer>
    </div>
  );
};

export default App;
