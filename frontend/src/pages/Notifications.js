import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';

const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsAPI.getAll()
      .then(r => { setNotifs(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifs(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
    } catch { toast.error('Failed'); }
  };

  const markAllRead = async () => {
    const unread = notifs.filter(n => !n.isRead);
    await Promise.all(unread.map(n => notificationsAPI.markRead(n._id)));
    setNotifs(n => n.map(x => ({ ...x, isRead: true })));
    toast.success('All marked as read');
  };

  const unread = notifs.filter(n => !n.isRead).length;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>
        )}
      </div>

      {loading ? <div className="spinner" /> : notifs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔔</div>
          <div className="empty-title">All clear!</div>
          <div className="empty-msg">No notifications yet.</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 8 }}>
          {notifs.map(n => (
            <div key={n._id}
              className={`notif-item${!n.isRead ? ' unread' : ''}`}
              onClick={() => !n.isRead && markRead(n._id)}
              style={{ cursor: !n.isRead ? 'pointer' : 'default' }}>
              {!n.isRead && <div className="notif-dot-sm" />}
              {n.isRead && <div style={{ width: 8 }} />}
              <div>
                <div className="notif-msg">{n.message}</div>
                <div className="notif-time">{timeAgo(n.createdAt)}</div>
              </div>
              {!n.isRead && (
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', fontSize: 11 }} onClick={e => { e.stopPropagation(); markRead(n._id); }}>
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
