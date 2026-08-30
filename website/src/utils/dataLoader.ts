import type { HotspotFeatureCollection, HotspotFeature } from '../types/hotspot';
import rawHotspots from '../data/hotspots.json';

const CLASS_NAMES = [
  'Wildfire',
  'Agricultural',
  'Industrial Persistent',
  'Gas Flare',
  'Accidental Fire'
];

export const PRESET_FACILITIES = [
  {
    id: 'PRESET-1',
    name: 'Hazira Petrochemical Plant',
    coordinates: [72.648, 21.108] as [number, number],
    class_id: 4,
    frp_mw: 145.0,
    z_score: 5.3,
    feed_status: 'UNCONFIRMED_NRT' as const,
    feed_type: 'INSAT-3DR' as const,
    confidence: 96.8,
    p_tab: [0.01, 0.02, 0.12, 0.05, 0.80],
    p_temp: [0.00, 0.01, 0.08, 0.02, 0.89],
    p_img: [0.01, 0.01, 0.10, 0.04, 0.84],
    shap_features: [
      { feature: 'frp_mw_spike', impact: 4.8, description: 'FRP exceeded 30-day baseline by 5.3 sigma' },
      { feature: 'is_industrial_osm', impact: 3.5, description: 'Located within registered Hazira chemical complex' },
      { feature: 'tropomi_no2', impact: 2.1, description: 'Dense NO2 chemical plume detected overhead' },
      { feature: 'elevation_m', impact: 0.4, description: 'Coastal plain industrial terrain (15m)' }
    ]
  },
  {
    id: 'PRESET-2',
    name: 'Jamnagar Oil Refinery',
    coordinates: [70.068, 22.471] as [number, number],
    class_id: 2,
    frp_mw: 42.5,
    z_score: 0.4,
    feed_status: 'CONFIRMED_POLAR' as const,
    feed_type: 'FIRMS_VIIRS' as const,
    confidence: 98.4,
    p_tab: [0.01, 0.01, 0.94, 0.03, 0.01],
    p_temp: [0.00, 0.01, 0.97, 0.02, 0.00],
    p_img: [0.00, 0.00, 0.95, 0.04, 0.01],
    shap_features: [
      { feature: 'is_industrial_osm', impact: 4.9, description: 'Exact match with Reliance Jamnagar refinery polygon' },
      { feature: 'annual_recurrence', impact: 3.8, description: 'Persistent thermal source active 340+ days/year' },
      { feature: 'tropomi_so2', impact: 2.3, description: 'Heavy SO2 signature consistent with refinery crude processing' }
    ]
  },
  {
    id: 'PRESET-3',
    name: 'Digboi Hydrocarbon Stack',
    coordinates: [95.088, 27.379] as [number, number],
    class_id: 3,
    frp_mw: 18.2,
    z_score: 0.8,
    feed_status: 'CONFIRMED_POLAR' as const,
    feed_type: 'FIRMS_VIIRS' as const,
    confidence: 95.1,
    p_tab: [0.02, 0.01, 0.08, 0.88, 0.01],
    p_temp: [0.01, 0.00, 0.05, 0.93, 0.01],
    p_img: [0.00, 0.01, 0.10, 0.87, 0.02],
    shap_features: [
      { feature: 'is_gas_flare_osm', impact: 5.1, description: 'Known active flaring stack at Digboi Oil Field' },
      { feature: 'nighttime_ratio', impact: 3.2, description: 'High MIR brightness temperature continuously at 02:00 UTC' }
    ]
  },
  {
    id: 'PRESET-4',
    name: 'Ludhiana Stubble Burning',
    coordinates: [75.857, 30.901] as [number, number],
    class_id: 1,
    frp_mw: 24.8,
    z_score: 1.2,
    feed_status: 'CONFIRMED_POLAR' as const,
    feed_type: 'FIRMS_MODIS' as const,
    confidence: 99.1,
    p_tab: [0.01, 0.97, 0.01, 0.00, 0.01],
    p_temp: [0.01, 0.98, 0.00, 0.00, 0.01],
    p_img: [0.02, 0.96, 0.01, 0.00, 0.01],
    shap_features: [
      { feature: 'land_cover_cropland', impact: 4.7, description: 'ESA WorldCover classified as active agricultural land' },
      { feature: 'diurnal_peak', impact: 3.6, description: 'Fire initiated at 14:00 local time (stubble burn signature)' }
    ]
  },
  {
    id: 'PRESET-5',
    name: 'Uttarakhand Himalayan Ridge',
    coordinates: [79.152, 29.619] as [number, number],
    class_id: 0,
    frp_mw: 38.0,
    z_score: 1.5,
    feed_status: 'UNCONFIRMED_NRT' as const,
    feed_type: 'Himawari-9' as const,
    confidence: 97.5,
    p_tab: [0.96, 0.02, 0.01, 0.00, 0.01],
    p_temp: [0.98, 0.01, 0.00, 0.00, 0.01],
    p_img: [0.95, 0.03, 0.01, 0.00, 0.01],
    shap_features: [
      { feature: 'elevation_m', impact: 4.4, description: 'High altitude Himalayan ridge (1450m ASL)' },
      { feature: 'land_cover_tree_cover', impact: 4.1, description: 'ESA WorldCover dense forest canopy' }
    ]
  }
];

export function loadEnrichedHotspots(): HotspotFeatureCollection {
  const collection = rawHotspots as unknown as HotspotFeatureCollection;
  
  // Enrich existing features
  const enrichedFeatures: HotspotFeature[] = collection.features.map((feature, index) => {
    const p = feature.properties;
    const cid = p.class_id ?? 0;
    
    // Generate realistic multi-model vectors based on true class
    const p_tab = [0.02, 0.02, 0.02, 0.02, 0.02];
    p_tab[cid] = Math.min(0.96, Math.max(0.75, p.confidence / 100));
    
    const p_temp = [0.01, 0.01, 0.01, 0.01, 0.01];
    p_temp[cid] = Math.min(0.98, Math.max(0.70, (p.confidence / 100) + 0.02));
    
    const p_img = [0.02, 0.02, 0.02, 0.02, 0.02];
    p_img[cid] = Math.min(0.95, Math.max(0.72, (p.confidence / 100) - 0.03));

    // Determine feed source (mix of geostationary 15-min and polar)
    const isGeostationary = index % 4 === 0 || p.class_id === 4;
    const feed_type = isGeostationary ? (index % 2 === 0 ? 'INSAT-3DR' : 'Himawari-9') : 'FIRMS_VIIRS';
    const feed_status = isGeostationary ? 'UNCONFIRMED_NRT' : 'CONFIRMED_POLAR';

    // SHAP explanation generator based on class
    let shap_features = [];
    if (cid === 2 || cid === 4) {
      shap_features = [
        { feature: 'is_industrial_osm', impact: 4.2, description: 'Proximity to registered industrial complex' },
        { feature: 'frp_mw', impact: p.frp_mw > 30 ? 3.8 : 1.5, description: `FRP thermal intensity measured at ${p.frp_mw.toFixed(1)} MW` },
        { feature: 'tropomi_no2', impact: 2.1, description: 'Elevated tropospheric NO2 column' },
        { feature: 'elevation_m', impact: 0.6, description: `Elevation at ${p.elevation_m || 50}m ASL` }
      ];
    } else if (cid === 3) {
      shap_features = [
        { feature: 'is_gas_flare_osm', impact: 4.8, description: 'Registered hydrocarbon flare location' },
        { feature: 'tropomi_so2', impact: 3.1, description: 'Elevated SO2 flaring signature' }
      ];
    } else if (cid === 1) {
      shap_features = [
        { feature: 'land_cover_cropland', impact: 4.5, description: 'Located on active agricultural acreage' },
        { feature: 'diurnal_cycle', impact: 2.9, description: 'Midday thermal spike typical of stubble clearance' }
      ];
    } else {
      shap_features = [
        { feature: 'elevation_m', impact: 3.9, description: 'Mountainous/forest terrain elevation profile' },
        { feature: 'land_cover_forest', impact: 3.5, description: 'Dense vegetative fuel index' }
      ];
    }

    return {
      ...feature,
      properties: {
        ...p,
        class_name: CLASS_NAMES[cid] || p.class_name,
        feed_type,
        feed_status,
        z_score: cid === 4 ? 4.5 : cid === 2 ? 0.3 : 0.9,
        p_tab,
        p_temp,
        p_img,
        shap_features
      }
    };
  });

  // Also include the top preset facilities explicitly at the beginning for immediate focus
  PRESET_FACILITIES.forEach((preset) => {
    enrichedFeatures.unshift({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: preset.coordinates
      },
      properties: {
        id: preset.id,
        latitude: preset.coordinates[1],
        longitude: preset.coordinates[0],
        frp_mw: preset.frp_mw,
        class_id: preset.class_id,
        class_name: CLASS_NAMES[preset.class_id],
        color: preset.class_id === 4 ? '#ef4444' : preset.class_id === 2 ? '#f59e0b' : preset.class_id === 3 ? '#8b5cf6' : preset.class_id === 1 ? '#22c55e' : '#10b981',
        confidence: preset.confidence,
        is_accidental: preset.class_id === 4,
        elevation_m: preset.coordinates[1] > 28 ? 1450 : 25,
        tropomi_no2: preset.class_id === 4 ? 0.00055 : 0.00015,
        tropomi_so2: preset.class_id === 4 ? 0.00048 : 0.00012,
        timestamp: '2026-08-30',
        facility_name: preset.name,
        feed_type: preset.feed_type,
        feed_status: preset.feed_status,
        z_score: preset.z_score,
        p_tab: preset.p_tab,
        p_temp: preset.p_temp,
        p_img: preset.p_img,
        shap_features: preset.shap_features
      }
    });
  });

  return {
    ...collection,
    features: enrichedFeatures
  };
}
