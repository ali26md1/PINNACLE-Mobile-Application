import React from 'react';
import { View, Text, Image, TouchableOpacity, Linking, Platform, StyleSheet } from 'react-native';
import { COLORS } from './UI';

const openWebsite = () => Linking.openURL('https://pinnacleeducation.ae/');

export const AppHeader = ({ title }) => (
  <View style={hdr.wrap}>
    <View style={hdr.topBar}>
      <Text style={hdr.topText}>📞 +971 4 832 8855</Text>
      <TouchableOpacity onPress={openWebsite} style={hdr.webBtn}>
        <Text style={hdr.webBtnText}>🌐 Visit Website</Text>
      </TouchableOpacity>
    </View>
    <View style={hdr.main}>
      <Image source={require('../assets/logo.png')} style={hdr.logo} resizeMode="contain" />
      {title ? <Text style={hdr.pageTitle}>{title}</Text> : null}
    </View>
    <View style={hdr.accent} />
  </View>
);

const hdr = StyleSheet.create({
  wrap:      { backgroundColor: '#fff' },
  topBar:    { backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 48 : 8, paddingBottom: 6 },
  topText:   { color: '#fff', fontSize: 11, fontWeight: '500' },
  webBtn:    { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  webBtnText:{ color: '#fff', fontSize: 11, fontWeight: '700' },
  main:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  logo:      { width: 140, height: 46 },
  pageTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  accent:    { height: 3, backgroundColor: COLORS.accent },
});
