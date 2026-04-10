import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { apiGetNotifications, apiMarkRead } from '../services/api';
import { AppHeader } from '../components/AppHeader';
import { COLORS, Empty, Loader } from '../components/UI';

export default function NotificationsScreen() {
  const [notifs,     setNotifs]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setNotifs(await apiGetNotifications()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    await apiMarkRead(id);
    setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (loading) return <Loader message="Loading notifications…" />;

  return (
    <View style={{ flex:1, backgroundColor: COLORS.bg }}>
      <AppHeader />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[COLORS.primary]} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {notifs.length === 0
          ? <Empty emoji="🔔" message="No notifications yet" />
          : notifs.map(n => (
              <TouchableOpacity key={n.id} onPress={() => !n.read && markRead(n.id)}
                style={[s.card, !n.read && s.cardUnread]} activeOpacity={0.8}>
                <View style={s.row}>
                  <Text style={s.icon}>{n.read ? '📭' : '🔔'}</Text>
                  <View style={{ flex:1 }}>
                    <Text style={s.title}>{n.title}</Text>
                    <Text style={s.msg}>{n.message}</Text>
                    <Text style={s.time}>{new Date(n.created_at).toLocaleString('en-GB')}</Text>
                  </View>
                  {!n.read && <View style={s.dot} />}
                </View>
              </TouchableOpacity>
            ))
        }
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  card:      { backgroundColor:'#fff', borderRadius:16, padding:14, marginBottom:10, borderWidth:1, borderColor: COLORS.border },
  cardUnread:{ backgroundColor:'#EEF2FF', borderColor:'#A5B4FC' },
  row:       { flexDirection:'row', gap:12, alignItems:'flex-start' },
  icon:      { fontSize:22 },
  title:     { fontSize:14, fontWeight:'700', color: COLORS.text, marginBottom:3 },
  msg:       { fontSize:13, color: COLORS.textMuted, marginBottom:6 },
  time:      { fontSize:11, color: COLORS.textLight },
  dot:       { width:8, height:8, borderRadius:4, backgroundColor: COLORS.primary, marginTop:4 },
});
