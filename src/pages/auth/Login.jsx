import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { IconShieldAlert } from '../../components/common/Icons';
import { loginApi, API_BASE_URL } from '../../services/api';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Quick Preset Credentials Handler
  const handleQuickPreset = (presetEmail, presetPassword) => {
    setEmail(presetEmail);
    setPassword(presetPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      Swal.fire({
        title: 'Missing Fields',
        text: 'Please enter both your email address and password.',
        icon: 'warning',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginApi(email, password);

      Swal.fire({
        title: 'Login Successful',
        text: `Welcome back, ${res.user?.name || 'Officer'}!`,
        icon: 'success',
        timer: 1400,
        showConfirmButton: false
      }).then(() => {
        navigate('/dashboard');
      });
    } catch (err) {
      Swal.fire({
        title: 'Authentication Failed',
        text: err.message || 'Invalid email or password. Please verify your credentials.',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 vw-100 d-flex align-items-center justify-content-center p-3"
      style={{
        background: 'radial-gradient(circle at 50% 20%, #1e293b 0%, #0f172a 60%, #090d16 100%)',
        position: 'relative'
      }}
    >
      {/* Background Soft Glow */}
      <div
        className="position-absolute"
        style={{
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Centered Minimal Card */}
      <div
        className="card border-0 shadow-lg position-relative"
        style={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)'
        }}
      >
        <div className="card-body p-4 p-sm-5">

          {/* Logo & Clean Title */}
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-3 shadow-sm mb-2"
              style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff'
              }}
            >
              <IconShieldAlert size={26} />
            </div>
            <h1 className="h4 fw-bold text-dark mb-1">Patrol 360</h1>
            <p className="text-muted small mb-0">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>

            {/* Email Field */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Email Address
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  className="form-control border-start-0 py-2 ps-1"
                  placeholder="name@police.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ fontSize: '13.5px' }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-semibold text-secondary mb-0">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    Swal.fire('Password Reset', 'Please contact your administrator to reset your credentials.', 'info');
                  }}
                  className="small text-primary text-decoration-none"
                  style={{ fontSize: '11.5px' }}
                >
                  Forgot password?
                </a>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-control border-start-0 border-end-0 py-2 ps-1"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ fontSize: '13.5px' }}
                />
                <button
                  type="button"
                  className="input-group-text bg-white text-muted border-start-0"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{ cursor: 'pointer' }}
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="form-check-label text-secondary small user-select-none" htmlFor="rememberMe" style={{ fontSize: '12px' }}>
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-100 py-2.5 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-1.5"
              style={{ fontSize: '13.5px', borderRadius: '8px' }}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill */}
          <div className="mt-4 pt-3 border-top text-center">
            <span className="text-muted small" style={{ fontSize: '11px' }}>Quick Fill Demo:</span>
            <div className="d-inline-flex gap-1.5 ms-2">
              <button
                type="button"
                onClick={() => handleQuickPreset('admin@police.gov.in', 'Admin@12345')}
                className="btn btn-light btn-sm py-0 px-2 border rounded-pill text-secondary"
                style={{ fontSize: '11px' }}
                title="Super Admin Officer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('officer@police.gov.in', 'Officer@12345')}
                className="btn btn-light btn-sm py-0 px-2 border rounded-pill text-secondary"
                style={{ fontSize: '11px' }}
                title="Inspector Rajesh Sharma"
              >
                Officer
              </button>
            </div>
            <div className="mt-2 text-muted" style={{ fontSize: '10.5px' }}>
              <span className="d-inline-block rounded-circle bg-success me-1" style={{ width: '6px', height: '6px' }} />
              Connected: <span className="font-monospace text-secondary">{API_BASE_URL.replace(/^https?:\/\//, '')}</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
