
export enum Role {
  CIVILIAN = 'CIVILIAN',
  IMPOSTER = 'IMPOSTER'
}

export enum GameMode {
  LOCAL = 'LOCAL',
  ONLINE = 'ONLINE'
}

export enum Difficulty {
  EASY = 'EASY',
  AVERAGE = 'AVERAGE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export enum ImposterStrategy {
  HINT = 'HINT',           // Imposter gets a cryptic hint
  WRONG_WORD = 'WRONG_WORD', // Imposter gets a related but different word
  BLIND = 'BLIND'          // Imposter gets nothing (???)
}

export interface Player {
  id: number;
  name: string;
  role: Role;
  isEliminated: boolean;
  secret: string; 
  peerId?: string;
}

export enum GameState {
  SETUP = 'SETUP',
  REVEAL = 'REVEAL',
  PLAYING = 'PLAYING',
  VOTING = 'VOTING',
  WINNER = 'WINNER'
}

export interface Source {
  uri: string;
  title: string;
}

export interface CustomItem {
  word: string;
  hint: string;
}

export interface CustomCategory {
  id: string;
  name: string;
  items: CustomItem[];
}

export interface LobbySettings {
  category: string;
  difficulty: Difficulty;
  strategy: ImposterStrategy;
  numImposters: number;
  duration: number;
}

export interface GameData {
  word: string;
  hint?: string;
  imposterWord?: string;
  strategy: ImposterStrategy;
  sources?: Source[];
}

export type NetworkMessage = 
  | { type: 'JOIN', name: string, peerId: string }
  | { type: 'LOBBY_UPDATE', players: { name: string, peerId: string }[] }
  | { type: 'SETTINGS_SYNC', settings: LobbySettings }
  | { type: 'START_GAME', gameData: GameData, players: Player[], duration: number, category: string }
  | { type: 'VOTE_SYNC', suspectIds: number[] }
  | { type: 'RESET' };
