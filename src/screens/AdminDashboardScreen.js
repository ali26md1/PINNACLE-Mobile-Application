import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Alert, TextInput, Image, SafeAreaView, StatusBar
} from 'react-native';
import {
  apiDashboardAnalytics, apiGetUsers, apiDeleteUser,
  apiGetCourses, apiDeleteCourse, apiGetPayments, apiRefund,
} from '../services/api';
import { COLORS, SPACING, Card, Badge, Btn, Sheet, Input, Empty, Loader, Toast, StatCard, SectionHeader } from '../components/UI';
import { AppHeader } from '../components/AppHeader';

export default function AdminDashboardScreen() {
  const [analytics,  setAnalytics]  = useState(null);
  const [users,      setUsers]      = useState([]);
  const [courses,    setCourses]    = useState([]);
  const [payments,   setPayments]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab,        setTab]        = useState('overview');
  const [toast,      setToast]      = useState('');
  const [search,     setSearch]     = useState('');
  const [selPay,     setSelPay]     = useState(null);
  const [showPayDetail, setShowPayDetail] = useState(false);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    try {
      const [aR, uR, cR, pR] = await Promise.all([
        apiDashboardAnalytics(), apiGetUsers(), apiGetCourses(), apiGetPayments(),
      ]);
      setAnalytics(aR); setUsers(uR); setCourses(cR); setPayments(pR);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const processRefund = (pid) => {
    Alert.alert('Process Refund', 'Refund this payment? Student will be unenrolled.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Refund', style: 'destructive', onPress: async () => {
        try { await apiRefund(pid); showToast('↩️ Refund processed'); setShowPayDetail(false); load(); }
        catch (e) { showToast('❌ Failed'); }
      }},
    ]);
  };

  const totalRevenue  = payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0);
  const totalRefunded = payments.filter(p => p.status === 'refunded').reduce((s, p) => s + (p.amount || 0), 0);

  if (loading) return <Loader message="Accessing Admin Portal..." />;

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="dark-content" />
      <AppHeader />
      <Toast message={toast} />

      {/* Modern Admin Header */}
      <View style={s.adminHeader}>
        <View>
          <Text style={s.adminLabel}>System Administrator</Text>
          <Text style={s.adminTitle}>Platform Overview</Text>
        </View>
        <TouchableOpacity style={s.notifCircle}>
          <Text>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Professional Tab Bar */}
      <View style={{ marginBottom: 8 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING.l, gap: 8 }}
        >
          {[['overview', 'Stats'], ['users', 'Users'], ['courses', 'Courses'], ['payments', 'Sales']].map(([id, label]) => (
            <TouchableOpacity key={id} onPress={() => setTab(id)} style={[s.tab, tab === id && s.tabActive]}>
              <Text style={[s.tabText, tab === id && s.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[COLORS.primary]} />}
        contentContainerStyle={{ padding: SPACING.l, paddingBottom: 100 }}
      >
        {tab === 'overview' && (
          <View>
            <View style={s.statsGrid}>
              <StatCard icon="👥" label="Total Users" value={users.length} color={COLORS.oxford} />
              <StatCard icon="📚" label="Courses" value={courses.length} color={COLORS.harvard} />
            </View>

            <SectionHeader title="Financial Health" />
            <Card style={s.revenueCard}>
              <View style={s.revRow}>
                <View>
                  <Text style={s.revLabel}>Total Revenue</Text>
                  <Text style={s.revValue}>AED {totalRevenue.toLocaleString()}</Text>
                </View>
                <View style={s.revBadge}>
                  <Text style={s.revBadgeText}>+12.5%</Text>
                </View>
              </View>
              <View style={s.revFooter}>
                <Text style={s.revSub}>Net Profit: <Text style={{fontWeight:'800', color:COLORS.success}}>AED {(totalRevenue - totalRefunded).toLocaleString()}</Text></Text>
                <Text style={s.revSub}>Refunded: AED {totalRefunded.toLocaleString()}</Text>
              </View>
            </Card>

            <SectionHeader title="Recent Activity" action="Manage Users" onAction={() => setTab('users')} />
            {users.slice(0, 5).map(u => (
              <View key={u.id} style={s.activityRow}>
                <View style={s.avatar}><Text style={s.avatarText}>{u.name[0]}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.activityName}>{u.name}</Text>
                  <Text style={s.activityEmail}>{u.email}</Text>
                </View>
                <Badge text={u.role} type={u.role === 'admin' ? 'danger' : 'primary'} />
              </View>
            ))}
          </View>
        )}

        {tab === 'users' && (
          <View>
            <Input
              placeholder="Search users..."
              value={search}
              onChangeText={setSearch}
              icon="🔍"
            />
            {filteredUsers.map(u => (
              <Card key={u.id}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.userName}>{u.name}</Text>
                    <Text style={s.userEmail}>{u.email}</Text>
                    <Badge text={u.role} type={u.role === 'admin' ? 'danger' : 'primary'} />
                  </View>
                  <TouchableOpacity onPress={() => {
                    Alert.alert('Manage User', u.name, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete User', style: 'destructive', onPress: async () => {
                            try {
                                await apiDeleteUser(u.id);
                                showToast('🗑️ User deleted');
                                load();
                            } catch(e) { showToast('❌ Failed'); }
                        }}
                    ]);
                  }}>
                    <Text style={{ fontSize: 20 }}>⚙️</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

        {tab === 'courses' && (
          <View>
            <Input
              placeholder="Search courses..."
              value={search}
              onChangeText={setSearch}
              icon="🔍"
            />
            {filteredCourses.map(c => (
              <Card key={c.id}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.userName}>{c.title}</Text>
                    <Text style={s.userEmail}>{c.teacher_name}</Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                        <Badge text={c.level} type="primary" />
                        <Badge text={c.price > 0 ? `AED ${c.price.toLocaleString()}` : 'FREE'} type="accent" />
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => {
                    Alert.alert('Manage Course', c.title, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete Course', style: 'destructive', onPress: async () => {
                            try {
                                await apiDeleteCourse(c.id);
                                showToast('🗑️ Course deleted');
                                load();
                            } catch(e) { showToast('❌ Failed'); }
                        }}
                    ]);
                  }}>
                    <Text style={{ fontSize: 20 }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

        {tab === 'payments' && (
          <View>
            <SectionHeader title="Transaction History" />
            {payments.map(p => (
              <Card key={p.id} onPress={() => { setSelPay(p); setShowPayDetail(true); }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={s.userName}>{p.student_name}</Text>
                    <Text style={s.userEmail}>{p.course_title}</Text>
                    <Text style={s.dateText}>{new Date(p.paid_at).toLocaleDateString('en-GB')}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.amountText}>AED {p.amount.toLocaleString()}</Text>
                    <Badge text={p.status} type={p.status === 'completed' ? 'success' : 'danger'} />
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      <Sheet visible={showPayDetail} onClose={() => setShowPayDetail(false)} title="Transaction Details">
        {selPay && (
          <View style={{ padding: 4 }}>
            <Card style={{ backgroundColor: COLORS.bg, borderBottomWidth: 0 }}>
              <Text style={s.detailLabel}>Transaction ID</Text>
              <Text style={s.detailValue}>{selPay.transaction_id}</Text>

              <Text style={[s.detailLabel, { marginTop: 16 }]}>Payment Method</Text>
              <Text style={s.detailValue}>•••• {selPay.card_last4} ({selPay.card_holder})</Text>
            </Card>

            <Btn label="Issue Refund" color={COLORS.danger} outline onPress={() => processRefund(selPay.id)} />
          </View>
        )}
      </Sheet>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  adminHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.l, paddingTop: SPACING.m },
  adminLabel: { fontSize: 13, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1 },
  adminTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginTop: 4 },
  notifCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  tabBar: { flexDirection: 'row', paddingHorizontal: SPACING.l, gap: 8, marginBottom: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
  tabText: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },
  tabTextActive: { color: '#fff' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: SPACING.l },
  revenueCard: { backgroundColor: '#1E293B', borderBottomWidth: 0, padding: 24 },
  revRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  revLabel: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '600', textTransform: 'uppercase' },
  revValue: { fontSize: 32, fontWeight: '900', color: '#fff', marginTop: 4 },
  revBadge: { backgroundColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  revBadgeText: { color: COLORS.success, fontWeight: '800', fontSize: 12 },
  revFooter: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', justifyContent: 'space-between' },
  revSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, paddingHorizontal: 4 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: COLORS.primary, fontWeight: '800', fontSize: 16 },
  activityName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  activityEmail: { fontSize: 13, color: COLORS.textLight },
  userName: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  userEmail: { fontSize: 14, color: COLORS.textMuted, marginBottom: 4 },
  dateText: { fontSize: 12, color: COLORS.textLight, fontWeight: '600' },
  amountText: { fontSize: 18, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
  detailLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textLight, textTransform: 'uppercase', marginBottom: 4 },
  detailValue: { fontSize: 15, fontWeight: '700', color: COLORS.text },
});
