// Database các mẹo và kỹ năng sống số
export const digitalSkillsContent = {
  categories: {
    focus: {
      title: '🎯 Tập trung & Năng suất',
      icon: '🎯',
      color: '#FF6B6B',
      tips: [
        {
          id: 'focus_1',
          title: 'Kỹ thuật Pomodoro',
          content: 'Làm việc tập trung 25 phút, nghỉ 5 phút. Sau 4 chu kỳ, nghỉ dài 15-30 phút. Giúp duy trì tập trung và tránh kiệt sức.',
          tags: ['tập trung', 'pomodoro', 'năng suất'],
          difficulty: 'easy',
        },
        {
          id: 'focus_2',
          title: 'Quy tắc 2 phút',
          content: 'Nếu một việc mất ít hơn 2 phút, hãy làm ngay. Tránh tích tụ các việc nhỏ gây áp lực sau này.',
          tags: ['năng suất', 'quản lý thời gian'],
          difficulty: 'easy',
        },
        {
          id: 'focus_3',
          title: 'Chế độ Focus Mode',
          content: 'Bật Focus Mode/Do Not Disturb khi cần tập trung. Chỉ cho phép thông báo từ người quan trọng.',
          tags: ['tập trung', 'thông báo'],
          difficulty: 'easy',
        },
        {
          id: 'focus_4',
          title: 'Deep Work Sessions',
          content: 'Dành 90-120 phút mỗi ngày cho công việc sâu, không bị gián đoạn. Tắt mọi thông báo trong thời gian này.',
          tags: ['deep work', 'tập trung'],
          difficulty: 'medium',
        },
        {
          id: 'focus_5',
          title: 'Timeboxing',
          content: 'Phân bổ khung giờ cố định cho mỗi hoạt động. Giúp kiểm soát thời gian và tránh sa đà vào một việc.',
          tags: ['quản lý thời gian', 'kế hoạch'],
          difficulty: 'medium',
        },
      ],
    },
    sleep: {
      title: '😴 Giấc ngủ & Sức khỏe',
      icon: '😴',
      color: '#4ECDC4',
      tips: [
        {
          id: 'sleep_1',
          title: 'Quy tắc 30-30',
          content: 'Ngừng dùng điện thoại 30 phút trước khi ngủ, để điện thoại cách giường ít nhất 30cm.',
          tags: ['ngủ', 'sức khỏe'],
          difficulty: 'easy',
        },
        {
          id: 'sleep_2',
          title: 'Night Shift/Blue Light Filter',
          content: 'Bật chế độ lọc ánh sáng xanh sau 8h tối. Ánh sáng xanh ức chế melatonin, gây khó ngủ.',
          tags: ['ánh sáng xanh', 'ngủ'],
          difficulty: 'easy',
        },
        {
          id: 'sleep_3',
          title: 'Bedtime Routine',
          content: 'Tạo thói quen trước ngủ: đọc sách, thiền, nhạc nhẹ thay vì lướt điện thoại.',
          tags: ['thói quen', 'ngủ'],
          difficulty: 'medium',
        },
        {
          id: 'sleep_4',
          title: 'Charging Station',
          content: 'Sạc điện thoại ở phòng khác hoặc xa giường. Dùng đồng hồ báo thức thay vì điện thoại.',
          tags: ['ngủ', 'thói quen'],
          difficulty: 'medium',
        },
        {
          id: 'sleep_5',
          title: 'Wind Down Mode',
          content: 'Dùng Wind Down/Bedtime mode để tự động chuyển màn hình sang xám và tắt thông báo vào giờ ngủ.',
          tags: ['cài đặt', 'ngủ'],
          difficulty: 'easy',
        },
      ],
    },
    social: {
      title: '📱 Mạng xã hội & FOMO',
      icon: '📱',
      color: '#A8E6CF',
      tips: [
        {
          id: 'social_1',
          title: 'Tắt thông báo mạng xã hội',
          content: 'Tắt push notifications của Facebook, Instagram, TikTok. Chủ động kiểm tra khi cần thay vì bị cuốn theo thông báo.',
          tags: ['mạng xã hội', 'thông báo'],
          difficulty: 'easy',
        },
        {
          id: 'social_2',
          title: 'Quy tắc 5-4-3-2-1',
          content: 'Khi thấy FOMO, hãy: Nhìn 5 vật quanh bạn, nghe 4 âm thanh, chạm 3 bề mặt, ngửi 2 mùi, nếm 1 vị. Đưa bạn về hiện tại.',
          tags: ['FOMO', 'mindfulness'],
          difficulty: 'medium',
        },
        {
          id: 'social_3',
          title: 'Social Media Detox',
          content: 'Thử 1 ngày/tuần không dùng mạng xã hội. Thay bằng hoạt động offline: gặp bạn, đọc sách, thể thao.',
          tags: ['detox', 'mạng xã hội'],
          difficulty: 'hard',
        },
        {
          id: 'social_4',
          title: 'Unfollow & Mute',
          content: 'Unfollow tài khoản gây tiêu cực, so sánh. Follow những nội dung tích cực, truyền cảm hứng.',
          tags: ['mạng xã hội', 'tinh thần'],
          difficulty: 'easy',
        },
        {
          id: 'social_5',
          title: 'Scheduled Check',
          content: 'Đặt 2-3 khung giờ cố định kiểm tra mạng xã hội (ví dụ: 12h, 18h, 21h), mỗi lần 15 phút.',
          tags: ['thời gian', 'mạng xã hội'],
          difficulty: 'medium',
        },
      ],
    },
    mindfulness: {
      title: '🧘 Chánh niệm & Thư giãn',
      icon: '🧘',
      color: '#FFD3B6',
      tips: [
        {
          id: 'mind_1',
          title: 'Thở 4-7-8',
          content: 'Hít vào 4 giây, giữ 7 giây, thở ra 8 giây. Làm 3-4 lần khi stress hoặc muốn dùng điện thoại vô thức.',
          tags: ['thở', 'stress'],
          difficulty: 'easy',
        },
        {
          id: 'mind_2',
          title: 'Digital Mindfulness',
          content: 'Trước khi mở app, dừng 3 giây tự hỏi: "Tôi mở app này để làm gì?" Tránh lướt vô thức.',
          tags: ['chánh niệm', 'ý thức'],
          difficulty: 'medium',
        },
        {
          id: 'mind_3',
          title: 'Tech-Free Meals',
          content: 'Không dùng điện thoại khi ăn. Tập trung vào món ăn, nhai chậm, cảm nhận hương vị.',
          tags: ['ăn uống', 'chánh niệm'],
          difficulty: 'easy',
        },
        {
          id: 'mind_4',
          title: 'Morning Meditation',
          content: 'Dành 5-10 phút thiền buổi sáng trước khi check điện thoại. Giúp bắt đầu ngày bình tĩnh.',
          tags: ['thiền', 'buổi sáng'],
          difficulty: 'medium',
        },
        {
          id: 'mind_5',
          title: 'Gratitude Practice',
          content: 'Mỗi tối viết 3 điều biết ơn trong ngày thay vì lướt điện thoại. Cải thiện tâm trạng và giấc ngủ.',
          tags: ['biết ơn', 'thói quen'],
          difficulty: 'easy',
        },
      ],
    },
    physical: {
      title: '💪 Sức khỏe thể chất',
      icon: '💪',
      color: '#FFAAA5',
      tips: [
        {
          id: 'phy_1',
          title: 'Quy tắc 20-20-20',
          content: 'Sau 20 phút nhìn màn hình, nhìn vật cách 20 feet (6m) trong 20 giây. Giảm mỏi mắt.',
          tags: ['mắt', 'sức khỏe'],
          difficulty: 'easy',
        },
        {
          id: 'phy_2',
          title: 'Phone Neck Prevention',
          content: 'Giữ điện thoại ngang tầm mắt khi dùng. Tránh cúi đầu gây đau cổ, gù lưng.',
          tags: ['tư thế', 'cổ'],
          difficulty: 'easy',
        },
        {
          id: 'phy_3',
          title: 'Desk Stretches',
          content: 'Mỗi giờ đứng dậy, vươn vai, xoay cổ, duỗi lưng. Ngăn ngừa đau mỏi cơ xương.',
          tags: ['vận động', 'stretching'],
          difficulty: 'easy',
        },
        {
          id: 'phy_4',
          title: 'Walking Meetings',
          content: 'Họp online/gọi điện khi đi bộ nếu không cần nhìn màn hình. Vừa làm việc vừa vận động.',
          tags: ['đi bộ', 'vận động'],
          difficulty: 'medium',
        },
        {
          id: 'phy_5',
          title: 'Eye Palming',
          content: 'Che mắt bằng lòng bàn tay 30 giây, thư giãn trong bóng tối. Làm 3-4 lần/ngày khi mắt mỏi.',
          tags: ['mắt', 'thư giãn'],
          difficulty: 'easy',
        },
      ],
    },
    productivity: {
      title: '⚡ Hiệu suất & Tổ chức',
      icon: '⚡',
      color: '#95E1D3',
      tips: [
        {
          id: 'prod_1',
          title: 'App Limits',
          content: 'Đặt giới hạn thời gian cho app giải trí. iOS: Screen Time, Android: Digital Wellbeing.',
          tags: ['giới hạn', 'app'],
          difficulty: 'easy',
        },
        {
          id: 'prod_2',
          title: 'Batching Tasks',
          content: 'Gom việc tương tự làm cùng lúc: trả lời email 1 lần/ngày, check tin nhắn 2-3 lần/ngày.',
          tags: ['batch', 'hiệu quả'],
          difficulty: 'medium',
        },
        {
          id: 'prod_3',
          title: 'Airplane Mode Focus',
          content: 'Bật chế độ máy bay khi cần tập trung cao độ. Tránh mọi phiền nhiễu từ internet.',
          tags: ['máy bay', 'tập trung'],
          difficulty: 'easy',
        },
        {
          id: 'prod_4',
          title: 'One Tab Rule',
          content: 'Chỉ mở 1 tab trình duyệt khi làm việc. Đóng tab ngay khi xong việc. Tránh bị phân tâm.',
          tags: ['browser', 'tập trung'],
          difficulty: 'medium',
        },
        {
          id: 'prod_5',
          title: 'Digital Declutter',
          content: 'Mỗi tuần dọn dẹp: xóa app không dùng, ảnh trùng, file rác. Điện thoại gọn gàng, tâm trí nhẹ nhàng.',
          tags: ['dọn dẹp', 'tổ chức'],
          difficulty: 'easy',
        },
      ],
    },
  },

  // Lấy mẹo theo tag
  getTipsByTag(tag) {
    const tips = [];
    Object.values(this.categories).forEach(category => {
      category.tips.forEach(tip => {
        if (tip.tags.includes(tag)) {
          tips.push({ ...tip, category: category.title });
        }
      });
    });
    return tips;
  },

  // Lấy mẹo ngẫu nhiên
  getRandomTip() {
    const allTips = [];
    Object.values(this.categories).forEach(category => {
      allTips.push(...category.tips.map(tip => ({
        ...tip,
        category: category.title,
        categoryColor: category.color
      })));
    });
    return allTips[Math.floor(Math.random() * allTips.length)];
  },

  // Lấy mẹo theo độ khó
  getTipsByDifficulty(difficulty) {
    const tips = [];
    Object.values(this.categories).forEach(category => {
      category.tips.forEach(tip => {
        if (tip.difficulty === difficulty) {
          tips.push({ ...tip, category: category.title });
        }
      });
    });
    return tips;
  },

  // Lấy mẹo hàng ngày (không trùng)
  getDailyTip(dayOfYear) {
    const allTips = [];
    Object.values(this.categories).forEach(category => {
      allTips.push(...category.tips.map(tip => ({
        ...tip,
        category: category.title,
        categoryColor: category.color,
        categoryIcon: category.icon
      })));
    });
    return allTips[dayOfYear % allTips.length];
  },

  // Lấy mẹo theo keyword trong câu chat
  getTipsByKeywords(message) {
    const keywords = {
      'tập trung': ['focus', 'tập trung', 'concentrate', 'mất tập trung'],
      'ngủ': ['ngủ', 'sleep', 'mất ngủ', 'khó ngủ', 'buồn ngủ'],
      'mạng xã hội': ['facebook', 'instagram', 'tiktok', 'mạng xã hội', 'social'],
      'stress': ['stress', 'căng thẳng', 'áp lực', 'lo lắng'],
      'mắt': ['mắt', 'eye', 'mỏi mắt', 'đau mắt'],
      'FOMO': ['fomo', 'sợ bỏ lỡ', 'so sánh', 'tụt hậu'],
      'nghiện': ['nghiện', 'addiction', 'không kiểm soát', 'dùng nhiều'],
    };

    const matchedTags = [];
    const lowerMessage = message.toLowerCase();

    Object.entries(keywords).forEach(([tag, words]) => {
      if (words.some(word => lowerMessage.includes(word))) {
        matchedTags.push(tag);
      }
    });

    if (matchedTags.length === 0) return null;

    const tips = [];
    matchedTags.forEach(tag => {
      tips.push(...this.getTipsByTag(tag));
    });

    return tips.length > 0 ? tips[Math.floor(Math.random() * tips.length)] : null;
  },
};

export default digitalSkillsContent;