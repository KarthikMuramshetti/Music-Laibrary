import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';

import Sidebar from './components/Sidebar';
import PlayerBar from './components/PlayerBar';

import Login from './pages/Login';
import Register from './pages/Register';
import Library from './pages/Library';
import Playlists from './pages/Playlists';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import AdminSongs from './pages/AdminSongs';
import AdminArtists from './pages/AdminArtists';
import AdminDirectors from './pages/AdminDirectors';
import AdminAlbums from './pages/AdminAlbums';
import AdminNotifications from './pages/AdminNotifications';

function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/library" replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <PlayerProvider>
      <div className="app-layout">

        <button
          className="hamburger-btn"
          onClick={() => window.dispatchEvent(new Event('toggle-sidebar'))}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>

        <div className="app-body">
          <Sidebar />

          <div
            className="sidebar-overlay"
            id="sidebar-overlay"
            onClick={() => window.dispatchEvent(new Event('toggle-sidebar'))}
          />

          <main className="main-content">{children}</main>
        </div>
        <PlayerBar />
      </div>
    </PlayerProvider>
  );
}

function AppRoutes() {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/library" replace /> : <Login />} />
      <Route path="/register" element={isLoggedIn ? <Navigate to="/library" replace /> : <Register />} />

      <Route path="/library" element={<PrivateRoute><AppLayout><Library /></AppLayout></PrivateRoute>} />
      <Route path="/playlists" element={<PrivateRoute><AppLayout><Playlists /></AppLayout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><AppLayout><Profile /></AppLayout></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><AppLayout><Notifications /></AppLayout></PrivateRoute>} />

      <Route path="/admin/songs" element={<AdminRoute><AppLayout><AdminSongs /></AppLayout></AdminRoute>} />
      <Route path="/admin/artists" element={<AdminRoute><AppLayout><AdminArtists /></AppLayout></AdminRoute>} />
      <Route path="/admin/directors" element={<AdminRoute><AppLayout><AdminDirectors /></AppLayout></AdminRoute>} />
      <Route path="/admin/albums" element={<AdminRoute><AppLayout><AdminAlbums /></AppLayout></AdminRoute>} />
      <Route path="/admin/notifications" element={<AdminRoute><AppLayout><AdminNotifications /></AppLayout></AdminRoute>} />

      <Route path="/" element={<Navigate to={isLoggedIn ? "/library" : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'toast-style',
            duration: 3000,
            style: {
              background: 'var(--bg2)',
              color: 'var(--text)',
              border: '1px solid var(--border2)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
