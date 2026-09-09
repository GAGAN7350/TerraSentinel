import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { RiskBadge } from '../components/RiskBadge';

const MOCK_POINTS = [
  { id: '1', lat: 27.33, lon: 88.61, name: 'Teesta Valley Corridor (NH-10)', score: 91, level: 'CRITICAL' },
  { id: '2', lat: 25.57, lon: 91.88, name: 'Shillong Bypass Pass (NH-6)', score: 84, level: 'HIGH' },
  { id: '3', lat: 27.10, lon: 92.00, name: 'West Siang Along Ridge (NH-13)', score: 78, level: 'HIGH' },
  { id: '4', lat: 24.82, lon: 92.79, name: 'Silchar Hill Cut (SH-11)', score: 52, level: 'MODERATE' },
  { id: '5', lat: 23.45, lon: 93.32, name: 'Champhai Border Pass', score: 35, level: 'LOW' },
];

export const MapScreen: React.FC = () => {
  const [selectedPoint, setSelectedPoint] = useState<any>(MOCK_POINTS[0]);
  const [userLoc, setUserLoc] = useState({ lat: 27.33, lon: 88.61 });

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setUserLoc({ lat: loc.coords.latitude, lon: loc.coords.longitude });
        }
      } catch (_) {}
    })();
  }, []);

  // Leaflet HTML template inside WebView (100% Expo Go compatible!)
  const leafletHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; background: #0F172A; }
          #map { width: 100vw; height: 100vh; }
          .custom-pin {
            display: flex; align-items: center; justify-content: center;
            border-radius: 50%; color: white; font-weight: bold; font-size: 11px;
            border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', { zoomControl: false }).setView([${userLoc.lat}, ${userLoc.lon}], 8);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

          // User Marker
          L.circleMarker([${userLoc.lat}, ${userLoc.lon}], {
            radius: 8, color: '#38BDF8', fillColor: '#0284C7', fillOpacity: 0.8
          }).addTo(map).bindPopup("Current Position");

          // Hazard Centroids
          const points = ${JSON.stringify(MOCK_POINTS)};
          points.forEach(p => {
            let color = '#22C55E';
            if (p.level === 'CRITICAL') color = '#EF4444';
            else if (p.level === 'HIGH') color = '#F97316';
            else if (p.level === 'MODERATE') color = '#EAB308';

            const marker = L.circleMarker([p.lat, p.lon], {
              radius: p.level === 'CRITICAL' ? 14 : 10,
              color: '#FFFFFF',
              weight: 2,
              fillColor: color,
              fillOpacity: 0.9
            }).addTo(map);

            marker.on('click', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify(p));
            });
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: leafletHtml }}
        style={styles.map}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            setSelectedPoint(data);
          } catch (_) {}
        }}
      />

      {/* Floating Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TerraSentinel GIS Risk Map</Text>
        <Text style={styles.headerSub}>Northeast India Regional Monitoring</Text>
      </View>

      {/* Detail Bottom Card */}
      {selectedPoint && (
        <View style={styles.bottomCard}>
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.pointName}>{selectedPoint.name}</Text>
              <Text style={styles.pointCoords}>
                {selectedPoint.lat.toFixed(2)}°N, {selectedPoint.lon.toFixed(2)}°E
              </Text>
            </View>
            <RiskBadge level={selectedPoint.level} score={selectedPoint.score} />
          </View>
          <View style={styles.cardActions}>
            <Text style={styles.cardActionText}>
              XGBoost Model Prediction • TreeSHAP Active
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 8,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pointName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pointCoords: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  cardActions: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  cardActionText: {
    color: '#06B6D4',
    fontSize: 11,
    fontWeight: '500',
  },
});
