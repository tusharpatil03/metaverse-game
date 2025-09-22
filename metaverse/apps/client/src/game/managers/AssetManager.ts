import type { GameAssets } from '../../types/game';

export class AssetManager {
  private static instance: AssetManager;
  private loadedAssets: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<void>> = new Map();

  private constructor() {}

  public static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  // Default asset configuration
  public getDefaultAssets(): GameAssets {
    return {
      sprites: {
        // Player avatars - these will be replaced with actual avatar images later
        'player-blue': '/assets/sprites/player-blue.png',
        'player-red': '/assets/sprites/player-red.png',
        'player-green': '/assets/sprites/player-green.png',
        'player-yellow': '/assets/sprites/player-yellow.png',
        
        // Environment sprites
        'wall': '/assets/sprites/wall.png',
        'floor': '/assets/sprites/floor.png',
        'obstacle': '/assets/sprites/obstacle.png',
        'door': '/assets/sprites/door.png',
        'tree': '/assets/sprites/tree.png',
        'rock': '/assets/sprites/rock.png',
      },
      textures: {
        // Background textures
        'grass': '/assets/textures/grass.png',
        'stone': '/assets/textures/stone.png',
        'wood': '/assets/textures/wood.png',
        'water': '/assets/textures/water.png',
      },
      audio: {
        // Sound effects
        'step': '/assets/audio/step.wav',
        'door-open': '/assets/audio/door-open.wav',
        'ambient': '/assets/audio/ambient.mp3',
      }
    };
  }

  // Create placeholder assets when real assets are not available
  public createPlaceholderAssets(scene: Phaser.Scene): void {
    console.log('[AssetManager] Creating placeholder assets...');

    const tileSize = 32;
    
    // Player sprites with different colors
    this.createColoredSprite(scene, 'player-blue', 0x3498db, tileSize);
    this.createColoredSprite(scene, 'player-red', 0xe74c3c, tileSize);
    this.createColoredSprite(scene, 'player-green', 0x27ae60, tileSize);
    this.createColoredSprite(scene, 'player-yellow', 0xf1c40f, tileSize);
    
    // Environment sprites
    this.createColoredSprite(scene, 'wall', 0x95a5a6, tileSize);
    this.createColoredSprite(scene, 'floor', 0x34495e, tileSize);
    this.createColoredSprite(scene, 'obstacle', 0x8e44ad, tileSize);
    this.createColoredSprite(scene, 'door', 0xd35400, tileSize);
    this.createColoredSprite(scene, 'tree', 0x16a085, tileSize);
    this.createColoredSprite(scene, 'rock', 0x7f8c8d, tileSize);

    // Background textures (larger)
    this.createColoredSprite(scene, 'grass', 0x2ecc71, tileSize, 0.7);
    this.createColoredSprite(scene, 'stone', 0xbdc3c7, tileSize, 0.8);
    this.createColoredSprite(scene, 'wood', 0xd68910, tileSize, 0.6);
    this.createColoredSprite(scene, 'water', 0x3498db, tileSize, 0.5);

    console.log('[AssetManager] Placeholder assets created');
  }

  private createColoredSprite(
    scene: Phaser.Scene, 
    key: string, 
    color: number, 
    size: number, 
    alpha: number = 1
  ): void {
    const graphics = scene.add.graphics();
    graphics.fillStyle(color, alpha);
    graphics.fillRect(0, 0, size, size);
    
    // Add a border for better visibility
    graphics.lineStyle(1, 0x000000, 0.3);
    graphics.strokeRect(0, 0, size, size);
    
    graphics.generateTexture(key, size, size);
    graphics.destroy();
    
    this.loadedAssets.add(key);
  }

  // Load real assets from URLs
  public async loadAssets(scene: Phaser.Scene, assets: GameAssets): Promise<void> {
    console.log('[AssetManager] Loading assets...');
    
    const loadPromises: Promise<void>[] = [];

    // Load sprites
    for (const [key, path] of Object.entries(assets.sprites)) {
      if (!this.loadedAssets.has(key)) {
        loadPromises.push(this.loadSprite(scene, key, path));
      }
    }

    // Load textures
    for (const [key, path] of Object.entries(assets.textures)) {
      if (!this.loadedAssets.has(key)) {
        loadPromises.push(this.loadTexture(scene, key, path));
      }
    }

    // Load audio (if provided)
    if (assets.audio) {
      for (const [key, path] of Object.entries(assets.audio)) {
        if (!this.loadedAssets.has(key)) {
          loadPromises.push(this.loadAudio(scene, key, path));
        }
      }
    }

    try {
      await Promise.all(loadPromises);
      console.log('[AssetManager] All assets loaded successfully');
    } catch (error) {
      console.warn('[AssetManager] Some assets failed to load, using placeholders:', error);
      // Fallback to placeholder assets
      this.createPlaceholderAssets(scene);
    }
  }

  private async loadSprite(scene: Phaser.Scene, key: string, path: string): Promise<void> {
    return new Promise((resolve) => {
      // Check if asset exists
      this.checkAssetExists(path)
        .then(exists => {
          if (exists) {
            scene.load.image(key, path);
            scene.load.once(`filecomplete-image-${key}`, () => {
              this.loadedAssets.add(key);
              resolve();
            });
            scene.load.once(`loaderror`, () => {
              console.warn(`[AssetManager] Failed to load sprite: ${key} from ${path}`);
              // Create placeholder instead
              this.createColoredSprite(scene, key, 0x95a5a6, 32);
              resolve();
            });
            scene.load.start();
          } else {
            // Asset doesn't exist, create placeholder
            this.createColoredSprite(scene, key, 0x95a5a6, 32);
            resolve();
          }
        })
        .catch(() => {
          // Error checking asset, create placeholder
          this.createColoredSprite(scene, key, 0x95a5a6, 32);
          resolve();
        });
    });
  }

  private async loadTexture(scene: Phaser.Scene, key: string, path: string): Promise<void> {
    return new Promise((resolve) => {
      this.checkAssetExists(path)
        .then(exists => {
          if (exists) {
            scene.load.image(key, path);
            scene.load.once(`filecomplete-image-${key}`, () => {
              this.loadedAssets.add(key);
              resolve();
            });
            scene.load.once(`loaderror`, () => {
              console.warn(`[AssetManager] Failed to load texture: ${key} from ${path}`);
              this.createColoredSprite(scene, key, 0x7f8c8d, 32, 0.7);
              resolve();
            });
            scene.load.start();
          } else {
            this.createColoredSprite(scene, key, 0x7f8c8d, 32, 0.7);
            resolve();
          }
        })
        .catch(() => {
          this.createColoredSprite(scene, key, 0x7f8c8d, 32, 0.7);
          resolve();
        });
    });
  }

  private async loadAudio(scene: Phaser.Scene, key: string, path: string): Promise<void> {
    return new Promise((resolve) => {
      this.checkAssetExists(path)
        .then(exists => {
          if (exists) {
            scene.load.audio(key, path);
            scene.load.once(`filecomplete-audio-${key}`, () => {
              this.loadedAssets.add(key);
              resolve();
            });
            scene.load.once(`loaderror`, () => {
              console.warn(`[AssetManager] Failed to load audio: ${key} from ${path}`);
              resolve();
            });
            scene.load.start();
          } else {
            console.warn(`[AssetManager] Audio asset not found: ${key} from ${path}`);
            resolve();
          }
        })
        .catch(() => {
          resolve();
        });
    });
  }

  private async checkAssetExists(path: string): Promise<boolean> {
    try {
      const response = await fetch(path, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Get a random player sprite key
  public getRandomPlayerSprite(): string {
    const playerSprites = ['player-blue', 'player-red', 'player-green', 'player-yellow'];
    return playerSprites[Math.floor(Math.random() * playerSprites.length)];
  }

  // Check if an asset is loaded
  public isAssetLoaded(key: string): boolean {
    return this.loadedAssets.has(key);
  }

  // Get all loaded asset keys
  public getLoadedAssets(): string[] {
    return Array.from(this.loadedAssets);
  }

  // Clear loaded assets (for cleanup)
  public clearAssets(): void {
    this.loadedAssets.clear();
    this.loadingPromises.clear();
  }

  // Preload essential assets that are needed immediately
  public preloadEssentialAssets(scene: Phaser.Scene): void {
    console.log('[AssetManager] Preloading essential assets...');
    
    // Always create basic placeholder assets for immediate use
    this.createPlaceholderAssets(scene);
  }
}
