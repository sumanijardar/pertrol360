// PATROL360 Real-Time Mock Database & Tactical Telemetry Feed
// Strictly aligned with PostgreSQL / SQLite Patrol360 Schema

export const POLICE_VEHICLES = [
  {
    vehicle_id: 'PATROL_VAN_01',
    registration_number: 'GJ-01-G-9999',
    vehicle_model: 'Mahindra Scorpio-N (Tactical 4x4)',
    police_station: 'Navrangpura Police Station',
    assigned_driver_officer: 'Insp. Vikram Solanki (Badge #NP-402)',
    jetson_device_serial: 'JETSON-AGX-8821-X1',
    sim_card_phone: '+91 98250 11201',
    is_active: true,
    telemetry: {
      latitude: 23.0372,
      longitude: 72.5613,
      speed_kmph: 44.5,
      heading_degrees: 72,
      battery_voltage: 13.4,
      jetson_temperature_c: 46.5,
      network_signal_dbm: -64,
      is_engine_running: true,
      last_ping: 'Just now'
    },
    cameras: [
      { camera_id: 'CAM_01_FRONT', mount_position: 'FRONT', rtsp_url: 'rtsp://10.0.1.11:8554/front_4k', resolution: '1920x1080', fps: 25, is_streaming: true, ai_mode: 'ANPR + Weapon AI' },
      { camera_id: 'CAM_01_REAR', mount_position: 'REAR', rtsp_url: 'rtsp://10.0.1.11:8554/rear_1080', resolution: '1920x1080', fps: 25, is_streaming: true, ai_mode: 'ANPR Watch' },
      { camera_id: 'CAM_01_LEFT', mount_position: 'LEFT', rtsp_url: 'rtsp://10.0.1.11:8554/left_flank', resolution: '1920x1080', fps: 25, is_streaming: true, ai_mode: 'Crowd & Fire AI' },
      { camera_id: 'CAM_01_RIGHT', mount_position: 'RIGHT', rtsp_url: 'rtsp://10.0.1.11:8554/right_flank', resolution: '1920x1080', fps: 25, is_streaming: true, ai_mode: 'Crowd Analytics' }
    ]
  },
  {
    vehicle_id: 'PATROL_VAN_02',
    registration_number: 'GJ-01-GA-3421',
    vehicle_model: 'Tata Safari Stealth Patrol',
    police_station: 'Vastrapur Police Station',
    assigned_driver_officer: 'PSI Rajesh Dave (Badge #VP-219)',
    jetson_device_serial: 'JETSON-AGX-9940-X2',
    sim_card_phone: '+91 98250 88741',
    is_active: true,
    telemetry: {
      latitude: 23.0358,
      longitude: 72.5298,
      speed_kmph: 28.0,
      heading_degrees: 180,
      battery_voltage: 12.9,
      jetson_temperature_c: 51.2,
      network_signal_dbm: -71,
      is_engine_running: true,
      last_ping: '3s ago'
    },
    cameras: [
      { camera_id: 'CAM_02_FRONT', mount_position: 'FRONT', rtsp_url: 'rtsp://10.0.1.12:8554/front', resolution: '1920x1080', fps: 25, is_streaming: true, ai_mode: 'ANPR + Threat' },
      { camera_id: 'CAM_02_REAR', mount_position: 'REAR', rtsp_url: 'rtsp://10.0.1.12:8554/rear', resolution: '1920x1080', fps: 25, is_streaming: true, ai_mode: 'ANPR' },
      { camera_id: 'CAM_02_LEFT', mount_position: 'LEFT', rtsp_url: 'rtsp://10.0.1.12:8554/left', resolution: '1920x1080', fps: 25, is_streaming: true, ai_mode: 'Fire Detection' },
      { camera_id: 'CAM_02_RIGHT', mount_position: 'RIGHT', rtsp_url: 'rtsp://10.0.1.12:8554/right', resolution: '1920x1080', fps: 25, is_streaming: true, ai_mode: 'Crowd Count' }
    ]
  },
  {
    vehicle_id: 'PATROL_VAN_03',
    registration_number: 'GJ-01-GX-8008',
    vehicle_model: 'Mahindra Scorpio Classic',
    police_station: 'Satellite Police Station',
    assigned_driver_officer: 'Sub-Insp. Priya Patel (Badge #SP-105)',
    jetson_device_serial: 'JETSON-ORIN-4412-O1',
    sim_card_phone: '+91 97240 55190',
    is_active: true,
    telemetry: {
      latitude: 23.0289,
      longitude: 72.5187,
      speed_kmph: 52.1,
      heading_degrees: 310,
      battery_voltage: 13.6,
      jetson_temperature_c: 44.8,
      network_signal_dbm: -61,
      is_engine_running: true,
      last_ping: '1s ago'
    },
    cameras: [
      { camera_id: 'CAM_03_FRONT', mount_position: 'FRONT', rtsp_url: 'rtsp://10.0.1.13:8554/front', resolution: '1920x1080', fps: 25, is_streaming: true, ai_mode: 'Multi-Object AI' },
      { camera_id: 'CAM_03_REAR', mount_position: 'REAR', rtsp_url: 'rtsp://10.0.1.13:8554/rear', resolution: '1920x1080', fps: 25, is_streaming: true, ai_mode: 'ANPR' },
      { camera_id: 'CAM_03_LEFT', mount_position: 'LEFT', rtsp_url: 'rtsp://10.0.1.13:8554/left', resolution: '1920x1080', fps: 25, is_streaming: true, ai_mode: 'Hazard AI' },
      { camera_id: 'CAM_03_RIGHT', mount_position: 'RIGHT', rtsp_url: 'rtsp://10.0.1.13:8554/right', resolution: '1920x1080', fps: 25, is_streaming: true, ai_mode: 'Crowd AI' }
    ]
  },
  {
    vehicle_id: 'PATROL_VAN_04',
    registration_number: 'GJ-01-G-7712',
    vehicle_model: 'Toyota Innova Crysta Command',
    police_station: 'SG Highway Police Station',
    assigned_driver_officer: 'ASI Hitesh Parmar (Badge #SG-789)',
    jetson_device_serial: 'JETSON-AGX-3310-X3',
    sim_card_phone: '+91 94280 66321',
    is_active: true,
    telemetry: {
      latitude: 23.0715,
      longitude: 72.5142,
      speed_kmph: 61.8,
      heading_degrees: 15,
      battery_voltage: 13.1,
      jetson_temperature_c: 48.9,
      network_signal_dbm: -68,
      is_engine_running: true,
      last_ping: '2s ago'
    },
    cameras: [
      { camera_id: 'CAM_04_FRONT', mount_position: 'FRONT', rtsp_url: 'rtsp://10.0.1.14:8554/front', resolution: '1920x1080', fps: 25, is_streaming: true, ai_mode: 'ANPR Highway Watch' },
      { camera_id: 'CAM_04_REAR', mount_position: 'REAR', rtsp_url: 'rtsp://10.0.1.14:8554/rear', resolution: '1920x1080', fps: 25, is_streaming: true, ai_mode: 'Speed & Plate' },
      { camera_id: 'CAM_04_LEFT', mount_position: 'LEFT', rtsp_url: 'rtsp://10.0.1.14:8554/left', resolution: '1920x1080', fps: 25, is_streaming: true, ai_mode: 'Side Hazard' },
      { camera_id: 'CAM_04_RIGHT', mount_position: 'RIGHT', rtsp_url: 'rtsp://10.0.1.14:8554/right', resolution: '1920x1080', fps: 25, is_streaming: true, ai_mode: 'Side Hazard' }
    ]
  },
  {
    vehicle_id: 'PATROL_VAN_05',
    registration_number: 'GJ-01-GB-1102',
    vehicle_model: 'Mahindra Scorpio-N',
    police_station: 'Ellis Bridge Police Station',
    assigned_driver_officer: 'Insp. Arun Chudasama (Badge #EB-331)',
    jetson_device_serial: 'JETSON-AGX-5591-X4',
    sim_card_phone: '+91 98980 44109',
    is_active: true,
    telemetry: {
      latitude: 23.0195,
      longitude: 72.5714,
      speed_kmph: 15.3,
      heading_degrees: 220,
      battery_voltage: 12.7,
      jetson_temperature_c: 54.1,
      network_signal_dbm: -75,
      is_engine_running: true,
      last_ping: '5s ago'
    },
    cameras: [
      { camera_id: 'CAM_05_FRONT', mount_position: 'FRONT', rtsp_url: 'rtsp://10.0.1.15:8554/front', resolution: '1920x1080', fps: 25, is_streaming: true, ai_mode: 'Bridge Patrol' },
      { camera_id: 'CAM_05_REAR', mount_position: 'REAR', rtsp_url: 'rtsp://10.0.1.15:8554/rear', resolution: '1920x1080', fps: 25, is_streaming: true, ai_mode: 'ANPR' },
      { camera_id: 'CAM_05_LEFT', mount_position: 'LEFT', rtsp_url: 'rtsp://10.0.1.15:8554/left', resolution: '1920x1080', fps: 25, is_streaming: true, ai_mode: 'Waterfront Crowd' },
      { camera_id: 'CAM_05_RIGHT', mount_position: 'RIGHT', rtsp_url: 'rtsp://10.0.1.15:8554/right', resolution: '1920x1080', fps: 25, is_streaming: true, ai_mode: 'Waterfront Crowd' }
    ]
  }
];

export const STOLEN_WATCHLIST = [
  {
    plate_number: 'GJ01AB1234',
    vehicle_type: 'CAR (Hyundai Creta)',
    fir_number: 'FIR-2026-NAV-00492',
    police_station: 'Navrangpura Police Station',
    theft_date: '2026-10-18',
    owner_name: 'Devendra K. Sharma',
    alert_level: 'CRITICAL',
    is_active: true
  },
  {
    plate_number: 'GJ27BH9090',
    vehicle_type: 'MOTORCYCLE (KTM RC 390)',
    fir_number: 'FIR-2026-VAS-01120',
    police_station: 'Vastrapur Police Station',
    theft_date: '2026-10-24',
    owner_name: 'Manish R. Patel',
    alert_level: 'CRITICAL',
    is_active: true
  },
  {
    plate_number: 'MH02EK4455',
    vehicle_type: 'CAR (Toyota Fortuner)',
    fir_number: 'FIR-2026-CRIME-8812',
    police_station: 'Crime Branch HQ',
    theft_date: '2026-10-12',
    owner_name: 'Interstate Syndicate Alert',
    alert_level: 'ARMED_SUSPECT',
    is_active: true
  },
  {
    plate_number: 'GJ01DF7781',
    vehicle_type: 'TRUCK (Eicher Pro)',
    fir_number: 'FIR-2026-SGH-00913',
    police_station: 'SG Highway Police Station',
    theft_date: '2026-10-21',
    owner_name: 'Gujarat Logistics Ltd',
    alert_level: 'HIGH',
    is_active: true
  }
];

export const ANPR_DETECTION_EVENTS = [
  {
    event_id: 'ANPR-EVT-90412',
    vehicle_id: 'PATROL_VAN_01',
    camera_id: 'CAM_01_FRONT',
    timestamp: '10:19:42',
    detected_plate_number: 'GJ01AB1234',
    vehicle_classification: 'White SUV (Creta)',
    ocr_confidence: 99.4,
    is_stolen_match: true,
    latitude: 23.0374,
    longitude: 72.5619,
    plate_crop_image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=60',
    scene_snapshot_url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&auto=format&fit=crop&q=80',
    hq_sync_status: 'DELIVERED',
    fir_reference: 'FIR-2026-NAV-00492',
    location_name: 'Navrangpura Cross Roads (Eastbound)'
  },
  {
    event_id: 'ANPR-EVT-90411',
    vehicle_id: 'PATROL_VAN_04',
    camera_id: 'CAM_04_FRONT',
    timestamp: '10:18:15',
    detected_plate_number: 'GJ01EF8899',
    vehicle_classification: 'Sedan (Honda City)',
    ocr_confidence: 98.7,
    is_stolen_match: false,
    latitude: 23.0720,
    longitude: 72.5140,
    plate_crop_image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=60',
    scene_snapshot_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
    hq_sync_status: 'DELIVERED',
    location_name: 'SG Highway Flyover Entry'
  },
  {
    event_id: 'ANPR-EVT-90410',
    vehicle_id: 'PATROL_VAN_02',
    camera_id: 'CAM_02_REAR',
    timestamp: '10:16:30',
    detected_plate_number: 'GJ27BH9090',
    vehicle_classification: 'Motorcycle (KTM)',
    ocr_confidence: 97.9,
    is_stolen_match: true,
    latitude: 23.0352,
    longitude: 72.5290,
    plate_crop_image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&auto=format&fit=crop&q=60',
    scene_snapshot_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
    hq_sync_status: 'DELIVERED',
    fir_reference: 'FIR-2026-VAS-01120',
    location_name: 'Vastrapur Lake Circle'
  },
  {
    event_id: 'ANPR-EVT-90409',
    vehicle_id: 'PATROL_VAN_03',
    camera_id: 'CAM_03_FRONT',
    timestamp: '10:14:02',
    detected_plate_number: 'GJ01AZ3391',
    vehicle_classification: 'Auto Rickshaw',
    ocr_confidence: 96.2,
    is_stolen_match: false,
    latitude: 23.0295,
    longitude: 72.5191,
    plate_crop_image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=60',
    scene_snapshot_url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&auto=format&fit=crop&q=80',
    hq_sync_status: 'DELIVERED',
    location_name: 'Satellite Jodhpur Gam'
  },
  {
    event_id: 'ANPR-EVT-90408',
    vehicle_id: 'PATROL_VAN_05',
    camera_id: 'CAM_05_FRONT',
    timestamp: '10:11:45',
    detected_plate_number: 'GJ01KL7722',
    vehicle_classification: 'Commercial Bus (AMTS)',
    ocr_confidence: 99.1,
    is_stolen_match: false,
    latitude: 23.0198,
    longitude: 72.5719,
    plate_crop_image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=60',
    scene_snapshot_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
    hq_sync_status: 'DELIVERED',
    location_name: 'Ellis Bridge Approach'
  }
];

export const WEAPON_THREAT_DETECTIONS = [
  {
    threat_id: 'THREAT-WPN-1082',
    vehicle_id: 'PATROL_VAN_01',
    camera_id: 'CAM_01_FRONT',
    timestamp: '10:17:50',
    weapon_class: 'HANDGUN',
    confidence: 94.8,
    bounding_box_json: '{"x": 412, "y": 280, "w": 85, "h": 65, "class": "firearm_concealed"}',
    severity_level: 'CRITICAL_RED',
    latitude: 23.0371,
    longitude: 72.5610,
    operator_ack_by: 'Inspector Control-01',
    hq_sync_status: 'DELIVERED',
    location_name: 'Navrangpura Commercial Complex Alley',
    status: 'DISPATCHED',
    target_summary: 'Male suspect in dark hoodie carrying firearm, 120m ahead'
  },
  {
    threat_id: 'THREAT-WPN-1081',
    vehicle_id: 'PATROL_VAN_02',
    camera_id: 'CAM_02_RIGHT',
    timestamp: '09:42:18',
    weapon_class: 'KNIFE',
    confidence: 91.2,
    bounding_box_json: '{"x": 310, "y": 190, "w": 42, "h": 78, "class": "edged_weapon"}',
    severity_level: 'HIGH_AMBER',
    latitude: 23.0349,
    longitude: 72.5285,
    operator_ack_by: 'Officer Dave (Ground ACK)',
    hq_sync_status: 'DELIVERED',
    location_name: 'Vastrapur Public Garden Gate 2',
    status: 'NEUTRALIZED',
    target_summary: 'Machete/knife brandished during altercation, suspect restrained'
  },
  {
    threat_id: 'THREAT-WPN-1080',
    vehicle_id: 'PATROL_VAN_04',
    camera_id: 'CAM_04_FRONT',
    timestamp: '08:29:05',
    weapon_class: 'RIFLE',
    confidence: 96.5,
    bounding_box_json: '{"x": 520, "y": 140, "w": 110, "h": 145, "class": "tactical_long_barrel"}',
    severity_level: 'CRITICAL_RED',
    latitude: 23.0722,
    longitude: 72.5135,
    operator_ack_by: 'Pending Operator Ack',
    hq_sync_status: 'DELIVERED',
    location_name: 'SG Highway Service Road (near Warehouse)',
    status: 'ACTIVE_INTERCEPT',
    target_summary: 'Long barrel weapon detected in rear seat of black SUV'
  }
];

export const FIRE_SMOKE_DETECTIONS = [
  {
    hazard_id: 'HAZARD-FIRE-331',
    vehicle_id: 'PATROL_VAN_03',
    camera_id: 'CAM_03_LEFT',
    timestamp: '10:08:44',
    hazard_type: 'ACTIVE_FLAME',
    confidence: 96.3,
    smoke_density_level: 'HEAVY_BLACK',
    latitude: 23.0298,
    longitude: 72.5199,
    fire_brigade_notified: true,
    hq_sync_status: 'DELIVERED',
    location_name: 'Satellite Substation Compound',
    notes: 'Transformer burst with active flames; Fire Dept Station 4 enroute'
  },
  {
    hazard_id: 'HAZARD-FIRE-330',
    vehicle_id: 'PATROL_VAN_05',
    camera_id: 'CAM_05_RIGHT',
    timestamp: '09:15:20',
    hazard_type: 'SMOKE_PLUME',
    confidence: 88.7,
    smoke_density_level: 'MODERATE_GREY',
    latitude: 23.0201,
    longitude: 72.5724,
    fire_brigade_notified: true,
    hq_sync_status: 'DELIVERED',
    location_name: 'Riverfront Promenade Sector 3',
    notes: 'Municipal waste dump fire controlled by local patrol extinguishers'
  }
];

export const CROWD_ANALYTICS_EVENTS = [
  {
    crowd_event_id: 'CROWD-EVT-701',
    vehicle_id: 'PATROL_VAN_01',
    camera_id: 'CAM_01_RIGHT',
    timestamp: '10:15:32',
    head_count: 86,
    density_category: 'CRITICAL_SURGE',
    threshold_limit: 40,
    is_threshold_exceeded: true,
    latitude: 23.0379,
    longitude: 72.5625,
    location_name: 'Navrangpura University Circle',
    risk_level: 'HIGH',
    trend: '+38% in 10 mins'
  },
  {
    crowd_event_id: 'CROWD-EVT-702',
    vehicle_id: 'PATROL_VAN_04',
    camera_id: 'CAM_04_LEFT',
    timestamp: '10:12:10',
    head_count: 124,
    density_category: 'HIGH_DENSITY',
    threshold_limit: 50,
    is_threshold_exceeded: true,
    latitude: 23.0730,
    longitude: 72.5150,
    location_name: 'SG Highway Bus Rapid Transit Hub',
    risk_level: 'ALERT',
    trend: '+15% peak transit surge'
  },
  {
    crowd_event_id: 'CROWD-EVT-703',
    vehicle_id: 'PATROL_VAN_02',
    camera_id: 'CAM_02_RIGHT',
    timestamp: '10:05:40',
    head_count: 34,
    density_category: 'NORMAL_FLOW',
    threshold_limit: 40,
    is_threshold_exceeded: false,
    latitude: 23.0360,
    longitude: 72.5302,
    location_name: 'Vastrapur Food Park Entrance',
    risk_level: 'NORMAL',
    trend: 'Steady pedestrian pace'
  }
];

export const CENTRAL_API_DISPATCH_QUEUE = [
  {
    queue_id: 1485,
    event_id: 'ANPR-EVT-90412',
    event_type: 'ANPR_STOLEN_MATCH',
    destination_url: 'https://c4i.police.gujarat.gov.in/api/v1/telemetry/anpr',
    payload_json: '{"plate":"GJ01AB1234","stolen":true,"gps":[23.0374,72.5619]}',
    retry_count: 0,
    last_retry_at: '2026-10-27 10:19:43',
    delivery_status: 'DELIVERED'
  },
  {
    queue_id: 1484,
    event_id: 'THREAT-WPN-1082',
    event_type: 'WEAPON_ALERT',
    destination_url: 'https://c4i.police.gujarat.gov.in/api/v1/telemetry/weapons',
    payload_json: '{"weapon":"HANDGUN","conf":0.948,"van":"PATROL_VAN_01"}',
    retry_count: 0,
    last_retry_at: '2026-10-27 10:17:51',
    delivery_status: 'DELIVERED'
  },
  {
    queue_id: 1483,
    event_id: 'CROWD-EVT-701',
    event_type: 'CROWD_ANOMALY',
    destination_url: 'https://c4i.police.gujarat.gov.in/api/v1/telemetry/crowd',
    payload_json: '{"count":86,"threshold":40,"location":"Navrangpura"}',
    retry_count: 1,
    last_retry_at: '2026-10-27 10:16:10',
    delivery_status: 'QUEUED'
  },
  {
    queue_id: 1482,
    event_id: 'HAZARD-FIRE-331',
    event_type: 'FIRE_HAZARD',
    destination_url: 'https://c4i.police.gujarat.gov.in/api/v1/telemetry/hazards',
    payload_json: '{"hazard":"ACTIVE_FLAME","smoke":"HEAVY_BLACK"}',
    retry_count: 0,
    last_retry_at: '2026-10-27 10:08:45',
    delivery_status: 'DELIVERED'
  },
  {
    queue_id: 1481,
    event_id: 'TEL-SYNC-8821',
    event_type: 'GPS_TELEMETRY',
    destination_url: 'https://c4i.police.gujarat.gov.in/api/v1/telemetry/fleet',
    payload_json: '{"van_id":"PATROL_VAN_05","speed":15.3,"temp":54.1}',
    retry_count: 2,
    last_retry_at: '2026-10-27 10:15:00',
    delivery_status: 'RETRYING'
  }
];

// 24-Hour Timeline Data for Area/Line Chart
export const HOURLY_TIMELINE_DATA = [
  { hour: '00:00', anprCount: 140, threats: 0, fire: 0, crowdSurges: 0 },
  { hour: '02:00', anprCount: 95, threats: 1, fire: 0, crowdSurges: 0 },
  { hour: '04:00', anprCount: 60, threats: 0, fire: 1, crowdSurges: 0 },
  { hour: '06:00', anprCount: 210, threats: 0, fire: 0, crowdSurges: 1 },
  { hour: '08:00', anprCount: 520, threats: 1, fire: 0, crowdSurges: 3 },
  { hour: '09:00', anprCount: 680, threats: 1, fire: 1, crowdSurges: 4 },
  { hour: '10:00', anprCount: 790, threats: 2, fire: 1, crowdSurges: 5 },
  { hour: '11:00', anprCount: 640, threats: 0, fire: 0, crowdSurges: 2 },
  { hour: '12:00', anprCount: 580, threats: 1, fire: 0, crowdSurges: 2 },
  { hour: '14:00', anprCount: 490, threats: 0, fire: 0, crowdSurges: 1 },
  { hour: '16:00', anprCount: 610, threats: 0, fire: 1, crowdSurges: 3 },
  { hour: '18:00', anprCount: 840, threats: 2, fire: 0, crowdSurges: 6 },
  { hour: '20:00', anprCount: 920, threats: 3, fire: 1, crowdSurges: 7 },
  { hour: '22:00', anprCount: 480, threats: 1, fire: 0, crowdSurges: 2 }
];

// Breakdown of Threat & Watchlist Matches by Category
export const THREAT_DISTRIBUTION_DATA = [
  { label: 'Stolen Vehicles (ANPR)', count: 7, percentage: 41, color: '#ef4444' },
  { label: 'Weapon Detections', count: 3, percentage: 18, color: '#f97316' },
  { label: 'Fire & Smoke Hazards', count: 2, percentage: 12, color: '#eab308' },
  { label: 'Crowd Threshold Breaches', count: 5, percentage: 29, color: '#06b6d4' }
];

// Edge Jetson Thermal & Hardware Telemetry across Fleet
export const JETSON_FLEET_HARDWARE = [
  { id: 'VAN-01', model: 'Scorpio-N', temp: 46.5, volt: 13.4, speed: 44.5, signal: -64, status: 'OPTIMAL' },
  { id: 'VAN-02', model: 'Safari', temp: 51.2, volt: 12.9, speed: 28.0, signal: -71, status: 'NORMAL' },
  { id: 'VAN-03', model: 'Scorpio', temp: 44.8, volt: 13.6, speed: 52.1, signal: -61, status: 'OPTIMAL' },
  { id: 'VAN-04', model: 'Innova', temp: 48.9, volt: 13.1, speed: 61.8, signal: -68, status: 'OPTIMAL' },
  { id: 'VAN-05', model: 'Scorpio-N', temp: 58.4, volt: 12.7, speed: 15.3, signal: -75, status: 'WARM' },
  { id: 'VAN-06', model: 'Innova', temp: 43.1, volt: 13.5, speed: 35.0, signal: -63, status: 'OPTIMAL' },
  { id: 'VAN-07', model: 'Safari', temp: 62.0, volt: 12.4, speed: 0.0, signal: -82, status: 'ALERT_HIGH_TEMP' },
  { id: 'VAN-08', model: 'Scorpio-N', temp: 45.0, volt: 13.3, speed: 42.0, signal: -65, status: 'OPTIMAL' }
];

// Vehicle Classification Distribution
export const VEHICLE_CLASSIFICATION_STATS = [
  { type: 'Private Sedan / Hatchback', count: 1840, percent: 48, color: '#3b82f6' },
  { type: 'SUVs & Tactical Vans', count: 960, percent: 25, color: '#6366f1' },
  { type: 'Two-Wheelers (Motorcycle/Scooter)', count: 650, percent: 17, color: '#10b981' },
  { type: 'Commercial Goods & Trucks', count: 240, percent: 6, color: '#f59e0b' },
  { type: 'Public Buses / Rickshaws', count: 152, percent: 4, color: '#ec4899' }
];

// Police Officer Master Dataset
export const POLICE_OFFICERS = [
  {
    officer_id: 'OFFICER_001',
    badge_number: 'GJ-NP-402',
    officer_name: 'Vikram Solanki',
    rank: 'Police Inspector (PI)',
    police_station: 'Navrangpura Police Station',
    contact_number: '+91 98250 11201',
    email: 'vikram.solanki@gujaratpolice.gov.in',
    assigned_vehicle_id: 'PATROL_VAN_01',
    assigned_vehicle_plate: 'GJ-01-G-9999',
    shift: 'Day Shift (08:00 - 18:00)',
    blood_group: 'B+',
    emergency_contact: '+91 98250 99881',
    joined_date: '2015-06-12',
    is_active: true
  },
  {
    officer_id: 'OFFICER_002',
    badge_number: 'GJ-VP-219',
    officer_name: 'Rajesh Dave',
    rank: 'Police Sub-Inspector (PSI)',
    police_station: 'Vastrapur Police Station',
    contact_number: '+91 98250 88741',
    email: 'rajesh.dave@gujaratpolice.gov.in',
    assigned_vehicle_id: 'PATROL_VAN_02',
    assigned_vehicle_plate: 'GJ-01-GA-3421',
    shift: 'Night Shift (18:00 - 04:00)',
    blood_group: 'O+',
    emergency_contact: '+91 98250 33412',
    joined_date: '2018-03-20',
    is_active: true
  },
  {
    officer_id: 'OFFICER_003',
    badge_number: 'GJ-SP-105',
    officer_name: 'Priya Patel',
    rank: 'Police Sub-Inspector (PSI)',
    police_station: 'Satellite Police Station',
    contact_number: '+91 97240 55190',
    email: 'priya.patel@gujaratpolice.gov.in',
    assigned_vehicle_id: 'PATROL_VAN_03',
    assigned_vehicle_plate: 'GJ-01-GX-8008',
    shift: 'Day Shift (08:00 - 18:00)',
    blood_group: 'A+',
    emergency_contact: '+91 97240 11094',
    joined_date: '2020-01-15',
    is_active: true
  },
  {
    officer_id: 'OFFICER_004',
    badge_number: 'GJ-SG-789',
    officer_name: 'Hitesh Parmar',
    rank: 'Assistant Sub-Inspector (ASI)',
    police_station: 'SG Highway Police Station',
    contact_number: '+91 94280 66321',
    email: 'hitesh.parmar@gujaratpolice.gov.in',
    assigned_vehicle_id: 'PATROL_VAN_04',
    assigned_vehicle_plate: 'GJ-01-G-7712',
    shift: 'Emergency Response (24x7)',
    blood_group: 'AB+',
    emergency_contact: '+91 94280 44510',
    joined_date: '2012-11-05',
    is_active: true
  },
  {
    officer_id: 'OFFICER_005',
    badge_number: 'GJ-EB-331',
    officer_name: 'Arun Chudasama',
    rank: 'Police Inspector (PI)',
    police_station: 'Ellis Bridge Police Station',
    contact_number: '+91 98980 44109',
    email: 'arun.chudasama@gujaratpolice.gov.in',
    assigned_vehicle_id: 'PATROL_VAN_05',
    assigned_vehicle_plate: 'GJ-01-GB-1102',
    shift: 'Day Shift (08:00 - 18:00)',
    blood_group: 'O+',
    emergency_contact: '+91 98980 11984',
    joined_date: '2014-08-22',
    is_active: true
  },
  {
    officer_id: 'OFFICER_006',
    badge_number: 'GJ-NP-512',
    officer_name: 'Mahesh Vaghela',
    rank: 'Head Constable (HC)',
    police_station: 'Navrangpura Police Station',
    contact_number: '+91 98251 22340',
    email: 'mahesh.vaghela@gujaratpolice.gov.in',
    assigned_vehicle_id: 'None',
    assigned_vehicle_plate: 'Unassigned',
    shift: 'Night Shift (18:00 - 04:00)',
    blood_group: 'B+',
    emergency_contact: '+91 98251 77651',
    joined_date: '2016-04-10',
    is_active: false
  },
  {
    officer_id: 'OFFICER_007',
    badge_number: 'GJ-VP-620',
    officer_name: 'Sunil Rathod',
    rank: 'Police Constable (PC)',
    police_station: 'Vastrapur Police Station',
    contact_number: '+91 98790 44321',
    email: 'sunil.rathod@gujaratpolice.gov.in',
    assigned_vehicle_id: 'None',
    assigned_vehicle_plate: 'Unassigned',
    shift: 'Day Shift (08:00 - 18:00)',
    blood_group: 'A+',
    emergency_contact: '+91 98790 88902',
    joined_date: '2021-09-01',
    is_active: true
  }
];

// Vehicle Against Cameras Mapping Dataset
export const VEHICLE_CAMERA_MAPPINGS = [
  {
    mapping_id: 'VCM-001',
    vehicle_id: 'PATROL_VAN_01',
    registration_number: 'GJ-01-G-9999',
    vehicle_model: 'Mahindra Scorpio-N (Tactical 4x4)',
    police_station: 'Navrangpura Police Station',
    camera_id: 'CAM_01_FRONT',
    camera_name: 'Front Windshield 4K ANPR',
    mount_position: 'FRONT',
    resolution: '1920x1080 (1080p)',
    fps: 25,
    ai_mode: 'ANPR + Weapon AI',
    rtsp_url: 'rtsp://10.0.1.11:8554/front_4k',
    codec: 'H.265 / HEVC',
    is_streaming: true
  },
  {
    mapping_id: 'VCM-002',
    vehicle_id: 'PATROL_VAN_01',
    registration_number: 'GJ-01-G-9999',
    vehicle_model: 'Mahindra Scorpio-N (Tactical 4x4)',
    police_station: 'Navrangpura Police Station',
    camera_id: 'CAM_01_REAR',
    camera_name: 'Rear Bumper Surveillance',
    mount_position: 'REAR',
    resolution: '1920x1080 (1080p)',
    fps: 25,
    ai_mode: 'ANPR Watchlist',
    rtsp_url: 'rtsp://10.0.1.11:8554/rear_1080',
    codec: 'H.264 / AVC',
    is_streaming: true
  },
  {
    mapping_id: 'VCM-003',
    vehicle_id: 'PATROL_VAN_01',
    registration_number: 'GJ-01-G-9999',
    vehicle_model: 'Mahindra Scorpio-N (Tactical 4x4)',
    police_station: 'Navrangpura Police Station',
    camera_id: 'CAM_01_LEFT',
    camera_name: 'Left Flank Perimeter Lens',
    mount_position: 'LEFT_FLANK',
    resolution: '1920x1080 (1080p)',
    fps: 25,
    ai_mode: 'Crowd & Fire AI',
    rtsp_url: 'rtsp://10.0.1.11:8554/left_flank',
    codec: 'H.265 / HEVC',
    is_streaming: true
  },
  {
    mapping_id: 'VCM-004',
    vehicle_id: 'PATROL_VAN_01',
    registration_number: 'GJ-01-G-9999',
    vehicle_model: 'Mahindra Scorpio-N (Tactical 4x4)',
    police_station: 'Navrangpura Police Station',
    camera_id: 'CAM_01_RIGHT',
    camera_name: 'Right Flank Traffic Lens',
    mount_position: 'RIGHT_FLANK',
    resolution: '1920x1080 (1080p)',
    fps: 25,
    ai_mode: 'Crowd Analytics',
    rtsp_url: 'rtsp://10.0.1.11:8554/right_flank',
    codec: 'H.265 / HEVC',
    is_streaming: true
  },
  {
    mapping_id: 'VCM-005',
    vehicle_id: 'PATROL_VAN_02',
    registration_number: 'GJ-01-GA-3421',
    vehicle_model: 'Tata Safari Stealth Patrol',
    police_station: 'Vastrapur Police Station',
    camera_id: 'CAM_02_FRONT',
    camera_name: 'Front Roof ANPR Array',
    mount_position: 'FRONT',
    resolution: '1920x1080 (1080p)',
    fps: 25,
    ai_mode: 'ANPR + Threat Detection',
    rtsp_url: 'rtsp://10.0.1.12:8554/front',
    codec: 'H.265 / HEVC',
    is_streaming: true
  },
  {
    mapping_id: 'VCM-006',
    vehicle_id: 'PATROL_VAN_02',
    registration_number: 'GJ-01-GA-3421',
    vehicle_model: 'Tata Safari Stealth Patrol',
    police_station: 'Vastrapur Police Station',
    camera_id: 'CAM_02_REAR',
    camera_name: 'Rear Bumper ANPR',
    mount_position: 'REAR',
    resolution: '1920x1080 (1080p)',
    fps: 25,
    ai_mode: 'ANPR Tracking',
    rtsp_url: 'rtsp://10.0.1.12:8554/rear',
    codec: 'H.264 / AVC',
    is_streaming: true
  },
  {
    mapping_id: 'VCM-007',
    vehicle_id: 'PATROL_VAN_02',
    registration_number: 'GJ-01-GA-3421',
    vehicle_model: 'Tata Safari Stealth Patrol',
    police_station: 'Vastrapur Police Station',
    camera_id: 'CAM_02_LEFT',
    camera_name: 'Flank Hazard Sensor',
    mount_position: 'LEFT_FLANK',
    resolution: '1920x1080 (1080p)',
    fps: 25,
    ai_mode: 'Fire Detection',
    rtsp_url: 'rtsp://10.0.1.12:8554/left',
    codec: 'H.264 / AVC',
    is_streaming: false
  },
  {
    mapping_id: 'VCM-008',
    vehicle_id: 'PATROL_VAN_03',
    registration_number: 'GJ-01-GX-8008',
    vehicle_model: 'Mahindra Scorpio Classic',
    police_station: 'Satellite Police Station',
    camera_id: 'CAM_03_FRONT',
    camera_name: 'Front Highway ANPR Unit',
    mount_position: 'FRONT',
    resolution: '1920x1080 (1080p)',
    fps: 25,
    ai_mode: 'Multi-Object AI',
    rtsp_url: 'rtsp://10.0.1.13:8554/front',
    codec: 'H.265 / HEVC',
    is_streaming: true
  },
  {
    mapping_id: 'VCM-009',
    vehicle_id: 'PATROL_VAN_03',
    registration_number: 'GJ-01-GX-8008',
    vehicle_model: 'Mahindra Scorpio Classic',
    police_station: 'Satellite Police Station',
    camera_id: 'CAM_03_CABIN',
    camera_name: 'Cabin Driver Dashcam',
    mount_position: 'CABIN_INTERIOR',
    resolution: '1280x720 (720p HD)',
    fps: 30,
    ai_mode: 'Driver Drowsiness Alert',
    rtsp_url: 'rtsp://10.0.1.13:8554/cabin',
    codec: 'H.264 / AVC',
    is_streaming: true
  },
  {
    mapping_id: 'VCM-010',
    vehicle_id: 'PATROL_VAN_04',
    registration_number: 'GJ-01-G-7712',
    vehicle_model: 'Toyota Innova Crysta Command',
    police_station: 'SG Highway Police Station',
    camera_id: 'CAM_04_FRONT',
    camera_name: 'Front Highway Speed & Plate',
    mount_position: 'FRONT',
    resolution: '1920x1080 (1080p)',
    fps: 30,
    ai_mode: 'ANPR Highway Watch',
    rtsp_url: 'rtsp://10.0.1.14:8554/front',
    codec: 'H.265 / HEVC',
    is_streaming: true
  },
  {
    mapping_id: 'VCM-011',
    vehicle_id: 'PATROL_VAN_05',
    registration_number: 'GJ-01-GB-1102',
    vehicle_model: 'Mahindra Scorpio-N',
    police_station: 'Ellis Bridge Police Station',
    camera_id: 'CAM_05_FRONT',
    camera_name: 'Riverfront Patrol Dual Lens',
    mount_position: 'FRONT',
    resolution: '1920x1080 (1080p)',
    fps: 25,
    ai_mode: 'Bridge Patrol & ANPR',
    rtsp_url: 'rtsp://10.0.1.15:8554/front',
    codec: 'H.265 / HEVC',
    is_streaming: true
  }
];

// Wanted Suspects & Criminal Registry Dataset
export const WANTED_SUSPECTS = [
  {
    suspect_id: 'SUS-2026-001',
    full_name: 'Devendra K. Sharma',
    alias: 'Deva Shooter',
    fir_number: 'FIR-2026-NAV-00492',
    crime_category: 'Armed Carjacking & Robbery',
    threat_level: 'CRITICAL',
    wanted_by_station: 'Navrangpura Police Station',
    bounty_reward: '₹1,00,000',
    associated_vehicle: 'GJ01AB1234',
    associated_vehicle_desc: 'Hyundai Creta (White)',
    last_seen: 'SG Highway Junction',
    status: 'WANTED',
    reported_date: '2026-10-18'
  },
  {
    suspect_id: 'SUS-2026-002',
    full_name: 'Rameshwar "Bhaiya" Yadav',
    alias: 'Bhaiya Ji',
    fir_number: 'FIR-2026-CRIME-8812',
    crime_category: 'Interstate Syndicate & Arms Trafficking',
    threat_level: 'CRITICAL',
    wanted_by_station: 'Crime Branch HQ',
    bounty_reward: '₹2,50,000',
    associated_vehicle: 'MH02EK4455',
    associated_vehicle_desc: 'Toyota Fortuner (Black)',
    last_seen: 'SP Ring Road Toll Plaza',
    status: 'WANTED',
    reported_date: '2026-10-12'
  },
  {
    suspect_id: 'SUS-2026-003',
    full_name: 'Ketan M. Vaghela',
    alias: 'Kittu Chopper',
    fir_number: 'FIR-2026-VAS-01120',
    crime_category: 'Motorcycle Theft & Snatching',
    threat_level: 'HIGH',
    wanted_by_station: 'Vastrapur Police Station',
    bounty_reward: '₹25,000',
    associated_vehicle: 'GJ27BH9090',
    associated_vehicle_desc: 'KTM RC 390 (Orange/Black)',
    last_seen: 'Vastrapur Lake Circle',
    status: 'WANTED',
    reported_date: '2026-10-24'
  },
  {
    suspect_id: 'SUS-2026-004',
    full_name: 'Aslam Pathan',
    alias: 'Chhota Aslam',
    fir_number: 'FIR-2026-EB-00381',
    crime_category: 'Commercial Extortion & Assault',
    threat_level: 'HIGH',
    wanted_by_station: 'Ellis Bridge Police Station',
    bounty_reward: '₹50,000',
    associated_vehicle: 'GJ01DF7781',
    associated_vehicle_desc: 'Eicher Pro Truck',
    last_seen: 'Riverfront West Promenade',
    status: 'WANTED',
    reported_date: '2026-10-21'
  },
  {
    suspect_id: 'SUS-2026-005',
    full_name: 'Dharmesh "Chikna" Chauhan',
    alias: 'Chikna',
    fir_number: 'FIR-2026-SAT-00742',
    crime_category: 'Cyber Financial Fraud & SIM Swap',
    threat_level: 'MODERATE',
    wanted_by_station: 'Satellite Police Station',
    bounty_reward: 'None',
    associated_vehicle: 'GJ01KB8823',
    associated_vehicle_desc: 'Honda City (Silver)',
    last_seen: 'Prahlad Nagar Corporate Road',
    status: 'WANTED',
    reported_date: '2026-10-15'
  },
  {
    suspect_id: 'SUS-2026-006',
    full_name: 'Prakash S. Marwadi',
    alias: 'Pakiya',
    fir_number: 'FIR-2026-NAV-00109',
    crime_category: 'Liquor Smuggling & Bootlegging',
    threat_level: 'MODERATE',
    wanted_by_station: 'Navrangpura Police Station',
    bounty_reward: '₹10,000',
    associated_vehicle: 'GJ01XX9981',
    associated_vehicle_desc: 'Mahindra Bolero',
    last_seen: 'Sarkhej Toll Naka',
    status: 'APPREHENDED',
    reported_date: '2026-09-30'
  },
  {
    suspect_id: 'SUS-2026-007',
    full_name: 'Suraj "Billa" Thakor',
    alias: 'Billa',
    fir_number: 'FIR-2026-SGH-01402',
    crime_category: 'Highway Robbery & Hijacking',
    threat_level: 'CRITICAL',
    wanted_by_station: 'SG Highway Police Station',
    bounty_reward: '₹1,50,000',
    associated_vehicle: 'GJ01G7712',
    associated_vehicle_desc: 'Scorpio Classic',
    last_seen: 'Gota Flyover Underpass',
    status: 'WANTED',
    reported_date: '2026-10-25'
  }
];

// Weapons & Tactical Threat Detection Events Dataset
export const WEAPON_DETECTION_EVENTS = [
  {
    event_id: 'WPN-2026-001',
    weapon_type: 'Semi-Automatic Pistol (9mm)',
    weapon_category: 'FIREARM',
    confidence_score: 97.8,
    vehicle_id: 'PATROL_VAN_01',
    registration_number: 'GJ-01-G-9999',
    camera_channel: 'CAM_01_FRONT',
    location_name: 'Navrangpura Circle, Near Municipal Market',
    latitude: 23.0372,
    longitude: 72.5613,
    police_station: 'Navrangpura Police Station',
    detected_timestamp: '2026-10-27 12:45:10',
    threat_level: 'CRITICAL',
    incident_status: 'DISPATCHED',
    assigned_officer: 'Insp. Vikram Solanki (Badge #NP-402)',
    ai_model: 'YOLOv8-Tactical-Weapon-v3'
  },
  {
    event_id: 'WPN-2026-002',
    weapon_type: 'Assault Rifle (AK Platform Pattern)',
    weapon_category: 'FIREARM',
    confidence_score: 99.2,
    vehicle_id: 'PATROL_VAN_04',
    registration_number: 'GJ-01-G-7712',
    camera_channel: 'CAM_04_FRONT',
    location_name: 'SG Highway, Gota Flyover Approach',
    latitude: 23.0715,
    longitude: 72.5142,
    police_station: 'SG Highway Police Station',
    detected_timestamp: '2026-10-27 11:20:45',
    threat_level: 'CRITICAL',
    incident_status: 'DISPATCHED',
    assigned_officer: 'ASI Hitesh Parmar (Badge #SG-789)',
    ai_model: 'YOLOv8-Tactical-Weapon-v3'
  },
  {
    event_id: 'WPN-2026-003',
    weapon_type: 'Combat Machete / Chopper (14-inch)',
    weapon_category: 'EDGED_BLADE',
    confidence_score: 94.6,
    vehicle_id: 'PATROL_VAN_02',
    registration_number: 'GJ-01-GA-3421',
    camera_channel: 'CAM_02_FRONT',
    location_name: 'Vastrapur Lake Outer Walkway',
    latitude: 23.0358,
    longitude: 72.5298,
    police_station: 'Vastrapur Police Station',
    detected_timestamp: '2026-10-27 10:14:22',
    threat_level: 'HIGH',
    incident_status: 'INVESTIGATING',
    assigned_officer: 'PSI Rajesh Dave (Badge #VP-219)',
    ai_model: 'YOLOv8-Tactical-Weapon-v3'
  },
  {
    event_id: 'WPN-2026-004',
    weapon_type: 'Concealed Waistband Holster Imprint',
    weapon_category: 'HOLSTER_CONCEALED',
    confidence_score: 89.1,
    vehicle_id: 'PATROL_VAN_03',
    registration_number: 'GJ-01-GX-8008',
    camera_channel: 'CAM_03_FRONT',
    location_name: 'Satellite Road, Near ISRO Colony',
    latitude: 23.0289,
    longitude: 72.5187,
    police_station: 'Satellite Police Station',
    detected_timestamp: '2026-10-27 09:35:18',
    threat_level: 'MODERATE',
    incident_status: 'INVESTIGATING',
    assigned_officer: 'Sub-Insp. Priya Patel (Badge #SP-105)',
    ai_model: 'YOLOv8-Tactical-Weapon-v3'
  },
  {
    event_id: 'WPN-2026-005',
    weapon_type: 'Hunting Knife (Serrated Edge)',
    weapon_category: 'EDGED_BLADE',
    confidence_score: 96.0,
    vehicle_id: 'PATROL_VAN_05',
    registration_number: 'GJ-01-GB-1102',
    camera_channel: 'CAM_05_FRONT',
    location_name: 'Ellis Bridge Lower Waterfront Promenade',
    latitude: 23.0195,
    longitude: 72.5714,
    police_station: 'Ellis Bridge Police Station',
    detected_timestamp: '2026-10-27 08:50:02',
    threat_level: 'HIGH',
    incident_status: 'NEUTRALIZED',
    assigned_officer: 'Insp. Arun Chudasama (Badge #EB-331)',
    ai_model: 'YOLOv8-Tactical-Weapon-v3'
  },
  {
    event_id: 'WPN-2026-006',
    weapon_type: 'Country-Made Revolver (Desi Katta)',
    weapon_category: 'FIREARM',
    confidence_score: 95.3,
    vehicle_id: 'PATROL_VAN_01',
    registration_number: 'GJ-01-G-9999',
    camera_channel: 'CAM_01_FRONT',
    location_name: 'Law Garden Food Street Intersection',
    latitude: 23.0270,
    longitude: 72.5590,
    police_station: 'Navrangpura Police Station',
    detected_timestamp: '2026-10-26 23:18:40',
    threat_level: 'CRITICAL',
    incident_status: 'NEUTRALIZED',
    assigned_officer: 'Insp. Vikram Solanki (Badge #NP-402)',
    ai_model: 'YOLOv8-Tactical-Weapon-v3'
  },
  {
    event_id: 'WPN-2026-007',
    weapon_type: 'Tactical Dagger (Double Edged)',
    weapon_category: 'EDGED_BLADE',
    confidence_score: 91.8,
    vehicle_id: 'PATROL_VAN_02',
    registration_number: 'GJ-01-GA-3421',
    camera_channel: 'CAM_02_REAR',
    location_name: 'IIM Ahmedabad Cross Roads',
    latitude: 23.0310,
    longitude: 72.5312,
    police_station: 'Vastrapur Police Station',
    detected_timestamp: '2026-10-26 21:05:12',
    threat_level: 'HIGH',
    incident_status: 'NEUTRALIZED',
    assigned_officer: 'PSI Rajesh Dave (Badge #VP-219)',
    ai_model: 'YOLOv8-Tactical-Weapon-v3'
  }
];


