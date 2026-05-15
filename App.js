import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Landing from "./components/landing";
import Login from "./components/Login";
import Register from "./components/Register";
import Rooms from "./components/room";
import RoomDetails from "./components/details";
import ProfileScreen from "./components/profile";
import ScheduleScreen from "./components/schedule";
import OTP from './components/OTP';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>

        <Stack.Screen name="Landing" component={Landing} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="OTP" component={OTP} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Rooms" component={Rooms} />
        <Stack.Screen name="RoomDetails" component={RoomDetails} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}