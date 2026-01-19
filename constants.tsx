
import React from 'react';
import { LakeData, EcologicalMetrics } from './types';

export const NORWAY_MAINE_COORDS = { lat: 44.2139, lng: -70.5281 };
export const MAINE_CENTER_COORDS = { lat: 45.2538, lng: -69.4455 };
export const TARGET_ZIP = "04268";

const generateHistory = (baseSecchi: number, basePhos: number) => {
  const history = [];
  const startYear = 2014;
  const endYear = 2024;
  for (let year = startYear; year <= endYear; year++) {
    const drift = (year - startYear) * 0.05;
    history.push({
      year,
      secchi: parseFloat((baseSecchi + (Math.random() - 0.5) * 1.5 - (drift * 0.2)).toFixed(1)),
      phosphorus: parseFloat((basePhos + (Math.random() - 0.5) * 4 + drift).toFixed(1))
    });
  }
  return history;
};

const generateAdvancedMetrics = (quality: string): EcologicalMetrics => {
  const isGood = quality === 'Excellent' || quality === 'Good';
  return {
    imperviousSurface: isGood ? 4.2 + Math.random() * 5 : 18.5 + Math.random() * 15,
    flushingRate: 0.5 + Math.random() * 2,
    catchmentRatio: 8.5,
    anoxiaDepth: isGood ? 8.2 + Math.random() * 4 : 2.5 + Math.random() * 3,
    hodRate: isGood ? 0.02 : 0.08,
    internalLoadingRisk: isGood ? 'Low' : 'High',
    shorelineNaturalization: isGood ? 85 + Math.random() * 10 : 45 + Math.random() * 20,
    macrophyteDiversity: isGood ? 8 : 4,
    benthicHealth: isGood ? 'Optimal' : 'Degraded'
  };
};

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
    lastUpdated: '2024',
    historicalData: generateHistory(7.2, 6.5),
    advancedMetrics: generateAdvancedMetrics('Excellent'),
    flowCamRecent: {
      totalBiovolume: 420500,
      particleCount: 1240,
      taxaDistribution: { cyanobacteria: 5, diatoms: 65, greenAlgae: 20, other: 10 },
      dominantTaxa: 'Asterionella (Diatom)',
      samplingDate: '2024-08-15'
    }
  },
  {
    id: 'little-pennesseewassee',
    name: 'Little Pennesseewassee',
    town: 'Norway',
    zipCode: '04268',
    coordinates: { lat: 44.2400, lng: -70.5700 },
    waterQuality: 'Excellent',
    lastSecchiDiskReading: 6.8,
    phosphorusLevel: 7.1,
    chlorophyllLevel: 2.4,
    invasiveSpeciesStatus: 'None detected',
    lastUpdated: '2024',
    historicalData: generateHistory(6.8, 7.1),
    advancedMetrics: generateAdvancedMetrics('Excellent')
  },
  {
    id: 'sand-pond',
    name: 'Sand Pond',
    town: 'Norway',
    zipCode: '04268',
    coordinates: { lat: 44.2200, lng: -70.6100 },
    waterQuality: 'Good',
    lastSecchiDiskReading: 5.9,
    phosphorusLevel: 9.5,
    chlorophyllLevel: 3.2,
    invasiveSpeciesStatus: 'None detected',
    lastUpdated: '2024',
    historicalData: generateHistory(5.9, 9.5),
    advancedMetrics: generateAdvancedMetrics('Good')
  },
  {
    id: 'north-pond',
    name: 'North Pond',
    town: 'Norway',
    zipCode: '04268',
    coordinates: { lat: 44.2600, lng: -70.5300 },
    waterQuality: 'Good',
    lastSecchiDiskReading: 5.5,
    phosphorusLevel: 10.2,
    chlorophyllLevel: 3.8,
    invasiveSpeciesStatus: 'None detected',
    lastUpdated: '2024',
    historicalData: generateHistory(5.5, 10.2),
    advancedMetrics: generateAdvancedMetrics('Good')
  },
  {
    id: 'thompson-lake',
    name: 'Thompson Lake',
    town: 'Otisfield',
    zipCode: '04270',
    coordinates: { lat: 44.1167, lng: -70.4833 },
    waterQuality: 'Excellent',
    lastSecchiDiskReading: 8.5,
    phosphorusLevel: 5.2,
    chlorophyllLevel: 1.8,
    invasiveSpeciesStatus: 'None detected',
    lastUpdated: '2024',
    historicalData: generateHistory(8.5, 5.2),
    advancedMetrics: generateAdvancedMetrics('Excellent')
  },
  {
    id: 'moose-pond',
    name: 'Moose Pond',
    town: 'Bridgton',
    zipCode: '04009',
    coordinates: { lat: 44.0256, lng: -70.7631 },
    waterQuality: 'Good',
    lastSecchiDiskReading: 5.8,
    phosphorusLevel: 9.2,
    chlorophyllLevel: 3.4,
    invasiveSpeciesStatus: 'Detected',
    lastUpdated: '2024',
    historicalData: generateHistory(5.8, 9.2),
    advancedMetrics: generateAdvancedMetrics('Good')
  },
  {
    id: 'long-lake',
    name: 'Long Lake',
    town: 'Bridgton',
    zipCode: '04009',
    coordinates: { lat: 44.0833, lng: -70.6833 },
    waterQuality: 'Good',
    lastSecchiDiskReading: 6.1,
    phosphorusLevel: 8.5,
    chlorophyllLevel: 2.9,
    invasiveSpeciesStatus: 'None detected',
    lastUpdated: '2024',
    historicalData: generateHistory(6.1, 8.5),
    advancedMetrics: generateAdvancedMetrics('Good')
  },
  {
    id: 'lake-auburn',
    name: 'Lake Auburn',
    town: 'Auburn',
    zipCode: '04210',
    coordinates: { lat: 44.1481, lng: -70.2458 },
    waterQuality: 'Excellent',
    lastSecchiDiskReading: 5.2,
    phosphorusLevel: 11.2,
    chlorophyllLevel: 3.1,
    invasiveSpeciesStatus: 'None detected',
    lastUpdated: '2024',
    historicalData: generateHistory(5.2, 11.2),
    advancedMetrics: generateAdvancedMetrics('Excellent'),
    flowCamRecent: {
      totalBiovolume: 1150000,
      particleCount: 4200,
      taxaDistribution: { cyanobacteria: 15, diatoms: 55, greenAlgae: 20, other: 10 },
      dominantTaxa: 'Synedra (Diatom)',
      samplingDate: '2024-09-01'
    }
  },
  {
    id: 'china-lake',
    name: 'China Lake',
    town: 'China',
    zipCode: '04358',
    coordinates: { lat: 44.4267, lng: -69.5442 },
    waterQuality: 'Poor',
    lastSecchiDiskReading: 2.1,
    phosphorusLevel: 28.5,
    chlorophyllLevel: 15.2,
    invasiveSpeciesStatus: 'Detected',
    lastUpdated: '2024',
    historicalData: generateHistory(2.1, 28.5),
    advancedMetrics: generateAdvancedMetrics('Poor'),
    flowCamRecent: {
      totalBiovolume: 6800000,
      particleCount: 12400,
      taxaDistribution: { cyanobacteria: 72, diatoms: 10, greenAlgae: 10, other: 8 },
      dominantTaxa: 'Anabaena / Dolichospermum',
      samplingDate: '2024-08-20'
    }
  },
  {
    id: 'sebago-lake',
    name: 'Sebago Lake',
    town: 'Casco',
    zipCode: '04015',
    coordinates: { lat: 43.8500, lng: -70.5667 },
    waterQuality: 'Excellent',
    lastSecchiDiskReading: 9.8,
    phosphorusLevel: 4.5,
    chlorophyllLevel: 1.1,
    invasiveSpeciesStatus: 'Detected',
    lastUpdated: '2024',
    historicalData: generateHistory(9.8, 4.5),
    advancedMetrics: generateAdvancedMetrics('Excellent')
  },
  {
    id: 'kezar-lake',
    name: 'Kezar Lake',
    town: 'Lovell',
    zipCode: '04051',
    coordinates: { lat: 44.1833, lng: -70.8833 },
    waterQuality: 'Excellent',
    lastSecchiDiskReading: 8.2,
    phosphorusLevel: 5.8,
    chlorophyllLevel: 1.5,
    invasiveSpeciesStatus: 'None detected',
    lastUpdated: '2024',
    historicalData: generateHistory(8.2, 5.8),
    advancedMetrics: generateAdvancedMetrics('Excellent')
  },
  {
    id: 'sabbathday-lake',
    name: 'Sabbathday Lake',
    town: 'New Gloucester',
    zipCode: '04260',
    coordinates: { lat: 43.9833, lng: -70.3167 },
    waterQuality: 'Good',
    lastSecchiDiskReading: 6.5,
    phosphorusLevel: 7.2,
    chlorophyllLevel: 2.5,
    invasiveSpeciesStatus: 'None detected',
    lastUpdated: '2024',
    historicalData: generateHistory(6.5, 7.2),
    advancedMetrics: generateAdvancedMetrics('Good')
  },
  {
    id: 'range-pond',
    name: 'Range Pond',
    town: 'Poland',
    zipCode: '04274',
    coordinates: { lat: 44.0167, lng: -70.3500 },
    waterQuality: 'Good',
    lastSecchiDiskReading: 6.8,
    phosphorusLevel: 8.1,
    chlorophyllLevel: 2.2,
    invasiveSpeciesStatus: 'None detected',
    lastUpdated: '2024',
    historicalData: generateHistory(6.8, 8.1),
    advancedMetrics: generateAdvancedMetrics('Good')
  },
  {
    id: 'tripp-pond',
    name: 'Tripp Pond',
    town: 'Poland',
    zipCode: '04274',
    coordinates: { lat: 44.0333, lng: -70.4000 },
    waterQuality: 'Fair',
    lastSecchiDiskReading: 4.2,
    phosphorusLevel: 14.5,
    chlorophyllLevel: 6.8,
    invasiveSpeciesStatus: 'None detected',
    lastUpdated: '2024',
    historicalData: generateHistory(4.2, 14.5),
    advancedMetrics: generateAdvancedMetrics('Fair')
  },
  {
    id: 'cobbosseecontee-lake',
    name: 'Cobbosseecontee Lake',
    town: 'Winthrop',
    zipCode: '04364',
    coordinates: { lat: 44.2500, lng: -69.9333 },
    waterQuality: 'Fair',
    lastSecchiDiskReading: 3.8,
    phosphorusLevel: 18.2,
    chlorophyllLevel: 8.5,
    invasiveSpeciesStatus: 'Detected',
    lastUpdated: '2024',
    historicalData: generateHistory(3.8, 18.2),
    advancedMetrics: generateAdvancedMetrics('Fair')
  },
  {
    id: 'great-pond',
    name: 'Great Pond',
    town: 'Belgrade',
    zipCode: '04917',
    coordinates: { lat: 44.5333, lng: -69.8667 },
    waterQuality: 'Good',
    lastSecchiDiskReading: 5.5,
    phosphorusLevel: 10.5,
    chlorophyllLevel: 4.2,
    invasiveSpeciesStatus: 'Detected',
    lastUpdated: '2024',
    historicalData: generateHistory(5.5, 10.5),
    advancedMetrics: generateAdvancedMetrics('Good')
  }
];

export const Icons = {
  Droplet: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Info: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  Warning: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  MapPin: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  Microscope: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 1 1-2-2V6h6v8l1.5 1.5"/><path d="M12 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>
};
