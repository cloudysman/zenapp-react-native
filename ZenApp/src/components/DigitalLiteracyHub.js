import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

// Define keys for AsyncStorage to avoid typos
const FAKE_NEWS_PROGRESS_KEY = '@zen_fake_news_progress';
const CYBERBULLYING_PROGRESS_KEY = '@zen_cyberbullying_progress';
const DIGITAL_IDENTITY_PROGRESS_KEY = '@zen_digital_identity_progress';

const DigitalLiteracyHub = ({ visible, onClose, onModuleSelect }) => {
  const [activeTab, setActiveTab] = useState('fakeNews');
  const [userProgress, setUserProgress] = useState({
    fakeNews: { score: 0, level: 1, badges: [] },
    cyberbullying: { score: 0, level: 1, badges: [] },
    digitalIdentity: { score: 0, level: 1, badges: [] },
    totalPoints: 0,
    streak: 0,
  });

  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      checkAndUpdateLevels();
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const checkAndUpdateLevels = async () => {
    try {
      const newProgress = { ...userProgress };
      let totalPoints = 0;
      let totalStreak = 0;

      // --- Logic for Fake News Module ---
      const fakeNewsProgressRaw = await AsyncStorage.getItem(FAKE_NEWS_PROGRESS_KEY);
      if (fakeNewsProgressRaw) {
        const fakeNewsProgress = JSON.parse(fakeNewsProgressRaw);
        const currentScore = fakeNewsProgress.totalScore || 0;
        totalPoints += currentScore;
        totalStreak = Math.max(totalStreak, fakeNewsProgress.bestStreak || 0);

        const LEVEL_UP_SCORE_FAKENEWS = 30;
        if (currentScore >= LEVEL_UP_SCORE_FAKENEWS) {
          newProgress.fakeNews.level = 2;
        } else {
          newProgress.fakeNews.level = 1;
        }
        newProgress.fakeNews.score = currentScore;
      }

      // --- LOGIC CẬP NHẬT CHO CHỐNG BẮT NẠT MẠNG ---
      const cyberbullyingProgressRaw = await AsyncStorage.getItem(CYBERBULLYING_PROGRESS_KEY);
      if (cyberbullyingProgressRaw) {
        const cyberbullyingProgress = JSON.parse(cyberbullyingProgressRaw);
        const currentScore = cyberbullyingProgress.totalScore || 0;
        totalPoints += currentScore; // Add to total points

        // Define level up rule for this module
        const LEVEL_UP_SCORE_CYBERBULLYING = 50;

        if (currentScore >= LEVEL_UP_SCORE_CYBERBULLYING) {
          newProgress.cyberbullying.level = 2;
        } else {
          newProgress.cyberbullying.level = 1;
        }
        newProgress.cyberbullying.score = currentScore;
      }

      // --- Placeholder for Digital Identity module ---
      // ...

      // Update total points and streak for display
      newProgress.totalPoints = totalPoints;
      newProgress.streak = totalStreak;

      setUserProgress(newProgress);

    } catch (error) {
      console.error("Error checking and updating levels:", error);
    }
  };

  const modules = [
    {
      id: 'fakeNews',
      title: 'Xử Lý Tin Giả',
      icon: '🔍',
      color: '#6366F1',
      description: 'Học cách nhận diện và kiểm tra tin tức giả mạo',
      unlocked: true,
    },
    {
      id: 'cyberbullying',
      title: 'Chống Bắt Nạt Mạng',
      icon: '🛡️',
      color: '#10B981',
      description: 'Bảo vệ bản thân và người khác trên mạng',
      unlocked: userProgress.fakeNews.level >= 2,
    },
    {
      id: 'digitalIdentity',
      title: 'Bản Sắc Số',
      icon: '🌟',
      color: '#F59E0B',
      description: 'Xây dựng hình ảnh tích cực trên không gian số',
      unlocked: userProgress.cyberbullying.level >= 2, // Condition updated to check cyberbullying level
    },
  ];

  const badges = [
    { id: 'newbie', name: 'Người Mới', icon: '🌱', requirement: 'Hoàn thành bài đầu tiên' },
    { id: 'factChecker', name: 'Thám Tử Sự Thật', icon: '🕵️', requirement: '10 tin giả phát hiện' },
    { id: 'defender', name: 'Người Bảo Vệ', icon: '🦸', requirement: '5 tình huống xử lý đúng' },
    { id: 'creator', name: 'Nhà Sáng Tạo', icon: '✨', requirement: 'Hoàn thành hồ sơ số' },
  ];

  const renderModuleCard = (module) => (
    <TouchableOpacity
      key={module.id}
      style={[styles.moduleCard, !module.unlocked && styles.lockedCard]}
      onPress={() => {
        if (module.unlocked && onModuleSelect) {
          onModuleSelect(module.id);
        }
      }}
      disabled={!module.unlocked}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={module.unlocked ? [module.color, module.color + 'DD'] : ['#9CA3AF', '#6B7280']}
        style={styles.moduleGradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        <Text style={styles.moduleIcon}>{module.icon}</Text>
        <Text style={styles.moduleTitle}>{module.title}</Text>
        <Text style={styles.moduleDesc}>{module.description}</Text>

        <View style={styles.moduleProgress}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(userProgress[module.id]?.score || 0)}%`,
                  backgroundColor: 'white'
                }
              ]}
            />
          </View>
          <Text style={styles.levelText}>
            Level {userProgress[module.id]?.level || 1}
          </Text>
        </View>

        {!module.unlocked && (
          <View style={styles.lockedOverlay}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.unlockHint}>Hoàn thành module trước để mở</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="none" transparent={true} onRequestClose={onClose}>
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
          colors={['#E53E3E', '#DC2626']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>🎮 Kỹ Năng Sống Số</Text>
              <Text style={styles.headerSubtitle}>Học qua trò chơi & thử thách</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⚡</Text>
              <Text style={styles.statValue}>{userProgress.totalPoints}</Text>
              <Text style={styles.statLabel}>Điểm</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statValue}>{userProgress.streak}</Text>
              <Text style={styles.statLabel}>Chuỗi</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statValue}>
                {Object.values(userProgress).reduce((acc, m) => acc + (m.badges?.length || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Huy hiệu</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Chọn Module Học</Text>
          {modules.map(renderModuleCard)}

          <View style={styles.badgesSection}>
            <Text style={styles.sectionTitle}>Bộ Sưu Tập Huy Hiệu</Text>
            <View style={styles.badgesGrid}>
              {badges.map(badge => {
                const earned = Object.values(userProgress).some(m =>
                  m.badges?.includes(badge.id)
                );
                return (
                  <View
                    key={badge.id}
                    style={[styles.badgeCard, earned && styles.earnedBadge]}
                  >
                    <Text style={styles.badgeIcon}>{badge.icon}</Text>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                    <Text style={styles.badgeReq}>{badge.requirement}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            activeOpacity={0.8}
            onPress={() => {
              const activeModuleData = modules.find(m => m.id === activeTab);
              if (activeModuleData && activeModuleData.unlocked && onModuleSelect) {
                onModuleSelect(activeTab);
              }
            }}
          >
            <LinearGradient
              colors={['#E53E3E', '#DC2626']}
              style={styles.startButtonGradient}
            >
              <Text style={styles.startButtonText}>
                🚀 Bắt Đầu Module {modules.find(m => m.id === activeTab)?.title}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
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
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 16,
    marginTop: 8,
  },
  moduleCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
  },
  moduleGradient: {
    padding: 20,
  },
  moduleIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  moduleDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  moduleProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  levelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  lockedCard: {
    opacity: 0.7,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  unlockHint: {
    color: 'white',
    fontSize: 12,
  },
  badgesSection: {
    marginTop: 24,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  earnedBadge: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  badgeIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  badgeReq: {
    fontSize: 10,
    color: '#718096',
    textAlign: 'center',
  },
  startButton: {
    marginTop: 24,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  startButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DigitalLiteracyHub;