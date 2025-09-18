import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './src/components/Home';
import ChatScreen from './src/components/ChatScreen';
import GoalSettings from './src/components/GoalSettings';
import DigitalSkillsViewer from './src/components/DigitalSkillsViewer';

const Stack = createStackNavigator();

const App = () => {
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#E53E3E"
      />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen name="GoalSettings" component={GoalSettings} />
          <Stack.Screen name="DigitalSkillsViewer" component={DigitalSkillsViewer} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default App;