export interface FlowCamParticle {
  id: string;
  esd: number; // Equivalent Spherical Diameter (µm)
  area: number; // µm²
  length: number; // µm
  width: number; // µm
  aspectRatio: number; // width/length
  transparency: number; // 0.0 (opaque) to 1.0 (clear)
  velocity: number;
  x: number;
  y: number;
  type: 'Diatom' | 'Cyanobacteria' | 'Zooplankton' | 'Detritus';
}

export interface FlowCamData {
  totalBiovolume: number; // um3/mL
  particleCount: number;
  concentration: number; // particles/mL
  taxaDistribution: {
    cyanobacteria: number; // percentage
    diatoms: number;
    greenAlgae: number;
    other: number;
  };
  dominantTaxa: string;
  samplingDate: string;
}

export interface EcologicalMetrics {
  imperviousSurface: number;
  flushingRate: number;
  catchmentRatio: number;
  anoxiaDepth: number;
  hodRate: number;
  internalLoadingRisk: 'Low' | 'Moderate' | 'High';
  shorelineNaturalization: number;
  macrophyteDiversity: number;
  benthicHealth: 'Optimal' | 'Degraded' | 'Critical';
}

export interface LakeData {
  id: string;
  name: string;
  town: string;
  zipCode: string;
  coordinates: { lat: number; lng: number };
  waterQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  lastSecchiDiskReading: number;
  phosphorusLevel: number;
  chlorophyllLevel: number;
  invasiveSpeciesStatus: 'None detected' | 'Detected' | 'Under Management';
  lastUpdated: string;
  maxDepth: number; // Maximum depth in meters
  historicalData?: Array<{
    year: number | string;
    secchi: number;
    phosphorus: number;
  }>;
  flowCamRecent?: FlowCamData;
  advancedMetrics?: EcologicalMetrics;
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}