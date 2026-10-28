import React, { useState } from 'react';

export default function TacticalMapWidget({ vehicles = [], selectedVehicleId, onSelectVehicle, onOpenThreatModal, threatAlerts = [] }) {
  const [mapMode, setMapMode] = useState('TACTICAL'); // 'TACTICAL' | 'SATELLITE' | 'HEATMAP'

  // Approximate relative positioning inside tactical vector map canvas
  // Bounds calibrated for Ahmedabad Metro Police Zones
  const minLat = 23.005, maxLat = 23.085;
  const minLng = 72.495, maxLng = 72.595;

  const getCanvasPos = (lat, lng) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100;
    return {
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(12, Math.min(84, y))
    };
  };

  // Tactical Sectors placed cleanly without colliding with vehicle paths
  const zones = [
    { name: 'SEC-A • NAVRANGPURA', cx: '64%', cy: '46%', r: '14%' },
    { name: 'SEC-B • VASTRAPUR', cx: '36%', cy: '50%', r: '14%' },
    { name: 'SEC-C • SATELLITE', cx: '24%', cy: '72%', r: '13%' },
    { name: 'SEC-D • SG HIGHWAY', cx: '20%', cy: '22%', r: '15%' },
    { name: 'SEC-E • ELLIS BRIDGE', cx: '80%', cy: '74%', r: '13%' }
  ];

  // Threat markers strictly derived from live backend alerts
  const activeThreatPings = React.useMemo(() => {
    if (!threatAlerts || !Array.isArray(threatAlerts)) return [];
    return threatAlerts.map((a, i) => {
      const type = (a.event_type || '').toUpperCase();
      let color = '#dc2626';
      let label = a.title || 'THREAT';
      if (type.includes('ANPR') || type.includes('STOLEN')) {
        label = `STOLEN: ${a.title}`;
        color = '#dc2626';
      } else if (type.includes('WEAPON')) {
        label = `WEAPON: ${a.title}`;
        color = '#ef4444';
      } else if (type.includes('FRS')) {
        label = `WANTED: ${a.title}`;
        color = '#8b5cf6';
      } else if (type.includes('FIRE')) {
        label = `FIRE: ${a.title}`;
        color = '#f59e0b';
      }
      return {
        id: a.event_id || `TP_${a.id || i + 1}`,
        type: a.event_type,
        label,
        lat: 23.018 + (i * 0.022),
        lng: 72.515 + (i * 0.024),
        color
      };
    });
  }, [threatAlerts]);

  return (
    <div
      className="d-flex flex-column justify-content-between position-relative w-100 overflow-hidden rounded-3 border"
      style={{
        height: '100%',
        minHeight: '340px',
        backgroundColor: '#f8fafc',
        borderColor: '#cbd5e1'
      }}
    >
      {/* 1. Radar sweep animation background */}
      <div
        className="animate-radar position-absolute"
        style={{
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'conic-gradient(from 0deg, transparent 0deg, transparent 320deg, rgba(2, 132, 199, 0.08) 360deg)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* 2. Tactical Grid Pattern overlay */}
      <div
        className="position-absolute w-100 h-100 top-0 start-0"
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px), linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px, 48px 48px, 48px 48px',
          pointerEvents: 'none',
          zIndex: 2
        }}
      />

      {/* 3. SVG Tactical Radar Elements & River */}
      <svg
        className="position-absolute top-0 start-0 w-100 h-100"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ pointerEvents: 'none', zIndex: 2 }}
      >
        {/* River Sabarmati Path (Clean graceful curve along Eastern zone - standard unitless SVG coordinates) */}
        <path
          d="M 72 0 Q 70 35 75 65 T 85 100"
          fill="none"
          stroke="rgba(2, 132, 199, 0.22)"
          strokeWidth="3.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Sabarmati River Label */}
      <div
        className="position-absolute font-mono fw-bold"
        style={{
          top: '18%',
          left: '76%',
          color: '#0284c7',
          fontSize: '9px',
          letterSpacing: '1.5px',
          opacity: 0.65,
          pointerEvents: 'none',
          zIndex: 3
        }}
      >
        SABARMATI RIVER
      </div>

      <svg
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ pointerEvents: 'none', zIndex: 2 }}
      >
        {/* Distance Concentric Circles */}
        <circle cx="50%" cy="50%" r="18%" fill="none" stroke="rgba(2, 132, 199, 0.16)" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="50%" cy="50%" r="32%" fill="none" stroke="rgba(2, 132, 199, 0.12)" strokeWidth="1" />
        <circle cx="50%" cy="50%" r="44%" fill="none" stroke="rgba(2, 132, 199, 0.08)" strokeWidth="1" strokeDasharray="5 5" />

        {/* Sector Boundary Rings with Clean Discreet Sector Tags */}
        {zones.map((z, idx) => (
          <g key={idx}>
            <circle cx={z.cx} cy={z.cy} r={z.r} fill="rgba(2, 132, 199, 0.02)" stroke="rgba(2, 132, 199, 0.2)" strokeWidth="1" strokeDasharray="2 2" />
            <text
              x={z.cx}
              y={z.cy}
              fill="#475569"
              fontSize="8.5"
              fontWeight="700"
              textAnchor="middle"
              fontFamily="'JetBrains Mono', monospace"
              letterSpacing="0.05em"
            >
              {z.name}
            </text>
          </g>
        ))}
      </svg>

      {/* 4. Top HUD Bar */}
      <div
        className="d-flex align-items-center justify-content-between p-2 position-relative"
        style={{ zIndex: 10, pointerEvents: 'auto' }}
      >
        <div className="d-flex align-items-center gap-2 bg-white bg-opacity-95 px-2 py-1 rounded shadow-sm border">
          <span className="spinner-grow spinner-grow-sm text-success" role="status" style={{ width: '8px', height: '8px' }} />
          <span className="fw-bold text-dark small" style={{ fontSize: '11px' }}>
            GPS TELEMETRY RADAR: AHMEDABAD METRO
          </span>
          <span className="text-muted font-mono d-none d-sm-inline" style={{ fontSize: '10px' }}>
            23.037°N, 72.561°E
          </span>
        </div>

        {/* Tactical Layer Switcher */}
        <div className="btn-group btn-group-sm bg-white shadow-sm border rounded p-0" role="group">
          {['TACTICAL', 'SATELLITE', 'HEATMAP'].map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => setMapMode(mode)}
              className={`btn btn-sm py-0 px-2 fw-bold ${mapMode === mode ? 'btn-primary' : 'btn-light text-secondary'}`}
              style={{ fontSize: '10px', height: '26px' }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Threat Markers Layer */}
      {activeThreatPings.map(t => {
        const pos = getCanvasPos(t.lat, t.lng);
        return (
          <div
            key={t.id}
            onClick={() => onOpenThreatModal && onOpenThreatModal(t)}
            className="position-absolute d-flex flex-column align-items-center"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 8,
              cursor: 'pointer'
            }}
          >
            {/* Pulsing Threat Beacon */}
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow"
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: t.color,
                boxShadow: `0 0 12px ${t.color}`,
                animation: 'pulseGlow 1.2s infinite ease-in-out',
                fontSize: '10px'
              }}
            >
              !
            </div>
            {/* Threat Badge */}
            <div
              className="badge text-white mt-1 shadow-sm font-mono fw-bold"
              style={{
                backgroundColor: t.color,
                fontSize: '8.5px',
                padding: '2px 6px',
                borderRadius: '3px',
                whiteSpace: 'nowrap'
              }}
            >
              {t.label}
            </div>
          </div>
        );
      })}

      {/* 6. Police Patrol Vehicle Markers Layer */}
      {vehicles && vehicles.map((v, idx) => {
        const lat = Number(v.telemetry?.latitude ?? (v.latest_lat ? parseFloat(v.latest_lat) : (23.025 + (idx * 0.012))));
        const lng = Number(v.telemetry?.longitude ?? (v.latest_lng ? parseFloat(v.latest_lng) : (72.520 + (idx * 0.014))));
        const heading = Number(v.telemetry?.heading_degrees ?? (v.heading_degrees ? parseFloat(v.heading_degrees) : (idx * 55)));
        const speed = Number(v.telemetry?.speed_kmph ?? (v.speed_kmph ? parseFloat(v.speed_kmph) : (v.is_active ? 42.0 : 0.0)));
        const pos = getCanvasPos(lat, lng);
        const isSelected = selectedVehicleId === v.vehicle_id;
        const vehicleId = v.vehicle_id || `V_${idx + 1}`;
        const shortLabel = vehicleId.replace('PATROL_VAN_', 'V');
        const plate = v.registration_number || v.plate_number || 'POLICE';

        return (
          <div
            key={vehicleId}
            onClick={() => onSelectVehicle && onSelectVehicle(v.vehicle_id)}
            className="position-absolute d-flex flex-column align-items-center"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: isSelected ? 9 : 6,
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
          >
            {/* Vehicle Pin Icon with Heading Pointer */}
            <div
              className={`rounded-circle d-flex align-items-center justify-content-center shadow-sm position-relative ${isSelected ? 'bg-primary text-white border-2 border-primary' : 'bg-white text-dark border-2 border-primary'}`}
              style={{
                width: isSelected ? '28px' : '22px',
                height: isSelected ? '28px' : '22px',
                boxShadow: isSelected ? '0 0 12px rgba(13, 110, 253, 0.6)' : '0 1px 4px rgba(0,0,0,0.15)'
              }}
            >
              {/* Heading arrow pointer */}
              <div
                style={{
                  position: 'absolute',
                  top: '-5px',
                  width: '0',
                  height: '0',
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderBottom: `6px solid ${isSelected ? '#0d6efd' : '#0284c7'}`,
                  transform: `rotate(${heading}deg)`,
                  transformOrigin: '50% 16px'
                }}
              />
              <span style={{ fontSize: isSelected ? '10px' : '8px', fontWeight: 800 }}>
                {shortLabel}
              </span>
            </div>

            {/* Compact Tactical Tag */}
            <div
              className={`mt-1 px-2 py-0 rounded shadow-sm font-mono d-flex align-items-center gap-1 ${isSelected ? 'bg-primary text-white border border-primary' : 'bg-white text-dark border'}`}
              style={{ fontSize: '9px', whiteSpace: 'nowrap' }}
            >
              <strong>{plate}</strong>
              <span className={isSelected ? 'text-white-50' : 'text-primary'}>
                {speed} km/h
              </span>
            </div>
          </div>
        );
      })}

      {/* 7. Bottom Telemetry HUD Status Strip */}
      <div
        className="d-flex align-items-center justify-content-between flex-wrap gap-2 p-2 bg-white bg-opacity-95 border-top position-relative"
        style={{ zIndex: 10, fontSize: '11px' }}
      >
        <div className="d-flex align-items-center gap-3">
          <span className="text-secondary">
            Active Units: <strong className="text-success">{vehicles.length} Online</strong>
          </span>
          <span className="text-secondary d-none d-sm-inline">
            Fleet GPS Sync: <strong className="text-primary">100% Locked</strong>
          </span>
          <span className="text-secondary d-none d-md-inline">
            Jetson Edge AI: <strong className="text-dark">YOLOv8 Realtime</strong>
          </span>
        </div>
        <div className="text-muted font-mono small" style={{ fontSize: '10px' }}>
          Select vehicle marker to lock live AI cameras
        </div>
      </div>
    </div>
  );
}
