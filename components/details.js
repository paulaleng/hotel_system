import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';

export default function RoomDetails() {
  return (
    <ScrollView style={styles.container}>

      {/* HERO */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Room</Text>
        <Text style={styles.heroSubtitle}>Comfort and elegance</Text>
      </View>

      <View style={styles.content}>

        {/* LEFT SECTION */}
        <View style={styles.left}>

          {/* DESCRIPTION */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Description</Text>
            <Text style={styles.text}>
              Perfect for solo travelers who want a simple and peaceful stay.
            </Text>
            <Text style={styles.text}>
              A budget-friendly room with essential comfort.
            </Text>
          </View>

          {/* GALLERY */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Room Gallery</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Image source={require('../assets/single.jpg')} style={styles.galleryImg} />
              <Image source={require('../assets/single.jpg')} style={styles.galleryImg} />
              <Image source={require('../assets/single.jpg')} style={styles.galleryImg} />
            </ScrollView>
          </View>

          {/* AMENITIES */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Amenities</Text>
            <Text style={styles.amenity}>• Free WiFi</Text>
            <Text style={styles.amenity}>• Air-conditioned</Text>
            <Text style={styles.amenity}>• Basic toiletries</Text>
          </View>

        </View>

        {/* RIGHT / BOOKING */}
        <View style={styles.booking}>

          {/* PRICE */}
          <Text style={styles.price}>₱2,000</Text>
          <Text style={styles.priceNote}>per night • taxes included</Text>

          {/* FORM */}
          <TextInput placeholder="Check-in Date" style={styles.input} />
          <TextInput placeholder="Check-out Date" style={styles.input} />
          <TextInput placeholder="Full Name" style={styles.input} />
          <TextInput placeholder="Contact Number" style={styles.input} />
          <TextInput placeholder="Email Address" style={styles.input} />

          <TextInput placeholder="Guests (1-4)" style={styles.input} />

          {/* BENEFITS */}
          <View style={styles.benefits}>
            <Text>✔ Free cancellation</Text>
            <Text>✔ Instant confirmation</Text>
            <Text>✔ Secure booking</Text>
          </View>

          {/* NOTE */}
          <Text style={styles.note}>
            Check-in 2:00 PM • Check-out 12:00 PM
          </Text>

          {/* TOTAL */}
          <Text style={styles.total}>Total: ₱0</Text>

          {/* BUTTON */}
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Book Now</Text>
          </TouchableOpacity>

        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },

  hero: {
    height: 180,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },

  heroSubtitle: {
    color: '#ddd',
    marginTop: 5,
  },

  content: {
    padding: 15,
  },

  left: {
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  text: {
    fontSize: 13,
    color: '#555',
    marginBottom: 5,
  },

  galleryImg: {
    width: 140,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },

  amenity: {
    fontSize: 13,
    marginBottom: 5,
  },

  booking: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
  },

  price: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  priceNote: {
    fontSize: 12,
    color: '#777',
    marginBottom: 10,
  },

  input: {
    backgroundColor: '#f1f3f6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  benefits: {
    marginVertical: 10,
  },

  note: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },

  total: {
    fontWeight: 'bold',
    marginBottom: 10,
  },

  button: {
    backgroundColor: '#c8a96a',
    padding: 14,
    borderRadius: 10,
  },

  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
});