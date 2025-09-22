import axios from 'axios';
import type { Space, CreateSpaceRequest, SpaceElement, Element } from '../types/space';

export class SpaceService {
  private static instance: SpaceService;

  private constructor() {}

  public static getInstance(): SpaceService {
    if (!SpaceService.instance) {
      SpaceService.instance = new SpaceService();
    }
    return SpaceService.instance;
  }

  // Get all available spaces
  async getAllSpaces(): Promise<Space[]> {
    try {
      const response = await axios.get('/space/all');
      return response.data.spaces || [];
    } catch (error) {
      console.error('Error fetching spaces:', error);
      throw error;
    }
  }

  // Get a specific space by ID
  async getSpace(spaceId: string): Promise<Space> {
    try {
      const response = await axios.get(`/space/${spaceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching space:', error);
      throw error;
    }
  }

  // Create a new space
  async createSpace(spaceData: CreateSpaceRequest): Promise<Space> {
    try {
      const response = await axios.post('/space', spaceData);
      return response.data;
    } catch (error) {
      console.error('Error creating space:', error);
      throw error;
    }
  }

  // Delete a space (admin only)
  async deleteSpace(spaceId: string): Promise<void> {
    try {
      await axios.delete(`/admin/space/${spaceId}`);
    } catch (error) {
      console.error('Error deleting space:', error);
      throw error;
    }
  }

  // Get space elements
  async getSpaceElements(spaceId: string): Promise<SpaceElement[]> {
    try {
      const response = await axios.get(`/space/${spaceId}/elements`);
      return response.data.elements || [];
    } catch (error) {
      console.error('Error fetching space elements:', error);
      throw error;
    }
  }

  // Get all available elements for building spaces
  async getAllElements(): Promise<Element[]> {
    try {
      const response = await axios.get('/element/all');
      return response.data.elements || [];
    } catch (error) {
      console.error('Error fetching elements:', error);
      throw error;
    }
  }

  // Add element to space (admin only)
  async addElementToSpace(spaceId: string, elementId: string, x: number, y: number): Promise<SpaceElement> {
    try {
      const response = await axios.post(`/admin/space/${spaceId}/element`, {
        elementId,
        x,
        y
      });
      return response.data;
    } catch (error) {
      console.error('Error adding element to space:', error);
      throw error;
    }
  }
}

export const spaceService = SpaceService.getInstance();
