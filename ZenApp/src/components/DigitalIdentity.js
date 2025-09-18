import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  TextInput,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');
const IDENTITY_PROGRESS_KEY = '@zen_digital_identity_progress';

const DigitalIdentity = ({ visible, onClose, onUpdateProgress }) => {
  const [activeWorkshop, setActiveWorkshop] = useState('audit');
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    privacy: {},
    content: [],
    footprint: [],
  });
  const [auditScore, setAuditScore] = useState(0);
  const [completedWorkshops, setCompletedWorkshops] = useState([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(width)).current;

  const workshops = [
    {
      id: 'audit',
      title: 'Privacy Audit',
      icon: '🔐',
      description: 'Kiểm tra và tối ưu cài đặt riêng tư',
      color: '#F59E0B',
    },
    {
      id: 'content',
      title: 'Content Strategy',
      icon: '✍️',
      description: 'Xây dựng nội dung tích cực',
      color: '#8B5CF6',
    },
    {
      id: 'branding',
      title: 'Personal Branding',
      icon: '⭐',
      description: 'Tạo thương hiệu cá nhân',
      color: '#EC4899',
    },
  ];

  const privacyChecklist = [
    {
      platform: 'Facebook',
      icon: '📘',
      checks: [
        { id: 'fb1', text: 'Ai có thể xem bài đăng?', setting: 'Chỉ bạn bè', points: 10 },
        { id: 'fb2', text: 'Ai có thể gửi lời mời kết bạn?', setting: 'Bạn của bạn bè', points: 10 },
        { id: 'fb3', text: 'Ẩn danh sách bạn bè?', setting: 'Chỉ mình tôi', points: 15 },
        { id: 'fb4', text: 'Kiểm duyệt tag?', setting: 'Bật', points: 15 },
        { id: 'fb5', text: 'Tắt tracking bên ngoài?', setting: 'Bật', points: 20 },
      ],
    },
    {
      platform: 'Instagram',
      icon: '📷',
      checks: [
        { id: 'ig1', text: 'Tài khoản riêng tư?', setting: 'Bật', points: 15 },
        { id: 'ig2', text: 'Ẩn story khỏi người lạ?', setting: 'Bật', points: 10 },
        { id: 'ig3', text: 'Tắt Activity Status?', setting: 'Bật', points: 10 },
        { id: 'ig4', text: 'Hạn chế tin nhắn lạ?', setting: 'Bật', points: 15 },
      ],
    },
  ];

  const contentGuidelines = [
    {
      type: 'positive',
      icon: '✅',
      title: 'Nên đăng',
      items: [
        'Thành tựu học tập/công việc',
        'Hoạt động tích cực, sở thích',
        'Chia sẻ kiến thức hữu ích',
        'Khoảnh khắc ý nghĩa (có chọn lọc)',
        'Nội dung sáng tạo, nghệ thuật',
      ],
    },
    {
      type: 'think',
      icon: '🤔',
      title: 'Cân nhắc kỹ',
      items: [
        'Ảnh party/tiệc tùng',
        'Quan điểm chính trị/tôn giáo',
        'Thông tin cá nhân (địa chỉ, SĐT)',
        'Drama/xung đột cá nhân',
        'Check-in vị trí real-time',
      ],
    },
    {
      type: 'avoid',
      icon: '❌',
      title: 'Tránh đăng',
      items: [
        'Nội dung tiêu cực, thù hận',
        'Ảnh không phù hợp',
        'Thông tin sai sự thật',
        'Bí mật của người khác',
        'Nội dung vi phạm pháp luật',
      ],
    },
  ];

  const brandingElements = [
    { id: 'bio', label: 'Bio hiệu quả', placeholder: 'Mô tả ngắn gọn, ấn tượng về bạn' },
    { id: 'avatar', label: 'Ảnh đại diện', tip: 'Chuyên nghiệp, rõ mặt, thân thiện' },
    { id: 'cover', label: 'Ảnh bìa', tip: 'Thể hiện sở thích/ngành nghề' },
    { id: 'username', label: 'Username nhất quán', placeholder: '@username_cua_ban' },
    { id: 'content_theme', label: 'Chủ đề nội dung', tip: '3-5 chủ đề chính bạn muốn chia sẻ' },
  ];

  const digitalFootprintTips = [
    '🔍 Google tên của bạn định kỳ',
    '🗑️ Xóa/ẩn nội dung cũ không phù hợp',
    '📝 Đăng ký domain tên riêng (nếu có thể)',
    '💼 Tạo LinkedIn chuyên nghiệp',
    '🎯 Tập trung vào 2-3 platform chính',
    '📊 Theo dõi engagement metrics',
    '🔄 Update thường xuyên nhưng có chọn lọc',
    '🤝 Kết nối với người cùng lĩnh vực',
  ];

  useEffect(() => {
    if (visible) {
      loadProgress();
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

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem(IDENTITY_PROGRESS_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setProfileData(data.profile || profileData);
        setCompletedWorkshops(data.completed || []);
        setAuditScore(data.auditScore || 0);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async () => {
    try {
      const progress = {
        profile: profileData,
        completed: completedWorkshops,
        auditScore: auditScore,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(IDENTITY_PROGRESS_KEY, JSON.stringify(progress));
      if (onUpdateProgress) {
        onUpdateProgress('digitalIdentity', progress);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handlePrivacyCheck = (checkId) => {
    setProfileData(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [checkId]: !prev.privacy[checkId] },
    }));

    // Calculate score
    let score = 0;
    privacyChecklist.forEach(platform => {
      platform.checks.forEach(check => {
        if (profileData.privacy[check.id]) {
          score += check.points;
        }
      });
    });
    setAuditScore(score);
  };

  const renderPrivacyAudit = () => (
    <ScrollView style={styles.auditContainer}>
      <View style={styles.auditHeader}>
        <Text style={styles.auditTitle}>🔐 Kiểm Tra Bảo Mật</Text>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Điểm bảo mật</Text>
          <Text style={styles.scoreValue}>{auditScore}/150</Text>
          <View style={styles.scoreBar}>
            <View style={[styles.scoreFill, { width: `${(auditScore/150)*100}%` }]} />
          </View>
        </View>
      </View>

      {privacyChecklist.map((platform) => (
        <View key={platform.platform} style={styles.platformCard}>
          <View style={styles.platformHeader}>
            <Text style={styles.platformIcon}>{platform.icon}</Text>
            <Text style={styles.platformName}>{platform.platform}</Text>
          </View>

          {platform.checks.map(check => (
            <TouchableOpacity
              key={check.id}
              style={styles.checkItem}
              onPress={() => handlePrivacyCheck(check.id)}
              activeOpacity={0.8}
            >
              <View style={styles.checkBox}>
                {profileData.privacy[check.id] && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </View>
              <View style={styles.checkContent}>
                <Text style={styles.checkText}>{check.text}</Text>
                <Text style={styles.checkSetting}>Khuyến nghị: {check.setting}</Text>
              </View>
              <Text style={styles.checkPoints}>+{check.points}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <TouchableOpacity
        style={styles.completeButton}
        onPress={() => {
          setCompletedWorkshops([...completedWorkshops, 'audit']);
          saveProgress();
        }}
      >
        <LinearGradient
          colors={['#F59E0B', '#D97706']}
          style={styles.completeGradient}
        >
          <Text style={styles.completeText}>Hoàn thành Audit</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderContentStrategy = () => (
    <ScrollView style={styles.contentContainer}>
      <Text style={styles.contentTitle}>📝 Chiến Lược Nội Dung</Text>

      {contentGuidelines.map((guide) => (
        <View key={guide.type} style={[
          styles.guideCard,
          guide.type === 'positive' && styles.positiveCard,
          guide.type === 'think' && styles.thinkCard,
          guide.type === 'avoid' && styles.avoidCard,
        ]}>
          <Text style={styles.guideIcon}>{guide.icon}</Text>
          <Text style={styles.guideTitle}>{guide.title}</Text>
          {guide.items.map((item, idx) => (
            <View key={idx} style={styles.guideItem}>
              <Text style={styles.guideBullet}>•</Text>
              <Text style={styles.guideText}>{item}</Text>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.contentPlanCard}>
        <Text style={styles.planTitle}>📅 Kế Hoạch Đăng Bài</Text>
        <View style={styles.planGrid}>
          <View style={styles.planItem}>
            <Text style={styles.planDay}>T2-T6</Text>
            <Text style={styles.planContent}>Nội dung chuyên môn</Text>
          </View>
          <View style={styles.planItem}>
            <Text style={styles.planDay}>T7-CN</Text>
            <Text style={styles.planContent}>Sở thích, lifestyle</Text>
          </View>
        </View>
        <Text style={styles.planTip}>
          💡 Đăng 3-4 bài/tuần, giờ vàng: 7-9h sáng, 12-13h, 19-21h tối
        </Text>
      </View>
    </ScrollView>
  );

  const renderPersonalBranding = () => (
    <ScrollView style={styles.brandingContainer}>
      <Text style={styles.brandingTitle}>⭐ Xây Dựng Thương Hiệu Cá Nhân</Text>

      {brandingElements.map((element) => (
        <View key={element.id} style={styles.brandingField}>
          <Text style={styles.fieldLabel}>{element.label}</Text>
          {element.placeholder ? (
            <TextInput
              style={styles.fieldInput}
              placeholder={element.placeholder}
              value={profileData[element.id] || ''}
              onChangeText={(text) => setProfileData(prev => ({
                ...prev,
                [element.id]: text
              }))}
            />
          ) : (
            <Text style={styles.fieldTip}>{element.tip}</Text>
          )}
        </View>
      ))}

      <View style={styles.footprintCard}>
        <Text style={styles.footprintTitle}>👣 Digital Footprint</Text>
        {digitalFootprintTips.map((tip, idx) => (
          <Text key={idx} style={styles.footprintTip}>{tip}</Text>
        ))}
      </View>

      <View style={styles.templateCard}>
        <Text style={styles.templateTitle}>📋 Bio Template</Text>
        <View style={styles.bioTemplate}>
          <Text style={styles.templateText}>
            {profileData.username || '[Tên]'} | {profileData.bio || '[Nghề nghiệp/Sở thích]'}{'\n'}
            📍 [Vị trí]{'\n'}
            🎯 [Mục tiêu/Slogan]{'\n'}
            🔗 [Link/Contact]
          </Text>
        </View>
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
          colors={['#F59E0B', '#D97706']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>🌟 Bản Sắc Số</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.workshopTabs}>
            {workshops.map(workshop => (
              <TouchableOpacity
                key={workshop.id}
                style={[
                  styles.workshopTab,
                  activeWorkshop === workshop.id && styles.activeWorkshopTab
                ]}
                onPress={() => setActiveWorkshop(workshop.id)}
              >
                <Text style={styles.workshopIcon}>{workshop.icon}</Text>
                {completedWorkshops.includes(workshop.id) && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedCheck}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {activeWorkshop === 'audit' && renderPrivacyAudit()}
          {activeWorkshop === 'content' && renderContentStrategy()}
          {activeWorkshop === 'branding' && renderPersonalBranding()}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  workshopTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 8,
  },
  workshopTab: {
    padding: 12,
    borderRadius: 8,
    position: 'relative',
  },
  activeWorkshopTab: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  workshopIcon: {
    fontSize: 24,
  },
  completedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCheck: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  auditContainer: {
    padding: 16,
  },
  auditHeader: {
    marginBottom: 20,
  },
  auditTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  scoreCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 8,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  scoreFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  platformCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  platformIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  platformName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  checkBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkContent: {
    flex: 1,
  },
  checkText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  checkSetting: {
    fontSize: 12,
    color: '#10B981',
  },
  checkPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  completeButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  completeGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  completeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 16,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  guideCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  positiveCard: {
    backgroundColor: '#D1FAE5',
  },
  thinkCard: {
    backgroundColor: '#FEF3C7',
  },
  avoidCard: {
    backgroundColor: '#FEE2E2',
  },
  guideIcon: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#374151',
  },
  guideItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  guideBullet: {
    marginRight: 8,
    color: '#6B7280',
  },
  guideText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
  },
  contentPlanCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  planGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  planItem: {
    alignItems: 'center',
  },
  planDay: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 4,
  },
  planContent: {
    fontSize: 12,
    color: '#6B7280',
  },
  planTip: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  brandingContainer: {
    padding: 16,
  },
  brandingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  brandingField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  fieldInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fieldTip: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  footprintCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  footprintTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 12,
  },
  footprintTip: {
    fontSize: 14,
    color: '#3730A3',
    marginBottom: 6,
  },
  templateCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  bioTemplate: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  templateText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
  },
});

export default DigitalIdentity;