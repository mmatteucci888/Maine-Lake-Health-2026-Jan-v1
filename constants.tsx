
import React from 'react';
import { LakeData } from './types';

export const NORWAY_MAINE_COORDS = { lat: 44.2139, lng: -70.5281 };
export const MAINE_CENTER_COORDS = { lat: 45.2538, lng: -69.4455 };
export const TARGET_ZIP = "04268";

export const LAKES_DATA: LakeData[] = [
  {
    id: 'pennesseewassee',
    name: 'Lake Pennesseewassee',
    town: 'Norway',
    zipCode: '04268',
    coordinates: { lat: 44.2255, lng: -70.5595 },
    waterQuality: 'Excellent',
    lastSecchiDiskReading: 7.2,
    phosphorusLevel: 6.5,
    chlorophyllLevel: 2.1,
    invasiveSpeciesStatus: 'None detected',
    lastUpdated: '2024-05-15'
  },
  {
    id: 'little-pennesseewassee',
    name: 'Little Pennesseewassee',
    town: 'Norway',
    zipCode: '04268',
    coordinates: { lat: 44.2536, lng: -70.5842 },
    waterQuality: 'Good',
    lastSecchiDiskReading: 6.1,
    phosphorusLevel: 8.2,
    chlorophyllLevel: 3.4,
    invasiveSpeciesStatus: 'None detected',
    lastUpdated: '2024-05-15'
  },
  {
    id: 'sand-pond',
    name: 'Sand Pond',
    town: 'Norway',
    zipCode: '04268',
    coordinates: { lat: 44.2052, lng: -70.5222 },
    waterQuality: 'Excellent',
    lastSecchiDiskReading: 8.0,
    phosphorusLevel: 5.8,
    chlorophyllLevel: 1.9,
    invasiveSpeciesStatus: 'None detected',
    lastUpdated: '2024-05-18'
  },
  {
    id: 'hobbs-pond',
    name: 'Hobbs Pond',
    town: 'Norway',
    zipCode: '04268',
    coordinates: { lat: 44.1750, lng: -70.4780 },
    waterQuality: 'Good',
    lastSecchiDiskReading: 5.5,
    phosphorusLevel: 9.4,
    chlorophyllLevel: 4.1,
    invasiveSpeciesStatus: 'None detected',
    lastUpdated: '2024-05-20'
  },
  {
    id: 'sebago-lake',
    name: 'Sebago Lake',
    town: 'Casco',
    zipCode: '04015',
    coordinates: { lat: 43.8500, lng: -70.5667 },
    waterQuality: 'Excellent',
    lastSecchiDiskReading: 9.5,
    phosphorusLevel: 4.2,
    chlorophyllLevel: 1.2,
    invasiveSpeciesStatus: 'Detected',
    lastUpdated: '2024-06-01'
  },
  {
    id: 'kezar-lake',
    name: 'Kezar Lake',
    town: 'Lovell',
    zipCode: '04051',
    coordinates: { lat: 44.1789, lng: -70.8753 },
    waterQuality: 'Excellent',
    lastSecchiDiskReading: 8.8,
    phosphorusLevel: 5.1,
    chlorophyllLevel: 1.8,
    invasiveSpeciesStatus: 'None detected',
    lastUpdated: '2024-05-22'
  },
  {
    id: 'thompson-lake',
    name: 'Thompson Lake',
    town: 'Otisfield',
    zipCode: '04270',
    coordinates: { lat: 44.1022, lng: -70.4789 },
    waterQuality: 'Excellent',
    lastSecchiDiskReading: 8.2,
    phosphorusLevel: 6.0,
    chlorophyllLevel: 2.0,
    invasiveSpeciesStatus: 'None detected',
    lastUpdated: '2024-05-25'
  },
  {
    id: 'long-lake',
    name: 'Long Lake',
    town: 'Bridgton',
    zipCode: '04009',
    coordinates: { lat: 44.0483, lng: -70.6864 },
    waterQuality: 'Good',
    lastSecchiDiskReading: 6.8,
    phosphorusLevel: 8.5,
    chlorophyllLevel: 3.1,
    invasiveSpeciesStatus: 'Detected',
    lastUpdated: '2024-05-28'
  },
  {
    id: 'moose-pond',
    name: 'Moose Pond',
    town: 'Bridgton',
    zipCode: '04009',
    coordinates: { lat: 44.0256, lng: -70.7842 },
    waterQuality: 'Good',
    lastSecchiDiskReading: 5.9,
    phosphorusLevel: 9.2,
    chlorophyllLevel: 3.8,
    invasiveSpeciesStatus: 'None detected',
    lastUpdated: '2024-05-30'
  },
  {
    id: 'rangeley-lake',
    name: 'Rangeley Lake',
    town: 'Rangeley',
    zipCode: '04970',
    coordinates: { lat: 44.9600, lng: -70.6800 },
    waterQuality: 'Excellent',
    lastSecchiDiskReading: 7.5,
    phosphorusLevel: 5.5,
    chlorophyllLevel: 2.4,
    invasiveSpeciesStatus: 'None detected',
    lastUpdated: '2024-06-05'
  },
  {
    id: 'moosehead-lake',
    name: 'Moosehead Lake',
    town: 'Greenville',
    zipCode: '04441',
    coordinates: { lat: 45.5800, lng: -69.7100 },
    waterQuality: 'Excellent',
    lastSecchiDiskReading: 7.1,
    phosphorusLevel: 5.9,
    chlorophyllLevel: 2.2,
    invasiveSpeciesStatus: 'None detected',
    lastUpdated: '2024-06-10'
  },
  {
    id: 'belgrade-lakes',
    name: 'Great Pond',
    town: 'Belgrade',
    zipCode: '04917',
    coordinates: { lat: 44.5300, lng: -69.8700 },
    waterQuality: 'Good',
    lastSecchiDiskReading: 5.2,
    phosphorusLevel: 12.1,
    chlorophyllLevel: 4.8,
    invasiveSpeciesStatus: 'Under Management',
    lastUpdated: '2024-05-18'
  },
  {
    id: 'china-lake',
    name: 'China Lake',
    town: 'China',
    zipCode: '04358',
    coordinates: { lat: 44.4200, lng: -69.5500 },
    waterQuality: 'Fair',
    lastSecchiDiskReading: 3.8,
    phosphorusLevel: 18.5,
    chlorophyllLevel: 8.2,
    invasiveSpeciesStatus: 'Detected',
    lastUpdated: '2024-05-12'
  },
  {
    id: 'cobosseecontee',
    name: 'Cobbosseecontee Lake',
    town: 'Manchester',
    zipCode: '04351',
    coordinates: { lat: 44.2500, lng: -69.9100 },
    waterQuality: 'Good',
    lastSecchiDiskReading: 4.9,
    phosphorusLevel: 13.2,
    chlorophyllLevel: 5.5,
    invasiveSpeciesStatus: 'Detected',
    lastUpdated: '2024-05-20'
  },
  {
    id: 'pushaw-lake',
    name: 'Pushaw Lake',
    town: 'Glenburn',
    zipCode: '04401',
    coordinates: { lat: 44.9100, lng: -68.8300 },
    waterQuality: 'Fair',
    lastSecchiDiskReading: 3.2,
    phosphorusLevel: 22.1,
    chlorophyllLevel: 10.5,
    invasiveSpeciesStatus: 'None detected',
    lastUpdated: '2024-05-25'
  }
];

export const Icons = {
  Droplet: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  Info: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
  ),
  Warning: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
  ),
  MapPin: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  )
};
