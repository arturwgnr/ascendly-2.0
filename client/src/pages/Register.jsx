import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/common/Button.jsx';
import '../styles/components/auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  function validate() {
    const errors = {};
    if (!displayName.trim()) errors.displayName = 'Name is required';
    if (!email.trim()) errors.email = 'Email is required';
    if (password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (password !== confirm) errors.confirm = 'Passwords do not match';
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setLoading(true);
    try {
      await register(email, displayName, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-topbar">
        <Link to="/" className="auth-topbar-logo">
          <span>ᨒ</span>
          <span className="gradient-text">Ascendly</span>
        </Link>
      </div>
      <div className="auth-body">
        <div className="auth-card">
          <h1 className="auth-card-title">Create your account</h1>
          <p className="auth-card-sub">Join Ascendly and start growing today.</p>

          {error && <div className="auth-global-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="name">Display Name</label>
              <input
                id="name"
                type="text"
                className={`auth-input ${fieldErrors.displayName ? 'error' : ''}`}
                placeholder="Your name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                autoComplete="name"
              />
              {fieldErrors.displayName && <span className="auth-error">{fieldErrors.displayName}</span>}
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className={`auth-input ${fieldErrors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
              {fieldErrors.email && <span className="auth-error">{fieldErrors.email}</span>}
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className={`auth-input ${fieldErrors.password ? 'error' : ''}`}
                placeholder="At least 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              {fieldErrors.password && <span className="auth-error">{fieldErrors.password}</span>}
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                type="password"
                className={`auth-input ${fieldErrors.confirm ? 'error' : ''}`}
                placeholder="Repeat password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
              {fieldErrors.confirm && <span className="auth-error">{fieldErrors.confirm}</span>}
            </div>
            <div className="auth-submit">
              <Button type="submit" variant="primary" size="md" loading={loading} style={{ width: '100%' }}>
                Create Account
              </Button>
            </div>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
