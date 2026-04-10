# 🏔️ PINNACLE Innovation & Education — React Native Mobile App

Cross-platform mobile app for **Android & iOS** built with React Native.  
Connects to the same **FastAPI + MongoDB** backend.

---

## 📱 Screens & Features

### Student
| Tab | Features |
|-----|----------|
| 🏠 Home | View enrolled courses, browse all courses, enroll (free or paid) |
| 📝 Assignments | View & submit assignment answers |
| 💳 Payments | Full payment history with status (Completed / Refunded) |
| 🔔 Alerts | Notifications, tap to mark as read |
| 👤 Profile | Account info, sign out |

### Teacher
| Tab | Features |
|-----|----------|
| 📊 Dashboard | Create/delete courses (with price), create assignments, grade submissions, view payments & revenue, send notifications |
| 👤 Profile | Account info, sign out |

### Admin
| Tab | Features |
|-----|----------|
| 📊 Admin Panel | Institution analytics, user management (search/delete), course management, payment management with refund processing |
| 👤 Profile | Account info, sign out |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- React Native CLI: `npm install -g react-native-cli`
- **Android:** Android Studio + Android SDK
- **iOS:** Xcode 14+ (Mac only)
- Your PINNACLE backend running (see backend README)

---

### 1. Install dependencies

```bash
cd pinnacle_mobile
npm install
```

### 2. iOS — install pods (Mac only)

```bash
cd ios && pod install && cd ..
```

### 3. Configure backend URL

Open `src/services/api.js` and update `BASE_URL`:

```js
// Android Emulator
export const BASE_URL = 'http://10.0.2.2:8001';

// iOS Simulator
export const BASE_URL = 'http://localhost:8001';

// Real physical device (use your computer's IP)
export const BASE_URL = 'http://192.168.1.XXX:8001';
```

### 4. Start Metro bundler

```bash
npm start
```

### 5. Run the app

```bash
# Android
npm run android

# iOS (Mac only)
npm run ios
```

---

## 👥 Demo Accounts

| Role    | Email                     | Password     |
|---------|---------------------------|--------------|
| Admin   | admin@pinnacle.edu        | Admin@123    |
| Teacher | teacher@pinnacle.edu      | Teacher@123  |
| Student | student@pinnacle.edu      | Student@123  |

The login screen has **Quick Demo Access** buttons — just tap a role to auto-fill credentials.

---

## 📁 Project Structure

```
pinnacle_mobile/
├── App.js                          # Root entry point
├── src/
│   ├── services/
│   │   └── api.js                  # All API calls to FastAPI backend
│   ├── context/
│   │   └── AuthContext.js          # Auth state (login/register/logout)
│   ├── components/
│   │   └── UI.js                   # Reusable components (Btn, Card, Sheet, etc.)
│   ├── navigation/
│   │   └── RootNavigator.js        # Role-based tab + stack navigation
│   └── screens/
│       ├── LoginScreen.js          # Login with demo buttons
│       ├── RegisterScreen.js       # Register with role selection
│       ├── StudentHomeScreen.js    # Browse + enroll + pay for courses
│       ├── AssignmentsScreen.js    # Submit assignments
│       ├── PaymentsScreen.js       # Payment history + status
│       ├── NotificationsScreen.js  # Notifications
│       ├── TeacherDashboardScreen.js # Full teacher management
│       ├── AdminDashboardScreen.js  # Full admin control panel
│       └── ProfileScreen.js        # Profile + logout
└── package.json
```

---

## 💳 Payment Flow

1. Student taps **Buy Now** on a paid course
2. Payment sheet slides up with card form
3. After successful payment → auto-enrolled + receipt shown
4. Payment appears in **Payments** tab with status
5. Admin can view all payments and process refunds
6. Refund → student automatically unenrolled

---

## 🛠 Troubleshooting

**Metro not starting:** `npm start -- --reset-cache`

**Android build fails:** Open Android Studio → Sync Gradle

**iOS pods error:** `cd ios && pod install --repo-update`

**Can't connect to backend:**
- Make sure backend is running on port 8001
- Check `BASE_URL` in `src/services/api.js`
- For Android emulator: use `http://10.0.2.2:8001`
- For real device: use your computer's local IP

**AsyncStorage warning:** Install with `npm install @react-native-async-storage/async-storage`
