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
  Alert,
  Platform,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import { useNavigation, useRoute } from "@react-navigation/native";

const APP_URL = 'http://192.168.1.33:8000';

export default function RoomDetails() {

  const navigation = useNavigation();
  const route = useRoute();

  const { roomId } = route.params;

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // FORM STATES
  // =========================
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date());

  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);

  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [guests, setGuests] = useState('1');

  const [bookingLoading, setBookingLoading] = useState(false);

  // =========================
  // FETCH ROOM
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

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // =========================
  // TOTAL PRICE
  // =========================
  const calculateDays = () => {
    const diff =
      (new Date(checkOut) - new Date(checkIn)) /
      (1000 * 60 * 60 * 24);

    return diff > 0 ? diff : 1;
  };

  const totalPrice = room
    ? calculateDays() * parseFloat(room.price)
    : 0;

  // =========================
  // BOOK ROOM
  // =========================
  const handleBooking = async () => {

    if (
      !fullName ||
      !contactNumber ||
      !email ||
      !guests
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {

      setBookingLoading(true);

      const response = await fetch(`${APP_URL}/api/book-room/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          room: room.room_type,
          full_name: fullName,
          contact_number: contactNumber,
          email: email,
          check_in_date: formatDate(checkIn),
          check_out_date: formatDate(checkOut),
          guests: guests,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {

        Alert.alert(
          "Success",
          "Booking saved successfully!"
        );

        setFullName('');
        setContactNumber('');
        setEmail('');
        setGuests('1');

      } else {
        Alert.alert("Error", data.message);
      }

    } catch (error) {

      console.log(error);

      Alert.alert(
        "Error",
        "Something went wrong"
      );

    } finally {
      setBookingLoading(false);
    }
  };

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

        {/* LEFT */}
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

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >

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

            <Text style={styles.amenity}>
              • {room.amenities || "N/A"}
            </Text>
          </View>

        </View>

        {/* BOOKING */}
        <View style={styles.booking}>

          <Text style={styles.price}>
            ₱{room.price}
          </Text>

          <Text style={styles.priceNote}>
            per night • taxes included
          </Text>

          {/* CHECK IN */}
          <TouchableOpacity
            onPress={() => setShowCheckIn(true)}
          >
            <TextInput
              value={formatDate(checkIn)}
              placeholder="Check-in Date"
              style={styles.input}
              editable={false}
            />
          </TouchableOpacity>

          {showCheckIn && (
            <DateTimePicker
              value={checkIn}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowCheckIn(Platform.OS === 'ios');

                if (selectedDate) {
                  setCheckIn(selectedDate);
                }
              }}
            />
          )}

          {/* CHECK OUT */}
          <TouchableOpacity
            onPress={() => setShowCheckOut(true)}
          >
            <TextInput
              value={formatDate(checkOut)}
              placeholder="Check-out Date"
              style={styles.input}
              editable={false}
            />
          </TouchableOpacity>

          {showCheckOut && (
            <DateTimePicker
              value={checkOut}
              mode="date"
              display="default"
              minimumDate={checkIn}
              onChange={(event, selectedDate) => {
                setShowCheckOut(Platform.OS === 'ios');

                if (selectedDate) {
                  setCheckOut(selectedDate);
                }
              }}
            />
          )}

          {/* FORM */}
          <TextInput
            placeholder="Full Name"
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            placeholder="Contact Number"
            style={styles.input}
            keyboardType="phone-pad"
            value={contactNumber}
            onChangeText={setContactNumber}
          />

          <TextInput
            placeholder="Email Address"
            style={styles.input}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            placeholder="Guests (1-4)"
            style={styles.input}
            keyboardType="numeric"
            value={guests}
            onChangeText={setGuests}
          />

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
          <Text style={styles.total}>
            Total: ₱{totalPrice.toLocaleString()}
          </Text>

          {/* BUTTON */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleBooking}
            disabled={bookingLoading}
          >

            {
              bookingLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  Book Now
                </Text>
              )
            }

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

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  hero: {
    height: 180,
    backgroundColor: '#c8a96a',
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