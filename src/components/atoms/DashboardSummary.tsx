import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import AppText from '../AppText/AppText';
import { colors } from '../../utils/Colors';
import axiosClient from '../../api/AxiosClient';

type Period = 'MTD' | 'YTD';
type IconName = 'partners' | 'active' | 'complaint' | 'expense';

type DashboardSummaryData = {
  primary_partners: { total: number; active_last_3_months: number };
  secondary_partners: { total: number; active_last_3_months: number };
  complaints: { total: number; pending: number; closed: number };
  expenses: { total: number; approved: number };
};

const formatCurrency = (amount: number) => {
  const value = Number(amount || 0);
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `₹${Math.round(value)}`;
};

const SummaryIcon = ({ name }: { name: IconName }) => {
  if (name === 'partners') {
    return (
      <Svg width={30} height={30} viewBox="0 0 30 30">
        <Circle cx={11} cy={10} r={4.2} fill="none" stroke={colors.blue} strokeWidth={2} />
        <Circle cx={20} cy={12} r={3.5} fill="none" stroke={colors.blue} strokeWidth={2} />
        <Path d="M3.5 24c.5-6 3.5-8.5 7.7-8.5 4.3 0 7.1 2.6 7.7 8.5M17.5 17c4.7-.8 8 1.7 8.5 6.4" fill="none" stroke={colors.blue} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  const config = {
    active: { background: '#DFF4EC', color: '#17A26B', symbol: '✓' },
    complaint: { background: '#FFF0D9', color: '#E88A12', symbol: 'square' },
    expense: { background: '#FFE3E7', color: '#ED334D', symbol: '!' },
  }[name];

  return (
    <View style={[styles.iconBadge, { backgroundColor: config.background }]}>
      {config.symbol === 'square' ? (
        <Svg width={18} height={18} viewBox="0 0 18 18">
          <Rect x={4} y={4} width={10} height={10} rx={2} fill={config.color} />
        </Svg>
      ) : (
        <AppText size={22} color={config.color} family="InterBold">{config.symbol}</AppText>
      )}
    </View>
  );
};

const DashboardSummary = () => {
  const [period, setPeriod] = useState<Period>('MTD');
  const [data, setData] = useState<DashboardSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('api/dashboard/summary', {
          params: { filterType: period },
        });
        if (active && response.data?.status === 'success') {
          setData(response.data.data);
        }
      } catch (error) {
        console.log('Failed to fetch dashboard summary:', error);
        if (active) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchSummary();
    return () => {
      active = false;
    };
  }, [period]);

  const summaryItems = [
    {
      id: 'primary',
      value: data?.primary_partners.total ?? 0,
      label: 'Total Primary\npartner',
      detail: `${data?.primary_partners.active_last_3_months ?? 0} Active (sold in last\n3mo)`,
      icon: 'partners' as IconName,
    },
    {
      id: 'secondary',
      value: data?.secondary_partners.total ?? 0,
      label: 'Total Secondary\npartner',
      detail: `${data?.secondary_partners.active_last_3_months ?? 0} Active (sold in\nlast 3mo)`,
      icon: 'active' as IconName,
    },
    {
      id: 'complaint',
      value: data?.complaints.total ?? 0,
      label: 'Total Complaint',
      detail: `${data?.complaints.pending ?? 0} Pending · ${data?.complaints.closed ?? 0} Closed`,
      icon: 'complaint' as IconName,
    },
    {
      id: 'expense',
      value: formatCurrency(data?.expenses.total ?? 0),
      label: 'Total Expense',
      detail: `${formatCurrency(data?.expenses.approved ?? 0)} Approved`,
      icon: 'expense' as IconName,
    },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.panel}>
        <View style={styles.tabs}>
          {(['MTD', 'YTD'] as Period[]).map(item => {
            const selected = item === period;
            return (
              <Pressable
                key={item}
                onPress={() => setPeriod(item)}
                style={[styles.tab, selected && styles.selectedTab]}
              >
                <AppText
                  size={14}
                  color={selected ? colors.white : '#89899F'}
                  family="InterSemiBold"
                >
                  {item}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.grid}>
          {summaryItems.map((item, index) => (
            <View key={item.id} style={styles.card}>
              <SummaryIcon name={item.icon} />
              <AppText size={18} color="#1F2937" family="InterSemiBold" style={styles.value}>
                {loading ? '—' : item.value}
              </AppText>
              <AppText size={11} color="#6B7280" family="InterMedium" lineHeight={15}>
                {item.label}
              </AppText>
              <AppText
                size={11}
                color="#159F69"
                family="InterSemiBold"
                lineHeight={15}
                style={styles.detail}
              >
                {loading ? 'Loading…' : index === 2 ? (
                  <><AppText size={11} color="#E88A12" family="InterSemiBold">{item.detail.split(' · ')[0]}</AppText>{' · '}{item.detail.split(' · ')[1]}</>
                ) : item.detail}
              </AppText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 20, marginTop: 12 },
  panel: { backgroundColor: colors.white, borderRadius: 22, padding: 18, shadowColor: '#233054', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  tabs: { height: 48, padding: 5, marginBottom: 16, borderRadius: 26, backgroundColor: '#EEEEF8', flexDirection: 'row' },
  tab: { flex: 1, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  selectedTab: { backgroundColor: '#41599F' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  card: { width: '48%', minHeight: 140, paddingHorizontal: 14, paddingVertical: 16, backgroundColor: '#F6F7FA', borderRadius: 14, justifyContent: 'flex-start' },
  iconBadge: { width: 27, height: 27, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  value: { marginTop: 10, marginBottom: 4 },
  detail: { marginTop: 6 },
});

export default DashboardSummary;
