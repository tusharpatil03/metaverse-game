import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { WebSocketManager } from '../game/managers/WebSocketManager';
import { useAuth } from './AuthContext';
import { 
  WebSocketState, 
  type ConnectionInfo, 
  type WebSocketMessage
} from '../types/websocket';
import type { Player } from '../types/game';

interface WebSocketContextType {
  // Connection state
  connectionInfo: ConnectionInfo;
  isConnected: boolean;
  
  // Connection methods
  connect: (spaceId: string) => Promise<void>;
  disconnect: () => void;
  
  // Messaging
  sendMove: (x: number, y: number) => void;
  sendMessage: (message: WebSocketMessage) => void;
  
  // Players in current space
  players: Map<string, Player>;
  
  // Connection status
  connectionError: string | null;
  isReconnecting: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { user, token } = useAuth();
  const [wsManager] = useState(() => WebSocketManager.getInstance());
  
  // Connection state
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>(() => 
    wsManager.getConnectionInfo()
  );
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [players, setPlayers] = useState<Map<string, Player>>(new Map());

  // Derived state
  const isConnected = connectionInfo.state === WebSocketState.CONNECTED;
  const isReconnecting = connectionInfo.state === WebSocketState.RECONNECTING;

  // Connection methods
  const connect = useCallback(async (spaceId: string) => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    try {
      setConnectionError(null);
      await wsManager.connect(spaceId, token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect';
      setConnectionError(errorMessage);
      throw error;
    }
  }, [wsManager, token]);

  const disconnect = useCallback(() => {
    wsManager.disconnect();
    setPlayers(new Map());
    setConnectionError(null);
  }, [wsManager]);

  // Messaging methods
  const sendMove = useCallback((x: number, y: number) => {
    wsManager.sendMove(x, y);
  }, [wsManager]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    wsManager.sendMessage(message);
  }, [wsManager]);

  // Setup WebSocket event handlers
  useEffect(() => {
    const handleStateChange = (state: WebSocketState) => {
      setConnectionInfo(wsManager.getConnectionInfo());
      
      if (state === WebSocketState.DISCONNECTED) {
        setPlayers(new Map());
      }
    };

    const handleMessage = (message: WebSocketMessage) => {
      console.log('[WebSocketContext] Received message:', message.type);
      
      // Handle specific message types that affect React state
      switch (message.type) {
        case 'space-joined':
          if ('payload' in message) {
            const payload = message.payload as any;
            console.log('[WebSocketContext] Space joined, initializing players:', payload);
            
            // Initialize players from existing users in space
            if (payload.users && Array.isArray(payload.users)) {
              setPlayers(prev => {
                const newPlayers = new Map(prev);
                payload.users.forEach((user: any) => {
                  newPlayers.set(user.userId, {
                    id: user.userId,
                    username: user.userId,
                    x: user.x,
                    y: user.y
                  });
                });
                return newPlayers;
              });
            }
          }
          break;
          
        case 'user-joined':
          if ('payload' in message) {
            const payload = message.payload as any;
            setPlayers(prev => {
              const newPlayers = new Map(prev);
              newPlayers.set(payload.userId, {
                id: payload.userId,
                username: payload.userId,
                x: payload.x,
                y: payload.y
              });
              return newPlayers;
            });
          }
          break;
          
        case 'user-left':
          if ('payload' in message) {
            const payload = message.payload as any;
            setPlayers(prev => {
              const newPlayers = new Map(prev);
              newPlayers.delete(payload.userId);
              return newPlayers;
            });
          }
          break;
          
        case 'movement':
          if ('payload' in message) {
            const payload = message.payload as any;
            setPlayers(prev => {
              const newPlayers = new Map(prev);
              const player = newPlayers.get(payload.userId);
              if (player) {
                newPlayers.set(payload.userId, {
                  ...player,
                  x: payload.x,
                  y: payload.y
                });
              }
              return newPlayers;
            });
          }
          break;
      }
    };

    const handleError = (error: string) => {
      console.error('[WebSocketContext] WebSocket error:', error);
      setConnectionError(error);
    };

    const handleUserJoined = (user: Player) => {
      console.log('[WebSocketContext] User joined:', user.username);
      setPlayers(prev => {
        const newPlayers = new Map(prev);
        newPlayers.set(user.id, user);
        return newPlayers;
      });
    };

    const handleUserLeft = (userId: string) => {
      console.log('[WebSocketContext] User left:', userId);
      setPlayers(prev => {
        const newPlayers = new Map(prev);
        newPlayers.delete(userId);
        return newPlayers;
      });
    };

    const handleUserMoved = (userId: string, x: number, y: number) => {
      setPlayers(prev => {
        const newPlayers = new Map(prev);
        const player = newPlayers.get(userId);
        if (player) {
          newPlayers.set(userId, { ...player, x, y });
        }
        return newPlayers;
      });
    };

    const handleMoveRejected = (reason: string, currentPosition: { x: number; y: number }) => {
      console.warn('[WebSocketContext] Move rejected:', reason, currentPosition);
      
      // Emit custom event for game scene to handle
      window.dispatchEvent(new CustomEvent('movement-rejected', {
        detail: { reason, currentPosition }
      }));
    };

    // Set up event handlers
    wsManager.setEventHandlers({
      onStateChange: handleStateChange,
      onMessage: handleMessage,
      onError: handleError,
      onUserJoined: handleUserJoined,
      onUserLeft: handleUserLeft,
      onUserMoved: handleUserMoved,
      onMoveRejected: handleMoveRejected
    });

    // Initial state sync
    setConnectionInfo(wsManager.getConnectionInfo());

    // Cleanup on unmount
    return () => {
      wsManager.setEventHandlers({});
    };
  }, [wsManager]);

  // Auto-disconnect when user logs out
  useEffect(() => {
    if (!user && isConnected) {
      disconnect();
    }
  }, [user, isConnected, disconnect]);

  // Auto-disconnect on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isConnected) {
        wsManager.disconnect();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isConnected, wsManager]);

  const contextValue: WebSocketContextType = {
    // Connection state
    connectionInfo,
    isConnected,
    
    // Connection methods
    connect,
    disconnect,
    
    // Messaging
    sendMove,
    sendMessage,
    
    // Players
    players,
    
    // Status
    connectionError,
    isReconnecting
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook to use WebSocket context
export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
