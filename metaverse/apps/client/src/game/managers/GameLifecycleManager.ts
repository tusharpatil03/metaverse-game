export class GameLifecycleManager {
  private static instance: GameLifecycleManager;
  private isInitialized: boolean = false;
  private cleanupFunctions: (() => void)[] = [];
  private resizeObserver: ResizeObserver | null = null;

  private constructor() {}

  public static getInstance(): GameLifecycleManager {
    if (!GameLifecycleManager.instance) {
      GameLifecycleManager.instance = new GameLifecycleManager();
    }
    return GameLifecycleManager.instance;
  }

  // Initialize game lifecycle management
  public initialize(gameContainer: HTMLElement, onResize?: (width: number, height: number) => void): void {
    if (this.isInitialized) {
      console.warn('[GameLifecycleManager] Already initialized');
      return;
    }

    console.log('[GameLifecycleManager] Initializing game lifecycle management...');

    // Setup resize observer for responsive game canvas
    this.setupResizeObserver(gameContainer, onResize);

    // Setup visibility change handling
    this.setupVisibilityHandling();

    // Setup memory management
    this.setupMemoryManagement();

    // Setup error handling
    this.setupGlobalErrorHandling();

    this.isInitialized = true;
    console.log('[GameLifecycleManager] Initialization complete');
  }

  private setupResizeObserver(container: HTMLElement, onResize?: (width: number, height: number) => void): void {
    if (!window.ResizeObserver) {
      console.warn('[GameLifecycleManager] ResizeObserver not supported, falling back to window resize');
      
      const handleResize = () => {
        const { clientWidth, clientHeight } = container;
        onResize?.(clientWidth, clientHeight);
      };

      window.addEventListener('resize', handleResize);
      this.addCleanupFunction(() => window.removeEventListener('resize', handleResize));
      return;
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        onResize?.(width, height);
      }
    });

    this.resizeObserver.observe(container);
    this.addCleanupFunction(() => {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }
    });
  }

  private setupVisibilityHandling(): void {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[GameLifecycleManager] Game paused (tab hidden)');
        this.pauseGame();
      } else {
        console.log('[GameLifecycleManager] Game resumed (tab visible)');
        this.resumeGame();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    this.addCleanupFunction(() => document.removeEventListener('visibilitychange', handleVisibilityChange));

    // Handle window focus/blur as fallback
    const handleFocus = () => this.resumeGame();
    const handleBlur = () => this.pauseGame();

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    this.addCleanupFunction(() => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    });
  }

  private setupMemoryManagement(): void {
    // Monitor memory usage (if available)
    if ('memory' in performance) {
      const checkMemory = () => {
        const memInfo = (performance as any).memory;
        const memoryUsage = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
        
        if (memoryUsage > 0.8) {
          console.warn('[GameLifecycleManager] High memory usage detected:', Math.round(memoryUsage * 100) + '%');
          this.requestGarbageCollection();
        }
      };

      const memoryCheckInterval = setInterval(checkMemory, 30000); // Check every 30 seconds
      this.addCleanupFunction(() => clearInterval(memoryCheckInterval));
    }

    // Handle low memory warnings (mobile)
    if ('onmemorywarning' in window) {
      const handleMemoryWarning = () => {
        console.warn('[GameLifecycleManager] Memory warning received');
        this.requestGarbageCollection();
      };

      (window as any).addEventListener('memorywarning', handleMemoryWarning);
      this.addCleanupFunction(() => 
        (window as any).removeEventListener('memorywarning', handleMemoryWarning)
      );
    }
  }

  private setupGlobalErrorHandling(): void {
    const handleError = (event: ErrorEvent) => {
      console.error('[GameLifecycleManager] Global error:', event.error);
      // Could emit to React for error UI
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[GameLifecycleManager] Unhandled promise rejection:', event.reason);
      // Could emit to React for error UI
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    this.addCleanupFunction(() => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    });
  }

  private pauseGame(): void {
    // Emit pause event that game scenes can listen to
    window.dispatchEvent(new CustomEvent('game-pause'));
  }

  private resumeGame(): void {
    // Emit resume event that game scenes can listen to
    window.dispatchEvent(new CustomEvent('game-resume'));
  }

  private requestGarbageCollection(): void {
    // Force garbage collection if available (Chrome DevTools)
    if ('gc' in window) {
      (window as any).gc();
    }
  }

  // Add a cleanup function to be called on destroy
  public addCleanupFunction(cleanup: () => void): void {
    this.cleanupFunctions.push(cleanup);
  }

  // Get current memory usage (if available)
  public getMemoryUsage(): { used: number; total: number; percentage: number } | null {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      return {
        used: memInfo.usedJSHeapSize,
        total: memInfo.jsHeapSizeLimit,
        percentage: Math.round((memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100)
      };
    }
    return null;
  }

  // Check if game is currently paused
  public isPaused(): boolean {
    return document.hidden;
  }

  // Destroy and cleanup all resources
  public destroy(): void {
    console.log('[GameLifecycleManager] Destroying lifecycle manager...');
    
    // Run all cleanup functions
    this.cleanupFunctions.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('[GameLifecycleManager] Error during cleanup:', error);
      }
    });

    this.cleanupFunctions = [];
    this.isInitialized = false;
    
    console.log('[GameLifecycleManager] Cleanup complete');
  }
}
