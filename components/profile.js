import React, { useState, useEffect, useCallback } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const APP_URL = 'http://192.168.1.36:8000';

// ─────────────────────────────────────────────
// INFO ROW – shows a label + value (or input)
// ─────────────────────────────────────────────
const InfoRow = ({ label, value, editing, field, onChange, keyboardType = 'default' }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    {editing ? (
      <TextInput
        style={styles.infoInput}
        value={value}
        onChangeText={(t) => onChange(field, t)}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    ) : (
      <Text style={styles.infoValue}>{value || 'Not set'}</Text>
    )}
  </View>
);

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────
export default function ProfileScreen() {
  const navigation = useNavigation();

  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error,     setError]     = useState(null);

  const [profile, setProfile] = useState({
    username:       '',
    email:          '',
    contact_number: '',
    address:        '',
    date_joined:    '',
    last_login:     '',
    total_bookings: 0,
    profile_image:  null,
    // local-only: holds a new image picked from the gallery
    _localImage:    null,
  });

  // ── fetch profile from backend ─────────────
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        setError('Not logged in.');
        setLoading(false);
        return;
      }

      const res  = await fetch(`${APP_URL}/api/profile/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      const data = await res.json();

      if (data.status === 'success') {
        setProfile((prev) => ({ ...prev, ...data.user, _localImage: null }));
      } else {
        setError(data.message || 'Failed to load profile.');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // ── field change ───────────────────────────
  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // ── pick image ─────────────────────────────
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality:    0.8,
    });

    if (!result.canceled) {
      setProfile((prev) => ({ ...prev, _localImage: result.assets[0].uri }));
    }
  };

  // ── save profile ───────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) { Alert.alert('Error', 'Not logged in.'); return; }

      const form = new FormData();
      form.append('email',          profile.email);
      form.append('contact_number', profile.contact_number || '');
      form.append('address',        profile.address || '');

      if (profile._localImage) {
        const filename  = profile._localImage.split('/').pop();
        const extension = filename.split('.').pop();
        form.append('profile_image', {
          uri:  profile._localImage,
          name: filename,
          type: `image/${extension}`,
        });
      }

      const res  = await fetch(`${APP_URL}/api/profile/update/`, {
        method:  'POST',
        headers: { 'Authorization': `Token ${token}` },
        body:    form,
      });
      const data = await res.json();

      if (data.status === 'success') {
        setProfile((prev) => ({ ...prev, ...data.user, _localImage: null }));
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', data.message || 'Update failed.');
      }
    } catch (err) {
      console.error('Profile save error:', err);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── cancel editing ─────────────────────────
  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile(); // reset to server values
  };

  // ── image uri ──────────────────────────────
  const imageUri = profile._localImage
    ? profile._localImage
    : profile.profile_image
      ? `${APP_URL}${profile.profile_image}`
      : null;

  // ─────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#c8a96a" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading profile…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#dc3545', marginBottom: 12 }}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchProfile}>
          <Text style={{ color: '#fff' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>

        {/* ── AVATAR ── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={isEditing ? pickImage : undefined} activeOpacity={isEditing ? 0.7 : 1}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>
                  {profile.username ? profile.username[0].toUpperCase() : '?'}
                </Text>
              </View>
            )}
            {isEditing && (
              <View style={styles.avatarOverlay}>
                <Text style={{ color: '#fff', fontSize: 11 }}>Change</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.username}>{profile.username}</Text>
          <View style={styles.guestBadge}><Text style={styles.guestBadgeText}>Guest</Text></View>
        </View>

        {/* ── STATS ── */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{profile.total_bookings}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>
              {profile.date_joined ? profile.date_joined.split(' ')[2] || '' : '—'}
            </Text>
            <Text style={styles.statLabel}>Member Since</Text>
          </View>
        </View>

        {/* ── INFO FIELDS ── */}
        <View style={styles.infoSection}>
          <InfoRow
            label="Email"
            value={profile.email}
            editing={isEditing}
            field="email"
            onChange={handleChange}
            keyboardType="email-address"
          />
          <InfoRow
            label="Phone"
            value={profile.contact_number}
            editing={isEditing}
            field="contact_number"
            onChange={handleChange}
            keyboardType="phone-pad"
          />
          <InfoRow
            label="Address"
            value={profile.address}
            editing={isEditing}
            field="address"
            onChange={handleChange}
          />
          <InfoRow label="Member Since" value={profile.date_joined}  editing={false} field="" onChange={() => {}} />
          <InfoRow label="Last Login"   value={profile.last_login}   editing={false} field="" onChange={() => {}} />
        </View>

        {/* ── BUTTONS ── */}
        {isEditing ? (
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={handleCancel}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.saveBtn]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={[styles.btn, styles.editBtn]} onPress={() => setIsEditing(true)}>
            <Text style={styles.btnText}>Edit Profile</Text>
          </TouchableOpacity>
        )}

      </View>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  retryBtn:  { backgroundColor: '#007bff', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },

  card: {
    margin:        16,
    padding:       20,
    backgroundColor: '#fff',
    borderRadius:  14,
    elevation:     3,
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius:  4,
  },

  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatar: {
    width:        110,
    height:       110,
    borderRadius: 55,
    borderWidth:  3,
    borderColor:  '#c8a96a',
  },
  avatarPlaceholder: {
    backgroundColor: '#c8a96a',
    justifyContent:  'center',
    alignItems:      'center',
  },
  avatarInitial: { fontSize: 40, color: '#fff', fontWeight: 'bold' },
  avatarOverlay: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderBottomLeftRadius:  55,
    borderBottomRightRadius: 55,
    alignItems:      'center',
    paddingVertical: 6,
  },
  username:   { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 10 },
  guestBadge: {
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical:   4,
    borderRadius:      12,
    marginTop:         6,
  },
  guestBadgeText: { fontSize: 12, color: '#555' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
  statBox:  { alignItems: 'center' },
  statNum:  { fontSize: 22, fontWeight: 'bold', color: '#c8a96a' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },

  infoSection: { marginBottom: 20 },
  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical:   12,
  },
  infoLabel: { fontSize: 11, color: '#999', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, color: '#333' },
  infoInput: {
    fontSize:        15,
    color:           '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#c8a96a',
    paddingVertical: 4,
  },

  btnRow:    { flexDirection: 'row', gap: 10 },
  btn: {
    flex:            1,
    padding:         13,
    borderRadius:    10,
    alignItems:      'center',
  },
  editBtn:   { backgroundColor: '#333' },
  saveBtn:   { backgroundColor: '#c8a96a' },
  cancelBtn: { backgroundColor: '#999' },
  btnText:   { color: '#fff', fontWeight: '600', fontSize: 14 },
});