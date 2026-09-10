import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import AppText from '../AppText/AppText';
import { colors } from '../../utils/Colors';
import PrimaryShineChip from './PrimaryShineChip';

type AttendanceIcon = 'people' | 'check' | 'leave' | 'alert' | 'holiday';

export type AttendanceCounts = {
  total: number;
  market: number;
  leave: number;
  missed: number;
  holiday: number;
};

const attendanceMeta = [
  { id: 'total' as const, label: 'Total', icon: 'people' as AttendanceIcon, tint: '#3A4DA0', iconBg: '#E8EAF2' },
  { id: 'market' as const, label: 'Market', icon: 'check' as AttendanceIcon, tint: '#0F765E', iconBg: '#E1F5EE' },
  { id: 'leave' as const, label: 'On Leave', icon: 'leave' as AttendanceIcon, tint: '#A66312', iconBg: '#FAEEDA' },
  { id: 'missed' as const, label: 'Mis Punch', icon: 'alert' as AttendanceIcon, tint: '#B23938', iconBg: '#FCEBEB' },
  { id: 'holiday' as const, label: 'Holiday', icon: 'holiday' as AttendanceIcon, tint: '#2477B3', iconBg: '#E8F3FF' },
];

const StatusIcon = ({ name, color }: { name: AttendanceIcon; color: string }) => {
  if (name === 'check') {
    return <Svg width={14} height={14} viewBox="0 0 14 14"><Path d="M2.4 7.1 5.4 10 11.8 3.7" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
  }
  if (name === 'alert') {
    return <Svg width={14} height={14} viewBox="0 0 14 14"><Path d="M7 1.5 13 12H1L7 1.5Z" fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" /><Path d="M7 5v3.2" stroke={color} strokeWidth={1.5} strokeLinecap="round" /><Circle cx={7} cy={10.2} r={0.8} fill={color} /></Svg>;
  }
  if (name === 'leave') {
    return <Svg width={14} height={14} viewBox="0 0 14 14"><Path d="M3 2.5h8v9H3z" fill="none" stroke={color} strokeWidth={1.4} /><Path d="M5 1.5v2M9 1.5v2M4.8 6h4.4M4.8 8.5h2.8" stroke={color} strokeWidth={1.4} strokeLinecap="round" /></Svg>;
  }
  if (name === 'holiday') {
    return <Svg width={14} height={14} viewBox="0 0 14 14"><Circle cx={7} cy={7} r={3} fill="none" stroke={color} strokeWidth={1.4} /><Path d="M7 1v1.4M7 11.6V13M1 7h1.4M11.6 7H13M2.8 2.8l1 1M10.2 10.2l1 1M11.2 2.8l-1 1M3.8 10.2l-1 1" stroke={color} strokeWidth={1.2} strokeLinecap="round" /></Svg>;
  }
  return <Svg width={14} height={14} viewBox="0 0 14 14"><Circle cx={5} cy={5} r={2} fill="none" stroke={color} strokeWidth={1.4} /><Circle cx={9.8} cy={5.5} r={1.5} fill="none" stroke={color} strokeWidth={1.2} /><Path d="M1.8 11c.3-2 1.5-3 3.3-3s3 1 3.3 3M8.2 8.5c2-.5 3.5.5 3.8 2.3" fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" /></Svg>;
};

const AttendanceOverview = ({ counts, loading, onViewAll }: { counts: AttendanceCounts; loading?: boolean; onViewAll?: () => void }) => (
  <View style={styles.section}>
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <AppText size={18} color="#202431" family="InterSemiBold">Attendance</AppText>
        <PrimaryShineChip />
      </View>
      <Pressable onPress={onViewAll} hitSlop={10}>
        <AppText size={13} color={colors.blue} family="InterMedium">View All  →</AppText>
      </Pressable>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
      {attendanceMeta.map(item => (
        <View key={item.id} style={styles.card}>
          <View style={[styles.icon, { backgroundColor: item.iconBg }]}><StatusIcon name={item.icon} color={item.tint} /></View>
          <AppText size={18} color="#1F2937" family="InterSemiBold">{loading ? '—' : counts[item.id]}</AppText>
          <AppText size={11} color="#6B7280" family="InterMedium">{item.label}</AppText>
        </View>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  section: { marginTop: 22 },
  header: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  list: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  card: { width: 86, minHeight: 103, marginTop: 14, paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 14, borderWidth: 1.5, borderColor: '#E6E8EB', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  icon: { width: 25, height: 25, marginBottom: 6, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
});

export default AttendanceOverview;
