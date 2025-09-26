import { 
  type WebSocketMessage, 
  type WebSocketConfig, 
  WebSocketState, 
  type ConnectionInfo,
  type WebSocketEventHandlers,
  type JoinMessage,
  type MoveMessage
} from '../../types/websocket';

export class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private connectionInfo: ConnectionInfo;
  private eventHandlers: WebSocketEventHandlers = {};
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private connectionTimeoutTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      url: 'ws://localhost:3001',
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      connectionTimeout: 10000
    };

    this.connectionInfo = {
      state: WebSocketState.DISCONNECTED,
      spaceId: null,
      connectedAt: null,
      lastPingAt: null,
      reconnectAttempts: 0,
      error: null
    };
  }

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  // Set event handlers
  public setEventHandlers(handlers: WebSocketEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  // Connect to WebSocket server with space ID and JWT token
  public async connect(spaceId: string, token: string): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.warn('[WebSocketManager] Already connected');
      return;
    }

    console.log('[WebSocketManager] Connecting to space:', spaceId);
    
    this.updateConnectionState(WebSocketState.CONNECTING);
    this.connectionInfo.spaceId = spaceId;
    this.connectionInfo.error = null;

    try {
      // Create WebSocket connection with space ID as query parameter
      const wsUrl = `${this.config.url}?spaceId=${encodeURIComponent(spaceId)}`;
      this.ws = new WebSocket(wsUrl);

      // Set connection timeout
      this.connectionTimeoutTimer = setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
          console.error('[WebSocketManager] Connection timeout');
          this.ws.close();
          this.handleConnectionError('Connection timeout');
        }
      }, this.config.connectionTimeout);

      this.setupWebSocketEventListeners();

      // Wait for connection to open, then send join message
      await new Promise<void>((resolve, reject) => {
        if (!this.ws) {
          reject(new Error('WebSocket not initialized'));
          return;
        }

        const handleOpen = () => {
          console.log('[WebSocketManager] WebSocket connected');
          this.clearConnectionTimeout();
          this.updateConnectionState(WebSocketState.CONNECTED);
          this.connectionInfo.connectedAt = new Date();
          this.connectionInfo.reconnectAttempts = 0;

          // Send join message
          this.sendJoinMessage(spaceId, token);
          
          // Start heartbeat
          this.startHeartbeat();
          
          resolve();
        };

        const handleError = (error: Event) => {
          console.error('[WebSocketManager] Connection error:', error);
          this.clearConnectionTimeout();
          reject(new Error('Failed to connect to WebSocket'));
        };

        this.ws.addEventListener('open', handleOpen, { once: true });
        this.ws.addEventListener('error', handleError, { once: true });
      });

    } catch (error) {
      console.error('[WebSocketManager] Connection failed:', error);
      this.handleConnectionError(error instanceof Error ? error.message : 'Connection failed');
      throw error;
    }
  }

  // Disconnect from WebSocket
  public disconnect(): void {
    console.log('[WebSocketManager] Disconnecting...');
    
    this.clearTimers();
    
    if (this.ws) {
      // Send leave message before closing
      if (this.ws.readyState === WebSocket.OPEN && this.connectionInfo.spaceId) {
        this.sendMessage({
          type: 'leave',
          timestamp: Date.now()
        });
      }
      
      this.ws.close();
      this.ws = null;
    }

    this.updateConnectionState(WebSocketState.DISCONNECTED);
    this.connectionInfo.spaceId = null;
    this.connectionInfo.connectedAt = null;
  }

  // Send a movement message
  public sendMove(x: number, y: number): void {
    if (!this.connectionInfo.spaceId) {
      console.error('[WebSocketManager] Cannot send move: not connected to a space');
      return;
    }

    const moveMessage: MoveMessage = {
      type: 'move',
      payload: {
        x,
        y
      },
      timestamp: Date.now()
    };

    this.sendMessage(moveMessage);
  }

  // Send a generic message
  public sendMessage(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[WebSocketManager] Cannot send message: WebSocket not connected');
      return;
    }

    try {
      const messageString = JSON.stringify(message);
      this.ws.send(messageString);
      console.log('[WebSocketManager] Sent message:', message.type);
    } catch (error) {
      console.error('[WebSocketManager] Failed to send message:', error);
    }
  }

  // Get current connection info
  public getConnectionInfo(): ConnectionInfo {
    return { ...this.connectionInfo };
  }

  // Check if connected
  public isConnected(): boolean {
    return this.connectionInfo.state === WebSocketState.CONNECTED;
  }

  private setupWebSocketEventListeners(): void {
    if (!this.ws) return;

    this.ws.addEventListener('message', this.handleMessage.bind(this));
    this.ws.addEventListener('close', this.handleClose.bind(this));
    this.ws.addEventListener('error', this.handleError.bind(this));
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log('[WebSocketManager] Received message:', message.type);

      // Handle system messages
      switch (message.type) {
        case 'pong':
          this.connectionInfo.lastPingAt = new Date();
          break;
          
        case 'space-joined':
          if ('payload' in message) {
            console.log('[WebSocketManager] Space joined successfully:', message.payload);
            // Emit space joined event for game initialization
            this.eventHandlers.onMessage?.(message);
          }
          break;
          
        case 'error':
          if ('message' in message) {
            console.error('[WebSocketManager] Server error:', message.message);
            this.eventHandlers.onError?.(message.message);
          }
          break;
          
        case 'movement-rejected':
          if ('payload' in message) {
            const payload = message.payload as any;
            console.warn('[WebSocketManager] Movement rejected, correcting to:', payload);
            this.eventHandlers.onMoveRejected?.('Invalid move', payload);
          }
          break;
          
        case 'user-joined':
          if ('payload' in message) {
            const payload = message.payload as any;
            console.log('[WebSocketManager] User joined:', payload.userId);
            this.eventHandlers.onUserJoined?.({
              id: payload.userId,
              username: payload.userId, // Server doesn't send username
              x: payload.x,
              y: payload.y
            });
          }
          break;
          
        case 'user-left':
          if ('payload' in message) {
            const payload = message.payload as any;
            console.log('[WebSocketManager] User left:', payload.userId);
            this.eventHandlers.onUserLeft?.(payload.userId);
          }
          break;
          
        case 'movement':
          if ('payload' in message) {
            const payload = message.payload as any;
            this.eventHandlers.onUserMoved?.(payload.userId, payload.x, payload.y);
          }
          break;
      }

      // Emit generic message event
      this.eventHandlers.onMessage?.(message);

    } catch (error) {
      console.error('[WebSocketManager] Failed to parse message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('[WebSocketManager] WebSocket closed:', event.code, event.reason);
    
    this.clearTimers();
    this.ws = null;

    if (event.code === 1000) {
      // Normal closure
      this.updateConnectionState(WebSocketState.DISCONNECTED);
    } else {
      // Unexpected closure - attempt reconnection
      this.handleConnectionError(`Connection closed unexpectedly (${event.code})`);
    }
  }

  private handleError(event: Event): void {
    console.error('[WebSocketManager] WebSocket error:', event);
    this.handleConnectionError('WebSocket error occurred');
  }

  private handleConnectionError(error: string): void {
    this.connectionInfo.error = error;
    this.eventHandlers.onError?.(error);

    if (this.connectionInfo.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.attemptReconnection();
    } else {
      console.error('[WebSocketManager] Max reconnection attempts reached');
      this.updateConnectionState(WebSocketState.ERROR);
    }
  }

  private attemptReconnection(): void {
    if (!this.connectionInfo.spaceId) return;

    this.connectionInfo.reconnectAttempts++;
    this.updateConnectionState(WebSocketState.RECONNECTING);

    console.log(`[WebSocketManager] Attempting reconnection ${this.connectionInfo.reconnectAttempts}/${this.config.maxReconnectAttempts}...`);

    this.reconnectTimer = setTimeout(() => {
      if (this.connectionInfo.spaceId) {
        // We need the token for reconnection - this should be stored or retrieved
        // For now, we'll emit an event that the React layer can handle
        this.eventHandlers.onError?.('Reconnection needed - please rejoin the space');
      }
    }, this.config.reconnectInterval);
  }

  private sendJoinMessage(_spaceId: string, token: string): void {
    const joinMessage: JoinMessage = {
      type: 'join',
      payload: {
        token
      },
      timestamp: Date.now()
    };

    this.sendMessage(joinMessage);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.sendMessage({
          type: 'ping',
          timestamp: Date.now()
        });
      }
    }, this.config.heartbeatInterval);
  }

  private updateConnectionState(state: WebSocketState): void {
    if (this.connectionInfo.state !== state) {
      this.connectionInfo.state = state;
      console.log('[WebSocketManager] State changed to:', state);
      this.eventHandlers.onStateChange?.(state);
    }
  }

  private clearTimers(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.clearConnectionTimeout();
  }

  private clearConnectionTimeout(): void {
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer);
      this.connectionTimeoutTimer = null;
    }
  }

  // Cleanup and destroy
  public destroy(): void {
    console.log('[WebSocketManager] Destroying WebSocket manager...');
    this.disconnect();
    this.eventHandlers = {};
  }
}
