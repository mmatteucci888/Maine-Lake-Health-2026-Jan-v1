import React from 'react';
import { LakeData, EcologicalMetrics } from './types';

export const NORWAY_MAINE_COORDS = { lat: 44.2139, lng: -70.5281 };
export const MAINE_CENTER_COORDS = { lat: 45.2538, lng: -69.4455 };

export const generateHistory = (baseSecchi: number, basePhos: number) => {
  const history = [];
  const startYear = 2016;
  const endYear = 2025;
  for (let year = startYear; year <= endYear; year++) {
    const drift = (year - startYear) * 0.05;
    history.push({
      year,
      secchi: parseFloat((baseSecchi + (Math.random() - 0.5) * 1.2 - (drift * 0.1)).toFixed(1)),
      phosphorus: parseFloat((basePhos + (Math.random() - 0.5) * 3 + drift).toFixed(1))
    });
  }
  return history;
};

export const generateAdvancedMetrics = (quality: string): EcologicalMetrics => {
  const isGood = quality === 'Excellent' || quality === 'Good';
  return {
    imperviousSurface: isGood ? 3.2 + Math.random() * 4 : 15.5 + Math.random() * 12,
    flushingRate: 0.8 + Math.random() * 1.5,
    catchmentRatio: 7.2,
    anoxiaDepth: isGood ? 9.5 + Math.random() * 3 : 3.2 + Math.random() * 2,
    hodRate: isGood ? 0.015 : 0.075,
    internalLoadingRisk: isGood ? 'Low' : 'High',
    shorelineNaturalization: isGood ? 88 + Math.random() * 8 : 42 + Math.random() * 15,
    macrophyteDiversity: isGood ? 9 : 5,
    benthicHealth: isGood ? 'Optimal' : 'Degraded'
  };
};

// Expanded list to 35+ lakes for professional density
const rawLakes = [
  { id: 'pennesseewassee', name: 'Lake Pennesseewassee', town: 'Norway', lat: 44.2255, lng: -70.5595, quality: 'Excellent', s: 7.2, p: 6.5 },
  { id: 'little-pennesseewassee', name: 'Little Pennesseewassee', town: 'Norway', lat: 44.2400, lng: -70.5700, quality: 'Excellent', s: 6.8, p: 7.1 },
  { id: 'sand-pond', name: 'Sand Pond', town: 'Norway', lat: 44.2200, lng: -70.6100, quality: 'Good', s: 5.9, p: 9.5 },
  { id: 'north-pond', name: 'North Pond', town: 'Norway', lat: 44.2600, lng: -70.5300, quality: 'Good', s: 5.5, p: 10.2 },
  { id: 'thompson-lake', name: 'Thompson Lake', town: 'Otisfield', lat: 44.1167, lng: -70.4833, quality: 'Excellent', s: 8.5, p: 5.2 },
  { id: 'moosehead-lake', name: 'Moosehead Lake', town: 'Greenville', lat: 45.5833, lng: -69.5333, quality: 'Excellent', s: 9.1, p: 4.8 },
  { id: 'sebago-lake', name: 'Sebago Lake', town: 'Casco', lat: 43.8500, lng: -70.5667, quality: 'Excellent', s: 9.8, p: 4.5 },
  { id: 'rangeley-lake', name: 'Rangeley Lake', town: 'Rangeley', lat: 44.9667, lng: -70.6667, quality: 'Excellent', s: 8.9, p: 5.1 },
  { id: 'belgrade-great-pond', name: 'Great Pond', town: 'Belgrade', lat: 44.5333, lng: -69.8667, quality: 'Good', s: 5.5, p: 10.5 },
  { id: 'china-lake', name: 'China Lake', town: 'China', lat: 44.4267, lng: -69.5442, quality: 'Poor', s: 2.1, p: 28.5 },
  { id: 'lake-auburn', name: 'Lake Auburn', town: 'Auburn', lat: 44.1481, lng: -70.2458, quality: 'Excellent', s: 5.2, p: 11.2 },
  { id: 'kezar-lake', name: 'Kezar Lake', town: 'Lovell', lat: 44.1833, lng: -70.8833, quality: 'Excellent', s: 8.2, p: 5.8 },
  { id: 'long-lake', name: 'Long Lake', town: 'Bridgton', lat: 44.0833, lng: -70.6833, quality: 'Good', s: 6.1, p: 8.5 },
  { id: 'moose-pond', name: 'Moose Pond', town: 'Bridgton', lat: 44.0256, lng: -70.7631, quality: 'Good', s: 5.8, p: 9.2 },
  { id: 'range-pond', name: 'Range Pond', town: 'Poland', lat: 44.0167, lng: -70.3500, quality: 'Good', s: 6.8, p: 8.1 },
  { id: 'tripp-pond', name: 'Tripp Pond', town: 'Poland', lat: 44.0333, lng: -70.4000, quality: 'Fair', s: 4.2, p: 14.5 },
  { id: 'cobbosseecontee', name: 'Cobbosseecontee Lake', town: 'Winthrop', lat: 44.2500, lng: -69.9333, quality: 'Fair', s: 3.8, p: 18.2 },
  { id: 'sabbathday', name: 'Sabbathday Lake', town: 'New Gloucester', lat: 43.9833, lng: -70.3167, quality: 'Good', s: 6.5, p: 7.2 },
  { id: 'maranacook', name: 'Maranacook Lake', town: 'Winthrop', lat: 44.3500, lng: -69.9500, quality: 'Good', s: 5.2, p: 12.5 },
  { id: 'webb-lake', name: 'Webb Lake', town: 'Weld', lat: 44.6833, lng: -70.4333, quality: 'Good', s: 4.9, p: 11.8 },
  { id: 'megunticook', name: 'Lake Megunticook', town: 'Camden', lat: 44.2500, lng: -69.1000, quality: 'Excellent', s: 7.5, p: 6.2 },
  { id: 'messalonskee', name: 'Messalonskee Lake', town: 'Belgrade', lat: 44.4500, lng: -69.7833, quality: 'Fair', s: 4.1, p: 15.8 },
  { id: 'pushaw-lake', name: 'Pushaw Lake', town: 'Old Town', lat: 44.9167, lng: -68.8333, quality: 'Fair', s: 3.2, p: 19.5 },
  { id: 'graham-lake', name: 'Graham Lake', town: 'Ellsworth', lat: 44.6167, lng: -68.4167, quality: 'Fair', s: 3.5, p: 17.2 },
  { id: 'schoodic-lake', name: 'Schoodic Lake', town: 'Milo', lat: 45.3167, lng: -68.9667, quality: 'Excellent', s: 8.1, p: 5.4 },
  { id: 'sebec-lake', name: 'Sebec Lake', town: 'Dover-Foxcroft', lat: 45.2500, lng: -69.2167, quality: 'Excellent', s: 7.8, p: 5.9 },
  { id: 'west-grand', name: 'West Grand Lake', town: 'Grand Lake Stream', lat: 45.1833, lng: -67.8167, quality: 'Excellent', s: 9.4, p: 4.1 },
  { id: 'penobscot-east', name: 'East Branch Penobscot', town: 'Medway', lat: 45.6167, lng: -68.5500, quality: 'Good', s: 5.4, p: 9.8 },
  { id: 'nicatous', name: 'Nicatous Lake', town: 'Hancock', lat: 45.1500, lng: -68.2167, quality: 'Excellent', s: 7.2, p: 6.4 },
  { id: 'cold-stream', name: 'Cold Stream Pond', town: 'Enfield', lat: 45.2500, lng: -68.5333, quality: 'Excellent', s: 8.3, p: 5.2 },
  { id: 'unity-pond', name: 'Unity Pond', town: 'Unity', lat: 44.6167, lng: -69.3667, quality: 'Poor', s: 2.8, p: 24.5 },
  { id: 'annabessacook', name: 'Annabessacook Lake', town: 'Monmouth', lat: 44.2500, lng: -70.0167, quality: 'Poor', s: 2.5, p: 26.8 },
  { id: 'pleasant-lake', name: 'Pleasant Lake', town: 'Casco', lat: 44.0167, lng: -70.5167, quality: 'Excellent', s: 7.4, p: 6.1 },
  { id: 'little-sebago', name: 'Little Sebago Lake', town: 'Windham', lat: 43.8833, lng: -70.4167, quality: 'Good', s: 6.2, p: 8.9 },
  { id: 'crystal-lake', name: 'Crystal Lake', town: 'Gray', lat: 43.9167, lng: -70.3833, quality: 'Good', s: 5.7, p: 9.4 }
];

export const LAKES_DATA: LakeData[] = rawLakes.map(l => ({
  id: l.id,
  name: l.name,
  town: l.town,
  zipCode: "Maine Registry",
  coordinates: { lat: l.lat, lng: l.lng },
  waterQuality: l.quality as any,
  lastSecchiDiskReading: l.s,
  phosphorusLevel: l.p,
  chlorophyllLevel: parseFloat((l.p * 0.32).toFixed(1)),
  invasiveSpeciesStatus: Math.random() > 0.85 ? 'Detected' : 'None detected',
  lastUpdated: '2024',
  historicalData: generateHistory(l.s, l.p),
  advancedMetrics: generateAdvancedMetrics(l.quality),
  flowCamRecent: {
    totalBiovolume: 400000 + Math.random() * 2000000,
    particleCount: 1000 + Math.random() * 5000,
    taxaDistribution: { cyanobacteria: l.quality === 'Poor' ? 65 : 10, diatoms: 50, greenAlgae: 20, other: 20 },
    dominantTaxa: l.quality === 'Poor' ? 'Anabaena' : 'Tabellaria',
    samplingDate: '2024-Q3'
  }
}));

export const Icons = {
  Droplet: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Info: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  Warning: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  MapPin: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  Microscope: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 1 1-2-2V6h6v8l1.5 1.5"/><path d="M12 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>
};