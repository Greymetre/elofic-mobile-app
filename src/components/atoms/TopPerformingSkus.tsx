import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import AppText from '../AppText/AppText';
import { colors } from '../../utils/Colors';
import axiosClient from '../../api/AxiosClient';

type Period = 'YTD' | 'MTD';
type Metric = 'Val.' | 'Qty.';

type SkuItem = {
  id: string;
  name: string;
  value: number;
  quantity: number;
};

const rankColors = [
  { background: '#F9C34E', text: colors.white },
  { background: '#CDC9BF', text: colors.white },
  { background: '#F1A88B', text: colors.white },
  { background: '#D6D9EA', text: '#40538B' },
  { background: '#D6D9EA', text: '#40538B' },
];

const formatMetric = (amount: number) => {
  if (amount >= 100000) return `${(amount / 100000).toFixed(2).replace(/\.?0+$/, '')}L`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(2).replace(/\.?0+$/, '')}K`;
  return amount.toLocaleString('en-IN');
};

const toNumber = (value: unknown) => {
  const parsed = Number(String(value ?? 0).replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeSku = (item: Record<string, unknown>, index: number): SkuItem => ({
  id: String(item.id ?? item.sku_id ?? item.product_id ?? index),
  name: String(item.sku_name ?? item.product_name ?? item.name ?? item.sku ?? item.sku_code ?? item.product_code ?? 'Unnamed SKU'),
  value: toNumber(item.total_value ?? item.sales_value ?? item.value ?? item.amount),
  quantity: toNumber(item.total_quantity ?? item.total_qty ?? item.quantity ?? item.qty),
});

const SegmentedControl = <T extends string>({
  options,
  selected,
  onChange,
  outlined = false,
}: {
  options: readonly T[];
  selected: T;
  onChange: (option: T) => void;
  outlined?: boolean;
}) => (
  <View style={styles.segmentedControl}>
    {options.map(option => {
      const active = option === selected;
      return (
        <Pressable
          key={option}
          onPress={() => onChange(option)}
          style={[
            styles.segment,
            active && (outlined ? styles.outlinedSegment : styles.filledSegment),
          ]}
        >
          <AppText
            size={14}
            color={active && !outlined ? colors.white : active ? colors.blue : '#89899F'}
            family="InterBold"
          >
            {option}
          </AppText>
        </Pressable>
      );
    })}
  </View>
);

const TopPerformingSkus = () => {
  const [period, setPeriod] = useState<Period>('YTD');
  const [metric, setMetric] = useState<Metric>('Val.');
  const [skuData, setSkuData] = useState<SkuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchSkus = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await axiosClient.get('api/dashboard/summary', {
        params: {
          filterType: period,
          metric: metric === 'Val.' ? 'value' : 'quantity',
        },
      });
      const dashboardData = response.data?.data ?? {};
      const skuPayload = dashboardData.top_performing_skus
        ?? dashboardData.top_performing_sku
        ?? dashboardData.topPerformingSkus
        ?? dashboardData.top_performing_products
        ?? dashboardData.top_skus
        ?? [];
      const list = Array.isArray(skuPayload)
        ? skuPayload
        : skuPayload.data ?? skuPayload.items ?? [];

      setSkuData(
        (Array.isArray(list) ? list : [])
          .map((item, index) => normalizeSku(item, index))
          .slice(0, 5),
      );
    } catch (fetchError) {
      console.log('Failed to fetch top performing SKUs:', fetchError);
      setSkuData([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [metric, period]);

  useEffect(() => {
    fetchSkus();
  }, [fetchSkus]);

  const sortedSkus = useMemo(
    () => [...skuData].sort((a, b) => (
      metric === 'Val.' ? b.value - a.value : b.quantity - a.quantity
    )),
    [metric, skuData],
  );

  const highestMetric = useMemo(
    () => Math.max(0, ...sortedSkus.map(item => metric === 'Val.' ? item.value : item.quantity)),
    [metric, sortedSkus],
  );

  const totals = useMemo(
    () => skuData.reduce(
      (result, item) => ({
        quantity: result.quantity + item.quantity,
        value: result.value + item.value,
      }),
      { quantity: 0, value: 0 },
    ),
    [skuData],
  );

  return (
    <View style={styles.section}>
      <AppText size={20} color="#171719" family="InterBold" style={styles.heading}>
        Top Performing SKUs
      </AppText>

      <View style={styles.panel}>
        <View style={styles.controls}>
          <SegmentedControl options={['YTD', 'MTD'] as const} selected={period} onChange={setPeriod} />
          <SegmentedControl options={['Val.', 'Qty.'] as const} selected={metric} onChange={setMetric} outlined />
        </View>

        {loading ? (
          <View style={styles.feedback}>
            <ActivityIndicator color={colors.blue} />
            <AppText size={13} color="#89899F" family="InterMedium">Loading SKUs…</AppText>
          </View>
        ) : error ? (
          <View style={styles.feedback}>
            <AppText size={13} color="#89899F" family="InterMedium">Unable to load SKU data</AppText>
            <Pressable onPress={fetchSkus} hitSlop={8}>
              <AppText size={13} color={colors.blue} family="InterSemiBold">Retry</AppText>
            </Pressable>
          </View>
        ) : sortedSkus.length === 0 ? (
          <View style={styles.feedback}>
            <AppText size={13} color="#89899F" family="InterMedium">No SKU data available for {period}</AppText>
          </View>
        ) : (
          <View style={styles.list}>
          {sortedSkus.map((item, index) => {
            const metricValue = metric === 'Val.' ? item.value : item.quantity;
            const progress = highestMetric ? (metricValue / highestMetric) * 100 : 0;

            return (
              <View key={`${period}-${item.id}`} style={[styles.skuRow, index > 0 && styles.skuBorder]}>
                <View style={[styles.rank, { backgroundColor: rankColors[index].background }]}>
                  <AppText size={17} color={rankColors[index].text} family="InterBold">{index + 1}</AppText>
                </View>

                <View style={styles.skuContent}>
                  <View style={styles.skuTopRow}>
                    <AppText
                      size={15}
                      color="#171719"
                      family="InterBold"
                      numLines={1}
                      style={styles.skuName}
                    >
                      {item.name}
                    </AppText>
                    <AppText size={11} color="#9A9A9D" family="InterBold">(VAL)</AppText>
                    <AppText size={15} color="#159F69" family="InterBold"> ₹{formatMetric(item.value)}</AppText>
                  </View>

                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${progress}%` }]} />
                  </View>

                  <View style={styles.quantityRow}>
                    <AppText size={11} color="#9A9A9D" family="InterBold">(QTY)</AppText>
                    <AppText size={14} color="#171719" family="InterBold"> {formatMetric(item.quantity)}</AppText>
                  </View>
                </View>
              </View>
            );
          })}
          </View>
        )}

        {!loading && !error && sortedSkus.length > 0 && <View style={styles.totals}>
          <View>
            <AppText size={12} color="#89899F" family="InterBold">TOTAL QTY</AppText>
            <AppText size={22} color="#171719" family="InterBold" style={styles.totalValue}>{formatMetric(totals.quantity)}</AppText>
          </View>
          <View style={styles.totalRight}>
            <AppText size={12} color="#89899F" family="InterBold">TOTAL VALUE</AppText>
            <AppText size={22} color={colors.blue} family="InterBold" style={styles.totalValue}>₹{formatMetric(totals.value)}</AppText>
          </View>
        </View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginTop: 26, paddingHorizontal: 20 },
  heading: { marginBottom: 14 },
  panel: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 20, backgroundColor: colors.white, borderRadius: 22, shadowColor: '#233054', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  controls: { flexDirection: 'row', gap: 8 },
  segmentedControl: { flex: 1, height: 46, padding: 5, borderRadius: 24, backgroundColor: '#EEEEF8', flexDirection: 'row' },
  segment: { flex: 1, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  filledSegment: { backgroundColor: '#41599F' },
  outlinedSegment: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: '#41599F' },
  feedback: { minHeight: 180, gap: 10, alignItems: 'center', justifyContent: 'center' },
  list: { marginTop: 20 },
  skuRow: { minHeight: 78, flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  skuBorder: { borderTopWidth: 1, borderTopColor: '#ECECEF' },
  rank: { width: 34, height: 34, marginRight: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  skuContent: { flex: 1 },
  skuTopRow: { flexDirection: 'row', alignItems: 'baseline' },
  skuName: { flex: 1, marginRight: 4 },
  track: { height: 6, marginTop: 6, borderRadius: 99, overflow: 'hidden', backgroundColor: '#E1E2EC' },
  fill: { height: '100%', borderRadius: 99, backgroundColor: '#3CC976' },
  quantityRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'baseline', marginTop: 6 },
  totals: { paddingTop: 17, marginTop: 4, borderTopWidth: 1, borderTopColor: '#E7E7EA', flexDirection: 'row', justifyContent: 'space-between' },
  totalValue: { marginTop: 7 },
  totalRight: { alignItems: 'flex-end' },
});

export default TopPerformingSkus;
