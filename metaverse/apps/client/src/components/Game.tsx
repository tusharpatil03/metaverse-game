import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSpace } from '../contexts/SpaceContext';
import SpaceSelector from './SpaceSelector';
import PhaserGame from './PhaserGame';
import type { GameManager } from '../types/game';

const Game: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentSpace, clearCurrentSpace } = useSpace();
  const [gameManager, setGameManager] = useState<GameManager | null>(null);
  const [gameError, setGameError] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
  };

  const handleBackToSpaces = () => {
    clearCurrentSpace();
    setGameManager(null);
    setGameError(null);
  };

  const handleGameReady = (manager: GameManager) => {
    console.log('[Game] Phaser game is ready');
    setGameManager(manager);
    setGameError(null);
  };

  const handleGameError = (error: string) => {
    console.error('[Game] Phaser game error:', error);
    setGameError(error);
  };

  const handlePlayerMove = (position: { x: number; y: number }) => {
    console.log('[Game] Player moved to:', position);
    // This will be used later for WebSocket synchronization
  };

  // If no space is selected, show space selector
  if (!currentSpace) {
    return (
      <div className="game-container">
        <header className="game-header">
          <div className="user-info">
            <h1>Welcome to the Metaverse, {user?.username}!</h1>
            <p className="user-email">{user?.email && `Email: ${user.email}`}</p>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </header>

        <main className="game-content">
          <SpaceSelector />
        </main>

        <footer className="game-footer">
          <p>Phase 2A: Space Management ✅</p>
          <p>Next: Phaser 3 integration and real-time features</p>
        </footer>
      </div>
    );
  }

  // If space is selected, show the game world (placeholder for now)
  return (
    <div className="game-container">
      <header className="game-header">
        <div className="user-info">
          <h1>🌐 {currentSpace.name}</h1>
          <p className="space-info">
            {currentSpace.description} • {currentSpace.width}×{currentSpace.height}
          </p>
        </div>
        <div className="header-actions">
          <button onClick={handleBackToSpaces} className="back-button">
            ← Back to Spaces
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="game-content">
        <PhaserGame
          space={currentSpace}
          onGameReady={handleGameReady}
          onGameError={handleGameError}
          onPlayerMove={handlePlayerMove}
        />
        
        {/* Game status overlay */}
        {gameError && (
          <div className="game-error-overlay">
            <div className="error-content">
              <h3>Game Error</h3>
              <p>{gameError}</p>
              <button onClick={() => setGameError(null)} className="dismiss-error">
                Dismiss
              </button>
            </div>
          </div>
        )}
        
        {gameManager && (
          <div className="game-controls-overlay">
            <div className="controls-info">
              <p>🎮 Game Ready! Use WASD or arrow keys to move (coming soon)</p>
            </div>
          </div>
        )}
      </main>

      <footer className="game-footer">
        <p>Phase 2A: Space Management ✅</p>
        <p>Current Space: {currentSpace.name} | Next: Phaser 3 integration</p>
      </footer>
    </div>
  );
};

export default Game;
