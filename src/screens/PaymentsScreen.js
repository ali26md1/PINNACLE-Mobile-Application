import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Text, StyleSheet, RefreshControl } from 'react-native';
import { apiGetPayments } from '../services/api';
import { AppHeader } from '../components/AppHeader';
import { COLORS, Card, Badge, Empty, Loader, StatCard } from '../components/UI';

const STATUS_COLOR = { completed: COLORS.success, refunded: COLORS.danger, pending: COLORS.warning };
const STATUS_ICON  = { completed: '✅', refunded: '↩️', pending: '⏳' };

export default function PaymentsScreen() {
  const [payments,   setPayments]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiGetPayments();
      setPayments(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalPaid     = payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount||0), 0);
  const totalRefunded = payments.filter(p => p.status === 'refunded').reduce((s, p) => s + (p.amount||0), 0);

  if (loading) return <Loader message="Loading payments…" />;

  return (
    <View style={{ flex:1, backgroundColor: COLORS.bg }}>
      <AppHeader />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[COLORS.primary]} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Summary */}
        <View style={s.statsRow}>
          <StatCard icon="💰" label="Total Paid"    value={`AED ${totalPaid.toLocaleString()}`}     bg="#EDE9FE" textCol={COLORS.primary} />
          <StatCard icon="↩️" label="Refunded"      value={`AED ${totalRefunded.toLocaleString()}`} bg="#FEE2E2" textCol={COLORS.danger} />
        </View>

        <Text style={s.heading}>Payment History</Text>

        {payments.length === 0
          ? <Empty emoji="💳" message="No payments yet. Enroll in a paid course to get started!" />
          : payments.map(p => (
              <Card key={p.id} style={p.status === 'refunded' ? { opacity: 0.7 } : {}}>
                <View style={s.row}>
                  <Text style={s.statusIcon}>{STATUS_ICON[p.status] || '💳'}</Text>
                  <View style={{ flex:1 }}>
                    <View style={s.titleRow}>
                      <Text style={s.courseTitle} numberOfLines={1}>{p.course_title}</Text>
                      <Badge text={p.status.charAt(0).toUpperCase()+p.status.slice(1)} type={p.status === 'completed' ? 'success' : 'danger'} />
                    </View>
                    <Text style={[s.amount, p.status === 'refunded' && s.strikethrough]}>
                      AED {p.amount?.toLocaleString()}
                    </Text>
                    <Text style={s.meta}>Txn: <Text style={s.mono}>{p.transaction_id}</Text></Text>
                    <Text style={s.meta}>Card: •••• {p.card_last4}  ·  {new Date(p.paid_at).toLocaleDateString('en-GB')}</Text>
                    {p.status === 'refunded' && p.refunded_at && (
                      <Text style={[s.meta, { color: COLORS.danger }]}>
                        Refunded: {new Date(p.refunded_at).toLocaleDateString('en-GB')}
                      </Text>
                    )}
                  </View>
                </View>
              </Card>
            ))
        }
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  statsRow:     { flexDirection:'row', gap:8, marginBottom:16 },
  heading:      { fontSize:17, fontWeight:'700', color: COLORS.text, marginBottom:12 },
  row:          { flexDirection:'row', gap:12, alignItems:'flex-start' },
  statusIcon:   { fontSize:22, marginTop:2 },
  titleRow:     { flexDirection:'row', gap:8, alignItems:'center', marginBottom:4, flexWrap:'wrap' },
  courseTitle:  { fontSize:14, fontWeight:'700', color: COLORS.text, flex:1 },
  amount:       { fontSize:22, fontWeight:'900', color: COLORS.primary, marginBottom:4 },
  strikethrough:{ textDecorationLine:'line-through', color: COLORS.danger },
  meta:         { fontSize:12, color: COLORS.textMuted, marginTop:1 },
  mono:         { fontFamily: 'monospace', fontSize:11 },
});
