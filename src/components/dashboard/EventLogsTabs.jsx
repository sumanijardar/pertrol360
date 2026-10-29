import React, { useState, useMemo } from 'react';
import Pagination from '../common/Pagination';

export default function EventLogsTabs({
  alerts = [],
  onOpenEventModal
}) {
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'PLATES' | 'WANTED' | 'WEAPONS' | 'HAZARDS'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Strictly map ONLY the alerts that come directly from the API (recent_alerts)
  const unifiedAlerts = useMemo(() => {
    if (!alerts || !Array.isArray(alerts) || alerts.length === 0) {
      return [];
    }

    return alerts.map((a, idx) => {
      const type = (a.event_type || '').toUpperCase();
      const timeStr = a.created_at
        ? (a.created_at.includes(' ') ? a.created_at.split(' ')[1] : a.created_at)
        : '';
      const camLabel = a.vehicle_id ? `${a.vehicle_id} • CAM 01` : 'CAM 01 (Front)';

      // 1. ANPR Stolen Match
      if (type.includes('ANPR') || type.includes('STOLEN')) {
        return {
          id: a.event_id || `EVT_ANPR_${a.id || idx + 1}`,
          category: 'PLATES',
          icon: '🚗',
          typeTitle: 'Stolen Vehicle Match',
          severity: a.severity || 'CRITICAL',
          borderColor: '#ef4444',
          badgeBg: '#fee2e2',
          badgeText: '#dc2626',
          headline: `${a.title} • Stolen Vehicle Hotlist Match`,
          subtitle: `Flagged by ${a.vehicle_id || 'Patrol Unit'} sensor stream`,
          timeInfo: `${timeStr} • ${camLabel}`,
          statusText: 'Pushed to ICCC 200 OK',
          statusColor: '#059669',
          raw: a
        };
      }

      // 2. FRS Suspect Match
      if (type.includes('FRS') || type.includes('WANTED') || type.includes('SUSPECT')) {
        return {
          id: a.event_id || `EVT_FRS_${a.id || idx + 1}`,
          category: 'WANTED',
          icon: '👤',
          typeTitle: 'Wanted Criminal Match',
          severity: a.severity || 'HIGH',
          borderColor: '#f59e0b',
          badgeBg: '#fef3c7',
          badgeText: '#d97706',
          headline: `${a.title} (ID: ${a.event_id || `W-${a.id || 101}`})`,
          subtitle: `Facial Recognition Hotlist Hit by ${a.vehicle_id || 'Patrol Unit'}`,
          timeInfo: `${timeStr} • ${camLabel}`,
          statusText: 'HITL Review Pending',
          statusColor: '#0d9488',
          raw: a
        };
      }

      // 3. Weapon Threat
      if (type.includes('WEAPON') || type.includes('THREAT') || type.includes('FIREARM')) {
        return {
          id: a.event_id || `EVT_WEAPON_${a.id || idx + 1}`,
          category: 'WEAPONS',
          icon: '🔫',
          typeTitle: 'Visible Firearm Alert',
          severity: a.severity || 'CRITICAL',
          borderColor: '#ef4444',
          badgeBg: '#fee2e2',
          badgeText: '#dc2626',
          headline: `Firearm (${a.title}) detected on pedestrian.`,
          subtitle: `Urgent Tactical Alert sent to PCR Fleet (${a.vehicle_id || 'Patrol Unit'})`,
          timeInfo: `${timeStr} • ${camLabel}`,
          statusText: 'Dispatched (200 OK)',
          statusColor: '#059669',
          raw: a
        };
      }

      // 4. Fire / Smoke Hazard
      if (type.includes('FIRE') || type.includes('SMOKE')) {
        return {
          id: a.event_id || `EVT_FIRE_${a.id || idx + 1}`,
          category: 'HAZARDS',
          icon: '🔥',
          typeTitle: 'Active Fire / Smoke Hazard',
          severity: a.severity || 'CRITICAL',
          borderColor: '#ea580c',
          badgeBg: '#ffedd5',
          badgeText: '#c2410c',
          headline: `Fire Hazard (${a.title}) detected`,
          subtitle: `Thermal threshold exceeded by ${a.vehicle_id || 'Patrol Unit'}`,
          timeInfo: `${timeStr} • ${camLabel}`,
          statusText: 'Fire Dept Dispatched',
          statusColor: '#ea580c',
          raw: a
        };
      }

      // 5. Crowd Surge or other Hazards
      return {
        id: a.event_id || `EVT_ALERT_${a.id || idx + 1}`,
        category: 'HAZARDS',
        icon: '👥',
        typeTitle: 'Crowd Threshold Exceeded',
        severity: a.severity || 'INFO',
        borderColor: '#8b5cf6',
        badgeBg: '#ede9fe',
        badgeText: '#7c3aed',
        headline: `${a.title} crowd density surge`,
        subtitle: `Safety limit exceeded by ${a.vehicle_id || 'Patrol Unit'}`,
        timeInfo: `${timeStr} • ${camLabel}`,
        statusText: 'Logged',
        statusColor: '#059669',
        raw: a
      };
    });
  }, [alerts]);

  // Filter and search
  const filteredAlerts = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return unifiedAlerts.filter(item => {
      // Filter tab
      if (activeFilter === 'PLATES' && item.category !== 'PLATES') return false;
      if (activeFilter === 'WANTED' && item.category !== 'WANTED') return false;
      if (activeFilter === 'WEAPONS' && item.category !== 'WEAPONS') return false;
      if (activeFilter === 'HAZARDS' && item.category !== 'HAZARDS') return false;

      // Search query
      if (!q) return true;
      return (
        item.headline.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.typeTitle.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    });
  }, [unifiedAlerts, activeFilter, searchTerm]);

  // Counts for filter pills
  const counts = useMemo(() => ({
    all: unifiedAlerts.length,
    plates: unifiedAlerts.filter(a => a.category === 'PLATES').length,
    wanted: unifiedAlerts.filter(a => a.category === 'WANTED').length,
    weapons: unifiedAlerts.filter(a => a.category === 'WEAPONS').length,
    hazards: unifiedAlerts.filter(a => a.category === 'HAZARDS').length
  }), [unifiedAlerts]);

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedAlerts = filteredAlerts.slice(startIndex, startIndex + pageSize);

  return (
    <div className="card shadow-sm border rounded-3 w-100 bg-white overflow-hidden">
      {/* 1. Header with Badge and Live Sync */}
      <div className="card-header bg-white border-bottom py-2.5 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="fs-5" role="img" aria-label="alert">🚨</span>
          <h2 className="h6 fw-bold text-dark mb-0">Tactical Alerts Stream</h2>
          <span
            className="badge rounded-pill fw-bold"
            style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '11px' }}
          >
            {counts.all} New
          </span>
        </div>
        <div className="d-flex align-items-center gap-1.5 text-muted small" style={{ fontSize: '11px' }}>
          <span className="rounded-circle bg-success d-inline-block" style={{ width: '6px', height: '6px' }} />
          <span>Live Sync with ICCC</span>
        </div>
      </div>

      <div className="card-body p-3">
        {/* 2. Search Input */}
        <div className="mb-2.5">
          <input
            type="text"
            className="form-control form-control-sm rounded-2"
            placeholder="Search plates, suspects, FIR numbers..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{ fontSize: '12px', borderColor: '#e2e8f0' }}
          />
        </div>

        {/* 3. Filter Pills */}
        <div className="d-flex align-items-center gap-1.5 mb-3 flex-wrap">
          {[
            { id: 'ALL', label: `All (${counts.all})` },
            { id: 'PLATES', label: `Plates (${counts.plates})` },
            { id: 'WANTED', label: `Wanted (${counts.wanted})` },
            { id: 'WEAPONS', label: `Weapons (${counts.weapons})` },
            ...(counts.hazards > 0 ? [{ id: 'HAZARDS', label: `Hazards (${counts.hazards})` }] : [])
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setActiveFilter(tab.id); setCurrentPage(1); }}
              className="btn btn-sm rounded-pill px-3 py-1 fw-semibold"
              style={{
                fontSize: '11px',
                backgroundColor: activeFilter === tab.id ? '#18181b' : '#ffffff',
                color: activeFilter === tab.id ? '#ffffff' : '#18181b',
                border: '1px solid ' + (activeFilter === tab.id ? '#18181b' : '#e4e4e7'),
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 4. Alert Cards Stream */}
        <div className="d-flex flex-column gap-2.5">
          {paginatedAlerts.length === 0 ? (
            <div className="text-center text-muted py-4 small">
              No live alerts found in the database stream.
            </div>
          ) : (
            paginatedAlerts.map(alert => (
              <div
                key={alert.id}
                onClick={() => onOpenEventModal && onOpenEventModal({ type: alert.category, data: alert.raw })}
                className="card shadow-sm border p-3 rounded-3 position-relative"
                style={{
                  borderLeft: `4px solid ${alert.borderColor}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}
              >
                {/* Card Top: Type & Severity */}
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div className="d-flex align-items-center gap-1.5 fw-bold" style={{ color: alert.borderColor, fontSize: '12px' }}>
                    <span role="img" aria-label="icon">{alert.icon}</span>
                    <span>{alert.typeTitle}</span>
                  </div>
                  <span
                    className="badge rounded-pill fw-bold font-mono"
                    style={{
                      backgroundColor: alert.badgeBg,
                      color: alert.badgeText,
                      border: `1px solid ${alert.badgeBg}`,
                      fontSize: '9.5px',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {alert.severity}
                  </span>
                </div>

                {/* Card Middle: Headline & Case details */}
                <div className="mb-2">
                  <div className="fw-bold" style={{ fontSize: '13px', color: '#09090b' }}>
                    {alert.headline}
                  </div>
                  <div className="small" style={{ fontSize: '11.5px', color: '#52525b', fontWeight: 500 }}>
                    {alert.subtitle}
                  </div>
                </div>

                {/* Card Bottom: Camera & Status */}
                <div className="d-flex justify-content-between align-items-center pt-2 border-top" style={{ fontSize: '11px', borderColor: '#e4e4e7' }}>
                  <span className="font-mono" style={{ color: '#52525b', fontWeight: 600 }}>
                    {alert.timeInfo}
                  </span>
                  <span className="fw-bold font-mono" style={{ color: alert.statusColor }}>
                    {alert.statusText}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. Pagination Footer */}
      {filteredAlerts.length > pageSize && (
        <div className="card-footer bg-light border-top p-2">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredAlerts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20]}
          />
        </div>
      )}
    </div>
  );
}
