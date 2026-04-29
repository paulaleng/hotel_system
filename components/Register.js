import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

export default function Register({ switchScreen }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const register = () => {
    if (!username || !email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Password not match");
      return;
    }

    alert("Account created successfully!");
    switchScreen('login');
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
          <Text style={styles.subtitle}>
            Create your account to start booking
          </Text>

          {/* EMAIL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Enter Username"
              placeholderTextColor="#999"
              style={styles.input}
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
          <TouchableOpacity style={styles.button} onPress={register}>
            <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
          </TouchableOpacity>

          {/* LINK */}
          <TouchableOpacity onPress={() => switchScreen('login')}>
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
  bg: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

    // 🌟 lighter overlay so background is visible
    backgroundColor: 'rgba(0,0,0,0.30)',
  },

  box: {
    width: '90%',
    maxWidth: 420,

    // 💎 GLASS WHITE CARD
    backgroundColor: 'rgba(255,255,255,0.78)',

    padding: 30,
    borderRadius: 22,

    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,

    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: 1,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 22,
    textAlign: 'center',
  },

  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },

  label: {
    color: '#374151',
    marginBottom: 6,
    fontSize: 13,
  },

  input: {
    width: '100%',
    padding: 14,
    backgroundColor: 'rgba(241,245,249,0.9)',
    borderRadius: 12,
    color: '#111',
  },

  button: {
    width: '100%',
    padding: 16,
    backgroundColor: '#c8a96a', 
    borderRadius: 12,
    marginTop: 10,
  },

  buttonHover: {
    backgroundColor: '#b89658',
    transform: [{ scale: 0.98 }], 
  },

  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 16,
    letterSpacing: 1,
  },

link: {
  marginTop: 20,
  textAlign: 'center',
  color: '#111', 
},

linkClick: {
  color: '#2563eb',
  fontWeight: 'bold',
  textDecorationLine: 'underline',
},
});