import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { WANTED_SUSPECTS } from '../../data/mockData';
import {
    IconShieldAlert,
    IconSearch,
    IconCheckCircle,
    IconDownload,
    IconAlertTriangle,
    IconCar,
    IconUsers
} from '../../components/common/Icons';
import Pagination from '../../components/common/Pagination';
import ExportExcelButton from '../../components/common/ExportExcelButton';
import { exportToExcel } from '../../utils/excelExport';

/**
 * =========================================================================
 * DYNAMIC WANTED SUSPECTS TABLE COLUMNS CONFIGURATION (API-READY)
 * =========================================================================
 * Used for dynamic table rendering, Excel export, and CSV template mapping.
 */
export const SUSPECT_COLUMNS = [
    {
        key: 'index',
        label: '#',
        width: '44px',
        align: 'center',
        render: (_row, _idx, rowIndex) => (
            <span className="text-muted fw-semibold" style={{ fontSize: '12.5px' }}>
                {rowIndex}
            </span>
        )
    },
    {
        key: 'photo_url',
        label: 'Images',
        width: '68px',
        align: 'center',
        render: (row) => (
            <Link
                to={`/reports/wanted-suspects/${row.suspect_id}`}
                className="d-inline-block text-decoration-none"
                title={`Click to view ${row.full_name}'s full profile dossier & address`}
            >
                <div
                    className="position-relative rounded-circle overflow-hidden shadow-sm"
                    style={{
                        width: '42px',
                        height: '42px',
                        border: '2px solid #ef4444',
                        backgroundColor: '#f1f5f9',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.12)';
                        e.currentTarget.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.45)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '';
                    }}
                >
                    <img
                        src={row.photo_url}
                        alt={row.full_name}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';
                        }}
                    />
                </div>
            </Link>
        )
    },
    {
        key: 'full_name',
        label: 'Suspect Name & Alias',
        align: 'left',
        render: (row) => (
            <div>
                <Link
                    to={`/reports/wanted-suspects/${row.suspect_id}`}
                    className="fw-bold text-dark text-decoration-none"
                    style={{ fontSize: '13px' }}
                    title="Click to view full criminal dossier"
                >
                    {row.full_name}
                </Link>
                <div className="d-flex align-items-center gap-1.5 mt-0.5">
                    <span className="badge bg-danger-subtle text-danger border border-danger-subtle font-mono fw-bold" style={{ fontSize: '10px', padding: '1px 5px' }}>
                        {row.suspect_id}
                    </span>
                    {row.alias && (
                        <span className="text-muted small" style={{ fontSize: '11px' }}>
                            Alias: <strong className="text-secondary">{row.alias}</strong>
                        </span>
                    )}
                </div>
            </div>
        )
    },
    {
        key: 'crime_category',
        label: 'Offense & FIR',
        align: 'left',
        render: (row) => (
            <div>
                <div className="fw-semibold text-dark" style={{ fontSize: '12.5px' }}>
                    {row.crime_category}
                </div>
                <div className="font-mono text-muted small" style={{ fontSize: '11px' }}>
                    {row.fir_number}
                </div>
            </div>
        )
    },
    {
        key: 'threat_level',
        label: 'Threat Level',
        align: 'left',
        render: (row) => {
            let bg = '#fee2e2';
            let color = '#991b1b';
            let border = '#fca5a5';

            if (row.threat_level === 'HIGH') {
                bg = '#ffedd5';
                color = '#9a3412';
                border = '#fed7aa';
            } else if (row.threat_level === 'MODERATE') {
                bg = '#fef9c3';
                color = '#854d0e';
                border = '#fef08a';
            }

            return (
                <span
                    className="badge fw-bold"
                    style={{
                        backgroundColor: bg,
                        color: color,
                        border: `1px solid ${border}`,
                        fontSize: '11px',
                        padding: '4px 8px'
                    }}
                >
                    ● {row.threat_level}
                </span>
            );
        }
    },
    {
        key: 'wanted_by_station',
        label: 'Wanted By Station',
        align: 'left',
        render: (row) => (
            <span className="text-secondary fw-semibold" style={{ fontSize: '12px' }}>
                {row.wanted_by_station}
            </span>
        )
    },
    {
        key: 'bounty_reward',
        label: 'Bounty Reward',
        align: 'left',
        render: (row) => (
            row.bounty_reward && row.bounty_reward !== 'None' ? (
                <span className="badge bg-success-subtle text-success border border-success-subtle font-mono fw-bold" style={{ fontSize: '11px' }}>
                    💰 {row.bounty_reward}
                </span>
            ) : (
                <span className="text-muted small" style={{ fontSize: '11px' }}>None</span>
            )
        )
    },
    {
        key: 'associated_vehicle',
        label: 'Linked Vehicle',
        align: 'left',
        render: (row) => (
            row.associated_vehicle ? (
                <div>
                    <div className="ind-number-plate d-inline-flex align-middle" style={{ height: '26px', padding: '1px 6px' }}>
                        <span className="ind-flag" style={{ fontSize: '7.5px' }}>IND</span>
                        <span style={{ fontSize: '11px' }}>{row.associated_vehicle}</span>
                    </div>
                    {row.associated_vehicle_desc && (
                        <div className="text-muted small mt-0.5" style={{ fontSize: '10.5px' }}>
                            {row.associated_vehicle_desc}
                        </div>
                    )}
                </div>
            ) : (
                <span className="text-muted small" style={{ fontSize: '11px' }}>None</span>
            )
        )
    },
    {
        key: 'last_seen',
        label: 'Last Known Location',
        align: 'left',
        render: (row) => (
            <div className="d-flex align-items-center gap-1 text-secondary small" style={{ fontSize: '11.5px' }}>
                <span>📍</span>
                <span className="text-truncate" style={{ maxWidth: '160px' }} title={row.last_seen}>
                    {row.last_seen}
                </span>
            </div>
        )
    },
    {
        key: 'status',
        label: 'Status',
        width: '120px',
        align: 'center',
        render: (row, _idx, _rowIndex, actions) => (
            <button
                onClick={() => actions.onToggleStatus(row.suspect_id)}
                className="btn btn-link p-0 text-decoration-none border-0 shadow-none"
                title="Click to toggle apprehension status"
                style={{ cursor: 'pointer' }}
            >
                {row.status === 'WANTED' ? (
                    <span
                        className="badge rounded-pill shadow-sm"
                        style={{
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '5px 14px',
                            letterSpacing: '0.02em',
                            display: 'inline-block'
                        }}
                    >
                        ● WANTED
                    </span>
                ) : (
                    <span
                        className="badge rounded-pill shadow-sm"
                        style={{
                            backgroundColor: '#22c55e',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '5px 14px',
                            letterSpacing: '0.02em',
                            display: 'inline-block'
                        }}
                    >
                        ● IN CUSTODY
                    </span>
                )}
            </button>
        )
    },
    // {
    //     key: 'actions',
    //     label: 'Actions',
    //     width: '95px',
    //     align: 'center',
    //     render: (row, _idx, _rowIndex, actions) => (
    //         <div className="d-inline-flex align-items-center justify-content-center gap-1.5">
    //             {/* Open Dedicated Profile Page Link */}
    //             {/* <Link
    //                 to={`/reports/wanted-suspects/${row.suspect_id}`}
    //                 className="btn btn-sm p-0 shadow-sm"
    //                 title="Open Dedicated Suspect Page"
    //                 style={{
    //                     width: '28px',
    //                     height: '28px',
    //                     borderRadius: '6px',
    //                     backgroundColor: '#dc3545',
    //                     color: '#ffffff',
    //                     display: 'inline-flex',
    //                     alignItems: 'center',
    //                     justifyContent: 'center',
    //                     textDecoration: 'none'
    //                 }}
    //             >
    //                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    //                     <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    //                     <polyline points="15 3 21 3 21 9" />
    //                     <line x1="10" y1="14" x2="21" y2="3" />
    //                 </svg>
    //             </Link> */}

    //             {/* View Dossier Modal Button */}
    //             {/* <button
    //                 type="button"
    //                 className="btn btn-sm p-0 shadow-sm"
    //                 title="Quick Dossier Preview"
    //                 onClick={() => (actions && actions.onView ? actions.onView(row) : null)}
    //                 style={{
    //                     width: '28px',
    //                     height: '28px',
    //                     borderRadius: '6px',
    //                     backgroundColor: '#0284c7',
    //                     color: '#ffffff',
    //                     border: 'none',
    //                     display: 'inline-flex',
    //                     alignItems: 'center',
    //                     justifyContent: 'center'
    //                 }}
    //             >
    //                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    //                     <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    //                     <circle cx="12" cy="12" r="3" />
    //                 </svg>
    //             </button> */}
    //         </div>
    //     )
    // }
];

export default function WantedSuspectList() {
    const [suspects, setSuspects] = useState(WANTED_SUSPECTS);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    // Search & Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [stationFilter, setStationFilter] = useState('ALL');
    const [threatFilter, setThreatFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    // Modal State for Dossier Inspection
    const [selectedSuspect, setSelectedSuspect] = useState(null);
    const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

    // Hidden File Input Ref for Excel/CSV Import
    const fileInputRef = useRef(null);

    // -------------------------------------------------------------------------
    // API INTEGRATION HANDLER
    // -------------------------------------------------------------------------
    const fetchSuspectsApi = async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            // Backend API call template:
            // const res = await axios.get('/api/reports/wanted-suspects');
            // setSuspects(res.data);
            setSuspects(WANTED_SUSPECTS);
        } catch (err) {
            console.error('API Error:', err);
            setApiError('Failed to fetch wanted suspects list from server');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSuspectsApi();
    }, []);

    // Reset to page 1 on filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, stationFilter, threatFilter, statusFilter]);

    // Excel Columns Config - Explicitly defined with complete address & identity
    const suspectExcelColumns = [
        { key: 'suspect_id', label: 'Suspect ID' },
        { key: 'full_name', label: 'Full Name' },
        { key: 'alias', label: 'Alias' },
        { key: 'crime_category', label: 'Offense' },
        { key: 'fir_number', label: 'FIR Number' },
        { key: 'threat_level', label: 'Threat Level' },
        { key: 'wanted_by_station', label: 'Wanted By Station' },
        { key: 'bounty_reward', label: 'Bounty' },
        { key: 'associated_vehicle', label: 'Vehicle Plate' },
        { key: 'permanent_address', label: 'Permanent Address' },
        { key: 'current_address', label: 'Current Address' },
        { key: 'last_seen', label: 'Last Known Location' },
        { key: 'status', label: 'Status' }
    ];

    // -------------------------------------------------------------------------
    // EXCEL / CSV IMPORT HANDLER
    // -------------------------------------------------------------------------
    const handleImportFile = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');

                if (lines.length < 2) {
                    Swal.fire('Import Error', 'The selected file is empty or missing data rows.', 'error');
                    return;
                }

                // Parse CSV headers
                const rawHeaders = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());

                // Parse rows
                const importedRecords = [];
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').trim());
                    if (values.length < 2) continue;

                    // Map CSV columns to suspect record
                    const record = {
                        suspect_id: values[0] || `SUS-2026-${Math.floor(100 + Math.random() * 900)}`,
                        full_name: values[1] || 'Unknown Suspect',
                        alias: values[2] || '',
                        crime_category: values[3] || 'General Offense',
                        fir_number: values[4] || `FIR-2026-GEN-${Math.floor(1000 + Math.random() * 9000)}`,
                        threat_level: (values[5] || 'MODERATE').toUpperCase(),
                        wanted_by_station: values[6] || 'Crime Branch HQ',
                        bounty_reward: values[7] || 'None',
                        associated_vehicle: values[8] || '',
                        associated_vehicle_desc: values[9] || '',
                        last_seen: values[10] || 'Unknown Location',
                        status: (values[11] || 'WANTED').toUpperCase()
                    };

                    importedRecords.push(record);
                }

                if (importedRecords.length > 0) {
                    setSuspects(prev => [...importedRecords, ...prev]);
                    Swal.fire({
                        title: 'Import Successful!',
                        text: `Successfully imported ${importedRecords.length} suspect records into the active watchlist.`,
                        icon: 'success',
                        confirmButtonColor: '#0d6efd'
                    });
                } else {
                    Swal.fire('No Records Found', 'Could not parse any valid records from the file.', 'warning');
                }
            } catch (err) {
                console.error('File parsing error:', err);
                Swal.fire('Import Error', 'Failed to parse file. Please verify CSV/Excel formatting.', 'error');
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };

        reader.readAsText(file);
    };

    // Download Sample CSV / Excel Template
    const handleDownloadTemplate = () => {
        const sampleData = [
            {
                suspect_id: 'SUS-2026-SAMPLE',
                full_name: 'Sample Suspect Name',
                alias: 'Sample Alias',
                crime_category: 'Armed Robbery',
                fir_number: 'FIR-2026-SAMPLE-01',
                threat_level: 'CRITICAL',
                wanted_by_station: 'Navrangpura Police Station',
                bounty_reward: '₹50,000',
                associated_vehicle: 'GJ01AB9999',
                associated_vehicle_desc: 'Black SUV',
                last_seen: 'SG Highway',
                status: 'WANTED'
            }
        ];
        exportToExcel(sampleData, 'Wanted_Suspects_Import_Template', suspectExcelColumns);
    };

    // Filtered Suspects List
    const filteredSuspects = suspects.filter(s => {
        const matchesSearch =
            s.suspect_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.alias && s.alias.toLowerCase().includes(searchQuery.toLowerCase())) ||
            s.crime_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.fir_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.wanted_by_station.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.associated_vehicle && s.associated_vehicle.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStation = stationFilter === 'ALL' || s.wanted_by_station.toLowerCase().includes(stationFilter.toLowerCase());
        const matchesThreat = threatFilter === 'ALL' || s.threat_level === threatFilter;
        const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

        return matchesSearch && matchesStation && matchesThreat && matchesStatus;
    });

    // Paginated Suspects Slice
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedSuspects = filteredSuspects.slice(startIndex, startIndex + pageSize);

    // Toggle Apprehended / Wanted Status
    const handleToggleStatus = (suspectId) => {
        setSuspects(prev =>
            prev.map(s => (s.suspect_id === suspectId ? {
                ...s,
                status: s.status === 'WANTED' ? 'APPREHENDED' : 'WANTED'
            } : s))
        );
    };

    // View Suspect Dossier
    const handleViewDossier = (suspect) => {
        setSelectedSuspect(suspect);
        setIsDossierModalOpen(true);
    };

    // KPI Calculations
    const totalSuspects = suspects.length;
    const activeWanted = suspects.filter(s => s.status === 'WANTED').length;
    const criticalThreats = suspects.filter(s => s.threat_level === 'CRITICAL' && s.status === 'WANTED').length;
    const apprehended = suspects.filter(s => s.status === 'APPREHENDED').length;

    // Actions bundle for table rendering
    const tableActions = {
        onView: handleViewDossier,
        onToggleStatus: handleToggleStatus
    };

    return (
        <div className="container-fluid px-3 py-3 mb-3">

            {/* Page Title & Breadcrumb Header */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-danger d-inline-flex"><IconShieldAlert size={22} /></span>
                        <h1 className="h4 fw-bold text-dark mb-0">Wanted Suspects & Criminal Registry</h1>
                        <span className="badge bg-danger text-white ms-1 fw-bold">{activeWanted} AT LARGE</span>
                    </div>

                </div>
            </div>

            {/* 1. SEPARATE KPI STATS OVERVIEW CARD */}
            <div className="card shadow-sm border-0 mb-3">
                <div className="card-header bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                        <span className="spinner-grow spinner-grow-sm text-danger" role="status" style={{ width: '8px', height: '8px' }}></span>
                        <span className="small fw-bold text-dark text-uppercase letter-spacing">Suspect Surveillance Overview</span>
                    </div>
                </div>

                <div className="card-body p-3">
                    <div className="row g-3">
                        {/* Card 1: Total Suspects */}
                        <div className="col-12 col-sm-6 col-xl-3">
                            <div className="card h-100 border-0 border-start border-4 border-danger shadow-sm p-3 kpi-count-card">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <span className="text-muted small fw-bold text-uppercase">Total Suspects</span>
                                        <div className="kpi-num text-dark mt-1">{totalSuspects}</div>
                                    </div>
                                    <div className="kpi-icon-pill bg-danger-subtle text-danger">
                                        <IconShieldAlert size={20} />
                                    </div>
                                </div>
                                <div className="mt-2 text-muted small">Registered in crime dossier</div>
                            </div>
                        </div>

                        {/* Card 2: Active Wanted */}
                        <div className="col-12 col-sm-6 col-xl-3">
                            <div className="card h-100 border-0 border-start border-4 border-danger shadow-sm p-3 kpi-count-card">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <span className="text-muted small fw-bold text-uppercase">Wanted / At Large</span>
                                        <div className="kpi-num text-danger mt-1">{activeWanted}</div>
                                    </div>
                                    <div className="kpi-icon-pill bg-danger-subtle text-danger">
                                        <IconAlertTriangle size={20} />
                                    </div>
                                </div>
                                <div className="mt-2 text-muted small">Active apprehension warrants</div>
                            </div>
                        </div>

                        {/* Card 3: Critical Threat Level */}
                        <div className="col-12 col-sm-6 col-xl-3">
                            <div className="card h-100 border-0 border-start border-4 border-warning shadow-sm p-3 kpi-count-card">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <span className="text-muted small fw-bold text-uppercase">Critical Threats</span>
                                        <div className="kpi-num text-warning mt-1">{criticalThreats}</div>
                                    </div>
                                    <div className="kpi-icon-pill bg-warning-subtle text-warning">
                                        <IconAlertTriangle size={20} />
                                    </div>
                                </div>
                                <div className="mt-2 text-muted small">Armed / High priority alert</div>
                            </div>
                        </div>

                        {/* Card 4: Apprehended */}
                        <div className="col-12 col-sm-6 col-xl-3">
                            <div className="card h-100 border-0 border-start border-4 border-success shadow-sm p-3 kpi-count-card">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <span className="text-muted small fw-bold text-uppercase">In Police Custody</span>
                                        <div className="kpi-num text-success mt-1">{apprehended}</div>
                                    </div>
                                    <div className="kpi-icon-pill bg-success-subtle text-success">
                                        <IconCheckCircle size={20} />
                                    </div>
                                </div>
                                <div className="mt-2 text-muted small">Apprehended & remanded</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. ACTIONS & TOOLBAR CARD (With Excel Import & Export) */}
            <div className="card shadow-sm border-0 mb-3">
                <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    {/* Left Side: Summary Context */}
                    <div className="d-flex align-items-center gap-2">
                        <div className="p-2 bg-danger-subtle text-danger rounded d-flex align-items-center justify-content-center">
                            <IconShieldAlert size={18} />
                        </div>
                        <div>
                            <div className="fw-bold text-dark small">Suspect Intelligence & Surveillance Records</div>
                        </div>
                    </div>

                    {/* Right Side: Excel Import, Export & Template Buttons */}
                    <div className="d-flex align-items-center gap-2 ms-auto flex-wrap">



                        {/* Excel Export Button */}
                        <ExportExcelButton
                            data={filteredSuspects}
                            fileName="Wanted_Suspects_Registry"
                            columns={suspectExcelColumns}
                            label="Export Suspects Excel"
                        />
                    </div>
                </div>
            </div>

            {/* 3. MAIN DATA TABLE CARD */}
            <div className="card shadow-sm border-0 mb-4">
                {/* Table Filter Strip */}
                <div className="card-header bg-light border-bottom py-2 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    {/* Search Box */}
                    <div className="input-group input-group-sm" style={{ maxWidth: '320px' }}>
                        <span className="input-group-text bg-white border-end-0 text-muted">
                            <IconSearch size={14} />
                        </span>
                        <input
                            type="text"
                            className="form-control form-control-sm border-start-0"
                            placeholder="Search suspect, FIR, vehicle, crime..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                type="button"
                                onClick={() => setSearchQuery('')}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Dropdown Filters */}
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        {/* Station Filter */}
                        <div className="d-flex align-items-center gap-1">
                            <span className="small text-muted fw-semibold">Station:</span>
                            <select
                                value={stationFilter}
                                onChange={(e) => setStationFilter(e.target.value)}
                                className="form-select form-select-sm fw-semibold text-dark"
                                style={{ width: 'auto', minWidth: '130px' }}
                            >
                                <option value="ALL">All Stations</option>
                                <option value="Crime Branch">Crime Branch HQ</option>
                                <option value="Navrangpura">Navrangpura</option>
                                <option value="Vastrapur">Vastrapur</option>
                                <option value="Satellite">Satellite</option>
                                <option value="SG Highway">SG Highway</option>
                                <option value="Ellis Bridge">Ellis Bridge</option>
                            </select>
                        </div>

                        {/* Threat Level Filter */}
                        <div className="d-flex align-items-center gap-1">
                            <span className="small text-muted fw-semibold">Threat:</span>
                            <select
                                value={threatFilter}
                                onChange={(e) => setThreatFilter(e.target.value)}
                                className="form-select form-select-sm fw-semibold text-dark"
                                style={{ width: 'auto', minWidth: '110px' }}
                            >
                                <option value="ALL">All Levels</option>
                                <option value="CRITICAL">Critical</option>
                                <option value="HIGH">High</option>
                                <option value="MODERATE">Moderate</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="d-flex align-items-center gap-1">
                            <span className="small text-muted fw-semibold">Status:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="form-select form-select-sm fw-semibold text-dark"
                                style={{ width: 'auto', minWidth: '110px' }}
                            >
                                <option value="ALL">All</option>
                                <option value="WANTED">Wanted</option>
                                <option value="APPREHENDED">In Custody</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Data Table Container with Horizontal Scroll */}
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 text-nowrap" style={{ minWidth: '1200px' }}>
                        <thead style={{ backgroundColor: '#f4f4f5', borderBottom: '1px solid #e4e4e7' }}>
                            <tr className="text-uppercase small" style={{ fontSize: '11px', fontWeight: 700, color: '#18181b', letterSpacing: '0.04em' }}>
                                {SUSPECT_COLUMNS.map((col, idx) => (
                                    <th
                                        key={col.key || idx}
                                        scope="col"
                                        className={`py-3 px-3 align-middle ${col.align === 'center' ? 'text-center' : ''}`}
                                        style={{
                                            width: col.width || 'auto',
                                            borderRight: idx < SUSPECT_COLUMNS.length - 1 ? '1px solid #e2e8f0' : 'none'
                                        }}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={SUSPECT_COLUMNS.length} className="py-5 text-center text-muted fw-semibold">
                                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                                        Loading wanted suspect registry from server...
                                    </td>
                                </tr>
                            ) : filteredSuspects.length === 0 ? (
                                <tr>
                                    <td colSpan={SUSPECT_COLUMNS.length} className="py-5 text-center text-muted fw-semibold" style={{ fontSize: '13px' }}>
                                        No wanted suspects found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                paginatedSuspects.map((suspect, index) => {
                                    const rowIndex = (currentPage - 1) * pageSize + index + 1;
                                    return (
                                        <tr
                                            key={suspect.suspect_id || index}
                                            style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}
                                        >
                                            {SUSPECT_COLUMNS.map((col) => (
                                                <td
                                                    key={col.key}
                                                    className={`py-3 px-3 align-middle ${col.align === 'center' ? 'text-center' : ''}`}
                                                >
                                                    {col.render
                                                        ? col.render(suspect, index, rowIndex, tableActions)
                                                        : (suspect[col.key] || '-')}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Centralized Reusable Pagination Component */}
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredSuspects.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    pageSizeOptions={[5, 10, 20, 50]}
                />
            </div>

            {/* ========================================================== */}
            {/* 4. SUSPECT DOSSIER & WARRANT INSPECTION MODAL              */}
            {/* ========================================================== */}
            {isDossierModalOpen && selectedSuspect && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(5px)', zIndex: 1055 }}
                    onClick={() => setIsDossierModalOpen(false)}
                >
                    <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content shadow-lg border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>

                            {/* Modal Header */}
                            <div className="modal-header py-3 px-4 border-bottom" style={{ backgroundColor: '#f8fafc' }}>
                                <div className="d-flex align-items-center gap-2.5">
                                    <div
                                        className="d-flex align-items-center justify-content-center rounded-3 shadow-sm text-white"
                                        style={{ width: '38px', height: '38px', backgroundColor: '#dc3545' }}
                                    >
                                        <IconShieldAlert size={20} />
                                    </div>
                                    <div>
                                        <div className="d-flex align-items-center gap-2">
                                            <h5 className="modal-title h6 fw-bold mb-0 text-dark">
                                                Criminal Surveillance Dossier & Warrant
                                            </h5>
                                            <span className="badge bg-danger text-white fw-bold font-mono" style={{ fontSize: '11px' }}>
                                                {selectedSuspect.suspect_id}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close shadow-none"
                                    onClick={() => setIsDossierModalOpen(false)}
                                    aria-label="Close"
                                ></button>
                            </div>

                            {/* Modal Body */}
                            <div className="modal-body p-4" style={{ maxHeight: '74vh', overflowY: 'auto' }}>

                                {/* Hero Identity Banner */}
                                <div
                                    className="p-3 rounded-3 shadow-sm mb-3 text-white position-relative overflow-hidden"
                                    style={{
                                        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
                                        border: '1px solid #312e81'
                                    }}
                                >
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div
                                                className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center bg-danger text-white fw-bold shadow-sm"
                                                style={{ width: '56px', height: '56px', border: '2px solid #ef4444', flexShrink: 0 }}
                                            >
                                                {selectedSuspect.photo_url ? (
                                                    <img
                                                        src={selectedSuspect.photo_url}
                                                        alt={selectedSuspect.full_name}
                                                        className="w-100 h-100"
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    selectedSuspect.full_name.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <div className="fw-bold text-white fs-5 mb-0.5">{selectedSuspect.full_name}</div>
                                                <div className="d-flex align-items-center gap-2">
                                                    {selectedSuspect.alias && (
                                                        <span className="badge bg-warning text-dark fw-bold" style={{ fontSize: '11px' }}>
                                                            Alias: {selectedSuspect.alias}
                                                        </span>
                                                    )}
                                                    <span className="badge bg-danger text-white fw-bold font-mono" style={{ fontSize: '11px' }}>
                                                        {selectedSuspect.threat_level} THREAT
                                                    </span>
                                                </div>
                                                <div className="small mt-1" style={{ color: '#52525b', fontSize: '12px', fontWeight: 500 }}>
                                                    Wanted By: {selectedSuspect.wanted_by_station}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            {selectedSuspect.status === 'WANTED' ? (
                                                <span
                                                    className="badge rounded-pill shadow-sm d-inline-flex align-items-center gap-1.5"
                                                    style={{
                                                        backgroundColor: '#ef4444',
                                                        color: '#ffffff',
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                        padding: '6px 14px'
                                                    }}
                                                >
                                                    <span className="spinner-grow spinner-grow-sm" role="status" style={{ width: '6px', height: '6px' }}></span>
                                                    ACTIVE WARRANT
                                                </span>
                                            ) : (
                                                <span
                                                    className="badge rounded-pill shadow-sm"
                                                    style={{
                                                        backgroundColor: '#22c55e',
                                                        color: '#ffffff',
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                        padding: '6px 14px'
                                                    }}
                                                >
                                                    IN CUSTODY
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Specs 2-Column Grid */}
                                <div className="row g-3 mb-3">
                                    {/* Crime & FIR Info */}
                                    <div className="col-12 col-md-6">
                                        <div className="p-3 rounded-3 border h-100" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                                            <div className="d-flex align-items-center gap-2 mb-2 text-danger">
                                                <IconShieldAlert size={16} />
                                                <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px' }}>
                                                    Primary Criminal Charges
                                                </span>
                                            </div>
                                            <div className="fw-bold text-dark fs-6">{selectedSuspect.crime_category}</div>
                                            <div className="font-mono text-muted small mt-1">FIR Ref: {selectedSuspect.fir_number}</div>
                                            <div className="d-flex align-items-center gap-2 mt-2">
                                                <span className="badge bg-white text-dark border font-mono small">
                                                    Reported: {selectedSuspect.reported_date}
                                                </span>
                                                {selectedSuspect.bounty_reward && selectedSuspect.bounty_reward !== 'None' && (
                                                    <span className="badge bg-success-subtle text-success small fw-bold">
                                                        Reward: {selectedSuspect.bounty_reward}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Linked Vehicle Info */}
                                    <div className="col-12 col-md-6">
                                        <div className="p-3 rounded-3 border h-100" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                                            <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                                                <IconCar size={16} />
                                                <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px' }}>
                                                    Linked Vehicle & ANPR Target
                                                </span>
                                            </div>
                                            {selectedSuspect.associated_vehicle ? (
                                                <div>
                                                    <div className="ind-number-plate d-inline-flex align-middle shadow-sm mb-2" style={{ height: '32px', padding: '1px 8px' }}>
                                                        <span className="ind-flag" style={{ fontSize: '8px' }}>IND</span>
                                                        <span className="fw-bold" style={{ fontSize: '12px' }}>{selectedSuspect.associated_vehicle}</span>
                                                    </div>
                                                    <div className="text-muted small">
                                                        Vehicle Desc: <strong className="text-dark">{selectedSuspect.associated_vehicle_desc || 'Unspecified'}</strong>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-muted small py-2">
                                                    No known vehicle linked to this suspect record.
                                                </div>
                                            )}
                                            <div className="text-muted small mt-2">
                                                Last Known Spot: 📍 <strong>{selectedSuspect.last_seen}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Residential Address Section */}
                                <div className="p-3 rounded-3 border mb-3" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                                    <div className="d-flex align-items-center gap-1.5 mb-1.5 text-danger">
                                        <span>📍</span>
                                        <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px' }}>
                                            Residential Address & Hideout Information
                                        </span>
                                    </div>
                                    <div className="fw-semibold text-dark small" style={{ lineHeight: '1.5' }}>
                                        {selectedSuspect.permanent_address || 'No permanent address recorded in file.'}
                                    </div>
                                    {selectedSuspect.current_address && (
                                        <div className="mt-1.5 text-muted small" style={{ fontSize: '11.5px' }}>
                                            <strong>Current / Alternate:</strong> {selectedSuspect.current_address}
                                        </div>
                                    )}
                                </div>

                                {/* Tactical Dispatch Notice */}
                                <div className="p-3 rounded-3 border bg-warning-subtle border-warning-subtle text-dark small">
                                    <div className="fw-bold d-flex align-items-center gap-1.5 mb-1 text-dark">
                                        <IconAlertTriangle size={15} className="text-warning" />
                                        <span>Officer Safety Advisory</span>
                                    </div>
                                    <span>
                                        Suspect may be armed and accompanied by syndicate associates. If spotted on patrol cameras, immediately broadcast ANPR alert to Central Command before intercepting.
                                    </span>
                                </div>

                            </div>

                            {/* Modal Footer */}
                            <div className="modal-footer py-2.5 px-4 border-top d-flex justify-content-between align-items-center" style={{ backgroundColor: '#f8fafc' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm px-3 fw-semibold shadow-none"
                                    onClick={() => setIsDossierModalOpen(false)}
                                >
                                    Close
                                </button>
                                <Link
                                    to={`/reports/wanted-suspects/${selectedSuspect.suspect_id}`}
                                    className="btn btn-danger btn-sm px-3 fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm text-decoration-none"
                                    onClick={() => setIsDossierModalOpen(false)}
                                >
                                    <span>Open Dedicated Suspect Page</span>
                                    <span>→</span>
                                </Link>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
