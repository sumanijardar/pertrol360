import React, { useState } from 'react';

export default function CrowdHourlyChart() {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const crowdData = [
    { time: '08:00', count: 28, exceeded: false, location: 'Navrangpura Circle' },
    { time: '08:30', count: 35, exceeded: false, location: 'Vastrapur Lake' },
    { time: '09:00', count: 54, exceeded: true, location: 'SG Highway BRTS' },
    { time: '09:30', count: 68, exceeded: true, location: 'Satellite Crossroads' },
    { time: '10:00', count: 86, exceeded: true, location: 'University Ground' },
    { time: '10:15', count: 124, exceeded: true, location: 'SG Highway Transit' },
    { time: '10:30', count: 42, exceeded: true, location: 'Ellis Bridge' },
    { time: '11:00', count: 31, exceeded: false, location: 'Law Garden' }
  ];

  const maxVal = 140;
  const threshold = 40;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
        <span>Edge Crowd Density (Camera Vision AI)</span>
        <span style={{ color: '#dc2626', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
          Threshold Limit: 40 heads
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '110px', position: 'relative', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
        {/* Threshold dashed line */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: `${20 + (threshold / maxVal) * (110 - 20)}px`,
            borderTop: '1.5px dashed #dc2626',
            opacity: 0.85,
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          <span style={{ position: 'absolute', left: 2, top: -14, fontSize: '9px', color: '#dc2626', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
            Alert (40+)
          </span>
        </div>

        {crowdData.map((d, i) => {
          const heightPct = (d.count / maxVal) * 100;
          const isOver = d.count > threshold;
          const isHovered = hoveredIdx === i;

          return (
            <div
              key={i}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative', cursor: 'pointer' }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <span style={{ fontSize: '9px', fontFamily: "'JetBrains Mono', monospace", color: isOver ? '#dc2626' : '#0284c7', fontWeight: 700, marginBottom: '2px' }}>
                {d.count}
              </span>
              <div
                style={{
                  width: '100%',
                  height: `${heightPct}%`,
                  background: isOver
                    ? 'linear-gradient(to top, rgba(220, 38, 38, 0.7), #dc2626)'
                    : 'linear-gradient(to top, rgba(2, 132, 199, 0.6), #0284c7)',
                  borderRadius: '3px 3px 0 0',
                  boxShadow: isHovered ? `0 2px 6px ${isOver ? '#dc2626' : '#0284c7'}` : 'none',
                  transition: 'all 0.15s ease'
                }}
              />
              <span style={{ position: 'absolute', bottom: -18, fontSize: '8px', color: '#64748b', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                {d.time}
              </span>
            </div>
          );
        })}
      </div>

      {hoveredIdx !== null ? (
        <div style={{ fontSize: '10px', color: '#0f172a', textAlign: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '4px', fontWeight: 500 }}>
          {crowdData[hoveredIdx].time}: <strong style={{ color: '#0284c7' }}>{crowdData[hoveredIdx].count} people</strong> detected @ {crowdData[hoveredIdx].location} ({crowdData[hoveredIdx].exceeded ? 'BREACHED' : 'NORMAL'})
        </div>
      ) : (
        <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center' }}>
          Real-time head-count stream via Vehicle Cam Flank sensors
        </div>
      )}
    </div>
  );
}
