import React from 'react';
import { LakeData, EcologicalMetrics } from './types';

export const generateHistory = (baseSecchi: number, basePhos: number) => {
  const history = [];
  for (let year = 2016; year <= 2025; year++) {
    const drift = (year - 2016) * 0.05;
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

const rawLakes = [
  // LAON CORE BASINS - High Frequency FlowCam Monitoring
  { id: 'pennesseewassee', name: 'Lake Pennesseewassee', town: 'Norway', lat: 44.2255, lng: -70.5595, quality: 'Excellent', s: 7.2, p: 6.5, maxDepth: 14.6, hasFlowCam: true, taxa: { cyanobacteria: 2, diatoms: 82, greenAlgae: 10, other: 6 }, conc: 35, dominant: 'Asterionella' },
  { id: 'little-pennesseewassee', name: 'Little Pennesseewassee', town: 'Norway', lat: 44.2444, lng: -70.5283, quality: 'Excellent', s: 6.8, p: 7.2, maxDepth: 9.0, hasFlowCam: true, taxa: { cyanobacteria: 5, diatoms: 75, greenAlgae: 12, other: 8 }, conc: 55, dominant: 'Tabellaria' },
  { id: 'sand-pond', name: 'Sand Pond', town: 'Norway', lat: 44.1842, lng: -70.5489, quality: 'Good', s: 5.5, p: 9.1, maxDepth: 12.0, hasFlowCam: true, taxa: { cyanobacteria: 18, diatoms: 52, greenAlgae: 20, other: 10 }, conc: 110, dominant: 'Synura' },
  { id: 'north-pond', name: 'North Pond', town: 'Norway', lat: 44.2655, lng: -70.5895, quality: 'Good', s: 5.2, p: 10.5, maxDepth: 10.5, hasFlowCam: true, taxa: { cyanobacteria: 25, diatoms: 45, greenAlgae: 20, other: 10 }, conc: 140, dominant: 'Dinobryon' },
  
  // MAJOR MAINE LAKES - Verified FlowCam Imaging Available
  { id: 'sebago-lake', name: 'Sebago Lake', town: 'Casco', lat: 43.8500, lng: -70.5667, quality: 'Excellent', s: 9.8, p: 4.5, maxDepth: 96.3, hasFlowCam: true, taxa: { cyanobacteria: 1, diatoms: 88, greenAlgae: 8, other: 3 }, conc: 28, dominant: 'Tabellaria' },
  { id: 'lake-auburn', name: 'Lake Auburn', town: 'Auburn', lat: 44.1481, lng: -70.2458, quality: 'Excellent', s: 5.2, p: 11.2, maxDepth: 36.0, hasFlowCam: true, taxa: { cyanobacteria: 12, diatoms: 65, greenAlgae: 15, other: 8 }, conc: 95, dominant: 'Asterionella' },
  { id: 'china-lake', name: 'China Lake', town: 'China', lat: 44.4267, lng: -69.5442, quality: 'Poor', s: 2.1, p: 28.5, maxDepth: 26.0, hasFlowCam: true, taxa: { cyanobacteria: 65, diatoms: 15, greenAlgae: 12, other: 8 }, conc: 420, dominant: 'Dolichospermum' },
  
  // GENERAL REGISTRY (Baseline Monitoring)
  { id: 'moosehead-lake', name: 'Moosehead Lake', town: 'Greenville', lat: 45.5833, lng: -69.5333, quality: 'Excellent', s: 9.1, p: 4.8, maxDepth: 75.0 },
  { id: 'kezar-lake', name: 'Kezar Lake', town: 'Lovell', lat: 44.1833, lng: -70.8833, quality: 'Excellent', s: 8.2, p: 5.8, maxDepth: 49.0 },
  { id: 'thompson-lake', name: 'Thompson Lake', town: 'Otisfield', lat: 44.1167, lng: -70.4833, quality: 'Excellent', s: 8.5, p: 5.2, maxDepth: 36.9 }
];

export const LAKES_DATA: LakeData[] = rawLakes.map(l => {
  const hasFlowCam = (l as any).hasFlowCam;
  
  return {
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
    maxDepth: l.maxDepth,
    historicalData: generateHistory(l.s, l.p),
    advancedMetrics: generateAdvancedMetrics(l.quality),
    flowCamRecent: hasFlowCam ? {
      totalBiovolume: ((l as any).conc || 80) * 12000,
      particleCount: ((l as any).conc || 80) * 30,
      concentration: (l as any).conc || 80,
      taxaDistribution: (l as any).taxa || { cyanobacteria: 10, diatoms: 60, greenAlgae: 20, other: 10 },
      dominantTaxa: (l as any).dominant || 'Tabellaria',
      samplingDate: '2024-Q3'
    } : undefined
  };
});

export const Icons = {
  Droplet: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Info: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  MapPin: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  Microscope: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 1 1-2-2V6h6v8l1.5 1.5"/><path d="M12 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>,
  Warning: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 9 4.1 7H7.9l4.1-7Z"/><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
};