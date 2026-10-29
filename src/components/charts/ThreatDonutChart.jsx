import React, { useState } from 'react';

export default function ThreatDonutChart({ data }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const totalIncidents = data.reduce((acc, curr) => acc + curr.count, 0);

  // Compact, perfectly proportioned SVG parameters
  const size = 126;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let currentOffset = 0;

  const activeItem = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        width: '100%',
        height: '100%'
      }}
    >
      {/* 1. Donut SVG Column */}
      <div
        style={{
          position: 'relative',
          width: `${size}px`,
          height: `${size}px`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
        >
          {/* Background circle track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {data.map((item, index) => {
            const sliceLength = (item.percentage / 100) * circumference;
            const strokeDasharray = `${sliceLength} ${circumference}`;
            const strokeDashoffset = -currentOffset;
            currentOffset += sliceLength;
            const isHovered = hoveredIdx === index;

            return (
              <circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-width 0.15s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center Readout HUD */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '74px'
          }}
        >
          <div style={{ fontSize: '8.5px', textTransform: 'uppercase', color: '#18181b', fontWeight: 800, letterSpacing: '0.04em' }}>
            {activeItem ? activeItem.label.split(' ')[0] : 'TOTAL'}
          </div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              color: activeItem ? activeItem.color : '#dc2626',
              lineHeight: 1.1,
              marginTop: '1px'
            }}
          >
            {activeItem ? activeItem.count : totalIncidents}
          </div>
          <div style={{ fontSize: '8.5px', color: '#52525b', fontWeight: 700 }}>
            {activeItem ? `${activeItem.percentage}%` : 'Incidents'}
          </div>
        </div>
      </div>

      {/* 2. Legend List Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: 0 }}>
        {data.map((item, index) => {
          const isSelected = hoveredIdx === index;
          return (
            <div
              key={index}
              onMouseEnter={() => setHoveredIdx(index)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px',
                borderRadius: '5px',
                background: isSelected ? '#f4f4f5' : '#ffffff',
                border: `1px solid ${isSelected ? item.color : '#e4e4e7'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: item.color,
                    flexShrink: 0
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    color: '#09090b',
                    fontWeight: isSelected ? 700 : 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {item.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: item.color }}>
                  {item.count}
                </span>
                <span style={{ fontSize: '9px', color: '#18181b', background: '#e4e4e7', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                  {item.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
