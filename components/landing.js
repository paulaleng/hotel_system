import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity } from 'react-native';

export default function Landing({ switchScreen }) {
  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('../assets/hotelbg.jpg')}
        resizeMode="cover" 
        style={styles.image}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>
            Find & Book Your{"\n"}Perfect Stay Instantly!
          </Text>

          <Text style={styles.subtitle}>
            Browse top hotels, book in seconds,
            and enjoy a perfect stay!
          </Text>

          <TouchableOpacity 
          style={styles.button}
          onPress={() => switchScreen('login')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
        </View>
      </ImageBackground>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  image: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)', // subtle dark overlay
  },

  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  subtitle: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 25,
  },

  button: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});