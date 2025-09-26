import React, { useState } from 'react';
import { useSpace } from '../../contexts/SpaceContext';
import type { Space } from '../../types/space';
import CreateSpaceModal from '../CreateSpaceModal/CreateSpaceModal';
import styles from './SpaceSelector.module.css';

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
      <div className={`${styles.spaceSelector} ${styles.loading}`}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading spaces...</p>
      </div>
    );
  }

  return (
    <div className={styles.spaceSelector}>
      <div className={styles.header}>
        <h2>🌐 Select a Space</h2>
        <p>Choose a space to enter the metaverse</p>
        <div className={styles.actions}>
          <button 
            onClick={handleRefresh} 
            className={styles.refreshButton}
            disabled={isLoading}
          >
            🔄 Refresh
          </button>
          <button 
            onClick={handleCreateSpace} 
            className={styles.createSpaceButton}
          >
            ➕ Create Space
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <p>❌ {error}</p>
          <button onClick={handleRefresh} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      )}

      <div className={styles.spacesGrid}>
        {spaces.length === 0 ? (
          <div className={styles.noSpaces}>
            <h3>No spaces available</h3>
            <p>Create your first space to get started!</p>
            <button onClick={handleCreateSpace} className={styles.createFirstSpace}>
              Create Your First Space
            </button>
          </div>
        ) : (
          spaces.map((space) => (
            <div 
              key={space.id} 
              className={`${styles.spaceCard} ${selectedSpaceId === space.id ? styles.selected : ''}`}
              onClick={() => handleSpaceSelect(space)}
            >
              <div className={styles.spaceThumbnail}>
                {space.thumbnail ? (
                  <img src={space.thumbnail} alt={space.name} />
                ) : (
                  <div className={styles.defaultThumbnail}>
                    <span className={styles.spaceIcon}>🏠</span>
                  </div>
                )}
              </div>
              
              <div className={styles.spaceInfo}>
                <h3 className={styles.spaceName}>{space.name}</h3>
                {space.description && (
                  <p className={styles.spaceDescription}>{space.description}</p>
                )}
                
                <div className={styles.spaceDetails}>
                  <div className={styles.spaceSize}>
                    📐 {space.width} × {space.height}
                  </div>
                  <div className={styles.spaceUsers}>
                    👥 {space.currentUsers || 0}
                    {space.maxUsers && ` / ${space.maxUsers}`}
                  </div>
                  <div className={styles.spaceVisibility}>
                    {space.isPublic ? '🌍 Public' : '🔒 Private'}
                  </div>
                </div>
                
                <div className={styles.spaceMeta}>
                  <small>Created: {new Date(space.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
              
              <div className={styles.spaceActionsOverlay}>
                <button 
                  className={styles.enterSpaceButton}
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
}
;

export default SpaceSelector;
