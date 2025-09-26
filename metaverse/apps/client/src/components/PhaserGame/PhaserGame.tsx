import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { GameScene } from '../../game/scenes/GameScene';
import { GameLifecycleManager } from '../../game/managers/GameLifecycleManager';
import type { GameManager, GameState, SceneData } from '../../types/game';
import type { Space } from '../../types/space';
import styles from './Phaser.module.css';

interface PhaserGameProps {
  space: Space;
  onGameReady?: (gameManager: GameManager) => void;
  onGameError?: (error: string) => void;
  onPlayerMove?: (position: { x: number; y: number }) => void;
}

const PhaserGame: React.FC<PhaserGameProps> = ({
  space,
  onGameReady,
  onGameError,
  onPlayerMove // Will be used in later phases for WebSocket sync
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const gameManagerRef = useRef<GameManager | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    currentSpace: null,
    playerPosition: { x: 0, y: 0 },
    isGameReady: false,
    isLoading: true,
    error: null,
  });

  // Game configuration
  const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "phaser-game-container",
    backgroundColor: "#2c3e50",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 }, // No gravity for top-down view
        debug: false,
      },
    },
    scene: [GameScene], // Use our new scene architecture
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      min: {
        width: 400,
        height: 300,
      },
      max: {
        width: 1600,
        height: 1200,
      },
    },
  };

  // Initialize game scene with space data
  const initializeGameScene = (game: Phaser.Game) => {
    console.log("Initializing game scene");
    const gameScene = game.scene.getScene("GameScene") as GameScene;
    console.log(gameScene);

    if (gameScene) {
      // Setup scene event listeners
      gameScene.events.on("game-scene-ready", (data: any) => {
        console.log("[PhaserGame] Game scene ready:", data);

        // Store scene reference in game manager
        if (gameManagerRef.current) {
          gameManagerRef.current.scene = gameScene;
        }

        // Update game state
        setGameState((prev) => ({
          ...prev,
          currentSpace: space,
          isGameReady: true,
          isLoading: false,
          error: null,
        }));

        console.log(gameState);

        // Call onGameReady callback
        if (onGameReady && gameManagerRef.current) {
          onGameReady(gameManagerRef.current);
        }
      });

      gameScene.events.on("player-moved", (data: any) => {
        console.log("[PhaserGame] Player moved:", data);

        // Update game state
        setGameState((prev) => ({
          ...prev,
          playerPosition: { x: data.gridX, y: data.gridY },
        }));

        // Call onPlayerMove callback if provided
        if (onPlayerMove) {
          onPlayerMove({ x: data.gridX, y: data.gridY });
        }
      });

      gameScene.events.on("movement-rejected", (data: any) => {
        console.log("[PhaserGame] Movement rejected:", data);
        // Could emit this to React for UI feedback
      });

      gameScene.events.on("scene-error", (error: any) => {
        console.error("[PhaserGame] Scene error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Scene error occurred";

        setGameState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        if (onGameError) {
          onGameError(errorMessage);
        }
      });

      // Start the scene with space data
      const sceneData: SceneData = {
        space,
        playerSpawn: { x: 1, y: 1 }, // Default spawn position
        players: [], // No other players initially
      };

      gameScene.scene.start("GameScene", sceneData);
    }
  };

  // Initialize game manager
  useEffect(() => {
    console.log("Initilizing game manager");
    const gameManager: GameManager = {
      scene: null,
      isReady: false,

      loadSpace: async (newSpace: Space) => {
        console.log("[GameManager] Loading space:", newSpace.name);
        // This will be implemented when we add scene switching
        return Promise.resolve();
      },

      movePlayer: (x: number, y: number) => {
        console.log("[GameManager] Moving player to:", x, y);
        const scene = gameManagerRef.current?.scene as GameScene;
        if (scene && scene.movePlayerTo) {
          return scene.movePlayerTo(x, y);
        }
        return false;
      },

      getPlayerPosition: () => {
        const scene = gameManagerRef.current?.scene as GameScene;
        if (scene && scene.getPlayerPosition) {
          const pos = scene.getPlayerPosition();
          return pos
            ? { x: pos.gridX, y: pos.gridY }
            : gameState.playerPosition;
        }
        return gameState.playerPosition;
      },

      destroy: () => {
        console.log("[GameManager] Destroying game...");
        if (phaserGameRef.current) {
          phaserGameRef.current.destroy(true);
          phaserGameRef.current = null;
        }
      },

      resize: (width: number, height: number) => {
        console.log("[GameManager] Resizing game to:", width, height);
        if (phaserGameRef.current) {
          phaserGameRef.current.scale.resize(width, height);
        }
      },
    };

    gameManagerRef.current = gameManager;
  }, [gameState.playerPosition]);

  // Initialize Phaser game
  useEffect(() => {
    console.log("Initializing Phaser game");
    console.log(gameRef.current);
    if (!gameRef.current) return;

    console.log("[PhaserGame] Initializing Phaser game for space:", space.name);

    setGameState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      // Create Phaser game instance
      const game = new Phaser.Game({
        ...gameConfig,
        parent: gameRef.current,
      });

      phaserGameRef.current = game;

      // Handle game boot
      game.events.once("ready", () => {
        console.log("[PhaserGame] Phaser game booted successfully");
        if (gameManagerRef.current) {
          gameManagerRef.current.isReady = true;
        }

        // Initialize the game scene
        initializeGameScene(game);
      });
    } catch (error) {
      console.error("[PhaserGame] Failed to initialize Phaser:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to initialize game";

      setGameState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      if (onGameError) {
        onGameError(errorMessage);
      }
    }

    // Cleanup function
    return () => {
      console.log("[PhaserGame] Cleaning up Phaser game");
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [space.id]); // Re-initialize when space changes

  // Initialize game lifecycle management
  useEffect(() => {
    if (!gameRef.current) return;
    console.log("Initializing game lifecycle management");

    const lifecycleManager = GameLifecycleManager.getInstance();

    const handleResize = (width: number, height: number) => {
      if (gameManagerRef.current) {
        gameManagerRef.current.resize(width, height);
      }
    };

    lifecycleManager.initialize(gameRef.current, handleResize);

    return () => {
      lifecycleManager.destroy();
    };
  }, []);

  // Render loading state
  if (gameState.isLoading) {
    return (
      <div className={`${styles.container} ${styles.loading}`}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading game world...</p>
          <small>Initializing {space.name}</small>
        </div>
      </div>
    );
  }

  // Render error state
  if (gameState.error) {
    return (
      <div className={`${styles.container} ${styles.error}`}>
        <div className={styles.errorContent}>
          <h3>❌ Game Error</h3>
          <p>{gameState.error}</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render game
  // (Keep all the hooks and logic from before the return statement)

  // Render game
  return (
    <div className={styles.wrapper}>
      {/* This div is now ALWAYS rendered, so the ref will be attached */}
      <div
        ref={gameRef}
        id="phaser-game-container"
        className={styles.container}
      />

      {/* Conditionally render the loading overlay */}
      {gameState.isLoading && (
        <div className={`${styles.overlay} ${styles.loading}`}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading game world...</p>
            <small>Initializing {space.name}</small>
          </div>
        </div>
      )}

      {/* Conditionally render the error overlay */}
      {gameState.error && (
        <div className={`${styles.overlay} ${styles.error}`}>
          <div className={styles.errorContent}>
            <h3>❌ Game Error</h3>
            <p>{gameState.error}</p>
            <button
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Game info overlay (can be shown when the game is ready) */}
      {gameState.isGameReady && (
        <div className={styles.infoOverlay}>
          <div className={styles.spaceInfo}>
            <span className={styles.spaceName}>{space.name}</span>
            <span className={styles.spaceDimensions}>
              {space.width}×{space.height}
            </span>
          </div>
          <div className={styles.gameStatus}>
            <span className={styles.statusReady}>🟢 Ready</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhaserGame;
