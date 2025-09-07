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
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const Home = ({ navigation, onGoalUpdate }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  // Button animations
  const button1Scale = useRef(new Animated.Value(1)).current;
  const button2Scale = useRef(new Animated.Value(1)).current;
  const button3Scale = useRef(new Animated.Value(1)).current;
  const button4Scale = useRef(new Animated.Value(1)).current;

  const [dailyGoal, setDailyGoal] = useState(null);
  const [todayUsage, setTodayUsage] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [goalProgress, setGoalProgress] = useState(0);

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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    loadDailyGoal();
    loadTodayUsage();
    
    // Set up interval to update remaining time
    const intervalId = setInterval(() => {
      updateRemainingTime();
    }, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, []);

  // Update remaining time when goal or usage changes
  useEffect(() => {
    if (dailyGoal && todayUsage) {
      updateRemainingTime(todayUsage);
    }
  }, [dailyGoal, todayUsage]);

  // Reload goal when component becomes visible (e.g., returning from GoalSettings)
  useEffect(() => {
    const handleFocus = () => {
      loadDailyGoal();
      loadTodayUsage();
    };

    // Call immediately
    handleFocus();
    
    // Set up interval to refresh data periodically
    const refreshInterval = setInterval(handleFocus, 30000); // Every 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, []);

  const loadDailyGoal = async () => {
    try {
      const goalData = await AsyncStorage.getItem('@zen_app_daily_goal');
      if (goalData) {
        const goal = JSON.parse(goalData);
        setDailyGoal(goal);
        // Update remaining time when goal changes
        if (todayUsage) {
          updateRemainingTime(todayUsage);
        }
      }
    } catch (error) {
      console.error('Error loading goal:', error);
    }
  };

  const loadTodayUsage = async () => {
    try {
      const usageData = await AsyncStorage.getItem('@zen_app_today_usage');
      if (usageData) {
        const usage = JSON.parse(usageData);
        setTodayUsage(usage);
        updateRemainingTime(usage);
      }
    } catch (error) {
      console.error('Error loading usage:', error);
    }
  };

  const updateRemainingTime = (usage = todayUsage) => {
    if (!dailyGoal || !usage) {
      setRemainingTime(null);
      setGoalProgress(0);
      return;
    }

    const usedMinutes = usage.totalMinutes;
    const goalMinutes = dailyGoal.totalMinutes;
    const remainingMinutes = Math.max(0, goalMinutes - usedMinutes);
    
    // Calculate progress percentage
    const progress = Math.min(100, (usedMinutes / goalMinutes) * 100);
    setGoalProgress(progress);
    
    // Convert remaining minutes to hours and minutes
    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingMins = remainingMinutes % 60;
    
    setRemainingTime({
      hours: remainingHours,
      minutes: remainingMins,
      totalMinutes: remainingMinutes,
      isExceeded: usedMinutes > goalMinutes
    });
  };

  const animateButtonPress = (buttonScale) => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    Vibration.vibrate(10);
  };

  const handleNavigation = (destination, buttonScale) => {
    animateButtonPress(buttonScale);
    
    switch (destination) {
      case 'chatbot':
        navigation.navigate('ChatScreen');
        break;
      case 'library':
        navigation.navigate('DigitalSkillsViewer');
        break;
      case 'goals':
        navigation.navigate('GoalSettings');
        break;
      case 'game':
        Alert.alert(
          '🎮 Tính năng Game',
          'Tính năng game đang được phát triển và sẽ sớm ra mắt!',
          [{ text: 'OK' }]
        );
        break;
      default:
        break;
    }
  };

  const getUsageStatusColor = () => {
    if (!todayUsage || !dailyGoal) return '#10B981';

    const percentage = (todayUsage.totalMinutes / dailyGoal.totalMinutes) * 100;
    if (percentage >= 100) return '#DC2626';
    if (percentage >= 90) return '#EF4444';
    if (percentage >= 80) return '#F59E0B';
    return '#10B981';
  };

  const getUsageStatusText = () => {
    if (!todayUsage) return 'Chưa có dữ liệu';
    if (!dailyGoal) return `${todayUsage.hours}h ${todayUsage.minutes}p`;

    const percentage = Math.round((todayUsage.totalMinutes / dailyGoal.totalMinutes) * 100);
    return `${percentage}% hoàn thành`;
  };

  const getRemainingTimeText = () => {
    if (!remainingTime) return 'Chưa đặt mục tiêu';
    
    if (remainingTime.isExceeded) {
      return `Vượt quá ${Math.abs(remainingTime.hours)}h ${Math.abs(remainingTime.minutes)}p`;
    }
    
    if (remainingTime.totalMinutes === 0) {
      return 'Đã đạt mục tiêu!';
    }
    
    return `Còn lại ${remainingTime.hours}h ${remainingTime.minutes}p`;
  };

  const getRemainingTimeColor = () => {
    if (!remainingTime) return '#718096';
    
    if (remainingTime.isExceeded) return '#DC2626';
    if (remainingTime.totalMinutes === 0) return '#10B981';
    if (remainingTime.totalMinutes <= 30) return '#F59E0B'; // Less than 30 minutes left
    return '#4A5568';
  };

  const MenuButton = ({ icon, title, subtitle, onPress, buttonScale, gradientColors }) => (
    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradientColors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.menuButtonGradient}
        >
          <Text style={styles.menuButtonIcon}>{icon}</Text>
          <Text style={styles.menuButtonTitle}>{title}</Text>
          <Text style={styles.menuButtonSubtitle}>{subtitle}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#E53E3E', '#DC2626']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.header}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.headerTitle}>ZenApp</Text>
          <Text style={styles.headerSubtitle}>Trợ lý sống số thông minh</Text>
          
          {/* Usage Stats Bar */}
          <View style={[styles.statsBar, { backgroundColor: getUsageStatusColor() + '20' }]}>
            <View style={styles.statsBarLeft}>
              <Text style={styles.statsLabel}>Hôm nay</Text>
              <Text style={[styles.statsValue, { color: getUsageStatusColor() }]}>
                {todayUsage ? `${todayUsage.hours}h ${todayUsage.minutes}p` : '--:--'}
              </Text>
            </View>
            <View style={[styles.statsPercentage, { backgroundColor: getUsageStatusColor() }]}>
              <Text style={styles.statsPercentageText}>
                {getUsageStatusText()}
              </Text>
            </View>
          </View>

          {/* Remaining Time Bar */}
          {dailyGoal && (
            <View style={styles.remainingTimeBar}>
              <View style={styles.remainingTimeLeft}>
                <Text style={styles.remainingTimeLabel}>Thời gian còn lại</Text>
                <Text style={[styles.remainingTimeValue, { color: getRemainingTimeColor() }]}>
                  {getRemainingTimeText()}
                </Text>
              </View>
              
              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${Math.min(100, goalProgress)}%`,
                        backgroundColor: getUsageStatusColor()
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressBarText}>
                  {Math.round(goalProgress)}%
                </Text>
              </View>
            </View>
          )}
        </Animated.View>
      </LinearGradient>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
          },
        ]}
      >
        <Text style={styles.sectionTitle}>Chọn tính năng</Text>
        
        <View style={styles.menuGrid}>
          {/* Row 1 */}
          <View style={styles.menuRow}>
            <MenuButton
              icon="🤖"
              title="Chat Bot"
              subtitle="Trò chuyện với Zen AI"
              onPress={() => handleNavigation('chatbot', button1Scale)}
              buttonScale={button1Scale}
              gradientColors={['#667eea', '#764ba2']}
            />
            <MenuButton
              icon="📚"
              title="Thư viện"
              subtitle="Kỹ năng sống số"
              onPress={() => handleNavigation('library', button2Scale)}
              buttonScale={button2Scale}
              gradientColors={['#f093fb', '#f5576c']}
            />
          </View>

          {/* Row 2 */}
          <View style={styles.menuRow}>
            <MenuButton
              icon="⚙️"
              title="Cài đặt"
              subtitle="Mục tiêu & Thông báo"
              onPress={() => handleNavigation('goals', button3Scale)}
              buttonScale={button3Scale}
              gradientColors={['#4facfe', '#00f2fe']}
            />
            <MenuButton
              icon="🎮"
              title="Game"
              subtitle="Sắp ra mắt"
              onPress={() => handleNavigation('game', button4Scale)}
              buttonScale={button4Scale}
              gradientColors={['#43e97b', '#38f9d7']}
            />
          </View>
        </View>

        {/* Quick Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Mẹo nhanh</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              Hãy đặt mục tiêu sử dụng điện thoại hàng ngày để có cuộc sống số lành mạnh hơn!
            </Text>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '400',
    marginBottom: 20,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statsBarLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  statsLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statsPercentage: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  statsPercentageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  remainingTimeBar: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  remainingTimeLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  remainingTimeLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  remainingTimeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.3s ease',
  },
  progressBarText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 20,
    textAlign: 'center',
  },
  menuGrid: {
    flex: 1,
    justifyContent: 'center',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  menuButton: {
    width: (width - 60) / 2,
    height: 140,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  menuButtonGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  menuButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  menuButtonSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 16,
  },
  tipsSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  tipCard: {
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E53E3E',
  },
  tipText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
});

export default Home;
