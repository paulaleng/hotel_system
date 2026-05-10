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

export default function Login() {
  const navigation = useNavigation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter your username and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${APP_URL}/api/login/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Save token and basic user info for use across the app
        await AsyncStorage.setItem('auth_token', data.token);
        await AsyncStorage.setItem('user',       JSON.stringify(data.user));

        // Navigate and reset the stack so Back doesn't return to Login
        navigation.reset({ index: 0, routes: [{ name: 'Rooms' }] });
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid username or password.');
      }
    } catch (err) {
      console.error('Login error:', err);
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
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Welcome back, please sign in</Text>

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
              secureTextEntry
              placeholder="Enter password"
              placeholderTextColor="#777"
              style={styles.input}
            />
          </View>

          {/* BUTTON */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>LOGIN</Text>
            )}
          </TouchableOpacity>

          {/* LINK */}
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>
              Don't have an account?{' '}
              <Text style={styles.linkClick}>Register</Text>
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
    fontSize:    28,
    fontWeight:  'bold',
    color:       '#111827',
    letterSpacing: 1,
    marginBottom: 6,
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
    width:        '100%',
    padding:      16,
    backgroundColor: '#c8a96a',
    borderRadius: 12,
    marginTop:    10,
    alignItems:   'center',
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
    color:             '#2563eb',
    fontWeight:        'bold',
    textDecorationLine: 'underline',
  },
});