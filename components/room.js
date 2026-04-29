import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import RoomDetails from './details';

const roomsData = [
  {
    id: '1',
    name: 'Single Room',
    price: '₱2,000 / night',
    image: require('../assets/single.jpg'),
    desc: 'Perfect for solo travelers who want a simple, peaceful, and budget-friendly stay.',
  },
  {
    id: '2',
    name: 'Twin Room',
    price: '₱3,200 / night',
    image: require('../assets/single.jpg'),
    desc: 'Comfortable room with two single beds, ideal for friends or colleagues.',
  },
  {
    id: '3',
    name: 'Standard Room',
    price: '₱3,900 / night',
    image: require('../assets/single.jpg'),
    desc: 'Cozy and comfortable room with essential amenities for a relaxing stay.',
  },
  {
    id: '4',
    name: 'Family Room',
    price: '₱5,000 / night',
    image: require('../assets/single.jpg'),
    desc: 'Spacious room designed for families with extra comfort and space.',
  },
  {
    id: '5',
    name: 'Deluxe Room',
    price: '₱5,500 / night',
    image: require('../assets/single.jpg'),
    desc: 'Elegant room with modern design and enhanced comfort.',
  },
  {
    id: '6',
    name: 'Suite Room',
    price: '₱7,000 / night',
    image: require('../assets/single.jpg'),
    desc: 'Luxury suite with separate living area.',
  },
  {
    id: '7',
    name: 'Superior Room',
    price: '₱8,500 / night',
    image: require('../assets/single.jpg'),
    desc: 'Upgraded comfort with stylish interiors.',
  },
  {
    id: '8',
    name: 'Executive Room',
    price: '₱10,000 / night',
    image: require('../assets/single.jpg'),
    desc: 'Premium business-class room for productivity and comfort.',
  },
  {
    id: '9',
    name: 'Sea View Suite',
    price: '₱12,500 / night',
    image: require('../assets/single.jpg'),
    desc: 'Relaxing suite with ocean view.',
  },
  {
    id: '10',
    name: 'Penthouse',
    price: '₱20,000 / night',
    image: require('../assets/single.jpg'),
    desc: 'Ultimate luxury VIP experience.',
  },
];

export default function Rooms({ switchScreen }) {
  const [search, setSearch] = useState('');

  const filteredRooms = roomsData.filter(room =>
    room.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>

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

      {/* LIST */}
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>

            {/* IMAGE */}
            <Image source={item.image} style={styles.image} />

            {/* INFO */}
            <View style={styles.info}>
              <Text style={styles.roomName}>{item.name}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
            </View>

            {/* PRICE + BUTTON */}
            <View style={styles.priceBox}>
              <Text style={styles.price}>{item.price}</Text>

              <TouchableOpacity style={styles.button} onPress={() => switchScreen('RoomDetails')}>
                <Text style={styles.buttonText}>Select</Text>
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

  info: {
    padding: 12,
  },

  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  desc: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },

  priceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
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

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});