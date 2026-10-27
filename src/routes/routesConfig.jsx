import React from 'react';
import Dashboard from '../pages/Dashboard';
import VahicalList from '../pages/vehicalMaster/VahicalList';
import PoliceMaster from '../pages/policeMaster/PoliceMaster';
import VehicleCameras from '../pages/cameraMaster/VehicleCameras';
import AnprWatchlist from '../pages/anpr/AnprWatchlist';
import WantedSuspectList from '../pages/reports/WantedSuspectList';
import WeaponsDetectionList from '../pages/reports/WeaponsDetectionList';
import {
  IconDashboard,
  IconCar,
  IconUsers,
  IconVideo,
  IconShieldAlert,
  IconAlertTriangle,
  IconCrosshair
} from '../components/common/Icons';

/**
 * =========================================================================
 * CENTRALIZED ROUTES & NAVIGATION CONFIGURATION
 * =========================================================================
 * To add a new page to the app:
 * 1. Create your component in src/pages/...
 * 2. Add an entry into `NAV_SECTIONS` below (or `EXTRA_ROUTES`).
 * That's it! It will automatically register the route and appear in Sidebar.
 */

export const NAV_SECTIONS = [
  {
    title: 'Operations',
    items: [
      {
        path: '/dashboard',
        label: 'Dashboard',
        icon: <IconDashboard size={17} />,
        element: Dashboard,
        badge: 'LIVE',
        badgeClass: 'bg-success',
        isDefault: true // Redirect / to /dashboard
      },
      {
        path: '/vehicles',
        label: 'Vehicle Master',
        icon: <IconCar size={17} />,
        element: VahicalList
      },
      {
        path: '/vehicle-cameras',
        label: 'Vehicle Cameras',
        icon: <IconVideo size={17} />,
        element: VehicleCameras
      },
      {
        path: '/police-master',
        label: 'Police Master',
        icon: <IconUsers size={17} />,
        element: PoliceMaster
      }
    ]
  },
  {
    title: 'Reports',
    items: [
      // {
      //   path: '/anpr-watchlist',
      //   label: 'ANPR Watchlist',
      //   icon: <IconShieldAlert size={17} />,
      //   count: '7 Hits',
      //   badgeClass: 'bg-danger',
      //   element: AnprWatchlist
      // },
      {
        path: '/reports/wanted-suspects',
        label: 'Wanted Suspects',
        icon: <IconAlertTriangle size={17} />,
        count: 'WANTED',
        badgeClass: 'bg-danger',
        element: WantedSuspectList
      },
      {
        path: '/reports/weapons-detection',
        label: 'Weapons Detection',
        icon: <IconCrosshair size={17} />,
        // count: 'THREAT',
        // badgeClass: 'bg-danger',
        element: WeaponsDetectionList
      }
    ]
  }
];

// Any routes not shown in sidebar (e.g. details, settings, auth)
export const EXTRA_ROUTES = [];

// Helper to flatten all routes for the router
export const getAllRoutes = () => {
  const routes = [];
  NAV_SECTIONS.forEach(section => {
    section.items.forEach(item => {
      routes.push(item);
    });
  });
  return [...routes, ...EXTRA_ROUTES];
};
