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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const APP_URL = 'http://192.168.1.33:8000';

export default function Register() {
  const navigation = useNavigation();

  const [username,        setUsername]        = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading,         setLoading]         = useState(false);

  const handleRegister = async () => {
    // ── client-side validation ──
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${APP_URL}/api/register/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          username:  username.trim(),
          email:     email.trim(),
          password1: password,
          password2: confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Auto-login: save the token returned on registration
        await AsyncStorage.setItem('auth_token', data.token);

        Alert.alert(
          'Account Created',
          'Welcome! Your account has been created successfully.',
          [
            {
              text: 'Continue',
              onPress: () =>
                navigation.reset({ index: 0, routes: [{ name: 'Rooms' }] }),
            },
          ]
        );
      } else {
        Alert.alert('Registration Failed', data.message || 'Something went wrong.');
      }
    } catch (err) {
      console.error('Register error:', err);
      Alert.alert('Error', 'Could not connect to the server. Please try again.');
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
          <Text style={styles.title}>Register</Text>
          <Text style={styles.subtitle}>Create your account to start booking</Text>

          {/* USERNAME */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Enter Username"
              placeholderTextColor="#999"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* EMAIL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              placeholderTextColor="#999"
              style={styles.input}
              keyboardType="email-address"
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
              secureTextEntry
              placeholder="Enter password"
              placeholderTextColor="#999"
              style={styles.input}
            />
          </View>

          {/* CONFIRM PASSWORD */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Confirm password"
              placeholderTextColor="#999"
              style={styles.input}
            />
          </View>

          {/* BUTTON */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
            )}
          </TouchableOpacity>

          {/* LINK */}
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>
              Already have an account?{' '}
              <Text style={styles.linkClick}>Login</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg:      { flex: 1 },
  overlay: {
    flex:            1,
    justifyContent:  'center',
    alignItems:      'center',
    backgroundColor: 'rgba(0,0,0,0.30)',
  },
  box: {
    width:           '90%',
    maxWidth:        420,
    backgroundColor: 'rgba(255,255,255,0.78)',
    padding:         30,
    borderRadius:    22,
    shadowColor:     '#000',
    shadowOpacity:   0.2,
    shadowRadius:    18,
    elevation:       10,
    alignItems:      'center',
  },
  title: {
    fontSize:      28,
    fontWeight:    'bold',
    color:         '#111827',
    letterSpacing: 1,
    marginBottom:  6,
  },
  subtitle: {
    fontSize:     13,
    color:        '#6b7280',
    marginBottom: 22,
    textAlign:    'center',
  },
  inputGroup: {
    width:        '100%',
    marginBottom: 15,
  },
  label: {
    color:        '#374151',
    marginBottom: 6,
    fontSize:     13,
  },
  input: {
    width:           '100%',
    padding:         14,
    backgroundColor: 'rgba(241,245,249,0.9)',
    borderRadius:    12,
    color:           '#111',
  },
  button: {
    width:           '100%',
    padding:         16,
    backgroundColor: '#c8a96a',
    borderRadius:    12,
    marginTop:       10,
    alignItems:      'center',
  },
  buttonDisabled: {
    backgroundColor: '#d9bc8d',
  },
  buttonText: {
    fontWeight:    'bold',
    color:         '#fff',
    fontSize:      16,
    letterSpacing: 1,
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color:     '#111',
  },
  linkClick: {
    color:              '#2563eb',
    fontWeight:         'bold',
    textDecorationLine: 'underline',
  },
});