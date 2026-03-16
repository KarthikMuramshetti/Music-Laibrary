import React, { useState, useEffect } from 'react';
import { artistsAPI, getFileUrl } from '../services/api';
import toast from 'react-hot-toast';

function ArtistModal({ artist, onClose, onSave }) {
  const [name, setName] = useState(artist?.artistName || '');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Enter artist name'); return; }
    setLoading(true);
    try {
      if (artist) {
        const { data } = await artistsAPI.update(artist._id, { artistName: name });
        if (photo) {
          const fd = new FormData(); fd.append('artistPhoto', photo);
          await artistsAPI.updatePhoto(artist._id, fd);
        }
        onSave({ ...data, artistName: name }, 'update');
        toast.success('Artist updated');
      } else {
        const fd = new FormData();
        fd.append('artistName', name);
        if (photo) fd.append('artistPhoto', photo);
        const { data } = await artistsAPI.add(fd);
        onSave(data, 'create');
        toast.success('Artist added');
      }
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{artist ? 'Edit Artist' : 'Add Artist'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Artist Name *</label>
            <input placeholder="e.g. A.R. Rahman" value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Photo {artist ? '(leave blank to keep current)' : '(optional)'}</label>
            <input type="file" accept="image/*" style={{ padding: 8, cursor: 'pointer' }} onChange={e => setPhoto(e.target.files[0])} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminArtists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editArtist, setEditArtist] = useState(null);

  useEffect(() => {
    artistsAPI.getAll().then(r => { setArtists(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = (artist, type) => {
    if (type === 'create') setArtists(a => [...a, artist]);
    else setArtists(a => a.map(x => x._id === artist._id ? artist : x));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this artist?')) return;
    try {
      await artistsAPI.delete(id);
      setArtists(a => a.filter(x => x._id !== id));
      toast.success('Artist deleted');
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Artists</h1>
          <p className="page-subtitle">{artists.length} artists</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditArtist(null); setShowModal(true); }}>+ Add Artist</button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="grid-3">
          {artists.map(a => (
            <div key={a._id} className="card card-sm">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {a.artistPhoto
                  ? <img src={getFileUrl(a.artistPhoto)} alt={a.artistName} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border2)' }} />
                  : <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{a.artistName[0]}</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.artistName}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 12, justifyContent: 'flex-end' }}>
                <button className="btn-icon" onClick={() => { setEditArtist(a); setShowModal(true); }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button className="btn-icon" style={{ color: 'var(--red)' }} onClick={() => handleDelete(a._id)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ArtistModal
          artist={editArtist}
          onClose={() => { setShowModal(false); setEditArtist(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
