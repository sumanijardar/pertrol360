import React, { useState } from 'react';

export default function TimelineActivityChart({ data }) {
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'ANPR' | 'THREATS'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Dimensions
  const width = 600;
  const height = 170;
  const padding = { top: 20, right: 15, bottom: 25, left: 40 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Add 25% headroom so curves never hit the ceiling
  const maxAnpr = Math.max(...data.map(d => d.anprCount)) * 1.25;
  const maxThreats = 10;

  const getX = (idx) => padding.left + (idx / (data.length - 1)) * chartW;
  const getYAnpr = (val) => padding.top + chartH - (val / maxAnpr) * chartH;
  const getYThreats = (val) => padding.top + chartH - (val / maxThreats) * chartH;

  // Smooth bezier curve generator
  const buildSmoothPath = (points) => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const anprPoints = data.map((d, i) => ({ x: getX(i), y: getYAnpr(d.anprCount) }));
  const threatPoints = data.map((d, i) => ({ x: getX(i), y: getYThreats(d.threats + d.fire + d.crowdSurges) }));

  const anprLinePath = buildSmoothPath(anprPoints);
  const anprAreaPath = `${anprLinePath} L ${padding.left + chartW} ${padding.top + chartH} L ${padding.left} ${padding.top + chartH} Z`;

  const threatLinePath = buildSmoothPath(threatPoints);
  const threatAreaPath = `${threatLinePath} L ${padding.left + chartW} ${padding.top + chartH} L ${padding.left} ${padding.top + chartH} Z`;

  const activePoint = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* 1. Header Legend & Filter Controls (Isolated from SVG) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#475569', fontWeight: 600 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7', display: 'inline-block' }} />
            <span>ANPR Scans</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#475569', fontWeight: 600 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
            <span>Threat Incidents</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '5px', padding: '2px', border: '1px solid #e2e8f0' }}>
          {['ALL', 'ANPR', 'THREATS'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                background: activeFilter === filter ? '#ffffff' : 'transparent',
                color: activeFilter === filter ? '#0284c7' : '#64748b',
                border: 'none',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 700,
                borderRadius: '3px',
                cursor: 'pointer',
                boxShadow: activeFilter === filter ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.12s ease'
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* 2. SVG Graph Drawing Area */}
      <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="anprGradientLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="threatGradientLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((pct, i) => {
            const y = padding.top + chartH * pct;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartW}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="8.5"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {Math.round(maxAnpr * (1 - pct))}
                </text>
              </g>
            );
          })}

          {/* X Axis Time Labels */}
          {data.map((d, i) => {
            if (i % 2 !== 0 && i !== data.length - 1) return null;
            const x = getX(i);
            return (
              <text
                key={i}
                x={x}
                y={height - 6}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="8.5"
                fontFamily="'JetBrains Mono', monospace"
              >
                {d.hour}
              </text>
            );
          })}

          {/* ANPR Area & Line */}
          {(activeFilter === 'ALL' || activeFilter === 'ANPR') && (
            <>
              <path d={anprAreaPath} fill="url(#anprGradientLight)" />
              <path
                d={anprLinePath}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          )}

          {/* Threat Area & Line */}
          {(activeFilter === 'ALL' || activeFilter === 'THREATS') && (
            <>
              <path d={threatAreaPath} fill="url(#threatGradientLight)" />
              <path
                d={threatLinePath}
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeDasharray="4 2"
                strokeLinecap="round"
              />
            </>
          )}

          {/* Hover Crosshair & Circles */}
          {hoveredIndex !== null && (
            <g>
              <line
                x1={getX(hoveredIndex)}
                y1={padding.top}
                x2={getX(hoveredIndex)}
                y2={padding.top + chartH}
                stroke="#0284c7"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              {(activeFilter === 'ALL' || activeFilter === 'ANPR') && (
                <circle
                  cx={anprPoints[hoveredIndex].x}
                  cy={anprPoints[hoveredIndex].y}
                  r="4"
                  fill="#0284c7"
                  stroke="#fff"
                  strokeWidth="2"
                />
              )}
              {(activeFilter === 'ALL' || activeFilter === 'THREATS') && (
                <circle
                  cx={threatPoints[hoveredIndex].x}
                  cy={threatPoints[hoveredIndex].y}
                  r="4"
                  fill="#dc2626"
                  stroke="#fff"
                  strokeWidth="2"
                />
              )}
            </g>
          )}

          {/* Transparent Hover Hitboxes */}
          {data.map((_, i) => {
            const x = getX(i);
            const w = chartW / (data.length - 1);
            return (
              <rect
                key={i}
                x={x - w / 2}
                y={padding.top}
                width={w}
                height={chartH}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIndex(i)}
              />
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {activePoint && (
          <div
            style={{
              position: 'absolute',
              top: '4px',
              left: `${Math.min(Math.max(10, (hoveredIndex / (data.length - 1)) * 85), 68)}%`,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '5px',
              padding: '6px 10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              pointerEvents: 'none',
              zIndex: 10,
              fontSize: '10px',
              minWidth: '120px'
            }}
          >
            <div style={{ color: '#0f172a', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '3px' }}>
              Time: {activePoint.hour}
            </div>
            <div style={{ color: '#0284c7', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
              <span>ANPR:</span>
              <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>{activePoint.anprCount}</strong>
            </div>
            <div style={{ color: '#dc2626', display: 'flex', justifyContent: 'space-between', marginTop: '1px', fontWeight: 600 }}>
              <span>Threats:</span>
              <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>{activePoint.threats + activePoint.fire + activePoint.crowdSurges}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
