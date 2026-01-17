
export interface FlowCamData {
  totalBiovolume: number; // um3/mL
  particleCount: number;
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
  // Watershed Vulnerability
  imperviousSurface: number; // percentage
  flushingRate: number; // times per year
  catchmentRatio: number; // watershed size vs lake size

  // Anoxia & Deep Water Health
  anoxiaDepth: number; // meters
  hodRate: number; // Hypolimnetic Oxygen Demand mg/L/day
  internalLoadingRisk: 'Low' | 'Moderate' | 'High';

  // Littoral & Habitat
  shorelineNaturalization: number; // percentage of natural buffer
  macrophyteDiversity: number; // 1-10 scale
  benthicHealth: 'Optimal' | 'Degraded' | 'Critical';
}

export interface LakeData {
  id: string;
  name: string;
  town: string;
  zipCode: string;
  coordinates: { lat: number; lng: number };
  waterQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  lastSecchiDiskReading: number; // in meters
  phosphorusLevel: number; // µg/L (ppb)
  chlorophyllLevel: number; // µg/L (ppb)
  invasiveSpeciesStatus: 'None detected' | 'Detected' | 'Under Management';
  lastUpdated: string;
  historicalData?: Array<{
    year: number | string;
    secchi: number;
    phosphorus: number; // µg/L (ppb)
  }>;
  flowCamRecent?: FlowCamData;
  advancedMetrics?: EcologicalMetrics;
  predictiveInsights?: {
    algalBloomRisk: 'Low' | 'Moderate' | 'High';
    thermalStability: number; 
    watershedConnectivity: number; 
    narrative: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}
