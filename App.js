import { useState } from 'react';
import Landing from './components/landing';
import Login from './components/Login';
import Register from './components/Register';
import Rooms from './components/room';
import RoomDetails from './components/details';

export default function App() {
  const [screen, setScreen] = useState('landing');

  const switchScreen = (screenName) => {
    setScreen(screenName);
  };

  if (screen === 'landing') {
    return <Landing switchScreen={switchScreen} />;
  }

  if (screen === 'login') {
    return <Login switchScreen={switchScreen} />;
  }

  if (screen === 'register') {
    return <Register switchScreen={switchScreen} />;
  }

   if (screen === 'Rooms') {
    return <Rooms switchScreen={switchScreen} />;
  }

  if (screen === 'RoomDetails') {
    return <RoomDetails switchScreen={switchScreen} />;
  }
}