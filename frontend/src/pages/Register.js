import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) { toast.error('Fill all fields'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.phone.length < 10) { toast.error('Enter a valid phone number'); return; }
    setLoading(true);
    try {
      await authAPI.register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      toast.success('Registered! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-logo">Beat Box</div>
        <div className="auth-tagline">Your music, your way.</div>
        <div className="auth-title">Create account</div>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24 }}>Join Beat Box and build your music library.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input placeholder="John Doe" value={form.name} onChange={set('name')} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="tel" placeholder="9876543210" value={form.phone} onChange={set('phone')} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
