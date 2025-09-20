import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Game: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="game-container">
      <header className="game-header">
        <div className="user-info">
          <h1>Welcome to the Metaverse, {user?.username}!</h1>
          <p className="user-email">{user?.email && `Email: ${user.email}`}</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <main className="game-content">
        <div className="game-placeholder">
          <div className="metaverse-preview">
            <h2>🌐 2D Metaverse</h2>
            <p>Your virtual world is loading...</p>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>🎮 Interactive World</h3>
                <p>Explore and interact with other users in real-time</p>
              </div>
              <div className="feature-card">
                <h3>👥 Social Features</h3>
                <p>Connect with friends and make new connections</p>
              </div>
              <div className="feature-card">
                <h3>🎨 Customization</h3>
                <p>Personalize your avatar and space</p>
              </div>
              <div className="feature-card">
                <h3>🔊 Voice & Video</h3>
                <p>Communicate with proximity-based audio/video</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="game-footer">
        <p>Phase 1: Authentication Complete ✅</p>
        <p>Next: Phaser 3 integration and real-time features</p>
      </footer>
    </div>
  );
};

export default Game;
