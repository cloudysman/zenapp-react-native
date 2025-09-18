import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');
const CYBERBULLYING_PROGRESS_KEY = '@zen_cyberbullying_progress';

const CyberbullyingDefense = ({ visible, onClose, onUpdateProgress }) => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [skillPoints, setSkillPoints] = useState({
    recognition: 0,
    response: 0,
    support: 0,
    reporting: 0,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  const scenarios = [
    {
      id: 1,
      type: 'Bị cô lập trong nhóm chat',
      situation: 'Nhóm lớp tạo group chat mới mà không có bạn, và nói xấu bạn trong group cũ. Bạn phát hiện qua lời kể của một người bạn.',
      responses: [
        { text: 'Đối chất cả nhóm trong group cũ', isCorrect: false, feedback: 'Đối chất trực tiếp có thể khiến tình hình tồi tệ hơn.', skill: 'response' },
        { text: 'Nói chuyện riêng với người bạn thân trong nhóm', isCorrect: true, feedback: 'Tốt! Tìm đồng minh và sự hỗ trợ là bước quan trọng.', skill: 'support' },
        { text: 'Báo với giáo viên chủ nhiệm', isCorrect: true, feedback: 'Chính xác! Người lớn có thể can thiệp hiệu quả và an toàn.', skill: 'reporting' },
        { text: 'Tạo group mới với những người khác', isCorrect: false, feedback: 'Việc này không giải quyết được gốc rễ vấn đề.', skill: 'response' },
      ],
      correctOptions: [1, 2], // Index of correct options
      points: 10,
    },
    {
      id: 2,
      type: 'Ảnh bị chỉnh sửa xấu',
      situation: 'Ai đó đăng ảnh của bạn được chỉnh sửa xấu lên Facebook với caption chế nhạo. Đã có nhiều reactions và comment tiêu cực.',
      responses: [
        { text: 'Báo cáo với Facebook ngay lập tức', isCorrect: true, feedback: 'Đúng! Tận dụng công cụ báo cáo của nền tảng là hành động đầu tiên.', skill: 'reporting' },
        { text: 'Nhờ bạn bè thân thiết báo cáo hàng loạt', isCorrect: true, feedback: 'Rất tốt! Nhiều báo cáo sẽ được ưu tiên xử lý nhanh hơn.', skill: 'support' },
        { text: 'Comment giải thích đó là ảnh giả', isCorrect: false, feedback: 'Việc này có thể thu hút thêm chú ý tiêu cực không mong muốn.', skill: 'response' },
        { text: 'Im lặng và khóa trang cá nhân', isCorrect: false, feedback: 'Khóa trang cá nhân là cần thiết, nhưng im lặng không giải quyết được vấn đề.', skill: 'recognition' },
      ],
      correctOptions: [0, 1],
      points: 15,
    },
    {
      id: 3,
      type: 'Mạo danh',
      points: 15,
      situation: 'Bạn phát hiện một tài khoản Instagram giả mạo, sử dụng tên và hình ảnh của bạn để đăng những nội dung xấu.',
      responses: [
        { text: 'Nhắn tin chửi bới tài khoản giả mạo đó.', isCorrect: false, feedback: 'Việc này có thể kích động kẻ mạo danh và không giải quyết được vấn đề.', skill: 'response' },
        { text: 'Báo cáo (report) tài khoản giả mạo với Instagram.', isCorrect: true, feedback: 'Chính xác! Sử dụng công cụ của nền tảng là cách hiệu quả nhất để gỡ bỏ tài khoản giả mạo.', skill: 'reporting' },
        { text: 'Đăng bài cảnh báo bạn bè về tài khoản giả này.', isCorrect: true, feedback: 'Rất tốt! Việc này giúp bạn bè của bạn không bị lừa và cùng chung tay báo cáo tài khoản kia.', skill: 'support' },
        { text: 'Chỉ chặn tài khoản đó và không làm gì thêm.', isCorrect: false, feedback: 'Chặn chỉ khiến bạn không thấy nó, nhưng tài khoản giả vẫn tồn tại và có thể lừa người khác.', skill: 'recognition' },
      ],
      correctOptions: [1, 2],
    },

    // Kịch bản 4
    {
      id: 4,
      type: 'Lộ thông tin cá nhân (Doxing)',
      points: 20,
      situation: 'Số điện thoại cá nhân của bạn bị ai đó đăng lên một nhóm Facebook công khai kèm theo những lời lẽ xúc phạm.',
      responses: [
        { text: 'Báo cáo bài viết cho quản trị viên nhóm và Facebook.', isCorrect: true, feedback: 'Tuyệt vời! Đây là hành động ưu tiên để gỡ bỏ thông tin nhạy cảm càng nhanh càng tốt.', skill: 'reporting' },
        { text: 'Nói ngay cho bố mẹ hoặc người lớn tin cậy.', isCorrect: true, feedback: 'Rất quan trọng! Người lớn có thể giúp bạn xử lý tình huống nghiêm trọng này một cách an toàn.', skill: 'support' },
        { text: 'Bình luận vào bài viết và chửi lại người đăng.', isCorrect: false, feedback: 'Việc này chỉ thu hút thêm sự chú ý tiêu cực và làm tình hình tồi tệ hơn.', skill: 'response' },
        { text: 'Im lặng và chờ mọi chuyện lắng xuống.', isCorrect: false, feedback: 'Thông tin cá nhân bị lộ là vấn đề nghiêm trọng, không nên im lặng bỏ qua.', skill: 'recognition' },
      ],
      correctOptions: [0, 1],
    },

    // Kịch bản 5
    {
      id: 5,
      type: 'Bắt nạt trong game',
      points: 10,
      situation: 'Trong một trận game online, một người chơi liên tục dùng những lời lẽ toxic, miệt thị và quấy rối bạn qua voice chat.',
      responses: [
        { text: 'Tắt tiếng (mute) người chơi đó ngay lập tức.', isCorrect: true, feedback: 'Đúng! Đây là cách nhanh nhất để bảo vệ bản thân khỏi những lời lẽ tiêu cực.', skill: 'response' },
        { text: 'Sử dụng tính năng báo cáo (report) trong game.', isCorrect: true, feedback: 'Rất cần thiết! Báo cáo giúp nhà phát hành game xử lý người chơi vi phạm.', skill: 'reporting' },
        { text: 'Dùng voice chat để chửi lại họ.', isCorrect: false, feedback: 'Trả đũa chỉ khiến bạn cũng có nguy cơ bị phạt và làm môi trường game tệ hơn.', skill: 'response' },
        { text: 'Thoát game ngay lập tức trong sự tức giận.', isCorrect: false, feedback: 'Thoát game giúp bạn tránh bị quấy rối, nhưng đừng quên báo cáo người chơi đó trước.', skill: 'recognition' },
      ],
      correctOptions: [0, 1],
    },

    // Kịch bản 6
    {
      id: 6,
      type: 'Tấn công bằng bình luận',
      points: 10,
      situation: 'Sau khi bạn đăng một video lên TikTok, một nhóm người lạ đã vào và để lại hàng loạt bình luận ác ý, chế giễu ngoại hình của bạn.',
      responses: [
        { text: 'Xóa các bình luận tiêu cực và chặn các tài khoản đó.', isCorrect: true, feedback: 'Tốt! Bạn có toàn quyền kiểm soát không gian của mình và loại bỏ những nội dung độc hại.', skill: 'reporting' },
        { text: 'Cãi nhau tay đôi với từng người trong phần bình luận.', isCorrect: false, feedback: 'Điều này sẽ chỉ nuôi dưỡng sự thù ghét và khiến họ càng tấn công bạn nhiều hơn.', skill: 'response' },
        { text: 'Tắt tính năng bình luận của video một thời gian.', isCorrect: true, feedback: 'Đây là một giải pháp thông minh để tạm thời ngăn chặn cuộc tấn công và cho bạn không gian để bình tĩnh.', skill: 'response' },
        { text: 'Xóa video đi vì cảm thấy xấu hổ.', isCorrect: false, feedback: 'Đừng để những kẻ bắt nạt chiến thắng. Hãy giữ lại video nếu bạn muốn và sử dụng các công cụ để bảo vệ mình.', skill: 'support' },
      ],
      correctOptions: [0, 2],
    },

    // Kịch bản 7
    {
      id: 7,
      type: 'Đe dọa trực tuyến',
      points: 25,
      situation: 'Bạn nhận được một tin nhắn riêng từ người lạ, đe dọa sẽ tìm và làm hại bạn ở ngoài đời thực.',
      responses: [
        { text: 'Chặn và xóa tin nhắn ngay lập tức.', isCorrect: false, feedback: 'Đừng xóa! Tin nhắn này là bằng chứng quan trọng. Hãy chụp màn hình lại trước.', skill: 'recognition' },
        { text: 'NÓI NGAY LẬP TỨC cho bố mẹ, người giám hộ.', isCorrect: true, feedback: 'Cực kỳ quan trọng! Các mối đe dọa cần được người lớn xử lý ngay lập tức.', skill: 'support' },
        { text: 'Báo cáo tài khoản và tin nhắn cho nền tảng mạng xã hội.', isCorrect: true, feedback: 'Đúng! Nền tảng cần biết về hành vi nguy hiểm này để có biện pháp xử lý.', skill: 'reporting' },
        { text: 'Thách thức lại họ, nói rằng bạn không sợ.', isCorrect: false, feedback: 'Tuyệt đối không nên! Việc này có thể kích động kẻ đe dọa và gây nguy hiểm cho bạn.', skill: 'response' },
      ],
      correctOptions: [1, 2],
    },

    // Kịch bản 8
    {
      id: 8,
      type: 'Gây áp lực, ép buộc',
      points: 15,
      situation: 'Người yêu cũ của bạn liên tục nhắn tin, gây áp lực và dọa sẽ tung những hình ảnh riêng tư của bạn nếu bạn không quay lại.',
      responses: [
        { text: 'Chặn mọi liên lạc và không trả lời.', isCorrect: true, feedback: 'Đúng! Cắt đứt liên lạc là bước đầu tiên để ngăn chặn hành vi quấy rối.', skill: 'response' },
        { text: 'Lưu lại tất cả tin nhắn đe dọa làm bằng chứng.', isCorrect: true, feedback: 'Rất cần thiết! Bằng chứng là yếu tố then chốt để bảo vệ bạn về mặt pháp lý sau này.', skill: 'reporting' },
        { text: 'Sợ hãi và làm theo yêu cầu của họ.', isCorrect: false, feedback: 'Tuyệt đối không! Việc nhượng bộ sẽ chỉ khiến hành vi của họ tồi tệ hơn. Hãy tìm sự giúp đỡ.', skill: 'support' },
        { text: 'Kể cho một người lớn mà bạn tin tưởng nhất.', isCorrect: true, feedback: 'Chính xác! Bạn không nên đối mặt với chuyện này một mình. Người lớn sẽ giúp bạn tìm giải pháp.', skill: 'support' },
      ],
      correctOptions: [0, 1, 3],
    },

    // Kịch bản 9
    {
      id: 9,
      type: 'Online Shaming (Làm nhục công khai)',
      points: 20,
      situation: 'Bạn mắc một lỗi nhỏ trong một bình luận và bị ai đó chụp lại, đăng lên một group lớn để mọi người vào chỉ trích, chế giễu bạn.',
      responses: [
        { text: 'Gửi lời xin lỗi công khai và giải thích trong bài đăng đó.', isCorrect: false, feedback: 'Việc này thường không hiệu quả và chỉ khiến bạn trở thành mục tiêu của nhiều bình luận ác ý hơn.', skill: 'response' },
        { text: 'Tạm thời khóa hoặc chuyển tài khoản về chế độ riêng tư.', isCorrect: true, feedback: 'Đây là cách hiệu quả để bảo vệ bạn khỏi "cơn bão" bình luận và cho bạn không gian để bình tĩnh.', skill: 'response' },
        { text: 'Báo cáo bài đăng vì hành vi quấy rối, bắt nạt.', isCorrect: true, feedback: 'Đúng! Việc lôi một cá nhân ra để công kích là hành vi vi phạm chính sách của nhiều nền tảng.', skill: 'reporting' },
        { text: 'Nhờ những người bạn thân vào bênh vực mình.', isCorrect: false, feedback: 'Việc này có thể kéo bạn bè của bạn vào một cuộc tranh cãi không hồi kết và không cần thiết.', skill: 'support' },
      ],
      correctOptions: [1, 2],
    },

    // Kịch bản 10
    {
      id: 10,
      type: 'Cyberstalking (Theo dõi trực tuyến)',
      points: 15,
      situation: 'Một người lạ mặt liên tục theo dõi mọi hoạt động của bạn: Thích mọi bài đăng, bình luận vào mọi story, và nhắn tin hỏi bạn đang ở đâu.',
      responses: [
        { text: 'Kiểm tra và siết chặt cài đặt quyền riêng tư của bạn.', isCorrect: true, feedback: 'Rất tốt! Hạn chế người có thể xem thông tin của bạn là bước phòng thủ đầu tiên.', skill: 'reporting' },
        { text: 'Chặn tài khoản đó.', isCorrect: true, feedback: 'Chính xác! Chặn là cách trực tiếp để ngăn người đó tiếp cận bạn.', skill: 'response' },
        { text: 'Nói chuyện với họ, hỏi tại sao lại làm vậy.', isCorrect: false, feedback: 'Không nên! Việc tương tác có thể bị hiểu nhầm là sự khuyến khích và khiến họ lấn tới.', skill: 'response' },
        { text: 'Lưu lại bằng chứng (chụp màn hình) về hành vi của họ.', isCorrect: true, feedback: 'Quan trọng! Nếu hành vi của họ leo thang, bạn sẽ cần bằng chứng để báo cáo.', skill: 'reporting' },
      ],
      correctOptions: [0, 1, 3],
    },

    // Kịch bản 11
    {
      id: 11,
      type: 'Loại trừ khỏi hoạt động online',
      points: 10,
      situation: 'Bạn bè của bạn tạo một server Discord/nhóm chat mới để chơi game và học tập, nhưng cố tình không mời bạn vào.',
      responses: [
        { text: 'Hỏi trực tiếp một người bạn thân trong nhóm về lý do.', isCorrect: true, feedback: 'Đây là cách tiếp cận thẳng thắn nhưng văn minh để hiểu rõ vấn đề, có thể chỉ là một sự hiểu lầm.', skill: 'support' },
        { text: 'Đăng một status buồn bã, ám chỉ về việc bị bỏ rơi.', isCorrect: false, feedback: 'Việc này có thể gây ra thêm drama và không giải quyết được vấn đề một cách trực tiếp.', skill: 'response' },
        { text: 'Tập trung vào các nhóm bạn khác và các hoạt động khác.', isCorrect: true, feedback: 'Đôi khi, cách tốt nhất là bước tiếp và đầu tư thời gian vào những người thực sự trân trọng bạn.', skill: 'support' },
        { text: 'Cố gắng tìm cách vào nhóm và xem họ nói gì.', isCorrect: false, feedback: 'Xâm phạm sự riêng tư của người khác không phải là cách hay và có thể khiến bạn gặp rắc rối hơn.', skill: 'recognition' },
      ],
      correctOptions: [0, 2],
    },

    // Kịch bản 12
    {
      id: 12,
      type: 'Hate Speech (Ngôn từ thù ghét)',
      points: 20,
      situation: 'Khi bạn chia sẻ quan điểm về một vấn đề xã hội, một người đã dùng những lời lẽ miệt thị, phân biệt đối xử (về giới tính, vùng miền,...) để tấn công bạn.',
      responses: [
        { text: 'Tranh cãi đến cùng để chứng minh họ sai.', isCorrect: false, feedback: 'Rất khó để dùng lý lẽ với những người có tư tưởng thù ghét. Tranh cãi chỉ làm bạn mệt mỏi.', skill: 'response' },
        { text: 'Báo cáo bình luận/tài khoản vì vi phạm tiêu chuẩn cộng đồng.', isCorrect: true, feedback: 'Chính xác! Ngôn từ thù ghét là vi phạm nghiêm trọng và cần được báo cáo để bảo vệ cộng đồng.', skill: 'reporting' },
        { text: 'Chặn người đó và không tương tác thêm.', isCorrect: true, feedback: 'Đúng! Bảo vệ không gian mạng của bạn bằng cách loại bỏ những kẻ toxic là điều nên làm.', skill: 'response' },
        { text: 'Xóa bình luận của bạn đi để tránh rắc rối.', isCorrect: false, feedback: 'Bạn có quyền bày tỏ quan điểm. Đừng để sự thù ghét khiến bạn phải im lặng.', skill: 'support' },
      ],
      correctOptions: [1, 2],
    }
  ];

  useEffect(() => {
    if (visible) {
      resetGame();
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const resetGame = () => {
    setCurrentScenarioIndex(0);
    setSelectedResponse(null);
    setShowFeedback(false);
    setScore(0);
    setSkillPoints({ recognition: 0, response: 0, support: 0, reporting: 0 });
  };

  const handleResponse = (response, index) => {
    if (showFeedback) return;
    setSelectedResponse(index);
    setShowFeedback(true);

    if (response.isCorrect) {
      const currentScenario = scenarios[currentScenarioIndex];
      const pointsPerCorrectAnswer = currentScenario.points / currentScenario.correctOptions.length;
      setScore(prev => prev + pointsPerCorrectAnswer);
      setSkillPoints(prev => ({
        ...prev,
        [response.skill]: prev[response.skill] + pointsPerCorrectAnswer,
      }));
    }
  };

  const nextScenario = () => {
    if (currentScenarioIndex < scenarios.length - 1) {
      setCurrentScenarioIndex(prev => prev + 1);
      setSelectedResponse(null);
      setShowFeedback(false);
    } else {
      saveProgress();
      onClose(); // Close modal after finishing
    }
  };

  const saveProgress = async () => {
    const progress = {
      completedScenarios: scenarios.length,
      totalScore: score,
      skills: skillPoints,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(CYBERBULLYING_PROGRESS_KEY, JSON.stringify(progress));
    if (onUpdateProgress) {
      onUpdateProgress('cyberbullying', progress);
    }
  };

  const currentScenario = scenarios[currentScenarioIndex];

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="none" transparent={true} onRequestClose={onClose}>
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <StatusBar barStyle="light-content" backgroundColor="#10B981" />
        <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>🛡️ Chống Bắt Nạt Mạng</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${((currentScenarioIndex + 1) / scenarios.length) * 100}%` }]} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 80 }}>
          <Text style={styles.scenarioType}>{currentScenario.type}</Text>
          <Text style={styles.scenarioTitle}>{currentScenario.situation}</Text>

          {currentScenario.responses.map((response, index) => {
            let buttonStyle = [styles.responseButton];
            let textStyle = [styles.responseText];

            if (showFeedback) {
              if (response.isCorrect) {
                buttonStyle.push(styles.correctButton);
                textStyle.push(styles.correctText);
              } else if (index === selectedResponse) {
                buttonStyle.push(styles.wrongButton);
                textStyle.push(styles.wrongText);
              }
            } else if (index === selectedResponse) {
              buttonStyle.push(styles.selectedButton);
            }

            return (
              <TouchableOpacity key={index} style={buttonStyle} onPress={() => handleResponse(response, index)} disabled={showFeedback}>
                <Text style={textStyle}>{response.text}</Text>
              </TouchableOpacity>
            );
          })}

          {showFeedback && (
            <Animated.View style={styles.feedbackCard}>
              <Text style={[styles.feedbackTitle, selectedResponse !== null && scenarios[currentScenarioIndex].responses[selectedResponse].isCorrect ? { color: '#059669' } : { color: '#DC2626' }]}>
                {selectedResponse !== null && scenarios[currentScenarioIndex].responses[selectedResponse].isCorrect ? '🌟 Lựa chọn tốt!' : '🤔 Cần xem xét lại!'}
              </Text>
              <Text style={styles.feedbackText}>
                {selectedResponse !== null ? scenarios[currentScenarioIndex].responses[selectedResponse].feedback : ''}
              </Text>
              <TouchableOpacity style={styles.nextButton} onPress={nextScenario}>
                <Text style={styles.nextButtonText}>
                  {currentScenarioIndex < scenarios.length - 1 ? 'Tình huống tiếp theo' : 'Hoàn thành'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>

        <View style={styles.skillsBar}>
          <View style={styles.skillItem}>
            <MaterialCommunityIcons name="eye-check-outline" size={24} color="#757575" />
            <Text style={styles.skillValue}>{Math.round(skillPoints.recognition)}</Text>
          </View>
          <View style={styles.skillItem}>
            <MaterialCommunityIcons name="chat-processing-outline" size={24} color="#757575" />
            <Text style={styles.skillValue}>{Math.round(skillPoints.response)}</Text>
          </View>
          <View style={styles.skillItem}>
            <MaterialCommunityIcons name="account-heart-outline" size={24} color="#757575" />
            <Text style={styles.skillValue}>{Math.round(skillPoints.support)}</Text>
          </View>
          <View style={styles.skillItem}>
            <MaterialCommunityIcons name="flag-outline" size={24} color="#757575" />
            <Text style={styles.skillValue}>{Math.round(skillPoints.reporting)}</Text>
          </View>
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scenarioType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },
  scenarioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    lineHeight: 26,
  },
  responseButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  responseText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  selectedButton: {
    borderColor: '#10B981',
    borderWidth: 2,
    backgroundColor: '#F0FDF4',
  },
  correctButton: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
    borderWidth: 2,
  },
  correctText: {
    color: '#065F46',
    fontWeight: 'bold',
  },
  wrongButton: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  wrongText: {
    color: '#B91C1C',
    fontWeight: 'bold',
  },
  feedbackCard: {
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  nextButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skillsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  skillItem: {
    alignItems: 'center',
  },
  skillValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 4,
  },
});

export default CyberbullyingDefense;