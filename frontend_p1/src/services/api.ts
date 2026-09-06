import type {
  Landslide,
  RiskPrediction,
  Alert,
  PaginatedResponse,
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Real-time North-East India (NER) Mock Datasets matching Phase 2 Backend schemas
export const MOCK_LANDSLIDES: Landslide[] = [
  {
    id: 'l-001',
    source: 'GSI_BHUSANKET',
    external_id: 'GSI-NER-001',
    state: 'Arunachal Pradesh',
    district: 'West Siang',
    subdivision: 'Along',
    village: 'Kambang',
    slide_name: 'West Siang Debris Flow',
    slide_no: 'AP-WS-014',
    nh_sh_location: 'NH-13 Km 42',
    latitude: 27.10,
    longitude: 92.00,
    geometry: { type: 'Point', coordinates: [92.00, 27.10] },
    occurrence_date: '2024-05-14',
    material_involved: 'Soil and weathered granite',
    movement_type: 'Debris flow',
    history: 'Recurring slide during peak monsoon',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'l-002',
    source: 'GSI_BHUSANKET',
    external_id: 'GSI-NER-002',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    subdivision: 'Shillong',
    village: 'Mylliem',
    slide_name: 'Shillong Bypass Rockfall',
    slide_no: 'MEG-EKH-008',
    nh_sh_location: 'NH-6 Km 18',
    latitude: 25.57,
    longitude: 91.88,
    geometry: { type: 'Point', coordinates: [91.88, 25.57] },
    occurrence_date: '2024-06-02',
    material_involved: 'Sandstone bedrock',
    movement_type: 'Rockfall',
    history: 'Steep slope failure after 200mm rainfall',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'l-003',
    source: 'NRSC',
    external_id: 'NRSC-NER-003',
    state: 'Assam',
    district: 'Cachar',
    subdivision: 'Silchar',
    village: 'Dalu',
    slide_name: 'Silchar Hill Slope Failure',
    slide_no: 'ASM-CAC-022',
    nh_sh_location: 'SH-11 Km 5',
    latitude: 24.82,
    longitude: 92.79,
    geometry: { type: 'Point', coordinates: [92.79, 24.82] },
    occurrence_date: '2024-07-10',
    material_involved: 'Silty sand',
    movement_type: 'Translational slide',
    history: 'Active creep observed since May',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'l-004',
    source: 'GSI_BHUSANKET',
    external_id: 'GSI-NER-005',
    state: 'Sikkim',
    district: 'East Sikkim',
    subdivision: 'Gangtok',
    village: 'Ranipool',
    slide_name: 'Gangtok Highway Rockslide',
    slide_no: 'SKM-ES-003',
    nh_sh_location: 'NH-10 Km 12',
    latitude: 27.33,
    longitude: 88.61,
    geometry: { type: 'Point', coordinates: [88.61, 27.33] },
    occurrence_date: '2024-06-25',
    material_involved: 'Metamorphic gneiss',
    movement_type: 'Rockslide',
    history: 'High erosion zone near Teesta river basin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const MOCK_RISK_PREDICTIONS: RiskPrediction[] = [
  {
    id: 'r-001',
    prediction_time: new Date().toISOString(),
    valid_until: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    latitude: 25.57,
    longitude: 91.88,
    geometry: { type: 'Point', coordinates: [91.88, 25.57] },
    risk_score: 91,
    risk_level: 'CRITICAL',
    confidence: 0.89,
    trend: 'INCREASING',
    model_version: 'ner-risk-v1.4',
    explanation: {
      factors: [
        { name: '24h Accumulated Rainfall', value: 210.4, unit: 'mm', contribution: 'critical' },
        { name: 'Terrain Slope Angle', value: 38.5, unit: '°', contribution: 'high' },
        { name: 'Soil Saturation Level', value: 94.2, unit: '%', contribution: 'high' },
        { name: 'Historical Slide Frequency', value: 4, unit: 'count', contribution: 'moderate' },
      ],
    },
    created_at: new Date().toISOString(),
  },
  {
    id: 'r-002',
    prediction_time: new Date().toISOString(),
    valid_until: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    latitude: 27.10,
    longitude: 92.00,
    geometry: { type: 'Point', coordinates: [92.00, 27.10] },
    risk_score: 76,
    risk_level: 'HIGH',
    confidence: 0.84,
    trend: 'INCREASING',
    model_version: 'ner-risk-v1.4',
    explanation: {
      factors: [
        { name: '24h Accumulated Rainfall', value: 145.2, unit: 'mm', contribution: 'high' },
        { name: 'Terrain Slope Angle', value: 35.0, unit: '°', contribution: 'high' },
        { name: 'Soil Saturation Level', value: 81.0, unit: '%', contribution: 'moderate' },
      ],
    },
    created_at: new Date().toISOString(),
  },
  {
    id: 'r-003',
    prediction_time: new Date().toISOString(),
    valid_until: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    latitude: 24.82,
    longitude: 92.79,
    geometry: { type: 'Point', coordinates: [92.79, 24.82] },
    risk_score: 48,
    risk_level: 'MODERATE',
    confidence: 0.78,
    trend: 'STABLE',
    model_version: 'ner-risk-v1.4',
    explanation: {
      factors: [
        { name: '24h Accumulated Rainfall', value: 65.0, unit: 'mm', contribution: 'moderate' },
        { name: 'Terrain Slope Angle', value: 22.1, unit: '°', contribution: 'low' },
      ],
    },
    created_at: new Date().toISOString(),
  },
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'alt-001',
    alert_type: 'SLOPE_WARNING',
    severity: 'CRITICAL',
    title: 'Critical Landslide Warning — East Khasi Hills',
    message: 'Extreme soil saturation (>94%) combined with continuous heavy precipitation (210mm/24h) signals imminent slope failure on NH-6 near Shillong bypass.',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    latitude: 25.57,
    longitude: 91.88,
    risk_prediction_id: 'r-001',
    status: 'ACTIVE',
    issued_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'alt-002',
    alert_type: 'RAINFALL_ALERT',
    severity: 'HIGH',
    title: 'High Hazard Alert — West Siang Sector',
    message: 'Sustained monsoon rain pulse exceeding slope saturation threshold. Highway officers advised to monitor debris flows along NH-13.',
    state: 'Arunachal Pradesh',
    district: 'West Siang',
    latitude: 27.10,
    longitude: 92.00,
    risk_prediction_id: 'r-002',
    status: 'ACTIVE',
    issued_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
];

export class ApiService {
  static async checkHealth(): Promise<{ status: string; service: string; version: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback if backend API is not running locally
    }
    return { status: 'ok (mock)', service: 'TerraSentinel Frontend', version: '0.1.0' };
  }

  static async getLandslides(): Promise<PaginatedResponse<Landslide>> {
    try {
      const res = await fetch(`${API_BASE_URL}/landslides`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback to mock data
    }
    return {
      items: MOCK_LANDSLIDES,
      page: 1,
      page_size: 50,
      total: MOCK_LANDSLIDES.length,
    };
  }

  static async getRiskPredictions(): Promise<PaginatedResponse<RiskPrediction>> {
    try {
      const res = await fetch(`${API_BASE_URL}/risk-predictions`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback to mock data
    }
    return {
      items: MOCK_RISK_PREDICTIONS,
      page: 1,
      page_size: 50,
      total: MOCK_RISK_PREDICTIONS.length,
    };
  }

  static async getAlerts(): Promise<PaginatedResponse<Alert>> {
    try {
      const res = await fetch(`${API_BASE_URL}/alerts`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback to mock data
    }
    return {
      items: MOCK_ALERTS,
      page: 1,
      page_size: 50,
      total: MOCK_ALERTS.length,
    };
  }
}
