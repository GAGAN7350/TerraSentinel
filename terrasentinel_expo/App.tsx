import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SignInScreen } from './src/screens/SignInScreen';
import { PredictScreen } from './src/screens/PredictScreen';
import { MapScreen } from './src/screens/MapScreen';
import { AlertsScreen } from './src/screens/AlertsScreen';
import { ReportScreen } from './src/screens/ReportScreen';
import { EmergencySosModal } from './src/screens/EmergencySosModal';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'rate' | 'map' | 'alerts' | 'report'>('rate');
  const [sosVisible, setSosVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('@citizen_user');
        if (saved) {
          setUser(JSON.parse(saved));
        }
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('@citizen_user');
    setUser(null);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#38BDF8', fontSize: 16 }}>Loading TerraSentinel...</Text>
      </View>
    );
  }

  // Show Sign In Screen if not authenticated
  if (!user) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0F172A" />
        <SignInScreen onSignInSuccess={(u) => setUser(u)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar style="light" backgroundColor="#0F172A" />

        {/* Citizen App Header */}
        <View style={styles.appHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.logoIcon}>🏔️</Text>
            <View>
              <Text style={styles.appTitle}>TerraSentinel</Text>
              <Text style={styles.locationSub}>
                {user.state} • {user.district.split(' (')[0]}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.userChip} onPress={handleSignOut}>
            <View style={styles.userAvatar}>
              <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.userNameText}>{user.name.split(' ')[0]}</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.screenContainer}>
          {currentTab === 'rate' && <PredictScreen />}
          {currentTab === 'map' && <MapScreen />}
          {currentTab === 'alerts' && <AlertsScreen />}
          {currentTab === 'report' && <ReportScreen />}
        </View>

        {/* Bottom Navigation Bar */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCurrentTab('rate')}
          >
            <Text style={styles.navIcon}>📊</Text>
            <Text style={[styles.navText, currentTab === 'rate' && styles.navTextActive]}>
              Risk Rate
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCurrentTab('map')}
          >
            <Text style={styles.navIcon}>🗺️</Text>
            <Text style={[styles.navText, currentTab === 'map' && styles.navTextActive]}>
              Hazard Map
            </Text>
          </TouchableOpacity>

          {/* Floating Center SOS Button */}
          <TouchableOpacity
            style={styles.centerSosBtn}
            onPress={() => setSosVisible(true)}
          >
            <Text style={styles.sosEmoji}>🚨</Text>
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCurrentTab('alerts')}
          >
            <Text style={styles.navIcon}>🔔</Text>
            <Text style={[styles.navText, currentTab === 'alerts' && styles.navTextActive]}>
              Alerts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCurrentTab('report')}
          >
            <Text style={styles.navIcon}>📝</Text>
            <Text style={[styles.navText, currentTab === 'report' && styles.navTextActive]}>
              Report
            </Text>
          </TouchableOpacity>
        </View>

        {/* Emergency SOS Modal */}
        <EmergencySosModal
          visible={sosVisible}
          onClose={() => setSosVisible(false)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    fontSize: 22,
  },
  appTitle: {
    color: '#38BDF8',
    fontSize: 15,
    fontWeight: '800',
  },
  locationSub: {
    color: '#94A3B8',
    fontSize: 11,
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  userAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  userNameText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  screenContainer: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  navText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: 'bold',
  },
  navTextActive: {
    color: '#38BDF8',
  },
  centerSosBtn: {
    backgroundColor: '#DC2626',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FACC15',
    elevation: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  sosEmoji: {
    fontSize: 17,
  },
  sosText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 9,
    letterSpacing: 0.5,
  },
});
