import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');
const FAKE_NEWS_PROGRESS_KEY = '@zen_fake_news_progress';

const FakeNewsDetector = ({ visible, onClose, onUpdateProgress }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [streak, setStreak] = useState(0);
  const [gameMode, setGameMode] = useState('quiz'); // quiz, checklist, analysis

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(width)).current;

  const scenarios = [
    {
      id: 1,
      type: 'headline',
      content: 'NÓNG: Uống nước chanh mỗi sáng chữa khỏi 99% bệnh ung thư!',
      source: 'tinhotnhanh24h.com',
      date: 'Hôm nay',
      isFake: true,
      signs: ['Tuyên bố quá tuyệt đối (99%)', 'Thiếu nguồn y khoa uy tín', 'Domain không rõ ràng'],
      explanation: 'Tin giả! Không có phương pháp nào chữa khỏi 99% ung thư. Luôn kiểm tra với nguồn y tế chính thống.',
    },
    {
      id: 2,
      type: 'social',
      content: 'Chính phủ công bố: Từ tháng sau, mọi công dân được nhận 5 triệu/tháng',
      source: 'Chia sẻ từ Facebook',
      shares: '50K chia sẻ',
      isFake: true,
      signs: ['Không có link chính thức', 'Quá tốt để là thật', 'Lan truyền qua mạng xã hội'],
      explanation: 'Tin giả! Các chính sách quan trọng luôn được công bố trên website chính phủ chính thức.',
    },
    {
      id: 3,
      type: 'news',
      content: 'Bộ Y tế khuyến cáo về làn sóng COVID mới trong tháng 12',
      source: 'moh.gov.vn',
      date: '2 ngày trước',
      isFake: false,
      signs: ['Nguồn chính thức (.gov.vn)', 'Thông tin cụ thể', 'Có thể kiểm chứng'],
      explanation: 'Tin thật! Đến từ website chính thức của Bộ Y tế với domain .gov.vn',
    },
    {
      id: 4,
      type: 'clickbait',
      content: 'Cô gái này làm 1 việc trước khi ngủ, sáng dậy giàu có! Bác sĩ sốc!',
      source: 'khampha247.net',
      isFake: true,
      signs: ['Clickbait title', 'Hứa hẹn không thực tế', 'Thiếu thông tin cụ thể'],
      explanation: 'Tin giả! Đây là clickbait điển hình để thu hút click, không có giá trị thông tin.',
    },
  ];

  const checklistItems = [
    { id: 1, text: 'Kiểm tra nguồn: Website có uy tín không?', icon: '🔍' },
    { id: 2, text: 'Xác minh tác giả: Ai viết bài này?', icon: '✍️' },
    { id: 3, text: 'Kiểm tra ngày: Tin tức có cũ không?', icon: '📅' },
    { id: 4, text: 'Cross-check: Có nguồn khác đưa tin không?', icon: '🔄' },
    { id: 5, text: 'Phân tích ảnh: Ảnh có bị chỉnh sửa không?', icon: '🖼️' },
    { id: 6, text: 'Đọc kỹ: Không chỉ đọc tiêu đề', icon: '📖' },
    { id: 7, text: 'Kiểm tra bias: Bài viết có thiên vị không?', icon: '⚖️' },
    { id: 8, text: 'Hỏi chuyên gia: Khi không chắc chắn', icon: '👨‍🏫' },
  ];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleAnswer = (isFake) => {
    setSelectedAnswer(isFake);
    const correct = isFake === scenarios[currentQuestion].isFake;

    if (correct) {
      setScore(score + 10);
      setStreak(streak + 1);

      // Vibration feedback
      if (Platform.OS === 'android') {
        const { Vibration } = require('react-native');
        Vibration.vibrate(100);
      }
    } else {
      setStreak(0);
    }

    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < scenarios.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
      setSelectedAnswer(null);
    } else {
      // Complete quiz
      saveProgress();
    }
  };

  const saveProgress = async () => {
    const progress = {
      completedQuizzes: 1,
      totalScore: score,
      bestStreak: streak,
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(FAKE_NEWS_PROGRESS_KEY, JSON.stringify(progress));
    if (onUpdateProgress) {
      onUpdateProgress('fakeNews', progress);
    }
  };

  const renderQuizMode = () => {
    const question = scenarios[currentQuestion];

    return (
      <View style={styles.quizContainer}>
        <View style={styles.progressHeader}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentQuestion + 1) / scenarios.length) * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Câu {currentQuestion + 1}/{scenarios.length}
          </Text>
        </View>

        <View style={styles.scoreBoard}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreIcon}>⭐</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreIcon}>🔥</Text>
            <Text style={styles.scoreValue}>{streak}</Text>
          </View>
        </View>

        <View style={styles.newsCard}>
          <View style={styles.newsHeader}>
            <Text style={styles.newsSource}>{question.source}</Text>
            {question.date && <Text style={styles.newsDate}>{question.date}</Text>}
            {question.shares && <Text style={styles.newsShares}>{question.shares}</Text>}
          </View>

          <Text style={styles.newsContent}>{question.content}</Text>

          {question.type === 'social' && (
            <View style={styles.socialMeta}>
              <Text style={styles.socialReactions}>👍 2.3K  ❤️ 567  😮 234</Text>
            </View>
          )}
        </View>

        {!showExplanation ? (
          <View style={styles.answerButtons}>
            <TouchableOpacity
              style={[styles.answerButton, styles.fakeButton]}
              onPress={() => handleAnswer(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.answerButtonIcon}>🚫</Text>
              <Text style={styles.answerButtonText}>TIN GIẢ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.answerButton, styles.realButton]}
              onPress={() => handleAnswer(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.answerButtonIcon}>✅</Text>
              <Text style={styles.answerButtonText}>TIN THẬT</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.explanationCard}>
            <Text style={styles.resultText}>
              {selectedAnswer === question.isFake ? '✅ Chính xác!' : '❌ Sai rồi!'}
            </Text>
            <Text style={styles.explanationText}>{question.explanation}</Text>

            <Text style={styles.signsTitle}>Dấu hiệu nhận biết:</Text>
            {question.signs.map((sign, index) => (
              <View key={index} style={styles.signItem}>
                <Text style={styles.signBullet}>•</Text>
                <Text style={styles.signText}>{sign}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={styles.nextButton}
              onPress={nextQuestion}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#6366F1', '#4F46E5']}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>
                  {currentQuestion < scenarios.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderChecklistMode = () => (
    <ScrollView style={styles.checklistContainer}>
      <Text style={styles.checklistTitle}>📋 Checklist Kiểm Tra Tin Tức</Text>
      <Text style={styles.checklistSubtitle}>
        Sử dụng danh sách này mỗi khi bạn đọc tin tức online
      </Text>

      {checklistItems.map((item, index) => (
        <TouchableOpacity
          key={item.id}
          style={styles.checklistItem}
          activeOpacity={0.8}
        >
          <Text style={styles.checklistIcon}>{item.icon}</Text>
          <Text style={styles.checklistText}>{item.text}</Text>
          <View style={styles.checkbox}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Mẹo Pro</Text>
        <Text style={styles.tipText}>
          Khi thấy tin sốc hoặc quá tốt, hãy dừng lại 10 giây và đặt câu hỏi:
          "Ai được lợi nếu tôi tin và chia sẻ tin này?"
        </Text>
      </View>
    </ScrollView>
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="none" transparent={false}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#6366F1', '#4F46E5']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>🔍 Thám Tử Tin Giả</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, gameMode === 'quiz' && styles.activeTab]}
              onPress={() => setGameMode('quiz')}
            >
              <Text style={styles.tabText}>Quiz</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, gameMode === 'checklist' && styles.activeTab]}
              onPress={() => setGameMode('checklist')}
            >
              <Text style={styles.tabText}>Checklist</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {gameMode === 'quiz' ? renderQuizMode() : renderChecklistMode()}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
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
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  quizContainer: {
    flex: 1,
  },
  progressHeader: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  scoreBoard: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 20,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  newsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  newsSource: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  newsDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  newsShares: {
    fontSize: 12,
    color: '#6366F1',
  },
  newsContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1F2937',
    fontWeight: '500',
  },
  socialMeta: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  socialReactions: {
    fontSize: 14,
    color: '#6B7280',
  },
  answerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  answerButton: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  fakeButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  realButton: {
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  answerButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  answerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  explanationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
  },
  resultText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
    marginBottom: 16,
  },
  signsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  signItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  signBullet: {
    color: '#6366F1',
    marginRight: 8,
  },
  signText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
  },
  nextButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checklistContainer: {
    flex: 1,
  },
  checklistTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  checklistSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  checklistIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  checklistText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#78350F',
  },
});

export default FakeNewsDetector;