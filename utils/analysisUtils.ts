
import { LakeData } from '../types';

export interface ClusterResult {
  lakeId: string;
  clusterId: number;
  label: string;
  color: string;
  coordinates: { x: number; y: number };
}

export const calculateTSI = (secchiDepth: number): number => {
  if (secchiDepth <= 0) return 100;
  const tsi = 60 - (14.41 * Math.log(secchiDepth));
  return Math.min(Math.max(tsi, 0), 100);
};

export const getTrophicLabel = (tsi: number): string => {
  if (tsi < 40) return "Oligotrophic (High Clarity)";
  if (tsi < 50) return "Mesotrophic (Balanced Productivity)";
  if (tsi < 65) return "Eutrophic (High Nutrient Loading)";
  return "Hypereutrophic (Severe Nutrient Saturation)";
};

export const getRegionalComparison = (currentLake: LakeData, allLakes: LakeData[]) => {
  if (allLakes.length === 0) return { secchiDiff: 0, phosDiff: 0, avgSecchi: 0, avgPhos: 0 };
  const avgSecchi = allLakes.reduce((acc, l) => acc + l.lastSecchiDiskReading, 0) / allLakes.length;
  const avgPhos = allLakes.reduce((acc, l) => acc + l.phosphorusLevel, 0) / allLakes.length;
  return {
    secchiDiff: ((currentLake.lastSecchiDiskReading - avgSecchi) / avgSecchi) * 100,
    phosDiff: ((currentLake.phosphorusLevel - avgPhos) / avgPhos) * 100,
    avgSecchi,
    avgPhos
  };
};

export const generatePredictiveNarrative = (lake: LakeData): string => {
  const tsi = calculateTSI(lake.lastSecchiDiskReading);
  const flowCam = lake.flowCamRecent;
  const metrics = lake.advancedMetrics;

  let profile = "";
  
  // 1. Watershed & Hydrological Vulnerability
  // Use Number() to ensure type safety for comparisons and arithmetic
  if (metrics && Number(metrics.imperviousSurface) > 10) {
    profile += `The catchment exhibits a heightened impervious surface density of ${Number(metrics.imperviousSurface).toFixed(1)}%, which significantly increases the velocity of non-point source nutrient transport during storm events. `;
  } else {
    profile += `The watershed maintains a high degree of natural vegetative cover, which facilitates efficient infiltration and mitigates excessive runoff. `;
  }

  // 2. Limnological Stratification & Oxygen Profiles
  if (metrics && Number(metrics.anoxiaDepth) < 6) {
    profile += `Water column analysis reveals a shallow anoxic interface at ${Number(metrics.anoxiaDepth).toFixed(1)} meters, suggesting high hypolimnetic oxygen demand and a potential loss of cold-water refugia for salmonid species. `;
  } else {
    profile += `The dissolved oxygen profile suggests deep-water stability, providing adequate benthic habitat for oxygen-sensitive organisms. `;
  }

  // 3. Riparian Buffers & Habitat Integrity
  if (metrics && Number(metrics.shorelineNaturalization) < 70) {
    // FIX: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
    profile += `Riparian integrity is compromised by approximately ${(100 - Number(metrics.shorelineNaturalization)).toFixed(0)}% development, reducing the littoral zone's capacity for bio-filtration. `;
  } else if (metrics) {
    profile += `The shoreline remains substantially naturalized (${Number(metrics.shorelineNaturalization).toFixed(0)}%), providing a robust bio-buffer against external loading. `;
  }

  // 4. Biological Productivity & Taxa Analysis
  if (flowCam && flowCam.taxaDistribution.cyanobacteria > 15) {
    profile += `Imaging Flow Cytometry has detected a significant biovolume of Cyanobacteria (${flowCam.taxaDistribution.cyanobacteria}%), indicating an elevated risk for harmful algal blooms (HABs) under high-temperature conditions. `;
  } else if (tsi < 42) {
    profile += `Current photic zone transparency is exceptional, reflecting a low-productivity oligotrophic state. `;
  } else {
    profile += `Biological productivity is within normal parameters for a mesotrophic system, with a balanced distribution of diatoms and green algae. `;
  }

  return `Ecological Status Report for ${lake.name}: ${profile}Overall, the system currently displays ${lake.waterQuality.toLowerCase()} water quality characteristics according to Maine DEP monitoring protocols.`;
};

export const performEcologicalClustering = (lakes: LakeData[]): ClusterResult[] => {
  const maxP = Math.max(...lakes.map(l => l.phosphorusLevel), 1);
  const maxS = Math.max(...lakes.map(l => l.lastSecchiDiskReading), 1);

  return lakes.map(lake => {
    const x = (lake.phosphorusLevel / maxP);
    const y = (lake.lastSecchiDiskReading / maxS);
    let clusterId = 0, label = "Mesotrophic State", color = "#10b981";
    if (y > 0.75 && x < 0.3) { clusterId = 1; label = "Oligotrophic State", color = "#60a5fa"; }
    else if (x > 0.6) { clusterId = 2; label = "Eutrophic State", color = "#f43f5e"; }

    return {
      lakeId: lake.id,
      clusterId,
      label,
      color,
      coordinates: { x: x * 100, y: (1 - y) * 100 }
    };
  });
};
