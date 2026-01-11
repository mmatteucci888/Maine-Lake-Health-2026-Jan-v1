
export interface LakeData {
  id: string;
  name: string;
  town: string;
  zipCode: string;
  coordinates: { lat: number; lng: number };
  waterQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  lastSecchiDiskReading: number; // in meters
  phosphorusLevel: number; // ppb
  chlorophyllLevel: number; // ppb
  invasiveSpeciesStatus: 'None detected' | 'Detected' | 'Under Management';
  lastUpdated: string;
  historicalData?: Array<{
    year: number | string;
    secchi: number;
    phosphorus: number;
  }>;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}
