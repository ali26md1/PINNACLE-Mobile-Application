import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, RefreshControl, TextInput, Linking, Image, SafeAreaView, StatusBar, Dimensions
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiGetEnrollments, apiGetPayments, apiPayCourse, apiStudentAnalytics, apiGetAttendance } from '../services/api';
import { COLORS, SPACING, Card, Btn, StatCard, Empty, Sheet, Toast, Loader, Input, Badge, SectionHeader } from '../components/UI';
import { AppHeader } from '../components/AppHeader';
import { ALL_COURSES_FLAT, CATEGORIES } from '../data/courses';

const { width } = Dimensions.get('window');

/* ── Academic Payment Portal ────────────────────────────────────────────── */
const PaymentSheet = ({ course, visible, onClose, onSuccess }) => {
  const [form, setForm] = useState({ card_number: '', card_holder: '', expiry: '', cvv: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fmt = {
    card_number: v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim(),
    expiry: v => v.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2'),
    cvv: v => v.replace(/\D/g, '').slice(0, 4),
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: fmt[k] ? fmt[k](v) : v }));

  const pay = async () => {
    setError('');
    const raw = form.card_number.replace(/\s/g, '');
    if (raw.length < 13) { setError('Invalid card format'); return; }
    if (!form.card_holder.trim()) { setError('Cardholder name required'); return; }
    setLoading(true);
    try {
      const res = await apiPayCourse({
        course_id: course.id, card_number: raw, card_holder: form.card_holder,
        expiry: form.expiry, cvv: form.cvv, amount: course.price
      });
      onSuccess(res);
    } catch (e) {
      setError(e?.response?.data?.detail || 'Transaction declined');
    } finally {
      setLoading(false);
    }
  };

  if (!course) return null;

  return (
    <Sheet visible={visible} onClose={onClose} title="Secure Enrollment Portal">
      <View style={ps.header}>
        <Text style={ps.sub}>OFFICIAL ENROLLMENT</Text>
        <Text style={ps.title}>{course.title}</Text>
        <View style={ps.divider} />
        <View style={ps.priceRow}>
          <Text style={ps.priceLabel}>Tuition Fees</Text>
          <Text style={ps.priceValue}>AED {Number(course.price).toLocaleString()}</Text>
        </View>
      </View>

      {!!error && <View style={ps.error}><Text style={ps.errorText}>{error}</Text></View>}

      <Input label="Card Number" value={form.card_number} onChangeText={v => set('card_number', v)} keyboardType="numeric" placeholder="0000 0000 0000 0000" />
      <Input label="Cardholder Name" value={form.card_holder} onChangeText={v => set('card_holder', v)} placeholder="As printed on card" autoCapitalize="characters" />
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <View style={{ flex: 1 }}><Input label="Expiry" value={form.expiry} onChangeText={v => set('expiry', v)} keyboardType="numeric" placeholder="MM/YY" /></View>
        <View style={{ flex: 1 }}><Input label="CVV" value={form.cvv} onChangeText={v => set('cvv', v)} keyboardType="numeric" secureTextEntry placeholder="•••" /></View>
      </View>

      <Btn label="Authorize Enrollment" onPress={pay} loading={loading} color={COLORS.oxford} style={{ marginTop: 10 }} />
      <Text style={ps.footerNote}>Verified by PINNACLE Security Systems</Text>
    </Sheet>
  );
};

const ps = StyleSheet.create({
  header: { paddingVertical: 10, marginBottom: 20 },
  sub: { fontSize: 11, fontWeight: '800', color: COLORS.textLight, letterSpacing: 1.5 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.oxford, marginTop: 4 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 15, color: COLORS.textMuted, fontWeight: '600' },
  priceValue: { fontSize: 22, color: COLORS.oxford, fontWeight: '900' },
  error: { backgroundColor: '#FFF5F5', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#FED7D7' },
  errorText: { color: COLORS.danger, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  footerNote: { fontSize: 11, color: COLORS.textLight, textAlign: 'center', marginTop: 16, fontWeight: '600' },
});

/* ── Academic Home ───────────────────────────────────────────────────────── */
export default function StudentHomeScreen() {
  const { user } = useAuth();
  const [enrolled,   setEnrolled]   = useState([]);
  const [payments,   setPayments]   = useState([]);
  const [analytics,  setAnalytics]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab,        setTab]        = useState('home');
  const [selCat,     setSelCat]     = useState(null);
  const [search,     setSearch]     = useState('');
  const [paySheet,   setPaySheet]   = useState(null);
  const [attendance, setAttendance] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [enrR, pR, aR, attR] = await Promise.all([
        apiGetEnrollments(),
        apiGetPayments(),
        apiStudentAnalytics(user.id),
        apiGetAttendance({ student_id: user.id })
      ]);
      setEnrolled(enrR); setPayments(pR); setAnalytics(aR); setAttendance(attR);
    } catch(e){ console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [user.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const browseCourses = ALL_COURSES_FLAT.filter(c => {
    const q = search.toLowerCase();
    return (!q || c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
        && (!selCat || c.category === selCat);
  });

  const handleCoursePress = (course) => {
    if (enrolled.some(e => e.course_id === course.id)) {
      Alert.alert('Academic Info', 'You are already enrolled in this program.', [
        { text: 'Go to Study Portal', onPress: () => setTab('enrolled') },
        { text: 'Dismiss' }
      ]);
      return;
    }

    if (course.price > 0) {
      setPaySheet(course);
    } else {
      Alert.alert('Complimentary Enrollment', `Enroll in ${course.title} for free?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Enroll Now', onPress: async () => {
          setLoading(true);
          try {
            await apiEnrollFree(course.id);
            fetchData();
            Alert.alert('Success', 'Academic enrollment successful.');
          } catch (e) {
            Alert.alert('Enrollment Error', e?.response?.data?.detail || 'Process failed');
          } finally {
            setLoading(false);
          }
        }},
      ]);
    }
  };

  if (loading) return <Loader message="Authenticating Academic Profile..." />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="dark-content" />
      <AppHeader />

      {paySheet && <PaymentSheet course={paySheet} visible={!!paySheet} onClose={() => setPaySheet(null)} onSuccess={() => { setPaySheet(null); fetchData(); }} />}

      {/* Institutional Navigation */}
      <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING.l }}
        >
          {[['home', 'Dashboard'], ['browse', 'Course Catalog'], ['enrolled', 'My Studies'], ['attendance', 'Attendance']].map(([id, label]) => (
            <TouchableOpacity key={id} onPress={() => setTab(id)} style={[s.navItem, tab === id && s.navItemActive]}>
              <Text style={[s.navText, tab === id && s.navTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* DASHBOARD TAB */}
        {tab === 'home' && (
          <View style={{ padding: SPACING.l }}>
            <View style={s.heroAcademic}>
              <Text style={s.heroPre}>ACADEMIC PORTAL</Text>
              <Text style={s.heroName}>Welcome, {user.name}</Text>
              <Text style={s.heroDate}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
            </View>

            <View style={s.statRow}>
              <StatCard label="Enrollments" value={analytics?.enrollments || 0} icon="📖" color={COLORS.oxford} />
              <StatCard label="Course Credits" value={(analytics?.enrollments || 0) * 4} icon="🎓" color={COLORS.harvard} subValue="+12%" />
            </View>

            <SectionHeader title="Institutional Departments" action="View All Catalog" onAction={() => setTab('browse')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.deptScroll}>
              {CATEGORIES.slice(0, 6).map(cat => (
                <TouchableOpacity key={cat.name} style={s.deptCard} onPress={() => { setSelCat(cat.name); setTab('browse'); }}>
                  <Text style={s.deptIcon}>{cat.icon}</Text>
                  <Text style={s.deptName}>{cat.name}</Text>
                  <View style={s.deptBadge}><Text style={s.deptBadgeText}>{cat.count}</Text></View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <SectionHeader title="Featured Programs" />
            {ALL_COURSES_FLAT.slice(0, 3).map(c => (
              <Card key={c.title} onPress={() => handleCoursePress(c)} style={s.progCard}>
                <View style={s.progHeader}>
                  <Text style={s.progCat}>{c.category}</Text>
                  <Text style={s.progPrice}>{c.price > 0 ? `AED ${c.price.toLocaleString()}` : 'FREE'}</Text>
                </View>
                <Text style={s.progTitle}>{c.title}</Text>
                <View style={s.progMeta}>
                  <Badge text={c.level} type="primary" />
                  <Text style={s.progDur}>• {c.duration} Curriculum</Text>
                </View>
              </Card>
            ))}

            <Card style={s.scholarshipCard}>
              <Text style={s.scholTitle}>Academic Advisory</Text>
              <Text style={s.scholSub}>Schedule a 1-on-1 session with our program directors for career mapping.</Text>
              <Btn label="Contact Advisor" color="#fff" textColor={COLORS.oxford} small style={{ width: 160, marginTop: 12 }} />
            </Card>
          </View>
        )}

        {/* CATALOG TAB */}
        {tab === 'browse' && (
          <View style={{ padding: SPACING.l }}>
            <View style={s.searchAcademic}>
              <TextInput
                value={search} onChangeText={setSearch}
                placeholder="Search Programs & Research Areas..."
                style={s.searchIn} placeholderTextColor={COLORS.textLight}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
              <TouchableOpacity onPress={() => setSelCat(null)} style={[s.filter, !selCat && s.filterActive]}>
                <Text style={[s.filterTxt, !selCat && s.filterTxtActive]}>All Disciplines</Text>
              </TouchableOpacity>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c.name} onPress={() => setSelCat(c.name)} style={[s.filter, selCat === c.name && s.filterActive]}>
                  <Text style={[s.filterTxt, selCat === c.name && s.filterTxtActive]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {browseCourses.map(c => (
              <Card key={c.title} onPress={() => handleCoursePress(c)} style={s.catalogCard}>
                <Text style={s.catalogCat}>{c.category}</Text>
                <Text style={s.catalogTitle}>{c.title}</Text>
                <Text style={s.catalogDesc} numberOfLines={2}>{c.description}</Text>
                <View style={s.catalogFooter}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Badge text={c.level} type="primary" />
                    <Badge text={c.duration} type="accent" />
                  </View>
                  <Text style={s.catalogPrice}>{c.price > 0 ? `AED ${c.price.toLocaleString()}` : 'FREE'}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* MY STUDIES TAB */}
        {tab === 'enrolled' && (
          <View style={{ padding: SPACING.l }}>
            <SectionHeader title="Academic Transcript" />
            {enrolled.length === 0 ? (
              <Empty emoji="🏛️" message="No active research" sub="Explore our Course Catalog to begin your academic journey." />
            ) : (
              enrolled.map(e => (
                <Card key={e.id} style={s.studyCard}>
                  <View style={s.studyHeader}>
                    <Badge text="ACTIVE RESEARCH" type="success" />
                    <Text style={s.studyId}>ID: #P-{e.id}00</Text>
                  </View>
                  <Text style={s.studyTitle}>{e.course?.title}</Text>
                  <View style={s.studyFooter}>
                    <Text style={s.studyMeta}>Instructor: {e.course?.teacher_name || 'Department Faculty'}</Text>
                    <TouchableOpacity><Text style={s.studyLink}>Course Portal →</Text></TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        {/* ATTENDANCE TAB */}
        {tab === 'attendance' && (
          <View style={{ padding: SPACING.l }}>
            <SectionHeader title="Attendance Record" />
            {attendance.length === 0 ? (
              <Empty emoji="📅" message="No attendance data yet" sub="Attendance is updated daily by your course faculty." />
            ) : (
              attendance.map(a => {
                const course = enrolled.find(e => e.course_id === a.course_id)?.course;
                return (
                  <Card key={a.id} style={{ padding: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.progTitle}>{course?.title || 'Course'}</Text>
                        <Text style={s.meta}>{new Date(a.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                      </View>
                      <Badge
                        text={a.status.toUpperCase()}
                        color={a.status === 'present' ? COLORS.success : COLORS.danger}
                      />
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  nav: { flexDirection: 'row', paddingHorizontal: SPACING.l, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: '#fff' },
  navItem: { paddingVertical: 18, paddingHorizontal: 4, marginRight: 24, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  navItemActive: { borderBottomColor: COLORS.oxford },
  navText: { fontSize: 14, fontWeight: '700', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.8 },
  navTextActive: { color: COLORS.oxford },

  heroAcademic: { marginBottom: SPACING.xl, paddingTop: 10 },
  heroPre: { fontSize: 11, fontWeight: '800', color: COLORS.harvard, letterSpacing: 2, marginBottom: 8 },
  heroName: { fontSize: 26, fontWeight: '800', color: COLORS.oxford, marginBottom: 4 },
  heroDate: { fontSize: 14, color: COLORS.textLight, fontWeight: '600' },

  statRow: { flexDirection: 'row', gap: 16, marginBottom: SPACING.xl },

  deptScroll: { marginBottom: SPACING.xl, marginLeft: -5 },
  deptCard: { width: 120, height: 140, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginRight: 12, borderWidth: 1, borderColor: '#EEF2F6', alignItems: 'center', justifyContent: 'center' },
  deptIcon: { fontSize: 32, marginBottom: 10 },
  deptName: { fontSize: 12, fontWeight: '800', color: COLORS.oxford, textAlign: 'center', lineHeight: 16 },
  deptBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: COLORS.bg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  deptBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted },

  progCard: { borderLeftWidth: 4, borderLeftColor: COLORS.oxford },
  progHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progCat: { fontSize: 11, fontWeight: '800', color: COLORS.textLight, textTransform: 'uppercase' },
  progPrice: { fontSize: 14, fontWeight: '800', color: COLORS.oxford },
  progTitle: { fontSize: 17, fontWeight: '800', color: COLORS.oxford, marginBottom: 12 },
  progMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progDur: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },

  scholarshipCard: { backgroundColor: COLORS.oxford, padding: 24, borderBottomWidth: 0 },
  scholTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  scholSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 20 },

  searchAcademic: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 16, marginBottom: 20 },
  searchIn: { height: 54, fontSize: 15, fontWeight: '600', color: COLORS.oxford },

  filter: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, marginRight: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border },
  filterActive: { backgroundColor: COLORS.oxford, borderColor: COLORS.oxford },
  filterTxt: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  filterTxtActive: { color: '#fff' },

  catalogCard: { padding: 24 },
  catalogCat: { fontSize: 11, fontWeight: '800', color: COLORS.harvard, textTransform: 'uppercase', marginBottom: 6 },
  catalogTitle: { fontSize: 19, fontWeight: '800', color: COLORS.oxford, marginBottom: 10 },
  catalogDesc: { fontSize: 14, color: COLORS.textMuted, lineHeight: 22, marginBottom: 20 },
  catalogFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 },
  catalogPrice: { fontSize: 18, fontWeight: '900', color: COLORS.oxford },

  studyCard: { padding: 20 },
  studyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  studyId: { fontSize: 11, fontWeight: '700', color: COLORS.textLight },
  studyTitle: { fontSize: 17, fontWeight: '800', color: COLORS.oxford, marginBottom: 16 },
  studyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  studyMeta: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  studyLink: { fontSize: 13, color: COLORS.oxford, fontWeight: '800' },
});
