import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SpaceProvider } from './contexts/SpaceContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import Game from './components/Game/Game';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <SpaceProvider>
        <WebSocketProvider>
          <Router>
            <div className="app">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected routes */}
                <Route 
                  path="/game" 
                  element={
                    <ProtectedRoute>
                      <Game />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/game" replace />} />
                
                {/* Catch all route - redirect to game */}
                <Route path="*" element={<Navigate to="/game" replace />} />
              </Routes>
            </div>
          </Router>
        </WebSocketProvider>
      </SpaceProvider>
    </AuthProvider>
  );
}

export default App;
