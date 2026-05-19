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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from "@react-navigation/native";

const APP_URL = 'http://192.168.1.36:8000';

export default function RoomDetails() {

  const navigation = useNavigation();
  const route      = useRoute();
  const { roomId } = route.params;

  const [room,           setRoom]           = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // ── Form states ───────────────────────────────────────
  const [checkIn,       setCheckIn]       = useState(new Date());
  const [checkOut,      setCheckOut]      = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);   // default: tomorrow
    return d;
  });
  const [showCheckIn,   setShowCheckIn]   = useState(false);
  const [showCheckOut,  setShowCheckOut]  = useState(false);

  const [fullName,       setFullName]       = useState('');
  const [contactNumber,  setContactNumber]  = useState('');
  const [email,          setEmail]          = useState('');
  const [guests,         setGuests]         = useState('1');

  // ── Fetch room ────────────────────────────────────────
  const fetchRoom = async () => {
    try {
      const res  = await fetch(`${APP_URL}/api/rooms/${roomId}/`);
      const data = await res.json();
      if (data.status === "success") setRoom(data.room);
    } catch (err) {
      console.log("Room fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoom(); }, []);

  // ── Pre-fill user data ────────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setFullName(user.username       || '');
        setEmail(user.email             || '');
        setContactNumber(user.contact_number || '');
      }
    };
    loadUser();
  }, []);

  // ── Helpers ───────────────────────────────────────────
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const calculateNights = () => {
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    ci.setHours(0, 0, 0, 0);
    co.setHours(0, 0, 0, 0);
    const diff = Math.ceil((co - ci) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights      = calculateNights();
  const pricePerNight = room ? parseFloat(room.price) : 0;
  const totalPrice  = pricePerNight * nights;
  const downpayment = totalPrice / 2;

  const formatPHP = (amount) =>
    '₱' + amount.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // ── Book handler ──────────────────────────────────────
  const handleBooking = async () => {
    if (!fullName || !contactNumber || !email || !guests) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    ci.setHours(0, 0, 0, 0);
    co.setHours(0, 0, 0, 0);

    if (co <= ci) {
      Alert.alert("Error", "Check-out must be after check-in");
      return;
    }

    try {
      setBookingLoading(true);

      const token = await AsyncStorage.getItem('auth_token');

      const response = await fetch(`${APP_URL}/api/book-room/`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          room:           room.room_type,
          full_name:      fullName,
          contact_number: contactNumber,
          email:          email,
          check_in_date:  formatDate(checkIn),
          check_out_date: formatDate(checkOut),
          guests:         guests,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        Alert.alert(
          "Booking Successful! ",
          `Your reservation is confirmed.\n\n` +
          `Nights: ${data.nights}\n` +
          `Total: ${formatPHP(data.total_price)}\n` +
          `Downpayment (50%): ${formatPHP(data.downpayment)}\n\n` +
          `Please settle the downpayment to secure your booking.\n` +
          `Remaining balance is due upon check-in.`,
          [{ text: "OK", onPress: () => navigation.navigate("Schedule") }]
        );
      } else {
        Alert.alert("Booking Failed", data.message);
      }

    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  // ── Loading / not found ───────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#c8a96a" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading room...</Text>
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

  // ── Render ────────────────────────────────────────────
  return (
    <ScrollView style={styles.container}>

      {/* HERO */}
      <View style={styles.hero}>
        {room.image ? (
          <Image
            source={{ uri: `${APP_URL}${room.image}` }}
            style={styles.heroImage}
          />
        ) : null}
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>{room.room_type}</Text>
          <Text style={styles.heroSubtitle}>Comfort and elegance</Text>
        </View>
      </View>

      <View style={styles.content}>

        {/* DESCRIPTION */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Description</Text>
          <Text style={styles.text}>{room.details || "No description available."}</Text>
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
          {room.amenities
            ? room.amenities.split(',').map((item, i) => (
                <Text key={i} style={styles.amenity}>• {item.trim()}</Text>
              ))
            : <Text style={styles.amenity}>• N/A</Text>
          }
        </View>

        {/* ── BOOKING CARD ── */}
        <View style={styles.bookingCard}>

          {/* Price header */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPHP(pricePerNight)}</Text>
            <Text style={styles.priceNote}> / night • taxes included</Text>
          </View>

          <View style={styles.divider} />

          {/* CHECK IN */}
          <Text style={styles.label}>Check-in Date</Text>
          <TouchableOpacity onPress={() => setShowCheckIn(true)}>
            <View style={styles.dateInput}>
              <Text style={styles.dateText}>{formatDate(checkIn)}</Text>
            </View>
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
                  // auto-advance checkout if needed
                  const next = new Date(selectedDate);
                  next.setDate(next.getDate() + 1);
                  if (checkOut <= selectedDate) setCheckOut(next);
                }
              }}
            />
          )}

          {/* CHECK OUT */}
          <Text style={styles.label}>Check-out Date</Text>
          <TouchableOpacity onPress={() => setShowCheckOut(true)}>
            <View style={styles.dateInput}>
              <Text style={styles.dateText}>{formatDate(checkOut)}</Text>
            </View>
          </TouchableOpacity>
          {showCheckOut && (
            <DateTimePicker
              value={checkOut}
              mode="date"
              display="default"
              minimumDate={(() => { const d = new Date(checkIn); d.setDate(d.getDate() + 1); return d; })()}
              onChange={(event, selectedDate) => {
                setShowCheckOut(Platform.OS === 'ios');
                if (selectedDate) setCheckOut(selectedDate);
              }}
            />
          )}

          {/* FORM FIELDS */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Contact Number"
            keyboardType="phone-pad"
            value={contactNumber}
            onChangeText={setContactNumber}
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Number of Guests</Text>
          <TextInput
            style={styles.input}
            placeholder="Guests (1–4)"
            keyboardType="numeric"
            value={guests}
            onChangeText={setGuests}
          />

          <View style={styles.divider} />

          {/* PRICE SUMMARY */}
          <View style={styles.summaryBox}>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {formatPHP(pricePerNight)} × {nights} night{nights > 1 ? 's' : ''}
              </Text>
              <Text style={styles.summaryValue}>{formatPHP(totalPrice)}</Text>
            </View>

            {/* DOWNPAYMENT HIGHLIGHT */}
            <View style={styles.downpaymentBox}>
              <View style={styles.dpRow}>
                <View>
                  <Text style={styles.dpLabel}>Downpayment Required</Text>
                  <Text style={styles.dpNote}>50% of total • due now</Text>
                </View>
                <Text style={styles.dpAmount}>{formatPHP(downpayment)}</Text>
              </View>
              <View style={styles.dpRow}>
                <Text style={styles.dpNote}>Remaining balance due upon check-in</Text>
                <Text style={styles.dpBalance}>{formatPHP(downpayment)}</Text>
              </View>
            </View>

          </View>

          {/* BENEFITS */}
          <View style={styles.benefits}>
            <Text style={styles.benefitItem}>✔ Free cancellation</Text>
            <Text style={styles.benefitItem}>✔ Instant confirmation</Text>
            <Text style={styles.benefitItem}>✔ Secure booking</Text>
          </View>

          <Text style={styles.checkNote}>
            Check-in 2:00 PM  •  Check-out 12:00 PM
          </Text>

          {/* BOOK BUTTON */}
          <TouchableOpacity
            style={[styles.button, bookingLoading && styles.buttonDisabled]}
            onPress={handleBooking}
            disabled={bookingLoading}
          >
            {bookingLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Book Now</Text>
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

  // ── Hero ──────────────────────────────────────────────
  hero: {
    height: 200,
    backgroundColor: '#1a1a2e',
    position: 'relative',
  },

  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.55,
  },

  heroOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroTitle: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
  },

  heroSubtitle: {
    color: '#ddd',
    marginTop: 4,
    fontSize: 13,
  },

  // ── Content ───────────────────────────────────────────
  content: {
    padding: 15,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a2e',
  },

  text: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },

  galleryImg: {
    width: 160,
    height: 110,
    borderRadius: 10,
    marginRight: 10,
  },

  amenity: {
    fontSize: 13,
    color: '#444',
    marginBottom: 4,
  },

  // ── Booking card ──────────────────────────────────────
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },

  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },

  priceNote: {
    fontSize: 12,
    color: '#777',
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginVertical: 14,
  },

  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    marginTop: 6,
    fontWeight: '600',
  },

  dateInput: {
    backgroundColor: '#f1f3f6',
    padding: 13,
    borderRadius: 10,
    marginBottom: 4,
  },

  dateText: {
    fontSize: 14,
    color: '#333',
  },

  input: {
    backgroundColor: '#f1f3f6',
    padding: 13,
    borderRadius: 10,
    marginBottom: 4,
    fontSize: 14,
    color: '#333',
  },

  // ── Summary ───────────────────────────────────────────
  summaryBox: {
    marginBottom: 14,
  },

  summaryRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   10,
  },

  summaryLabel: {
    fontSize: 14,
    color: '#555',
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },

  // ── Downpayment ───────────────────────────────────────
  downpaymentBox: {
    backgroundColor: '#f0faf4',
    borderColor:     '#a8d5b5',
    borderWidth:     1,
    borderRadius:    10,
    padding:         14,
    gap:             8,
  },

  dpRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },

  dpLabel: {
    fontSize:   14,
    fontWeight: 'bold',
    color:      '#1a1a2e',
  },

  dpNote: {
    fontSize: 11,
    color:    '#777',
    marginTop: 2,
  },

  dpAmount: {
    fontSize:   20,
    fontWeight: 'bold',
    color:      '#2a7a4b',
  },

  dpBalance: {
    fontSize:   13,
    fontWeight: '600',
    color:      '#555',
  },

  // ── Benefits ──────────────────────────────────────────
  benefits: {
    marginVertical: 12,
    gap: 4,
  },

  benefitItem: {
    fontSize:  13,
    color:     '#444',
    marginBottom: 3,
  },

  checkNote: {
    fontSize:     12,
    color:        '#888',
    marginBottom: 14,
    textAlign:    'center',
  },

  // ── Button ────────────────────────────────────────────
  button: {
    backgroundColor: '#c8a96a',
    padding:         15,
    borderRadius:    12,
    alignItems:      'center',
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color:      '#fff',
    fontWeight: 'bold',
    fontSize:   16,
  },

});