import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  NativeModules,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { UsageStatsModule } = NativeModules;
const { width } = Dimensions.get('window');

const UsageStats = ({ onUsageUpdate }) => {
  const [usageData, setUsageData] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    checkPermissionAndLoadData();

    // Start pulse animation for refresh button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    // Animate in when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const checkPermissionAndLoadData = async () => {
    try {
      setLoading(true);
      const permission = await UsageStatsModule.checkUsagePermission();
      setHasPermission(permission);

      if (permission) {
        await loadUsageData();
      }
    } catch (error) {
      console.error('Error checking permission:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsageData = async () => {
    try {
      const data = await UsageStatsModule.getTodayUsage();
      setUsageData(data);

      // Animate progress bar
      const percentage = Math.min((data.totalMinutes / 480) * 100, 100);
      Animated.timing(progressAnim, {
        toValue: percentage,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      if (onUsageUpdate) {
        onUsageUpdate(data);
      }
    } catch (error) {
      console.error('Error loading usage data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu sử dụng');
    }
  };

  const requestPermission = async () => {
    try {
      await UsageStatsModule.openUsageAccessSettings();
      Alert.alert(
        'Cấp quyền truy cập',
        'Vui lòng bật quyền "Usage access" cho ZenApp, sau đó quay lại ứng dụng.',
        [
          {
            text: 'Đã cấp quyền',
            onPress: () => {
              setTimeout(checkPermissionAndLoadData, 1000);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể mở cài đặt quyền');
    }
  };

  const formatUsageTime = (hours, minutes) => {
    if (hours === 0) {
      return `${minutes} phút`;
    } else if (minutes === 0) {
      return `${hours} giờ`;
    } else {
      return `${hours}h ${minutes}p`;
    }
  };

  const getUsageLevel = (totalMinutes) => {
    const hours = totalMinutes / 60;
    if (hours < 2) return { level: 'Tuyệt vời', color: '#10B981', emoji: '😊' };
    if (hours < 4) return { level: 'Tốt', color: '#3B82F6', emoji: '👍' };
    if (hours < 6) return { level: 'Trung bình', color: '#F59E0B', emoji: '😐' };
    if (hours < 8) return { level: 'Cao', color: '#F97316', emoji: '😟' };
    return { level: 'Rất cao', color: '#EF4444', emoji: '😰' };
  };

  if (loading) {
    return (
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.loadingDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </Animated.View>
    );
  }

  if (!hasPermission) {
    return (
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#FEE2E2', '#FECACA']}
          style={styles.permissionCard}
        >
          <Text style={styles.permissionIcon}>🔐</Text>
          <Text style={styles.permissionTitle}>Cần cấp quyền truy cập</Text>
          <Text style={styles.permissionText}>
            Để theo dõi thời gian sử dụng điện thoại, ZenApp cần quyền truy cập thống kê sử dụng.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#E53E3E', '#DC2626']}
              style={styles.buttonGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              <Text style={styles.permissionButtonText}>Cấp quyền ngay</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    );
  }

  const usageLevel = usageData ? getUsageLevel(usageData.totalMinutes) : null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <View>
            <Text style={styles.statsTitle}>Thời gian sử dụng</Text>
            <Text style={styles.statsDate}>{usageData?.date || 'Hôm nay'}</Text>
          </View>
          <TouchableOpacity
            onPress={loadUsageData}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Text style={styles.refreshIcon}>🔄</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {usageData && (
          <>
            <View style={styles.mainStats}>
              <Text style={styles.timeDisplay}>
                {formatUsageTime(usageData.hours, usageData.minutes)}
              </Text>
              <View style={[styles.levelBadge, { backgroundColor: usageLevel.color + '20' }]}>
                <Text style={styles.levelEmoji}>{usageLevel.emoji}</Text>
                <Text style={[styles.levelText, { color: usageLevel.color }]}>
                  {usageLevel.level}
                </Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Tiến độ hôm nay</Text>
                <Text style={styles.progressPercentage}>
                  {Math.round((usageData.totalMinutes / 480) * 100)}%
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                      backgroundColor: usageLevel.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.goalText}>Mục tiêu khuyến nghị: 8 giờ/ngày</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{usageData.hours}</Text>
                <Text style={styles.statLabel}>Giờ</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{usageData.minutes}</Text>
                <Text style={styles.statLabel}>Phút</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Math.round(usageData.totalMinutes / usageData.hours) || 0}
                </Text>
                <Text style={styles.statLabel}>TB/giờ</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#E53E3E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  statsDate: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '500',
  },
  refreshIcon: {
    fontSize: 24,
  },
  mainStats: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timeDisplay: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#E53E3E',
    marginBottom: 12,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  levelEmoji: {
    fontSize: 18,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#E53E3E',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#EDF2F7',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 10,
  },
  goalText: {
    fontSize: 12,
    color: '#A0AEC0',
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E53E3E',
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 15,
    color: '#718096',
  },
  permissionCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  permissionIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  permissionButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UsageStats;