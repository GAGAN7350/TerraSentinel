import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

class AlertAudioService {
  private static instance: AlertAudioService;
  private sound: Audio.Sound | null = null;
  private isAlarmPlaying: boolean = false;
  private vibrationInterval: any = null;

  private constructor() {}

  public static getInstance(): AlertAudioService {
    if (!AlertAudioService.instance) {
      AlertAudioService.instance = new AlertAudioService();
    }
    return AlertAudioService.instance;
  }

  public async startEmergencySiren(): Promise<void> {
    if (this.isAlarmPlaying) return;
    this.isAlarmPlaying = true;

    try {
      // Configure audio mode to override silent switch
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
      });

      // Looping alarm sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg' },
        { isLooping: true, volume: 1.0 }
      );
      this.sound = sound;
      await this.sound.playAsync();
    } catch (e) {
      console.warn('Could not play siren audio:', e);
    }

    // Heavy emergency vibration pulses
    this.vibrationInterval = setInterval(() => {
      if (!this.isAlarmPlaying) {
        clearInterval(this.vibrationInterval);
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }, 1200);
  }

  public async stopEmergencySiren(): Promise<void> {
    this.isAlarmPlaying = false;
    if (this.vibrationInterval) {
      clearInterval(this.vibrationInterval);
      this.vibrationInterval = null;
    }
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      } catch (_) {}
      this.sound = null;
    }
  }

  public isPlaying(): boolean {
    return this.isAlarmPlaying;
  }
}

export const alertAudio = AlertAudioService.getInstance();
