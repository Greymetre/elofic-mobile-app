import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import axiosClient from '../../api/AxiosClient';
import AppText from '../../components/AppText/AppText';
import { colors } from '../../utils/Colors';

type AttendanceType = '' | 'market' | 'leave' | 'mis_punch' | 'holiday';

type AttendanceRow = {
  id: number;
  branch_id: number | null;
  branch: string;
  employee: string;
  reporting_head: string;
  type: Exclude<AttendanceType, ''>;
  market: boolean;
  leave: boolean;
  mis_punch: boolean;
  holiday: boolean;
};

type FilterOption = { id: number; name: string };
type DropdownOption = { label: string; value: string | number };

const TABLE_WIDTH = 800;
const statusColumns = [
  { key: 'market' as const, label: 'Market' },
  { key: 'leave' as const, label: 'Leave' },
  { key: 'mis_punch' as const, label: 'Mis Punch' },
  { key: 'holiday' as const, label: 'Holiday' },
];

const typeOptions: DropdownOption[] = [
  { label: 'All Types', value: '' },
  { label: 'Market', value: 'market' },
  { label: 'Leave', value: 'leave' },
  { label: 'Mis Punch', value: 'mis_punch' },
  { label: 'Holiday', value: 'holiday' },
];

const getToday = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());

const formatDisplayDate = (date: string) => new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}).format(new Date(`${date}T12:00:00`));

const AttendanceOverviewScreen = () => {
  const navigation = useNavigation();
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [users, setUsers] = useState<DropdownOption[]>([{ label: 'All Users', value: '' }]);
  const [branches, setBranches] = useState<DropdownOption[]>([{ label: 'All Zones', value: '' }]);
  const [selectedUser, setSelectedUser] = useState<string | number>('');
  const [selectedBranch, setSelectedBranch] = useState<string | number>('');
  const [selectedType, setSelectedType] = useState<AttendanceType>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const refreshingRef = useRef(false);
  const today = getToday();

  useEffect(() => {
    let active = true;

    const fetchOverview = async () => {
      try {
        if (!refreshingRef.current) setLoading(true);
        setError(false);
        const response = await axiosClient.get('api/attendance/overview', {
          params: {
            date: today,
            user_id: selectedUser || undefined,
            branch_id: selectedBranch || undefined,
            type: selectedType || undefined,
          },
        });
        const data = response.data?.data;

        if (active) {
          setRows(Array.isArray(data?.rows) ? data.rows : []);
          const userOptions = Array.isArray(data?.filters?.users) ? data.filters.users : [];
          const branchOptions = Array.isArray(data?.filters?.branches) ? data.filters.branches : [];
          setUsers([
            { label: 'All Users', value: '' },
            ...userOptions.map((item: FilterOption) => ({ label: item.name, value: item.id })),
          ]);
          setBranches([
            { label: 'All Zones', value: '' },
            ...branchOptions.map((item: FilterOption) => ({ label: item.name, value: item.id })),
          ]);
        }
      } catch (fetchError) {
        console.log('Failed to fetch attendance overview:', fetchError);
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

    fetchOverview();
    return () => {
      active = false;
    };
  }, [retryKey, selectedBranch, selectedType, selectedUser, today]);

  const groupedRows = useMemo(() => {
    const groups = new Map<string, AttendanceRow[]>();
    rows.forEach(row => groups.set(row.branch, [...(groups.get(row.branch) ?? []), row]));
    return Array.from(groups.entries());
  }, [rows]);

  const onRefresh = () => {
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
          <AppText size={13} color="#D9E0F8" family="InterMedium" style={styles.eyebrow}>Attendance Report</AppText>
          <AppText size={27} color={colors.white} family="InterBold">Today's Overview</AppText>
          <AppText size={13} color="#D9E0F8" family="InterMedium" style={styles.date}>{formatDisplayDate(today)}</AppText>
        </SafeAreaView>
      </View>

      <View style={styles.filters}>
        <FilterDropdown data={users} value={selectedUser} placeholder="User" onChange={setSelectedUser} active />
        <FilterDropdown data={branches} value={selectedBranch} placeholder="Zone" onChange={setSelectedBranch} />
        <FilterDropdown data={typeOptions} value={selectedType} placeholder="Type" onChange={value => setSelectedType(value as AttendanceType)} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.feedback}>
          <ActivityIndicator color={colors.blue} size="large" />
          <AppText size={13} color="#89899F" family="InterMedium">Loading attendance…</AppText>
        </View>
      ) : error ? (
        <View style={styles.feedback}>
          <AppText size={14} color="#89899F" family="InterMedium">Unable to load attendance overview</AppText>
          <Pressable onPress={() => setRetryKey(value => value + 1)} hitSlop={8}>
            <AppText size={14} color={colors.blue} family="InterSemiBold">Retry</AppText>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.blue} />}
          showsVerticalScrollIndicator={false}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <HeaderCell label="Branch" style={styles.branchCell} />
                <HeaderCell label="Employee" style={styles.employeeCell} />
                <HeaderCell label="Reporting Head" style={styles.reportingCell} />
                {statusColumns.map(column => <HeaderCell key={column.key} label={column.label} style={styles.statusCell} />)}
              </View>

              {groupedRows.length === 0 ? (
                <View style={styles.emptyTable}>
                  <AppText size={14} color="#89899F" family="InterMedium">No attendance records found</AppText>
                </View>
              ) : groupedRows.map(([branch, branchRows]) => (
                <View key={branch}>
                  <View style={styles.branchHeader}>
                    <AppText size={14} color={colors.blue} family="InterBold">{branch}</AppText>
                  </View>
                  {branchRows.map(row => (
                    <View key={row.id} style={[styles.tableRow, styles.dataRow]}>
                      <BodyCell text={row.branch} style={styles.branchCell} />
                      <BodyCell text={row.employee} style={styles.employeeCell} />
                      <BodyCell text={row.reporting_head} style={styles.reportingCell} link />
                      {statusColumns.map(column => (
                        <View key={column.key} style={[styles.cell, styles.statusCell]}>
                          {row[column.key] && <AppText size={20} color={colors.blue} family="InterBold">✓</AppText>}
                        </View>
                      ))}
                    </View>
                  ))}
                  <BranchTotal branch={branch} rows={branchRows} />
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

const FilterDropdown = ({ data, value, placeholder, onChange, active = false }: {
  data: DropdownOption[];
  value: string | number;
  placeholder: string;
  onChange: (value: string | number) => void;
  active?: boolean;
}) => (
  <Dropdown
    style={[styles.dropdown, active && styles.activeDropdown]}
    containerStyle={styles.dropdownMenu}
    selectedTextStyle={[styles.dropdownText, active && styles.activeDropdownText]}
    placeholderStyle={[styles.dropdownText, active && styles.activeDropdownText]}
    itemTextStyle={styles.dropdownItemText}
    data={data}
    labelField="label"
    valueField="value"
    value={value}
    placeholder={placeholder}
    onChange={item => onChange(item.value)}
    renderRightIcon={() => <AppText size={10} color={active ? colors.white : '#171719'}>▼</AppText>}
  />
);

const HeaderCell = ({ label, style }: { label: string; style: object }) => (
  <View style={[styles.cell, style]}>
    <AppText size={12} color={colors.white} family="InterBold">{label}</AppText>
  </View>
);

const BodyCell = ({ text, style, link = false }: { text: string; style: object; link?: boolean }) => (
  <View style={[styles.cell, style]}>
    <AppText size={13} color={link ? colors.blue : '#242424'} family={link ? 'InterSemiBold' : 'InterMedium'} underline={link ? 'underline' : 'none'} numLines={1}>
      {text}
    </AppText>
  </View>
);

const BranchTotal = ({ branch, rows }: { branch: string; rows: AttendanceRow[] }) => (
  <View style={[styles.tableRow, styles.totalRow]}>
    <BodyCell text={`${branch} total`} style={styles.branchCell} />
    <BodyCell text={String(rows.length)} style={styles.employeeCell} />
    <BodyCell text={String(rows.length)} style={styles.reportingCell} />
    {statusColumns.map(column => (
      <BodyCell key={column.key} text={String(rows.filter(row => row[column.key]).length)} style={styles.statusCell} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F4F8' },
  hero: { minHeight: 210, paddingHorizontal: 20, backgroundColor: colors.blue },
  backButton: { width: 38, height: 38, marginTop: 8, marginBottom: 17, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  eyebrow: { marginBottom: 5 },
  date: { marginTop: 3 },
  filters: { paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', gap: 8 },
  dropdown: { flex: 1, height: 42, paddingHorizontal: 13, borderWidth: 1, borderColor: '#D9DAE2', borderRadius: 22, backgroundColor: '#F7F7FA' },
  activeDropdown: { borderColor: colors.blue, backgroundColor: colors.blue },
  dropdownText: { marginRight: 3, color: '#242424', fontSize: 12, fontFamily: 'Inter-Medium' },
  activeDropdownText: { color: colors.white },
  dropdownMenu: { borderRadius: 12 },
  dropdownItemText: { color: '#242424', fontSize: 13 },
  feedback: { flex: 1, gap: 12, alignItems: 'center', justifyContent: 'center' },
  table: { width: TABLE_WIDTH, marginHorizontal: 16, backgroundColor: colors.white },
  tableRow: { flexDirection: 'row' },
  tableHeader: { minHeight: 50, backgroundColor: colors.blue },
  cell: { paddingHorizontal: 10, justifyContent: 'center' },
  branchCell: { width: 95 },
  employeeCell: { width: 180 },
  reportingCell: { width: 185 },
  statusCell: { width: 85, alignItems: 'center' },
  branchHeader: { height: 40, paddingHorizontal: 16, backgroundColor: '#E7EAF8', justifyContent: 'center' },
  dataRow: { minHeight: 52, borderBottomWidth: 1, borderBottomColor: '#ECEEF3' },
  totalRow: { minHeight: 48, backgroundColor: '#E7EAF8' },
  emptyTable: { height: 180, alignItems: 'center', justifyContent: 'center' },
  bottomSpace: { height: 30 },
});

export default AttendanceOverviewScreen;
