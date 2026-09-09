import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  onSignInSuccess: (user: any) => void;
}

const DISTRICTS: Record<string, string[]> = {
  Sikkim: ['East Sikkim (Gangtok)', 'West Sikkim', 'North Sikkim', 'South Sikkim'],
  Meghalaya: ['East Khasi Hills (Shillong)', 'West Khasi Hills', 'Ri-Bhoi', 'West Garo Hills'],
  'Arunachal Pradesh': ['West Siang (Along)', 'Tawang', 'Papum Pare (Itanagar)', 'East Siang'],
  Assam: ['Cachar (Silchar)', 'Kamrup Metro (Guwahati)', 'Dima Hasao', 'Karbi Anglong'],
  Mizoram: ['Aizawl', 'Champhai', 'Lunglei', 'Kolasib'],
  Nagaland: ['Kohima', 'Dimapur', 'Mokokchung', 'Wokha'],
  Manipur: ['Imphal East', 'Imphal West', 'Churachandpur', 'Ukhrul'],
  Tripura: ['West Tripura (Agartala)', 'North Tripura', 'South Tripura'],
};

export const SignInScreen: React.FC<Props> = ({ onSignInSuccess }) => {
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [state, setState] = useState('Sikkim');
  const [district, setDistrict] = useState('East Sikkim (Gangtok)');
  const [otp, setOtp] = useState('4821');

  const handleSendOtp = () => {
    if (phone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }
    const ageNum = parseInt(age, 10);
    if (!age.trim() || isNaN(ageNum) || ageNum < 1 || ageNum > 110) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 1 and 110 years (negative numbers or zero are not allowed).');
      return;
    }
    setStep('otp');
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter a 4-digit code.');
      return;
    }

    const userData = {
      phone: `+91 ${phone}`,
      name: name.trim(),
      age: age.trim(),
      gender,
      state,
      district,
    };

    await AsyncStorage.setItem('@citizen_user', JSON.stringify(userData));
    onSignInSuccess(userData);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.icon}>🏔️</Text>
        <Text style={styles.title}>TerraSentinel</Text>
        <Text style={styles.subtitle}>
          Citizen Safety & Landslide Monitoring Platform
        </Text>
      </View>

      {step === 'details' ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In / Registration</Text>

          {/* Phone */}
          <Text style={styles.label}>Mobile Phone Number:</Text>
          <View style={styles.phoneRow}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>+91</Text>
            </View>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="10-digit mobile number"
              placeholderTextColor="#64748B"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Name */}
          <Text style={styles.label}>Full Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Tenzing Norbu / Ananya"
            placeholderTextColor="#64748B"
            value={name}
            onChangeText={setName}
          />

          {/* Age & Gender */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Age:</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 28"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                maxLength={3}
                value={age}
                onChangeText={(val) => setAge(val.replace(/[^0-9]/g, '').slice(0, 3))}
              />
            </View>
            <View style={{ flex: 2 }}>
              <Text style={styles.label}>Gender:</Text>
              <View style={styles.genderRow}>
                {(['Male', 'Female', 'Other'] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                    onPress={() => setGender(g)}
                  >
                    <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* State */}
          <Text style={styles.label}>State in Northeast India:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stateScroll}>
            {Object.keys(DISTRICTS).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statePill, state === s && styles.statePillActive]}
                onPress={() => {
                  setState(s);
                  setDistrict(DISTRICTS[s][0]);
                }}
              >
                <Text style={[styles.stateText, state === s && styles.stateTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* District */}
          <Text style={styles.label}>District / Town:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stateScroll}>
            {(DISTRICTS[state] || []).map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.statePill, district === d && styles.statePillActive]}
                onPress={() => setDistrict(d)}
              >
                <Text style={[styles.stateText, district === d && styles.stateTextActive]}>
                  {d.split(' (')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleSendOtp}>
            <Text style={styles.primaryBtnText}>SEND VERIFICATION OTP</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Enter 4-Digit OTP</Text>
          <Text style={styles.otpSub}>
            Verification code sent to +91 {phone}
          </Text>

          <TextInput
            style={styles.otpInput}
            keyboardType="numeric"
            maxLength={4}
            value={otp}
            onChangeText={setOtp}
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyOtp}>
            <Text style={styles.primaryBtnText}>VERIFY & ENTER APP</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setStep('details')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Edit Phone Number or Info</Text>
          </TouchableOpacity>
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
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 6,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  countryCode: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  countryCodeText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    color: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  genderBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: 'rgba(56,189,248,0.2)',
    borderColor: '#38BDF8',
  },
  genderText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  genderTextActive: {
    color: '#38BDF8',
  },
  stateScroll: {
    marginBottom: 10,
  },
  statePill: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  statePillActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  stateText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  stateTextActive: {
    color: '#FFFFFF',
  },
  primaryBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  otpSub: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 20,
  },
  otpInput: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#38BDF8',
    color: '#FFFFFF',
    borderRadius: 12,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  backBtn: {
    alignItems: 'center',
    marginTop: 14,
  },
  backBtnText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
});
