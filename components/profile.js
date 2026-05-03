import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
    const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Guest",
    email: "Guest@email.com",
    phone: "Not set",
    address: "Not set",
    bookings: 0,
    created: "May 01, 2026",
    lastLogin: "May 03, 2026 14:30",
    image: null,
  });

  // Toggle edit mode
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Handle text change
  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  // Pick image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setProfile({ ...profile, image: result.assets[0].uri });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>

        {/* LEFT - PROFILE IMAGE */}
        <View style={styles.left}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={
                profile.image
                  ? { uri: profile.image }
                  : require("../assets/profile.jpg") // add default image
              }
              style={styles.profilePic}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.editPicBtn} onPress={pickImage}>
            <Text style={styles.btnText}>
              {profile.image ? "Edit Picture" : "Add Picture"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* RIGHT */}
        <View style={styles.right}>

          {/* NAME */}
          {isEditing ? (
            <TextInput
              style={styles.nameInput}
              value={profile.name}
              onChangeText={(text) => handleChange("name", text)}
            />
          ) : (
            <Text style={styles.name}>{profile.name}</Text>
          )}

          <Text style={styles.badge}>Guest</Text>

          {/* EMAIL */}
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={profile.email}
              onChangeText={(text) => handleChange("email", text)}
            />
          ) : (
            <Text style={styles.email}>{profile.email}</Text>
          )}

          {/* INFO GRID */}
          <View style={styles.grid}>

            {/* PHONE */}
            <View style={styles.box}>
              <Text style={styles.label}>Phone</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={profile.phone}
                  onChangeText={(text) => handleChange("phone", text)}
                />
              ) : (
                <Text>{profile.phone}</Text>
              )}
            </View>

            {/* ADDRESS */}
            <View style={styles.box}>
              <Text style={styles.label}>Address</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={profile.address}
                  onChangeText={(text) => handleChange("address", text)}
                />
              ) : (
                <Text>{profile.address}</Text>
              )}
            </View>

            {/* CREATED */}
            <View style={styles.box}>
              <Text style={styles.label}>Account Created</Text>
              <Text>{profile.created}</Text>
            </View>

            {/* LAST LOGIN */}
            <View style={styles.box}>
              <Text style={styles.label}>Last Login</Text>
              <Text>{profile.lastLogin}</Text>
            </View>

          </View>

          {/* BOOKINGS */}
          <Text style={styles.bookings}>
            Total Bookings: <Text style={{ fontWeight: "bold" }}>{profile.bookings}</Text>
          </Text>

          {/* BUTTON */}
          <TouchableOpacity style={styles.editBtn} onPress={toggleEdit}>
            <Text style={styles.btnText}>
              {isEditing ? "Save Details" : "Edit Details"}
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    margin: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
  },
  left: {
    alignItems: "center",
    marginBottom: 20,
  },
  right: {},
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editPicBtn: {
    marginTop: 10,
    backgroundColor: "#333",
    padding: 8,
    borderRadius: 5,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
  },
  nameInput: {
    fontSize: 20,
    borderBottomWidth: 1,
    marginBottom: 5,
  },
  badge: {
    backgroundColor: "#ddd",
    alignSelf: "flex-start",
    padding: 4,
    borderRadius: 5,
    marginVertical: 5,
  },
  email: {
    color: "#555",
    marginBottom: 10,
  },
  grid: {
    marginTop: 10,
  },
  box: {
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
  },
  input: {
    borderBottomWidth: 1,
    paddingVertical: 3,
  },
  bookings: {
    marginTop: 10,
  },
  editBtn: {
    marginTop: 15,
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
  },
});