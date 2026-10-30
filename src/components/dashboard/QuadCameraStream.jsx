import React, { useState, useEffect } from 'react';
import {
  IconZoomIn,
  IconZoomOut,
  IconMaximize2,
  IconRotateCcw,
  IconX,
  IconVideo
} from '../common/Icons';
import { API_BASE_URL } from '../../services/api';

export default function QuadCameraStream({ vehicle }) {
  const [activeCamIndex, setActiveCamIndex] = useState(0);
  const [isQuadView, setIsQuadView] = useState(true);

  // Modal State for Image Zoom Preview
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewCamIndex, setPreviewCamIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Stream health and reload states
  const [streamErrors, setStreamErrors] = useState({});
  const [streamLoading, setStreamLoading] = useState({});
  const [streamKey, setStreamKey] = useState(Date.now());

  if (!vehicle) return null;

  // Default fallback if no cameras exist in vehicle
  const DEFAULT_CAMERAS = [
    { camera_id: `${vehicle.vehicle_id || 'VEH'}_CAM_01`, camera_name: 'Front ANPR Cam', mount_position: 'FRONT', resolution: '1920x1080', fps: 25, is_streaming: true, rtsp_url: 'rtsp://192.168.1.101:554/stream1' },
    { camera_id: `${vehicle.vehicle_id || 'VEH'}_CAM_02`, camera_name: 'Rear Traffic Cam', mount_position: 'REAR', resolution: '1920x1080', fps: 25, is_streaming: true, rtsp_url: 'rtsp://192.168.1.102:554/stream1' },
    { camera_id: `${vehicle.vehicle_id || 'VEH'}_CAM_03`, camera_name: 'Left Flank Cam', mount_position: 'LEFT', resolution: '1920x1080', fps: 25, is_streaming: true, rtsp_url: 'rtsp://192.168.1.103:554/stream1' },
    { camera_id: `${vehicle.vehicle_id || 'VEH'}_CAM_04`, camera_name: 'Right Flank Cam', mount_position: 'RIGHT', resolution: '1920x1080', fps: 25, is_streaming: true, rtsp_url: 'rtsp://192.168.1.104:554/stream1' }
  ];

  // Dynamically populate cameras from vehicle
  const cameras = (Array.isArray(vehicle.cameras) && vehicle.cameras.length > 0)
    ? vehicle.cameras
    : (Array.isArray(vehicle.cameras) ? [] : DEFAULT_CAMERAS);

  const cameraCount = cameras.length;
  const activeCam = cameras[activeCamIndex] || cameras[0] || null;
  const modalActiveCam = cameras[previewCamIndex] || cameras[0] || null;

  // Append timestamp parameter safely for cache busting
  const withTimestamp = (url, key) => {
    if (!url) return '';
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}_t=${key}`;
  };

  // Resolve streaming URL for a camera (uses HTTPS backend proxy on HTTPS to avoid ERR_SSL_PROTOCOL_ERROR)
  const getStreamUrl = (cam) => {
    if (!cam) return null;
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

    // 1. If on HTTPS, prioritize backend proxy route to eliminate SSL/mixed-content errors
    if (isHttps) {
      if (cam.id) {
        return `${API_BASE_URL}/api/cameras/${cam.id}/stream`;
      }
      if (cam.camera_id) {
        return `${API_BASE_URL}/api/cameras/${encodeURIComponent(cam.camera_id)}/stream`;
      }
      if (cam.ip && cam.username && cam.password) {
        const port = cam.rtsp_port || '554';
        const dvr = cam.dvrname || 'Hikvision';
        const ch = cam.channel || 1;
        const nameParam = `${cam.username}-${cam.password}-${cam.ip}-${port}-${dvr}-${ch}`;
        return `${API_BASE_URL}/api/cameras/stream?name=${encodeURIComponent(nameParam)}`;
      }
      if (cam.stream_url) {
        return `${API_BASE_URL}${cam.stream_url.startsWith('/') ? '' : '/'}${cam.stream_url}`;
      }
    }

    // 2. If API provided stream_url
    if (cam.stream_url && isHttps) {
      return `${API_BASE_URL}${cam.stream_url.startsWith('/') ? '' : '/'}${cam.stream_url}`;
    }

    // 3. On HTTP (localhost)
    if (cam.live_view_url && !isHttps) {
      return cam.live_view_url;
    }

    if (cam.ip && cam.username && cam.password) {
      const port = cam.rtsp_port || '554';
      const dvr = cam.dvrname || 'Hikvision';
      const ch = cam.channel || 1;
      const nameParam = `${cam.username}-${cam.password}-${cam.ip}-${port}-${dvr}-${ch}`;
      if (isHttps) {
        return `${API_BASE_URL}/api/cameras/stream?name=${encodeURIComponent(nameParam)}`;
      }
      return `http://223.182.122.63:7000/?name=${nameParam}`;
    }

    // Fallback: If camera ID exists, use proxy
    if (cam.id || cam.camera_id) {
      return `${API_BASE_URL}/api/cameras/${cam.id || cam.camera_id}/stream`;
    }

    return null;
  };

  const handleStreamLoad = (camId) => {
    setStreamLoading((prev) => ({ ...prev, [camId]: false }));
    setStreamErrors((prev) => ({ ...prev, [camId]: false }));
  };

  const handleStreamError = (camId) => {
    setStreamLoading((prev) => ({ ...prev, [camId]: false }));
    setStreamErrors((prev) => ({ ...prev, [camId]: true }));
  };

  const handleRetryStream = (camId, e) => {
    if (e) e.stopPropagation();
    setStreamErrors((prev) => ({ ...prev, [camId]: false }));
    setStreamLoading((prev) => ({ ...prev, [camId]: true }));
    setStreamKey(Date.now());
  };

  const openPreviewModal = (camIdx) => {
    setPreviewCamIndex(camIdx);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setIsModalOpen(true);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 3.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(Number((prev - 0.25).toFixed(2)), 0.5);
      if (next <= 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Wheel zoom handler
  const handleWheelZoom = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Drag-to-pan handlers when zoomed in
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard shortcut: Escape to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Determine height based on camera count and layout
  const getFeedMaxHeight = (count, isGrid) => {
    if (!isGrid) return '310px';
    if (count === 1) return '310px';
    if (count === 2) return '230px';
    if (count === 3) return '190px';
    if (count === 4) return '155px';
    return '140px';
  };

  // Render a single camera stream block
  const renderSingleCamera = (cam, idx, isGrid) => {
    if (!cam) return null;
    const isSelected = activeCamIndex === idx;
    const streamUrl = getStreamUrl(cam);
    const hasError = streamErrors[cam.camera_id];
    const maxHeight = getFeedMaxHeight(cameraCount, isGrid);

    return (
      <div
        key={cam.camera_id || idx}
        onClick={() => {
          if (isGrid && cameraCount > 1) {
            setActiveCamIndex(idx);
            setIsQuadView(false);
          } else {
            openPreviewModal(idx);
          }
        }}
        className="position-relative w-100 rounded overflow-hidden shadow-xs camera-feed-box"
        style={{
          aspectRatio: '16/9',
          maxHeight: maxHeight,
          backgroundColor: '#050b14',
          border: `1.5px solid ${isSelected ? '#0284c7' : '#1e293b'}`,
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        title={isGrid ? 'Click to focus Single Cam view' : 'Click to open Zoom preview modal'}
      >
        {/* Real Live MJPEG Stream or Tactical HUD Fallback */}
        {streamUrl && !hasError ? (
          <img
            src={withTimestamp(streamUrl, streamKey)}
            alt={cam.camera_name || cam.camera_id}
            className="w-100 h-100"
            style={{ objectFit: 'cover' }}
            onLoad={() => handleStreamLoad(cam.camera_id)}
            onError={() => handleStreamError(cam.camera_id)}
          />
        ) : (
          <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-2 text-center" style={{ backgroundColor: '#070d18' }}>
            <svg width="100%" height="100%" viewBox="0 0 400 200" className="w-100 h-100 select-none position-absolute top-0 start-0 opacity-20 pointer-events-none">
              <circle cx="200" cy="100" r="32" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 2" />
              <line x1="160" y1="100" x2="240" y2="100" stroke="#0284c7" strokeWidth="1" />
              <line x1="200" y1="60" x2="200" y2="140" stroke="#0284c7" strokeWidth="1" />
            </svg>
            <div className="z-1 d-flex flex-column align-items-center">
              <div className="rounded-circle p-2 mb-1 text-sky-400 d-flex align-items-center justify-content-center" style={{ background: 'rgba(2, 132, 199, 0.15)' }}>
                <IconVideo size={20} />
              </div>
              <strong className="text-white font-mono small mb-0.5">
                {cam.camera_name || `${cam.mount_position} CAMERA`}
              </strong>
              <span className="text-slate-400 font-mono text-truncate px-2 mb-2" style={{ fontSize: '10px', maxWidth: '240px' }}>
                {cam.rtsp_url || 'RTSP Stream Standby'}
              </span>
              <div className="d-flex align-items-center gap-1.5 flex-wrap justify-content-center">
                {streamUrl && (
                  <button
                    type="button"
                    onClick={(e) => handleRetryStream(cam.camera_id, e)}
                    className="btn btn-sm btn-outline-primary py-0 px-2 font-mono fw-bold"
                    style={{ fontSize: '10px', height: '22px' }}
                  >
                    ↻ Retry Feed
                  </button>
                )}
                {streamUrl && (
                  <a
                    href={streamUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="btn btn-sm btn-outline-success py-0 px-2 font-mono fw-bold no-underline d-inline-flex align-items-center gap-1"
                    style={{ fontSize: '10px', height: '22px' }}
                    title={`Open Stream: ${streamUrl}`}
                  >
                    Port 7000 ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tactical Scanlines overlay */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%)',
            backgroundSize: '100% 3px',
            pointerEvents: 'none'
          }}
        />

        {/* Top Camera HUD Overlay */}
        <div
          className="position-absolute top-0 start-0 end-0 d-flex justify-content-between align-items-center p-1.5 font-mono"
          style={{ zIndex: 4, fontSize: '9px' }}
        >
          <div className="d-flex align-items-center gap-1 bg-dark bg-opacity-80 px-1.5 py-0.5 rounded text-white border border-slate-700">
            <span
              className="rounded-circle bg-emerald-400"
              style={{ width: '6px', height: '6px', animation: 'pulseGlow 1.5s infinite' }}
            />
            <strong className="text-white">{cam.mount_position}</strong>
            <span className="text-slate-300">[{cam.camera_id}]</span>
            {cam.channel && <span className="text-sky-300 ms-0.5">Ch{cam.channel}</span>}
          </div>

          <div className="d-flex align-items-center gap-1">
            <span className="bg-dark bg-opacity-80 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700">
              {cam.fps || 25} FPS
            </span>
            <span className="bg-dark bg-opacity-80 text-sky-400 px-1.5 py-0.5 rounded border border-slate-700 d-none d-sm-inline">
              {cam.resolution || '1080p'}
            </span>
            {/* Quick Expand Icon button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openPreviewModal(idx);
              }}
              className="btn btn-dark btn-sm p-0 px-1.5 border border-slate-700 bg-opacity-80 text-white d-flex align-items-center"
              style={{ fontSize: '9px', height: '19px' }}
              title="Expand & Zoom Preview"
            >
              <IconMaximize2 size={11} />
            </button>
          </div>
        </div>

        {/* Bottom Stream Status */}
        <div
          className="position-absolute bottom-0 start-0 end-0 d-flex justify-content-between align-items-center px-2 py-0.5 font-mono text-white"
          style={{
            zIndex: 4,
            background: 'rgba(2, 6, 23, 0.85)',
            fontSize: '9px'
          }}
        >
          <span className="text-truncate text-slate-300" style={{ maxWidth: '65%' }}>
            {cam.dvrname ? `${cam.dvrname} • ` : ''}
            {cam.ip ? `${cam.ip} • ` : ''}
            {cam.camera_name || 'RTSP Stream'}
          </span>
          <div className="d-flex align-items-center gap-1.5 flex-shrink-0">
            {streamUrl && (
              <a
                href={streamUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-sky-400 hover:text-sky-300 text-decoration-none fw-bold"
                style={{ fontSize: '8.5px' }}
                title={`Open Live Stream (Port 7000): ${streamUrl}`}
              >
                7000 ↗
              </a>
            )}
            <span className="text-emerald-400 fw-bold">● LIVE</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="d-flex flex-column justify-content-between w-100 h-100 gap-2">
      {/* 1. Stream Layout Toggle & Status Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <span
            className="badge font-mono fw-bold"
            style={{ fontSize: '10px', backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
          >
            ● {cameraCount > 0 ? `${cameraCount}-CHANNEL RTSP CCTV` : 'STANDBY'}
          </span>
          <span className="small fw-bold font-mono" style={{ color: '#09090b' }}>
            {vehicle.registration_number}
          </span>
        </div>

        {cameraCount > 0 && (
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              onClick={() => setIsQuadView(true)}
              className="btn btn-sm py-0 px-2.5 fw-bold"
              style={{
                fontSize: '10px',
                height: '26px',
                backgroundColor: isQuadView ? '#18181b' : '#ffffff',
                color: isQuadView ? '#ffffff' : '#18181b',
                border: '1px solid ' + (isQuadView ? '#18181b' : '#e4e4e7'),
                transition: 'all 0.15s ease'
              }}
            >
              {cameraCount === 4 ? 'Quad 2x2' : (cameraCount > 1 ? `Grid (${cameraCount})` : 'Full View')}
            </button>
            <button
              type="button"
              onClick={() => setIsQuadView(false)}
              className="btn btn-sm py-0 px-2.5 fw-bold"
              style={{
                fontSize: '10px',
                height: '26px',
                backgroundColor: !isQuadView ? '#18181b' : '#ffffff',
                color: !isQuadView ? '#ffffff' : '#18181b',
                border: '1px solid ' + (!isQuadView ? '#18181b' : '#e4e4e7'),
                transition: 'all 0.15s ease'
              }}
            >
              Single Cam
            </button>
          </div>
        )}
      </div>

      {/* 2. Video Grid / Single View */}
      <div className="flex-grow-1 d-flex flex-column justify-content-center">
        {cameraCount === 0 ? (
          <div className="p-4 text-center text-muted font-mono bg-light rounded border my-2">
            <IconVideo size={32} className="text-secondary mb-2" />
            <div className="fw-bold text-dark small">No Cameras Configured</div>
            <div className="text-secondary" style={{ fontSize: '11px' }}>
              No 360° cameras are currently assigned to {vehicle.registration_number || vehicle.vehicle_id}.
            </div>
          </div>
        ) : isQuadView ? (
          <div className="row g-2">
            {cameras.map((cam, idx) => {
              // Dynamic column layout based on total camera count
              let colClass = 'col-6';
              if (cameraCount === 1) colClass = 'col-12';
              else if (cameraCount === 2) colClass = 'col-12 col-md-6';
              else if (cameraCount === 3) colClass = 'col-12 col-md-4';
              else if (cameraCount === 4) colClass = 'col-6';
              else if (cameraCount === 5) {
                colClass = idx < 2 ? 'col-12 col-md-6' : 'col-12 col-md-4';
              } else {
                colClass = 'col-12 col-md-6 col-lg-4';
              }

              return (
                <div key={cam.camera_id || idx} className={colClass}>
                  {renderSingleCamera(cam, idx, true)}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {renderSingleCamera(activeCam, activeCamIndex, false)}
            <div className="d-flex gap-1 justify-content-center flex-wrap">
              {cameras.map((c, idx) => (
                <button
                  key={c.camera_id || idx}
                  onClick={() => setActiveCamIndex(idx)}
                  className={`btn btn-sm py-0 px-2 font-mono fw-bold ${activeCamIndex === idx ? 'btn-primary' : 'btn-light border text-dark'}`}
                  style={{ fontSize: '10px' }}
                >
                  {c.mount_position} {c.channel ? `(Ch${c.channel})` : ''}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Patrol Van Telemetry Strip */}
      <div className="d-flex align-items-center justify-content-between bg-light p-2 rounded border small flex-wrap gap-2" style={{ fontSize: '10px' }}>
        <div className="d-flex gap-2 font-mono">
          <span>SPD: <strong className="text-primary">{vehicle.telemetry?.speed_kmph ?? (vehicle.speed_kmph || (vehicle.is_active ? 42.0 : 0.0))} km/h</strong></span>
          <span>BAT: <strong className="text-success">{vehicle.telemetry?.battery_voltage ?? 13.2}V</strong></span>
          <span>TEMP: <strong className={(vehicle.telemetry?.jetson_temperature_c ?? 46) > 50 ? 'text-warning' : 'text-success'}>{vehicle.telemetry?.jetson_temperature_c ?? 46}°C</strong></span>
          <span>LTE: <strong className="text-primary">{vehicle.telemetry?.network_signal_dbm ?? -65} dBm</strong></span>
        </div>
        <div className="text-truncate font-mono">
          Driver: <strong className="text-dark">{(vehicle.assigned_driver_officer || vehicle.assigned_officer_name || vehicle.driver_officer_id || 'Active Crew').split(' (')[0]}</strong>
        </div>
      </div>

      {/* ========================================================== */}
      {/* CAMERA IMAGE ZOOM IN / ZOOM OUT PREVIEW MODAL              */}
      {/* ========================================================== */}
      {isModalOpen && modalActiveCam && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 1060
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-xl"
            style={{ maxWidth: '94vw' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content shadow-lg border-0 rounded-3 overflow-hidden bg-dark text-white">
              {/* Modal Header with Camera Status & Zoom Controls */}
              <div className="modal-header bg-black bg-opacity-75 py-2 px-3 border-bottom border-secondary d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="badge bg-danger d-flex align-items-center gap-1 font-mono">
                    <span className="rounded-circle bg-white" style={{ width: '6px', height: '6px', animation: 'pulseGlow 1s infinite' }} />
                    LIVE RTSP
                  </span>
                  <div className="d-flex align-items-center gap-1">
                    <strong className="text-white">{modalActiveCam.mount_position} CAMERA</strong>
                    <span className="text-secondary font-mono small">[{modalActiveCam.camera_id}]</span>
                    {modalActiveCam.channel && <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-mono">Channel {modalActiveCam.channel}</span>}
                  </div>
                  <span className="badge bg-secondary-subtle text-light border border-secondary font-mono" style={{ fontSize: '11px' }}>
                    {vehicle.registration_number}
                  </span>
                  <span className="text-success font-mono small ms-1">
                    {modalActiveCam.fps || 25} FPS
                  </span>
                  <span className="text-info font-mono small">
                    {modalActiveCam.resolution || '1080p'}
                  </span>
                </div>

                {/* ZOOM CONTROLS TOOLBAR */}
                <div className="d-flex align-items-center gap-2">
                  <div className="btn-group btn-group-sm bg-dark border border-secondary rounded p-0.5">
                    <button
                      type="button"
                      className="btn btn-dark btn-sm text-light px-2 d-flex align-items-center gap-1"
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 0.5}
                      title="Zoom Out (-)"
                    >
                      <IconZoomOut size={14} />
                      <span className="d-none d-md-inline small">Zoom Out</span>
                    </button>
                    <span
                      className="btn btn-dark btn-sm text-warning font-mono fw-bold px-2 disabled border-0"
                      style={{ minWidth: '55px', cursor: 'default' }}
                    >
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      type="button"
                      className="btn btn-dark btn-sm text-light px-2 d-flex align-items-center gap-1"
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 3.5}
                      title="Zoom In (+)"
                    >
                      <IconZoomIn size={14} />
                      <span className="d-none d-md-inline small">Zoom In</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-dark btn-sm text-info px-2 d-flex align-items-center gap-1 border-start border-secondary"
                      onClick={handleResetZoom}
                      title="Reset Zoom (100%)"
                    >
                      <IconRotateCcw size={14} />
                      <span className="d-none d-md-inline small">Reset</span>
                    </button>
                  </div>

                  {/* Channel Switchers inside Modal */}
                  <div className="btn-group btn-group-sm d-none d-lg-flex" role="group">
                    {cameras.map((c, idx) => (
                      <button
                        key={c.camera_id || idx}
                        type="button"
                        onClick={() => {
                          setPreviewCamIndex(idx);
                          handleResetZoom();
                        }}
                        className={`btn btn-sm py-1 px-2 font-mono fw-bold ${previewCamIndex === idx ? 'btn-primary' : 'btn-outline-secondary text-light'}`}
                        style={{ fontSize: '10px' }}
                      >
                        {c.mount_position} {c.channel ? `(Ch${c.channel})` : ''}
                      </button>
                    ))}
                  </div>

                  {/* Close Modal Button */}
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm p-1 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '28px', height: '28px' }}
                    onClick={() => setIsModalOpen(false)}
                    title="Close Modal (Esc)"
                  >
                    <IconX size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Body: Interactive Zoomable Live Stream Viewport */}
              <div
                className="modal-body p-0 position-relative overflow-hidden d-flex justify-content-center align-items-center"
                style={{
                  height: '70vh',
                  minHeight: '440px',
                  backgroundColor: '#020617',
                  cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                  userSelect: 'none'
                }}
                onWheel={handleWheelZoom}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDoubleClick={handleResetZoom}
              >
                {/* Live Stream / Image Container with Scaled & Translated Transform */}
                <div
                  className="w-100 h-100 d-flex justify-content-center align-items-center position-relative"
                  style={{
                    transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
                  }}
                >
                  {getStreamUrl(modalActiveCam) && !streamErrors[modalActiveCam.camera_id] ? (
                    <img
                      src={withTimestamp(getStreamUrl(modalActiveCam), streamKey)}
                      alt={modalActiveCam.camera_id}
                      className="rounded shadow"
                      style={{
                        maxWidth: '92%',
                        maxHeight: '92%',
                        objectFit: 'contain',
                        pointerEvents: 'none'
                      }}
                      onError={() => handleStreamError(modalActiveCam.camera_id)}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <div className="rounded-circle p-3 mb-2 text-sky-400 d-inline-flex align-items-center justify-content-center" style={{ background: 'rgba(2, 132, 199, 0.2)' }}>
                        <IconVideo size={36} />
                      </div>
                      <div className="fw-bold font-mono text-white h5 mb-1">{modalActiveCam.camera_name || `${modalActiveCam.mount_position} CAMERA`}</div>
                      <div className="font-mono text-slate-400 small mb-2">{modalActiveCam.rtsp_url}</div>
                      {getStreamUrl(modalActiveCam) && (
                        <button
                          type="button"
                          onClick={(e) => handleRetryStream(modalActiveCam.camera_id, e)}
                          className="btn btn-primary btn-sm font-mono fw-bold px-3"
                        >
                          ↻ Reconnect Stream
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Subtle Scanlines tactical effect */}
                <div
                  className="position-absolute top-0 start-0 w-100 h-100"
                  style={{
                    background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.18) 50%)',
                    backgroundSize: '100% 4px',
                    pointerEvents: 'none'
                  }}
                />

                {/* Viewport Floating Info Hint */}
                <div
                  className="position-absolute bottom-0 start-0 end-0 p-2 d-flex justify-content-between align-items-center font-mono text-white-50"
                  style={{
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                    fontSize: '10px',
                    pointerEvents: 'none'
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-light">
                      Feed: <strong className="text-info">{modalActiveCam.camera_name || modalActiveCam.mount_position}</strong>
                    </span>
                    <span>•</span>
                    <span>Gateway: <code className="text-warning">{getStreamUrl(modalActiveCam) || modalActiveCam.rtsp_url}</code></span>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-end">
                    <span className="text-light">
                      💡 Scroll wheel to zoom • {zoomLevel > 1 ? 'Drag mouse to pan • ' : ''}Double-click to reset
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer: Live Telemetry & Quick Channel Selectors */}
              <div className="modal-footer bg-black bg-opacity-75 py-2 px-3 border-top border-secondary d-flex justify-content-between align-items-center flex-wrap gap-2">
                {/* Mobile Channel Switchers */}
                <div className="d-flex d-lg-none gap-1">
                  {cameras.map((c, idx) => (
                    <button
                      key={c.camera_id || idx}
                      type="button"
                      onClick={() => {
                        setPreviewCamIndex(idx);
                        handleResetZoom();
                      }}
                      className={`btn btn-sm py-1 px-2 font-mono fw-bold ${previewCamIndex === idx ? 'btn-primary' : 'btn-outline-secondary text-light'}`}
                      style={{ fontSize: '10px' }}
                    >
                      {c.mount_position}
                    </button>
                  ))}
                </div>

                {/* Telemetry info */}
                <div className="d-flex gap-3 font-mono text-light small flex-wrap" style={{ fontSize: '11px' }}>
                  <span>Vehicle: <strong className="text-white">{vehicle.vehicle_id}</strong></span>
                  <span>Speed: <strong className="text-primary">{vehicle.telemetry?.speed_kmph ?? (vehicle.speed_kmph || (vehicle.is_active ? 42.0 : 0.0))} km/h</strong></span>
                  <span>Battery: <strong className="text-success">{vehicle.telemetry?.battery_voltage ?? 13.2}V</strong></span>
                  <span>Jetson Temp: <strong className={(vehicle.telemetry?.jetson_temperature_c ?? 46) > 50 ? 'text-warning' : 'text-success'}>{vehicle.telemetry?.jetson_temperature_c ?? 46}°C</strong></span>
                  <span>LTE Signal: <strong className="text-info">{vehicle.telemetry?.network_signal_dbm ?? -65} dBm</strong></span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {getStreamUrl(modalActiveCam) && (
                    <a
                      href={getStreamUrl(modalActiveCam)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-success btn-sm px-3 no-underline d-inline-flex align-items-center gap-1"
                    >
                      Open Live (Port 7000) ↗
                    </a>
                  )}
                  <button
                    type="button"
                    className="btn btn-outline-light btn-sm px-3"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
