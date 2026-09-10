import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import axiosClient from '../../api/AxiosClient';
import AppText from '../../components/AppText/AppText';
import { colors } from '../../utils/Colors';

type Period = 'MTD' | 'YTD';
type SelectOption = { label: string; value: string | number };
type ApiOption = { id: number; name: string };

type PerformanceRow = {
  id: number;
  name: string;
  reporting_head: string;
  branch: string;
  designation: string;
  target: number;
  achievement: number;
  working_days: number;
  total_working_days: number;
  total_orders: number;
  total_customers: number;
  achievement_mtd: number;
  achievement_percentage_mtd: number;
  today_sales_value: number;
  mtd_visits: number;
  mtd_unique_visits: number;
};

type ReportColumn = {
  key: keyof PerformanceRow | 'working_days_ratio';
  label: string;
  width: number;
  currency?: boolean;
};

const reportColumns: ReportColumn[] = [
  { key: 'name', label: 'Name', width: 170 },
  { key: 'reporting_head', label: 'Reporting Head', width: 175 },
  { key: 'designation', label: 'Designation', width: 145 },
  { key: 'working_days_ratio', label: 'Working Days', width: 135 },
  { key: 'total_orders', label: 'Total Orders', width: 120 },
  { key: 'total_customers', label: 'Total Customer', width: 140 },
  { key: 'target', label: 'Monthly Target Value', width: 180, currency: true },
  { key: 'achievement', label: 'Achievement', width: 145, currency: true },
  { key: 'achievement_mtd', label: 'Achievement MTD', width: 165, currency: true },
  { key: 'achievement_percentage_mtd', label: '%MTD', width: 100 },
  { key: 'today_sales_value', label: 'Today Sales Value', width: 155, currency: true },
  { key: 'mtd_visits', label: 'MTD Visit', width: 110 },
  { key: 'mtd_unique_visits', label: 'MTD Unique Visit', width: 155 },
];

const TABLE_WIDTH = reportColumns.reduce((total, column) => total + column.width, 0);

const formatCurrency = (amount: number) => `₹${(Number(amount || 0) / 100000).toFixed(2)}L`;

const getCellValue = (row: PerformanceRow, column: ReportColumn) => {
  if (column.key === 'working_days_ratio') {
    return `${row.working_days}/${row.total_working_days}`;
  }
  if (column.key === 'achievement_percentage_mtd') {
    return `${Number(row.achievement_percentage_mtd || 0).toFixed(2).replace(/\.00$/, '')}%`;
  }
  const value = row[column.key];
  return column.currency ? formatCurrency(Number(value)) : String(value ?? '—');
};

const SalesPerformanceScreen = () => {
  const navigation = useNavigation();
  const [period, setPeriod] = useState<Period>('MTD');
  const [selectedBranch, setSelectedBranch] = useState<string | number>('');
  const [selectedDesignation, setSelectedDesignation] = useState<string | number>('');
  const [selectedUser, setSelectedUser] = useState<string | number>('');
  const [branches, setBranches] = useState<SelectOption[]>([{ label: 'All Zones', value: '' }]);
  const [designations, setDesignations] = useState<SelectOption[]>([{ label: 'All Designations', value: '' }]);
  const [users, setUsers] = useState<SelectOption[]>([{ label: 'All Users', value: '' }]);
  const [rows, setRows] = useState<PerformanceRow[]>([]);
  const [month, setMonth] = useState('—');
  const [year, setYear] = useState('—');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const refreshingRef = useRef(false);

  useEffect(() => {
    let active = true;

    const fetchPerformance = async () => {
      try {
        if (!refreshingRef.current) setLoading(true);
        setError(false);
        const response = await axiosClient.get('api/dashboard/sales-performance', {
          params: {
            period,
            branch_id: selectedBranch || undefined,
            designation_id: selectedDesignation || undefined,
            user_id: selectedUser || undefined,
          },
        });
        const data = response.data?.data;

        if (active) {
          setRows(Array.isArray(data?.rows) ? data.rows : []);
          setMonth(String(data?.month ?? '—'));
          setYear(String(data?.year ?? '—'));
          setBranches(toSelectOptions('All Zones', data?.filters?.branches));
          setDesignations(toSelectOptions('All Designations', data?.filters?.designations));
          setUsers(toSelectOptions('All Users', data?.filters?.users));
        }
      } catch (fetchError) {
        console.log('Failed to fetch sales performance:', fetchError);
        if (active) {
          setRows([]);
          setError(true);
        }
      } finally {
        if (active) {
          refreshingRef.current = false;
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    fetchPerformance();
    return () => {
      active = false;
    };
  }, [period, retryKey, selectedBranch, selectedDesignation, selectedUser]);

  const refresh = () => {
    refreshingRef.current = true;
    setRefreshing(true);
    setRetryKey(value => value + 1);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={10}>
            <AppText size={24} color={colors.white} family="InterSemiBold">‹</AppText>
          </Pressable>
          <AppText size={14} color="#D9E0F8" family="InterMedium" style={styles.eyebrow}>Target VS Achievement</AppText>
          <AppText size={28} color={colors.white} family="InterBold">Sales Performance</AppText>
        </SafeAreaView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.blue} />}
      >
        <View style={styles.content}>
          <View style={styles.filters}>
            <FilterDropdown data={branches} value={selectedBranch} placeholder="Zone" onChange={setSelectedBranch} />
            <FilterDropdown data={designations} value={selectedDesignation} placeholder="Designation" onChange={setSelectedDesignation} wide />
            <FilterDropdown data={users} value={selectedUser} placeholder="User" onChange={setSelectedUser} />
          </View>

          <View style={styles.periodTabs}>
            {(['MTD', 'YTD'] as Period[]).map(item => {
              const selected = period === item;
              return (
                <Pressable key={item} onPress={() => setPeriod(item)} style={[styles.periodTab, selected && styles.activePeriodTab]}>
                  <AppText size={15} color={selected ? colors.white : '#89899F'} family="InterBold">{item}</AppText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.dateCards}>
            <DateCard label="Month" value={month} />
            <DateCard label="Year" value={year} />
          </View>

          {loading && !refreshing ? (
            <View style={styles.feedback}>
              <ActivityIndicator size="large" color={colors.blue} />
              <AppText size={13} color="#89899F" family="InterMedium">Loading performance…</AppText>
            </View>
          ) : error ? (
            <View style={styles.feedback}>
              <AppText size={14} color="#89899F" family="InterMedium">Unable to load sales performance</AppText>
              <Pressable onPress={() => setRetryKey(value => value + 1)} hitSlop={8}>
                <AppText size={14} color={colors.blue} family="InterSemiBold">Retry</AppText>
              </Pressable>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroller}>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  {reportColumns.map(column => (
                    <View key={column.key} style={[styles.cell, { width: column.width }]}>
                      <AppText size={13} color={colors.white} family="InterBold" align="center">{column.label}</AppText>
                    </View>
                  ))}
                </View>
                {rows.length === 0 ? (
                  <View style={styles.emptyTable}>
                    <AppText size={14} color="#89899F" family="InterMedium">No employees found</AppText>
                  </View>
                ) : rows.map((row, index) => (
                  <View key={row.id} style={[styles.tableRow, styles.dataRow, index % 2 === 1 && styles.alternateRow]}>
                    {reportColumns.map(column => {
                      const reportingHead = column.key === 'reporting_head';
                      return (
                        <View key={column.key} style={[styles.cell, { width: column.width }]}>
                          <AppText
                            size={14}
                            color={reportingHead ? colors.blue : '#202020'}
                            family={reportingHead ? 'InterSemiBold' : 'InterMedium'}
                            underline={reportingHead ? 'underline' : 'none'}
                            align="center"
                            numLines={1}
                          >
                            {getCellValue(row, column)}
                          </AppText>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const toSelectOptions = (allLabel: string, items?: ApiOption[]): SelectOption[] => [
  { label: allLabel, value: '' },
  ...(Array.isArray(items) ? items.map(item => ({ label: item.name, value: item.id })) : []),
];

const FilterDropdown = ({ data, value, placeholder, onChange, wide = false }: {
  data: SelectOption[];
  value: string | number;
  placeholder: string;
  onChange: (value: string | number) => void;
  wide?: boolean;
}) => (
  <Dropdown
    style={[styles.dropdown, wide && styles.wideDropdown]}
    containerStyle={styles.dropdownMenu}
    selectedTextStyle={styles.dropdownText}
    placeholderStyle={styles.dropdownText}
    itemTextStyle={styles.dropdownItemText}
    data={data}
    labelField="label"
    valueField="value"
    value={value}
    placeholder={placeholder}
    onChange={item => onChange(item.value)}
    renderRightIcon={() => <AppText size={10} color="#171719">▼</AppText>}
  />
);

const DateCard = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.dateCard}>
    <AppText size={12} color="#89899F" family="InterMedium">{label}</AppText>
    <AppText size={17} color="#171719" family="InterBold" style={styles.dateValue}>{value}</AppText>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F4F8' },
  hero: { minHeight: 210, paddingHorizontal: 20, backgroundColor: colors.blue },
  backButton: { width: 38, height: 38, marginTop: 8, marginBottom: 22, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  eyebrow: { marginBottom: 5 },
  content: { paddingHorizontal: 16, paddingTop: 17, paddingBottom: 35 },
  filters: { flexDirection: 'row', gap: 8 },
  dropdown: { flex: 1, height: 42, paddingHorizontal: 12, borderWidth: 1, borderColor: '#D8D9E1', borderRadius: 22, backgroundColor: colors.white },
  wideDropdown: { flex: 1.4 },
  dropdownMenu: { borderRadius: 12 },
  dropdownText: { marginRight: 3, color: '#252525', fontSize: 12 },
  dropdownItemText: { color: '#252525', fontSize: 13 },
  periodTabs: { height: 52, padding: 5, marginTop: 17, borderRadius: 27, backgroundColor: '#EEEEF8', flexDirection: 'row' },
  periodTab: { flex: 1, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  activePeriodTab: { backgroundColor: colors.blue },
  dateCards: { marginTop: 16, flexDirection: 'row', gap: 12 },
  dateCard: { flex: 1, minHeight: 68, paddingHorizontal: 16, justifyContent: 'center', borderWidth: 1, borderColor: '#E0E1E8', borderRadius: 13, backgroundColor: colors.white },
  dateValue: { marginTop: 2 },
  feedback: { minHeight: 290, gap: 12, alignItems: 'center', justifyContent: 'center' },
  tableScroller: { marginTop: 17, borderRadius: 13 },
  table: { width: TABLE_WIDTH, overflow: 'hidden', borderRadius: 13, backgroundColor: colors.white },
  tableRow: { flexDirection: 'row' },
  tableHeader: { minHeight: 50, backgroundColor: colors.blue },
  cell: { paddingHorizontal: 16, justifyContent: 'center' },
  dataRow: { minHeight: 56, backgroundColor: '#F7F7FA' },
  alternateRow: { backgroundColor: '#F1F2F7' },
  emptyTable: { height: 180, alignItems: 'center', justifyContent: 'center' },
});

export default SalesPerformanceScreen;
