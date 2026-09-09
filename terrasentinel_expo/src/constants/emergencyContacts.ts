export interface EmergencyAgency {
  name: string;
  category: 'POLICE' | 'FIRE' | 'HEALTH' | 'DISASTER';
  phoneNumber: string;
  description: string;
}

export const PRIMARY_AGENCIES: EmergencyAgency[] = [
  {
    name: 'Police Control Room (PCR)',
    category: 'POLICE',
    phoneNumber: '112',
    description: 'National Unified Emergency Helpline — Immediate Law Enforcement Dispatch',
  },
  {
    name: 'Fire & Emergency Rescue Services',
    category: 'FIRE',
    phoneNumber: '101',
    description: 'Landslide Extrication, Debris Search & Hazardous Rescue',
  },
  {
    name: 'Disaster Health & Ambulance (EMRI)',
    category: 'HEALTH',
    phoneNumber: '108',
    description: 'Emergency Trauma Care, Paramedics & Rapid Patient Evacuation',
  },
  {
    name: 'National Disaster Response Force (NDRF)',
    category: 'DISASTER',
    phoneNumber: '1078',
    description: 'Specialized Search & Rescue for Major Slope Collapses',
  },
];

export const NER_STATE_AGENCIES: Record<string, EmergencyAgency> = {
  Sikkim: {
    name: 'Sikkim State Disaster Management (SSDMA)',
    category: 'DISASTER',
    phoneNumber: '1070',
    description: 'Gangtok Emergency Operations Centre: 03592-205880',
  },
  Meghalaya: {
    name: 'Meghalaya State Disaster Management (SDMA)',
    category: 'DISASTER',
    phoneNumber: '1070',
    description: 'Shillong State EOC: 0364-2502188',
  },
  Assam: {
    name: 'Assam State Disaster Management (ASDMA)',
    category: 'DISASTER',
    phoneNumber: '1070',
    description: 'Guwahati State EOC: 0361-2237221',
  },
  'Arunachal Pradesh': {
    name: 'Arunachal Pradesh Disaster Management',
    category: 'DISASTER',
    phoneNumber: '1070',
    description: 'Itanagar State EOC: 0360-2212222',
  },
  Mizoram: {
    name: 'Mizoram Disaster Management',
    category: 'DISASTER',
    phoneNumber: '1070',
    description: 'Aizawl Emergency Operation Centre: 0389-2335837',
  },
  Nagaland: {
    name: 'Nagaland State Disaster Management (NSDMA)',
    category: 'DISASTER',
    phoneNumber: '1070',
    description: 'Kohima State EOC: 0370-2291122',
  },
  Manipur: {
    name: 'Manipur State Disaster Management',
    category: 'DISASTER',
    phoneNumber: '1070',
    description: 'Imphal State EOC: 0385-2443441',
  },
  Tripura: {
    name: 'Tripura State Disaster Management',
    category: 'DISASTER',
    phoneNumber: '1070',
    description: 'Agartala State EOC: 0381-2416045',
  },
};
