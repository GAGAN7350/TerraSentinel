export interface SectorNode {
  id: string;
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  riskScore: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  slopeAngle: number;
  rainfall24h: number;
  lithology: string;
}

export const SECTORS: SectorNode[] = [
  {
    id: 'sec-001',
    name: 'Teesta Valley Corridor (NH-10)',
    district: 'East Sikkim',
    state: 'Sikkim',
    latitude: 27.33,
    longitude: 88.61,
    riskScore: 91,
    riskLevel: 'CRITICAL',
    slopeAngle: 42.5,
    rainfall24h: 210.4,
    lithology: 'Metamorphic Gneiss & Quartzite',
  },
  {
    id: 'sec-002',
    name: 'Shillong Bypass Pass (NH-6)',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    latitude: 25.57,
    longitude: 91.88,
    riskScore: 84,
    riskLevel: 'HIGH',
    slopeAngle: 38.0,
    rainfall24h: 165.8,
    lithology: 'Sandstone Bedrock',
  },
  {
    id: 'sec-003',
    name: 'West Siang Along Ridge (NH-13)',
    district: 'West Siang',
    state: 'Arunachal Pradesh',
    latitude: 27.10,
    longitude: 92.00,
    riskScore: 78,
    riskLevel: 'HIGH',
    slopeAngle: 35.2,
    rainfall24h: 142.0,
    lithology: 'Weathered Granite',
  },
  {
    id: 'sec-004',
    name: 'Silchar Hill Cut (SH-11)',
    district: 'Cachar',
    state: 'Assam',
    latitude: 24.82,
    longitude: 92.79,
    riskScore: 52,
    riskLevel: 'MODERATE',
    slopeAngle: 24.5,
    rainfall24h: 68.5,
    lithology: 'Silty Sand Deposit',
  },
];
