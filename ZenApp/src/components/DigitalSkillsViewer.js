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
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { digitalSkillsContent } from './DigitalSkillsContent';

const { width, height } = Dimensions.get('window');
const DAILY_TIP_KEY = '@zen_app_daily_tip';
const SAVED_TIPS_KEY = '@zen_app_saved_tips';

const DigitalSkillsViewer = ({ visible, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dailyTip, setDailyTip] = useState(null);
  const [savedTips, setSavedTips] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTips, setFilteredTips] = useState([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const cardAnimations = useRef([]).current;

  useEffect(() => {
    if (visible) {
      loadDailyTip();
      loadSavedTips();

      // Animate modal in
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
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(height);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  const loadDailyTip = async () => {
    try {
      const today = new Date().toDateString();
      const stored = await AsyncStorage.getItem(DAILY_TIP_KEY);

      if (stored) {
        const { date, tip } = JSON.parse(stored);
        if (date === today) {
          setDailyTip(tip);
          return;
        }
      }

      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
      const newTip = digitalSkillsContent.getDailyTip(dayOfYear);

      await AsyncStorage.setItem(DAILY_TIP_KEY, JSON.stringify({
        date: today,
        tip: newTip,
      }));

      setDailyTip(newTip);
    } catch (error) {
      console.error('Error loading daily tip:', error);
    }
  };

  const loadSavedTips = async () => {
    try {
      const saved = await AsyncStorage.getItem(SAVED_TIPS_KEY);
      if (saved) {
        setSavedTips(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved tips:', error);
    }
  };

  const saveTip = async (tip) => {
    try {
      const newSaved = savedTips.some(t => t.id === tip.id)
        ? savedTips.filter(t => t.id !== tip.id)
        : [...savedTips, tip];

      setSavedTips(newSaved);
      await AsyncStorage.setItem(SAVED_TIPS_KEY, JSON.stringify(newSaved));
    } catch (error) {
      console.error('Error saving tip:', error);
    }
  };

  const isTipSaved = (tipId) => {
    return savedTips.some(t => t.id === tipId);
  };

  const searchTips = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredTips([]);
      return;
    }

    const allTips = [];
    Object.values(digitalSkillsContent.categories).forEach(category => {
      category.tips.forEach(tip => {
        if (
          tip.title.toLowerCase().includes(query.toLowerCase()) ||
          tip.content.toLowerCase().includes(query.toLowerCase()) ||
          tip.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        ) {
          allTips.push({
            ...tip,
            category: category.title,
            categoryColor: category.color,
            categoryIcon: category.icon,
          });
        }
      });
    });
    setFilteredTips(allTips);
  };

  const getDifficultyInfo = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return { text: 'Dễ', color: '#10B981', icon: '🟢' };
      case 'medium':
        return { text: 'Vừa', color: '#F59E0B', icon: '🟡' };
      case 'hard':
        return { text: 'Khó', color: '#EF4444', icon: '🔴' };
      default:
        return { text: 'Dễ', color: '#10B981', icon: '🟢' };
    }
  };

  const renderTipCard = (tip, index = 0, isDaily = false) => {
    const difficultyInfo = getDifficultyInfo(tip.difficulty);

    return (
      <Animated.View
        key={tip.id}
        style={[
          {
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            }],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tipCard,
            isDaily && styles.dailyTipCard,
          ]}
          activeOpacity={0.95}
        >
          {isDaily && (
            <LinearGradient
              colors={['#FEE2E2', '#FECACA']}
              style={styles.dailyBadge}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              <Text style={styles.dailyBadgeIcon}>✨</Text>
              <Text style={styles.dailyBadgeText}>Mẹo hôm nay</Text>
            </LinearGradient>
          )}

          <View style={styles.tipHeader}>
            <View style={styles.tipHeaderLeft}>
              <View style={[styles.categoryIcon, { backgroundColor: (tip.categoryColor || '#E53E3E') + '20' }]}>
                <Text style={styles.categoryEmoji}>{tip.categoryIcon || '💡'}</Text>
              </View>
              <View style={styles.tipInfo}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipCategory}>{tip.category}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => saveTip(tip)}
              style={styles.saveButton}
              activeOpacity={0.7}
            >
              <Text style={styles.saveIcon}>
                {isTipSaved(tip.id) ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.tipContent}>{tip.content}</Text>

          <View style={styles.tipFooter}>
            <View style={styles.tipTags}>
              {tip.tags.slice(0, 3).map((tag, idx) => (
                <View key={idx} style={styles.tagBadge}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyInfo.color + '20' }]}>
              <Text style={styles.difficultyIcon}>{difficultyInfo.icon}</Text>
              <Text style={[styles.difficultyText, { color: difficultyInfo.color }]}>
                {difficultyInfo.text}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCategory = (key, category, index) => {
    const categoryGradients = {
      focus: ['#FF6B6B', '#FA5252'],
      sleep: ['#4ECDC4', '#38D9A9'],
      social: ['#A8E6CF', '#81C784'],
      mindfulness: ['#FFD3B6', '#FFAB91'],
      physical: ['#FFAAA5', '#FF8A80'],
      productivity: ['#95E1D3', '#64B5F6'],
    };

    return (
      <TouchableOpacity
        key={key}
        onPress={() => setSelectedCategory(key)}
        activeOpacity={0.9}
      >
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
          <LinearGradient
            colors={categoryGradients[key] || ['#E53E3E', '#DC2626']}
            style={styles.categoryCard}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <Text style={styles.categoryCardIcon}>{category.icon}</Text>
            <Text style={styles.categoryCardTitle}>{category.title}</Text>
            <View style={styles.categoryCardFooter}>
              <Text style={styles.categoryCardCount}>{category.tips.length} mẹo</Text>
              <Text style={styles.categoryCardArrow}>→</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={false}
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
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
            <Text style={styles.headerTitle}>💡 Kỹ năng sống số</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm mẹo..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={searchQuery}
              onChangeText={searchTips}
            />
            {searchQuery !== '' && (
              <TouchableOpacity
                onPress={() => searchTips('')}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, !showSaved && styles.activeTab]}
            onPress={() => setShowSaved(false)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, !showSaved && styles.activeTabText]}>
              🎯 Khám phá
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, showSaved && styles.activeTab]}
            onPress={() => setShowSaved(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, showSaved && styles.activeTabText]}>
              ❤️ Đã lưu ({savedTips.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {searchQuery !== '' ? (
            // Search Results
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                🔍 Kết quả tìm kiếm ({filteredTips.length})
              </Text>
              {filteredTips.length > 0 ? (
                filteredTips.map((tip, index) => renderTipCard(tip, index))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={styles.emptyText}>
                    Không tìm thấy mẹo nào phù hợp
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Thử tìm kiếm với từ khóa khác
                  </Text>
                </View>
              )}
            </View>
          ) : !showSaved ? (
            selectedCategory ? (
              // Selected Category View
              <Animated.View style={{ opacity: fadeAnim }}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setSelectedCategory(null)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backButtonIcon}>←</Text>
                  <Text style={styles.backButtonText}>Quay lại</Text>
                </TouchableOpacity>

                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryHeaderIcon}>
                    {digitalSkillsContent.categories[selectedCategory].icon}
                  </Text>
                  <Text style={styles.categoryHeaderTitle}>
                    {digitalSkillsContent.categories[selectedCategory].title}
                  </Text>
                </View>

                {digitalSkillsContent.categories[selectedCategory].tips.map((tip, index) =>
                  renderTipCard({
                    ...tip,
                    category: digitalSkillsContent.categories[selectedCategory].title,
                    categoryColor: digitalSkillsContent.categories[selectedCategory].color,
                    categoryIcon: digitalSkillsContent.categories[selectedCategory].icon,
                  }, index)
                )}
              </Animated.View>
            ) : (
              // Main View
              <>
                {dailyTip && (
                  <View style={styles.section}>
                    {renderTipCard(dailyTip, 0, true)}
                  </View>
                )}

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📚 Danh mục kỹ năng</Text>
                  <View style={styles.categoriesGrid}>
                    {Object.entries(digitalSkillsContent.categories).map(([key, category], index) =>
                      renderCategory(key, category, index)
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.randomButton}
                  onPress={() => {
                    const randomTip = digitalSkillsContent.getRandomTip();
                    setDailyTip(randomTip);
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#E53E3E', '#DC2626']}
                    style={styles.randomButtonGradient}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                  >
                    <Text style={styles.randomButtonText}>🎲 Lấy mẹo ngẫu nhiên</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )
          ) : (
            // Saved Tips View
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>❤️ Mẹo đã lưu</Text>
              {savedTips.length > 0 ? (
                savedTips.map((tip, index) => renderTipCard(tip, index))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>💔</Text>
                  <Text style={styles.emptyText}>
                    Chưa có mẹo nào được lưu
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Nhấn 🤍 để lưu mẹo yêu thích!
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.bottomSpacing} />
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
    paddingBottom: 16,
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
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: 'white',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#E53E3E',
  },
  tabText: {
    fontSize: 15,
    color: '#718096',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#E53E3E',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 16,
  },
  tipCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  dailyTipCard: {
    borderWidth: 2,
    borderColor: '#FEE2E2',
  },
  dailyBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dailyBadgeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  dailyBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  tipInfo: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 2,
  },
  tipCategory: {
    fontSize: 12,
    color: '#718096',
  },
  saveButton: {
    padding: 4,
  },
  saveIcon: {
    fontSize: 22,
  },
  tipContent: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 12,
  },
  tipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  tagBadge: {
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#E53E3E',
    fontWeight: '500',
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  difficultyIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryCardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  categoryCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryCardCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  categoryCardArrow: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonIcon: {
    fontSize: 20,
    color: '#E53E3E',
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#E53E3E',
    fontWeight: '500',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryHeaderIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  categoryHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  randomButton: {
    marginVertical: 16,
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
  randomButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  randomButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#718096',
  },
  bottomSpacing: {
    height: 20,
  },
});
export default DigitalSkillsViewer;