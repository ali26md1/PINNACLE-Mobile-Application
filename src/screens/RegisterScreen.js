import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, StatusBar, Image, Linking,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Btn, Input, COLORS } from '../components/UI';

const ROLES = [
  { value: 'student', icon: '📚', label: 'Student',  desc: 'Browse & enroll in courses' },
  { value: 'teacher', icon: '👨‍🏫', label: 'Teacher', desc: 'Create & manage courses' },
];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm]       = useState({ name:'', email:'', password:'', role:'student' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { setError('Please fill all fields'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError(''); setLoading(true);
    const r = await register(form.name.trim(), form.email.trim().toLowerCase(), form.password, form.role);
    if (!r.success) { setError(r.error); setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={s.topBar}>
        <Text style={s.topBarText}>📞 +971 4 832 8855</Text>
        <Text style={s.topBarText}>✉ info@pinnacleeducation.ae</Text>
      </View>

      <View style={s.header}>
        <Image source={require('../assets/logo.png')} style={s.logo} resizeMode="contain" />
        <TouchableOpacity style={s.websiteBtn} onPress={() => Linking.openURL('https://pinnacleeducation.ae/')}>
          <Text style={s.websiteBtnText}>🌐 Visit Website</Text>
        </TouchableOpacity>
      </View>
      <View style={s.accentBar} />

      <ScrollView style={s.body} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={s.heroBanner}>
          <Text style={s.heroTitle}>Create Account</Text>
          <Text style={s.heroSub}>Join PINNACLE — GET FUTURE READY!</Text>
        </View>

        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={s.cardAccent} />
            <Text style={s.cardTitle}>Register Now</Text>
          </View>

          {!!error && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>⚠  {error}</Text>
            </View>
          )}

          <Input label="Full Name"     value={form.name}     onChangeText={v => set('name', v)}     placeholder="Your full name" />
          <Input label="Email Address" value={form.email}    onChangeText={v => set('email', v)}    keyboardType="email-address" autoCapitalize="none" placeholder="you@pinnacle.edu" />
          <Input label="Password"      value={form.password} onChangeText={v => set('password', v)} secureTextEntry placeholder="Min. 6 characters" />

          <Text style={s.roleLabel}>I am a...</Text>
          <View style={s.roleRow}>
            {ROLES.map(r => (
              <TouchableOpacity key={r.value} onPress={() => set('role', r.value)}
                style={[s.roleCard, form.role === r.value && s.roleCardActive]}>
                <Text style={s.roleIcon}>{r.icon}</Text>
                <Text style={[s.roleTitle, form.role === r.value && { color: COLORS.primary }]}>{r.label}</Text>
                <Text style={s.roleDesc}>{r.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Btn label="Create Account" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />

          <TouchableOpacity style={s.loginLink} onPress={() => navigation.navigate('Login')}>
            <Text style={s.loginText}>
              Already have an account?{' '}
              <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  topBar:        { backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 6, paddingTop: Platform.OS === 'ios' ? 50 : 10 },
  topBarText:    { color: '#fff', fontSize: 11, fontWeight: '500' },
  header:        { backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  logo:          { width: 160, height: 52 },
  websiteBtn:    { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  websiteBtnText:{ color: '#fff', fontSize: 12, fontWeight: '700' },
  accentBar:     { height: 4, backgroundColor: COLORS.accent },
  body:          { flex: 1, backgroundColor: COLORS.bg },
  heroBanner:    { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 24 },
  heroTitle:     { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 4 },
  heroSub:       { fontSize: 13, color: '#A8C8F0' },
  card:          { backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 20, shadowColor: COLORS.primary, shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4, borderWidth: 1, borderColor: COLORS.border },
  cardHeader:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  cardAccent:    { width: 4, height: 22, backgroundColor: COLORS.accent, borderRadius: 2 },
  cardTitle:     { fontSize: 17, fontWeight: '800', color: COLORS.text },
  errorBox:      { backgroundColor: '#FFF0F0', borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#FFCDD2' },
  errorText:     { color: COLORS.danger, fontSize: 13, fontWeight: '600' },
  roleLabel:     { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 10 },
  roleRow:       { flexDirection: 'row', gap: 10, marginBottom: 16 },
  roleCard:      { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 14, backgroundColor: COLORS.bg },
  roleCardActive:{ borderColor: COLORS.primary, backgroundColor: '#EAF2FF' },
  roleIcon:      { fontSize: 24, marginBottom: 6 },
  roleTitle:     { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  roleDesc:      { fontSize: 11, color: COLORS.textMuted },
  loginLink:     { marginTop: 18, alignItems: 'center' },
  loginText:     { fontSize: 14, color: COLORS.textMuted },
});
