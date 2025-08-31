import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  NativeModules,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const { UsageStatsModule } = NativeModules;
const { width, height } = Dimensions.get('window');
const INTERVENTIONS_KEY = '@zen_app_interventions';

const SmartInterventions = ({ visible, onClose }) => {
  const [serviceEnabled, setServiceEnabled] = useState(false);
  const [interventionSettings, setInterventionSettings] = useState({
    continuousUseReminder: true,
    morningGreeting: true,
    nightReminder: true,
    achievementNotification: true,
  });

  // Animation values
  const slideAnim = useRef(new Animated.Value(width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSettings();

    // Robot icon animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem(INTERVENTIONS_KEY);
      if (settings) {
        const parsed = JSON.parse(settings);
        setInterventionSettings(parsed.interventions);
        setServiceEnabled(parsed.serviceEnabled);

        if (parsed.serviceEnabled) {
          await UsageStatsModule.startSmartInterventionService();
        }
      }
    } catch (error) {
      console.error('Error loading intervention settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        interventions: interventionSettings,
        serviceEnabled,
      };

      await AsyncStorage.setItem(INTERVENTIONS_KEY, JSON.stringify(settings));

      if (serviceEnabled) {
        await UsageStatsModule.startSmartInterventionService();
      } else {
        await UsageStatsModule.stopSmartInterventionService();
      }

      Alert.alert(
        '✅ Thành công',
        'Đã lưu cài đặt can thiệp thông minh',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('❌ Lỗi', 'Không thể lưu cài đặt');
    }
  };

  const toggleService = async (value) => {
    setServiceEnabled(value);

    try {
      if (value) {
        await UsageStatsModule.startSmartInterventionService();
        Alert.alert(
          '🤖 Đã kích hoạt',
          'Can thiệp thông minh đã được bật. Zen sẽ theo dõi và nhắc nhở bạn khi cần thiết!',
          [{ text: 'Tuyệt vời!' }]
        );
      } else {
        await UsageStatsModule.stopSmartInterventionService();
        Alert.alert(
          '💤 Đã tắt',
          'Can thiệp thông minh đã được tắt',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error toggling service:', error);
      Alert.alert('❌ Lỗi', 'Không thể thay đổi trạng thái service');
      setServiceEnabled(!value);
    }
  };

  const updateIntervention = (key, value) => {
    setInterventionSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!visible) return null;

  const interventionData = [
    {
      key: 'continuousUseReminder',
      icon: '⏰',
      title: 'Nhắc nghỉ giải lao',
      description: 'Nhắc nhở sau mỗi 60 phút sử dụng liên tục',
      color: '#10B981',
    },
    {
      key: 'morningGreeting',
      icon: '🌅',
      title: 'Chào buổi sáng',
      description: 'Lời chào và mẹo hữu ích vào buổi sáng (6h-9h)',
      color: '#F59E0B',
    },
    {
      key: 'nightReminder',
      icon: '🌙',
      title: 'Nhắc giờ ngủ',
      description: 'Nhắc nhở khi dùng điện thoại sau 23h',
      color: '#6366F1',
    },
    {
      key: 'achievementNotification',
      icon: '🏆',
      title: 'Chúc mừng thành tích',
      description: 'Thông báo khi đạt mục tiêu hàng ngày',
      color: '#EC4899',
    },
  ];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={['#E53E3E', '#DC2626']}
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Animated.Text
              style={[
                styles.headerIcon,
                {
                  transform: [{
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  }],
                },
              ]}
            >
              🤖
            </Animated.Text>
            <Text style={styles.title}>Can thiệp thông minh</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Main Toggle Card */}
        <View style={styles.mainToggleCard}>
          <LinearGradient
            colors={serviceEnabled ? ['#FEE2E2', '#FECACA'] : ['#F7FAFC', '#EDF2F7']}
            style={styles.mainToggleGradient}
          >
            <View style={styles.mainToggleContent}>
              <View style={styles.mainToggleInfo}>
                <Text style={styles.mainToggleIcon}>
                  {serviceEnabled ? '⚡' : '💤'}
                </Text>
                <View style={styles.mainToggleText}>
                  <Text style={styles.mainToggleTitle}>
                    {serviceEnabled ? 'Đang hoạt động' : 'Đã tắt'}
                  </Text>
                  <Text style={styles.mainToggleDesc}>
                    Zen sẽ theo dõi và nhắc nhở bạn tự động
                  </Text>
                </View>
              </View>
              <Switch
                value={serviceEnabled}
                onValueChange={toggleService}
                trackColor={{ false: '#E2E8F0', true: '#FCA5A5' }}
                thumbColor={serviceEnabled ? '#E53E3E' : '#CBD5E0'}
                style={styles.mainSwitch}
              />
            </View>
          </LinearGradient>
        </View>

        {serviceEnabled && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{
                scale: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              }],
            }}
          >
            {/* Intervention Types */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Các loại can thiệp</Text>
              <Text style={styles.sectionSubtitle}>
                Tùy chỉnh các nhắc nhở phù hợp với bạn
              </Text>

              {interventionData.map((item, index) => (
                <Animated.View
                  key={item.key}
                  style={[
                    styles.interventionCard,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        translateX: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        }),
                      }],
                    },
                  ]}
                >
                  <View style={[styles.interventionIcon, { backgroundColor: item.color + '20' }]}>
                    <Text style={styles.interventionEmoji}>{item.icon}</Text>
                  </View>
                  <View style={styles.interventionInfo}>
                    <Text style={styles.interventionTitle}>{item.title}</Text>
                    <Text style={styles.interventionDesc}>{item.description}</Text>
                  </View>
                  <Switch
                    value={interventionSettings[item.key]}
                    onValueChange={(value) => updateIntervention(item.key, value)}
                    trackColor={{ false: '#E2E8F0', true: item.color + '40' }}
                    thumbColor={interventionSettings[item.key] ? item.color : '#CBD5E0'}
                  />
                </Animated.View>
              ))}
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <LinearGradient
                colors={['#FEF2F2', '#FEE2E2']}
                style={styles.infoGradient}
              >
                <View style={styles.infoHeader}>
                  <Text style={styles.infoIcon}>💡</Text>
                  <Text style={styles.infoTitle}>Cách hoạt động</Text>
                </View>
                <View style={styles.infoContent}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoBullet}>•</Text>
                    <Text style={styles.infoText}>
                      Zen chạy ngầm và theo dõi thói quen của bạn
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoBullet}>•</Text>
                    <Text style={styles.infoText}>
                      Nhắc nhở được gửi vào thời điểm phù hợp
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoBullet}>•</Text>
                    <Text style={styles.infoText}>
                      Không làm phiền quá nhiều (tối đa 30 phút/lần)
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoBullet}>•</Text>
                    <Text style={styles.infoText}>
                      Tự động điều chỉnh theo mục tiêu của bạn
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Animated.View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveSettings}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#E53E3E', '#DC2626']}
            style={styles.saveButtonGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
            <Text style={styles.saveButtonText}>💾 Lưu cài đặt</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  mainToggleCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#E53E3E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  mainToggleGradient: {
    borderRadius: 20,
  },
  mainToggleContent: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mainToggleIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  mainToggleText: {
    flex: 1,
  },
  mainToggleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 4,
  },
  mainToggleDesc: {
    fontSize: 13,
    color: '#718096',
  },
  mainSwitch: {
    transform: [{ scale: 1.1 }],
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 16,
  },
  interventionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  interventionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  interventionEmoji: {
    fontSize: 24,
  },
  interventionInfo: {
    flex: 1,
    marginRight: 12,
  },
  interventionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 2,
  },
  interventionDesc: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 16,
  },
  infoBox: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoGradient: {
    padding: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E53E3E',
  },
  infoContent: {
    marginLeft: 4,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoBullet: {
    color: '#E53E3E',
    marginRight: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 18,
    flex: 1,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#E53E3E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 20,
  },
});
export default SmartInterventions;