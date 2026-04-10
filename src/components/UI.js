import React from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, TextInput, Modal, ScrollView, Platform, Dimensions, BlurView
} from 'react-native';

const { width } = Dimensions.get('window');

// ── Ivy League Design Tokens ────────────────────────────────────────────────
export const COLORS = {
  // Primary Institutional Colors
  oxford:      '#002147',   // Oxford Blue
  harvard:     '#A51C30',   // Harvard Crimson
  mit:         '#A31F34',   // MIT Red
  primary:     '#002147',

  // Neutral Palette (Academic/Sophisticated)
  bg:          '#F4F7F9',
  surface:     '#FFFFFF',
  border:      '#DDE3E9',
  text:        '#1A1F23',   // Near black for readability
  textMuted:   '#5C6B79',
  textLight:   '#8E9BA7',

  // Functional
  success:     '#0D6F3F',   // Hunter Green
  warning:     '#B27F11',
  danger:      '#A51C30',
  accent:      '#C4A006',   // Gold/Academic Honors
  white:       '#FFFFFF',
  secondary:   '#5C6B79',   // Slate Blue/Grey for secondary actions
  primarySoft: '#E1E9F4',   // Light wash of Oxford Blue
};

export const SPACING = {
  xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48
};

// ── Refined Components ────────────────────────────────────────────────────────

export const Btn = ({ label, onPress, color, textColor, loading, disabled, style, outline, icon, small }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        small && { height: 44, borderRadius: 12 },
        {
          backgroundColor: outline ? 'transparent' : (color || COLORS.primary),
          borderWidth: outline ? 1 : 0,
          borderColor: color || COLORS.primary,
          opacity: (disabled || loading) ? 0.6 : 1,
        },
        style
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={outline ? (color || COLORS.primary) : (textColor || '#fff')} size="small" />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {icon && <Text style={{ marginRight: 8 }}>{icon}</Text>}
          <Text style={[
            styles.btnText,
            small && { fontSize: 14 },
            { color: outline ? (color || COLORS.primary) : (textColor || '#fff') }
          ]}>
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const Input = ({ label, error, icon, ...props }) => (
  <View style={{ marginBottom: 18 }}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <View style={[styles.inputContainer, error && { borderColor: COLORS.danger }]}>
      {icon && <Text style={styles.inputIcon}>{icon}</Text>}
      <TextInput
        style={[styles.input, props.multiline && { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
        placeholderTextColor={COLORS.textLight}
        selectionColor={COLORS.primary}
        {...props}
      />
    </View>
    {error && <Text style={styles.inputError}>{error}</Text>}
  </View>
);

export const Card = ({ children, style, onPress, noPadding, shadow = true }) => {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container
      style={[
        styles.card,
        !shadow && { elevation: 0, shadowOpacity: 0, borderWidth: 1 },
        noPadding && { padding: 0 },
        style
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {children}
    </Container>
  );
};

export const Badge = ({ text, type = 'primary', color, style }) => {
  const defaultColors = {
    primary: { bg: '#E1E9F4', text: COLORS.oxford },
    success: { bg: '#E2F1E8', text: COLORS.success },
    danger:  { bg: '#F9E8E8', text: COLORS.danger },
    warning: { bg: '#FFF7E6', text: COLORS.warning },
    accent:  { bg: '#FFF9E0', text: COLORS.accent },
  }[type] || { bg: '#E1E9F4', text: COLORS.oxford };

  const bg = color ? color + '20' : defaultColors.bg;
  const textColor = color || defaultColors.text;

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{text}</Text>
    </View>
  );
};

export const SectionHeader = ({ title, action, onAction }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

export const StatCard = ({ label, value, icon, color, subValue, bg, textCol }) => (
  <Card style={[styles.statCard, bg && { backgroundColor: bg, borderBottomWidth: 0 }]}>
    <View style={styles.statTop}>
      <View style={[styles.statIconContainer, { backgroundColor: (color || textCol || COLORS.primary) + '15' }]}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      {subValue && <Text style={styles.statSub}>{subValue}</Text>}
    </View>
    <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
    <Text
      style={[styles.statValue, textCol && { color: textCol }]}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.7}
    >
      {value}
    </Text>
  </Card>
);

export const Loader = ({ message }) => (
  <View style={styles.fullCenter}>
    <ActivityIndicator size="large" color={COLORS.oxford} />
    {message && <Text style={styles.loaderText}>{message}</Text>}
  </View>
);

export const Empty = ({ emoji, message, sub }) => (
  <View style={styles.fullCenter}>
    <Text style={{ fontSize: 64, marginBottom: 16 }}>{emoji}</Text>
    <Text style={styles.emptyText}>{message}</Text>
    {sub && <Text style={styles.emptySub}>{sub}</Text>}
  </View>
);

export const Toast = ({ message }) => {
  if (!message) return null;
  return (
    <View style={styles.toastContainer}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
};

export const Sheet = ({ visible, onClose, title, children }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.sheetOverlay}>
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheetContent}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={{ fontSize: 16, fontWeight: '700' }}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {children}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

export const InfoRow = ({ label, value, last }) => (
  <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.oxford,
    fontWeight: '700',
  },
  btn: {
    height: 58,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.oxford,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: { marginRight: 12, fontSize: 18 },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  inputError: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 6,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 3 },
    }),
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.oxford,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.harvard,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
  },
  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.oxford,
  },
  statSub: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
  },
  fullCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: COLORS.bg,
  },
  loaderText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.oxford,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: COLORS.oxford,
    padding: 16,
    borderRadius: 12,
    zIndex: 10000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 33, 71, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    maxHeight: '90%',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    alignSelf: 'center',
    marginVertical: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.oxford,
  },
  closeBtn: {
    backgroundColor: '#F1F5F9',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
