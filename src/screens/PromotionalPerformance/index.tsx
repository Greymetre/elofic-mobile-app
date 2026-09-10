import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import axiosClient from '../../api/AxiosClient';
import AppText from '../../components/AppText/AppText';
import { colors } from '../../utils/Colors';

type Period = 'TODAY' | 'MTD' | 'YTD';
type ActivityType = '' | 'tent_meet' | 'van_activity' | 'mechanic_meet' | 'retailer_meet';
type SelectOption = { label: string; value: string | number };
type ApiOption = { id: string | number; name: string };

type PerformanceRow = {
  id: number;
  employee: string;
  branch_id: number | null;
  branch: string;
  tent_meet: number;
  van_activity: number;
  mechanic_meet: number;
  retailer_meet: number;
  total: number;
};

const columns = [
  { key: 'employee' as const, label: 'Employee', width: 215 },
  { key: 'tent_meet' as const, label: 'Tent\nMeet', width: 90 },
  { key: 'van_activity' as const, label: 'Van\nActivity', width: 100 },
  { key: 'mechanic_meet' as const, label: 'Mechanic\nMeet', width: 110 },
  { key: 'retailer_meet' as const, label: 'Retailer\nMeet', width: 105 },
  { key: 'total' as const, label: 'Total', width: 80 },
];
const TABLE_WIDTH = columns.reduce((sum, column) => sum + column.width, 0);

const PromotionalPerformanceScreen = () => {
  const navigation = useNavigation();
  const [period, setPeriod] = useState<Period>('TODAY');
  const [selectedBranch, setSelectedBranch] = useState<string | number>('');
  const [selectedUser, setSelectedUser] = useState<string | number>('');
  const [selectedType, setSelectedType] = useState<ActivityType>('');
  const [branches, setBranches] = useState<SelectOption[]>([{ label: 'All Zones', value: '' }]);
  const [users, setUsers] = useState<SelectOption[]>([{ label: 'All Users', value: '' }]);
  const [types, setTypes] = useState<SelectOption[]>([{ label: 'All Types', value: '' }]);
  const [rows, setRows] = useState<PerformanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const refreshingRef = useRef(false);

  useEffect(() => {
    let active = true;

    const fetchReport = async () => {
      try {
        if (!refreshingRef.current) setLoading(true);
        setError(false);
        const response = await axiosClient.get('api/dashboard/promotional-performance', {
          params: {
            period,
            branch_id: selectedBranch || undefined,
            user_id: selectedUser || undefined,
            type: selectedType || undefined,
          },
        });
        const data = response.data?.data;

        if (active) {
          setRows(Array.isArray(data?.rows) ? data.rows : []);
          setBranches(toOptions('All Zones', data?.filters?.branches));
          setUsers(toOptions('All Users', data?.filters?.users));
          setTypes(toOptions('All Types', data?.filters?.types));
        }
      } catch (fetchError) {
        console.log('Failed to fetch promotional performance:', fetchError);
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

    fetchReport();
    return () => {
      active = false;
    };
  }, [period, retryKey, selectedBranch, selectedType, selectedUser]);

  const groupedRows = useMemo(() => {
    const groups = new Map<string, PerformanceRow[]>();
    rows.forEach(row => groups.set(row.branch, [...(groups.get(row.branch) ?? []), row]));
    return Array.from(groups.entries());
  }, [rows]);

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
          <AppText size={14} color="#D9E0F8" family="InterMedium" style={styles.eyebrow}>Promotional Activities</AppText>
          <AppText size={28} color={colors.white} family="InterBold">Performance Report</AppText>
        </SafeAreaView>
      </View>

      <View style={styles.filters}>
        <FilterDropdown data={branches} value={selectedBranch} placeholder="Zone" onChange={setSelectedBranch} />
        <FilterDropdown data={users} value={selectedUser} placeholder="User" onChange={setSelectedUser} />
        <FilterDropdown data={types} value={selectedType} placeholder="Type" onChange={value => setSelectedType(value as ActivityType)} />
      </View>

      <View style={styles.periodTabs}>
        {(['TODAY', 'MTD', 'YTD'] as Period[]).map(item => {
          const selected = period === item;
          return (
            <Pressable key={item} onPress={() => setPeriod(item)} style={[styles.periodTab, selected && styles.activePeriodTab]}>
              <AppText size={14} color={selected ? colors.white : '#89899F'} family="InterBold">{item === 'TODAY' ? 'Today' : item}</AppText>
            </Pressable>
          );
        })}
      </View>

      {loading && !refreshing ? (
        <View style={styles.feedback}>
          <ActivityIndicator color={colors.blue} size="large" />
          <AppText size={13} color="#89899F" family="InterMedium">Loading report…</AppText>
        </View>
      ) : error ? (
        <View style={styles.feedback}>
          <AppText size={14} color="#89899F" family="InterMedium">Unable to load promotional report</AppText>
          <Pressable onPress={() => setRetryKey(value => value + 1)} hitSlop={8}>
            <AppText size={14} color={colors.blue} family="InterSemiBold">Retry</AppText>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.blue} />}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                {columns.map(column => (
                  <View key={column.key} style={[styles.cell, { width: column.width }]}>
                    <AppText size={12} color={colors.white} family="InterBold" align={column.key === 'employee' ? 'left' : 'center'} lineHeight={15}>{column.label}</AppText>
                  </View>
                ))}
              </View>

              {groupedRows.length === 0 ? (
                <View style={styles.emptyTable}>
                  <AppText size={14} color="#89899F" family="InterMedium">No employees found</AppText>
                </View>
              ) : groupedRows.map(([branch, branchRows]) => (
                <View key={branch}>
                  <View style={styles.branchHeader}>
                    <AppText size={14} color={colors.blue} family="InterBold">Zone - {branch}</AppText>
                  </View>
                  {branchRows.map((row, index) => <ReportRow key={row.id} row={row} alternate={index % 2 === 1} />)}
                  <ZoneTotal branch={branch} rows={branchRows} />
                </View>
              ))}
            </View>
          </ScrollView>
          <View style={styles.bottomSpace} />
        </ScrollView>
      )}
    </View>
  );
};

const ReportRow = ({ row, alternate }: { row: PerformanceRow; alternate: boolean }) => (
  <View style={[styles.tableRow, styles.dataRow, alternate && styles.alternateRow]}>
    {columns.map(column => (
      <View key={column.key} style={[styles.cell, { width: column.width }]}>
        <AppText size={13} color="#202020" family={column.key === 'total' ? 'InterBold' : 'InterMedium'} align={column.key === 'employee' ? 'left' : 'center'} numLines={1}>
          {row[column.key]}
        </AppText>
      </View>
    ))}
  </View>
);

const ZoneTotal = ({ branch, rows }: { branch: string; rows: PerformanceRow[] }) => {
  const totals = {
    tent_meet: rows.reduce((sum, row) => sum + row.tent_meet, 0),
    van_activity: rows.reduce((sum, row) => sum + row.van_activity, 0),
    mechanic_meet: rows.reduce((sum, row) => sum + row.mechanic_meet, 0),
    retailer_meet: rows.reduce((sum, row) => sum + row.retailer_meet, 0),
    total: rows.reduce((sum, row) => sum + row.total, 0),
  };

  return (
    <View style={[styles.tableRow, styles.totalRow]}>
      {columns.map(column => (
        <View key={column.key} style={[styles.cell, { width: column.width }]}>
          <AppText size={13} color="#202020" family="InterBold" align={column.key === 'employee' ? 'left' : 'center'}>
            {column.key === 'employee' ? `${branch} total` : totals[column.key]}
          </AppText>
        </View>
      ))}
    </View>
  );
};

const toOptions = (allLabel: string, items?: ApiOption[]): SelectOption[] => [
  { label: allLabel, value: '' },
  ...(Array.isArray(items) ? items.map(item => ({ label: item.name, value: item.id })) : []),
];

const FilterDropdown = ({ data, value, placeholder, onChange }: {
  data: SelectOption[];
  value: string | number;
  placeholder: string;
  onChange: (value: string | number) => void;
}) => (
  <Dropdown
    style={styles.dropdown}
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F4F8' },
  hero: { minHeight: 210, paddingHorizontal: 20, backgroundColor: colors.blue },
  backButton: { width: 38, height: 38, marginTop: 8, marginBottom: 22, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  eyebrow: { marginBottom: 5 },
  filters: { paddingHorizontal: 16, paddingTop: 17, flexDirection: 'row', gap: 9 },
  dropdown: { flex: 1, height: 42, paddingHorizontal: 12, borderWidth: 1, borderColor: '#D8D9E1', borderRadius: 22, backgroundColor: colors.white },
  dropdownMenu: { borderRadius: 12 },
  dropdownText: { marginRight: 3, color: '#252525', fontSize: 12 },
  dropdownItemText: { color: '#252525', fontSize: 13 },
  periodTabs: { height: 52, padding: 5, marginHorizontal: 16, marginTop: 17, marginBottom: 17, borderRadius: 27, backgroundColor: '#EEEEF8', flexDirection: 'row' },
  periodTab: { flex: 1, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  activePeriodTab: { backgroundColor: colors.blue },
  feedback: { flex: 1, gap: 12, alignItems: 'center', justifyContent: 'center' },
  table: { width: TABLE_WIDTH, marginHorizontal: 16, overflow: 'hidden', backgroundColor: colors.white },
  tableRow: { flexDirection: 'row' },
  tableHeader: { minHeight: 58, backgroundColor: colors.blue },
  cell: { paddingHorizontal: 12, justifyContent: 'center' },
  branchHeader: { height: 42, paddingHorizontal: 16, backgroundColor: '#E7EAF8', justifyContent: 'center' },
  dataRow: { minHeight: 54, borderBottomWidth: 1, borderBottomColor: '#ECEEF3', backgroundColor: '#F7F7FA' },
  alternateRow: { backgroundColor: '#F1F2F7' },
  totalRow: { minHeight: 50, backgroundColor: '#E7EAF8' },
  emptyTable: { height: 190, alignItems: 'center', justifyContent: 'center' },
  bottomSpace: { height: 30 },
});

export default PromotionalPerformanceScreen;
