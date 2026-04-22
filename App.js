import { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';

export default function App() {
  const [screen, setScreen] = useState('login');

  return (
    <>
      {screen === 'login' ? (
        <Login switchScreen={setScreen} />
      ) : (
        <Register switchScreen={setScreen} />
      )}
    </>
  );
}

