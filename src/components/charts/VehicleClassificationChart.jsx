import React from 'react';

export default function VehicleClassificationChart({ data }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
        <span>ANPR AI Vehicle Categorization</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#0284c7', fontWeight: 600 }}>3,842 Scanned</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {data.map((item, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
              <span style={{ color: '#1e293b', fontWeight: 600 }}>{item.type}</span>
              <div style={{ display: 'flex', gap: '8px', fontFamily: "'JetBrains Mono', monospace" }}>
                <span style={{ color: '#64748b' }}>{item.count.toLocaleString()}</span>
                <span style={{ color: item.color, fontWeight: 700 }}>{item.percent}%</span>
              </div>
            </div>
            {/* Progress track */}
            <div style={{ width: '100%', height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
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
