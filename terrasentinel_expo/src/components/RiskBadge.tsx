import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  level: string;
  score?: number;
}

export const RiskBadge: React.FC<Props> = ({ level, score }) => {
  let color = '#22C55E';
  switch (level?.toUpperCase()) {
    case 'CRITICAL':
      color = '#EF4444';
      break;
    case 'HIGH':
      color = '#F97316';
      break;
    case 'MODERATE':
      color = '#EAB308';
      break;
  }

  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: `${color}20` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>
        {score !== undefined ? `${level} (${Math.round(score)})` : level}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});
