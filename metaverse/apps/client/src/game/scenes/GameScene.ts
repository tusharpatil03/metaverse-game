import { BaseScene } from './BaseScene';
import { AssetManager } from '../managers/AssetManager';
import type { SceneData, Player } from '../../types/game';

export class GameScene extends BaseScene {
  private player: Phaser.GameObjects.Sprite | null = null;
  private players: Map<string, Player> = new Map();

  constructor() {
    super('GameScene');
  }

  initializeScene(data: SceneData): void {
    console.log('[GameScene] Initializing game scene with space:', data.space.name);
    
    // Store player spawn position
    if (data.playerSpawn) {
      this.registry.set('playerSpawn', data.playerSpawn);
    }

    // Store other players if provided
    if (data.players) {
      data.players.forEach(player => {
        this.players.set(player.id, player);
      });
    }
  }

  setupGameObjects(): void {
    console.log('[GameScene] Setting up game objects...');
    
    if (!this.space) {
      throw new Error('Space data is required for GameScene');
    }

    // Create grid background
    this.createGridBackground();
    
    // Create space boundaries
    this.createSpaceBoundaries();
    
    // Add space information text
    this.addSpaceInfo();
    
    // Create player sprite
    this.createPlayer();
    
    // Setup camera
    this.setupCamera();
    
    // Setup input handling
    this.setupInput();
  }

  handleSceneReady(): void {
    console.log('[GameScene] Scene is ready!');
    
    // Emit custom events that React can listen to
    this.events.emit('game-scene-ready', {
      space: this.space,
      player: this.player ? {
        x: this.player.x,
        y: this.player.y
      } : null
    });
  }

  private createPlayer(): void {
    const spawn = this.registry.get('playerSpawn') || { x: 1, y: 1 };
    const worldPos = this.gridToWorld(spawn.x, spawn.y);
    
    // Get a random player sprite from AssetManager
    const assetManager = AssetManager.getInstance();
    const playerSpriteKey = assetManager.getRandomPlayerSprite();
    
    // Create player sprite
    this.player = this.add.sprite(worldPos.x, worldPos.y, playerSpriteKey);
    this.player.setOrigin(0, 0);
    this.player.setDisplaySize(this.tileSize, this.tileSize);
    
    // Store player reference in registry for other systems to access
    this.registry.set('player', this.player);
    this.registry.set('playerGridPos', spawn);
    this.registry.set('playerSpriteKey', playerSpriteKey);
    
    console.log('[GameScene] Player created at grid position:', spawn, 'with sprite:', playerSpriteKey);
  }

  private setupCamera(): void {
    if (!this.space || !this.player) return;
    
    const worldDimensions = this.getSpaceWorldDimensions();
    
    // Set camera bounds to space dimensions
    this.cameras.main.setBounds(0, 0, worldDimensions.width, worldDimensions.height);
    
    // Make camera follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    
    // Set camera zoom (can be adjusted based on screen size)
    this.cameras.main.setZoom(1.5);
    
    console.log('[GameScene] Camera setup complete');
  }

  private setupInput(): void {
    // Create cursor keys for movement
    const cursors = this.input.keyboard?.createCursorKeys();
    
    // Create WASD keys
    const wasd = this.input.keyboard?.addKeys('W,S,A,D') as {
      W: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
    };

    // Store input references
    this.registry.set('cursors', cursors);
    this.registry.set('wasd', wasd);
    
    // Setup input event listeners
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      this.handleKeyDown(event.code);
    });
    
    console.log('[GameScene] Input setup complete');
  }

  private handleKeyDown(keyCode: string): void {
    if (!this.player || !this.space) return;
    
    const currentGridPos = this.registry.get('playerGridPos') || { x: 1, y: 1 };
    let newGridX = currentGridPos.x;
    let newGridY = currentGridPos.y;
    
    // Calculate new position based on key pressed
    switch (keyCode) {
      case 'ArrowUp':
      case 'KeyW':
        newGridY = currentGridPos.y - 1;
        break;
      case 'ArrowDown':
      case 'KeyS':
        newGridY = currentGridPos.y + 1;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        newGridX = currentGridPos.x - 1;
        break;
      case 'ArrowRight':
      case 'KeyD':
        newGridX = currentGridPos.x + 1;
        break;
      default:
        return; // Ignore other keys
    }
    
    // Validate movement (single-step orthogonal only)
    if (this.isValidMove(currentGridPos, { x: newGridX, y: newGridY })) {
      this.movePlayer(newGridX, newGridY);
    } else {
      console.log('[GameScene] Invalid move attempted:', { from: currentGridPos, to: { x: newGridX, y: newGridY } });
      
      // Emit movement rejected event
      this.events.emit('movement-rejected', {
        attempted: { x: newGridX, y: newGridY },
        current: currentGridPos
      });
    }
  }

  private isValidMove(from: { x: number; y: number }, to: { x: number; y: number }): boolean {
    // Check if destination is within bounds
    if (!this.isValidGridPosition(to.x, to.y)) {
      return false;
    }
    
    // Check if it's a single-step orthogonal move
    const deltaX = Math.abs(to.x - from.x);
    const deltaY = Math.abs(to.y - from.y);
    
    // Must be exactly one step in one direction
    return (deltaX === 1 && deltaY === 0) || (deltaX === 0 && deltaY === 1);
  }

  private movePlayer(gridX: number, gridY: number): void {
    if (!this.player) return;
    
    const worldPos = this.gridToWorld(gridX, gridY);
    
    // Animate player movement
    this.tweens.add({
      targets: this.player,
      x: worldPos.x,
      y: worldPos.y,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        // Update stored grid position
        this.registry.set('playerGridPos', { x: gridX, y: gridY });
        
        // Emit movement complete event
        this.events.emit('player-moved', {
          gridX,
          gridY,
          worldX: worldPos.x,
          worldY: worldPos.y
        });
        
        console.log('[GameScene] Player moved to grid position:', { x: gridX, y: gridY });
      }
    });
  }

  // Public method to move player (can be called from React)
  public movePlayerTo(gridX: number, gridY: number): boolean {
    const currentGridPos = this.registry.get('playerGridPos') || { x: 1, y: 1 };
    
    if (this.isValidMove(currentGridPos, { x: gridX, y: gridY })) {
      this.movePlayer(gridX, gridY);
      return true;
    }
    
    return false;
  }

  // Public method to get current player position
  public getPlayerPosition(): { gridX: number; gridY: number; worldX: number; worldY: number } | null {
    if (!this.player) return null;
    
    const gridPos = this.registry.get('playerGridPos') || { x: 1, y: 1 };
    return {
      gridX: gridPos.x,
      gridY: gridPos.y,
      worldX: this.player.x,
      worldY: this.player.y
    };
  }

  // Public method to add other players (for multiplayer)
  public addOtherPlayer(player: Player): void {
    const worldPos = this.gridToWorld(player.x, player.y);
    
    // Get a different player sprite for other players
    const assetManager = AssetManager.getInstance();
    const otherPlayerSpriteKey = player.avatarId || assetManager.getRandomPlayerSprite();
    
    const sprite = this.add.sprite(worldPos.x, worldPos.y, otherPlayerSpriteKey);
    sprite.setOrigin(0, 0);
    sprite.setDisplaySize(this.tileSize, this.tileSize);
    sprite.setAlpha(0.8); // Slightly transparent for other players
    
    // Add username label
    const nameText = this.add.text(worldPos.x + this.tileSize / 2, worldPos.y - 10, player.username, {
      fontSize: '10px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    });
    nameText.setOrigin(0.5, 1);
    
    // Store sprite reference
    player.sprite = sprite;
    this.players.set(player.id, player);
    
    console.log('[GameScene] Added other player:', player.username, 'with sprite:', otherPlayerSpriteKey);
  }

  // Public method to remove other players
  public removeOtherPlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (player && player.sprite) {
      player.sprite.destroy();
      this.players.delete(playerId);
      console.log('[GameScene] Removed other player:', playerId);
    }
  }

  // Update loop
  update(): void {
    // Game update logic will go here
    // For now, just ensure player stays in bounds
    if (this.player && this.space) {
      const gridPos = this.registry.get('playerGridPos') || { x: 1, y: 1 };
      
      // Clamp position to valid bounds (safety check)
      if (!this.isValidGridPosition(gridPos.x, gridPos.y)) {
        const clampedX = Math.max(0, Math.min(gridPos.x, this.space.width - 1));
        const clampedY = Math.max(0, Math.min(gridPos.y, this.space.height - 1));
        
        this.movePlayer(clampedX, clampedY);
      }
    }
  }
}
