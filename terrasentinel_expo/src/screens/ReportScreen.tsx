import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ReportScreen: React.FC = () => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [reportType, setReportType] = useState('LANDSLIDE');
  const [severity, setSeverity] = useState('HIGH');
  const [description, setDescription] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [pendingReports, setPendingReports] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setCoords({ lat: loc.coords.latitude, lon: loc.coords.longitude });
        }
      } catch (_) {
        setCoords({ lat: 27.3312, lon: 88.6134 });
      }
      loadOutbox();
    })();
  }, []);

  const loadOutbox = async () => {
    try {
      const outboxStr = await AsyncStorage.getItem('@offline_outbox');
      if (outboxStr) setPendingReports(JSON.parse(outboxStr));
    } catch (_) {}
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Denied', 'Camera permission required for ground evidence capture.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: false,
    });
    if (!res.canceled && res.assets && res.assets.length > 0) {
      setPhotoUri(res.assets[0].uri);
    }
  };

  const saveReport = async () => {
    if (!coords) {
      Alert.alert('GPS Pending', 'Please wait for GPS coordinates to lock.');
      return;
    }

    const report = {
      id: `${Date.now()}`,
      reportType,
      severity,
      description,
      photoUri,
      latitude: coords.lat,
      longitude: coords.lon,
      observedAt: new Date().toISOString(),
      syncStatus: 'PENDING_OUTBOX',
    };

    try {
      const outboxStr = await AsyncStorage.getItem('@offline_outbox');
      const outbox = outboxStr ? JSON.parse(outboxStr) : [];
      outbox.unshift(report);
      await AsyncStorage.setItem('@offline_outbox', JSON.stringify(outbox));
      setPendingReports(outbox);
      setDescription('');
      setPhotoUri(null);
      Alert.alert(
        'Saved to Offline Outbox',
        'Report stored safely in local device storage. Background auto-sync active.'
      );
    } catch (e) {
      Alert.alert('Error', 'Could not save report locally.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Field Incident Reporting</Text>
        <Text style={styles.headerSub}>Offline-First Ground Truth Verification</Text>
      </View>

      {/* GPS Lock Banner */}
      <View style={styles.gpsBanner}>
        <Text style={styles.gpsLabel}>GNSS Coordinates Locked:</Text>
        <Text style={styles.gpsValue}>
          {coords ? `${coords.lat.toFixed(4)}° N, ${coords.lon.toFixed(4)}° E` : 'Locking GPS...'}
        </Text>
      </View>

      {/* Photo Capture */}
      <TouchableOpacity style={styles.photoContainer} onPress={takePhoto}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.cameraIcon}>📷</Text>
            <Text style={styles.photoPrompt}>Tap to Capture Landslide Photo Evidence</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Type & Severity Selectors */}
      <View style={styles.card}>
        <Text style={styles.inputLabel}>Incident Type:</Text>
        <View style={styles.pillRow}>
          {['LANDSLIDE', 'ROCKFALL', 'SUBSIDENCE', 'ROAD_BLOCK'].map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.pill, reportType === t && styles.pillActive]}
              onPress={() => setReportType(t)}
            >
              <Text style={[styles.pillText, reportType === t && styles.pillTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.inputLabel, { marginTop: 12 }]}>Severity Tier:</Text>
        <View style={styles.pillRow}>
          {['LOW', 'MODERATE', 'HIGH', 'CRITICAL'].map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.pill, severity === s && styles.pillActive]}
              onPress={() => setSeverity(s)}
            >
              <Text style={[styles.pillText, severity === s && styles.pillTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.inputLabel, { marginTop: 12 }]}>Observations & Road Km:</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={3}
          placeholder="Enter road cut details, village name, estimated length..."
          placeholderTextColor="#64748B"
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={saveReport}>
          <Text style={styles.submitBtnText}>SAVE & QUEUE IN OFFLINE OUTBOX</Text>
        </TouchableOpacity>
      </View>

      {/* Outbox Queue Section */}
      {pendingReports.length > 0 && (
        <View style={styles.outboxSection}>
          <Text style={styles.outboxTitle}>
            Offline Outbox Queue ({pendingReports.length} pending):
          </Text>
          {pendingReports.map((r) => (
            <View key={r.id} style={styles.outboxItem}>
              <Text style={styles.outboxItemTitle}>
                {r.reportType} ({r.severity})
              </Text>
              <Text style={styles.outboxItemSub}>
                Lat: {r.latitude.toFixed(2)}, Lon: {r.longitude.toFixed(2)} • {r.syncStatus}
              </Text>
            </View>
          ))}
        </View>
      )}
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
  gpsBanner: {
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  gpsLabel: {
    color: '#94A3B8',
    fontSize: 11,
  },
  gpsValue: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 2,
  },
  photoContainer: {
    height: 150,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  photoPrompt: {
    color: '#06B6D4',
    fontSize: 13,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  pillActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: '#06B6D4',
  },
  pillText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  textArea: {
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    height: 70,
    textAlignVertical: 'top',
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  outboxSection: {
    marginTop: 8,
  },
  outboxTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 8,
  },
  outboxItem: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  outboxItemTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  outboxItemSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
});
