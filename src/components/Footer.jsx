import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-top py-2 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2 small text-muted mt-auto" style={{ fontSize: '11px' }}>
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <div className="d-flex align-items-center gap-1">
          <span className="fw-bold text-dark">PATROL360</span>

        </div>
        <span>•</span>
        <span>Government of Gujarat — Police Home Department</span>
        <span>•</span>

        <span>Edge Queue: <strong className="text-dark">Store-and-Forward Active</strong></span>
      </div>

      <div className="d-flex align-items-center gap-2 font-mono" style={{ fontSize: '10px' }}>
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle fw-bold">
          RESTRICTED / LAW ENFORCEMENT ONLY
        </span>

      </div>
    </footer>
  );
}
