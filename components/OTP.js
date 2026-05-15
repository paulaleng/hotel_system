import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';

const APP_URL = 'http://192.168.100.13:8000';

export default function OTP({ route, navigation }) {

  const { username } = route.params;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const verifyOTP = async () => {

    if (!otp.trim()) {
      Alert.alert("Error", "Enter OTP");
      return;
    }

    setLoading(true);

    try {

      const res = await fetch(`${APP_URL}/api/verify-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          otp,
        }),
      });

      const data = await res.json();

      console.log("OTP RESPONSE:", data);

      if (data.status === "success") {

        Alert.alert("Welcome", "OTP Verified");

        navigation.reset({
          index: 0,
          routes: [{ name: 'Rooms' }],
        });

      } else {
        Alert.alert("Error", data.message || "Invalid OTP");
      }

    } catch (err) {
      Alert.alert("Error", "Network error");
    }

    setLoading(false);
  };

  return (
    <ImageBackground
      source={require('../assets/background.jpg')}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay}>

        <View style={styles.card}>

          {/* HEADER */}
          <Text style={styles.title}>Secure Verification</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to your email
          </Text>

          {/* USER INFO */}
          <Text style={styles.user}>
            Logged in as: {username}
          </Text>

          {/* OTP INPUT */}
          <TextInput
            placeholder="Enter OTP Code"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
            style={styles.input}
            maxLength={6}
          />

          {/* VERIFY BUTTON */}
          <TouchableOpacity
            style={styles.button}
            onPress={verifyOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>VERIFY & CONTINUE</Text>
            )}
          </TouchableOpacity>

          {/* FOOTER TEXT */}
          <Text style={styles.footer}>
            Hotel Security System • OTP Authentication
          </Text>

        </View>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({

  bg: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  card: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 15,
  },

  user: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 20,
    backgroundColor: '#f3f4f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },

  input: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    fontSize: 18,
    letterSpacing: 6,
    textAlign: 'center',
    color: '#111',
    marginBottom: 20,
  },

  button: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#c8a96a',
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  footer: {
    marginTop: 20,
    fontSize: 11,
    color: '#9ca3af',
  },
});