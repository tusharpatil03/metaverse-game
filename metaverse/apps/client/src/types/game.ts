import type { Scene } from 'phaser';
import type { Space } from './space';

// Game configuration types
export interface GameConfig {
  width: number;
  height: number;
  backgroundColor: string;
  parent: string;
}

// Game state interface
export interface GameState {
  currentSpace: Space | null;
  playerPosition: { x: number; y: number };
  isGameReady: boolean;
  isLoading: boolean;
  error: string | null;
}

// Player data interface
export interface Player {
  id: string;
  username: string;
  x: number;
  y: number;
  avatarId?: string;
  sprite?: Phaser.GameObjects.Sprite;
}

// Game events that can be emitted from Phaser to React
export interface GameEvents {
  'game-ready': () => void;
  'game-error': (error: string) => void;
  'player-moved': (position: { x: number; y: number }) => void;
  'space-loaded': (space: Space) => void;
}

// Scene data interface
export interface SceneData {
  space: Space;
  playerSpawn: { x: number; y: number };
  players?: Player[];
}

// Asset loading interface
export interface GameAssets {
  sprites: {
    [key: string]: string; // key: asset path
  };
  textures: {
    [key: string]: string;
  };
  audio?: {
    [key: string]: string;
  };
}

// Game manager interface for communication between React and Phaser
export interface GameManager {
  scene: Scene | null;
  isReady: boolean;
  loadSpace: (space: Space) => Promise<void>;
  movePlayer: (x: number, y: number) => boolean;
  getPlayerPosition: () => { x: number; y: number };
  destroy: () => void;
  resize: (width: number, height: number) => void;
}
