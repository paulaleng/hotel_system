import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from './navbar';

const APP_URL = 'http://192.168.1.36:8000';

// ─────────────────────────────────────────────
// STATUS helpers
// ─────────────────────────────────────────────
const STATUS_COLORS = {
  Pending:   '#ffc107',
  Confirmed: '#28a745',
  Cancelled: '#dc3545',
  Rejected:  '#dc3545',
  Completed: '#6c757d',
};

// ─────────────────────────────────────────────
// BOOKING CARD
// ─────────────────────────────────────────────
const BookingCard = ({ item }) => (
  <View style={styles.card}>
    {/* Room + name */}
    <View style={styles.cardTop}>
      <Text style={styles.roomText}>{item.room}</Text>
      <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] || '#007bff' }]}>
        <Text style={styles.badgeText}>{item.status}</Text>
      </View>
    </View>

    <Text style={styles.nameText}>{item.full_name}</Text>

    {/* Details row */}
    <View style={styles.cardDetails}>
      <Text style={styles.metaText}>Check-in: {item.check_in_date}</Text>
      {!!item.check_out_date && (
        <Text style={styles.metaText}>Check-out: {item.check_out_date}</Text>
      )}
      <Text style={styles.metaText}>Guests: {item.guests}</Text>
      <Text style={styles.metaText}>
  Price per Night: ₱{Number(item.price).toLocaleString()}
</Text>

<Text style={styles.metaText}>
  Nights: {item.nights}
</Text>

<Text style={styles.metaText}>
  Total Price: ₱{Number(item.total_price).toLocaleString()}
</Text>

<Text style={styles.metaText}>
  Downpayment: ₱{Number(item.downpayment).toLocaleString()}
</Text>
    </View>
  </View>
);

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────
const ScheduleScreen = ({ navigation }) => {
  const [activeTab,    setActiveTab]    = useState('all');
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [reservations, setReservations] = useState([]);
  const [history,      setHistory]      = useState([]);
  const [error,        setError]        = useState(null);
  const [debugInfo,    setDebugInfo]    = useState('');   // ← remove after testing

  // ── fetch ────────────────────────────────
  const fetchBookings = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('auth_token');
      console.log('auth_token from storage:', token);

      if (!token) {
        setError('You are not logged in. Please log in to view your schedule.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log('Fetching:', `${APP_URL}/api/schedule/`);

      const response = await fetch(`${APP_URL}/api/schedule/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type':  'application/json',
        },
      });

      console.log('HTTP status:', response.status);

      const text = await response.text();        // read raw first
      console.log('Raw response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setError(`Server returned unexpected response:\n${text.slice(0, 200)}`);
        return;
      }

      console.log('Parsed data:', JSON.stringify(data));

      if (data.status === 'success') {
        setReservations(data.reservations || []);
        setHistory(data.history      || []);
        setDebugInfo(
          `✅ ${data.reservations?.length ?? 0} reservation(s), ` +
          `${data.history?.length ?? 0} history item(s)`
        );
      } else {
        setError(data.message || 'Server returned an error.');
      }
    } catch (err) {
      console.error('Schedule fetch error:', err);
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const showReservations = activeTab === 'all' || activeTab === 'reservation';
  const showHistory      = activeTab === 'all' || activeTab === 'history';

  // ── loading ───────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Navbar />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading your bookings…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── error ─────────────────────────────────
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Navbar />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchBookings()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: '#555', marginTop: 10 }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.retryText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── main ─────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0b2f" />
      <Navbar />

      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchBookings(true)}
            colors={['#007bff']}
          />
        }
      >
        <View style={styles.wrapper}>
          <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>My Schedule</Text>
              <Text style={styles.headerSub}>Manage your bookings and stay history</Text>
              {/* Debug info — remove after confirming it works */}
              {!!debugInfo && (
                <Text style={styles.debugText}>{debugInfo}</Text>
              )}
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
              {['all', 'reservation', 'history'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.activeTab]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                    {tab === 'all'         ? 'All'
                     : tab === 'reservation' ? 'Upcoming'
                     : 'History'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Reservations */}
            {showReservations && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  📌 Upcoming Reservations
                  <Text style={styles.countText}> ({reservations.length})</Text>
                </Text>

                {reservations.length > 0 ? (
                  reservations.map((item) => (
                    <BookingCard key={String(item.id)} item={item} />
                  ))
                ) : (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>No upcoming reservations</Text>
                    <TouchableOpacity
                      style={styles.bookBtn}
                      onPress={() => navigation.navigate('Rooms')}
                    >
                      <Text style={styles.bookBtnText}>Book a Room →</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* History */}
            {showHistory && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  📜 Booking History
                  <Text style={styles.countText}> ({history.length})</Text>
                </Text>

                {history.length > 0 ? (
                  history.map((item) => (
                    <BookingCard key={String(item.id)} item={item} />
                  ))
                ) : (
                  <Text style={styles.emptyText}>No booking history yet</Text>
                )}
              </View>
            )}

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScheduleScreen;

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea:    { flex: 1, backgroundColor: '#f5f5f5' },
  scroll:      { flex: 1 },
  centered:    { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  errorText:   { fontSize: 13, color: '#dc3545', textAlign: 'center', marginBottom: 16, lineHeight: 20 },
  retryBtn:    { backgroundColor: '#007bff', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText:   { color: '#fff', fontWeight: '600' },

  wrapper:   { padding: 16 },
  container: {
    backgroundColor: '#fff',
    borderRadius:    12,
    padding:         16,
    elevation:       3,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.1,
    shadowRadius:    4,
  },

  header:      { marginBottom: 20, alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  headerSub:   { fontSize: 13, color: '#888', textAlign: 'center' },
  debugText:   { fontSize: 11, color: '#28a745', marginTop: 6 },

  tabs: {
    flexDirection:     'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom:      20,
  },
  tab: {
    flex:              1,
    paddingVertical:   11,
    alignItems:        'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab:     { borderBottomColor: '#007bff' },
  tabText:       { fontSize: 14, color: '#888' },
  activeTabText: { color: '#007bff', fontWeight: '700' },

  section:      { marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  countText:    { fontWeight: '400', color: '#888', fontSize: 14 },

  card: {
    backgroundColor: '#fafafa',
    borderRadius:    10,
    padding:         14,
    marginBottom:    10,
    borderWidth:     1,
    borderColor:     '#ececec',
  },
  cardTop: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   4,
  },
  roomText:    { fontSize: 15, fontWeight: '700', color: '#222', flex: 1 },
  nameText:    { fontSize: 12, color: '#888', marginBottom: 8 },
  cardDetails: { gap: 3 },
  metaText:    { fontSize: 12, color: '#555' },

  badge: {
    paddingHorizontal: 10,
    paddingVertical:   4,
    borderRadius:      20,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  emptyBox:    { alignItems: 'center', paddingVertical: 28 },
  emptyText:   { textAlign: 'center', color: '#bbb', fontSize: 14, marginBottom: 14 },
  bookBtn:     { backgroundColor: '#007bff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  bookBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});