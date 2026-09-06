/**
 * TerraSentinel Domain Types — Phase 1 & Phase 2 Schema Definitions
 */

export type UserRole = 'admin' | 'officer';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude] WGS84
}

export interface Landslide {
  id: string;
  source: string | null;
  external_id: string | null;
  state: string | null;
  district: string | null;
  subdivision: string | null;
  village: string | null;
  slide_name: string | null;
  slide_no: string | null;
  nh_sh_location: string | null;
  latitude: number;
  longitude: number;
  geometry?: GeoJSONPoint | null;
  occurrence_date: string | null;
  material_involved: string | null;
  movement_type: string | null;
  history: string | null;
  created_at: string;
  updated_at: string;
}

export interface RainfallObservation {
  id: string;
  source: string | null;
  observation_time: string;
  latitude: number;
  longitude: number;
  geometry?: GeoJSONPoint | null;
  rainfall_mm: number;
  duration_minutes: number | null;
  cell_id: string | null;
  created_at: string;
}

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type RiskTrend = 'STABLE' | 'INCREASING' | 'DECREASING';

export interface FactorExplanation {
  name: string;
  value: number;
  unit: string;
  contribution: 'low' | 'moderate' | 'high' | 'critical';
}

export interface RiskExplanation {
  factors: FactorExplanation[];
}

export interface RiskPrediction {
  id: string;
  prediction_time: string;
  valid_until: string | null;
  latitude: number;
  longitude: number;
  geometry?: GeoJSONPoint | null;
  risk_score: number; // 0 to 100
  risk_level: RiskLevel;
  confidence: number | null; // 0 to 1
  trend: RiskTrend | null;
  model_version: string | null;
  explanation: RiskExplanation | null;
  created_at: string;
}

export interface RiskSector {
  id: string;
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  riskScore: number;
  riskLevel: RiskLevel;
  slopeAngle: number;
  rainfall24h: number;
  lithology: string;
  lastUpdated?: string;
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'DRAFT' | 'ACTIVE' | 'RESOLVED' | 'EXPIRED';

export interface Alert {
  id: string;
  alert_type: string | null;
  severity: AlertSeverity;
  title: string;
  message: string;
  state: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  geometry?: GeoJSONPoint | null;
  risk_prediction_id: string | null;
  status: AlertStatus;
  issued_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export type ReportType = 'CRACK' | 'SLOPE_MOVEMENT' | 'ROAD_BLOCKAGE' | 'LANDSLIDE' | 'OTHER';
export type ReportSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface FieldReport {
  id: string;
  submitted_by: string | null;
  latitude: number;
  longitude: number;
  geometry?: GeoJSONPoint | null;
  state: string | null;
  district: string | null;
  report_type: ReportType;
  severity: ReportSeverity;
  description: string | null;
  observed_at: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
}
