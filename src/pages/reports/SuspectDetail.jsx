import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast, Swal } from '../../components/common/Toast';
import { WANTED_SUSPECTS } from '../../data/mockData';
import {
    IconShieldAlert,
    IconSearch,
    IconCheckCircle,
    IconDownload,
    IconAlertTriangle,
    IconCar,
    IconUsers,
    IconCrosshair
} from '../../components/common/Icons';

export default function SuspectDetail() {
    const { suspectId } = useParams();
    const navigate = useNavigate();

    const [suspect, setSuspect] = useState(null);
    const [status, setStatus] = useState('WANTED');
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    useEffect(() => {
        const found = WANTED_SUSPECTS.find(
            s => s.suspect_id.toLowerCase() === (suspectId || '').toLowerCase()
        );
        if (found) {
            setSuspect(found);
            setStatus(found.status);
        }
    }, [suspectId]);

    if (!suspect) {
        return (
            <div className="container-fluid px-3 py-4">
                <div className="card shadow-sm border-0 p-5 text-center">
                    <div className="mb-3 text-danger">
                        <IconShieldAlert size={48} />
                    </div>
                    <h4 className="fw-bold text-dark">Suspect Record Not Found</h4>
                    <p className="text-muted small mb-4">
                        No criminal dossier matches ID: <code className="fw-bold">{suspectId}</code>
                    </p>
                    <div>
                        <button
                            type="button"
                            className="btn btn-primary btn-sm px-4 py-2 fw-semibold"
                            onClick={() => navigate('/reports/wanted-suspects')}
                        >
                            ← Back to Wanted Suspects List
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Toggle Apprehension Status
    const handleToggleStatus = () => {
        const newStatus = status === 'WANTED' ? 'APPREHENDED' : 'WANTED';
        setStatus(newStatus);
        Swal.fire({
            title: newStatus === 'APPREHENDED' ? 'Marked In Custody' : 'Restored to Wanted Watchlist',
            text: `Suspect ${suspect.full_name} (${suspect.suspect_id}) status updated to ${newStatus}.`,
            icon: newStatus === 'APPREHENDED' ? 'success' : 'warning',
            timer: 2000,
            showConfirmButton: false
        });
    };

    // Broadcast Alert to Patrol Units
    const handleBroadcastAlert = () => {
        setIsBroadcasting(true);
        setTimeout(() => {
            setIsBroadcasting(false);
            Swal.fire({
                title: 'Broadcast Dispatched!',
                html: `Active Interception Alert for <b>${suspect.full_name}</b> sent to <b>12 active Patrol Vans</b> and <b>4 Highway Toll ANPR stations</b>.`,
                icon: 'success',
                confirmButtonColor: '#dc3545'
            });
        }, 1000);
    };

    // Print Warrant Dossier
    const handlePrintDossier = () => {
        window.print();
    };

    const isWanted = status === 'WANTED';

    return (
        <div className="container-fluid px-3 py-3 mb-4 suspect-detail-page">

            {/* TOP HEADER & BREADCRUMBS */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/reports/wanted-suspects')}
                        className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1 shadow-sm px-2.5 py-1.5"
                        style={{ fontSize: '12px' }}
                    >
                        <span>←</span>
                        <span>Back to Wanted List</span>
                    </button>
                    <span className="text-muted">/</span>
                    <span className="badge bg-danger-subtle text-danger border border-danger-subtle font-mono fw-bold">
                        {suspect.suspect_id}
                    </span>
                    <span className="fw-bold text-dark small">{suspect.full_name}</span>
                </div>

                {/* Quick Action Buttons */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                    <button
                        type="button"
                        onClick={handleToggleStatus}
                        className={`btn btn-sm fw-bold shadow-sm d-inline-flex align-items-center gap-1.5 ${isWanted ? 'btn-success' : 'btn-danger'
                            }`}
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                        <IconCheckCircle size={14} />
                        <span>{isWanted ? 'Mark In Custody' : 'Mark as Wanted'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleBroadcastAlert}
                        disabled={isBroadcasting}
                        className="btn btn-outline-danger btn-sm fw-semibold shadow-sm d-inline-flex align-items-center gap-1.5"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                        <IconCrosshair size={14} />
                        <span>{isBroadcasting ? 'Broadcasting...' : 'Broadcast Interception Alert'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handlePrintDossier}
                        className="btn btn-dark btn-sm fw-semibold shadow-sm d-inline-flex align-items-center gap-1.5"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                        <IconDownload size={14} />
                        <span>Print Dossier</span>
                    </button>
                </div>
            </div>

            {/* HERO STATUS BANNER */}
            <div
                className="p-3 p-md-4 rounded-3 shadow-sm mb-3 text-white position-relative overflow-hidden"
                style={{
                    background: isWanted
                        ? 'linear-gradient(135deg, #7f1d1d 0%, #1e1b4b 60%, #0f172a 100%)'
                        : 'linear-gradient(135deg, #14532d 0%, #064e3b 60%, #0f172a 100%)',
                    border: isWanted ? '1px solid #991b1b' : '1px solid #166534'
                }}
            >
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <div
                            className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold shadow"
                            style={{
                                width: '56px',
                                height: '56px',
                                backgroundColor: isWanted ? '#dc3545' : '#16a34a',
                                fontSize: '24px'
                            }}
                        >
                            <IconShieldAlert size={32} />
                        </div>
                        <div>
                            <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                                <h1 className="h4 fw-bold text-white mb-0">{suspect.full_name}</h1>
                                {suspect.alias && (
                                    <span className="badge bg-warning text-dark fw-bold" style={{ fontSize: '11px' }}>
                                        Alias: {suspect.alias}
                                    </span>
                                )}
                                <span
                                    className={`badge fw-bold shadow-sm ${isWanted ? 'bg-danger text-white' : 'bg-success text-white'
                                        }`}
                                    style={{ fontSize: '11px', letterSpacing: '0.04em' }}
                                >
                                    ● {isWanted ? 'ACTIVE WANTED / AT LARGE' : 'IN POLICE CUSTODY'}
                                </span>
                            </div>
                            <div className="d-flex align-items-center gap-3 flex-wrap text-slate-300 small" style={{ color: '#cbd5e1', fontSize: '12px' }}>
                                <span><strong>FIR:</strong> {suspect.fir_number}</span>
                                <span>•</span>
                                <span><strong>Jurisdiction:</strong> {suspect.wanted_by_station}</span>
                                <span>•</span>
                                <span><strong>Offense:</strong> {suspect.crime_category}</span>
                            </div>
                        </div>
                    </div>

                    {/* Threat & Bounty Seal */}
                    <div className="d-flex align-items-center gap-2">
                        {suspect.bounty_reward && suspect.bounty_reward !== 'None' && (
                            <div
                                className="px-3 py-2 rounded-3 text-center border shadow-sm"
                                style={{ backgroundColor: 'rgba(254, 240, 138, 0.15)', borderColor: '#eab308' }}
                            >
                                <div className="text-warning small text-uppercase fw-bold" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                                    Authorized Bounty
                                </div>
                                <div className="text-white fw-bold fs-5 font-mono">
                                    💰 {suspect.bounty_reward}
                                </div>
                            </div>
                        )}
                        <div
                            className="px-3 py-2 rounded-3 text-center border shadow-sm"
                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444' }}
                        >
                            <div className="text-danger-subtle small text-uppercase fw-bold" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                                Threat Assessment
                            </div>
                            <div className="text-white fw-bold fs-5">
                                {suspect.threat_level}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="row g-3">

                {/* LEFT COLUMN: Suspect Photo & Biometric Details */}
                <div className="col-12 col-lg-4 col-xl-3">

                    {/* Suspect Photo Card with FRS Overlay */}
                    <div className="card shadow-sm border-0 mb-3 overflow-hidden">
                        <div className="card-header bg-dark text-white py-2 px-3 d-flex justify-content-between align-items-center">
                            <span className="small fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
                                Biometric FRS Dossier
                            </span>
                            <span className="badge bg-danger text-white font-mono" style={{ fontSize: '10px' }}>
                                {suspect.suspect_id}
                            </span>
                        </div>

                        <div className="position-relative bg-dark text-center p-2">
                            <div
                                className="position-relative rounded-2 overflow-hidden mx-auto shadow"
                                style={{
                                    maxWidth: '280px',
                                    height: '320px',
                                    border: '2px solid rgba(239, 68, 68, 0.6)'
                                }}
                            >
                                <img
                                    src={suspect.photo_url}
                                    alt={suspect.full_name}
                                    className="w-100 h-100"
                                    style={{ objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';
                                    }}
                                />

                                {/* High-Tech Facial Recognition HUD Box Overlay */}
                                <div
                                    className="position-absolute"
                                    style={{
                                        top: '15%',
                                        left: '20%',
                                        right: '20%',
                                        bottom: '25%',
                                        border: '2px dashed #22c55e',
                                        borderRadius: '8px',
                                        boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)',
                                        pointerEvents: 'none'
                                    }}
                                >
                                    <div
                                        className="position-absolute top-0 start-0 bg-success text-white px-1.5 py-0.5 rounded-bottom font-mono fw-bold"
                                        style={{ fontSize: '9px', letterSpacing: '0.05em' }}
                                    >
                                        FRS MATCH: {suspect.biometric_confidence || '98.4%'}
                                    </div>
                                </div>

                                {/* Watermark Threat Badge */}
                                <div
                                    className="position-absolute bottom-0 start-0 end-0 py-1 text-center fw-bold font-mono text-white"
                                    style={{
                                        backgroundColor: isWanted ? 'rgba(220, 53, 69, 0.88)' : 'rgba(22, 163, 74, 0.88)',
                                        fontSize: '11px',
                                        letterSpacing: '0.08em'
                                    }}
                                >
                                    {isWanted ? '● WANTED BY POLICE' : '● SECURED IN CUSTODY'}
                                </div>
                            </div>
                        </div>

                        <div className="card-body p-3 bg-light border-top">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted small fw-semibold">Biometric Confidence:</span>
                                <span className="badge bg-success-subtle text-success border border-success-subtle font-mono fw-bold">
                                    {suspect.biometric_confidence || '98.4% Match'}
                                </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted small fw-semibold">First Sighted / Added:</span>
                                <span className="text-dark small fw-semibold font-mono">
                                    {suspect.reported_date || '2026-10-18'}
                                </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted small fw-semibold">Aadhaar Token Ref:</span>
                                <span className="text-secondary small font-mono fw-bold">
                                    {suspect.aadhaar_ref || 'XXXX-XXXX-4912'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Physical Attributes Card */}
                    {/* <div className="card shadow-sm border-0 mb-3">
                        <div className="card-header bg-white py-2 px-3 border-bottom">
                            <div className="fw-bold text-dark small text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.04em' }}>
                                Physical Identification
                            </div>
                        </div>
                        <div className="card-body p-3">
                            <div className="row g-2 text-center mb-3">
                                <div className="col-4">
                                    <div className="p-2 bg-light rounded border">
                                        <div className="text-muted small" style={{ fontSize: '10.5px' }}>Age</div>
                                        <div className="fw-bold text-dark fs-6">{suspect.age || '34'} Yrs</div>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="p-2 bg-light rounded border">
                                        <div className="text-muted small" style={{ fontSize: '10.5px' }}>Gender</div>
                                        <div className="fw-bold text-dark fs-6">{suspect.gender || 'Male'}</div>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="p-2 bg-light rounded border">
                                        <div className="text-muted small" style={{ fontSize: '10.5px' }}>Blood Group</div>
                                        <div className="fw-bold text-danger fs-6">{suspect.blood_group || 'B+'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-2">
                                <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>Approx Height</div>
                                <div className="text-dark fw-bold small">{suspect.height || "5' 10\" (178 cm)"}</div>
                            </div>

                            <div className="mb-0">
                                <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>Identifying Marks & Scars</div>
                                <div className="p-2 bg-warning-subtle text-dark rounded border border-warning-subtle small fw-semibold mt-1" style={{ fontSize: '11.5px', lineHeight: '1.4' }}>
                                    {suspect.identifying_marks || 'Scar on right cheek; tattoo on arm.'}
                                </div>
                            </div>
                        </div>
                    </div> */}

                    {/* Linked Patrol Vehicle */}
                    {/* <div className="card shadow-sm border-0 mb-3">
                        <div className="card-header bg-white py-2 px-3 border-bottom d-flex align-items-center gap-1.5">
                            <IconCar size={15} />
                            <span className="fw-bold text-dark small text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.04em' }}>
                                Associated Vehicle (ANPR)
                            </span>
                        </div>
                        <div className="card-body p-3">
                            {suspect.associated_vehicle ? (
                                <div>
                                    <div className="ind-number-plate mb-2" style={{ height: '32px' }}>
                                        <span className="ind-flag">IND</span>
                                        <span style={{ fontSize: '14px', letterSpacing: '0.08em' }}>{suspect.associated_vehicle}</span>
                                    </div>
                                    <div className="fw-semibold text-dark small">
                                        {suspect.associated_vehicle_desc || 'Vehicle Details Recorded'}
                                    </div>
                                    <div className="text-muted small mt-1" style={{ fontSize: '11px' }}>
                                        Tracked via Patrol 360 AI license plate recognition engine.
                                    </div>
                                </div>
                            ) : (
                                <div className="text-muted small">No vehicle registered with suspect.</div>
                            )}
                        </div>
                    </div> */}

                </div>

                {/* RIGHT COLUMN: Full Address, Criminal Case Details, Intelligence Log */}
                <div className="col-12 col-lg-8 col-xl-9">

                    {/* 1. RESIDENTIAL ADDRESS & LOCATION INTELLIGENCE (Requested by user) */}
                    <div className="card shadow-sm border-0 mb-3">
                        <div className="card-header bg-white py-2 px-3 border-bottom d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <span className="p-1.5 bg-danger-subtle text-danger rounded">
                                    📍
                                </span>
                                <span className="fw-bold text-dark small text-uppercase" style={{ fontSize: '12px', letterSpacing: '0.04em' }}>
                                    Residential Address & Location Intelligence
                                </span>
                            </div>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-mono" style={{ fontSize: '11px' }}>
                                GEOLOCATION VERIFIED
                            </span>
                        </div>
                        <div className="card-body p-3">
                            <div className="row g-3">
                                {/* Permanent Address */}
                                <div className="col-12 col-md-6">
                                    <div className="p-3 bg-light rounded border h-100">
                                        <div className="d-flex align-items-center gap-1.5 mb-1.5">
                                            <span className="text-primary fw-bold" style={{ fontSize: '14px' }}>🏠</span>
                                            <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px' }}>
                                                Permanent Residential Address
                                            </span>
                                        </div>
                                        <div className="fw-bold text-dark" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                                            {suspect.permanent_address || 'Address registered with police station.'}
                                        </div>
                                        <div className="mt-2 text-muted small" style={{ fontSize: '11px' }}>
                                            <strong>Father / Guardian:</strong> {suspect.father_name || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {/* Current / Last Known Residence */}
                                <div className="col-12 col-md-6">
                                    <div className="p-3 bg-light rounded border h-100">
                                        <div className="d-flex align-items-center gap-1.5 mb-1.5">
                                            <span className="text-danger fw-bold" style={{ fontSize: '14px' }}>🚩</span>
                                            <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px' }}>
                                                Current Residence / Hideout Sighting
                                            </span>
                                        </div>
                                        <div className="fw-bold text-dark" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                                            {suspect.current_address || 'Last verified residential coordinates.'}
                                        </div>
                                        <div className="mt-2 text-muted small" style={{ fontSize: '11px' }}>
                                            <strong>Recent Sighting:</strong> <span className="text-danger fw-bold">{suspect.last_seen}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Surveillance Geofence Alert Bar */}
                            <div className="mt-3 p-2.5 rounded bg-danger-subtle border border-danger-subtle d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="spinner-grow spinner-grow-sm text-danger" role="status" style={{ width: '8px', height: '8px' }}></span>
                                    <span className="small text-danger fw-bold">
                                        Live Geofence Surveillance Active around {suspect.last_seen}
                                    </span>
                                </div>
                                <span className="text-secondary small font-mono fw-semibold" style={{ fontSize: '11px' }}>
                                    Patrol Van Units Monitoring 5km Radius
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 2. CRIMINAL OFFENSE & LEGAL CHARGES */}
                    {/* <div className="card shadow-sm border-0 mb-3">
                        <div className="card-header bg-white py-2 px-3 border-bottom d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <span className="p-1.5 bg-secondary-subtle text-secondary rounded">
                                    ⚖️
                                </span>
                                <span className="fw-bold text-dark small text-uppercase" style={{ fontSize: '12px', letterSpacing: '0.04em' }}>
                                    Criminal Charges, FIR & Legal Warrant Details
                                </span>
                            </div>
                            <span className="badge bg-danger text-white font-mono" style={{ fontSize: '11px' }}>
                                {suspect.threat_level} PRIORITY
                            </span>
                        </div>
                        <div className="card-body p-3">
                            <div className="row g-3">
                                <div className="col-12 col-md-4">
                                    <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>Primary Offense / Category</div>
                                    <div className="fw-bold text-dark mt-1" style={{ fontSize: '13.5px' }}>
                                        {suspect.crime_category}
                                    </div>
                                </div>

                                <div className="col-12 col-md-4">
                                    <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>FIR Registration Number</div>
                                    <div className="fw-bold font-mono text-danger mt-1" style={{ fontSize: '13px' }}>
                                        {suspect.fir_number}
                                    </div>
                                </div>

                                <div className="col-12 col-md-4">
                                    <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>Originating Police Station</div>
                                    <div className="fw-bold text-dark mt-1" style={{ fontSize: '13px' }}>
                                        {suspect.wanted_by_station}
                                    </div>
                                </div>

                                <div className="col-12 col-md-6">
                                    <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>Charged Under Sections (BNS / IPC / Arms Act)</div>
                                    <div className="p-2 bg-light rounded border text-danger fw-semibold mt-1" style={{ fontSize: '12px' }}>
                                        {suspect.ipc_sections || 'BNS Sec 307, 392, Arms Act Sec 25/27'}
                                    </div>
                                </div>

                                <div className="col-12 col-md-6">
                                    <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>Investigating Officer (IO)</div>
                                    <div className="p-2 bg-light rounded border text-dark fw-semibold mt-1" style={{ fontSize: '12px' }}>
                                        {suspect.investigating_officer || 'Inspector In-Charge'}
                                    </div>
                                </div>

                                <div className="col-12 col-md-6">
                                    <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>Issuing Magistrate Court</div>
                                    <div className="text-dark fw-bold small mt-1">
                                        {suspect.court_name || 'Metropolitan Magistrate Court, Ahmedabad'}
                                    </div>
                                </div>

                                <div className="col-12 col-md-6">
                                    <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>Warrant Execution Order Date</div>
                                    <div className="text-dark fw-bold small font-mono mt-1">
                                        {suspect.warrant_issue_date || '2026-10-10'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}

                    {/* 3. RECENT SURVEILLANCE & PATROL SIGHTINGS LOG */}
                    {/* <div className="card shadow-sm border-0 mb-3">
                        <div className="card-header bg-white py-2 px-3 border-bottom d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <span className="p-1.5 bg-primary-subtle text-primary rounded">
                                    📡
                                </span>
                                <span className="fw-bold text-dark small text-uppercase" style={{ fontSize: '12px', letterSpacing: '0.04em' }}>
                                    Patrol 360 AI Camera Sightings & Logs
                                </span>
                            </div>
                            <span className="small text-muted">Last ping: 14 mins ago</span>
                        </div>
                        <div className="card-body p-3">
                            <div className="list-group list-group-flush">
                                <div className="list-group-item px-0 py-2.5 border-bottom d-flex justify-content-between align-items-start">
                                    <div>
                                        <div className="fw-bold text-dark small">
                                            Patrol Van 01 (Front Camera) - Facial Recognition Trigger
                                        </div>
                                        <div className="text-muted small" style={{ fontSize: '11.5px' }}>
                                            Location: Near {suspect.last_seen} • Vehicle {suspect.associated_vehicle || 'On Foot'}
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle font-mono" style={{ fontSize: '10.5px' }}>
                                            Confidence {suspect.biometric_confidence || '98.6%'}
                                        </span>
                                        <div className="text-muted small font-mono mt-0.5" style={{ fontSize: '10px' }}>
                                            Today, 15:42 IST
                                        </div>
                                    </div>
                                </div>

                                <div className="list-group-item px-0 py-2.5 border-bottom d-flex justify-content-between align-items-start">
                                    <div>
                                        <div className="fw-bold text-dark small">
                                            Highway Toll ANPR Camera 03 - Number Plate Match
                                        </div>
                                        <div className="text-muted small" style={{ fontSize: '11.5px' }}>
                                            Location: SP Ring Road Junction • Heading towards Sanand
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <span className="badge bg-warning-subtle text-dark border border-warning-subtle font-mono" style={{ fontSize: '10.5px' }}>
                                            ANPR Sighted
                                        </span>
                                        <div className="text-muted small font-mono mt-0.5" style={{ fontSize: '10px' }}>
                                            Yesterday, 19:10 IST
                                        </div>
                                    </div>
                                </div>

                                <div className="list-group-item px-0 py-2.5 d-flex justify-content-between align-items-start">
                                    <div>
                                        <div className="fw-bold text-dark small">
                                            Police Control Room - FIR Look Out Circular (LOC) Logged
                                        </div>
                                        <div className="text-muted small" style={{ fontSize: '11.5px' }}>
                                            Registered by {suspect.wanted_by_station} under {suspect.fir_number}
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <span className="badge bg-success-subtle text-success border border-success-subtle font-mono" style={{ fontSize: '10.5px' }}>
                                            Warrant Active
                                        </span>
                                        <div className="text-muted small font-mono mt-0.5" style={{ fontSize: '10px' }}>
                                            {suspect.reported_date}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}

                </div>
            </div>

        </div>
    );
}
