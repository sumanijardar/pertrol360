import React, { useState } from 'react';

export default function QuadCameraStream({ vehicle }) {
  const [activeCamIndex, setActiveCamIndex] = useState(0);
  const [isQuadView, setIsQuadView] = useState(true);

  if (!vehicle) return null;

  const cameras = vehicle.cameras || [];
  const activeCam = cameras[activeCamIndex] || cameras[0];

  const camImages = {
    FRONT: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&auto=format&fit=crop&q=80',
    REAR: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
    LEFT: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
    RIGHT: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80'
  };

  const renderSingleCamera = (cam, idx, isGrid) => {
    const isFront = cam.mount_position === 'FRONT';
    const isRear = cam.mount_position === 'REAR';
    const isSelected = activeCamIndex === idx;

    return (
      <div
        key={cam.camera_id}
        onClick={() => {
          setActiveCamIndex(idx);
          if (isGrid) setIsQuadView(false);
        }}
        className="position-relative w-100 rounded overflow-hidden shadow-sm"
        style={{
          aspectRatio: isGrid ? '16/9' : '16/9',
          maxHeight: isGrid ? '142px' : '290px',
          backgroundColor: '#0f172a',
          border: `1.5px solid ${isSelected ? '#0d6efd' : '#334155'}`,
          cursor: isGrid ? 'pointer' : 'default',
          transition: 'all 0.15s ease'
        }}
      >
        <img
          src={camImages[cam.mount_position] || camImages.FRONT}
          alt={cam.camera_id}
          className="w-100 h-100"
          style={{ objectFit: 'cover', opacity: 0.88 }}
        />

        {/* Tactical Scanline overlay */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
            backgroundSize: '100% 3px',
            pointerEvents: 'none'
          }}
        />

        {/* Top Camera HUD Overlay */}
        <div
          className="position-absolute top-0 start-0 end-0 d-flex justify-content-between align-items-center p-1 font-mono"
          style={{ zIndex: 4, fontSize: '8px' }}
        >
          <div className="d-flex align-items-center gap-1 bg-dark bg-opacity-75 px-1 py-0 rounded text-white">
            <span
              className="rounded-circle bg-danger"
              style={{ width: '5px', height: '5px', animation: 'pulseGlow 1.5s infinite' }}
            />
            <strong className="text-white">{cam.mount_position}</strong>
            <span className="text-white-50">[{cam.camera_id}]</span>
          </div>

          <div className="d-flex gap-1">
            <span className="bg-dark bg-opacity-75 text-success px-1 py-0 rounded">
              {cam.fps} FPS
            </span>
            <span className="bg-dark bg-opacity-75 text-info px-1 py-0 rounded d-none d-sm-inline">
              {cam.resolution}
            </span>
          </div>
        </div>

        {/* AI Bounding Box Overlays */}
        {isFront && (
          <div
            className="position-absolute"
            style={{
              top: '38%',
              left: '28%',
              width: '44%',
              height: '38%',
              border: '2px solid #ef4444',
              borderRadius: '2px',
              zIndex: 3,
              pointerEvents: 'none',
              animation: 'pulseGlow 2s infinite ease-in-out'
            }}
          >
            <div
              className="position-absolute bg-danger text-white font-mono fw-bold px-1"
              style={{
                top: '-15px',
                left: '-1px',
                fontSize: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              STOLEN: GJ01AB1234 (99.4%)
            </div>
          </div>
        )}

        {isRear && (
          <div
            className="position-absolute"
            style={{
              top: '32%',
              left: '42%',
              width: '32%',
              height: '34%',
              border: '1.5px solid #10b981',
              borderRadius: '2px',
              zIndex: 3,
              pointerEvents: 'none'
            }}
          >
            <div
              className="position-absolute bg-success text-white font-mono px-1"
              style={{
                top: '-14px',
                left: '-1px',
                fontSize: '7.5px'
              }}
            >
              PLATE: GJ01EF8899 (98.7%)
            </div>
          </div>
        )}

        {/* Bottom Stream Status */}
        <div
          className="position-absolute bottom-0 start-0 end-0 d-flex justify-content-between align-items-center px-1 py-0 font-mono text-white"
          style={{
            zIndex: 4,
            background: 'rgba(0,0,0,0.7)',
            fontSize: '8px'
          }}
        >
          <span className="text-truncate" style={{ maxWidth: '70%' }}>
            AI: {cam.ai_mode || 'YOLOv8 Realtime'}
          </span>
          <span className="text-success fw-bold">RTSP ● LIVE</span>
        </div>
      </div>
    );
  };

  return (
    <div className="d-flex flex-column justify-content-between w-100 h-100 gap-2">
      {/* 1. Stream Layout Toggle & Status Header */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle fw-bold" style={{ fontSize: '10px' }}>
            ● 4-CHANNEL CCTV
          </span>
          <span className="text-dark small fw-bold font-mono">
            {vehicle.registration_number}
          </span>
        </div>

        <div className="btn-group btn-group-sm" role="group">
          <button
            type="button"
            onClick={() => setIsQuadView(true)}
            className={`btn btn-sm py-0 px-2 fw-bold ${isQuadView ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{ fontSize: '10px', height: '26px' }}
          >
            Quad 2x2
          </button>
          <button
            type="button"
            onClick={() => setIsQuadView(false)}
            className={`btn btn-sm py-0 px-2 fw-bold ${!isQuadView ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{ fontSize: '10px', height: '26px' }}
          >
            Single Cam
          </button>
        </div>
      </div>

      {/* 2. Video Grid / Single View */}
      <div className="flex-grow-1 d-flex flex-column justify-content-center">
        {isQuadView ? (
          <div className="row g-2">
            {cameras.map((cam, idx) => (
              <div key={cam.camera_id} className="col-6">
                {renderSingleCamera(cam, idx, true)}
              </div>
            ))}
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {renderSingleCamera(activeCam, activeCamIndex, false)}
            <div className="d-flex gap-1 justify-content-center">
              {cameras.map((c, idx) => (
                <button
                  key={c.camera_id}
                  onClick={() => setActiveCamIndex(idx)}
                  className={`btn btn-sm py-0 px-2 font-mono fw-bold ${activeCamIndex === idx ? 'btn-primary' : 'btn-light border text-dark'}`}
                  style={{ fontSize: '10px' }}
                >
                  {c.mount_position}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Patrol Van Telemetry Strip */}
      <div className="d-flex align-items-center justify-content-between bg-light p-2 rounded border small flex-wrap gap-2" style={{ fontSize: '10px' }}>
        <div className="d-flex gap-2 font-mono">
          <span>SPD: <strong className="text-primary">{vehicle.telemetry.speed_kmph} km/h</strong></span>
          <span>BAT: <strong className="text-success">{vehicle.telemetry.battery_voltage}V</strong></span>
          <span>TEMP: <strong className={vehicle.telemetry.jetson_temperature_c > 50 ? 'text-warning' : 'text-success'}>{vehicle.telemetry.jetson_temperature_c}°C</strong></span>
          <span>LTE: <strong className="text-purple">{vehicle.telemetry.network_signal_dbm} dBm</strong></span>
        </div>
        <div className="text-truncate">
          Driver: <strong className="text-dark">{vehicle.assigned_driver_officer.split(' (')[0]}</strong>
        </div>
      </div>
    </div>
  );
}
