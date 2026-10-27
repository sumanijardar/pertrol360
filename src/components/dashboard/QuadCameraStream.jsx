import React, { useState, useEffect } from 'react';
import {
  IconZoomIn,
  IconZoomOut,
  IconMaximize2,
  IconRotateCcw,
  IconX,
  IconVideo
} from '../common/Icons';

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

  if (!vehicle) return null;

  const cameras = vehicle.cameras || [];
  const activeCam = cameras[activeCamIndex] || cameras[0];
  const modalActiveCam = cameras[previewCamIndex] || cameras[0];

  const camImages = {
    FRONT: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&auto=format&fit=crop&q=80',
    REAR: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
    LEFT: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
    RIGHT: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80'
  };

  // High-resolution image sources for modal preview
  const camImagesHD = {
    FRONT: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1600&auto=format&fit=crop&q=90',
    REAR: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1600&auto=format&fit=crop&q=90',
    LEFT: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1600&auto=format&fit=crop&q=90',
    RIGHT: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1600&auto=format&fit=crop&q=90'
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

  const renderSingleCamera = (cam, idx, isGrid) => {
    const isFront = cam.mount_position === 'FRONT';
    const isRear = cam.mount_position === 'REAR';
    const isSelected = activeCamIndex === idx;

    return (
      <div
        key={cam.camera_id}
        onClick={() => {
          if (isGrid) {
            setActiveCamIndex(idx);
            setIsQuadView(false);
          } else {
            openPreviewModal(idx);
          }
        }}
        className="position-relative w-100 rounded overflow-hidden shadow-sm camera-feed-box"
        style={{
          aspectRatio: '16/9',
          maxHeight: isGrid ? '142px' : '290px',
          backgroundColor: '#0f172a',
          border: `1.5px solid ${isSelected ? '#0d6efd' : '#334155'}`,
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        title={isGrid ? "Click to switch to Single Cam view" : "Click image to open Zoom preview modal"}
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

          <div className="d-flex align-items-center gap-1">
            <span className="bg-dark bg-opacity-75 text-success px-1 py-0 rounded">
              {cam.fps} FPS
            </span>
            <span className="bg-dark bg-opacity-75 text-info px-1 py-0 rounded d-none d-sm-inline">
              {cam.resolution}
            </span>
            {/* Quick Expand Icon button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openPreviewModal(idx);
              }}
              className="btn btn-dark btn-sm p-0 px-1 border-0 bg-opacity-75 text-white d-flex align-items-center"
              style={{ fontSize: '8px', height: '16px' }}
              title="Expand & Zoom Preview"
            >
              <IconMaximize2 size={10} />
            </button>
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
          <span className="text-truncate" style={{ maxWidth: '65%' }}>
            AI: {cam.ai_mode || 'YOLOv8 Realtime'}
          </span>
          <div className="d-flex align-items-center gap-1">
            <span className="text-info d-none d-sm-inline" style={{ fontSize: '7px' }}>
              🔍 Click to Zoom
            </span>
            <span className="text-success fw-bold">RTSP ● LIVE</span>
          </div>
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
                  </div>
                  <span className="badge bg-secondary-subtle text-light border border-secondary font-mono" style={{ fontSize: '11px' }}>
                    {vehicle.registration_number}
                  </span>
                  <span className="text-success font-mono small ms-1">
                    {modalActiveCam.fps} FPS
                  </span>
                  <span className="text-info font-mono small">
                    {modalActiveCam.resolution}
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
                        key={c.camera_id}
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

              {/* Modal Body: Interactive Zoomable Image Viewport */}
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
                {/* Image Container with Scaled & Translated Transform */}
                <div
                  className="w-100 h-100 d-flex justify-content-center align-items-center position-relative"
                  style={{
                    transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
                  }}
                >
                  <img
                    src={camImagesHD[modalActiveCam.mount_position] || camImagesHD.FRONT}
                    alt={modalActiveCam.camera_id}
                    className="rounded shadow"
                    style={{
                      maxWidth: '92%',
                      maxHeight: '92%',
                      objectFit: 'contain',
                      pointerEvents: 'none'
                    }}
                  />

                  {/* Dynamic AI Detection Annotations in Modal */}
                  {modalActiveCam.mount_position === 'FRONT' && (
                    <div
                      className="position-absolute"
                      style={{
                        top: '38%',
                        left: '28%',
                        width: '44%',
                        height: '38%',
                        border: '2.5px solid #ef4444',
                        borderRadius: '3px',
                        zIndex: 3,
                        pointerEvents: 'none',
                        animation: 'pulseGlow 2s infinite ease-in-out'
                      }}
                    >
                      <div
                        className="position-absolute bg-danger text-white font-mono fw-bold px-2 py-0.5"
                        style={{
                          top: '-22px',
                          left: '-1px',
                          fontSize: '11px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        STOLEN VEHICLE: GJ01AB1234 (Confidence: 99.4%)
                      </div>
                    </div>
                  )}

                  {modalActiveCam.mount_position === 'REAR' && (
                    <div
                      className="position-absolute"
                      style={{
                        top: '32%',
                        left: '42%',
                        width: '32%',
                        height: '34%',
                        border: '2px solid #10b981',
                        borderRadius: '3px',
                        zIndex: 3,
                        pointerEvents: 'none'
                      }}
                    >
                      <div
                        className="position-absolute bg-success text-white font-mono px-2 py-0.5"
                        style={{
                          top: '-20px',
                          left: '-1px',
                          fontSize: '10px'
                        }}
                      >
                        PLATE DETECTED: GJ01EF8899 (Confidence: 98.7%)
                      </div>
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
                      AI Pipeline: <strong className="text-info">{modalActiveCam.ai_mode || 'YOLOv8 Edge Realtime'}</strong>
                    </span>
                    <span>•</span>
                    <span>RTSP Stream: <code className="text-warning">rtsp://192.168.1.100:8554/{modalActiveCam.camera_id.toLowerCase()}</code></span>
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
                      key={c.camera_id}
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
                  <span>Speed: <strong className="text-primary">{vehicle.telemetry.speed_kmph} km/h</strong></span>
                  <span>Battery: <strong className="text-success">{vehicle.telemetry.battery_voltage}V</strong></span>
                  <span>Jetson Temp: <strong className={vehicle.telemetry.jetson_temperature_c > 50 ? 'text-warning' : 'text-success'}>{vehicle.telemetry.jetson_temperature_c}°C</strong></span>
                  <span>LTE Signal: <strong className="text-info">{vehicle.telemetry.network_signal_dbm} dBm</strong></span>
                </div>

                <div className="d-flex align-items-center gap-2">
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

