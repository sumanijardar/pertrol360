import React, { useState, useEffect, useRef } from 'react';
import { toast } from '../../components/common/Toast';
import {
  getMyActivityApi,
  getFleetActivityApi,
  getOfficerAlertsApi,
  pollOfficerLiveAlertsApi,
  acknowledgeOfficerAlertApi,
  resolveOfficerAlertApi,
  addOfficerNoteApi,
  lookupOfficerPlateApi,
  reportOfficerIncidentApi,
  API_BASE_URL,
  getCurrentUser
} from '../../services/api';
import {
  IconCar,
  IconVideo,
  IconAlertTriangle,
  IconCrosshair,
  IconRefresh,
  IconCheck,
  IconSearch,
  IconPlus,
  IconShieldAlert
} from '../../components/common/Icons';

export default function OfficerCockpit() {
  const currentUser = getCurrentUser();

  // State
  const [scope, setScope] = useState('my'); // 'my' = In-Vehicle Edge Mode, 'all' = City Fleet Grid
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'matrix' | 'feed'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'O' | 'A' | 'C'
  const [isLoading, setIsLoading] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // Data
  const [officerData, setOfficerData] = useState(null);
  const [fleetData, setFleetData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [latestSeenId, setLatestSeenId] = useState(0);

  // Modals
  const [resolveModalAlert, setResolveModalAlert] = useState(null);
  const [resolveAction, setResolveAction] = useState('INTERCEPTED');
  const [resolveComment, setResolveComment] = useState('');

  const [noteModalAlert, setNoteModalAlert] = useState(null);
  const [noteText, setNoteText] = useState('');

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    alerttype: 'SUSPICIOUS_VEHICLE',
    scanned_vehicle_numberplate: '',
    location: '',
    comment: ''
  });

  // Quick Plate Search
  const [searchPlateInput, setSearchPlateInput] = useState('');
  const [plateSearchResult, setPlateSearchResult] = useState(null);
  const [isSearchingPlate, setIsSearchingPlate] = useState(false);

  // Web Audio API Siren synthesis for Stolen Vehicle Matches
  const playSirenSound = () => {
    if (!isAudioEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';

      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(950, now + 0.25);
      osc.frequency.linearRampToValueAtTime(600, now + 0.5);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
      // Audio context policy fallback
    }
  };

  // Fetch data on scope change
  const loadData = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      if (scope === 'my') {
        const res = await getMyActivityApi();
        if (res.success && res.data) {
          setOfficerData(res.data);
          setAlerts(res.data.recent_alerts || []);
          if (res.data.recent_alerts?.[0]?.id > latestSeenId) {
            setLatestSeenId(res.data.recent_alerts[0].id);
          }
        }
      } else {
        const res = await getFleetActivityApi();
        if (res.success && res.data) {
          setFleetData(res.data);
          setAlerts(res.data.recent_alerts || []);
          if (res.data.recent_alerts?.[0]?.id > latestSeenId) {
            setLatestSeenId(res.data.recent_alerts[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Error loading cockpit data:', err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, [scope]);

  // Real-time live polling every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await pollOfficerLiveAlertsApi({
          since_id: latestSeenId,
          scope: scope,
          limit: 5
        });

        if (res?.success && res.data?.has_new) {
          setLatestSeenId(res.data.latest_id);
          if (res.data.has_stolen_hit) {
            playSirenSound();
          }
          loadData(false);
        }
      } catch {
        // Polling failure silent retry
      }
    }, 3500);

    return () => clearInterval(timer);
  }, [latestSeenId, scope, isAudioEnabled]);

  // 1-Click Acknowledge Alert
  const handleAcknowledge = async (alertId) => {
    try {
      const res = await acknowledgeOfficerAlertApi(alertId, 'Patrol unit acknowledged. En route.');
      if (res.success) {
        toast.success(`Alert #${alertId} Acknowledged`, 'Unit Dispatched');
        loadData(false);
      }
    } catch (err) {
      toast.error(err.message || 'Unable to acknowledge alert.', 'Action Failed');
    }
  };

  // Submit Resolution
  const handleSubmitResolve = async () => {
    if (!resolveModalAlert) return;
    try {
      const res = await resolveOfficerAlertApi(resolveModalAlert.id, {
        action_taken: resolveAction,
        comment: resolveComment.trim() || 'Action completed on field.'
      });

      if (res.success) {
        toast.success(`Alert #${resolveModalAlert.id} marked resolved with action: ${resolveAction}`, 'Alert Closed');
        setResolveModalAlert(null);
        setResolveComment('');
        loadData(false);
      }
    } catch (err) {
      toast.error(err.message || 'Unable to resolve alert.', 'Resolution Failed');
    }
  };

  // Submit Field Note
  const handleSubmitNote = async () => {
    if (!noteModalAlert || !noteText.trim()) return;
    try {
      const res = await addOfficerNoteApi(noteModalAlert.id, noteText.trim());
      if (res.success) {
        toast.success('Field note added to incident record.', 'Note Saved');
        setNoteModalAlert(null);
        setNoteText('');
        loadData(false);
      }
    } catch (err) {
      toast.error(err.message || 'Error updating alert notes.', 'Failed to Save Note');
    }
  };

  // Quick Plate Hotlist Search
  const handlePlateSearch = async (e) => {
    e?.preventDefault();
    if (!searchPlateInput.trim()) return;

    setIsSearchingPlate(true);
    setPlateSearchResult(null);
    try {
      const res = await lookupOfficerPlateApi(searchPlateInput.trim());
      if (res.success && res.data) {
        setPlateSearchResult(res.data);
      }
    } catch (err) {
      setPlateSearchResult({ error: err.message || 'Failed to search plate database.' });
    } finally {
      setIsSearchingPlate(false);
    }
  };

  // Submit Field Incident Report
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportForm.alerttype) return;

    try {
      const payload = {
        ...reportForm,
        vehicle_id: officerData?.vehicle?.vehicle_id || 'PATROL_VAN_01'
      };
      const res = await reportOfficerIncidentApi(payload);
      if (res.success) {
        toast.success(`Logged Alert #${res.data?.id || ''} into AI dispatch queue.`, 'Field Incident Ingested');
        setReportModalOpen(false);
        setReportForm({
          alerttype: 'SUSPICIOUS_VEHICLE',
          scanned_vehicle_numberplate: '',
          location: '',
          comment: ''
        });
        loadData(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create field incident.', 'Report Ingest Failed');
    }
  };

  // Filtered alerts
  const filteredAlerts = alerts.filter((a) => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  const activeVehicle = scope === 'my' ? officerData?.vehicle : null;
  const activeTelemetry = scope === 'my' ? officerData?.telemetry : null;
  const activeDuty = scope === 'my' ? officerData?.duty_metrics : null;
  const cameras = scope === 'my' ? officerData?.cameras || [] : fleetData?.cameras || [];

  return (
    <div
      className="flex flex-col flex-1 w-full min-h-screen text-slate-800 font-sans"
      style={{
        backgroundColor: '#f8fafc',
        padding: '24px 32px 64px 32px',
        boxSizing: 'border-box'
      }}
    >
      <div
        className="flex flex-col gap-6"
        style={{
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Page Header (Direct Match to Reference Image Style) */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  In-Vehicle Tactical Cockpit
                </h1>
                <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Navrangpura Sector • Patrol Unit <strong className="text-slate-800 font-mono font-bold">PATROL_VAN_01</strong> (GJ-01-G-9999) • Connected to State Police Network
              </p>
            </div>

            {/* Quick Actions (Audio Siren & Refresh) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  isAudioEnabled
                    ? 'bg-red-50 border-red-200 text-red-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                }`}
                title="Toggle Emergency Siren Audio"
              >
                {isAudioEnabled ? '🔊 Siren: ON' : '🔇 Siren: OFF'}
              </button>

              <button
                onClick={() => loadData(true)}
                className="p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs cursor-pointer"
                title="Refresh Metrics"
              >
                <IconRefresh size={15} />
              </button>
            </div>
          </div>

          {/* Action / Filter Bar (Like Manage Orders / Add Product in Reference) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-1 shadow-2xs">
              <button
                onClick={() => setScope('my')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  scope === 'my'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>👤</span>
                <span>My Patrol Car (Unit Only)</span>
              </button>

              <button
                onClick={() => setScope('all')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  scope === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🌐</span>
                <span>City Fleet Grid (All Units)</span>
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-1 text-xs font-semibold shadow-2xs">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'split' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'matrix' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                📹 4-Cams Matrix
              </button>
              <button
                onClick={() => setViewMode('feed')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'feed' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🚨 Alerts Feed
              </button>
            </div>
          </div>
        </div>

        {/* Unit Telemetry & Duty Metrics Banner (4 Clean White KPI Cards with Generous Spacing) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Today's Alerts */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 relative overflow-hidden shadow-xs hover:shadow-sm transition-all">
            <div className="w-full h-1 bg-blue-600 absolute top-0 left-0" />
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {scope === 'my' ? "Today's Alerts on My Car" : 'City Fleet Alerts Today'}
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono mt-1.5">
              {scope === 'my'
                ? activeDuty?.my_alerts_today ?? '--'
                : fleetData?.fleet_summary?.today_total_alerts ?? '--'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {scope === 'my' ? `Detected on ${activeVehicle?.vehicle_id || 'PATROL_VAN_01'}` : 'Across all fleet units'}
            </div>
          </div>

          {/* Card 2: Open Alerts */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 relative overflow-hidden shadow-xs hover:shadow-sm transition-all">
            <div className="w-full h-1 bg-amber-500 absolute top-0 left-0" />
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {scope === 'my' ? 'Open Alerts on My Car' : 'Fleet Open Alerts'}
            </div>
            <div className="text-3xl font-black text-amber-600 font-mono mt-1.5">
              {scope === 'my'
                ? activeDuty?.my_open_alerts ?? '--'
                : fleetData?.fleet_summary?.open_alerts ?? '--'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Immediate field response needed</div>
          </div>

          {/* Card 3: Acknowledged / In Pursuit */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 relative overflow-hidden shadow-xs hover:shadow-sm transition-all">
            <div className="w-full h-1 bg-sky-500 absolute top-0 left-0" />
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {scope === 'my' ? 'Acknowledged by Me' : 'Hotlist Stolen Hits'}
            </div>
            <div className="text-3xl font-black text-sky-600 font-mono mt-1.5">
              {scope === 'my'
                ? activeDuty?.acknowledged_by_me ?? '--'
                : fleetData?.fleet_summary?.hotlist_hits_today ?? '--'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {scope === 'my' ? 'Dispatches currently in pursuit' : 'Stolen watchlist hits today'}
            </div>
          </div>

          {/* Card 4: Resolved Incidents */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 relative overflow-hidden shadow-xs hover:shadow-sm transition-all">
            <div className="w-full h-1 bg-emerald-600 absolute top-0 left-0" />
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {scope === 'my' ? 'Resolved by Me' : 'Fleet Resolved Today'}
            </div>
            <div className="text-3xl font-black text-emerald-600 font-mono mt-1.5">
              {scope === 'my'
                ? activeDuty?.resolved_by_me ?? '--'
                : fleetData?.fleet_summary?.closed_today ?? '--'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Interceptions & closed incidents</div>
          </div>
        </div>

        {/* Workspace: Left Telemetry & Tools + Right Cameras & Alerts */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-7">
          {/* Left Column (4 cols): IoT Telemetry, Plate Search, Manual Ingest */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            {/* Assigned Patrol Van IoT Telemetry Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚔</span>
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                    {scope === 'my' ? 'My Patrol Vehicle' : 'City Fleet Summary'}
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  ONLINE
                </span>
              </div>

              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Unit Identifier:</span>
                  <strong className="text-slate-900 font-mono font-bold">
                    {scope === 'my' ? activeVehicle?.vehicle_id || 'PATROL_VAN_01' : 'ALL 6 VANS'}
                  </strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Registration:</span>
                  <strong className="text-slate-900 font-mono font-bold">
                    {scope === 'my' ? activeVehicle?.registration_number || 'GJ-01-G-9999' : 'AHMEDABAD GRID'}
                  </strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Police Station:</span>
                  <strong className="text-slate-900 font-medium">
                    {scope === 'my' ? activeVehicle?.police_station || 'Navrangpura PS' : 'Navrangpura Div'}
                  </strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Live Speed:</span>
                  <strong className="text-blue-700 font-mono font-bold">
                    {scope === 'my' ? `${activeTelemetry?.speed_kmph ?? '41.5'} km/h` : 'Active Patrol'}
                  </strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">GPS Telemetry:</span>
                  <strong className="text-slate-900 font-mono text-[11px]">
                    {scope === 'my' && activeTelemetry?.latitude
                      ? `${parseFloat(activeTelemetry.latitude).toFixed(4)}° N, ${parseFloat(activeTelemetry.longitude).toFixed(4)}° E`
                      : '23.0225° N, 72.5714° E'}
                  </strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Jetson IoT Battery:</span>
                  <strong className="text-emerald-700 font-mono font-semibold">
                    {scope === 'my' ? `${activeTelemetry?.battery_voltage ?? '13.8'}V • Engine ON` : 'Normal'}
                  </strong>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Mounted RTSP Cams:</span>
                  <strong className="text-slate-900 font-mono font-bold">{cameras.length} Active Feeds</strong>
                </div>
              </div>
            </div>

            {/* Quick License Plate Hotlist Search */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
                <span className="text-blue-600 font-bold">🔍</span>
                <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  Plate Hotlist Search
                </span>
              </div>

              <form onSubmit={handlePlateSearch} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={searchPlateInput}
                  onChange={(e) => setSearchPlateInput(e.target.value.toUpperCase())}
                  placeholder="e.g. GJ01AB1234"
                  maxLength={15}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 uppercase focus:border-blue-600 focus:bg-white outline-none"
                />
                <button
                  type="submit"
                  disabled={isSearchingPlate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  {isSearchingPlate ? '...' : 'Search'}
                </button>
              </form>

              {plateSearchResult && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs mt-3 animate-fadeIn">
                  {plateSearchResult.error ? (
                    <div className="text-red-600 font-medium">{plateSearchResult.error}</div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div
                        className={`font-bold text-xs flex items-center gap-1.5 ${
                          plateSearchResult.is_stolen_watchlist ? 'text-red-700' : 'text-emerald-700'
                        }`}
                      >
                        {plateSearchResult.is_stolen_watchlist
                          ? '🚨 STOLEN VEHICLE HOTLIST HIT!'
                          : '✓ Clean Plate (Not In Stolen Database)'}
                      </div>

                      {plateSearchResult.stolen_details && (
                        <div className="bg-red-50 border border-red-200 p-2.5 rounded-md text-[11px] text-red-900 flex flex-col gap-1">
                          <div>FIR: <strong>{plateSearchResult.stolen_details.fir_number}</strong></div>
                          <div>Station: <strong>{plateSearchResult.stolen_details.police_station}</strong></div>
                          <div>Theft Date: <strong>{plateSearchResult.stolen_details.theft_date}</strong></div>
                        </div>
                      )}

                      <div className="text-[11px] text-slate-600 flex flex-col gap-0.5 pt-1 border-t border-slate-200">
                        <div>Sightings by Patrol Cams: <strong className="text-slate-900">{plateSearchResult.total_sightings || 0}</strong></div>
                        {plateSearchResult.last_seen && (
                          <div>Last Seen: <span className="font-mono text-slate-800">{plateSearchResult.last_seen}</span></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Report Manual Incident */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-red-600 font-bold">🚨</span>
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                    Field Incident Dispatch
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Log an on-scene observation or manual violation directly into the AI alerts pipeline.
              </p>
              <button
                onClick={() => setReportModalOpen(true)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-2.5 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>+ Log New Field Alert</span>
              </button>
            </div>
          </div>

          {/* Right Column (8 cols): 4-Cams Matrix and/or Real-Time Alerts Feed */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            {/* 4-Camera Live Stream Matrix */}
            {(viewMode === 'split' || viewMode === 'matrix') && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold">📹</span>
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                      360° Mounted Vehicle Cameras Matrix
                    </span>
                    <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold font-mono">
                      {scope === 'my' ? activeVehicle?.vehicle_id || 'PATROL_VAN_01' : 'FLEET MATRIX'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Live RTSP Vision Pipelines</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cameras.slice(0, 4).map((cam) => (
                    <div
                      key={cam.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col relative group shadow-sm"
                    >
                      {/* Video Viewport Simulation with Tactical HUD Reticle */}
                      <div className="h-44 relative bg-slate-950 flex items-center justify-center overflow-hidden">
                        <svg
                          width="100%"
                          height="100%"
                          viewBox="0 0 400 200"
                          className="bg-[#050b17] w-full h-full select-none"
                        >
                          <defs>
                            <pattern id={`grid_${cam.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                            </pattern>
                          </defs>
                          <rect width="400" height="200" fill={`url(#grid_${cam.id})`} />
                          <circle cx="200" cy="100" r="28" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 2" />
                          <line x1="160" y1="100" x2="240" y2="100" stroke="#0284c7" strokeWidth="1.5" />
                          <line x1="200" y1="60" x2="200" y2="140" stroke="#0284c7" strokeWidth="1.5" />
                          <text x="200" y="145" fontFamily="monospace" fontSize="11" fill="#38bdf8" textAnchor="middle" fontWeight="bold">
                            AI ANPR SENSOR ACTIVE
                          </text>
                          <text x="200" y="165" fontFamily="monospace" fontSize="9.5" fill="#94a3b8" textAnchor="middle">
                            {cam.mount_position} • {cam.resolution || '1080P'} @ {cam.fps || 30}FPS
                          </text>
                        </svg>

                        {/* Stream Badges */}
                        <div className="absolute top-2 left-2 flex gap-1.5 pointer-events-none">
                          <span className="bg-slate-900/90 backdrop-blur-xs text-sky-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                            {cam.mount_position}
                          </span>
                        </div>

                        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          RTSP STREAM OK
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="bg-slate-900 px-3.5 py-2.5 border-t border-slate-800 flex justify-between items-center text-xs">
                        <div className="flex flex-col truncate pr-2">
                          <strong className="text-white text-xs truncate">{cam.camera_name}</strong>
                          <span className="text-[10px] text-slate-400 font-mono truncate">{cam.rtsp_url}</span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(cam.rtsp_url);
                            toast.info('RTSP streaming URL copied to clipboard', 'Copied');
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[11px] font-medium border border-slate-700 cursor-pointer flex-shrink-0"
                        >
                          Copy RTSP
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real-Time Alerts Feed */}
            {(viewMode === 'split' || viewMode === 'feed') && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-bold">🚨</span>
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                      Real-Time AI Edge Alerts Stream
                    </span>
                    <span className="text-xs text-slate-500 font-mono font-medium">
                      ({filteredAlerts.length} loaded)
                    </span>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 gap-1">
                    <button
                      onClick={() => setFilterStatus('all')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        filterStatus === 'all'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterStatus('O')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        filterStatus === 'O'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Open
                    </button>
                    <button
                      onClick={() => setFilterStatus('A')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        filterStatus === 'A'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Acknowledged
                    </button>
                    <button
                      onClick={() => setFilterStatus('C')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        filterStatus === 'C'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Resolved
                    </button>
                  </div>
                </div>

                {/* Alerts Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAlerts.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-xs text-slate-400">
                      No AI edge alerts matching the current filter.
                    </div>
                  ) : (
                    filteredAlerts.map((a) => {
                      const isCritical = a.is_stolen_hit == 1 || a.alerttype?.includes('STOLEN');
                      const imgUrl = `${API_BASE_URL}/api/officer/alerts/${a.id}/image`;

                      return (
                        <div
                          key={a.id}
                          className={`bg-white border rounded-xl overflow-hidden flex flex-col transition-all shadow-xs hover:shadow-md ${
                            isCritical
                              ? 'border-red-400 ring-1 ring-red-400/30'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Snapshot Image with Direct Binary Stream */}
                          <div className="h-44 bg-slate-900 relative overflow-hidden">
                            <img
                              src={imgUrl}
                              alt={`Alert #${a.id}`}
                              loading="lazy"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  'https://placehold.co/600x340/0f172a/38bdf8?text=PATROL360+AI+FRAME';
                              }}
                            />

                            {/* Top Badges */}
                            <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                              <span
                                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                  a.status === 'O'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : a.status === 'A'
                                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                }`}
                              >
                                {a.status_label || (a.status === 'O' ? 'Open' : a.status === 'A' ? 'Acknowledged' : 'Closed')}
                              </span>

                              {isCritical && (
                                <span className="bg-red-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded animate-pulse">
                                  🚨 STOLEN HIT
                                </span>
                              )}

                              <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                {a.alerttype || 'ALERT'}
                              </span>
                            </div>
                          </div>

                          {/* Body */}
                          <div className="p-3.5 flex flex-col flex-1 gap-2.5 text-xs">
                            <div className="flex justify-between items-center">
                              {/* Authentic Yellow Indian Number Plate styling */}
                              <span className="bg-amber-100 text-slate-950 font-black font-mono px-2.5 py-0.5 rounded border border-amber-300 text-sm tracking-wide">
                                {a.scanned_vehicle_numberplate || 'PLATE UNKNOWN'}
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono">{a.createtime}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <div>
                                Unit: <strong className="text-slate-900">{a.vehicle_id}</strong>
                              </div>
                              <div>
                                Camera: <strong className="text-slate-900">{a.camera_id}</strong>
                              </div>
                              <div className="col-span-2 truncate">
                                Location: <strong className="text-slate-900">{a.location || 'Patrol Grid'}</strong>
                              </div>
                            </div>

                            {a.comment && (
                              <div className="bg-blue-50/60 border-s-2 border-blue-500 px-2.5 py-1.5 rounded text-[11px] text-slate-700 line-clamp-2">
                                {a.comment}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="mt-auto pt-2.5 border-t border-slate-100 flex items-center gap-1.5">
                              {a.status === 'O' && (
                                <button
                                  onClick={() => handleAcknowledge(a.id)}
                                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-1.5 px-2.5 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                                >
                                  ✋ Acknowledge
                                </button>
                              )}

                              {a.status !== 'C' ? (
                                <button
                                  onClick={() => {
                                    setResolveModalAlert(a);
                                    setResolveComment('');
                                  }}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2.5 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                                >
                                  ✅ Resolve
                                </button>
                              ) : (
                                <span className="text-[11px] text-emerald-700 font-bold py-1">
                                  Resolved: {a.action_taken || 'Completed'}
                                </span>
                              )}

                              <button
                                onClick={() => {
                                  setNoteModalAlert(a);
                                  setNoteText('');
                                }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-2.5 rounded-lg text-xs font-semibold border border-slate-200 cursor-pointer"
                                title="Add field note"
                              >
                                📝 Note
                              </button>

                              {a.lat && a.lon && (
                                <a
                                  href={`https://www.google.com/maps?q=${a.lat},${a.lon}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-2.5 rounded-lg text-xs font-semibold border border-slate-200"
                                  title="Open Map Location"
                                >
                                  📍
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RESOLVE ALERT MODAL (Clean Professional White) */}
      {resolveModalAlert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-900 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold text-lg">✅</span>
                <h3 className="font-bold text-sm text-slate-900">Resolve Field Incident #{resolveModalAlert.id}</h3>
              </div>
              <button
                onClick={() => setResolveModalAlert(null)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 mb-3">
              Target Vehicle: <strong className="font-mono text-slate-900">{resolveModalAlert.scanned_vehicle_numberplate}</strong>
              <br />
              Alert Type: <strong className="text-slate-900">{resolveModalAlert.alerttype}</strong>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Interception / Outcome Action:</label>
                <select
                  value={resolveAction}
                  onChange={(e) => setResolveAction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                >
                  <option value="INTERCEPTED">INTERCEPTED • Vehicle Stopped & Detained</option>
                  <option value="VERIFIED_CLEAR">VERIFIED_CLEAR • Checked, Suspect Cleared</option>
                  <option value="FALSE_POSITIVE">FALSE_POSITIVE • Plate Read Mistake / OCR Mismatch</option>
                  <option value="ESCAPED_FORWARDED">ESCAPED_FORWARDED • Fled, Forwarded to Next Sector</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Officer On-Scene Remarks:</label>
                <textarea
                  rows={3}
                  value={resolveComment}
                  onChange={(e) => setResolveComment(e.target.value)}
                  placeholder="Detail outcome, officers involved, chassis cross-check..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResolveModalAlert(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitResolve}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
                >
                  Confirm Resolution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOTE MODAL (Clean Professional White) */}
      {noteModalAlert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-900 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">📝</span>
                <h3 className="font-bold text-sm text-slate-900">Add Field Log Note to #{noteModalAlert.id}</h3>
              </div>
              <button
                onClick={() => setNoteModalAlert(null)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <textarea
                rows={4}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter tactical observation, vehicle direction of travel, driver description..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNoteModalAlert(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitNote}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                >
                  Append Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FIELD INCIDENT DISPATCH MODAL (Clean Professional White) */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-900 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-bold text-lg">🚨</span>
                <h3 className="font-bold text-sm text-slate-900">Broadcast Field Incident Dispatch</h3>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Alert Category:</label>
                <select
                  value={reportForm.alerttype}
                  onChange={(e) => setReportForm({ ...reportForm, alerttype: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                >
                  <option value="SUSPICIOUS_VEHICLE">SUSPICIOUS_VEHICLE • Suspicious Activity</option>
                  <option value="STOLEN_VEHICLE">STOLEN_VEHICLE • Confirmed Stolen Sighting</option>
                  <option value="WEAPON_DETECTED">WEAPON_DETECTED • Armed Subject Reported</option>
                  <option value="TRAFFIC_BLOCK">TRAFFIC_BLOCK • Road Obstruction / Accident</option>
                  <option value="OFFICER_SOS">OFFICER_SOS • Emergency Assistance Requested</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Vehicle Number Plate (if applicable):</label>
                <input
                  type="text"
                  value={reportForm.scanned_vehicle_numberplate}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, scanned_vehicle_numberplate: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. GJ01XX9999"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 uppercase outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Location / Landmark:</label>
                <input
                  type="text"
                  value={reportForm.location}
                  onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                  placeholder="e.g. CG Road Junction, near Navrangpura Circle"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Observation Notes:</label>
                <textarea
                  rows={3}
                  value={reportForm.comment}
                  onChange={(e) => setReportForm({ ...reportForm, comment: e.target.value })}
                  placeholder="Detail suspect behavior, direction of escape..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer"
                >
                  Transmit Dispatch Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
