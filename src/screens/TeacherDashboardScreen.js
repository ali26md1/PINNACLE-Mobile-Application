import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Alert, Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
  apiGetCourses, apiCreateCourse, apiDeleteCourse,
  apiGetAssignments, apiCreateAssignment, apiGetSubmissions, apiGradeSubmission,
  apiGetPayments, apiSendNotification, apiGetUsers, apiMarkBulkAttendance, apiGetAttendance,
} from '../services/api';
import { COLORS, Card, Badge, Btn, Sheet, Input, Empty, Loader, Toast, StatCard } from '../components/UI';
import { AppHeader } from '../components/AppHeader';

const LEVELS = ['Beginner','Intermediate','Advanced'];
const LEVEL_COLOR = { Beginner: COLORS.success, Intermediate: COLORS.warning, Advanced: COLORS.danger };

export default function TeacherDashboardScreen() {
  const { user } = useAuth();
  const [courses,     setCourses]     = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [payments,    setPayments]    = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [tab,         setTab]         = useState('courses');
  const [toast,       setToast]       = useState('');

  // sheets
  const [showCourse, setShowCourse] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showSubs,   setShowSubs]   = useState(false);
  const [showNotif,  setShowNotif]  = useState(false);
  const [showAtten,  setShowAtten]  = useState(false);
  const [selAssign,  setSelAssign]  = useState(null);
  const [selCourse,  setSelCourse]  = useState(null);

  // forms
  const [cf, setCf] = useState({ title:'', description:'', duration:'', level:'Beginner', price:'0' });
  const [af, setAf] = useState({ title:'', description:'', course_id:'', due_date:'' });
  const [nf, setNf] = useState({ title:'', message:'' });
  const [grades, setGrades] = useState({});
  const [attenData, setAttenData] = useState({}); // { student_id: 'present'|'absent' }
  const [students, setStudents] = useState([]);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    try {
      const [cR, aR, pR, uR] = await Promise.all([
        apiGetCourses(), apiGetAssignments(), apiGetPayments(), apiGetUsers(),
      ]);
      setCourses(cR.filter(c => c.teacher_id === user.id));
      setAssignments(aR);
      setPayments(pR);
      setStudents(uR.filter(u => u.role === 'student'));
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  const createCourse = async () => {
    if (!cf.title || !cf.description || !cf.duration) { showToast('❌ Fill all fields'); return; }
    try {
      await apiCreateCourse({ ...cf, teacher_id: user.id, price: parseFloat(cf.price) || 0 });
      setCf({ title:'', description:'', duration:'', level:'Beginner', price:'0' });
      setShowCourse(false); showToast('✅ Course created!'); load();
    } catch (e) { showToast('❌ ' + (e?.response?.data?.detail || 'Failed')); }
  };

  const deleteCourse = (id, title) => {
    Alert.alert('Delete Course', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await apiDeleteCourse(id); showToast('🗑️ Deleted'); load();
      }},
    ]);
  };

  const createAssignment = async () => {
    if (!af.title || !af.description || !af.course_id) { showToast('❌ Fill all fields'); return; }
    try {
      await apiCreateAssignment(af);
      setAf({ title:'', description:'', course_id:'', due_date:'' });
      setShowAssign(false); showToast('✅ Assignment created!'); load();
    } catch (e) { showToast('❌ ' + (e?.response?.data?.detail || 'Failed')); }
  };

  const loadSubs = async (assign) => {
    setSelAssign(assign);
    try { setSubmissions(await apiGetSubmissions(assign.id)); }
    catch (e) { console.error(e); }
    setShowSubs(true);
  };

  const grade = async (subId) => {
    const d = grades[subId];
    if (!d?.score) { showToast('❌ Enter a score'); return; }
    try {
      await apiGradeSubmission(subId, parseFloat(d.score), d.feedback || '');
      showToast('✅ Graded!');
      loadSubs(selAssign);
    } catch (e) { showToast('❌ ' + (e?.response?.data?.detail || 'Failed')); }
  };

  const sendNotif = async () => {
    if (!nf.title || !nf.message) { showToast('❌ Fill all fields'); return; }
    try {
      await apiSendNotification(nf.title, nf.message);
      setNf({ title:'', message:'' }); setShowNotif(false); showToast('✅ Sent!');
    } catch (e) { showToast('❌ Failed'); }
  };

  const openAttendance = async (course) => {
    setSelCourse(course);
    setAttenData({});
    try {
        const date = new Date().toISOString().split('T')[0];
        const existing = await apiGetAttendance({ course_id: course.id, date });
        const map = {};
        existing.forEach(a => map[a.student_id] = a.status);
        setAttenData(map);
    } catch(e) { console.error(e); }
    setShowAtten(true);
  };

  const submitAttendance = async () => {
    if (!selCourse) return;
    const date = new Date().toISOString().split('T')[0];
    const records = Object.entries(attenData).map(([student_id, status]) => ({ student_id, status }));
    if (records.length === 0) { showToast('❌ Mark at least one student'); return; }

    try {
      await apiMarkBulkAttendance({ course_id: selCourse.id, date, records });
      showToast('✅ Attendance Saved!');
      setShowAtten(false);
    } catch (e) { showToast('❌ Failed'); }
  };

  const totalStudents = courses.reduce((s,c) => s + (c.enrolled_count||0), 0);
  const totalRevenue  = payments.filter(p => p.status==='completed').reduce((s,p) => s+(p.amount||0), 0);

  const TABS = [
    { id:'courses',     label:'Courses' },
    { id:'assignments', label:'Assignments' },
    { id:'payments',    label:'Payments' },
  ];

  if (loading) return <Loader message="Loading…" />;

  return (
    <View style={{ flex:1, backgroundColor: COLORS.bg }}>
      <AppHeader />
      <Toast message={toast} />

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[COLORS.primary]} />}
        contentContainerStyle={{ padding:16, paddingBottom:100 }}
      >
        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroTop}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={s.heroPre}>FACULTY PORTAL</Text>
              <Text style={s.heroTitle} numberOfLines={1} adjustsFontSizeToFit>Welcome, {user.name.split(' ')[0]}</Text>
              <Text style={s.heroSub}>Academic Session 2024/25</Text>
            </View>
            <TouchableOpacity onPress={() => setShowNotif(true)} style={s.notifBtn}>
              <Text style={{ color:'#fff', fontSize:11, fontWeight:'800', textTransform:'uppercase' }}>📢 Broadcast</Text>
            </TouchableOpacity>
          </View>
          <View style={s.statsGrid}>
            <View style={s.miniStat}>
              <Text style={s.miniVal}>{courses.length}</Text>
              <Text style={s.miniLab}>Courses</Text>
            </View>
            <View style={s.miniStat}>
              <Text style={s.miniVal}>{totalStudents}</Text>
              <Text style={s.miniLab}>Enrolled</Text>
            </View>
            <View style={s.miniStat}>
              <Text style={s.miniVal}>{assignments.length}</Text>
              <Text style={s.miniLab}>Assigned</Text>
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={s.actionRow}>
          <Btn label="+ New Course"     onPress={() => setShowCourse(true)} small style={{ flex:1 }} />
          <Btn label="+ Assignment"     onPress={() => setShowAssign(true)} small color={COLORS.secondary} style={{ flex:1 }} />
        </View>

        {/* Tabs */}
        <View style={s.tabRow}>
          {TABS.map(t => (
            <TouchableOpacity key={t.id} onPress={() => setTab(t.id)} style={[s.tabBtn, tab===t.id && s.tabActive]}>
              <Text style={[s.tabText, tab===t.id && s.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Courses Tab */}
        {tab === 'courses' && (
          courses.length === 0
            ? <Empty emoji="📚" message="No courses yet. Create your first!" />
            : courses.map(c => (
                <Card key={c.id}>
                  <View style={s.courseRow}>
                    <View style={{ flex:1 }}>
                      <Text style={s.courseTitle}>{c.title}</Text>
                      <Text style={s.courseDesc} numberOfLines={2}>{c.description}</Text>
                      <View style={s.metaRow}>
                        <Badge text={c.level} color={LEVEL_COLOR[c.level]||COLORS.primary} />
                        <Badge text={c.price > 0 ? `AED ${c.price.toLocaleString()}` : 'FREE'} type="accent" />
                        <Text style={s.meta}>👥 {c.enrolled_count||0}</Text>
                        <Text style={s.meta}>⏱ {c.duration}</Text>
                      </View>
                      <Text style={s.revenue}>
                        💰 Course Revenue: AED {payments.filter(p=>p.course_id===c.id&&p.status==='completed').reduce((sum,p)=>sum+(p.amount||0),0).toLocaleString()}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                        <Btn label="Attendance" onPress={() => openAttendance(c)} small color={COLORS.secondary} />
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => deleteCourse(c.id, c.title)} style={s.deleteBtn}>
                      <Text style={s.deleteText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
        )}

        {/* Assignments Tab */}
        {tab === 'assignments' && (
          assignments.length === 0
            ? <Empty emoji="📝" message="No assignments yet" />
            : assignments.map(a => {
                const course = courses.find(c => c.id===a.course_id);
                return (
                  <Card key={a.id}>
                    <Text style={s.courseTitle}>{a.title}</Text>
                    <Text style={s.courseDesc}>{a.description}</Text>
                    {course && <Text style={s.meta}>📚 {course.title}</Text>}
                    {a.due_date && <Text style={[s.meta,{color:COLORS.warning}]}>📅 Due {new Date(a.due_date).toLocaleDateString('en-GB')}</Text>}
                    <Btn label="View Submissions" onPress={() => loadSubs(a)} small
                      color={COLORS.secondary} style={{ marginTop:10 }} />
                  </Card>
                );
              })
        )}

        {/* Payments Tab */}
        {tab === 'payments' && (
          payments.length === 0
            ? <Empty emoji="💳" message="No payments yet" />
            : payments.map(p => (
                <Card key={p.id}>
                  <View style={s.payRow}>
                    <View style={{ flex:1 }}>
                      <Text style={s.courseTitle}>{p.student_name}</Text>
                      <Text style={s.courseDesc}>{p.course_title}</Text>
                      <Text style={s.meta}>Txn: {p.transaction_id}</Text>
                      <Text style={s.meta}>{new Date(p.paid_at).toLocaleDateString('en-GB')}</Text>
                    </View>
                    <View style={{ alignItems:'flex-end' }}>
                      <Text style={s.payAmount}>AED {p.amount?.toLocaleString()}</Text>
                      <Badge text={p.status} color={p.status==='completed'?COLORS.success:COLORS.danger} />
                    </View>
                  </View>
                </Card>
              ))
        )}
      </ScrollView>

      {/* Create Course Sheet */}
      <Sheet visible={showCourse} onClose={() => setShowCourse(false)} title="Create New Course">
        <Input label="Title"       value={cf.title}       onChangeText={v=>setCf(f=>({...f,title:v}))}       placeholder="e.g. Python Fundamentals" />
        <Input label="Description" value={cf.description} onChangeText={v=>setCf(f=>({...f,description:v}))} placeholder="Brief description…" multiline />
        <Input label="Duration"    value={cf.duration}    onChangeText={v=>setCf(f=>({...f,duration:v}))}    placeholder="e.g. 8 weeks" />
        <Input label="Price (AED) — 0 for free" value={cf.price} onChangeText={v=>setCf(f=>({...f,price:v}))} keyboardType="numeric" placeholder="0" />
        <Text style={s.inputLabel}>Level</Text>
        <View style={s.levelRow}>
          {LEVELS.map(l => (
            <TouchableOpacity key={l} onPress={() => setCf(f=>({...f,level:l}))}
              style={[s.levelBtn, cf.level===l && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
              <Text style={[s.levelText, cf.level===l && { color:'#fff' }]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Btn label="Create Course" onPress={createCourse} style={{ marginTop:16 }} />
      </Sheet>

      {/* Create Assignment Sheet */}
      <Sheet visible={showAssign} onClose={() => setShowAssign(false)} title="Create Assignment">
        <Text style={s.inputLabel}>Course</Text>
        <View style={s.levelRow}>
          {courses.map(c => (
            <TouchableOpacity key={c.id} onPress={() => setAf(f=>({...f,course_id:c.id}))}
              style={[s.levelBtn, af.course_id===c.id && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
              <Text style={[s.levelText, af.course_id===c.id && { color:'#fff' }]} numberOfLines={1}>{c.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Input label="Title"        value={af.title}       onChangeText={v=>setAf(f=>({...f,title:v}))}       placeholder="Assignment title" />
        <Input label="Instructions" value={af.description} onChangeText={v=>setAf(f=>({...f,description:v}))} placeholder="Describe the task…" multiline />
        <Input label="Due Date (optional)" value={af.due_date} onChangeText={v=>setAf(f=>({...f,due_date:v}))} placeholder="YYYY-MM-DD" />
        <Btn label="Create Assignment" onPress={createAssignment} style={{ marginTop:8 }} />
      </Sheet>

      {/* Submissions Sheet */}
      <Sheet visible={showSubs} onClose={() => setShowSubs(false)} title={`Submissions — ${selAssign?.title || ''}`}>
        {submissions.length === 0
          ? <Empty emoji="📭" message="No submissions yet" />
          : submissions.map(sub => (
              <Card key={sub.id} style={{ marginBottom:12 }}>
                <Text style={s.courseTitle}>{sub.student_name}</Text>
                <Text style={s.courseDesc}>{sub.content}</Text>
                <Text style={s.meta}>{new Date(sub.submitted_at).toLocaleString('en-GB')}</Text>
                {sub.graded
                  ? <Badge text={`Graded: ${sub.grade}/100`} color={COLORS.success} />
                  : (
                    <View style={{ marginTop:10, gap:8 }}>
                      <Input label="Score (0-100)" value={grades[sub.id]?.score||''}
                        onChangeText={v=>setGrades(g=>({...g,[sub.id]:{...g[sub.id],score:v}}))}
                        keyboardType="numeric" placeholder="Score" />
                      <Input label="Feedback (optional)" value={grades[sub.id]?.feedback||''}
                        onChangeText={v=>setGrades(g=>({...g,[sub.id]:{...g[sub.id],feedback:v}}))}
                        placeholder="Optional feedback" />
                      <Btn label="Grade" onPress={() => grade(sub.id)} small color={COLORS.success} />
                    </View>
                  )
                }
                {sub.graded && sub.feedback && <Text style={s.feedback}>💬 {sub.feedback}</Text>}
              </Card>
            ))
        }
      </Sheet>

      {/* Notification Sheet */}
      <Sheet visible={showNotif} onClose={() => setShowNotif(false)} title="📢 Notify All Students">
        <Input label="Title"   value={nf.title}   onChangeText={v=>setNf(f=>({...f,title:v}))}   placeholder="Notification title" />
        <Input label="Message" value={nf.message} onChangeText={v=>setNf(f=>({...f,message:v}))} placeholder="Your message…" multiline />
        <Btn label="Send to All Students" onPress={sendNotif} style={{ marginTop:8 }} />
      </Sheet>

      {/* Attendance Sheet */}
      <Sheet visible={showAtten} onClose={() => setShowAtten(false)} title={`Attendance - ${selCourse?.title}`}>
        <Text style={s.meta}>Date: {new Date().toLocaleDateString('en-GB')}</Text>
        <ScrollView style={{ maxHeight: 400, marginTop: 10 }}>
            {students.length === 0 ? <Empty message="No students found" /> :
             students.map(st => (
                <View key={st.id} style={s.attenRow}>
                    <Text style={{ flex:1, fontWeight:'600' }}>{st.name}</Text>
                    <View style={{ flexDirection:'row', gap: 8 }}>
                        <TouchableOpacity
                            onPress={() => setAttenData(d => ({...d, [st.id]: 'present'}))}
                            style={[s.attenBtn, attenData[st.id] === 'present' && { backgroundColor: COLORS.success }]}>
                            <Text style={[s.attenBtnText, attenData[st.id] === 'present' && { color: '#fff' }]}>P</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setAttenData(d => ({...d, [st.id]: 'absent'}))}
                            style={[s.attenBtn, attenData[st.id] === 'absent' && { backgroundColor: COLORS.danger }]}>
                            <Text style={[s.attenBtnText, attenData[st.id] === 'absent' && { color: '#fff' }]}>A</Text>
                        </TouchableOpacity>
                    </View>
                </View>
             ))
            }
        </ScrollView>
        <Btn label="Save Attendance" onPress={submitAttendance} style={{ marginTop: 16 }} />
      </Sheet>
    </View>
  );
}

const s = StyleSheet.create({
  hero:        { backgroundColor: COLORS.oxford, borderRadius:20, padding:20, marginBottom:20 },
  heroPre:     { fontSize: 10, fontWeight: '800', color: COLORS.accent, letterSpacing: 1.5, marginBottom: 4 },
  heroTitle:   { fontSize:24, fontWeight:'800', color:'#fff' },
  heroSub:     { fontSize:13, color:'rgba(255,255,255,0.6)', marginTop:2 },
  heroTop:     { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 },
  notifBtn:    { backgroundColor: COLORS.harvard, borderRadius:8, paddingHorizontal:12, paddingVertical:8 },
  statsGrid:   { flexDirection:'row', justifyContent:'space-between', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  miniStat:    { alignItems: 'center', flex: 1 },
  miniVal:     { fontSize: 20, fontWeight: '800', color: '#fff' },
  miniLab:     { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginTop: 2 },
  actionRow:   { flexDirection:'row', gap:10, marginBottom:20 },
  tabRow:      { flexDirection:'row', backgroundColor:'#fff', borderRadius:14, padding:4, marginBottom:20, borderWidth: 1, borderColor: COLORS.border },
  tabBtn:      { flex:1, paddingVertical:10, borderRadius:11, alignItems:'center' },
  tabActive:   { backgroundColor: COLORS.oxford },
  tabText:     { fontSize:13, fontWeight:'700', color: COLORS.textMuted },
  tabTextActive:{ color:'#fff' },
  courseRow:   { flexDirection:'row', gap:10 },
  courseTitle: { fontSize:17, fontWeight:'800', color: COLORS.oxford, marginBottom:4 },
  courseDesc:  { fontSize:13, color: COLORS.textMuted, marginBottom:10, lineHeight: 18 },
  metaRow:     { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:8, alignItems:'center' },
  meta:        { fontSize:12, color: COLORS.textMuted, fontWeight: '600' },
  revenue:     { fontSize:13, color: COLORS.oxford, fontWeight:'700', marginTop:8 },
  deleteBtn:   { padding:8 },
  deleteText:  { fontSize:20 },
  payRow:      { flexDirection:'row', gap:10, alignItems:'center' },
  payAmount:   { fontSize:18, fontWeight:'900', color: COLORS.oxford, marginBottom:4 },
  attenRow:    { flexDirection: 'row', alignItems:'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  attenBtn:    { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  attenBtnText:{ fontWeight: '800', color: COLORS.textMuted },
  inputLabel:  { fontSize:13, fontWeight:'700', color: COLORS.oxford, marginBottom:8, textTransform: 'uppercase' },
  levelRow:    { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:14 },
  levelBtn:    { borderWidth:1.5, borderColor: COLORS.border, borderRadius:12, paddingHorizontal:16, paddingVertical:10, backgroundColor: '#fff' },
  levelText:   { fontSize:13, fontWeight:'700', color: COLORS.text },
  feedback:    { fontSize:13, color: COLORS.textMuted, fontStyle:'italic', marginTop:8, padding: 10, backgroundColor: COLORS.bg, borderRadius: 8 },
});
