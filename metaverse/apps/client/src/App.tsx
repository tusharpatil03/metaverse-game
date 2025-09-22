import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SpaceProvider } from './contexts/SpaceContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Signup from './components/Signup';
import Game from './components/Game';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <SpaceProvider>
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
      </SpaceProvider>
    </AuthProvider>
  );
}

export default App;
