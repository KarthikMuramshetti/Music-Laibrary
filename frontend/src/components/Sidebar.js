import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI, getFileUrl } from '../services/api';

const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  music: "M9 18V5l12-2v13 M6 21a3 3 0 100-6 3 3 0 000 6zm12-2a3 3 0 100-6 3 3 0 000 6z",
  playlist: "M21 15V19a2 2 0 01-2 2H5a2 2 0 01-2-2V15 M17 8l-5-5-5 5 M12 3v12",
  search: "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  admin: "M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  mic: "M12 2a3 3 0 013 3v7a3 3 0 01-6 0V5a3 3 0 013-3z M19 10v2a7 7 0 01-14 0v-2 M12 19v3 M8 22h8",
  disc: "M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4z",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
};

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(o => {
      const next = !o;
      const overlay = document.getElementById('sidebar-overlay');
      if (overlay) overlay.classList.toggle('visible', next);
      return next;
    });
    window.addEventListener('toggle-sidebar', handler);
    return () => window.removeEventListener('toggle-sidebar', handler);
  }, []);

  useEffect(() => {
    notificationsAPI.getAll()
      .then(r => setUnreadCount(r.data.filter(n => !n.isRead).length))
      .catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
      <button className="sidebar-close-btn" onClick={() => {
        setOpen(false);
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) overlay.classList.remove('visible');
      }}>✕</button>

      <div className="sidebar-logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18V5l12-2v13 M6 21a3 3 0 100-6 3 3 0 000 6zm12-2a3 3 0 100-6 3 3 0 000 6z" />
        </svg>
        Beat<span>Box</span>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Menu</div>
        <NavLink to="/library" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <Icon d={icons.music} /> Library
        </NavLink>
        <NavLink to="/playlists" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <Icon d={icons.playlist} /> My Playlists
        </NavLink>
        <NavLink to="/notifications" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} style={{ position: 'relative' }}>
          <Icon d={icons.bell} />
          Notifications
          {unreadCount > 0 && (
            <span style={{ marginLeft: 'auto', background: 'var(--red)', color: '#fff', borderRadius: '20px', fontSize: '11px', fontWeight: 700, padding: '1px 6px' }}>
              {unreadCount}
            </span>
          )}
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <Icon d={icons.user} /> Profile
        </NavLink>
      </div>

      {isAdmin && (
        <>
          <div className="sidebar-divider" />
          <div className="sidebar-section">
            <div className="sidebar-label">Admin</div>
            <NavLink to="/admin/songs" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <Icon d={icons.music} /> Manage Songs
            </NavLink>
            <NavLink to="/admin/artists" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <Icon d={icons.mic} /> Artists
            </NavLink>
            <NavLink to="/admin/directors" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <Icon d={icons.disc} /> Directors
            </NavLink>
            <NavLink to="/admin/albums" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <Icon d={icons.list} /> Albums
            </NavLink>
            <NavLink to="/admin/notifications" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <Icon d={icons.bell} /> Broadcast
            </NavLink>
          </div>
        </>
      )}

      <div className="sidebar-divider" />
      <div className="sidebar-section">
        <button className="sidebar-link" style={{ width: '100%', background: 'none' }} onClick={handleLogout}>
          <Icon d={icons.logout} />
          Logout
        </button>
      </div>

      <div className="sidebar-user">
        {user?.profilePicture
          ? <img src={getFileUrl(user.profilePicture)} alt="avatar" className="sidebar-avatar" />
          : <div className="sidebar-avatar" style={{ display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:700,color:'var(--accent)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
        }
        <div>
          <div className="sidebar-username">{user?.name}</div>
          <div className="sidebar-role">{user?.role}</div>
        </div>
      </div>
    </aside>
  );
}