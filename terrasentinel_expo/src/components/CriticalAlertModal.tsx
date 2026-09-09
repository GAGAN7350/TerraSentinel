import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { alertAudio } from '../services/alertAudio';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
}

export const CriticalAlertModal: React.FC<Props> = ({
  visible,
  title,
  message,
  onDismiss,
}) => {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let timer: any = null;
    if (visible) {
      timer = setInterval(() => {
        setFlash((prev) => !prev);
      }, 500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: flash ? '#7F1D1D' : '#450A0A' }]}>
          <Text style={styles.icon}>🚨</Text>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>CRITICAL LANDSLIDE ALARM</Text>
          </View>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            style={styles.actionBtn}
            onPressed={() => {}}
            onPress={async () => {
              await alertAudio.stopEmergencySiren();
              onDismiss();
            }}
          >
            <Text style={styles.actionBtnText}>ACKNOWLEDGE & SILENCE SIREN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  badgeText: {
    color: '#FACC15',
    fontWeight: 'bold',
    fontSize: 11,
  },
  message: {
    color: '#E2E8F0',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  actionBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#991B1B',
    fontWeight: '900',
    fontSize: 13,
  },
});
