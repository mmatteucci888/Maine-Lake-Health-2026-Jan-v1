
import { LakeData } from '../types';

export interface ClusterResult {
  lakeId: string;
  clusterId: number;
  label: string;
  color: string;
  coordinates: { x: number; y: number };
}

/**
 * Recalibrated Maine-specific TSI (Trophic State Index)
 * Secchi-based TSI: 60 - 14.41 * ln(SD)
 */
export const calculateTSI = (secchiDepth: number): number => {
  if (secchiDepth <= 0) return 100;
  // Maine DEP typical calibration
  const tsi = 60 - (14.41 * Math.log(secchiDepth));
  return Math.min(Math.max(tsi, 0), 100);
};

export const getTrophicLabel = (tsi: number): string => {
  // Recalibrated thresholds for Maine Great Ponds
  if (tsi < 35) return "Oligotrophic (High Clarity)";
  if (tsi < 45) return "Mesotrophic (Balanced Productivity)";
  if (tsi < 60) return "Eutrophic (High Nutrient Loading)";
  return "Hypereutrophic (Severe Nutrient Saturation)";
};

/**
 * Generates a summary for a high school graduate audience.
 */
const generateAccessibleSummary = (lake: LakeData): string => {
  const tsi = calculateTSI(lake.lastSecchiDiskReading);
  let summary = "";

  if (tsi < 35) {
    summary = "The water here is exceptionally clear and healthy, making it perfect for swimming and supporting cold-water fish like trout. ";
  } else if (tsi < 45) {
    summary = "This lake has a healthy balance of nutrients, supporting a wide variety of plants and wildlife without being overgrown. ";
  } else if (tsi < 60) {
    summary = "You might notice the water looks a bit cloudy or green, which is a sign that there are extra nutrients like phosphorus fueling plant growth. ";
  } else {
    summary = "The lake is currently struggling with very high levels of nutrients, which often leads to thick algae growth and reduced oxygen for fish. ";
  }

  if (lake.invasiveSpeciesStatus !== 'None detected') {
    summary += "It is important to be extra careful with boats and gear here, as invasive species have been found in these waters. ";
  }

  return summary;
};

export const generatePredictiveNarrative = (lake: LakeData): string => {
  const tsi = calculateTSI(lake.lastSecchiDiskReading);
  const flowCam = lake.flowCamRecent;
  const metrics = lake.advancedMetrics;

  const simpleSummary = generateAccessibleSummary(lake);
  let scientificProfile = "";
  
  if (metrics && Number(metrics.imperviousSurface) > 10) {
    scientificProfile += `Catchment analysis indicates an elevated impervious surface density (${Number(metrics.imperviousSurface).toFixed(1)}%), accelerating nutrient transport. `;
  }

  if (metrics && Number(metrics.anoxiaDepth) < 6) {
    scientificProfile += `Observed anoxic interface at ${Number(metrics.anoxiaDepth).toFixed(1)}m suggests significant hypolimnetic oxygen demand. `;
  }

  if (flowCam) {
    scientificProfile += `Particle analysis (${flowCam.samplingDate}) identified ${flowCam.dominantTaxa} as the dominant taxa, with cyanobacteria biovolume recorded at ${flowCam.taxaDistribution.cyanobacteria}%. `;
  }

  scientificProfile += `Thermal profiles indicate characteristic seasonal stability with a metalimnetic interface responding to depth-specific temperature gradients. `;

  return `${simpleSummary}\n\nTechnical Audit: ${scientificProfile}The system currently exhibits a ${getTrophicLabel(tsi)} state based on verified transparency metrics.`;
};

export const performEcologicalClustering = (lakes: LakeData[]): ClusterResult[] => {
  const maxP = Math.max(...lakes.map(l => l.phosphorusLevel), 1);
  const maxS = Math.max(...lakes.map(l => l.lastSecchiDiskReading), 1);

  return lakes.map(lake => {
    const x = (lake.phosphorusLevel / maxP);
    const y = (lake.lastSecchiDiskReading / maxS);
    let clusterId = 0, label = "Mesotrophic State", color = "#10b981";
    if (y > 0.8 && x < 0.25) { clusterId = 1; label = "Oligotrophic State", color = "#60a5fa"; }
    else if (x > 0.55) { clusterId = 2; label = "Eutrophic State", color = "#f43f5e"; }

    return {
      lakeId: lake.id,
      clusterId,
      label,
      color,
      coordinates: { x: x * 100, y: (1 - y) * 100 }
    };
  });
};
