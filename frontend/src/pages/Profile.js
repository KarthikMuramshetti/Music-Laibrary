import React, { useState, useEffect, useRef } from 'react';
import { authAPI, getFileUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    authAPI.getProfile()
      .then(r => { setProfile(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('profilePicture', file);
    setUploading(true);
    try {
      const { data } = await authAPI.updateProfilePicture(fd);
      setProfile(p => ({ ...p, profilePicture: data.profilePicture }));
      toast.success('Profile picture updated!');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  if (loading) return <div className="spinner" />;
  if (!profile) return <div style={{ color: 'var(--text2)' }}>Could not load profile.</div>;

  const avatarUrl = getFileUrl(profile.profilePicture);

  return (
    <div style={{ maxWidth: 520 }}>
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account</p>
      </div>

      <div className="card">
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
          <div style={{ position: 'relative' }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent)' }} />
              : <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-dim)', border: '3px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: 'var(--accent)' }}>
                  {profile.name?.[0]?.toUpperCase()}
                </div>
            }
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>{profile.name}</h2>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{profile.roleId?.roleName || user?.role}</div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 10 }}
              onClick={() => fileRef.current.click()}
              disabled={uploading}>
              {uploading ? 'Uploading…' : '📷 Change Photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border)', marginBottom: 20 }} />

        <div style={{ display: 'grid', gap: 14 }}>
          {[
            { label: 'Full Name', value: profile.name },
            { label: 'Email', value: profile.email },
            { label: 'Phone', value: profile.phone },
            { label: 'Role', value: profile.roleId?.roleName || user?.role },
            { label: 'Member Since', value: new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>{label}</span>
              <span style={{ fontSize: 14, color: 'var(--text)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
