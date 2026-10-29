import React from 'react';
import Dashboard from '../pages/Dashboard';
import PatrollingList from '../pages/patrolling/PatrollingList';
import VehicleDetail from '../pages/patrolling/VehicleDetail';
import VahicalList from '../pages/vehicalMaster/VahicalList';
import UserMaster from '../pages/user/UserMaster';
import CameraList from '../pages/cameraMaster/CameraList';
import VehicleCameras from '../pages/cameraMaster/VehicleCameras';
import WeaponsDetectionList from '../pages/reports/WeaponsDetectionList';
import WantedSuspectList from '../pages/reports/WantedSuspectList';
import SuspectDetail from '../pages/reports/SuspectDetail';
import AiAlerts from '../pages/aialert/AiAlerts';
import Login from '../pages/auth/Login';
import OfficerCockpit from '../pages/officer/OfficerCockpit';
import OfficerAlerts from '../pages/officer/OfficerAlerts';
import PlateLookup from '../pages/officer/PlateLookup';
import {
  IconDashboard,
  IconCar,
  IconUsers,
  IconCamera,
  IconVideo,
  IconCrosshair,
  IconAlertTriangle,
  IconSettings
} from '../components/common/Icons';

/**
 * =========================================================================
 * CENTRALIZED ROUTES & NAVIGATION CONFIGURATION WITH RBAC
 * =========================================================================
 * - Officer / Field User: Focused on Tactical In-Vehicle Cockpit, Alerts, Plate Lookup
 * - Admin: Full Master CRUD (Users, Vehicles, Cameras, Reports) + Tactical Edge
 */

export const NAV_SECTIONS = [
  // 1. OFFICER TACTICAL EDGE (Accessible by Officers, Field Users, and Admin)
  {
    title: 'Tactical Edge Operations',
    forRoles: ['officer', 'user', 'admin'],
    items: [
      {
        path: '/officer/cockpit',
        label: 'In-Vehicle Cockpit',
        icon: <IconCar size={17} />,
        element: OfficerCockpit,
        badge: 'EDGE',
        isOfficerHome: true
      },
      {
        path: '/officer/alerts',
        label: 'AI Alerts Stream',
        icon: <IconAlertTriangle size={17} />,
        element: OfficerAlerts
      },
      {
        path: '/officer/plate-lookup',
        label: 'Plate Hotlist Search',
        icon: <IconCrosshair size={17} />,
        element: PlateLookup
      },
      {
        path: '/patrolling',
        label: 'Patrolling Map',
        icon: <IconCar size={17} />,
        element: PatrollingList
      }
    ]
  },

  // 2. FIELD THREAT INTELLIGENCE (Shared: Officers & Admins)
  {
    title: 'Threat Intelligence',
    forRoles: ['officer', 'user', 'admin'],
    items: [
      {
        path: '/reports/wanted-suspects',
        label: 'Wanted Suspects (FRS)',
        icon: <IconAlertTriangle size={16} />,
        element: WantedSuspectList
      },
      {
        path: '/weapon-detection',
        label: 'Weapon Threats',
        icon: <IconCrosshair size={17} />,
        element: WeaponsDetectionList
      }
    ]
  },

  // 3. ADMIN MASTER DIRECTORY (ADMIN ONLY)
  {
    title: 'Admin Master Menu',
    isMasterMenu: true,
    forRoles: ['admin'],
    icon: <IconSettings size={16} />,
    items: [
      {
        path: '/admin/users',
        label: 'User Master',
        icon: <IconUsers size={16} />,
        element: UserMaster
      },
      {
        path: '/admin/vehicles',
        label: 'Vehicles Master',
        icon: <IconCar size={16} />,
        element: VahicalList
      },
      {
        path: '/admin/cameras',
        label: 'Camera Master',
        icon: <IconCamera size={16} />,
        element: CameraList
      }
    ]
  },

  // 4. COMMAND OVERVIEW & AUDIT (ADMIN ONLY)
  {
    title: 'Command Intelligence',
    forRoles: ['admin'],
    items: [
      {
        path: '/dashboard',
        label: 'Command Dashboard',
        icon: <IconDashboard size={17} />,
        element: Dashboard,
        isDefault: true
      },
      {
        path: '/ai-alerts',
        label: 'Ai Alerts (Admin Table)',
        icon: <IconCrosshair size={17} />,
        element: AiAlerts
      }
    ]
  }
];

// Helper to filter navigation sections for the active user role
export const getNavSectionsForRole = (role = 'user') => {
  const normRole = (role || 'user').toLowerCase();
  return NAV_SECTIONS.filter((sec) => {
    if (!sec.forRoles) return true;
    return sec.forRoles.includes(normRole);
  });
};

// Any routes not shown directly in sidebar (details, aliases, etc.)
export const EXTRA_ROUTES = [
  {
    path: '/login',
    label: 'Command Center Login',
    element: Login
  },
  {
    path: '/officer',
    label: 'Officer Cockpit',
    element: OfficerCockpit
  },
  {
    path: '/patrolling/:vehicleId',
    label: 'Vehicle Dedicated Surveillance',
    element: VehicleDetail
  },
  {
    path: '/reports/wanted-suspects/:suspectId',
    label: 'Suspect Details & Dossier',
    element: SuspectDetail
  },
  // Legacy aliases
  {
    path: '/vehicles',
    label: 'Vehicles Master',
    element: VahicalList
  },
  {
    path: '/police-master',
    label: 'Police Master',
    element: UserMaster
  },
  {
    path: '/vehicle-cameras',
    label: 'Vehicle Cameras',
    element: VehicleCameras
  },
  {
    path: '/reports/weapons-detection',
    label: 'Weapons Detection',
    element: WeaponsDetectionList
  }
];

// Helper to flatten all routes for the router
export const getAllRoutes = () => {
  const routes = [];
  NAV_SECTIONS.forEach((section) => {
    section.items.forEach((item) => {
      routes.push(item);
    });
  });
  return [...routes, ...EXTRA_ROUTES];
};
