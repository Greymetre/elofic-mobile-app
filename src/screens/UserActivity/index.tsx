import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  View,
  TouchableOpacity,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { ArrowDownIcon, CalenderIcon, EyeIcon } from '../../assets/svgs/SvgsFile';
import AppText from '../../components/AppText/AppText';
import { styles } from './styles';
import { rw } from '../../utils/responsive';
import { colors } from '../../utils/Colors';
import store from '../../components/redux/Store';
import SummaryCard from '../../components/atoms/SummaryCard';
import { summaryStats1 } from '../../components/Comman/CommanFunction';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import CustomerCalendar from '../../components/CustomCalendar/CalendarPopupView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface User {
  id: number;
  name: string;
}

interface ActivityItem {
  user_id: number;
  name: string;
  date: string;
}

const UserActivityScreen = ({ navigation }: any) => {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<ActivityItem[]>([]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDesignations, setSelectedDesignations] = useState<string[]>([]);

  // Temporary states for filters (changes apply only after clicking Apply in modal)
  const [tempSelectedUser, setTempSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isUserFocus, setIsUserFocus] = useState(false);
  const [showCal, setShowCal] = useState(false);

  const [rangeType, setRange] = useState('currentMonth');

  const [startDate, setStartDate] = useState<Date>(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    return start;
  });

  const [endDate, setEndDate] = useState<Date>(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return end;
  });

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState<any>(null);

  // Format date to YYYY-MM-DD
  const formatYYYYMMDD = (date: Date): string => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleApply = (start: Date | null, end: Date | null, type: string) => {
    if (!start || !end) {
      Alert.alert("Invalid range", "Please select both start and end dates.");
      return;
    }
    const normalizedStart = new Date(start);
    normalizedStart.setHours(0, 0, 0, 0);
    const normalizedEnd = new Date(end);
    normalizedEnd.setHours(23, 59, 59, 999);

    setStartDate(normalizedStart);
    setEndDate(normalizedEnd);
    setCurrentPage(1);
    setRange(type || 'custom');
    setShowCal(false);

  };

  // Fetch Activity Data - Uses final applied filters
  const fetchData = useCallback(async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (page === 1) setLoading(true);

      setError(null);

      const token = store.getState()?.auth?.token;
      if (!token) {
        setError("No authentication token found");
        return;
      }
      console.log({
        start_date: formatYYYYMMDD(startDate),
        end_date: formatYYYYMMDD(endDate)
      }, 'sadjfhaksjhdfkja', page)
      const response = await fetch(
        'https://elofic.fieldkonnect.io/api/reporting/users',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            search_name: selectedUser?.id || null,
            start_date: formatYYYYMMDD(startDate),
            end_date: formatYYYYMMDD(endDate),
            page: page,
            pageSize: 20,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setUsers(result.users || []);
        setBranches(result.branches || []);

        if (page === 1) {
          setActivityData(result.data || []);
        } else {
          setActivityData(prev => [...prev, ...result.data]);
        }

        setCurrentPage(result.pagination?.current_page || 1);
        setTotalPages(result.pagination?.last_page || 1);
        setHasMore(result.pagination?.has_more || false);
      } else {
        setError(result.message || 'Failed to load data');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedUser?.id, selectedDesignations, startDate, endDate]);

  const loadMore = () => {
    if (loading || !hasMore || currentPage >= totalPages) return;
    fetchData(currentPage + 1);
  };

  const onRefresh = () => {
    setCurrentPage(1);
    fetchData(1, true);
  };

  const fetchHierarchyStats = useCallback(async () => {
    try {
      const token = store.getState()?.auth?.token;
      if (!token) return;

      const response = await axios.get(
        `https://elofic.fieldkonnect.io/api/getHierarchyOrderStats`,
        {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          params: {
            startdate: formatYYYYMMDD(startDate),
            enddate: formatYYYYMMDD(endDate),
            user_id: selectedUser?.id,
          },
        }
      );

      if (response.data?.status === 'success') {
        setStats(response.data.data);
      }
    } catch (err: any) {
      console.error('Stats fetch error:', err);
      Toast.show({ type: 'error', text1: 'Failed to load dashboard stats' });
    }
  }, [selectedUser?.id, selectedDesignations, startDate, endDate]);


  useEffect(() => {
    setCurrentPage(1);
    fetchData(1);
  }, [fetchData]);

  useEffect(() => {
    fetchHierarchyStats();
  }, [fetchHierarchyStats]);

  const clearUserFilter = () => {
    setTempSelectedUser(null);
    setSelectedUser(null);
    setCurrentPage(1);
  };

  const renderItem = useCallback(({ item }: { item: ActivityItem }) => (
    <Pressable
      style={[styles.listItem, styles.row]}
      onPress={() => navigation.navigate('IndividualPage', { item })}
    >
      <View style={{ flex: 1, gap: 3 }}>
        <AppText color='black' size={16} family='InterBold'>
          {item.name}
        </AppText>
        <AppText color='black' size={14} family='InterRegular' opacity={0.8}>
          {item.date}
        </AppText>
      </View>
      <View style={[styles.row, { gap: 9 }]}>
        <View style={[styles.iconView, styles.center]}>
          <EyeIcon />
        </View>
      </View>
    </Pressable>
  ), [navigation]);

  // const filteredData = selectedUser
  //   ? activityData.filter(item => item.user_id === selectedUser.id)
  //   : activityData;

  return (
    <View style={styles.container}>
      <View
        style={[styles.container, { paddingHorizontal: rw(18) }]}
      // showsVerticalScrollIndicator={false}
      >
        {/* Filters */}
        <View style={{ gap: 15, marginTop: 15 }}>

          {/* User Dropdown */}
          <View style={[styles.row, { gap: 13, alignItems: 'center' }]}>
            <View style={{ flex: 1, height: 45 }}>
              <Dropdown
                style={[styles.UserBox, isUserFocus && { borderColor: colors.blue }]}
                placeholderStyle={{ color: '#718096', fontSize: 14 }}
                selectedTextStyle={{ color: 'black', fontSize: 14 }}
                data={users}
                search
                maxHeight={300}
                labelField="name"
                valueField="id"
                placeholder="Select User"
                searchPlaceholder="Search user..."
                value={selectedUser?.id}
                onFocus={() => setIsUserFocus(true)}
                onBlur={() => setIsUserFocus(false)}
                onChange={(item: User) => {
                  setSelectedUser(item);
                  setTempSelectedUser(item);
                  setCurrentPage(1);
                }}
                renderRightIcon={() => <ArrowDownIcon />}
              />
            </View>

            {(tempSelectedUser || selectedUser) && (
              <TouchableOpacity onPress={clearUserFilter} style={{
                backgroundColor: '#EF4444',
                paddingHorizontal: rw(16),
                paddingVertical: rw(10),
                borderRadius: 8,
                minWidth: rw(80),
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <AppText color="white" size={14} family="InterMedium">Clear</AppText>
              </TouchableOpacity>
            )}
          </View>

          {/* Designation Button */}
        </View>

        {/* Date Range Selector */}
        <Pressable style={[styles.dateTimeBox2, styles.row]} onPress={() => setShowCal(true)}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <AppText size={12} color="black" family="InterRegular">
              {formatYYYYMMDD(startDate)} : {formatYYYYMMDD(endDate)}
            </AppText>
          </View>
          <View style={[styles.calenderICon, styles.center]}>
            <CalenderIcon size={16} color={colors.blue} />
          </View>
        </Pressable>

        {/* Summary Cards */}


        {/* Loading & Error */}
        {loading && (
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.blue} />
            <AppText style={{ marginTop: 12 }}>Loading activity...</AppText>
          </View>
        )}

        {error && !loading && (
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            <AppText color="red" size={15}>{error}</AppText>
          </View>
        )}

        {/* Activity List */}
        <FlatList
          data={activityData || []}
          keyExtractor={(item, index) => `${item.user_id}-${item.date}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={{ marginTop: 20, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListFooterComponent={
            loading && currentPage > 1 ? (
              <View style={{ padding: 20, alignItems: 'center', height: 90 }}>
                <ActivityIndicator size="small" color={colors.blue} />
              </View>
            ) : (
              <View style={{ padding: 20, alignItems: 'center', height: 90 }}>
              </View>
            )
          }
          ListHeaderComponent={() => (
            <FlatList
              data={summaryStats1}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ gap: rw(12), marginBottom: 12 }}
              renderItem={({ item }) => (
                <SummaryCard
                  item={item}
                  orderValue={stats?.total_order_value?.toLocaleString()}
                  quantity={stats?.total_quantity}
                  totalCustomer={stats?.total_secondary_customers || 0 + stats?.total_master_distributors || 0}
                  totalCheckIn={stats?.total_checkins}
                />
              )}
            />
          )}
          ListEmptyComponent={
            <View style={{ marginTop: 60, alignItems: 'center' }}>
              <AppText size={16} color="#718096">
                {selectedUser || selectedDesignations.length > 0
                  ? `No activity found for selected filters`
                  : "No activity data available for selected date range"}
              </AppText>
            </View>
          }
        />
      </View>

      

      {/* Calendar Modal */}
      <CustomerCalendar
        showCal={showCal}
        setShowCal={setShowCal}
        initialStartDate={startDate}
        initialEndDate={endDate}
        setStartDates={setStartDate}
        setEndDates={setEndDate}
        setRange={setRange}
        range={rangeType}
        onApplyClick={handleApply}
        minimumDate={null}
        calendarType="history"
      />
    </View>
  );
};

export default UserActivityScreen;