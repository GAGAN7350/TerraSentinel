import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

const REGIONS = [
  {
    name: 'Teesta Valley Corridor (NH-10)',
    state: 'Sikkim',
    rate: 78,
    level: 'HIGH RISK',
    color: '#F97316',
    rain: '142.5 mm',
    soil: '89.2 %',
    advisory: 'Steep hill cut with high moisture. Avoid night transit on NH-10.',
  },
  {
    name: 'Shillong Bypass (NH-6)',
    state: 'Meghalaya',
    rate: 91,
    level: 'CRITICAL DANGER',
    color: '#EF4444',
    rain: '210.4 mm',
    soil: '96.4 %',
    advisory: 'Imminent slope failure near bypass. Follow administrative road diversions.',
  },
  {
    name: 'West Siang Along (NH-13)',
    state: 'Arunachal Pradesh',
    rate: 68,
    level: 'ELEVATED CAUTION',
    color: '#F97316',
    rain: '98.0 mm',
    soil: '74.1 %',
    advisory: 'Debris flows possible on unpaved cuts. Keep emergency numbers on speed dial.',
  },
  {
    name: 'Silchar Hill Cut (SH-11)',
    state: 'Assam',
    rate: 42,
    level: 'MODERATE RISK',
    color: '#EAB308',
    rain: '45.0 mm',
    soil: '56.0 %',
    advisory: 'Normal traffic movement. Minor gravel washouts possible after localized rain.',
  },
  {
    name: 'Champhai Border Pass',
    state: 'Mizoram',
    rate: 22,
    level: 'LOW / SAFE',
    color: '#22C55E',
    rain: '12.0 mm',
    soil: '38.5 %',
    advisory: 'Dry stable slope conditions. No active landslide warnings in this sector.',
  },
];

export const PredictScreen: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const cur = REGIONS[selectedIdx];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Route Selector Pills */}
      <Text style={styles.sectionLabel}>SELECT ROUTE / DISTRICT TO MONITOR:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
        {REGIONS.map((r, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.pill, selectedIdx === i && styles.pillActive]}
            onPress={() => setSelectedIdx(i)}
          >
            <Text style={[styles.pillText, selectedIdx === i && styles.pillTextActive]}>
              {r.name.split(' (')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main Susceptibility Rate Card */}
      <View style={styles.rateCard}>
        <View style={styles.rateTopRow}>
          <Text style={styles.rateCardLabel}>Landslide Susceptibility Rate</Text>
          <View style={[styles.badge, { borderColor: cur.color, backgroundColor: `${cur.color}20` }]}>
            <Text style={[styles.badgeText, { color: cur.color }]}>{cur.level.split(' ')[0]}</Text>
          </View>
        </View>

        {/* Circular Percentage Meter */}
        <View style={[styles.circleMeter, { borderColor: cur.color, backgroundColor: `${cur.color}15` }]}>
          <Text style={styles.circleNumber}>{cur.rate}%</Text>
          <Text style={styles.circleSub}>Susceptibility</Text>
        </View>

        <Text style={[styles.rateStatus, { color: cur.color }]}>{cur.level}</Text>
        <Text style={styles.regionName}>{cur.name}, {cur.state}</Text>

        {/* Progress Bar */}
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${cur.rate}%`, backgroundColor: cur.color }]} />
        </View>
        <View style={styles.barLabels}>
          <Text style={styles.barLabelText}>0% Safe</Text>
          <Text style={styles.barLabelText}>50% Caution</Text>
          <Text style={styles.barLabelText}>100% Critical</Text>
        </View>
      </View>

      {/* Weather & Ground Conditions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Weather & Slope Conditions</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>24h Rainfall</Text>
            <Text style={styles.metricValue}>{cur.rain}</Text>
            <Text style={styles.metricSub}>Monsoon telemetry</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Soil Saturation</Text>
            <Text style={[styles.metricValue, { color: cur.color }]}>{cur.soil}</Text>
            <Text style={styles.metricSub}>Pore water pressure</Text>
          </View>
        </View>
      </View>

      {/* Citizen Safety Advisory */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Safety Advisory for Travelers & Residents</Text>
        <View style={styles.tipRow}>
          <Text style={styles.tipIcon}>⚠️</Text>
          <Text style={styles.tipText}>{cur.advisory}</Text>
        </View>
        <View style={styles.tipRow}>
          <Text style={styles.tipIcon}>📞</Text>
          <Text style={styles.tipText}>In case of road cut failure, contact Police (112) or State EOC (1070).</Text>
        </View>
      </View>
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
  sectionLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  pillScroll: {
    marginBottom: 16,
  },
  pill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  pillActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  pillText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  rateCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  rateTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rateCardLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  circleMeter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
  },
  circleNumber: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
  },
  circleSub: {
    color: '#94A3B8',
    fontSize: 11,
  },
  rateStatus: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  regionName: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  barBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#0F172A',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 6,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barLabels: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barLabelText: {
    color: '#64748B',
    fontSize: 10,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
  },
  metricLabel: {
    color: '#94A3B8',
    fontSize: 11,
  },
  metricValue: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  metricSub: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginTop: 8,
  },
  tipIcon: {
    fontSize: 16,
  },
  tipText: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 16,
  },
});
