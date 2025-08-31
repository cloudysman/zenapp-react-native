import React from 'react';
import { StatusBar } from 'react-native';
import ChatScreen from './src/components/ChatScreen';

const App = () => {
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#E53E3E" // Đổi sang màu đỏ
      />
      <ChatScreen />
    </>
  );
};

export default App;