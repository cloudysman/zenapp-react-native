import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Switch,
  NativeModules,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const { UsageStatsModule } = NativeModules;
const { width, height } = Dimensions.get('window');
const GOAL_STORAGE_KEY = '@zen_app_daily_goal';
const NOTIFICATION_SETTINGS_KEY = '@zen_app_notifications';

const GoalSettings = ({ visible, onClose, onGoalUpdate }) => {
  const [goalHours, setGoalHours] = useState('3');
  const [goalMinutes, setGoalMinutes] = useState('0');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [warningAt80Percent, setWarningAt80Percent] = useState(true);
  const [warningAt90Percent, setWarningAt90Percent] = useState(true);

  // Animation values
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (visible) {
      // Animate modal in
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
      // Animate modal out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const loadSettings = async () => {
    try {
      const goalData = await AsyncStorage.getItem(GOAL_STORAGE_KEY);
      if (goalData) {
        const goal = JSON.parse(goalData);
        setGoalHours(goal.hours.toString());
        setGoalMinutes(goal.minutes.toString());
      }

      const notifData = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (notifData) {
        const notifSettings = JSON.parse(notifData);
        setNotificationsEnabled(notifSettings.enabled);
        setWarningAt80Percent(notifSettings.warningAt80);
        setWarningAt90Percent(notifSettings.warningAt90);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveGoal = async () => {
    const hours = parseInt(goalHours) || 0;
    const minutes = parseInt(goalMinutes) || 0;

    if (hours === 0 && minutes === 0) {
      Alert.alert('Lỗi', 'Vui lòng đặt mục tiêu ít nhất 1 phút');
      return;
    }

    if (hours > 24 || (hours === 24 && minutes > 0)) {
      Alert.alert('Lỗi', 'Mục tiêu không thể vượt quá 24 giờ');
      return;
    }

    if (minutes >= 60) {
      Alert.alert('Lỗi', 'Số phút phải nhỏ hơn 60');
      return;
    }

    try {
      const goalData = {
        hours,
        minutes,
        totalMinutes: hours * 60 + minutes,
        createdAt: new Date().toISOString(),
      };

      const notificationSettings = {
        enabled: notificationsEnabled,
        warningAt80: warningAt80Percent,
        warningAt90: warningAt90Percent,
      };

      await AsyncStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(goalData));
      await AsyncStorage.setItem(
        NOTIFICATION_SETTINGS_KEY,
        JSON.stringify(notificationSettings)
      );

      await UsageStatsModule.saveGoalToNative(hours, minutes);

      if (onGoalUpdate) {
        onGoalUpdate(goalData);
      }

      Alert.alert(
        '✅ Thành công',
        `Đã đặt mục tiêu: ${hours} giờ ${minutes} phút mỗi ngày`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Lỗi', 'Không thể lưu mục tiêu');
    }
  };

  const formatGoalDisplay = () => {
    const h = parseInt(goalHours) || 0;
    const m = parseInt(goalMinutes) || 0;
    if (h === 0 && m === 0) return 'Chưa đặt mục tiêu';
    if (h === 0) return `${m} phút`;
    if (m === 0) return `${h} giờ`;
    return `${h} giờ ${m} phút`;
  };

  const adjustTime = (type, increment) => {
    if (type === 'hours') {
      const current = parseInt(goalHours) || 0;
      const newValue = Math.max(0, Math.min(24, current + increment));
      setGoalHours(newValue.toString());
    } else {
      const current = parseInt(goalMinutes) || 0;
      const newValue = Math.max(0, Math.min(59, current + increment));
      setGoalMinutes(newValue.toString());
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.modalOverlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#E53E3E', '#DC2626']}
              style={styles.headerGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            >
              <Text style={styles.modalTitle}>⏰ Đặt mục tiêu hàng ngày</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.contentContainer}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thời gian sử dụng tối đa</Text>
                <Text style={styles.sectionSubtitle}>
                  Nhận thông báo khi gần đạt giới hạn
                </Text>

                <View style={styles.timeInputContainer}>
                  <View style={styles.timeInputGroup}>
                    <Text style={styles.timeLabel}>Giờ</Text>
                    <View style={styles.timeInputWrapper}>
                      <TouchableOpacity
                        style={styles.adjustButton}
                        onPress={() => adjustTime('hours', -1)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.adjustButtonText}>−</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.timeInput}
                        value={goalHours}
                        onChangeText={setGoalHours}
                        keyboardType="numeric"
                        maxLength={2}
                        placeholder="0"
                        placeholderTextColor="#A0A0A0"
                      />
                      <TouchableOpacity
                        style={styles.adjustButton}
                        onPress={() => adjustTime('hours', 1)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.adjustButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.timeSeparator}>
                    <Text style={styles.timeSeparatorText}>:</Text>
                  </View>

                  <View style={styles.timeInputGroup}>
                    <Text style={styles.timeLabel}>Phút</Text>
                    <View style={styles.timeInputWrapper}>
                      <TouchableOpacity
                        style={styles.adjustButton}
                        onPress={() => adjustTime('minutes', -5)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.adjustButtonText}>−</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.timeInput}
                        value={goalMinutes}
                        onChangeText={setGoalMinutes}
                        keyboardType="numeric"
                        maxLength={2}
                        placeholder="0"
                        placeholderTextColor="#A0A0A0"
                      />
                      <TouchableOpacity
                        style={styles.adjustButton}
                        onPress={() => adjustTime('minutes', 5)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.adjustButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.currentGoalCard}>
                  <Text style={styles.currentGoalLabel}>Mục tiêu hiện tại</Text>
                  <Text style={styles.currentGoalValue}>{formatGoalDisplay()}</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông báo thông minh</Text>

                <View style={styles.switchCard}>
                  <View style={styles.switchInfo}>
                    <Text style={styles.switchIcon}>🔔</Text>
                    <View style={styles.switchTextContainer}>
                      <Text style={styles.switchTitle}>Bật thông báo</Text>
                      <Text style={styles.switchDescription}>
                        Nhắc nhở khi gần đạt mục tiêu
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: '#E2E8F0', true: '#FCA5A5' }}
                    thumbColor={notificationsEnabled ? '#E53E3E' : '#CBD5E0'}
                  />
                </View>

                {notificationsEnabled && (
                  <Animated.View style={styles.notificationOptions}>
                    <View style={styles.switchCard}>
                      <View style={styles.switchInfo}>
                        <Text style={styles.percentageIcon}>80%</Text>
                        <View style={styles.switchTextContainer}>
                          <Text style={styles.switchTitle}>Cảnh báo 80%</Text>
                          <Text style={styles.switchDescription}>
                            Nhắc nhở nhẹ khi đạt 80%
                          </Text>
                        </View>
                      </View>
                      <Switch
                        value={warningAt80Percent}
                        onValueChange={setWarningAt80Percent}
                        trackColor={{ false: '#E2E8F0', true: '#FCA5A5' }}
                        thumbColor={warningAt80Percent ? '#E53E3E' : '#CBD5E0'}
                      />
                    </View>

                    <View style={styles.switchCard}>
                      <View style={styles.switchInfo}>
                        <Text style={styles.percentageIcon}>90%</Text>
                        <View style={styles.switchTextContainer}>
                          <Text style={styles.switchTitle}>Cảnh báo 90%</Text>
                          <Text style={styles.switchDescription}>
                            Nhắc nhở mạnh khi đạt 90%
                          </Text>
                        </View>
                      </View>
                      <Switch
                        value={warningAt90Percent}
                        onValueChange={setWarningAt90Percent}
                        trackColor={{ false: '#E2E8F0', true: '#FCA5A5' }}
                        thumbColor={warningAt90Percent ? '#E53E3E' : '#CBD5E0'}
                      />
                    </View>
                  </Animated.View>
                )}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveGoal}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#E53E3E', '#DC2626']}
                    style={styles.saveButtonGradient}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                  >
                    <Text style={styles.saveButtonText}>Lưu mục tiêu</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    width: width - 32,
    maxWidth: 400,
    maxHeight: height * 0.85,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  headerGradient: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 16,
  },
  timeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeInputGroup: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adjustButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  adjustButtonText: {
    fontSize: 20,
    color: '#4A5568',
    fontWeight: 'bold',
  },
  timeInput: {
    width: 60,
    height: 50,
    borderWidth: 2,
    borderColor: '#E53E3E',
    borderRadius: 12,
    marginHorizontal: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    backgroundColor: '#FFF5F5',
  },
  timeSeparator: {
    marginHorizontal: 8,
    marginTop: 20,
  },
  timeSeparatorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#CBD5E0',
  },
  currentGoalCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  currentGoalLabel: {
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '600',
    marginBottom: 4,
  },
  currentGoalValue: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: 'bold',
  },
  switchCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  percentageIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E53E3E',
    marginRight: 12,
    width: 40,
    textAlign: 'center',
  },
  switchTextContainer: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 12,
    color: '#718096',
  },
  notificationOptions: {
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    color: '#718096',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
export default GoalSettings;