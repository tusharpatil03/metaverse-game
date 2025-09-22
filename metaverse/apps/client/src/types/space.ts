export interface Space {
  id: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  thumbnail?: string;
  creatorId: string;
  isPublic: boolean;
  maxUsers?: number;
  currentUsers?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpaceRequest {
  name: string;
  description?: string;
  width: number;
  height: number;
  isPublic: boolean;
  maxUsers?: number;
}

export interface SpaceElement {
  id: string;
  spaceId: string;
  elementId: string;
  x: number;
  y: number;
  static?: boolean;
}

export interface Element {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  static: boolean;
}
