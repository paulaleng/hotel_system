import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Navbar() {
  const navigation = useNavigation();

  return (
    <View style={styles.navbar}>
      
      {/* LEFT SIDE */}
      <View style={styles.left}>

        <TouchableOpacity onPress={() => navigation.navigate("Rooms")}>
          <Text style={styles.link}>Rooms</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Schedule")}>
          <Text style={styles.link}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Text style={styles.link}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Landing")}>
          <Text style={[styles.link, styles.logout]}>Logout</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0b0b2f",
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 10,
  },
  left: {
    flexDirection: "row",
    gap: 20,
    textAlign: "center",
  },
  link: {
    color: "#fff",
    fontSize: 16,
  },
  logout: {
    color: "#f87171",
    fontWeight: "bold",
  },
});