import React, { useState } from 'react';

export default function JetsonFleetTelemetryChart({ data }) {
  const [hoveredVan, setHoveredVan] = useState(null);

  const maxTemp = 75; // 75°C scale
  const warningTemp = 55;
  const criticalTemp = 60;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header Info Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#52525b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>Fleet Units: <strong style={{ color: '#09090b' }}>{data.length} Jetson Boxes</strong></span>
          <span style={{ color: '#047857', fontWeight: 700 }}>● Normal (&lt;55°C)</span>
          <span style={{ color: '#b45309', fontWeight: 700 }}>● Warm (55-60°C)</span>
          <span style={{ color: '#b91c1c', fontWeight: 700 }}>● Throttle (&gt;60°C)</span>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", color: '#18181b', fontSize: '11px', fontWeight: 700 }}>
          Avg Fleet Temp: {data && data.length > 0 ? (data.reduce((sum, item) => sum + (Number(item.temp) || 0), 0) / data.length).toFixed(1) : '0.0'}°C
        </div>
      </div>

      {/* Bar Chart Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data.length}, 1fr)`, gap: '8px', alignItems: 'flex-end', height: '140px', paddingBottom: '24px', position: 'relative', borderBottom: '1px solid #e2e8f0' }}>
        {/* Thermal Warning Line */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: `${24 + (warningTemp / maxTemp) * (140 - 24)}px`,
            borderTop: '1px dashed #d97706',
            opacity: 0.7,
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          <span style={{ position: 'absolute', right: '4px', top: '-14px', fontSize: '9px', color: '#d97706', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
            55°C Warn
          </span>
        </div>

        {/* Critical Threshold Line */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: `${24 + (criticalTemp / maxTemp) * (140 - 24)}px`,
            borderTop: '1px dashed #dc2626',
            opacity: 0.8,
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          <span style={{ position: 'absolute', left: '4px', top: '-14px', fontSize: '9px', color: '#dc2626', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
            60°C Critical
          </span>
        </div>

        {/* Individual Vehicle Columns */}
        {data.map((item, index) => {
          const heightPct = (item.temp / maxTemp) * 100;
          const isCritical = item.temp >= criticalTemp;
          const isWarning = item.temp >= warningTemp && !isCritical;
          const barColor = isCritical ? '#dc2626' : isWarning ? '#d97706' : '#0284c7';
          const isHovered = hoveredVan === index;

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                position: 'relative',
                cursor: 'pointer'
              }}
              onMouseEnter={() => setHoveredVan(index)}
              onMouseLeave={() => setHoveredVan(null)}
            >
              {/* Temperature Tag */}
              <div
                style={{
                  fontSize: '10px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: barColor,
                  marginBottom: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                {item.temp}°
              </div>

              {/* Bar */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '30px',
                  height: `${heightPct}%`,
                  background: isCritical
                    ? 'linear-gradient(to top, rgba(220,38,38,0.7), #dc2626)'
                    : isWarning
                    ? 'linear-gradient(to top, rgba(217,119,6,0.7), #d97706)'
                    : 'linear-gradient(to top, rgba(2,132,199,0.7), #0284c7)',
                  borderRadius: '4px 4px 0 0',
                  boxShadow: isHovered ? `0 2px 8px ${barColor}` : 'none',
                  transition: 'all 0.2s ease',
                  border: isHovered ? '1.5px solid #0f172a' : 'none'
                }}
              />

              {/* X Axis Label */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-20px',
                  fontSize: '9.5px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#18181b',
                  fontWeight: 700,
                  whiteSpace: 'nowrap'
                }}
              >
                {item.id}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating or Bottom Telemetry Detail Bar */}
      <div style={{ background: '#f4f4f5', borderRadius: '6px', padding: '8px 12px', border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        {hoveredVan !== null ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-info">{data[hoveredVan].id}</span>
              <span style={{ fontSize: '11px', color: '#09090b', fontWeight: 700 }}>{data[hoveredVan].model}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace" }}>
              <span style={{ color: '#52525b' }}>Battery: <strong style={{ color: '#047857' }}>{data[hoveredVan].volt}V</strong></span>
              <span style={{ color: '#52525b' }}>Speed: <strong style={{ color: '#18181b' }}>{data[hoveredVan].speed} km/h</strong></span>
              <span style={{ color: '#52525b' }}>Signal: <strong style={{ color: '#18181b' }}>{data[hoveredVan].signal} dBm</strong></span>
              <span style={{ color: data[hoveredVan].temp > 60 ? '#b91c1c' : '#047857', fontWeight: 800 }}>
                Status: {data[hoveredVan].status}
              </span>
            </div>
          </>
        ) : (
          <div style={{ fontSize: '11px', color: '#52525b', fontWeight: 600, textAlign: 'center', width: '100%' }}>
            Hover over any patrol unit column to inspect real-time Jetson Edge AI telemetry, battery voltage & cellular dBm
          </div>
        )}
      </div>
    </div>
  );
}
