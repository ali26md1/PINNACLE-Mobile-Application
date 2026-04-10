import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, StatusBar, Image, Linking, SafeAreaView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Btn, Input, COLORS, SPACING, Card } from '../components/UI';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setError(''); setLoading(true);
    const r = await login(email.trim().toLowerCase(), password);
    if (!r.success) { setError(r.error); setLoading(false); }
  };

  const fillDemo = (role) => {
    const m = {
      admin:   { email: 'admin@pinnacle.edu',   password: 'Admin@123' },
      teacher: { email: 'teacher@pinnacle.edu', password: 'Teacher@123' },
      student: { email: 'student@pinnacle.edu', password: 'Student@123' },
    };
    setEmail(m[role].email); setPassword(m[role].password); setError('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <ScrollView
          style={s.container}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={s.brandHeader}>
            <Image source={require('../assets/logo.png')} style={s.logo} resizeMode="contain" />
            <TouchableOpacity onPress={() => Linking.openURL('https://pinnacleeducation.ae/')} style={s.chip}>
              <Text style={s.chipText}>pinnacleeducation.ae</Text>
            </TouchableOpacity>
          </View>

          {/* Hero Section */}
          <View style={s.hero}>
            <Text style={s.title}>Experience the{'\n'}<Text style={{ color: COLORS.primary }}>Future of Learning</Text></Text>
            <Text style={s.subtitle}>Elevate your skills with Dubai's leading innovation and education hub.</Text>
          </View>

          {/* Form Section */}
          <View style={s.form}>
            {!!error && (
              <View style={s.errorContainer}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="name@example.com"
              icon="✉️"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              icon="🔒"
            />

            <Btn
              label="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={s.loginBtn}
            />

            <View style={s.footerLinks}>
              <Text style={s.footerText}>New to PINNACLE?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={s.linkText}>Create an account</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Demo Access - Bento Style */}
          <View style={s.demoSection}>
            <Text style={s.demoHeader}>EXPLORE AS</Text>
            <View style={s.demoGrid}>
              <Card onPress={() => fillDemo('student')} style={s.demoCard}>
                <Text style={s.demoEmoji}>🎓</Text>
                <Text style={s.demoLabel}>Student</Text>
              </Card>
              <Card onPress={() => fillDemo('teacher')} style={s.demoCard}>
                <Text style={s.demoEmoji}>👨‍🏫</Text>
                <Text style={s.demoLabel}>Teacher</Text>
              </Card>
              <Card onPress={() => fillDemo('admin')} style={s.demoCard}>
                <Text style={s.demoEmoji}>⚡</Text>
                <Text style={s.demoLabel}>Admin</Text>
              </Card>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.m,
    paddingBottom: SPACING.xl,
  },
  brandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    width: 120,
    height: 40,
  },
  chip: {
    backgroundColor: COLORS.bg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  hero: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -1,
    lineHeight: 40,
    marginBottom: SPACING.s,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    lineHeight: 24,
    fontWeight: '500',
  },
  form: {
    marginBottom: SPACING.xxl,
  },
  loginBtn: {
    marginTop: SPACING.s,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.l,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  linkText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
  demoSection: {
    marginTop: SPACING.m,
  },
  demoHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: 1,
    marginBottom: SPACING.m,
    textAlign: 'center',
  },
  demoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  demoCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 20,
  },
  demoEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  demoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
});
