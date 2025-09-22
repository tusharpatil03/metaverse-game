import React, { useState } from 'react';
import { useSpace } from '../contexts/SpaceContext';
import type { Space } from '../types/space';
import CreateSpaceModal from './CreateSpaceModal';

const SpaceSelector: React.FC = () => {
  const { spaces, isLoading, error, selectSpace, fetchSpaces } = useSpace();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);

  const handleSpaceSelect = (space: Space) => {
    setSelectedSpaceId(space.id);
    selectSpace(space);
  };

  const handleCreateSpace = () => {
    setShowCreateModal(true);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    // Refresh spaces list after creating
    fetchSpaces();
  };

  const handleRefresh = () => {
    fetchSpaces();
  };

  if (isLoading) {
    return (
      <div className="space-selector loading">
        <div className="loading-spinner"></div>
        <p>Loading spaces...</p>
      </div>
    );
  }

  return (
    <div className="space-selector">
      <div className="space-selector-header">
        <h2>🌐 Select a Space</h2>
        <p>Choose a space to enter the metaverse</p>
        <div className="space-actions">
          <button 
            onClick={handleRefresh} 
            className="refresh-button"
            disabled={isLoading}
          >
            🔄 Refresh
          </button>
          <button 
            onClick={handleCreateSpace} 
            className="create-space-button"
          >
            ➕ Create Space
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={handleRefresh} className="retry-button">
            Try Again
          </button>
        </div>
      )}

      <div className="spaces-grid">
        {spaces.length === 0 ? (
          <div className="no-spaces">
            <h3>No spaces available</h3>
            <p>Create your first space to get started!</p>
            <button onClick={handleCreateSpace} className="create-first-space">
              Create Your First Space
            </button>
          </div>
        ) : (
          spaces.map((space) => (
            <div 
              key={space.id} 
              className={`space-card ${selectedSpaceId === space.id ? 'selected' : ''}`}
              onClick={() => handleSpaceSelect(space)}
            >
              <div className="space-thumbnail">
                {space.thumbnail ? (
                  <img src={space.thumbnail} alt={space.name} />
                ) : (
                  <div className="default-thumbnail">
                    <span className="space-icon">🏠</span>
                  </div>
                )}
              </div>
              
              <div className="space-info">
                <h3 className="space-name">{space.name}</h3>
                {space.description && (
                  <p className="space-description">{space.description}</p>
                )}
                
                <div className="space-details">
                  <div className="space-size">
                    📐 {space.width} × {space.height}
                  </div>
                  <div className="space-users">
                    👥 {space.currentUsers || 0}
                    {space.maxUsers && ` / ${space.maxUsers}`}
                  </div>
                  <div className="space-visibility">
                    {space.isPublic ? '🌍 Public' : '🔒 Private'}
                  </div>
                </div>
                
                <div className="space-meta">
                  <small>Created: {new Date(space.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
              
              <div className="space-actions-overlay">
                <button 
                  className="enter-space-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpaceSelect(space);
                  }}
                >
                  Enter Space →
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <CreateSpaceModal 
          onClose={handleModalClose}
          onSpaceCreated={(newSpace: Space) => {
            handleModalClose();
            handleSpaceSelect(newSpace);
          }}
        />
      )}
    </div>
  );
};

export default SpaceSelector;
