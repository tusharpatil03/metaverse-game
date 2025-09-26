// WebSocket connection states
export const WebSocketState = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error'
} as const;

export type WebSocketState = typeof WebSocketState[keyof typeof WebSocketState];

// Message types that can be sent/received (matching server format)
export const MessageType = {
  // Connection management
  JOIN: 'join',
  SPACE_JOINED: 'space-joined',
  LEAVE: 'leave',
  
  // Movement
  MOVE: 'move',
  MOVEMENT: 'movement',
  MOVEMENT_REJECTED: 'movement-rejected',
  
  // Presence
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
  
  // WebRTC signaling
  OFFER: 'offer',
  ANSWER: 'answer',
  ICE_CANDIDATE: 'ice-candidate',
  
  // System messages
  ERROR: 'error',
  PONG: 'pong',
  PING: 'ping'
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];

// Base message interface
export interface BaseMessage {
  type: MessageType;
  timestamp: number;
  userId?: string;
}

// Client-to-server messages (no payload wrapper)
export interface JoinMessage extends BaseMessage {
  type: 'join';
  payload: {
    token: string;
  };
}

export interface MoveMessage extends BaseMessage {
  type: 'move';
  payload: {
    x: number;
    y: number;
  };
}

export interface LeaveMessage extends BaseMessage {
  type: 'leave';
}

// Server-to-client messages (with payload wrapper)
export interface SpaceJoinedMessage extends BaseMessage {
  type: 'space-joined';
  payload: {
    spawn: { x: number; y: number };
    users: Array<{
      userId: string;
      x: number;
      y: number;
    }>;
  };
}

export interface MovementRejectedMessage extends BaseMessage {
  type: 'movement-rejected';
  payload: {
    x: number;
    y: number;
  };
}

export interface UserJoinedMessage extends BaseMessage {
  type: 'user-joined';
  payload: {
    userId: string;
    x: number;
    y: number;
  };
}

export interface UserLeftMessage extends BaseMessage {
  type: 'user-left';
  payload: {
    userId: string;
  };
}

export interface MovementMessage extends BaseMessage {
  type: 'movement';
  payload: {
    userId: string;
    x: number;
    y: number;
  };
}

// WebRTC signaling messages
export interface OfferMessage extends BaseMessage {
  type: 'offer';
  targetUserId: string;
  offer: RTCSessionDescriptionInit;
}

export interface AnswerMessage extends BaseMessage {
  type: 'answer';
  targetUserId: string;
  answer: RTCSessionDescriptionInit;
}

export interface IceCandidateMessage extends BaseMessage {
  type: 'ice-candidate';
  targetUserId: string;
  candidate: RTCIceCandidateInit;
}

// Error message
export interface ErrorMessage extends BaseMessage {
  type: 'error';
  message: string;
  code?: string;
}

// Ping/Pong for keepalive
export interface PingMessage extends BaseMessage {
  type: 'ping';
}

export interface PongMessage extends BaseMessage {
  type: 'pong';
}

// Union type for all possible messages
export type WebSocketMessage = 
  | JoinMessage
  | LeaveMessage
  | MoveMessage
  | SpaceJoinedMessage
  | MovementRejectedMessage
  | UserJoinedMessage
  | UserLeftMessage
  | MovementMessage
  | OfferMessage
  | AnswerMessage
  | IceCandidateMessage
  | ErrorMessage
  | PingMessage
  | PongMessage;

// WebSocket connection configuration
export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  connectionTimeout: number;
}

// WebSocket connection info
export interface ConnectionInfo {
  state: WebSocketState;
  spaceId: string | null;
  connectedAt: Date | null;
  lastPingAt: Date | null;
  reconnectAttempts: number;
  error: string | null;
}

// Event handlers for WebSocket manager
export interface WebSocketEventHandlers {
  onStateChange?: (state: WebSocketState) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: string) => void;
  onUserJoined?: (user: { id: string; username: string; x: number; y: number; avatarId?: string }) => void;
  onUserLeft?: (userId: string) => void;
  onUserMoved?: (userId: string, x: number, y: number) => void;
  onMoveRejected?: (reason: string, currentPosition: { x: number; y: number }) => void;
}
