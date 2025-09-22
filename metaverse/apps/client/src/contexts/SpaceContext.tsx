import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Space, CreateSpaceRequest } from '../types/space';
import { spaceService } from '../services/spaceService';

interface SpaceContextType {
  spaces: Space[];
  currentSpace: Space | null;
  isLoading: boolean;
  error: string | null;
  fetchSpaces: () => Promise<void>;
  createSpace: (spaceData: CreateSpaceRequest) => Promise<Space>;
  selectSpace: (space: Space) => void;
  clearCurrentSpace: () => void;
  refreshCurrentSpace: () => Promise<void>;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export const SpaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all available spaces
  const fetchSpaces = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedSpaces = await spaceService.getAllSpaces();
      setSpaces(fetchedSpaces);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch spaces';
      setError(errorMessage);
      console.error('Error fetching spaces:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new space
  const createSpace = async (spaceData: CreateSpaceRequest): Promise<Space> => {
    try {
      setIsLoading(true);
      setError(null);
      const newSpace = await spaceService.createSpace(spaceData);
      
      // Add the new space to the list
      setSpaces(prev => [...prev, newSpace]);
      
      return newSpace;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create space';
      setError(errorMessage);
      console.error('Error creating space:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Select a space to enter
  const selectSpace = (space: Space): void => {
    setCurrentSpace(space);
    // Store in localStorage for persistence
    localStorage.setItem('current_space', JSON.stringify(space));
  };

  // Clear current space selection
  const clearCurrentSpace = (): void => {
    setCurrentSpace(null);
    localStorage.removeItem('current_space');
  };

  // Refresh current space data
  const refreshCurrentSpace = async (): Promise<void> => {
    if (!currentSpace) return;
    
    try {
      setError(null);
      const updatedSpace = await spaceService.getSpace(currentSpace.id);
      setCurrentSpace(updatedSpace);
      localStorage.setItem('current_space', JSON.stringify(updatedSpace));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh space';
      setError(errorMessage);
      console.error('Error refreshing space:', err);
    }
  };

  // Initialize space state from localStorage
  useEffect(() => {
    const initializeSpace = () => {
      try {
        const storedSpace = localStorage.getItem('current_space');
        if (storedSpace) {
          const parsedSpace = JSON.parse(storedSpace);
          setCurrentSpace(parsedSpace);
        }
      } catch (error) {
        console.error('Error parsing stored space data:', error);
        localStorage.removeItem('current_space');
      }
    };

    initializeSpace();
  }, []);

  // Fetch spaces on mount
  useEffect(() => {
    fetchSpaces();
  }, []);

  const value: SpaceContextType = {
    spaces,
    currentSpace,
    isLoading,
    error,
    fetchSpaces,
    createSpace,
    selectSpace,
    clearCurrentSpace,
    refreshCurrentSpace,
  };

  return (
    <SpaceContext.Provider value={value}>
      {children}
    </SpaceContext.Provider>
  );
};

export const useSpace = (): SpaceContextType => {
  const context = useContext(SpaceContext);
  if (context === undefined) {
    throw new Error('useSpace must be used within a SpaceProvider');
  }
  return context;
};
