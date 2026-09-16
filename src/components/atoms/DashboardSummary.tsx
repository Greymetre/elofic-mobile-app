import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import AppText from '../AppText/AppText';
import { colors } from '../../utils/Colors';
import axiosClient from '../../api/AxiosClient';

type Period = 'MTD' | 'YTD';
type SummaryItem = {
  id: string;
  label: string;
  count: number;
  activeCount?: number;
  displayValue?: string;
  detail?: string;
};

const palette = [
  { tint: '#E74C5B', background: '#FCE7EA', symbol: '!' },
  { tint: '#E69A24', background: '#FFF0D9', symbol: '■' },
  { tint: '#27A878', background: '#DFF4EC', symbol: '✓' },
  { tint: '#D94C5D', background: '#FFE3E7', symbol: '×' },
  { tint: '#3A62B1', background: '#E7ECF8', symbol: '●' },
];

const formatCurrency = (amount: number) => {
  const value = Number(amount || 0);
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
};

const DashboardSummary = () => {
  const [period, setPeriod] = useState<Period>('MTD');
  const [secondaryItems, setSecondaryItems] = useState<SummaryItem[]>([]);
  const [complaintItems, setComplaintItems] = useState<SummaryItem[]>([]);
  const [expenseItems, setExpenseItems] = useState<SummaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchComplaintSummary = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('api/dashboard/summary', {
          params: { filterType: period },
        });
        const complaints = response.data?.data?.complaints;
        const complaintBreakdown = Array.isArray(complaints?.items) ? complaints.items : [];
        const secondaryPartners = response.data?.data?.secondary_partner_types;
        const secondaryBreakdown = Array.isArray(secondaryPartners?.items)
          ? secondaryPartners.items
          : [];
        const expenses = response.data?.data?.expenses;
        const expenseBreakdown = Array.isArray(expenses?.items) ? expenses.items : [];

        if (active) {
          setSecondaryItems([
            {
              id: 'secondary_total',
              label: 'Total',
              count: Number(secondaryPartners?.total) || 0,
              activeCount: Number(secondaryPartners?.active) || 0,
            },
            ...secondaryBreakdown.map((item: any) => ({
              id: `secondary_${String(item.id)}`,
              label: String(item.label || 'Other'),
              count: Number(item.count) || 0,
              activeCount: Number(item.active_count) || 0,
            })),
          ]);
          setComplaintItems([
            { id: 'total', label: 'Total', count: Number(complaints?.total) || 0 },
            ...complaintBreakdown.map((item: any) => ({
              id: String(item.id),
              label: String(item.label || 'Other'),
              count: Number(item.count) || 0,
            })),
          ]);
          setExpenseItems([
            {
              id: 'expense_total',
              label: 'Total Claim',
              count: Number(expenses?.total_count) || 0,
              displayValue: formatCurrency(expenses?.total),
            },
            ...expenseBreakdown.map((item: any) => ({
              id: String(item.id),
              label: String(item.label || 'Other'),
              count: Number(item.count) || 0,
              detail: formatCurrency(item.amount),
            })),
          ]);
        }
      } catch (error) {
        console.log('Failed to fetch complaint summary:', error);
        if (active) {
          setSecondaryItems([]);
          setComplaintItems([]);
          setExpenseItems([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchComplaintSummary();
    return () => {
      active = false;
    };
  }, [period]);

  return (
    <View style={styles.wrapper}>
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

      <View style={styles.summarySection}>
        <AppText size={14} color="#202431" family="InterSemiBold">Secondary Partner</AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.summaryList}
        >
          {(loading && secondaryItems.length === 0
            ? [{ id: 'secondary_loading', label: 'Total', count: 0 }]
            : secondaryItems
          ).map((item, index) => {
            const theme = palette[(index + 2) % palette.length];

            return (
              <View key={item.id} style={styles.summaryCard}>
                <View style={[styles.icon, { backgroundColor: theme.background }]}>
                  <AppText size={14} color={theme.tint} family="InterBold">{theme.symbol}</AppText>
                </View>
                <AppText size={18} color="#1F2937" family="InterSemiBold">
                  {loading ? '—' : item.count}
                </AppText>
                <AppText size={11} color="#6B7280" family="InterMedium" numLines={1}>
                  {item.label}
                </AppText>
                <AppText
                  size={10}
                  color="#00A36C"
                  family="InterSemiBold"
                  numLines={1}
                  style={styles.activeCount}
                >
                  {loading ? 'Loading…' : `${item.activeCount || 0} Active`}
                </AppText>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.summarySection}>
        <AppText size={14} color="#202431" family="InterSemiBold">Complaint</AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.summaryList}
        >
          {(loading && complaintItems.length === 0
            ? [{ id: 'loading', label: 'Total', count: 0 }]
            : complaintItems
          ).map((item, index) => {
            const theme = palette[index % palette.length];

            return (
              <View key={item.id} style={styles.summaryCard}>
                <View style={[styles.icon, { backgroundColor: theme.background }]}>
                  <AppText size={14} color={theme.tint} family="InterBold">{theme.symbol}</AppText>
                </View>
                <AppText size={18} color="#1F2937" family="InterSemiBold">
                  {loading ? '—' : item.count}
                </AppText>
                <AppText
                  size={11}
                  color="#6B7280"
                  family="InterMedium"
                  numLines={1}
                >
                  {item.label}
                </AppText>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.summarySection}>
        <AppText size={14} color="#202431" family="InterSemiBold">Expense</AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.summaryList}
        >
          {(loading && expenseItems.length === 0
            ? [{ id: 'expense_loading', label: 'Total Claim', count: 0 }]
            : expenseItems
          ).map((item, index) => {
            const theme = palette[(index + 1) % palette.length];

            return (
              <View key={item.id} style={styles.summaryCard}>
                <View style={[styles.icon, { backgroundColor: theme.background }]}>
                  <AppText size={14} color={theme.tint} family="InterBold">{theme.symbol}</AppText>
                </View>
                <AppText size={18} color="#1F2937" family="InterSemiBold">
                  {loading ? '—' : item.displayValue || item.count}
                </AppText>
                <AppText size={11} color="#6B7280" family="InterMedium" numLines={1}>
                  {item.label}
                </AppText>
                {item.detail ? (
                  <AppText
                    size={10}
                    color="#00A36C"
                    family="InterSemiBold"
                    numLines={1}
                    style={styles.activeCount}
                  >
                    {item.detail}
                  </AppText>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 18,
    backgroundColor: colors.white,
    borderRadius: 22,
    shadowColor: '#233054',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  tabs: {
    height: 48,
    padding: 5,
    borderRadius: 26,
    backgroundColor: '#EEEEF8',
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTab: {
    backgroundColor: '#41599F',
  },
  summarySection: {
    marginTop: 22,
  },
  summaryList: {
    paddingBottom: 4,
    gap: 8,
  },
  summaryCard: {
    width: 86,
    minHeight: 108,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F7FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECEEF3',
  },
  icon: {
    width: 24,
    height: 24,
    marginBottom: 5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCount: {
    marginTop: 4,
  },
});

export default DashboardSummary;
