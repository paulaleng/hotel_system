import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Navbar from "./navbar";
import { useNavigation } from "@react-navigation/native";

// =========================
// ✅ CHANGE THIS TO YOUR IP
// =========================
const APP_URL = 'http://192.168.1.33:8000';

export default function Rooms() {
  const [search, setSearch] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const navigation = useNavigation();

  // =========================
  // FETCH ROOMS FROM API
  // =========================
  const fetchRooms = async () => {
    try {
      setError(null);
      const response = await fetch(`${APP_URL}/api/rooms/`);
      const data = await response.json();

      if (data.status === 'success') {
        setRooms(data.rooms);
      } else {
        setError('Failed to load rooms.');
      }
    } catch (err) {
      setError('Cannot connect to server. Check your network.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================
  // LOAD ON MOUNT
  // =========================
  useEffect(() => {
    fetchRooms();
  }, []);

  // =========================
  // PULL TO REFRESH
  // =========================
  const onRefresh = () => {
    setRefreshing(true);
    fetchRooms();
  };

  // =========================
  // SEARCH FILTER
  // =========================
  const filteredRooms = rooms.filter(room =>
    room.room_type.toLowerCase().includes(search.toLowerCase())
  );

  // =========================
  // FORMAT PRICE
  // =========================
  const formatPrice = (price) => {
    return `₱${parseFloat(price).toLocaleString('en-PH')} / night`;
  };

  // =========================
  // LOADING STATE
  // =========================
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#c8a96a" />
        <Text style={styles.loadingText}>Loading rooms...</Text>
      </View>
    );
  }

  // =========================
  // ERROR STATE
  // =========================
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRooms}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Navbar />

      {/* TITLE */}
      <Text style={styles.title}>Choose your stay</Text>
      <Text style={styles.subtitle}>Select the perfect room for your comfort</Text>

      {/* SEARCH */}
      <TextInput
        placeholder="Search room type..."
        placeholderTextColor="#999"
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />

      {/* EMPTY STATE */}
      {filteredRooms.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No rooms found.</Text>
        </View>
      )}

      {/* ROOM LIST */}
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#c8a96a']}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>

            {/* IMAGE */}
            {item.image ? (
              <Image
                source={{ uri: `${APP_URL}${item.image}` }}
                style={styles.image}
              />
            ) : (
              <View style={[styles.image, styles.noImage]}>
                <Text style={styles.noImageText}>No Image</Text>
              </View>
            )}

            {/* INFO */}
            <View style={styles.info}>
              <View style={styles.badgeRow}>
                <Text style={styles.roomName}>{item.room_type}</Text>
                <View style={[
                  styles.badge,
                  { backgroundColor: item.is_available ? '#e6f4ea' : '#fdecea' }
                ]}>
                  <Text style={[
                    styles.badgeText,
                    { color: item.is_available ? '#2e7d32' : '#c62828' }
                  ]}>
                    {item.is_available ? 'Available' : 'Unavailable'}
                  </Text>
                </View>
              </View>

              <Text style={styles.desc}>
                {item.details || 'No description available.'}
              </Text>

              {item.amenities ? (
                <Text style={styles.amenities}>✦ {item.amenities}</Text>
              ) : null}

              <Text style={styles.guests}>👤 Max guests: {item.max_guests}</Text>
            </View>

            {/* PRICE + BUTTON */}
            <View style={styles.priceBox}>
              <Text style={styles.price}>{formatPrice(item.price)}</Text>
              <TouchableOpacity
                style={[
                  styles.button,
                  !item.is_available && styles.buttonDisabled
                ]}
                disabled={!item.is_available}
                onPress={() => navigation.navigate("RoomDetails", { room: item })}
              >
                <Text style={styles.buttonText}>
                  {item.is_available ? 'Select' : 'Unavailable'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
    padding: 15,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
    color: '#888',
    fontSize: 14,
  },

  errorText: {
    color: '#c62828',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 15,
  },

  emptyText: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
  },

  retryButton: {
    backgroundColor: '#c8a96a',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },

  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },

  search: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: 160,
  },

  noImage: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },

  noImageText: {
    color: '#aaa',
    fontSize: 14,
  },

  info: {
    padding: 12,
  },

  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },

  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  desc: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },

  amenities: {
    fontSize: 11,
    color: '#c8a96a',
    marginTop: 6,
    fontStyle: 'italic',
  },

  guests: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },

  priceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },

  button: {
    backgroundColor: '#c8a96a',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },

  buttonDisabled: {
    backgroundColor: '#ccc',
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});