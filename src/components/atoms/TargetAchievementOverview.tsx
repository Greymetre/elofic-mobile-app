import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import AppText from '../AppText/AppText';
import { colors } from '../../utils/Colors';
import { rw } from '../../utils/responsive';

const targetData = {
  uniqueCustomers: 13,
  achievedValue: 0,
  targetValue: 227100000,
  todayQuantity: 0,
  todayValue: 0,
  mtdQuantity: 2780,
  mtdValue: 317000,
};

const formatShortNumber = (amount: number) => {
  const value = Number(amount || 0);
  if (value >= 10000000) return `${(value / 10000000).toFixed(2).replace(/\.?0+$/, '')}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(2).replace(/\.?0+$/, '')}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(2).replace(/\.?0+$/, '')}K`;
  return Math.round(value).toLocaleString('en-IN');
};

const ChartIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 28 28">
    <Rect x={4} y={14} width={6} height={10} rx={1} fill="#7CC5F2" />
    <Rect x={11} y={9} width={6} height={15} rx={1} fill="#27B98B" />
    <Rect x={18} y={5} width={6} height={19} rx={1} fill="#EF5871" />
  </Svg>
);

const PercentageRing = ({ percentage }: { percentage: number }) => {
  const size = rw(68);
  const stroke = rw(8);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, percentage));

  return (
    <View style={[styles.ring, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.ringSvg}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#E6E7F1" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#6974F6"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference - (progress / 100) * circumference}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <AppText size={16} family="InterBold" color="#1F2437">{Math.round(progress)}%</AppText>
    </View>
  );
};

const TargetAchievementOverview = ({ onViewAll }: { onViewAll?: () => void }) => {
  const percentage = targetData.targetValue > 0
    ? Math.min(100, (targetData.achievedValue / targetData.targetValue) * 100)
    : 0;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText size={20} color="#171719" family="InterBold" lineHeight={24}>
          Target VS{`\n`}Achievement
        </AppText>
        <View style={styles.headerAction}>
          <View style={styles.primaryBadge}>
            <AppText size={12} color={colors.blue} family="InterSemiBold">Primary</AppText>
          </View>
          <Pressable onPress={onViewAll} hitSlop={10}>
            <AppText size={13} color={colors.blue} family="InterSemiBold">View All  →</AppText>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.chartIcon}><ChartIcon /></View>
          <AppText size={18} family="InterBold" color="#171719" lineHeight={23} style={styles.cardTitle}>
            MTD Target Vs{`\n`}Achievement
          </AppText>
          <View style={styles.customerBlock}>
            <AppText size={11} color="#89899F" family="InterMedium" align="right">No.of Customers</AppText>
            <AppText size={10} color="#89899F" family="InterMedium" align="right">(MTD Sales Unique No)</AppText>
            <AppText size={20} family="InterBold" color="#171719" align="right">{targetData.uniqueCustomers}</AppText>
          </View>
        </View>

        <View style={styles.valueRow}>
          <View style={styles.valueContent}>
            <View style={styles.valueTop}>
              <View>
                <AppText size={13} color="#838386" family="InterMedium">Value</AppText>
                <AppText size={28} color="#171719" family="InterBold">₹{formatShortNumber(targetData.achievedValue)}</AppText>
              </View>
              <View style={styles.targetText}>
                <AppText size={22} color="#159F69" family="InterBold">{Math.round(percentage)}%</AppText>
                <AppText size={11} color="#838386" family="InterMedium">of ₹{formatShortNumber(targetData.targetValue)}</AppText>
              </View>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${percentage}%` }]} />
            </View>
          </View>
          <PercentageRing percentage={percentage} />
        </View>

        <View style={styles.divider} />
        <View style={styles.footer}>
          <Summary title="TODAY" quantity={targetData.todayQuantity} value={targetData.todayValue} bordered />
          <Summary title="MTD" quantity={targetData.mtdQuantity} value={targetData.mtdValue} />
        </View>
      </View>
    </View>
  );
};

const Summary = ({ title, quantity, value, bordered = false }: { title: string; quantity: number; value: number; bordered?: boolean }) => (
  <View style={[styles.summary, bordered && styles.summaryBorder]}>
    <AppText size={12} color="#89899F" family="InterSemiBold">{title}</AppText>
    <View style={styles.summaryLabels}>
      <AppText size={11} color="#89899F" family="InterMedium">Qty</AppText>
      <AppText size={11} color="#89899F" family="InterMedium">Val</AppText>
    </View>
    <View style={styles.summaryLabels}>
      <AppText size={18} color="#171719" family="InterSemiBold">{formatShortNumber(quantity)}</AppText>
      <AppText size={18} color="#171719" family="InterSemiBold">₹{formatShortNumber(value)}</AppText>
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: { marginTop: 26, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  headerAction: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  primaryBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18, backgroundColor: '#EEEEF8' },
  card: { padding: 18, backgroundColor: colors.white, borderRadius: 22, shadowColor: '#233054', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  chartIcon: { width: 56, height: 56, borderRadius: 14, backgroundColor: '#41599F', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardTitle: { flex: 1 },
  customerBlock: { alignItems: 'flex-end', marginLeft: 5 },
  valueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 14, marginTop: 26 },
  valueContent: { flex: 1 },
  valueTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  targetText: { alignItems: 'flex-end', gap: 4 },
  track: { height: 8, borderRadius: 99, backgroundColor: '#E3E5EE', overflow: 'hidden', marginTop: 12 },
  fill: { height: '100%', borderRadius: 99, backgroundColor: '#6974F6' },
  ring: { alignItems: 'center', justifyContent: 'center' },
  ringSvg: { position: 'absolute' },
  divider: { height: 1, backgroundColor: '#ECEEF4', marginTop: 24 },
  footer: { flexDirection: 'row', paddingTop: 16 },
  summary: { flex: 1, paddingLeft: 18 },
  summaryBorder: { paddingLeft: 0, paddingRight: 18, borderRightWidth: 1, borderRightColor: '#ECEEF4' },
  summaryLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
});

export default TargetAchievementOverview;
