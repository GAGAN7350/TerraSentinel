import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ShapDriver {
  name: string;
  shap: number;
  label: string;
}

interface Props {
  drivers: ShapDriver[];
  calibratedProb?: number;
}

export const ShapChart: React.FC<Props> = ({ drivers, calibratedProb }) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>AI Decision Drivers (TreeSHAP)</Text>
        {calibratedProb !== undefined && (
          <View style={styles.probBadge}>
            <Text style={styles.probText}>
              Calibrated P: {(calibratedProb * 100).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.subtitle}>
        Feature contributions to slope failure susceptibility (log-odds impact):
      </Text>

      <View style={styles.driversList}>
        {drivers.map((d, index) => {
          const isPositive = d.shap >= 0;
          const barColor = isPositive ? '#EF4444' : '#10B981';
          const widthPercent = Math.min(Math.max((Math.abs(d.shap) / 2.5) * 100, 8), 100);

          return (
            <View key={index} style={styles.driverItem}>
              <View style={styles.labelRow}>
                <Text style={styles.featureLabel}>{d.label}</Text>
                <Text style={[styles.shapValue, { color: barColor }]}>
                  {isPositive ? '+' : ''}{d.shap.toFixed(3)}
                </Text>
              </View>
              <View style={styles.barBackground}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${widthPercent}%`, backgroundColor: barColor },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
      <Text style={styles.footerNote}>
        Red indicates features increasing slope instability. Green indicates stabilizing factors.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 12,
  },
  probBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#06B6D4',
  },
  probText: {
    color: '#06B6D4',
    fontSize: 11,
    fontWeight: 'bold',
  },
  driversList: {
    gap: 8,
  },
  driverItem: {
    marginVertical: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  featureLabel: {
    color: '#E2E8F0',
    fontSize: 12,
  },
  shapValue: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  barBackground: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  footerNote: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 12,
    fontStyle: 'italic',
  },
});
