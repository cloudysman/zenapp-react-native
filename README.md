# ZenApp - Digital Wellness Assistant 📱

AI-powered mobile app helping users manage smartphone usage. Features usage tracking, daily goals, smart notifications, and Zen AI chatbot for digital wellness guidance.

## 🌟 Features

- **📊 Usage tracking**: Monitor daily phone usage time
- **🎯 Daily goals**: Set and track screen time limits
- **🔔 Smart notifications**: Receive timely reminders at 80%, 90%, and 100% of goal
- **🤖 AI chatbot**: Chat with Zen AI for personalized digital wellness tips
- **💡 Daily tips**: Get daily tips for healthier tech habits
- **📚 Digital skills library**: Browse categorized tips for focus, sleep, mindfulness, etc.

## 🛠️ Tech stack

### Frontend
- **React Native** 0.81.1
- **React Native Linear Gradient** - Beautiful UI gradients
- **AsyncStorage** - Local data persistence
- **Native Modules** - Android usage stats integration

### Backend
- **Python FastAPI** - REST API server
- **Google Gemini AI** - Natural language processing
- **Uvicorn** - ASGI server

### Android native
- **Kotlin** - Native android modules
- **UsageStatsManager** - Phone usage tracking
- **NotificationManager** - Smart notifications

## 📋 Prerequisites

- Node.js 18+ 
- Python 3.8+
- Android Studio (latest version)
- JDK 17
- Android SDK (API 33+)
- Android device/emulator (API 33+)

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/cloudysman/zenapp-react-native.git
cd zenapp-react-native
```

### 2. Backend setup
```bash
# Navigate to backend folder
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Configure API key (edit main.py)
# Replace GEMINI_API_KEY with your key from https://makersuite.google.com/app/apikey
```

### 3. Frontend setup
```bash
# Navigate to ZenApp folder
cd ../ZenAppcd

# Install node dependencies
npm install

# For iOS (Mac only)
cd ios && pod install && cd ..
```

### 4. Environment configuration

#### Update API endpoints in `ChatScreen.js`:
```javascript
const API_BASE_URL = 'http://YOUR_IP_ADDRESS:8000';
// Replace with your local IP (e.g., 192.168.1.100)
```

## 🏃‍♂️ Running app

### 1. Start backend server
```bash
cd backend
python main.py
# Server runs at http://localhost:8000
```

### 2. Start React Native metro
```bash
cd ZenApp
npx react-native start
```

### 3. Run on android
```bash
# New terminal
npx react-native run-android
```

### 4. Run on iOS (Mac only)
```bash
npx react-native run-ios
```

## 📱 Android permissions setup

The app requires special permissions on android:

1. **Usage access permission**
   - Go to Settings → Apps → Special access → Usage access
   - Enable for ZenApp

2. **Notification permission** (Android 13+)
   - The app will request this automatically

## 🔧 Troubleshooting

### Common Issues

**1. Metro bundler error**
```bash
npx react-native start --reset-cache
```

**2. Android build failed**
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

**3. "Network request failed" error**
- Ensure backend server is running
- Update API_BASE_URL with correct IP address
- Check firewall settings

**4. Usage stats not showing**
- Grant usage access permission in Android settings
- Restart the app after granting permission

**5. Python backend not starting**
- Check if port 8000 is already in use
- Verify Gemini API key is valid

## 📁 Project structure

```
zenapp-react-native/
├── backend/
│   ├── main.py              # FastAPI server
│   └── requirements.txt     # Python dependencies
├── ZenApp/
│   ├── android/             # Android native code
│   │   └── app/src/main/java/com/zenapp/
│   │       ├── MainActivity.kt
│   │       ├── UsageStatsModule.kt
│   │       └── SmartInterventionService.kt
│   ├── src/components/      # React Native components
│   │   ├── ChatScreen.js    # Main chat interface
│   │   ├── UsageStats.js    # Usage tracking display
│   │   ├── GoalSettings.js  # Goal configuration
│   │   └── DigitalSkillsViewer.js
│   └── package.json
└── README.md
```

## 👨‍💻 Author

**cloudysman**
- GitHub: [@cloudysman](https://github.com/cloudysman)

## 🙏 Acknowledgments

- Google Gemini AI for natural language processing
- React Native community
- Digital wellness research papers and resources

---

## 🇻🇳 Hướng dẫn tiếng Việt

### Yêu cầu hệ thống
- Cài đặt Node.js, Python, Android Studio
- Thiết bị android hoặc máy ảo

### Cài đặt nhanh
1. Clone project về máy
2. Cài dependencies: `npm install` (frontend) và `pip install -r requirements.txt` (backend)
3. Sửa IP trong `ChatScreen.js` thành IP ở trong phần ipconfig
4. Chạy backend: `python main.py`
5. Chạy app: `npx react-native run-android`

### Lưu ý quan trọng
- Cấp quyền Usage access cho app trong Settings Android
- Backend phải chạy trước khi mở app
- Dùng IP máy tính, không dùng localhost/127.0.0.1


