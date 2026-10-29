import React, { useState, useMemo } from 'react';
import Pagination from '../common/Pagination';

/**
 * Dynamic severity styling helper for all API severity variations
 */
const getSeverityMeta = (severity) => {
  const sev = (severity || 'INFO').toUpperCase();

  if (sev.includes('CRITICAL_RED') || sev === 'CRITICAL_RED') {
    return {
      severityLabel: 'CRITICAL',
      borderColor: '#ef4444',
      badgeBg: '#fee2e2',
      badgeText: '#b91c1c'
    };
  }
  if (sev.includes('CRITICAL')) {
    return {
      severityLabel: 'CRITICAL',
      borderColor: '#ef4444',
      badgeBg: '#fee2e2',
      badgeText: '#dc2626'
    };
  }
  if (sev.includes('HIGH')) {
    return {
      severityLabel: 'HIGH',
      borderColor: '#f97316',
      badgeBg: '#ffedd5',
      badgeText: '#c2410c'
    };
  }
  if (sev.includes('WARN')) {
    return {
      severityLabel: 'WARNING',
      borderColor: '#f59e0b',
      badgeBg: '#fef3c7',
      badgeText: '#d97706'
    };
  }
  if (sev.includes('MODERATE') || sev.includes('MEDIUM')) {
    return {
      severityLabel: 'MODERATE',
      borderColor: '#eab308',
      badgeBg: '#fef9c3',
      badgeText: '#854d0e'
    };
  }
  return {
    severityLabel: sev.replace(/_/g, ' ') || 'INFO',
    borderColor: '#3b82f6',
    badgeBg: '#dbeafe',
    badgeText: '#1d4ed8'
  };
};

/**
 * Dynamic category & icon detector
 */
const getCategoryAndIcon = (eventType) => {
  const type = (eventType || '').toUpperCase();

  if (type.includes('ANPR') || type.includes('STOLEN') || type.includes('PLATE')) {
    return {
      category: 'PLATES',
      icon: '🚗',
      defaultTitle: 'ANPR Stolen Hotlist Match',
      defaultHeadline: 'Stolen Vehicle Hotlist Match',
      statusText: 'Pushed to ICCC 200 OK',
      statusColor: '#059669'
    };
  }

  if (type.includes('FRS') || type.includes('WANTED') || type.includes('SUSPECT') || type.includes('FACE')) {
    return {
      category: 'WANTED',
      icon: '👤',
      defaultTitle: 'Facial Recognition Match',
      defaultHeadline: 'Wanted Suspect Hit',
      statusText: 'HITL Review Pending',
      statusColor: '#0d9488'
    };
  }

  if (type.includes('WEAPON') || type.includes('THREAT') || type.includes('FIREARM') || type.includes('GUN')) {
    return {
      category: 'WEAPONS',
      icon: '🔫',
      defaultTitle: 'Weapon Threat Alert',
      defaultHeadline: 'Tactical Weapon Detected',
      statusText: 'Dispatched (200 OK)',
      statusColor: '#059669'
    };
  }

  if (type.includes('FIRE') || type.includes('SMOKE') || type.includes('FLAME')) {
    return {
      category: 'HAZARDS',
      icon: '🔥',
      defaultTitle: 'Active Fire / Smoke Hazard',
      defaultHeadline: 'Thermal Flame Hazard Detected',
      statusText: 'Fire Dept Dispatched',
      statusColor: '#ea580c'
    };
  }

  if (type.includes('CROWD') || type.includes('SURGE')) {
    return {
      category: 'HAZARDS',
      icon: '👥',
      defaultTitle: 'Crowd Threshold Exceeded',
      defaultHeadline: 'Crowd Density Surge',
      statusText: 'Safety Monitored',
      statusColor: '#059669'
    };
  }

  return {
    category: 'ALERTS',
    icon: '🚨',
    defaultTitle: (eventType || 'Tactical Alert').replace(/_/g, ' '),
    defaultHeadline: (eventType || 'Tactical Event').replace(/_/g, ' '),
    statusText: 'Logged in Central C4i',
    statusColor: '#059669'
  };
};

export default function EventLogsTabs({
  alerts = [],
  onOpenEventModal
}) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Fully dynamic mapper for API alerts (recent_alerts)
  const unifiedAlerts = useMemo(() => {
    if (!alerts || !Array.isArray(alerts) || alerts.length === 0) {
      return [];
    }

    return alerts.map((a, idx) => {
      const typeStr = a.event_type || 'INCIDENT_ALERT';
      const catMeta = getCategoryAndIcon(typeStr);
      const sevMeta = getSeverityMeta(a.severity);

      const timeStr = a.created_at
        ? (a.created_at.includes(' ') ? a.created_at.split(' ')[1] : a.created_at)
        : '';

      const camLabel = a.camera_id
        ? `${a.vehicle_id || 'Patrol Van'} • CAM 0${a.camera_id}`
        : a.vehicle_id
          ? `${a.vehicle_id} • Sensor Stream`
          : 'CAM 01 (Front)';

      // Dynamic headline with API title
      const headline = a.title
        ? `${a.title} • ${catMeta.defaultHeadline}`
        : `${catMeta.defaultHeadline} (${a.event_id || a.id || idx + 1})`;

      // Dynamic subtitle from API details or vehicle context
      const subtitle =
        a.description ||
        a.details ||
        `Flagged by ${a.vehicle_id || 'Patrol Unit'} mobile edge vision feed`;

      return {
        id: a.event_id || (a.id ? `EVT_${a.id}` : `EVT_${idx + 1}`),
        category: catMeta.category,
        icon: catMeta.icon,
        typeTitle: a.event_type ? a.event_type.replace(/_/g, ' ') : catMeta.defaultTitle,
        severity: sevMeta.severityLabel,
        borderColor: sevMeta.borderColor,
        badgeBg: sevMeta.badgeBg,
        badgeText: sevMeta.badgeText,
        headline,
        subtitle,
        timeInfo: `${timeStr} • ${camLabel}`,
        statusText: a.status_text || catMeta.statusText,
        statusColor: a.status_color || catMeta.statusColor,
        raw: a
      };
    });
  }, [alerts]);

  // Filter and search
  const filteredAlerts = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return unifiedAlerts.filter(item => {
      // Filter tab
      if (activeFilter !== 'ALL' && item.category !== activeFilter) {
        return false;
      }

      // Search query
      if (!q) return true;
      return (
        item.headline.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.typeTitle.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.severity.toLowerCase().includes(q)
      );
    });
  }, [unifiedAlerts, activeFilter, searchTerm]);

  // Counts for filter pills
  const counts = useMemo(() => ({
    all: unifiedAlerts.length,
    plates: unifiedAlerts.filter(a => a.category === 'PLATES').length,
    wanted: unifiedAlerts.filter(a => a.category === 'WANTED').length,
    weapons: unifiedAlerts.filter(a => a.category === 'WEAPONS').length,
    hazards: unifiedAlerts.filter(a => a.category === 'HAZARDS').length,
    alerts: unifiedAlerts.filter(a => a.category === 'ALERTS').length
  }), [unifiedAlerts]);

  // Dynamic filter tabs
  const tabs = useMemo(() => {
    const list = [
      { id: 'ALL', label: `All (${counts.all})` },
      { id: 'PLATES', label: `Plates (${counts.plates})` },
      { id: 'WANTED', label: `Wanted (${counts.wanted})` },
      { id: 'WEAPONS', label: `Weapons (${counts.weapons})` }
    ];
    if (counts.hazards > 0) {
      list.push({ id: 'HAZARDS', label: `Hazards (${counts.hazards})` });
    }
    if (counts.alerts > 0) {
      list.push({ id: 'ALERTS', label: `Other (${counts.alerts})` });
    }
    return list;
  }, [counts]);

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
        <div className="mb-3">
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
          {tabs.map(tab => (
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
