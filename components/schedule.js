import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Navbar from './navbar';

import { useNavigation } from "@react-navigation/native"; // Import the navbar component

const ScheduleScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  
  // Sample data - replace with your actual API calls
  const [reservations, setReservations] = useState([
    {
      id: 1,
      room: 'Deluxe Suite',
      check_in_date: '2024-12-25',
      guests: '2 Adults, 1 Child',
      status: 'Confirmed'
    },
    {
      id: 2,
      room: 'Ocean View',
      check_in_date: '2024-12-28',
      guests: '2 Adults',
      status: 'Pending'
    }
  ]);

  const [history, setHistory] = useState([
    {
      id: 3,
      room: 'Standard Room',
      check_in_date: '2024-11-15',
      guests: '1 Adult',
      status: 'Completed'
    },
    {
      id: 4,
      room: 'Family Suite',
      check_in_date: '2024-10-20',
      guests: '4 Adults',
      status: 'Completed'
    }
  ]);

  // Function to fetch real data from your backend
  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      // const response = await fetch('http://YOUR_IP_ADDRESS:8000/api/bookings/', {
      //   headers: {
      //     'Authorization': 'Bearer YOUR_TOKEN',
      //     'Content-Type': 'application/json',
      //   }
      // });
      // const data = await response.json();
      // setReservations(data.reservations);
      // setHistory(data.history);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Pending':
        return styles.statusPending;
      case 'Confirmed':
        return styles.statusUpcoming;
      case 'Cancelled':
        return styles.statusCancelled;
      case 'Completed':
        return styles.statusPast;
      default:
        return styles.statusDefault;
    }
  };

  const getStatusText = (status) => {
    if (status === 'Completed') return 'Completed';
    return status;
  };

  const renderReservationCard = (item) => (
    <TouchableOpacity key={item.id} style={styles.card} onPress={() => {
      // Navigate to booking details if needed
      // navigation.navigate('BookingDetails', { bookingId: item.id });
    }}>
      <View style={styles.leftSection}>
        <Text style={styles.roomText}>{item.room}</Text>
      </View>
      
      <View style={styles.middleSection}>
        <Text style={styles.metaText}>📅 {item.check_in_date}</Text>
        <Text style={styles.metaText}>👥 {item.guests}</Text>
      </View>
      
      <View style={[styles.statusContainer, getStatusStyle(item.status)]}>
        <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHistoryCard = (item) => (
    <View key={item.id} style={styles.card}>
      <View style={styles.leftSection}>
        <Text style={styles.roomText}>{item.room}</Text>
      </View>
      
      <View style={styles.middleSection}>
        <Text style={styles.metaText}>📅 {item.check_in_date}</Text>
        <Text style={styles.metaText}>👥 {item.guests}</Text>
      </View>
      
      <View style={[styles.statusContainer, styles.statusPast]}>
        <Text style={styles.statusText}>✓ Completed</Text>
      </View>
    </View>
  );

  const shouldShowReservations = activeTab === 'all' || activeTab === 'reservation';
  const shouldShowHistory = activeTab === 'all' || activeTab === 'history';

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Navbar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0b2f" />
      
      {/* Navbar */}
      <Navbar />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.scheduleWrapper}>
          <View style={styles.scheduleContainer}>
            
            {/* Header */}
            <View style={styles.scheduleHeader}>
              <Text style={styles.headerTitleText}>My Schedule</Text>
              <Text style={styles.headerSubtitle}>Manage your bookings and stay history</Text>
            </View>
            
            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                onPress={() => setActiveTab('all')}
              >
                <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'reservation' && styles.activeTab]}
                onPress={() => setActiveTab('reservation')}
              >
                <Text style={[styles.tabText, activeTab === 'reservation' && styles.activeTabText]}>Reservation</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                onPress={() => setActiveTab('history')}
              >
                <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
              </TouchableOpacity>
            </View>
            
            {/* Reservations Section */}
            {shouldShowReservations && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📌 Upcoming Reservations</Text>
                {reservations.length > 0 ? (
                  reservations.map(renderReservationCard)
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No upcoming reservations</Text>
                    <TouchableOpacity 
                      style={styles.bookButton}
                      onPress={() => navigation.navigate('Rooms')}
                    >
                      <Text style={styles.bookButtonText}>Book a Room →</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
            
            {/* History Section */}
            {shouldShowHistory && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📜 Booking History</Text>
                {history.length > 0 ? (
                  history.map(renderHistoryCard)
                ) : (
                  <Text style={styles.emptyText}>No booking history</Text>
                )}
              </View>
            )}
            
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scheduleWrapper: {
    flex: 1,
    padding: 16,
  },
  scheduleContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  leftSection: {
    flex: 1,
  },
  roomText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  middleSection: {
    flex: 2,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  statusPending: {
    backgroundColor: '#ffc107',
  },
  statusUpcoming: {
    backgroundColor: '#28a745',
  },
  statusCancelled: {
    backgroundColor: '#dc3545',
  },
  statusPast: {
    backgroundColor: '#6c757d',
  },
  statusDefault: {
    backgroundColor: '#007bff',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginBottom: 16,
  },
  bookButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ScheduleScreen;