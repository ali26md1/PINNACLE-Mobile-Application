import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Text, StyleSheet, RefreshControl, Alert } from 'react-native';
import { apiGetAssignments, apiSubmitAssignment, apiGetEnrollments } from '../services/api';
import { AppHeader } from '../components/AppHeader';
import { COLORS, Card, Badge, Btn, Empty, Loader, Toast, Input } from '../components/UI';

export default function AssignmentsScreen() {
  const [assignments, setAssignments] = useState([]);
  const [enrolled,    setEnrolled]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [answers,     setAnswers]     = useState({});
  const [submitting,  setSubmitting]  = useState(null);
  const [toast,       setToast]       = useState('');

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    try {
      const [aR, eR] = await Promise.all([apiGetAssignments(), apiGetEnrollments()]);
      setAssignments(aR);
      setEnrolled(eR);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (id) => {
    const content = answers[id];
    if (!content?.trim()) { showToast('❌ Write your answer first'); return; }
    setSubmitting(id);
    try {
      await apiSubmitAssignment(id, content);
      showToast('✅ Assignment submitted!');
      setAnswers(p => ({ ...p, [id]: '' }));
      load();
    } catch (e) {
      showToast('❌ ' + (e?.response?.data?.detail || 'Submission failed'));
    } finally { setSubmitting(null); }
  };

  if (loading) return <Loader message="Loading assignments…" />;

  return (
    <View style={{ flex:1, backgroundColor: COLORS.bg }}>
      <AppHeader />
      <Toast message={toast} />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[COLORS.primary]} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {assignments.length === 0
          ? <Empty emoji="📝" message="No assignments yet. Enroll in courses to get started!" />
          : assignments.map(a => {
              const course = enrolled.find(e => e.course_id === a.course_id)?.course;
              return (
                <Card key={a.id}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={s.title}>{a.title}</Text>
                        {course && <Badge text={course.title} type="primary" style={{ marginBottom: 4 }} />}
                        <Text style={s.desc}>{a.description}</Text>
                    </View>
                  </View>
                  {a.due_date && (
                    <Text style={s.due}>📅 Due: {new Date(a.due_date).toLocaleDateString('en-GB')}</Text>
                  )}
                  <Input
                    label="Your Answer"
                    value={answers[a.id] || ''}
                    onChangeText={v => setAnswers(p => ({ ...p, [a.id]: v }))}
                    placeholder="Write your answer here…"
                    multiline
                  />
                  <Btn
                    label={submitting === a.id ? 'Submitting…' : 'Submit Assignment'}
                    onPress={() => submit(a.id)}
                    loading={submitting === a.id}
                    disabled={!answers[a.id]?.trim()}
                    color={COLORS.success}
                    small
                  />
                </Card>
              );
            })
        }
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  desc:  { fontSize: 13, color: COLORS.textMuted, marginBottom: 8 },
  due:   { fontSize: 12, color: COLORS.warning, fontWeight: '600', marginBottom: 10 },
});
