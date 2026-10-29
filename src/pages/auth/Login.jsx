import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../components/common/Toast';
import { IconShieldAlert } from '../../components/common/Icons';
import { loginApi } from '../../services/api';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  // Quick Preset Credentials Handler
  const handleQuickPreset = (presetRole, presetEmail, presetPassword) => {
    setEmail(presetEmail);
    setPassword(presetPassword);
    setActivePreset(presetRole);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.warning('Please enter both your officer email address and password.', 'Missing Credentials');
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginApi(email, password);
      const userRole = (res.user?.role || localStorage.getItem('patrol360_role') || 'user').toLowerCase();
      const isOfficer = userRole === 'officer' || userRole === 'user';

      toast.success(
        `Welcome back, ${res.user?.name || res.user?.officer_name || 'Officer'}! Logged in as ${isOfficer ? 'Tactical Field Officer' : 'System Administrator'}.`,
        'Authentication Verified'
      );

      if (isOfficer) {
        navigate('/officer/cockpit');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Invalid email or password. Please verify your credentials.', 'Access Denied');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative select-none"
      style={{
        backgroundColor: '#f4f4f5',
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.9) 0%, transparent 70%),
          linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 28px 28px, 28px 28px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '24px 16px',
        overflowY: 'auto',
      }}
    >
      {/* Top Status Header Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          borderRadius: '9999px',
          backgroundColor: '#ffffff',
          border: '1px solid #e4e4e7',
          marginBottom: '14px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
          }}
          className="animate-pulse"
        />
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#71717a',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Ahmedabad Police • Command Operations v2.4
        </span>
      </div>

      {/* Main Elevated Card (Light Neutral / ShadCn Mira Style) */}
      <div
        style={{
          width: '100%',
          maxWidth: '410px',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e4e4e7',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
          padding: '22px 24px 18px',
          position: 'relative',
        }}
      >
        {/* Brand & Emblem */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '9px',
              backgroundColor: '#18181b',
              color: '#ffffff',
              marginBottom: '8px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
            }}
          >
            <IconShieldAlert size={20} />
          </div>
          <h1
            style={{
              fontSize: '19px',
              fontWeight: 700,
              color: '#09090b',
              letterSpacing: '-0.02em',
              margin: '0 0 2px 0',
            }}
          >
            Patrol 360
          </h1>
          <p
            style={{
              fontSize: '11.5px',
              color: '#71717a',
              margin: 0,
              fontWeight: 500,
            }}
          >
            Tactical Surveillance & Incident Dispatch System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '10.5px',
                fontWeight: 700,
                color: '#52525b',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '5px',
              }}
            >
              Officer Email
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '36px',
                borderRadius: '7px',
                backgroundColor: '#ffffff',
                border: focusedField === 'email' ? '1px solid #18181b' : '1px solid #e4e4e7',
                boxShadow: focusedField === 'email' ? '0 0 0 1px #18181b' : 'none',
                padding: '0 10px',
                gap: '8px',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#71717a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                id="email"
                type="email"
                required
                placeholder="officer@police.gov.in"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setActivePreset(null);
                }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#09090b',
                  fontSize: '12.5px',
                  fontWeight: 500,
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '5px',
              }}
            >
              <label
                htmlFor="password"
                style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: '#52525b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  margin: 0,
                }}
              >
                Terminal Password
              </label>
              <button
                type="button"
                onClick={() => {
                  Swal.fire({
                    title: 'Credential Recovery',
                    text: 'Officer authentication credentials are centrally managed by the Ahmedabad Police Control Room administrator.',
                    icon: 'info',
                    confirmButtonColor: '#18181b',
                    background: '#ffffff',
                    color: '#09090b',
                    customClass: {
                      popup: 'border border-[#e4e4e7] rounded-xl shadow-lg'
                    }
                  });
                }}
                style={{
                  fontSize: '11px',
                  color: '#71717a',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#18181b')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#71717a')}
              >
                Forgot?
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '36px',
                borderRadius: '7px',
                backgroundColor: '#ffffff',
                border: focusedField === 'password' ? '1px solid #18181b' : '1px solid #e4e4e7',
                boxShadow: focusedField === 'password' ? '0 0 0 1px #18181b' : 'none',
                padding: '0 10px',
                gap: '8px',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#71717a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setActivePreset(null);
                }}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#09090b',
                  fontSize: '12.5px',
                  fontWeight: 500,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#71717a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#18181b')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#71717a')}
              >
                {showPassword ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Workstation Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '2px 0' }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                width: '13px',
                height: '13px',
                accentColor: '#18181b',
                cursor: 'pointer',
                borderRadius: '3px',
              }}
            />
            <label
              htmlFor="rememberMe"
              style={{
                fontSize: '11.5px',
                color: '#71717a',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              Keep session authenticated on this terminal
            </label>
          </div>

          {/* Sign In Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              height: '36px',
              borderRadius: '7px',
              backgroundColor: '#18181b',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '12.5px',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              transition: 'background-color 0.15s ease',
              marginTop: '2px',
              opacity: isLoading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = '#27272a';
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = '#18181b';
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '13px',
                    height: '13px',
                    border: '2px solid #ffffff',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.6s linear infinite',
                  }}
                />
                Verifying Credentials...
              </span>
            ) : (
              <>
                <span>Sign In to Terminal</span>
                <span style={{ fontSize: '14px' }}>→</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Fill Demo Selector */}
        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f4f4f5' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
            }}
          >
            <span
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#a1a1aa',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Demo Credentials
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickPreset('admin', 'admin@police.gov.in', 'Admin@12345')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '6px 8px',
                borderRadius: '6px',
                backgroundColor: activePreset === 'admin' ? '#e4e4e7' : '#f4f4f5',
                border: activePreset === 'admin' ? '1px solid #18181b' : '1px solid #e4e4e7',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (activePreset !== 'admin') e.currentTarget.style.backgroundColor = '#e4e4e7';
              }}
              onMouseLeave={(e) => {
                if (activePreset !== 'admin') e.currentTarget.style.backgroundColor = '#f4f4f5';
              }}
              title="Click to fill Super Admin credentials"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#18181b' }}>Admin</span>
                <span
                  style={{
                    fontSize: '9px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: '#52525b',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e4e4e7',
                    padding: '0 4px',
                    borderRadius: '3px',
                  }}
                >
                  SUPER
                </span>
              </div>
              <span style={{ fontSize: '9.5px', color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                admin@police.gov.in
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset('officer', 'officer@police.gov.in', 'Officer@12345')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '6px 8px',
                borderRadius: '6px',
                backgroundColor: activePreset === 'officer' ? '#e4e4e7' : '#f4f4f5',
                border: activePreset === 'officer' ? '1px solid #18181b' : '1px solid #e4e4e7',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (activePreset !== 'officer') e.currentTarget.style.backgroundColor = '#e4e4e7';
              }}
              onMouseLeave={(e) => {
                if (activePreset !== 'officer') e.currentTarget.style.backgroundColor = '#f4f4f5';
              }}
              title="Click to fill Sector Officer credentials"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#18181b' }}>Officer</span>
                <span
                  style={{
                    fontSize: '9px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: '#52525b',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e4e4e7',
                    padding: '0 4px',
                    borderRadius: '3px',
                  }}
                >
                  INSP-402
                </span>
              </div>
              <span style={{ fontSize: '9.5px', color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                officer@police.gov.in
              </span>
            </button>
          </div>
        </div>

        {/* Security Audit Note */}
        <div
          style={{
            marginTop: '14px',
            textAlign: 'center',
            fontSize: '9.5px',
            color: '#71717a',
            lineHeight: 1.35,
          }}
        >
          <span>Official Law Enforcement Network • Encrypted 256-Bit TLS</span>
          <br />
          <span>Unauthorized access is strictly prohibited and cryptographically audited.</span>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
