import React from 'react';
import Dashboard from '../pages/Dashboard';
import PatrollingList from '../pages/patrolling/PatrollingList';
import VehicleDetail from '../pages/patrolling/VehicleDetail';
import VahicalList from '../pages/vehicalMaster/VahicalList';
import PoliceMaster from '../pages/policeMaster/PoliceMaster';
import CameraList from '../pages/cameraMaster/CameraList';
import VehicleCameras from '../pages/cameraMaster/VehicleCameras';
import WeaponsDetectionList from '../pages/reports/WeaponsDetectionList';
import WantedSuspectList from '../pages/reports/WantedSuspectList';
import SuspectDetail from '../pages/reports/SuspectDetail';
import Login from '../pages/auth/Login';
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
 * CENTRALIZED ROUTES & NAVIGATION CONFIGURATION
 * =========================================================================
 * Strictly ordered as requested:
 * 1. Admin (Master Menu)
 *    - User
 *    - Vehicles
 *    - Camera
 *    - Camera Mapping [Vehicle + Camera (Multiple)]
 * 2. Dashboard
 * 3. Patrolling (5-grid column layout -> Dedicated Vehicle Live Cameras & Alerts)
 * 4. Weapon Detection
 */

export const NAV_SECTIONS = [
  {
    title: 'Admin',
    isMasterMenu: true,
    icon: <IconSettings size={16} />,
    items: [
      {
        path: '/admin/users',
        label: 'User',
        icon: <IconUsers size={16} />,
        element: PoliceMaster
      },
      {
        path: '/admin/vehicles',
        label: 'Vehicles',
        icon: <IconCar size={16} />,
        element: VahicalList
      },
      {
        path: '/admin/cameras',
        label: 'Camera',
        icon: <IconCamera size={16} />,
        element: CameraList
      },
      {
        path: '/admin/camera-mapping',
        label: 'Camera Mapping',
        sublabel: 'Vehicle + Camera (Multiple)',
        icon: <IconVideo size={16} />,
        element: VehicleCameras
      }
    ]
  },
  {
    title: 'Operations',
    items: [
      {
        path: '/dashboard',
        label: 'Dashboard',
        icon: <IconDashboard size={17} />,
        element: Dashboard,
        badge: 'LIVE',
        badgeClass: 'bg-success-subtle text-success border border-success-subtle',
        isDefault: true
      },
      {
        path: '/patrolling',
        label: 'Patrolling',
        icon: <IconCar size={17} />,
        element: PatrollingList,
        badge: '5-GRID',
        badgeClass: 'bg-primary-subtle text-primary border border-primary-subtle'
      }
    ]
  },
  {
    title: 'Intelligence Reports',
    items: [
      {
        path: '/reports/wanted-suspects',
        label: 'Wanted Suspects',
        icon: <IconAlertTriangle size={16} />,
        badge: 'WANTED',
        badgeClass: 'bg-danger-subtle text-danger border border-danger-subtle',
        element: WantedSuspectList
      },
      {
        path: '/weapon-detection',
        label: 'Weapon Detection',
        icon: <IconCrosshair size={17} />,
        element: WeaponsDetectionList,
        badge: 'THREAT',
        badgeClass: 'bg-danger-subtle text-danger border border-danger-subtle'
      }
    ]
  }
];

// Any routes not shown directly in sidebar (e.g. details, legacy aliases)
export const EXTRA_ROUTES = [
  {
    path: '/login',
    label: 'Command Center Login',
    element: Login
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
  // Legacy aliases for backward compatibility
  {
    path: '/vehicles',
    label: 'Vehicles Master',
    element: VahicalList
  },
  {
    path: '/police-master',
    label: 'Police Master',
    element: PoliceMaster
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
