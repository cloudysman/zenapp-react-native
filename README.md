import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  NativeModules,
  Animated,
  Dimensions,
  Vibration,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import UsageStats from './UsageStats';
import GoalSettings from './GoalSettings';
import SmartInterventions from './SmartInterventions';
import DigitalSkillsViewer from './DigitalSkillsViewer';
import DailyTipWidget from './DailyTipWidget';
import { digitalSkillsContent } from './DigitalSkillsContent';

const { UsageStatsModule } = NativeModules;
const { width, height } = Dimensions.get('window');

// Component riêng cho Message Item
const MessageItem = ({ message }) => {
  const messageAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(messageAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        message.isBot ? styles.botMessageContainer : styles.userMessageContainer,
        {
          opacity: messageAnim,
          transform: [{
            translateX: messageAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [message.isBot ? -30 : 30, 0],
            }),
          }],
        },
      ]}
    >
      <View style={[
        styles.messageBubble,
        message.isBot ? styles.botBubble : styles.userBubble
      ]}>
        <Text style={[
          styles.messageText,
          message.isBot ? styles.botText : styles.userText
        ]}>
          {message.text}
        </Text>
        <Text style={[
          styles.timestamp,
          message.isBot ? styles.botTimestamp : styles.userTimestamp
        ]}>
          {message.timestamp}
        </Text>
      </View>
    </Animated.View>
  );
};

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUsageStats, setShowUsageStats] = useState(false);
  const [showGoalSettings, setShowGoalSettings] = useState(false);
  const [showSmartInterventions, setShowSmartInterventions] = useState(false);
  const [showDigitalSkills, setShowDigitalSkills] = useState(false);
  const [todayUsage, setTodayUsage] = useState(null);
  const [dailyGoal, setDailyGoal] = useState(null);
  const [lastNotificationTime, setLastNotificationTime] = useState({
    warning80: null,
    warning90: null,
    exceeded: null,
  });
  const scrollViewRef = useRef();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const typingIndicatorAnim = useRef(new Animated.Value(0)).current;

  const API_BASE_URL = 'http://10.24.194.184:8000';

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

    // Welcome message
    const welcomeMessage = {
      id: Date.now(),
      text: 'Xin chào! 👋 Mình là Zen, trợ lý AI giúp bạn cân bằng cuộc sống số.\n\nBạn có thể chia sẻ với mình về thói quen sử dụng điện thoại hoặc hỏi mẹo để sử dụng công nghệ lành mạnh hơn nhé! 🌟',
      isBot: true,
      timestamp: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      }),
    };
    setMessages([welcomeMessage]);

    loadDailyGoal();

    const intervalId = setInterval(() => {
      checkUsageAgainstGoal();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const loadDailyGoal = async () => {
    try {
      const goalData = await AsyncStorage.getItem('@zen_app_daily_goal');
      if (goalData) {
        const goal = JSON.parse(goalData);
        setDailyGoal(goal);
      }
    } catch (error) {
      console.error('Error loading goal:', error);
    }
  };

  const handleUsageUpdate = (usageData) => {
    setTodayUsage(usageData);
    if (dailyGoal) {
      checkUsageWithGoal(usageData, dailyGoal);
    }
  };

  const checkUsageAgainstGoal = async () => {
    if (!dailyGoal || !todayUsage) return;
    await checkUsageWithGoal(todayUsage, dailyGoal);
  };

  const checkUsageWithGoal = async (usage, goal) => {
    try {
      const notifSettings = await AsyncStorage.getItem('@zen_app_notifications');
      if (!notifSettings) return;

      const settings = JSON.parse(notifSettings);
      if (!settings.enabled) return;

      const usageMinutes = usage.totalMinutes;
      const goalMinutes = goal.totalMinutes;
      const percentage = (usageMinutes / goalMinutes) * 100;

      const now = Date.now();
      const NOTIFICATION_COOLDOWN = 30 * 60 * 1000;

      if (percentage >= 100) {
        if (!lastNotificationTime.exceeded ||
            now - lastNotificationTime.exceeded > NOTIFICATION_COOLDOWN) {
          await UsageStatsModule.showExceededNotification(
            '⚠️ Đã vượt mục tiêu!',
            `Bạn đã sử dụng điện thoại ${usage.hours}h ${usage.minutes}p, vượt quá mục tiêu ${goal.hours}h ${goal.minutes}p. Hãy nghỉ ngơi nhé! 🌿`
          );

          setLastNotificationTime(prev => ({
            ...prev,
            exceeded: now
          }));

          const warningMessage = {
            id: Date.now(),
            text: `⚠️ Bạn đã vượt quá mục tiêu sử dụng hôm nay! Đã dùng ${usage.hours}h ${usage.minutes}p / mục tiêu ${goal.hours}h ${goal.minutes}p. Hãy thử để điện thoại sang một bên và làm điều gì đó khác nhé! 💪`,
            isBot: true,
            timestamp: new Date().toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit'
            }),
          };
          setMessages(prev => [...prev, warningMessage]);
        }
      }
      else if (percentage >= 90 && settings.warningAt90) {
        if (!lastNotificationTime.warning90 ||
            now - lastNotificationTime.warning90 > NOTIFICATION_COOLDOWN) {
          await UsageStatsModule.showWarningNotification(
            '⏰ Sắp đạt mục tiêu!',
            `Bạn đã sử dụng ${Math.round(percentage)}% thời gian mục tiêu hôm nay (${usage.hours}h ${usage.minutes}p / ${goal.hours}h ${goal.minutes}p)`
          );

          setLastNotificationTime(prev => ({
            ...prev,
            warning90: now
          }));
        }
      }
      else if (percentage >= 80 && settings.warningAt80) {
        if (!lastNotificationTime.warning80 ||
            now - lastNotificationTime.warning80 > NOTIFICATION_COOLDOWN) {
          await UsageStatsModule.showWarningNotification(
            '📱 Nhắc nhở thời gian',
            `Bạn đã sử dụng ${Math.round(percentage)}% thời gian mục tiêu hôm nay (${usage.hours}h ${usage.minutes}p / ${goal.hours}h ${goal.minutes}p)`
          );

          setLastNotificationTime(prev => ({
            ...prev,
            warning80: now
          }));
        }
      }
    } catch (error) {
      console.error('Error checking usage against goal:', error);
    }
  };

  const handleGoalUpdate = (newGoal) => {
    setDailyGoal(newGoal);
    if (todayUsage) {
      checkUsageWithGoal(todayUsage, newGoal);
    }
  };

  const getUsageStatusColor = () => {
    if (!todayUsage || !dailyGoal) return '#E53E3E';

    const percentage = (todayUsage.totalMinutes / dailyGoal.totalMinutes) * 100;
    if (percentage >= 100) return '#DC2626'; // Deep Red
    if (percentage >= 90) return '#EF4444'; // Red
    if (percentage >= 80) return '#F59E0B'; // Orange
    return '#10B981'; // Green
  };

  const getUsageStatusText = () => {
    if (!todayUsage) return '📊';
    if (!dailyGoal) return `${todayUsage.hours}h ${todayUsage.minutes}p`;

    const percentage = Math.round((todayUsage.totalMinutes / dailyGoal.totalMinutes) * 100);
    return `${percentage}%`;
  };

  const animateButtonPress = () => {
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

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    animateButtonPress();

    const userMessage = {
      id: Date.now(),
      text: inputText.trim(),
      isBot: false,
      timestamp: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      }),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsLoading(true);

    // Start typing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingIndicatorAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(typingIndicatorAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    try {
      if (currentInput.toLowerCase().includes('mục tiêu') ||
          currentInput.toLowerCase().includes('đặt giới hạn') ||
          currentInput.toLowerCase().includes('thời gian tối đa')) {
        setShowGoalSettings(true);

        const botMessage = {
          id: Date.now() + 1,
          text: 'Mình sẽ mở cài đặt mục tiêu cho bạn. Bạn có thể đặt thời gian sử dụng tối đa mỗi ngày và nhận thông báo nhắc nhở khi gần đạt mục tiêu! 📱⏰',
          isBot: true,
          timestamp: new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
          }),
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
        typingIndicatorAnim.stopAnimation();
        return;
      }

      const relatedTip = digitalSkillsContent.getTipsByKeywords(currentInput);
      const conversationHistory = messages.map(msg => ({
        role: msg.isBot ? 'model' : 'user',
        content: msg.text
      }));

      const contextMessage = relatedTip
        ? `Context: User might benefit from this tip: "${relatedTip.title}: ${relatedTip.content}". Include this tip naturally in your response if relevant.`
        : '';

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          conversation_history: conversationHistory,
          context: contextMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        text: data.response,
        isBot: true,
        timestamp: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        }),
      };

      setMessages(prev => [...prev, botMessage]);

      if (relatedTip) {
        setTimeout(() => {
          const tipMessage = {
            id: Date.now() + 2,
            text: `💡 Mẹo hữu ích: ${relatedTip.title}\n\n${relatedTip.content}\n\n📚 Xem thêm mẹo khác bằng cách nhấn vào biểu tượng 💡 ở trên!`,
            isBot: true,
            timestamp: new Date().toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit'
            }),
          };
          setMessages(prev => [...prev, tipMessage]);
        }, 1500);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert(
        'Lỗi kết nối',
        'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.',
        [{ text: 'OK' }]
      );

      const errorMessage = {
        id: Date.now() + 1,
        text: 'Xin lỗi, mình đang gặp sự cố kỹ thuật. Vui lòng thử lại sau nhé! 🙏',
        isBot: true,
        timestamp: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      typingIndicatorAnim.stopAnimation();
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Zen AI</Text>
              <Text style={styles.headerSubtitle}>
                {dailyGoal
                  ? `Mục tiêu: ${dailyGoal.hours}h ${dailyGoal.minutes}p`
                  : 'Trợ lý sống số thông minh'}
              </Text>
            </View>

            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  animateButtonPress();
                  setShowDigitalSkills(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.iconButtonText}>💡</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  animateButtonPress();
                  setShowSmartInterventions(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.iconButtonText}>🤖</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  animateButtonPress();
                  setShowGoalSettings(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.iconButtonText}>⚙️</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.statsBar, { backgroundColor: getUsageStatusColor() + '20' }]}
            onPress={() => {
              animateButtonPress();
              setShowUsageStats(!showUsageStats);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.statsBarLeft}>
              <Text style={styles.statsLabel}>Hôm nay</Text>
              <Text style={[styles.statsValue, { color: getUsageStatusColor() }]}>
                {todayUsage ? `${todayUsage.hours}h ${todayUsage.minutes}p` : '--:--'}
              </Text>
            </View>
            <View style={[styles.statsPercentage, { backgroundColor: getUsageStatusColor() }]}>
              <Text style={styles.statsPercentageText}>{getUsageStatusText()}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      {showUsageStats && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <UsageStats onUsageUpdate={handleUsageUpdate} />
        </Animated.View>
      )}

      <DailyTipWidget onPress={() => setShowDigitalSkills(true)} />

      <GoalSettings
        visible={showGoalSettings}
        onClose={() => setShowGoalSettings(false)}
        onGoalUpdate={handleGoalUpdate}
      />

      <SmartInterventions
        visible={showSmartInterventions}
        onClose={() => setShowSmartInterventions(false)}
      />

      <DigitalSkillsViewer
        visible={showDigitalSkills}
        onClose={() => setShowDigitalSkills(false)}
      />

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map(message => (
            <MessageItem key={message.id} message={message} />
          ))}
          {isLoading && (
            <Animated.View
              style={[
                styles.messageContainer,
                styles.botMessageContainer,
                {
                  opacity: typingIndicatorAnim,
                },
              ]}
            >
              <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
                <Text style={[styles.messageText, styles.botText, styles.loadingText]}>
                  Zen đang soạn tin...
                </Text>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#A0A0A0"
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isLoading) && styles.sendButtonDisabled
                ]}
                onPress={sendMessage}
                disabled={!inputText.trim() || isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.sendButtonText}>
                  {isLoading ? '⏳' : '➤'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
          <Text style={styles.inputHint}>Nhấn Enter để gửi</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    paddingBottom: 20,
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '400',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  iconButtonText: {
    fontSize: 18,
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
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginVertical: 6,
  },
  botMessageContainer: {
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  botBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: '#E53E3E',
    borderBottomRightRadius: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  botText: {
    color: '#2D3748',
  },
  userText: {
    color: 'white',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
    opacity: 0.7,
  },
  botTimestamp: {
    color: '#718096',
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.8)',
  },
  typingBubble: {
    minWidth: 100,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E0',
  },
  typingDot1: {
    animationDelay: '0ms',
  },
  typingDot2: {
    animationDelay: '200ms',
  },
  typingDot3: {
    animationDelay: '400ms',
  },
  loadingText: {
    fontStyle: 'italic',
    color: '#718096',
  },
  inputContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
    backgroundColor: '#F7FAFC',
    color: '#2D3748',
  },
  sendButton: {
    backgroundColor: '#E53E3E',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E53E3E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E0',
    shadowOpacity: 0,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputHint: {
    fontSize: 11,
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 6,
  },
});

export default ChatScreen;
