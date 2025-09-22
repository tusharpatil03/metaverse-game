import { Scene } from 'phaser';
import { AssetManager } from '../managers/AssetManager';
import type { Space } from '../../types/space';
import type { SceneData } from '../../types/game';

export abstract class BaseScene extends Scene {
  protected space: Space | null = null;
  protected tileSize: number = 32;
  protected isSceneReady: boolean = false;

  constructor(key: string) {
    super({ key });
  }

  // Abstract methods that must be implemented by child scenes
  abstract initializeScene(data: SceneData): void;
  abstract setupGameObjects(): void;
  abstract handleSceneReady(): void;

  // Common initialization logic
  init(data: SceneData) {
    console.log(`[${this.scene.key}] Initializing scene with data:`, data);
    
    this.space = data.space;
    this.tileSize = 32; // Standard tile size
    this.isSceneReady = false;

    // Call child-specific initialization
    this.initializeScene(data);
  }

  // Common preload logic
  preload() {
    console.log(`[${this.scene.key}] Preloading assets...`);
    
    // Set loading progress callback
    this.load.on('progress', (value: number) => {
      console.log(`[${this.scene.key}] Loading progress: ${Math.round(value * 100)}%`);
      this.events.emit('loading-progress', value);
    });

    this.load.on('complete', () => {
      console.log(`[${this.scene.key}] Asset loading complete`);
      this.events.emit('loading-complete');
    });

    this.load.on('loaderror', (file: any) => {
      console.error(`[${this.scene.key}] Failed to load asset:`, file.key);
      this.events.emit('loading-error', file);
    });

    // Load basic assets that all scenes need
    this.loadBasicAssets();
  }

  // Common create logic
  create() {
    console.log(`[${this.scene.key}] Creating scene...`);
    
    try {
      // Setup common game objects
      this.setupGameObjects();
      
      // Mark scene as ready
      this.isSceneReady = true;
      
      // Call child-specific ready handler
      this.handleSceneReady();
      
      // Emit scene ready event
      this.events.emit('scene-ready');
      
    } catch (error) {
      console.error(`[${this.scene.key}] Error creating scene:`, error);
      this.events.emit('scene-error', error);
    }
  }

  // Load basic assets that all scenes need
  protected loadBasicAssets() {
    console.log(`[${this.scene.key}] Loading basic assets via AssetManager...`);
    
    // Use AssetManager to preload essential assets
    const assetManager = AssetManager.getInstance();
    assetManager.preloadEssentialAssets(this);
    
    // Optionally load additional assets
    const defaultAssets = assetManager.getDefaultAssets();
    assetManager.loadAssets(this, defaultAssets).catch(error => {
      console.warn(`[${this.scene.key}] Failed to load some assets:`, error);
      // AssetManager will handle fallbacks automatically
    });
  }

  // Utility method to create grid background
  protected createGridBackground() {
    if (!this.space) return;

    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x34495e, 0.3);
    
    const spaceWidth = this.space.width * this.tileSize;
    const spaceHeight = this.space.height * this.tileSize;
    
    // Draw vertical lines
    for (let x = 0; x <= spaceWidth; x += this.tileSize) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, spaceHeight);
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= spaceHeight; y += this.tileSize) {
      graphics.moveTo(0, y);
      graphics.lineTo(spaceWidth, y);
    }
    
    graphics.strokePath();
    
    return graphics;
  }

  // Utility method to create space boundaries
  protected createSpaceBoundaries() {
    if (!this.space) return;

    const spaceWidth = this.space.width * this.tileSize;
    const spaceHeight = this.space.height * this.tileSize;

    const boundary = this.add.graphics();
    boundary.lineStyle(3, 0xe74c3c, 1);
    boundary.strokeRect(0, 0, spaceWidth, spaceHeight);
    
    return boundary;
  }

  // Utility method to add space info text
  protected addSpaceInfo() {
    if (!this.space) return;

    const titleText = this.add.text(10, 10, `Space: ${this.space.name}`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });

    const dimensionsText = this.add.text(10, 40, `${this.space.width} × ${this.space.height}`, {
      fontSize: '12px',
      color: '#bdc3c7',
      backgroundColor: '#000000',
      padding: { x: 6, y: 2 }
    });

    return { titleText, dimensionsText };
  }

  // Utility method to convert world coordinates to grid coordinates
  protected worldToGrid(x: number, y: number): { gridX: number; gridY: number } {
    return {
      gridX: Math.floor(x / this.tileSize),
      gridY: Math.floor(y / this.tileSize)
    };
  }

  // Utility method to convert grid coordinates to world coordinates
  protected gridToWorld(gridX: number, gridY: number): { x: number; y: number } {
    return {
      x: gridX * this.tileSize,
      y: gridY * this.tileSize
    };
  }

  // Check if grid position is within space bounds
  protected isValidGridPosition(gridX: number, gridY: number): boolean {
    if (!this.space) return false;
    return gridX >= 0 && gridX < this.space.width && gridY >= 0 && gridY < this.space.height;
  }

  // Get space dimensions in world coordinates
  protected getSpaceWorldDimensions(): { width: number; height: number } {
    if (!this.space) return { width: 0, height: 0 };
    return {
      width: this.space.width * this.tileSize,
      height: this.space.height * this.tileSize
    };
  }

  // Clean up scene resources
  shutdown() {
    console.log(`[${this.scene.key}] Shutting down scene...`);
    this.isSceneReady = false;
  }
}
