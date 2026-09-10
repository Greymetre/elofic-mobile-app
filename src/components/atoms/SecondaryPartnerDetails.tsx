import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import AppText from '../AppText/AppText';
import { colors } from '../../utils/Colors';
import axiosClient from '../../api/AxiosClient';

type Period = 'MTD' | 'YTD';

type SecondaryDetailsData = {
  total_customers: number;
  added_today: number;
  unique_customers_ordered: number;
  orders: number;
  quantity: number;
  value: number;
};

const formatMetric = (amount: number) => {
  const value = Number(amount || 0);
  if (value >= 10000000) return `${(value / 10000000).toFixed(2).replace(/\.?0+$/, '')}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(2).replace(/\.?0+$/, '')}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(2).replace(/\.?0+$/, '')}K`;
  return Math.round(value).toLocaleString('en-IN');
};

const PeopleIcon = () => (
  <Svg width={30} height={30} viewBox="0 0 30 30">
    <Circle cx={11} cy={10} r={4} fill="none" stroke={colors.blue} strokeWidth={2} />
    <Circle cx={20} cy={12} r={3.5} fill="none" stroke={colors.blue} strokeWidth={2} />
    <Path d="M3.5 24c.5-5.8 3.4-8.2 7.6-8.2s7 2.5 7.5 8.2M17.5 17.3c4.6-.8 7.8 1.6 8.3 6.1" fill="none" stroke={colors.blue} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const CheckIcon = ({ color = colors.blue }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={9} fill="none" stroke={color} strokeWidth={1.8} />
    <Path d="m7.8 12.1 2.8 2.8 5.9-6" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SecondaryPartnerDetails = () => {
  const [period, setPeriod] = useState<Period>('MTD');
  const [data, setData] = useState<SecondaryDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const periodLabel = period === 'MTD' ? 'MONTH TO DATE ORDERS' : 'YEAR TO DATE ORDERS';

  useEffect(() => {
    let active = true;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('api/dashboard/summary', {
          params: { filterType: period },
        });
        if (active && response.data?.status === 'success') {
          setData(response.data.data?.secondary_partner_details ?? null);
        }
      } catch (error) {
        console.log('Failed to fetch secondary partner details:', error);
        if (active) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDetails();
    return () => {
      active = false;
    };
  }, [period]);

  const orderStats = [
    { id: 'orders', label: 'Nos. Of\nOrders', value: formatMetric(data?.orders ?? 0), color: colors.blue, background: '#EEEEF8', icon: 'check' },
    { id: 'quantity', label: 'Qty', value: formatMetric(data?.quantity ?? 0), color: '#159F69', background: '#DFF4EC', icon: 'square' },
    { id: 'value', label: 'Value', value: formatMetric(data?.value ?? 0), color: '#C5740B', background: '#FCEACF', icon: 'rupee' },
  ];

  return (
    <View style={styles.section}>
      <AppText size={20} color="#171719" family="InterBold" style={styles.heading}>
        Secondary Partner Details
      </AppText>

      <View style={styles.panel}>
        <View style={styles.tabs}>
          {(['MTD', 'YTD'] as Period[]).map(item => {
            const selected = period === item;
            return (
              <Pressable key={item} onPress={() => setPeriod(item)} style={[styles.tab, selected && styles.activeTab]}>
                <AppText size={14} color={selected ? colors.white : '#89899F'} family="InterSemiBold">
                  {item}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <AppText size={14} color="#838386" family="InterMedium" style={styles.customerLabel}>
          Total Customers
        </AppText>
        <View style={styles.customerRow}>
          <View style={styles.customerCountRow}>
            <AppText size={34} color={colors.blue} family="InterBold">{loading ? '—' : formatMetric(data?.total_customers ?? 0)}</AppText>
            <View style={styles.growthBadge}>
              <AppText size={12} color="#159F69" family="InterSemiBold">{loading ? 'Loading…' : `+${data?.added_today ?? 0} today`}</AppText>
            </View>
          </View>
          <View style={styles.peopleBadge}><PeopleIcon /></View>
        </View>

        <View style={styles.uniqueCard}>
          <View style={styles.uniqueIcon}><CheckIcon /></View>
          <View style={styles.uniqueText}>
            <AppText size={14} color={colors.blue} family="InterSemiBold">Unique Customers Ordered</AppText>
            <AppText size={11} color="#89898D" family="InterMedium">{period} · placed at least 1 order</AppText>
          </View>
          <AppText size={26} color={colors.blue} family="InterBold">{loading ? '—' : formatMetric(data?.unique_customers_ordered ?? 0)}</AppText>
        </View>

        <View style={styles.orderHeader}>
          <AppText size={13} color="#89898D" family="InterBold">{periodLabel}</AppText>
          <View style={styles.periodPill}>
            <AppText size={12} color={colors.blue} family="InterSemiBold">{period}</AppText>
          </View>
        </View>

        <View style={styles.statsRow}>
          {orderStats.map(item => (
            <View key={item.id} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: item.background }]}>
                {item.icon === 'check' && <PathCheck />}
                {item.icon === 'square' && <Svg width={16} height={16}><Rect x={2} y={2} width={12} height={12} rx={2} fill={item.color} /></Svg>}
                {item.icon === 'rupee' && <AppText size={17} color={item.color} family="InterBold">₹</AppText>}
              </View>
              <AppText size={12} color="#838386" family="InterMedium" lineHeight={16} style={styles.statLabel}>
                {item.label}
              </AppText>
              <AppText size={18} color="#171719" family="InterBold">{loading ? '—' : item.value}</AppText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const PathCheck = () => (
  <Svg width={18} height={18} viewBox="0 0 18 18">
    <Path d="m4 9.2 3 3 6.5-7" fill="none" stroke={colors.blue} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const styles = StyleSheet.create({
  section: { marginTop: 24, paddingHorizontal: 20 },
  heading: { marginBottom: 14 },
  panel: { padding: 18, backgroundColor: colors.white, borderRadius: 22, shadowColor: '#233054', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  tabs: { height: 48, padding: 5, borderRadius: 26, backgroundColor: '#EEEEF8', flexDirection: 'row' },
  tab: { flex: 1, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  activeTab: { backgroundColor: '#41599F' },
  customerLabel: { marginTop: 22 },
  customerRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  customerCountRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  growthBadge: { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#E3F5EE', borderRadius: 20 },
  peopleBadge: { width: 48, height: 48, backgroundColor: '#EEEEF8', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  uniqueCard: { minHeight: 66, marginTop: 20, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEEEF8', borderRadius: 14 },
  uniqueIcon: { width: 39, height: 39, marginRight: 12, backgroundColor: colors.white, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  uniqueText: { flex: 1 },
  orderHeader: { marginTop: 24, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  periodPill: { minWidth: 58, paddingVertical: 5, paddingHorizontal: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.blue, borderRadius: 18 },
  statsRow: { flexDirection: 'row', gap: 9 },
  statCard: { flex: 1, minHeight: 132, paddingHorizontal: 12, paddingVertical: 13, borderWidth: 1, borderColor: '#E0E1E8', borderRadius: 14 },
  statIcon: { width: 31, height: 31, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  statLabel: { marginTop: 19, marginBottom: 8 },
});

export default SecondaryPartnerDetails;
