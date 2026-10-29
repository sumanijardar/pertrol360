import React from 'react';

export default function VehicleClassificationChart({ data = [], totalScanned = 0 }) {
  const safeTotal = Number(totalScanned || 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#52525b', fontWeight: 600 }}>
        <span>ANPR AI Vehicle Categorization</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#18181b', fontWeight: 700 }}>
          {safeTotal.toLocaleString()} Scanned
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {data.map((item, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
              <span style={{ color: '#09090b', fontWeight: 600 }}>{item.type}</span>
              <div style={{ display: 'flex', gap: '8px', fontFamily: "'JetBrains Mono', monospace" }}>
                <span style={{ color: '#18181b', fontWeight: 600 }}>{item.count.toLocaleString()}</span>
                <span style={{ color: item.color, fontWeight: 700 }}>{item.percent}%</span>
              </div>
            </div>
            {/* Progress track */}
            <div style={{ width: '100%', height: '7px', background: '#f4f4f5', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e4e4e7' }}>
              <div
                style={{
                  width: `${item.percent}%`,
                  height: '100%',
                  background: item.color,
                  borderRadius: '4px',
                  transition: 'width 0.8s ease'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
