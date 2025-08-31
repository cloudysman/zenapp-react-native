import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { digitalSkillsContent } from './DigitalSkillsContent';

const { width } = Dimensions.get('window');
const DAILY_TIP_KEY = '@zen_app_daily_tip';

const DailyTipWidget = ({ onPress }) => {
  const [tip, setTip] = useState(null);
  const [minimized, setMinimized] = useState(false);
  const [isNew, setIsNew] = useState(false);

  // Animation values
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadDailyTip();
    animateIn();

    // Start shimmer animation
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateMinimize = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMinimized(true);
    });
  };

  const animateMaximize = () => {
    setMinimized(false);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadDailyTip = async () => {
    try {
      const today = new Date().toDateString();
      const stored = await AsyncStorage.getItem(DAILY_TIP_KEY);

      if (stored) {
        const { date, tip: storedTip } = JSON.parse(stored);
        if (date === today) {
          setTip(storedTip);
          setIsNew(false);
          return;
        }
      }

      // Get new daily tip
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
      const newTip = digitalSkillsContent.getDailyTip(dayOfYear);

      await AsyncStorage.setItem(DAILY_TIP_KEY, JSON.stringify({
        date: today,
        tip: newTip,
      }));

      setTip(newTip);
      setIsNew(true);

      // Bounce animation for new tip
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Error loading daily tip:', error);
    }
  };

  if (!tip) return null;

  if (minimized) {
    return (
      <TouchableOpacity
        style={styles.minimizedContainer}
        onPress={animateMaximize}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#E53E3E', '#DC2626']}
          style={styles.minimizedGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        >
          <Animated.View style={{
            transform: [{
              rotate: shimmerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            }],
          }}>
            <Text style={styles.minimizedIcon}>💡</Text>
          </Animated.View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const categoryColors = {
    focus: ['#FF6B6B', '#FA5252'],
    sleep: ['#4ECDC4', '#38D9A9'],
    social: ['#A8E6CF', '#81C784'],
    mindfulness: ['#FFD3B6', '#FFAB91'],
    physical: ['#FFAAA5', '#FF8A80'],
    productivity: ['#95E1D3', '#64B5F6'],
  };

  const getCategoryGradient = () => {
    const category = Object.keys(digitalSkillsContent.categories).find(key =>
      digitalSkillsContent.categories[key].tips.some(t => t.id === tip.id)
    );
    return categoryColors[category] || ['#E53E3E', '#DC2626'];
  };

  return (
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
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.95}
      >
        <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
          <View style={styles.card}>
            <LinearGradient
              colors={getCategoryGradient()}
              style={styles.cardGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              <View style={styles.cardContent}>
                <View style={styles.header}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.categoryIcon}>{tip.categoryIcon || '💡'}</Text>
                    <View>
                      <Text style={styles.title}>Mẹo hôm nay</Text>
                      {isNew && (
                        <View style={styles.newBadge}>
                          <Text style={styles.newBadgeText}>MỚI</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={animateMinimize}
                    style={styles.minimizeButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.minimizeButtonText}>−</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipText} numberOfLines={3}>
                    {tip.content}
                  </Text>
                </View>

                <View style={styles.footer}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{tip.category}</Text>
                  </View>
                  <View style={styles.readMoreContainer}>
                    <Text style={styles.readMore}>Xem thêm</Text>
                    <Text style={styles.arrow}>→</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>

            {/* Shimmer effect overlay */}
            <Animated.View
              style={[
                styles.shimmer,
                {
                  opacity: shimmerAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.1, 0],
                  }),
                  transform: [{
                    translateX: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-width, width],
                    }),
                  }],
                },
              ]}
            />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#E53E3E',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  cardGradient: {
    borderRadius: 20,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  newBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  newBadgeText: {
    fontSize: 9,
    color: 'white',
    fontWeight: 'bold',
  },
  minimizeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  minimizeButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginTop: -2,
  },
  tipContent: {
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
    lineHeight: 24,
  },
  tipText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600',
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMore: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '500',
  },
  arrow: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  minimizedContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    zIndex: 1000,
  },
  minimizedGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E53E3E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  minimizedIcon: {
    fontSize: 28,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    width: 100,
  },
});

export default DailyTipWidget;