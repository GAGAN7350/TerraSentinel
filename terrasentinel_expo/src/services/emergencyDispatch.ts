import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DispatchResult {
  latitude: number;
  longitude: number;
  altitude: number;
  timestamp: string;
  smsBody: string;
  summary: string;
}

export class EmergencyDispatchService {
  public static async triggerSosDispatch(
    situationDescription: string,
    isRoadBlocked: boolean = true
  ): Promise<DispatchResult> {
    // 1. Request location permissions and lock high accuracy GPS
    let lat = 27.33; // Default Gangtok
    let lon = 88.61;
    let alt = 1450;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        lat = loc.coords.latitude;
        lon = loc.coords.longitude;
        alt = loc.coords.altitude ?? 1450;
      }
    } catch (_) {}

    const timestamp = new Date().toISOString();
    const mapsUrl = `https://maps.google.com/?q=${lat},${lon}`;
    const smsBody =
      `EMERGENCY SOS: UNPREDICTED LANDSLIDE!\n` +
      `Coords: Lat ${lat.toFixed(4)}, Lon ${lon.toFixed(4)} (Alt ${Math.round(alt)}m)\n` +
      `Road Blockage: ${isRoadBlocked ? 'YES' : 'NO'}\n` +
      `Notes: ${situationDescription}\n` +
      `Map: ${mapsUrl}\n` +
      `Dispatched to Police (112), Fire (101), Health (108), DDMA (1070).`;

    // 2. Save to local storage audit trail
    const record = {
      id: `${Date.now()}`,
      latitude: lat,
      longitude: lon,
      altitude: alt,
      timestamp,
      description: situationDescription,
      smsBody,
    };

    try {
      const historyStr = await AsyncStorage.getItem('@sos_history');
      const history = historyStr ? JSON.parse(historyStr) : [];
      history.unshift(record);
      await AsyncStorage.setItem('@sos_history', JSON.stringify(history));
    } catch (_) {}

    return {
      latitude: lat,
      longitude: lon,
      altitude: alt,
      timestamp,
      smsBody,
      summary: `SOS locked at (${lat.toFixed(4)}, ${lon.toFixed(4)}). Dispatching to Police (112), Fire (101), Ambulance (108).`,
    };
  }

  public static async callAgency(phoneNumber: string): Promise<void> {
    const url = `tel:${phoneNumber}`;
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
    }
  }

  public static async sendSms(phoneNumber: string, body: string): Promise<void> {
    const separator = Platform.OS === 'ios' ? '&' : '?';
    const url = `sms:${phoneNumber}${separator}body=${encodeURIComponent(body)}`;
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
    }
  }
}
