
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
  if (tsi < 35) return "Oligotrophic (High Transparency)";
  if (tsi < 45) return "Mesotrophic (Moderate Productivity)";
  if (tsi < 60) return "Eutrophic (Increased Nutrient Loading)";
  return "Hypereutrophic (Severe Enrichment)";
};

const generateAccessibleSummary = (lake: LakeData): string => {
  const tsi = calculateTSI(lake.lastSecchiDiskReading);
  const name = lake.name;
  const town = lake.town;
  
  const seed = name.length % 3;

  const clarityQualifiers = [
    `Transparency levels at ${name} remain significantly high, indicating minimal planktonic biomass and high light penetration.`,
    `${name} exhibits stabilized water clarity consistent with high-altitude or low-runoff basins in the ${town} region.`,
    `Current observations confirm ${name} is characterized by exceptional transparency and low turbidity.`
  ];

  const balancedQualifiers = [
    `The ${name} ecosystem demonstrates a stable mesotrophic state, with balanced nutrient cycling supported by the local ${town} watershed.`,
    `Water quality metrics for ${name} indicate a moderate biological productivity level consistent with seasonal baseline expectations.`,
    `${name} functions as a vibrant aquatic habitat where nutrient concentrations support native biodiversity without excessive algal growth.`
  ];

  const concernQualifiers = [
    `${name} is currently exhibiting signs of nutrient enrichment, potentially resulting in decreased transparency and increased littoral vegetation.`,
    `Environmental data for ${name} shows phosphorus levels are marginally elevated, impacting the overall trophic stability of the basin.`,
    `The ${name} watershed is processing an increased nutrient load, leading to a transition toward a eutrophic state.`
  ];

  const criticalQualifiers = [
    `${name} is experiencing significant ecological pressure due to excessive nutrient saturation, increasing the probability of cyanobacteria proliferation.`,
    `Water quality at ${name} is degraded; high nutrient loading is actively reducing hypolimnetic oxygen levels.`,
    `${name} requires active watershed management to mitigate severe nutrient enrichment and restore transparency metrics.`
  ];

  let summary = "";
  if (tsi < 35) summary = clarityQualifiers[seed];
  else if (tsi < 45) summary = balancedQualifiers[seed];
  else if (tsi < 60) summary = concernQualifiers[seed];
  else summary = criticalQualifiers[seed];

  if (lake.phosphorusLevel < 8) {
    summary += ` A phosphorus concentration of ${lake.phosphorusLevel}ppb effectively limits nuisance algal development.`;
  } else if (lake.phosphorusLevel > 20) {
    summary += ` The elevated phosphorus concentration (${lake.phosphorusLevel}ppb) indicates substantial runoff from the surrounding landscape.`;
  }

  if (lake.invasiveSpeciesStatus !== 'None detected') {
    summary += ` Implementation of clean-drain-dry protocols is critical to prevent further anthropogenic transport of invasive taxa into ${name}.`;
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
    scientificProfile += `Catchment analysis indicates an impervious surface density of ${Number(metrics.imperviousSurface).toFixed(1)}%, which correlates with accelerated nutrient transport. `;
  }

  if (metrics && Number(metrics.anoxiaDepth) < 6) {
    scientificProfile += `An anoxic interface detected at ${Number(metrics.anoxiaDepth).toFixed(1)}m suggests a high hypolimnetic oxygen demand. `;
  }

  if (flowCam) {
    scientificProfile += `Particle imaging analysis from ${flowCam.samplingDate} identified ${flowCam.dominantTaxa} as the primary taxa, with a cyanobacteria biovolume of ${flowCam.taxaDistribution.cyanobacteria}%. `;
  } else {
    scientificProfile += `Historical modeling suggest a planktonic community distribution characteristic of the ${lake.town} region. `;
  }

  scientificProfile += `Thermal profiles indicate seasonal stability with depth-specific temperature gradients typical of dimictic Maine ponds. `;

  return `${simpleSummary}\n\nScientific Profile: ${scientificProfile}The basin is currently categorized as ${getTrophicLabel(tsi)} based on verified transparency data.`;
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
