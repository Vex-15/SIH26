export interface HotspotProperties {
  id: string;
  latitude: number;
  longitude: number;
  frp_mw: number;
  class_id: number;
  class_name: string;
  color: string;
  confidence: number;
  is_accidental?: boolean;
  elevation_m?: number;
  tropomi_no2?: number;
  tropomi_so2?: number;
  timestamp?: string;
  feed_type?: 'INSAT-3DR' | 'Himawari-9' | 'FIRMS_VIIRS' | 'FIRMS_MODIS';
  feed_status?: 'UNCONFIRMED_NRT' | 'CONFIRMED_POLAR';
  facility_name?: string;
  z_score?: number;
  // Multi-model breakdown probabilities (5 classes)
  p_tab?: number[];
  p_temp?: number[];
  p_img?: number[];
  // SHAP top features
  shap_features?: { feature: string; impact: number; description: string }[];
}

export interface HotspotFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lon, lat]
  };
  properties: HotspotProperties;
}

export interface HotspotFeatureCollection {
  type: 'FeatureCollection';
  metadata: {
    title: string;
    generated_at: string;
    total_features: number;
    classes: string[];
  };
  features: HotspotFeature[];
}
