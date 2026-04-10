import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator, Image, TouchableOpacity, Linking, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../components/UI';

import LoginScreen            from '../screens/LoginScreen';
import RegisterScreen         from '../screens/RegisterScreen';
import StudentHomeScreen      from '../screens/StudentHomeScreen';
import AssignmentsScreen      from '../screens/AssignmentsScreen';
import PaymentsScreen         from '../screens/PaymentsScreen';
import NotificationsScreen    from '../screens/NotificationsScreen';
import TeacherDashboardScreen from '../screens/TeacherDashboardScreen';
import AdminDashboardScreen   from '../screens/AdminDashboardScreen';
import ProfileScreen          from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const openWebsite = () => Linking.openURL('https://pinnacleeducation.ae/');

import { AppHeader } from '../components/AppHeader';
export { AppHeader };

// Tab icon renderer
const TabIcon = (emoji, label) => ({ focused }) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
  </View>
);

// Website tab button
const WebsiteTab = () => null;
const WebsiteTabButton = () => (
  <TouchableOpacity
    onPress={openWebsite}
    style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}
  >
    <Text style={{ fontSize: 20 }}>🌐</Text>
    <Text style={{ fontSize: 10, fontWeight: '600', color: COLORS.primary, marginTop: 2 }}>Website</Text>
  </TouchableOpacity>
);

const TAB_OPTS = {
  headerShown: false,
  tabBarActiveTintColor:   COLORS.primary,
  tabBarInactiveTintColor: COLORS.textLight,
  tabBarStyle: {
    backgroundColor: '#fff',
    borderTopColor:  COLORS.border,
    borderTopWidth:  1.5,
    paddingBottom:   Platform.OS === 'ios' ? 20 : 8,
    paddingTop:      6,
    height:          Platform.OS === 'ios' ? 82 : 64,
  },
  tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
};

/* ── Student ── */
function StudentTabs() {
  return (
    <Tab.Navigator screenOptions={TAB_OPTS}>
      <Tab.Screen name="Home"          component={StudentHomeScreen}   options={{ tabBarIcon: TabIcon('🏠'), title: 'Home' }} />
      <Tab.Screen name="Assignments"   component={AssignmentsScreen}   options={{ tabBarIcon: TabIcon('📝'), title: 'Assignments' }} />
      <Tab.Screen name="Payments"      component={PaymentsScreen}      options={{ tabBarIcon: TabIcon('💳'), title: 'Payments' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ tabBarIcon: TabIcon('🔔'), title: 'Alerts' }} />
      <Tab.Screen name="Profile"       component={ProfileScreen}       options={{ tabBarIcon: TabIcon('👤'), title: 'Profile' }} />
      <Tab.Screen name="Website"       component={WebsiteTab}
        options={{ tabBarIcon: TabIcon('🌐'), title: 'Website', tabBarButton: WebsiteTabButton }} />
    </Tab.Navigator>
  );
}

/* ── Teacher ── */
function TeacherTabs() {
  return (
    <Tab.Navigator screenOptions={TAB_OPTS}>
      <Tab.Screen name="Dashboard" component={TeacherDashboardScreen} options={{ tabBarIcon: TabIcon('📊'), title: 'Dashboard' }} />
      <Tab.Screen name="Profile"   component={ProfileScreen}          options={{ tabBarIcon: TabIcon('👤'), title: 'Profile' }} />
      <Tab.Screen name="Website"   component={WebsiteTab}
        options={{ tabBarIcon: TabIcon('🌐'), title: 'Website', tabBarButton: WebsiteTabButton }} />
    </Tab.Navigator>
  );
}

/* ── Admin ── */
function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={{ ...TAB_OPTS, tabBarActiveTintColor: COLORS.danger }}>
      <Tab.Screen name="Admin"   component={AdminDashboardScreen} options={{ tabBarIcon: TabIcon('📊'), title: 'Admin' }} />
      <Tab.Screen name="Profile" component={ProfileScreen}        options={{ tabBarIcon: TabIcon('👤'), title: 'Profile' }} />
      <Tab.Screen name="Website" component={WebsiteTab}
        options={{ tabBarIcon: TabIcon('🌐'), title: 'Website', tabBarButton: WebsiteTabButton }} />
    </Tab.Navigator>
  );
}

/* ── Root ── */
export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
      <Image source={require('../assets/logo.png')} style={{ width: 220, height: 80, marginBottom: 32 }} resizeMode="contain" />
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={{ color: COLORS.textMuted, marginTop: 16, fontSize: 12, fontWeight: '700', letterSpacing: 2 }}>
        GET FUTURE READY
      </Text>
    </View>
  );

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login"    component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : user.role === 'student' ? (
        <Stack.Screen name="StudentApp" component={StudentTabs} />
      ) : user.role === 'teacher' ? (
        <Stack.Screen name="TeacherApp" component={TeacherTabs} />
      ) : (
        <Stack.Screen name="AdminApp"   component={AdminTabs} />
      )}
    </Stack.Navigator>
  );
}
