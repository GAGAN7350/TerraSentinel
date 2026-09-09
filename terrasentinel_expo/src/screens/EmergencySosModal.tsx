import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  EmergencyDispatchService,
  DispatchResult,
} from '../services/emergencyDispatch';
import {
  PRIMARY_AGENCIES,
  NER_STATE_AGENCIES,
} from '../constants/emergencyContacts';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const EmergencySosModal: React.FC<Props> = ({ visible, onClose }) => {
  const [desc, setDesc] = useState(
    'Active unpredicted landslide detected on road corridor. Potential casualties / blockage. Immediate first-responder dispatch requested.'
  );
  const [selectedState, setSelectedState] = useState('Sikkim');
  const [isRoadBlocked, setIsRoadBlocked] = useState(true);
  const [dispatchResult, setDispatchResult] = useState<DispatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDispatchAll = async () => {
    setLoading(true);
    try {
      const result = await EmergencyDispatchService.triggerSosDispatch(
        desc,
        isRoadBlocked
      );
      setDispatchResult(result);
      Alert.alert(
        '🚨 DISPATCH SUCCESS',
        `${result.summary}\n\nSMS fallback payload prepared for offline carrier transmission.`
      );
    } catch (e) {
      Alert.alert('Dispatch Error', 'Could not lock GPS or trigger dispatch.');
    } finally {
      setLoading(false);
    }
  };

  const stateAgency = NER_STATE_AGENCIES[selectedState] ?? NER_STATE_AGENCIES['Sikkim'];

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.appBar}>
          <Text style={styles.appBarTitle}>🚨 EMERGENCY CONTROL ROOM DISPATCH</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>CLOSE</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Warning Banner */}
          <View style={styles.banner}>
            <Text style={styles.bannerHeading}>UNPREDICTED LANDSLIDE FAIL-SAFE</Text>
            <Text style={styles.bannerText}>
              Use this trigger when a sudden slope failure or landslide occurs without model warning.
              Locks high-accuracy GNSS coordinates and alerts Police, Fire, Ambulance, and DDMA.
            </Text>
          </View>

          {/* Incident Input */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Incident Description:</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={3}
              value={desc}
              onChangeText={setDesc}
            />

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setIsRoadBlocked(!isRoadBlocked)}
            >
              <Text style={styles.toggleLabel}>Road Blocked (BRO/PWD Dispatch):</Text>
              <View style={[styles.toggleBadge, isRoadBlocked && styles.toggleBadgeActive]}>
                <Text style={styles.toggleBadgeText}>
                  {isRoadBlocked ? 'YES (CRITICAL)' : 'NO'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Giant 1-Tap Multi-Agency Dispatch Action Button */}
          <TouchableOpacity
            style={[styles.bigDispatchBtn, loading && styles.disabledBtn]}
            disabled={loading}
            onPress={handleDispatchAll}
          >
            <Text style={styles.bigDispatchBtnText}>
              {loading ? 'LOCKING GPS & DISPATCHING...' : '🚨 DISPATCH ALL EMERGENCY CONTROL ROOMS'}
            </Text>
          </TouchableOpacity>

          {/* Direct Hotlines */}
          <Text style={styles.sectionHeader}>Direct Agency Hotlines (Tap to Call / SMS):</Text>

          {PRIMARY_AGENCIES.map((agency, index) => (
            <View key={index} style={styles.agencyCard}>
              <View style={styles.agencyInfo}>
                <Text style={styles.agencyName}>{agency.name}</Text>
                <Text style={styles.agencyPhone}>Toll-Free: {agency.phoneNumber}</Text>
                <Text style={styles.agencyDesc}>{agency.description}</Text>
              </View>
              <View style={styles.agencyActions}>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => EmergencyDispatchService.callAgency(agency.phoneNumber)}
                >
                  <Text style={styles.callBtnText}>CALL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.smsBtn}
                  onPress={() =>
                    EmergencyDispatchService.sendSms(
                      agency.phoneNumber,
                      dispatchResult?.smsBody ?? desc
                    )
                  }
                >
                  <Text style={styles.smsBtnText}>SMS</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* State DDMA */}
          <View style={styles.agencyCard}>
            <View style={styles.agencyInfo}>
              <Text style={styles.agencyName}>{stateAgency.name}</Text>
              <Text style={styles.agencyPhone}>State EOC: {stateAgency.phoneNumber}</Text>
              <Text style={styles.agencyDesc}>{stateAgency.description}</Text>
            </View>
            <View style={styles.agencyActions}>
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => EmergencyDispatchService.callAgency(stateAgency.phoneNumber)}
              >
                <Text style={styles.callBtnText}>CALL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.smsBtn}
                onPress={() =>
                  EmergencyDispatchService.sendSms(
                    stateAgency.phoneNumber,
                    dispatchResult?.smsBody ?? desc
                  )
                }
              >
                <Text style={styles.smsBtnText}>SMS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  appBar: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#7F1D1D',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appBarTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  closeBtn: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  banner: {
    backgroundColor: '#991B1B',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  bannerHeading: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  bannerText: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#CBD5E1',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    height: 70,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  toggleLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  toggleBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleBadgeActive: {
    backgroundColor: '#DC2626',
  },
  toggleBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
  },
  bigDispatchBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FACC15',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  bigDispatchBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
    textAlign: 'center',
  },
  sectionHeader: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  agencyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  agencyInfo: {
    flex: 1,
    marginRight: 10,
  },
  agencyName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  agencyPhone: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  agencyDesc: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  agencyActions: {
    flexDirection: 'row',
    gap: 6,
  },
  callBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
  },
  smsBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  smsBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
  },
});
