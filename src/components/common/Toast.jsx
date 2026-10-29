import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * =========================================================================
 * PATROL360 — Modern Enterprise Toast & Notification System
 * =========================================================================
 * Completely replaces SweetAlert2 with non-intrusive, sleek, high-contrast
 * toast alerts and modern confirmation dialogs matching the white enterprise aesthetic.
 */

// Global event bus for toast notifications
const listeners = new Set();
let toastIdCounter = 0;
let confirmListener = null;
let activeToasts = [];

function notifyListeners() {
  const snapshot = [...activeToasts];
  listeners.forEach(fn => fn(snapshot));
}

function addToast({ type = 'info', title = '', message = '', duration = 3800 }) {
  const id = ++toastIdCounter;
  const newToast = {
    id,
    type,
    title: title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Info'),
    message: String(message || ''),
    duration,
    createdAt: Date.now()
  };

  // Keep up to 5 toasts active
  activeToasts = [...activeToasts.slice(-4), newToast];
  notifyListeners();
  return id;
}

function removeToast(id) {
  activeToasts = activeToasts.filter(t => t.id !== id);
  notifyListeners();
}

/**
 * Primary `toast` API
 */
export const toast = {
  success: (message, title = '') => {
    return addToast({ type: 'success', title: title || 'Success', message });
  },

  error: (message, title = '') => {
    return addToast({ type: 'error', title: title || 'Error', message });
  },

  warning: (message, title = '') => {
    return addToast({ type: 'warning', title: title || 'Warning', message });
  },

  info: (message, title = '') => {
    return addToast({ type: 'info', title: title || 'Notification', message });
  },

  dismiss: (id) => {
    if (id) {
      removeToast(id);
    } else {
      activeToasts = [];
      notifyListeners();
    }
  },

  /**
   * Modern replacement for Swal.fire({ showCancelButton: true })
   * Returns Promise resolving to { isConfirmed: boolean }
   */
  confirm: (options) => {
    return new Promise((resolve) => {
      let config = {};
      if (typeof options === 'string') {
        config = { title: options };
      } else {
        config = options || {};
      }

      if (confirmListener) {
        confirmListener({
          isOpen: true,
          title: config.title || 'Confirm Action',
          text: config.text || config.message || 'Are you sure you want to proceed?',
          icon: config.icon || 'warning',
          confirmText: config.confirmButtonText || config.confirmText || 'Confirm',
          cancelText: config.cancelButtonText || config.cancelText || 'Cancel',
          isDanger: config.confirmButtonColor === '#dc2626' || config.isDanger !== false,
          resolve: (confirmed) => {
            if (confirmListener) {
              confirmListener(null);
            }
            resolve({ isConfirmed: confirmed, isDismissed: !confirmed });
          }
        });
      } else {
        const ok = window.confirm(`${config.title || ''}\n\n${config.text || ''}`);
        resolve({ isConfirmed: ok, isDismissed: !ok });
      }
    });
  }
};

/**
 * Drop-in SweetAlert2 compatibility wrapper.
 * Intercepts any Swal.fire(...) calls and routes them to sleek modern toasts/dialogs.
 */
export const Swal = {
  fire: (...args) => {
    if (args.length === 0) return Promise.resolve({ isConfirmed: true });

    // Handle Swal.fire('Title', 'Message', 'success')
    if (typeof args[0] === 'string') {
      const title = args[0];
      const message = args[1] || '';
      const type = (args[2] || 'info').toLowerCase();

      if (type === 'success') toast.success(message || title, title);
      else if (type === 'error') toast.error(message || title, title);
      else if (type === 'warning') toast.warning(message || title, title);
      else toast.info(message || title, title);

      return Promise.resolve({ isConfirmed: true });
    }

    // Handle Swal.fire({ title, text, icon, showCancelButton, ... })
    const opt = args[0] || {};
    if (opt.showCancelButton) {
      return toast.confirm(opt);
    }

    const type = (opt.icon || 'info').toLowerCase();
    const title = opt.title || '';
    const message = opt.text || opt.html || '';

    if (type === 'success') toast.success(message || title, title);
    else if (type === 'error') toast.error(message || title, title);
    else if (type === 'warning') toast.warning(message || title, title);
    else toast.info(message || title, title);

    return Promise.resolve({ isConfirmed: true });
  }
};

// Global window registration
if (typeof window !== 'undefined') {
  window.toast = toast;
  window.Swal = Swal;
}

/**
 * Single Toast Item Component with Bulletproof Inline CSS
 */
function ToastItem({ toast: t, onDismiss }) {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(t.duration);
  const timerRef = useRef(null);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(t.id);
    }, 220);
  }, [t.id, onDismiss]);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, remainingTimeRef.current);
  }, [handleDismiss]);

  const pauseTimer = () => {
    setIsPaused(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(200, remainingTimeRef.current - elapsed);
    }
  };

  const resumeTimer = () => {
    setIsPaused(false);
    startTimer();
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startTimer]);

  const typeConfigs = {
    success: {
      borderColor: '#10b981',
      iconBg: '#ecfdf5',
      iconBorder: '#a7f3d0',
      iconColor: '#059669',
      icon: '✓'
    },
    error: {
      borderColor: '#ef4444',
      iconBg: '#fef2f2',
      iconBorder: '#fecaca',
      iconColor: '#dc2626',
      icon: '✕'
    },
    warning: {
      borderColor: '#f59e0b',
      iconBg: '#fffbeb',
      iconBorder: '#fde68a',
      iconColor: '#d97706',
      icon: '⚠️'
    },
    info: {
      borderColor: '#3b82f6',
      iconBg: '#eff6ff',
      iconBorder: '#bfdbfe',
      iconColor: '#2563eb',
      icon: 'ℹ'
    }
  };

  const config = typeConfigs[t.type] || typeConfigs.info;

  return (
    <div
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      style={{
        pointerEvents: 'auto',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderLeft: `5px solid ${config.borderColor}`,
        boxShadow: '0 12px 32px -4px rgba(15, 23, 42, 0.16), 0 4px 12px -2px rgba(15, 23, 42, 0.08)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'translateY(-10px) scale(0.96)' : 'translateY(0) scale(1)',
        minWidth: '320px',
        maxWidth: '420px',
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Icon Badge */}
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '1px',
          backgroundColor: config.iconBg,
          color: config.iconColor,
          border: `1px solid ${config.iconBorder}`,
          fontSize: '13px',
          fontWeight: 800
        }}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, paddingRight: '4px' }}>
        {t.title && (
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#0f172a',
              lineHeight: 1.3,
              letterSpacing: '-0.01em'
            }}
          >
            {t.title}
          </div>
        )}
        <div
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#475569',
            lineHeight: 1.45,
            marginTop: t.title ? '2px' : 0,
            wordBreak: 'break-word'
          }}
        >
          {t.message}
        </div>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          flexShrink: 0,
          marginTop: '-2px',
          fontSize: '14px',
          lineHeight: 1
        }}
        title="Dismiss alert"
      >
        ✕
      </button>

      {/* Countdown progress line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          backgroundColor: config.borderColor,
          width: '100%',
          animation: `toastCountdown ${t.duration}ms linear forwards`,
          animationPlayState: isPaused ? 'paused' : 'running'
        }}
      />
    </div>
  );
}

/**
 * Modern Confirmation Dialog Component
 */
function ConfirmModal({ confirmState }) {
  if (!confirmState || !confirmState.isOpen) return null;

  const { title, text, icon, confirmText, cancelText, isDanger, resolve } = confirmState;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483647,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
      onClick={() => resolve(false)}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          padding: '24px',
          maxWidth: '440px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '20px',
              backgroundColor: isDanger || icon === 'error' ? '#fef2f2' : '#fffbeb',
              color: isDanger || icon === 'error' ? '#dc2626' : '#d97706',
              border: `1px solid ${isDanger || icon === 'error' ? '#fecaca' : '#fde68a'}`
            }}
          >
            {isDanger || icon === 'error' ? '⚠️' : '❓'}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              {title}
            </h3>
            <p style={{ fontSize: '12.5px', color: '#475569', marginTop: '6px', marginBottom: 0, lineHeight: 1.5, fontWeight: 500 }}>
              {text}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
          <button
            type="button"
            onClick={() => resolve(false)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#334155',
              backgroundColor: '#f1f5f9',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => resolve(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#ffffff',
              backgroundColor: isDanger || icon === 'error' ? '#dc2626' : '#2563eb',
              border: 'none',
              cursor: 'pointer',
              boxShadow: isDanger || icon === 'error' ? '0 2px 8px rgba(220, 38, 38, 0.3)' : '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Top-Level Toaster Mount Component
 * Place once in App.jsx
 */
export function Toaster() {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  useEffect(() => {
    listeners.add(setToasts);
    confirmListener = setConfirmState;

    return () => {
      listeners.delete(setToasts);
      confirmListener = null;
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes toastCountdown {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      {/* Floating Toast Notification Stack in Top-Right Corner */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 2147483647,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
          maxWidth: '420px',
          width: 'calc(100vw - 40px)',
        }}
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
        ))}
      </div>

      {/* Modern Confirmation Modal for Delete / Critical Actions */}
      <ConfirmModal confirmState={confirmState} />
    </>
  );
}

export default toast;
