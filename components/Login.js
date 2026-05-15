import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

const APP_URL = 'http://192.168.100.13:8000';

export default function Login() {

  const navigation = useNavigation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {

    // validation
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);

    try {

      const response = await fetch(`${APP_URL}/api/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      console.log('LOGIN RESPONSE:', JSON.stringify(data, null, 2));

      const status = data?.status?.toLowerCase();

      // =========================
      // OTP FLOW
      // =========================
      if (status === 'otp_sent') {

        Alert.alert(
          'OTP Sent',
          'Check your email for OTP'
        );

        navigation.navigate('OTP', {
          username: username.trim(),
        });

        return;
      }

      // =========================
      // DIRECT LOGIN SUCCESS (NO OTP)
      // =========================
      if (status === 'success') {

        Alert.alert(
          'Success',
          'Login Successful'
        );

        navigation.replace('Rooms');

        return;
      }

      // =========================
      // ERROR
      // =========================
      Alert.alert(
        'Login Failed',
        data.message || 'Invalid username or password'
      );

    } catch (error) {

      console.log('LOGIN ERROR:', error);

      Alert.alert(
        'Connection Error',
        'Cannot connect to server'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/background.jpg')}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.box}>

          {/* TITLE */}
          <Text style={styles.title}>Login</Text>

          <Text style={styles.subtitle}>
            Welcome back, please sign in
          </Text>

          {/* USERNAME */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>

            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Enter Username"
              placeholderTextColor="#777"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* PASSWORD */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter Password"
              placeholderTextColor="#777"
              secureTextEntry
              style={styles.input}
            />
          </View>

          {/* LOGIN BUTTON */}
          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                LOGIN
              </Text>
            )}
          </TouchableOpacity>

          {/* REGISTER */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.link}>
              Don't have an account?{' '}
              <Text style={styles.linkClick}>
                Register
              </Text>
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({

  bg: { flex: 1 },

  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  box: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 22,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 22,
  },

  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },

  label: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
  },

  input: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(241,245,249,0.95)',
    color: '#111',
  },

  button: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#c8a96a',
    alignItems: 'center',
    marginTop: 10,
  },

  buttonDisabled: {
    backgroundColor: '#d9bc8d',
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },

  link: {
    marginTop: 20,
    color: '#111',
  },

  linkClick: {
    color: '#2563eb',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});