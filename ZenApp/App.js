import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import Home from './src/components/Home';
import ChatScreen from './src/components/ChatScreen';
import DigitalSkillsViewer from './src/components/DigitalSkillsViewer';
import GoalSettings from './src/components/GoalSettings';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('Home');

  const navigateToScreen = (screenName) => {
    setCurrentScreen(screenName);
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <Home 
          navigation={{ navigate: navigateToScreen }} 
          onGoalUpdate={() => {
            // Reload goal data when updated
            if (currentScreen === 'Home') {
              // This will trigger a re-render with updated goal
            }
          }}
        />;
      case 'ChatScreen':
        return <ChatScreen onBack={() => setCurrentScreen('Home')} />;
      case 'DigitalSkillsViewer':
        return <DigitalSkillsViewer visible={true} onClose={() => setCurrentScreen('Home')} />;
      case 'GoalSettings':
        return <GoalSettings visible={true} onClose={() => setCurrentScreen('Home')} onGoalUpdate={() => {}} />;
      default:
        return <Home navigation={{ navigate: navigateToScreen }} />;
    }
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#E53E3E"
      />
      {renderCurrentScreen()}
    </>
  );
};

export default App;