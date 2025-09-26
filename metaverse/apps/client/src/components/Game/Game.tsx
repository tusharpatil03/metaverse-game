import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSpace } from '../../contexts/SpaceContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import SpaceSelector from '../SpaceSelector/SpaceSelector';
import PhaserGame from '../PhaserGame/PhaserGame';
import type { GameManager } from '../../types/game';
import styles from './Game.module.css';

const Game: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentSpace, clearCurrentSpace } = useSpace();
  const { 
    connect, 
    disconnect, 
    isConnected, 
    connectionError, 
    isReconnecting,
    players,
    sendMove 
  } = useWebSocket();
  const [gameManager, setGameManager] = useState<GameManager | null>(null);
  const [gameError, setGameError] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
  };

  const handleBackToSpaces = () => {
    // Disconnect from WebSocket when leaving space
    if (isConnected) {
      disconnect();
    }
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
    
    // Send movement to WebSocket server for real-time sync
    if (isConnected) {
      sendMove(position.x, position.y);
    }
  };

  // Auto-connect to WebSocket when space is selected and game is ready
  useEffect(() => {
    if (currentSpace && gameManager && !isConnected) {
      console.log('[Game] Connecting to WebSocket for space:', currentSpace.id);
      
      connect(currentSpace.id).catch(error => {
        console.error('[Game] Failed to connect to WebSocket:', error);
        setGameError(`Failed to connect to multiplayer: ${error.message}`);
      });
    }
  }, [currentSpace, gameManager, isConnected, connect]);

  // Handle WebSocket connection errors
  useEffect(() => {
    if (connectionError) {
      setGameError(`Connection error: ${connectionError}`);
    }
  }, [connectionError]);

  // Update multiplayer rendering when players change
  useEffect(() => {
    if (gameManager && gameManager.scene) {
      const gameScene = gameManager.scene as any; // GameScene type
      
      // Clear existing other players
      if (gameScene.clearOtherPlayers) {
        gameScene.clearOtherPlayers();
      }
      
      // Add all current players
      players.forEach(player => {
        if (gameScene.addOtherPlayer) {
          gameScene.addOtherPlayer(player);
        }
      });
    }
  }, [players, gameManager]);

  // If no space is selected, show space selector
  if (!currentSpace) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.userInfo}>
            <h1>Welcome to the Metaverse, {user?.username}!</h1>
            <p className={styles.userEmail}>{user?.email && `Email: ${user.email}`}</p>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </header>

        <main className={styles.content}>
          <SpaceSelector />
        </main>

        <footer className={styles.footer}>
          <p>Phase 2A: Space Management ✅</p>
          <p>Next: Phaser 3 integration and real-time features</p>
        </footer>
      </div>
    );
  }

  // If space is selected, show the game world (placeholder for now)
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.userInfo}>
          <h1>🌐 {currentSpace.name}</h1>
          <p className={styles.spaceInfo}>
            {currentSpace.description} • {currentSpace.width}×{currentSpace.height}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={handleBackToSpaces} className={styles.backButton}>
            ← Back to Spaces
          </button>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <main className={styles.content}>
        <PhaserGame
          space={currentSpace}
          onGameReady={handleGameReady}
          onGameError={handleGameError}
          onPlayerMove={handlePlayerMove}
        />
        
        {/* Game status overlay */}
        {gameError && (
          <div className={styles.errorOverlay}>
            <div className={styles.errorContent}>
              <h3>Game Error</h3>
              <p>{gameError}</p>
              <button onClick={() => setGameError(null)} className={styles.dismissError}>
                Dismiss
              </button>
            </div>
          </div>
        )}
        
        {gameManager && (
          <div className={styles.controlsOverlay}>
            <div className={styles.controlsInfo}>
              <p>🎮 Game Ready! Use WASD or arrow keys to move</p>
              {isConnected && (
                <p>🌐 Connected • {players.size} player{players.size !== 1 ? 's' : ''} online</p>
              )}
              {isReconnecting && (
                <p>🔄 Reconnecting to multiplayer...</p>
              )}
              {!isConnected && !isReconnecting && (
                <p>⚠️ Offline mode - multiplayer disabled</p>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>Current Space: {currentSpace.name} | Next: Phaser 3 integration</p>
      </footer>
    </div>
  );
};

export default Game;
