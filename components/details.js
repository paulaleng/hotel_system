import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";

const APP_URL = 'http://192.168.1.33:8000';

export default function RoomDetails() {
  const navigation = useNavigation();
  const route = useRoute();

  const { roomId } = route.params;

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH SINGLE ROOM
  // =========================
  const fetchRoom = async () => {
    try {
      const res = await fetch(`${APP_URL}/api/rooms/${roomId}/`);
      const data = await res.json();

      if (data.status === "success") {
        setRoom(data.room);
      }
    } catch (err) {
      console.log("Room details error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#c8a96a" />
        <Text>Loading room...</Text>
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.centered}>
        <Text>Room not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      {/* HERO */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{room.room_type}</Text>
        <Text style={styles.heroSubtitle}>Comfort and elegance</Text>
      </View>

      <View style={styles.content}>

        {/* LEFT SECTION */}
        <View style={styles.left}>

          {/* DESCRIPTION */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Description</Text>
            <Text style={styles.text}>
              {room.details || "No description available."}
            </Text>
          </View>

          {/* GALLERY */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Room Gallery</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Image
                source={
                  room.image
                    ? { uri: `${APP_URL}${room.image}` }
                    : require('../assets/single.jpg')
                }
                style={styles.galleryImg}
              />
            </ScrollView>
          </View>

          {/* AMENITIES */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Amenities</Text>
            <Text style={styles.amenity}>• {room.amenities || "N/A"}</Text>
          </View>

        </View>

        {/* RIGHT / BOOKING */}
        <View style={styles.booking}>

          {/* PRICE */}
          <Text style={styles.price}>₱{room.price}</Text>
          <Text style={styles.priceNote}>per night • taxes included</Text>

          {/* FORM (UNCHANGED UI) */}
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