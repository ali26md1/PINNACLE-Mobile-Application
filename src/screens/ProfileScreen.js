import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, Card, Btn, InfoRow } from '../components/UI';
import { AppHeader } from '../components/AppHeader';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
    { text:'Cancel', style:'cancel' },
    { text:'Sign Out', style:'destructive', onPress: logout },
  ]);

  const ROLE_COLOR = { admin: COLORS.danger, teacher: COLORS.primary, student: COLORS.success };
  const ROLE_ICON  = { admin:'🔴', teacher:'🔵', student:'🟢' };

  const socials = [
    { label:'🌐 Website',   url:'https://pinnacleeducation.ae/' },
    { label:'📘 Facebook',  url:'https://www.facebook.com/pinnacledubai/' },
    { label:'📸 Instagram', url:'https://www.instagram.com/pinnacledubai/' },
    { label:'💼 LinkedIn',  url:'https://www.linkedin.com/company/pinnacle-dubai/' },
    { label:'▶️ YouTube',  url:'https://www.youtube.com/channel/UCHoFbOk7wPbQCVv-4te34Yg' },
  ];

  return (
    <View style={{ flex:1, backgroundColor: COLORS.bg }}>
      <AppHeader />
      <ScrollView contentContainerStyle={{ paddingBottom:100 }}>
        {/* Profile hero */}
        <View style={s.hero}>
          <View style={[s.avatar, { backgroundColor: ROLE_COLOR[user?.role]||COLORS.primary }]}>
            <Text style={s.avatarText}>{user?.name?.[0]?.toUpperCase()||'?'}</Text>
          </View>
          <Text style={s.name}>{user?.name}</Text>
          <Text style={s.email}>{user?.email}</Text>
          <View style={[s.rolePill, { backgroundColor: ROLE_COLOR[user?.role]+'22', borderColor: ROLE_COLOR[user?.role]+'55' }]}>
            <Text style={[s.roleText, { color: ROLE_COLOR[user?.role] }]}>
              {ROLE_ICON[user?.role]} {user?.role?.charAt(0).toUpperCase()+user?.role?.slice(1)}
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal:16 }}>
          {/* Account info */}
          <Card>
            <View style={s.cardHeader}>
              <View style={s.accent} /><Text style={s.cardTitle}>Account Details</Text>
            </View>
            <InfoRow label="Full Name"  value={user?.name} />
            <InfoRow label="Email"      value={user?.email} />
            <InfoRow label="Role"       value={user?.role?.charAt(0).toUpperCase()+user?.role?.slice(1)} />
            <InfoRow label="Platform"   value="PINNACLE Innovation & Education" last />
          </Card>

          {/* Contact Pinnacle */}
          <Card>
            <View style={s.cardHeader}>
              <View style={s.accent} /><Text style={s.cardTitle}>Contact PINNACLE</Text>
            </View>
            {[
              { label:'📞 Call',     action:()=>Linking.openURL('tel:+97148328855'),                     value:'+971 4 832 8855' },
              { label:'✉ Email',    action:()=>Linking.openURL('mailto:info@pinnacleeducation.ae'),      value:'info@pinnacleeducation.ae' },
              { label:'📍 Location', action:()=>Linking.openURL('https://g.page/pinnacledubai'),          value:'Oud Metha, Dubai' },
            ].map(c=>(
              <TouchableOpacity key={c.label} onPress={c.action} style={s.contactRow}>
                <Text style={s.contactLabel}>{c.label}</Text>
                <Text style={s.contactValue}>{c.value}</Text>
              </TouchableOpacity>
            ))}
          </Card>

          {/* Social / Website links */}
          <Card>
            <View style={s.cardHeader}>
              <View style={s.accent} /><Text style={s.cardTitle}>Connect With Us</Text>
            </View>
            <View style={s.socialGrid}>
              {socials.map(soc=>(
                <TouchableOpacity key={soc.label} onPress={()=>Linking.openURL(soc.url)} style={s.socialBtn}>
                  <Text style={s.socialBtnText}>{soc.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* App info */}
          <Card>
            <View style={s.cardHeader}>
              <View style={s.accent} /><Text style={s.cardTitle}>App Info</Text>
            </View>
            <InfoRow label="Version"   value="1.0.0" />
            <InfoRow label="Platform"  value="Android & iOS" />
            <InfoRow label="Website"   value="pinnacleeducation.ae" last />
          </Card>

          <Btn label="Sign Out" onPress={handleLogout} color={COLORS.danger} style={{ marginTop:4 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  hero:        { backgroundColor: COLORS.primary, alignItems:'center', paddingVertical:28, paddingHorizontal:16 },
  avatar:      { width:80, height:80, borderRadius:40, alignItems:'center', justifyContent:'center', marginBottom:12, borderWidth:3, borderColor:'rgba(255,255,255,0.3)' },
  avatarText:  { fontSize:32, fontWeight:'900', color:'#fff' },
  name:        { fontSize:20, fontWeight:'900', color:'#fff', marginBottom:4 },
  email:       { fontSize:13, color:'#A8C8F0', marginBottom:10 },
  rolePill:    { paddingHorizontal:14, paddingVertical:5, borderRadius:20, borderWidth:1 },
  roleText:    { fontSize:13, fontWeight:'700' },
  cardHeader:  { flexDirection:'row', alignItems:'center', gap:8, marginBottom:14 },
  accent:      { width:4, height:20, backgroundColor: COLORS.accent, borderRadius:2 },
  cardTitle:   { fontSize:15, fontWeight:'800', color: COLORS.text },
  contactRow:  { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderBottomColor: COLORS.bg },
  contactLabel:{ fontSize:13, fontWeight:'600', color: COLORS.text },
  contactValue:{ fontSize:13, color: COLORS.primary, fontWeight:'600', textAlign:'right', flex:1, marginLeft:8 },
  socialGrid:  { flexDirection:'row', flexWrap:'wrap', gap:8 },
  socialBtn:   { backgroundColor: COLORS.bg, borderRadius:10, paddingHorizontal:12, paddingVertical:9, borderWidth:1, borderColor: COLORS.border },
  socialBtnText:{ fontSize:12, fontWeight:'700', color: COLORS.primary },
});
