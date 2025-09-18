// src/components/Home.js

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  Vibration,
  ScrollView,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

import DigitalSkillsViewer from './DigitalSkillsViewer';
import GoalSettings from './GoalSettings';
import DigitalLiteracyHub from './DigitalLiteracyHub';

const { width } = Dimensions.get('window');

const Home = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const [dailyGoal, setDailyGoal] = useState(null);
  const [showDigitalSkills, setShowDigitalSkills] = useState(false);
  const [showGoalSettings, setShowGoalSettings] = useState(false);
  const [showLiteracyHub, setShowLiteracyHub] = useState(false);

  useEffect(() => {
    // Welcome animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Add a listener to reload data when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadDailyGoal();
    });

    return unsubscribe; // Cleanup the listener when the component unmounts
  }, [navigation]);

  const loadDailyGoal = async () => {
    try {
      const goalData = await AsyncStorage.getItem('@zen_app_daily_goal');
      if (goalData) {
        setDailyGoal(JSON.parse(goalData));
      } else {
        setDailyGoal(null); // Explicitly set to null if no goal is found
      }
    } catch (error) {
      console.error('Error loading goal:', error);
    }
  };

  const animateButtonPress = (scaleAnim, callback) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) callback();
    });
    Vibration.vibrate(10);
  };

  const MenuItem = ({ icon, title, onPress, color }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => animateButtonPress(scaleAnim, onPress)}
          activeOpacity={0.8}
        >
          <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
            {icon}
          </View>
          <Text style={styles.featureTitle}>{title}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <LinearGradient
          colors={['#E53E3E', '#DC2626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text style={styles.headerTitle}>ZenApp</Text>
            <Text style={styles.headerSubtitle}>Trợ lý sống số thông minh</Text>
            <TouchableOpacity
              style={styles.goalBar}
              onPress={() => setShowGoalSettings(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.goalText}>Mục tiêu hôm nay:</Text>
              <Text style={styles.goalValue}>
                {dailyGoal ? `${dailyGoal.hours}h ${dailyGoal.minutes}p` : 'Chưa đặt'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </LinearGradient>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Các tính năng chính</Text>
          <View style={styles.menuGrid}>
            <MenuItem
              icon={<MaterialIcons name="smart-toy" size={30} color="#E53E3E" />}
              title="Chat Bot"
              onPress={() => navigation.navigate('ChatScreen')}
              color="#E53E3E"
            />
            <MenuItem
              icon={<Ionicons name="library" size={30} color="#3B82F6" />}
              title="Thư viện"
              onPress={() => setShowDigitalSkills(true)}
              color="#3B82F6"
            />
            <MenuItem
              icon={<Ionicons name="settings-sharp" size={30} color="#10B981" />}
              title="Cài đặt"
              onPress={() => setShowGoalSettings(true)}
              color="#10B981"
            />
            <MenuItem
              icon={<SimpleLineIcons name="game-controller" size={30} color="#F59E0B" />}
              title="Game"
              onPress={() => setShowLiteracyHub(true)}
              color="#F59E0B"
            />
          </View>

          <View style={styles.tipsSection}>
            <View style={styles.tipHeader}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipsTitle}>Mẹo nhanh</Text>
            </View>
            <Text style={styles.tipText}>
              Hãy đặt mục tiêu sử dụng điện thoại hàng ngày để có một cuộc sống số lành mạnh và cân bằng hơn!
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      <DigitalSkillsViewer
        visible={showDigitalSkills}
        onClose={() => setShowDigitalSkills(false)}
      />
      <GoalSettings
        visible={showGoalSettings}
        onClose={() => setShowGoalSettings(false)}
        onGoalUpdate={loadDailyGoal}
      />
      <DigitalLiteracyHub
        visible={showLiteracyHub}
        onClose={() => setShowLiteracyHub(false)}
        onModuleSelect={(module) => {
          setShowLiteracyHub(false);
          navigation.navigate('ChatScreen', { activeModule: module });
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light gray background for a softer look
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
  },
  goalBar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  goalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937', // Dark gray for text
    marginBottom: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: (width - 55) / 2, // Calculated width for 2 columns with a 15px gap
    height: 150, // Increased height for better touch area
    backgroundColor: 'white',
    borderRadius: 20, // Softer corners
    padding: 16,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F2937',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // Elevation for Android shadow
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  tipsSection: {
    marginTop: 25,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#1F2937',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  tipText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22, // Improved readability
  },
});

export default Home;