import React, { useState } from 'react';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminNotifications() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState([]);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!message.trim()) { toast.error('Enter a message'); return; }
    setLoading(true);
    try {
      const { data } = await notificationsAPI.broadcast(message);
      toast.success(data.message);
      setSent(s => [{ message, time: new Date(), result: data.message }, ...s]);
      setMessage('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="page-header">
        <h1 className="page-title">Broadcast Notifications</h1>
        <p className="page-subtitle">Send a notification to all registered users</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <form onSubmit={handleBroadcast}>
          <div className="form-group">
            <label className="form-label">Notification Message</label>
            <textarea
              rows={4}
              placeholder="e.g. 🎵 New songs have been added to the library! Check them out."
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading || !message.trim()}>
              {loading ? 'Sending…' : '📣 Broadcast to All Users'}
            </button>
          </div>
        </form>
      </div>

      {sent.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text2)', marginBottom: 12, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Recently Sent</h3>
          {sent.map((s, i) => (
            <div key={i} className="card card-sm" style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 14, marginBottom: 6 }}>{s.message}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>{s.time.toLocaleTimeString()}</span>
                <span className="badge badge-green">{s.result}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
