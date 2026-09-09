import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { RiskBadge } from '../components/RiskBadge';

const ALERTS_DATA = [
  {
    id: 'alt-001',
    title: 'Imminent Slope Failure on Shillong Bypass (NH-6)',
    message: 'Severe saturation after 210mm torrential rainfall. Traffic diversion in effect. Local residents advised to avoid lower valley paths.',
    severity: 'CRITICAL',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    time: 'Today, 11:30 AM',
    source: 'State Disaster Management Authority (SDMA)',
  },
  {
    id: 'alt-002',
    title: 'Debris Flow Warning along NH-13 Km 42',
    message: 'Active hillside slope movement reported. Emergency road clearance equipment mobilized on standby.',
    severity: 'HIGH',
    state: 'Arunachal Pradesh',
    district: 'West Siang',
    time: 'Today, 09:15 AM',
    source: 'District EOC',
  },
  {
    id: 'alt-003',
    title: 'Monsoon Rainfall Advisory across Teesta Basin',
    message: 'Continuous rainfall expected over next 48 hours. Travelers advised to check road status before departure.',
    severity: 'MODERATE',
    state: 'Sikkim',
    district: 'East Sikkim',
    time: 'Yesterday',
    source: 'IMD & District Administration',
  },
];

export const AlertsScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Disaster Alerts & Early Warnings</Text>
        <Text style={styles.headerSub}>Official Bulletins from District Administration</Text>
      </View>

      {ALERTS_DATA.map((alert) => {
        const isCritical = alert.severity === 'CRITICAL';
        return (
          <View
            key={alert.id}
            style={[
              styles.alertCard,
              { borderLeftColor: isCritical ? '#EF4444' : (alert.severity === 'HIGH' ? '#F97316' : '#EAB308') }
            ]}
          >
            <View style={styles.cardHeader}>
              <RiskBadge level={alert.severity} />
              <Text style={styles.locationText}>{alert.district}, {alert.state}</Text>
            </View>

            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertMessage}>{alert.message}</Text>

            <View style={styles.footerRow}>
              <Text style={styles.sourceText}>Source: {alert.source}</Text>
              <Text style={styles.timeText}>{alert.time}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 16,
    paddingTop: 48,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  alertCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  alertTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6,
  },
  alertMessage: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 8,
  },
  sourceText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '500',
  },
  timeText: {
    color: '#64748B',
    fontSize: 10,
  },
});
