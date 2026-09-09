/// Emergency contact registry for North-East India (NER) and National Disaster Management.
class EmergencyAgency {
  final String name;
  final String category; // 'POLICE', 'FIRE', 'HEALTH', 'DISASTER'
  final String phoneNumber;
  final String icon;
  final String description;

  const EmergencyAgency({
    required this.name,
    required this.category,
    required this.phoneNumber,
    required this.icon,
    required this.description,
  });
}

class EmergencyContacts {
  // National Universal Emergency Toll-Free Services
  static const EmergencyAgency police = EmergencyAgency(
    name: 'Police Control Room (PCR)',
    category: 'POLICE',
    phoneNumber: '112',
    icon: 'police',
    description: 'National Unified Emergency Helpline — Immediate Law Enforcement & First Response',
  );

  static const EmergencyAgency fire = EmergencyAgency(
    name: 'Fire & Emergency Rescue Services',
    category: 'FIRE',
    phoneNumber: '101',
    icon: 'fire',
    description: 'Hazardous Rescue, Landslide Extrication & Fire Service Dispatch',
  );

  static const EmergencyAgency ambulance = EmergencyAgency(
    name: 'Disaster Health & Ambulance (EMRI)',
    category: 'HEALTH',
    phoneNumber: '108',
    icon: 'ambulance',
    description: 'Emergency Medical Trauma Care, Paramedics & Rapid Patient Transport',
  );

  static const EmergencyAgency ndrf = EmergencyAgency(
    name: 'National Disaster Response Force (NDRF)',
    category: 'DISASTER',
    phoneNumber: '1078',
    icon: 'shield',
    description: 'Specialized Search & Rescue for Catastrophic Landslides & Flash Floods',
  );

  // State Disaster Management Authorities (SDMA / DEOC) for the 8 NER States
  static const Map<String, EmergencyAgency> stateDisasterAgencies = {
    'Sikkim': EmergencyAgency(
      name: 'Sikkim State Disaster Management Authority (SSDMA)',
      category: 'DISASTER',
      phoneNumber: '1070',
      icon: 'mountain',
      description: 'Gangtok Emergency Operation Centre: 03592-205880',
    ),
    'Meghalaya': EmergencyAgency(
      name: 'Meghalaya State Disaster Management Authority (SDMA)',
      category: 'DISASTER',
      phoneNumber: '1070',
      icon: 'mountain',
      description: 'Shillong State EOC: 0364-2502188',
    ),
    'Assam': EmergencyAgency(
      name: 'Assam State Disaster Management Authority (ASDMA)',
      category: 'DISASTER',
      phoneNumber: '1070',
      icon: 'mountain',
      description: 'Guwahati State EOC: 0361-2237221 / 1079',
    ),
    'Arunachal Pradesh': EmergencyAgency(
      name: 'Arunachal Pradesh Disaster Management (APSDMA)',
      category: 'DISASTER',
      phoneNumber: '1070',
      icon: 'mountain',
      description: 'Itanagar EOC: 0360-2212222',
    ),
    'Mizoram': EmergencyAgency(
      name: 'Mizoram Disaster Management & Rehabilitation',
      category: 'DISASTER',
      phoneNumber: '1070',
      icon: 'mountain',
      description: 'Aizawl Emergency Operation Centre: 0389-2335837',
    ),
    'Nagaland': EmergencyAgency(
      name: 'Nagaland State Disaster Management Authority (NSDMA)',
      category: 'DISASTER',
      phoneNumber: '1070',
      icon: 'mountain',
      description: 'Kohima State EOC: 0370-2291122',
    ),
    'Manipur': EmergencyAgency(
      name: 'Manipur State Disaster Management Authority',
      category: 'DISASTER',
      phoneNumber: '1070',
      icon: 'mountain',
      description: 'Imphal State EOC: 0385-2443441',
    ),
    'Tripura': EmergencyAgency(
      name: 'Tripura State Disaster Management Authority',
      category: 'DISASTER',
      phoneNumber: '1070',
      icon: 'mountain',
      description: 'Agartala State EOC: 0381-2416045',
    ),
  };

  static List<EmergencyAgency> getAllPrimaryAgencies() {
    return [police, fire, ambulance, ndrf];
  }

  static EmergencyAgency getAgencyForState(String state) {
    return stateDisasterAgencies[state] ??
        const EmergencyAgency(
          name: 'District Disaster Management Authority (DDMA)',
          category: 'DISASTER',
          phoneNumber: '1077',
          icon: 'shield',
          description: 'District Emergency Operations Centre (DEOC)',
        );
  }
}
