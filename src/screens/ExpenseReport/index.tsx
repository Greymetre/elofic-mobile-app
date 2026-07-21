import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  View,
  Pressable,
  RefreshControl,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Toast from 'react-native-toast-message';
import ActionSheet, { ActionSheetRef, ScrollView as ActionSheetScrollView, useScrollHandlers } from 'react-native-actions-sheet';
import { styles } from './styles';
import { rw } from '../../utils/responsive';
import { colors } from '../../utils/Colors';
import AppText from '../../components/AppText/AppText';
import { ApproveIcon, ArrowDownIcon, AttachemntIcon, CalenderIcon, CrossIcon } from '../../assets/svgs/SvgsFile';
import CustomerCalendar from '../../components/CustomCalendar/CalendarPopupView';
import store, { useAppSelector } from '../../components/redux/Store'; // Adjust path if needed
import { shadowStyle } from '../../utils/typography';
import { PlusIcon } from '../../assets/svgs/HomePageSvgs';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { SCREEN_HEIGHT } from '../../utils/misc';
import { useApproveExpenseStatus, useChangeAttendanceStatus, useExpenseDetails, useRejectExpenseStatus } from '../../api/query/CustomerApi';
import downloadExpenseImage from '../../utils/downloadUtils';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Gesture, GestureDetector, NativeViewGestureHandler } from 'react-native-gesture-handler';

// Replace your existing interface
interface User {
  id: number | null;     // ← Changed
  name: string;
}

const ExpenseReport = ({ navigation }: any) => {
  const { user } = useAppSelector((state) => state.auth);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const actionSheetRef1 = useRef<ActionSheetRef>(null);
  const [expenseDetails, setExpenseDetails] = useState<any>(null);
  const [punchInStatus, setPunchInStatus] = useState<any>(0);
  const [remark, setRemark] = useState<string>('');
  const [remarkError, setRemarkError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const remarkInputRef = useRef<TextInput>(null);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);

  const [isUserFocus, setIsUserFocus] = useState(false);
  const [isStatusFocus, setIsStatusFocus] = useState(false);

  // Calendar States
  const [showCal, setShowCal] = useState(false);
  const [rangeType, setRangeType] = useState<string>('currentMonth');
  const handlers = useScrollHandlers();
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

  const statusList = [
    { label: 'All', value: null },
    { label: 'Pending', value: 0 },
    { label: 'Approved', value: 1 },
    { label: 'Rejected', value: 2 },
    { label: 'Checked', value: 3 },
    { label: 'Checked By Reporting', value: 4 },
  ];


  const { mutateAsync: changeStatus, isPending: isSubmitting } = useRejectExpenseStatus();
  const { mutateAsync: changeStatusApprove, isPending: isSubmitting2 } = useApproveExpenseStatus();
  const { mutateAsync: mutateDetails } = useExpenseDetails();


  const handleExpneseDetails = async (expense_id: any) => {
    try {
      const response: any = await mutateDetails({ expense_id: expense_id });
      if (response?.data?.status === 'success') {
        setExpenseDetails(response?.data?.data);
        setPunchInStatus(response?.data?.data?.status);
        setRemark(response?.data?.data?.status === 'rejected' ? response?.data?.data?.note || '' : '');
      }
    } catch (error) {
      console.error('Error fetching expense details:', error);
    }
  }

  // Format date to YYYY-MM-DD
  const formatYYYYMMDD = (date: Date): string => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Fetch Users for Dropdown
  // Replace your existing fetchUsers with this:
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const token = store.getState()?.auth?.token;

      if (!token) {
        Toast.show({ type: 'error', text1: 'Authentication token missing' });
        return;
      }

      const response = await fetch('https://elofic.fieldkonnect.io/api/reporting/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        const fetchedUsers = result.users || [];

        // Add "All Users" option at the top
        const allUsersOption: User = { id: null, name: 'All Users' };

        setUsers([allUsersOption, ...fetchedUsers]);

        // Set default as All Users
        setSelectedUser(allUsersOption);
      } else {
        Toast.show({ type: 'error', text1: result.message || 'Failed to load users' });
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      Toast.show({ type: 'error', text1: 'Failed to load user list' });
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Fetch Expenses with Pagination
  const fetchExpenses = useCallback(async (page: number = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (page === 1) setLoading(true);

      setError(null);

      const token = store.getState()?.auth?.token;
      if (!token) {
        setError('Authentication token missing');
        return;
      }

      const formData = new URLSearchParams();
      formData.append('pageSize', '10');
      formData.append('page', page.toString());
      formData.append('start_date', formatYYYYMMDD(startDate));
      formData.append('end_date', formatYYYYMMDD(endDate));

      if (selectedStatus !== null) {
        formData.append('status', selectedStatus.toString());
      }
      if (selectedUser && selectedUser.id !== null) {
        formData.append('user_id', selectedUser.id.toString());
      }

      const response = await fetch('https://elofic.fieldkonnect.io/api/allExpenseListing', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const result = await response.json();
      console.log(result, 'resultresultresult', page)
      if (response.ok) {
        const newData = result.data || [];

        if (page === 1) {
          setExpenses(newData);
        } else {
          setExpenses((prev) => [...prev, ...newData]);
        }

        setCurrentPage(result.pagination?.current_page || page);
        setTotalPages(result.pagination?.last_page || 1);
        setHasMore(newData.length === 10);
      } else {
        setError(result.message || 'Failed to fetch expenses');
        if (page === 1) setExpenses([]);
      }
    } catch (err) {
      console.error('Fetch expenses error:', err);
      setError('Network error. Please try again.');
      Toast.show({ type: 'error', text1: 'Failed to load expenses' });
      if (page === 1) setExpenses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startDate, endDate, selectedUser, selectedStatus]);

  const loadMore = () => {
    console.log(currentPage, 'redasdfasdfasdf', loading, hasMore, totalPages)
    if (loading || !hasMore || currentPage >= totalPages) return;
    console.log(currentPage, 'currentPagecurrentPage')
    fetchExpenses(currentPage + 1);
  };

  const onRefresh = () => {
    setCurrentPage(1);
    fetchExpenses(1, true);
  };

  // Handle Calendar Apply
  const handleApply = (start: any, end: any, type: string) => {
    const startDateObj = typeof start === 'string' ? new Date(start) : start;
    const endDateObj = typeof end === 'string' ? new Date(end) : end;

    startDateObj.setHours(0, 0, 0, 0);
    endDateObj.setHours(23, 59, 59, 999);

    setStartDate(startDateObj);
    setEndDate(endDateObj);
    setRangeType(type || 'custom');
    setShowCal(false);
    setCurrentPage(1); // Reset pagination on date change
  };

  // Replace useFocusEffect
  useFocusEffect(
    useCallback(() => {
      setCurrentPage(1);
      setExpenses([]);
      setHasMore(true);
      fetchExpenses(1);

    }, [fetchExpenses])
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]
  );

  // Add this useEffect after useFocusEffect
  useEffect(() => {
    setCurrentPage(1);
    setExpenses([]);
    setHasMore(true);
    fetchExpenses(1);
  }, [selectedUser, selectedStatus, startDate, endDate]);




  // Render Expense Item
  const renderItem = ({ item }: { item: any }) => (
    <Pressable style={[styles.listItem, shadowStyle]} onPress={() => {
      actionSheetRef?.current?.show();
      // setExpenseDetails(item);
      // setPunchInStatus(item?.status);
      handleExpneseDetails(item?.id);
    }}>
      <View style={[styles.row, { justifyContent: 'space-between' }]}>
        <View style={{ width: '48%' }}>
          <AppText color="black" family="InterSemiBold" size={16}>
            {item.name || item.user_name || 'N/A'}
          </AppText>
          <AppText color="#888888" family="InterMedium" size={13}>
            #{item.id || item.expense_id || 'N/A'}
          </AppText>
        </View>
        <View style={{ width: '48%', alignItems: 'flex-end' }}>
          <AppText color="#395299" family="InterBold" size={18}>
            ₹ {parseFloat(item?.claim_amount || 0).toFixed(2)}
          </AppText>
          <AppText color="#395299" family="InterSemiBold" size={14}>
            {item?.category || item?.expenses_type_name || 'Other'}
          </AppText>
        </View>
      </View>

      <View style={styles.line} />

      <View style={[styles.row, { flex: 1, justifyContent: 'space-between', gap: 30 }]}>
        <View style={styles.firstPunchIN}>
          <AppText color="#888888" family="InterRegular" size={13}>Date</AppText>
          <AppText color="black" family="InterSemiBold" size={14}>
            {item.date || item.created_at?.split('T')[0] || 'N/A'}
          </AppText>
        </View>
        <View style={styles.firstPunchIN}>
          <AppText color="#888888" family="InterRegular" size={13}>Attachments</AppText>
          <AppText color="black" family="InterSemiBold" size={14}>
            {item?.expense_image && item?.expense_image?.length !== 0 ? 'Yes' : 'NA'}
          </AppText>
        </View>
        <View style={styles.firstPunchIN}>
          <AppText color="#888888" family="InterRegular" size={13}>Status</AppText>
          <AppText
            color={
              item.status === "Pending"
                ? '#E78422'
                : item.status === "Approved"
                  ? '#339D4F'
                  : '#FF3333'
            }
            family="InterSemiBold"
            size={14}
          >
            {item.status}
          </AppText>
        </View>
      </View>
      {
        (item?.total_km && item?.total_km > 0) ? (
          <View style={[styles.row, { flex: 1, justifyContent: 'space-between', gap: 30, marginTop: 10 }]}>
            <View style={[styles.firstPunchIN,]}>
              <AppText color="#888888" family="InterRegular" size={13}>Rate</AppText>
              <AppText color="black" family="InterSemiBold" size={14}>
                <AppText color="black" family="InterSemiBold" size={18}>
                  ₹{' '}
                </AppText>{item?.claim_amount / parseFloat(item?.total_km) || 'N/A'}
              </AppText>
            </View>
            {
              item?.approve_amount && (
                <View style={[styles.firstPunchIN, { flex: 0.68, }]}>
                  <AppText color="#888888" family="InterRegular" size={13}>Approve Amount</AppText>
                  <View style={{ flexDirection: "row", alignItems: 'center', gap: 8 }}>
                    <ApproveIcon />
                    <AppText color="black" family="InterSemiBold" size={14}>
                      {item?.expense_image && item?.expense_image?.length !== 0 ? 'Yes' : 'NA'}
                    </AppText>
                  </View>
                </View>
              )
            }


          </View>
        ) : (
          <View style={[styles.row, { flex: 1, justifyContent: 'space-between', gap: 30, marginTop: 10 }]}>
            {
              item?.approve_amount && (
                <View style={[styles.firstPunchIN, { flex: 0.68, }]}>
                  <AppText color="#888888" family="InterRegular" size={13}>Approve Amount</AppText>
                  <View style={{ flexDirection: "row", alignItems: 'center', gap: 8 }}>
                    <ApproveIcon />
                    <AppText color="black" family="InterSemiBold" size={14}>
                      <AppText color="black" family="InterSemiBold" size={18}>
                        ₹{' '}
                      </AppText>{item?.approve_amount || 'NA'}
                    </AppText>
                  </View>
                </View>
              )
            }


          </View>
        )
      }

    </Pressable>
  );

  const downloadExpenseFile = async (url: string) => {
    if (!url) {
      Toast.show({ type: 'error', text1: 'No file URL found' });
      return;
    }

    try {
      Toast.show({ type: 'info', text1: 'Downloading...' });

      const { config, fs } = ReactNativeBlobUtil;
      const fileName = url.split('/').pop() || `expense_file_${Date.now()}`;

      // For Android - use Download Manager (shows notification)
      const androidConfig = {
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: fileName,
          description: 'Expense document download',
          mime: url.toLowerCase().endsWith('.pdf')
            ? 'application/pdf'
            : 'image/jpeg',   // adjust if needed
          path: `${fs.dirs.DownloadDir}/${fileName}`,
        },
      };

      // For iOS - save to Documents
      const iosConfig = {
        fileCache: true,
        path: `${fs.dirs.DocumentDir}/${fileName}`,
      };

      const downloadConfig = Platform.OS === 'android' ? androidConfig : iosConfig;

      const res = await config(downloadConfig)
        .fetch('GET', url);

      if (res.info().status === 200) {
        const finalPath = res.path();

        Toast.show({
          type: 'success',
          text1: 'Download Successful',
          text2: fileName,
        });

        // Optional: Preview on iOS
        if (Platform.OS === 'ios') {
          ReactNativeBlobUtil.ios.previewDocument(finalPath);
        }

        // Optional: For Android, you can also open with intent if needed
      } else {
        // throw new Error('Download failed');
      }
    } catch (error: any) {
      console.log('Download error:', error);
      Toast.show({
        type: 'error',
        text1: 'Download',
        text2: error?.message || 'Please try again',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View
        style={[styles.container, { paddingHorizontal: rw(18) }]}
      >
        {/* User & Status Dropdowns */}
        <View style={{}}>
          <View style={[styles.row, { gap: 13, marginTop: 15, height: 48 }]}>
            <View style={{ flex: 1, height: 48 }}>
              <Dropdown
                style={[styles.UserBox, isUserFocus && { borderColor: colors.blue }, { height: 48, flex: 1, }]}
                data={users}
                search
                maxHeight={300}
                labelField="name"
                valueField="id"
                placeholder={usersLoading ? 'Loading users...' : 'All Users'}
                value={selectedUser}
                onFocus={() => setIsUserFocus(true)}
                onBlur={() => setIsUserFocus(false)}
                onChange={setSelectedUser}
                renderRightIcon={() => <ArrowDownIcon />}
                disable={usersLoading}

              />
            </View>

            <View style={{ flex: 1 }}>
              <Dropdown
                style={[styles.UserBox, isStatusFocus && { borderColor: colors.blue }, { height: 48, flex: 1 }]}
                data={statusList}
                labelField="label"
                valueField="value"
                placeholder="Status"
                value={selectedStatus}
                onFocus={() => setIsStatusFocus(true)}
                onBlur={() => setIsStatusFocus(false)}
                onChange={(item) => setSelectedStatus(item.value)}
                renderRightIcon={() => <ArrowDownIcon />}
              />
            </View>
          </View>

          {/* Date Range Selector */}
          <Pressable style={[styles.dateTimeBox, styles.row, { marginTop: 10, marginBottom: 20, height: 48, flex: 0 }]} onPress={() => setShowCal(true)}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <AppText size={14} color="#718096" family="InterRegular">
                {formatYYYYMMDD(startDate)} - {formatYYYYMMDD(endDate)}
              </AppText>
            </View>
            <View style={[styles.calenderICon, styles.center]}>
              <CalenderIcon size={16} color={colors.blue} />
            </View>
          </Pressable>
        </View>

        {/* Expense List */}
        <FlatList
          data={expenses}
          keyExtractor={(item, index) => `expense-${item.id || index}`}
          renderItem={renderItem}
          style={{ flex: 1 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.blue]} />
          }
          ListFooterComponent={
            loading && currentPage > 1 ? (
              <View style={{ padding: 20, alignItems: 'center', paddingBottom: 100 }}>
                <ActivityIndicator size="large" color={colors.blue} />
              </View>
            ) : (
              <View style={{ height: 20 + useSafeAreaInsets()?.bottom || 0, alignItems: 'center', paddingBottom: 100 }}>

              </View>
            )
          }
          ListEmptyComponent={() => {
            if (!loading) {
              return (
                <View style={{ marginTop: 60, alignItems: 'center' }}>
                  <AppText size={16} color="#718096">
                    {error || 'No expenses found '}
                  </AppText>
                </View>
              )
            }
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => {
            return (
              <></>
            )
          }}
        />

        {/* <View style={{ height: 120 }} /> */}
      </View>

      {/* Calendar Modal */}
      <CustomerCalendar
        showCal={showCal}
        setShowCal={setShowCal}
        initialStartDate={startDate}
        initialEndDate={endDate}
        setStartDates={setStartDate}
        setEndDates={setEndDate}
        setRange={setRangeType}
        range={rangeType}
        onApplyClick={handleApply}
        calendarType="history"
        minimumDate={null}
      />
      <Pressable
        style={{
          position: 'absolute',
          bottom: 50 + useSafeAreaInsets().bottom,  // Adjust for safe area
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.blue,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 8,
        }}
        onPress={() => {
          navigation.navigate('AddNewExpense');   // Uncomment when you have navigation
        }}
      >
        <PlusIcon width={28} height={28} color="white" />
      </Pressable>
      {/* Global Loading */}
      {loading && currentPage === 1 && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.7)',
          }}
        >
          <ActivityIndicator size="large" color={colors.blue} />
        </View>
      )}

      {/* <SafeAreaView /> */}
      <ActionSheet
        ref={actionSheetRef}
        gestureEnabled={false}
        isModal={false}

        useBottomSafeAreaPadding
        containerStyle={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: 'white',
          // paddingBottom: 20,
          maxHeight: SCREEN_HEIGHT * 0.9,
          height: 'auto'

        }}
        indicatorStyle={{
          height: 0,
          backgroundColor: 'transparent',
        }}
        closeOnTouchBackdrop={true}
        onClose={() => {
          setPunchInStatus(5)
          setRemark('')
          setRemarkError('')
          setExpenseDetails(null)
        }}
      >
        <View style={[{}]}>
          <View style={[styles.modalheader]}>
            <AppText size={16} color='white' family='InterSemiBold'>Expense Approval Detail</AppText>
            <Pressable style={{ position: "absolute", right: 15 }} onPress={() => {
              actionSheetRef.current?.hide();
              // setIsModalVisible(false)
            }}>
              <CrossIcon />
            </Pressable>
          </View>
          <GestureDetector gesture={Gesture.Native()}>
            <ActionSheetScrollView
              style={{ width: '100%', maxHeight: SCREEN_HEIGHT * 0.7 }}
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="on-drag"
            >
              <View style={styles.mainOCntainer} >
                <View style={[styles.row, { gap: 21 }]}>
                  <View style={styles.firstViewModal}>
                    <AppText size={14} family='InterMedium' color='#333333'>User Name</AppText>
                    <AppText size={14} family='InterBold' color='black'>{expenseDetails?.user_name}</AppText>
                  </View>
                  <View style={[styles.firstViewModal, { flex: 0.45 }]}>
                    <AppText size={14} family='InterMedium' color='#333333'>User ID</AppText>
                    <AppText size={14} family='InterBold' color='black'>#{expenseDetails?.user_id}</AppText>
                  </View>
                </View>
                <View style={[styles.row, { gap: 21, marginTop: 15 }]}>
                  <View style={styles.firstViewModal}>
                    <AppText size={14} family='InterMedium' color='#333333'>Expense Status</AppText>
                    <AppText size={14} family='InterBold'
                      color={expenseDetails?.status === "Pending"
                        ? '#E78422'
                        : expenseDetails?.status === "Approved"
                          ? '#339D4F'
                          : '#FF3333'}
                    >{expenseDetails?.status}</AppText>
                  </View>
                  <View style={[styles.firstViewModal, { flex: 0.45 }]}>
                    <AppText size={14} family='InterMedium' color='#333333'>Type</AppText>
                    <AppText size={14} family='InterBold' color='black'>{expenseDetails?.expenses_type_name}</AppText>
                  </View>
                </View>

                <View style={[styles.row, { gap: 21, marginTop: 15 }]}>
                  <View style={styles.firstViewModal}>
                    <AppText size={14} family='InterMedium' color='#333333'>{"Claim Amount"}</AppText>
                    <AppText size={14} family='InterBold' color='black'>{expenseDetails?.claim_amount}</AppText>
                  </View>
                  {
                    expenseDetails?.approve_amount && (
                      <View style={[styles.firstViewModal, { flex: 0.45, }]}>
                        <AppText size={14} family='InterMedium' color='#333333'>Approved Amount</AppText>
                        <View style={{ alignItems: "center", flexDirection: 'row', gap: 5 }}>
                          <ApproveIcon />
                          <AppText size={14} family='InterBold' color='black'>{expenseDetails?.approve_amount}</AppText>
                        </View>
                      </View>
                    )
                  }


                </View>


                <View style={[styles.row, { gap: 21, marginTop: 15 }]}>
                  <View style={styles.firstViewModal}>
                    <AppText size={14} family='InterMedium' color='#333333'>{"Note-"}</AppText>
                    <AppText size={14} family='InterBold' color='black'>{expenseDetails?.note}</AppText>
                  </View>
                  {
                    expenseDetails?.rate && (
                      <View style={[styles.firstViewModal, { flex: 0.45, }]}>
                        <AppText size={14} family='InterMedium' color='#333333'>{"Rate"}</AppText>
                        <AppText size={14} family='InterBold' color='black'>{expenseDetails?.rate}</AppText>
                      </View>
                    )
                  }


                </View>
                <View style={[styles.row, { gap: 21, marginTop: 15 }]}>
                  <View style={styles.firstViewModal}>
                    <AppText size={14} family='InterMedium' color='#333333'>{"Expense Date"}</AppText>
                    <AppText size={14} family='InterBold' color='black'>{expenseDetails?.date}</AppText>
                  </View>

                  <View style={[styles.firstViewModal, { flex: 0.45, }]}>
                    <AppText size={14} family='InterMedium' color='#333333'>{"Expense ID"}</AppText>
                    <AppText size={14} family='InterBold' color='black'>#{expenseDetails?.id}</AppText>
                  </View>

                </View>

                {
                  expenseDetails?.expense_image?.length > 0 && (
                    <View style={[styles.row, { gap: 21, marginTop: 15, justifyContent: 'space-between', flex: 1 }]}>
                      <View style={[styles.firstViewModal, { flex: 1, }]}>
                        <AppText size={14} family='InterMedium' color='#333333'>{"Attachments"}</AppText>
                        <AppText size={14} family='InterBold' color='black'>{expenseDetails?.expenses_type_name} Bill</AppText>
                      </View>
                      <View style={[{ alignItems: "flex-end", }]}>
                        <Pressable style={[{ height: 35, paddingHorizontal: 8, paddingVertical: 5, justifyContent: 'center', alignItems: "center", backgroundColor: colors.blue, borderRadius: 6, gap: 8 }, styles.row]} onPress={() => {
                          if (expenseDetails?.expense_image?.length > 0) {
                            downloadExpenseFile(expenseDetails?.expense_image[0]);
                          }
                        }}>
                          <AttachemntIcon />
                          <AppText size={12} family='InterRegular' color='white'>Download</AppText>
                        </Pressable>
                      </View>

                    </View>
                  )
                }
                {
                  expenseDetails?.plan && (
                    <View style={[styles.row, { gap: 21, marginTop: 15 }]}>
                      <View style={styles.firstViewModal}>
                        <AppText size={14} family='InterMedium' color='#333333'>{"Today's Plan"}</AppText>
                        <AppText size={14} family='InterBold' color='black'>{expenseDetails?.plan?.objectives}</AppText>
                      </View>

                      <View style={[styles.firstViewModal, { flex: 0.45, }]}>
                        <AppText size={14} family='InterMedium' color='#333333'>{"Today's Visit"}</AppText>
                        <AppText size={14} family='InterBold' color='black'>{expenseDetails?.plan?.city?.city_name}</AppText>
                      </View>
                    </View>
                  )
                }

                <View style={[styles.row, { gap: 21, marginTop: 15 }]}>
                  <View style={styles.firstViewModal}>
                    <AppText size={14} family='InterMedium' color='#333333'>{"Total Visit"}</AppText>
                    <AppText size={14} family='InterBold' color='black'>{expenseDetails?.total_visit}</AppText>
                  </View>

                  <View style={[styles.firstViewModal, { flex: 0.45, }]}>
                    <AppText size={14} family='InterMedium' color='#333333'>{"Total KM"}</AppText>
                    <AppText size={14} family='InterBold' color='black'>{expenseDetails?.total_km}</AppText>
                  </View>

                </View>



                <View style={[styles.approveRejectView, styles.row, { gap: 20 }]}>
                  <View style={[styles.approveView, styles.row]}>
                    <Pressable
                      style={[styles.circle, styles.center]}
                      onPress={() => {
                        // Prevent self-approval
                        if (user?.id === expenseDetails?.user_id || expenseDetails?.status != "Pending") {
                          return;
                        }
                        if (user?.id == expenseDetails?.user_id) {
                          return
                        }
                        if (punchInStatus == 'Approved') {
                          setPunchInStatus(5)
                        } else {
                          setPunchInStatus('Approved')
                          actionSheetRef1.current?.show()
                          setTimeout(() => {
                            remarkInputRef.current?.focus();
                          }, 200);
                        }
                        // const isCurrentlyApproved = punchInStatus === 'Approved'
                        // const actionText = isCurrentlyApproved ? 'unapprove' : 'approve';

                        // Alert.alert(
                        //   "Confirm action",
                        //   `Are you sure you want to ${actionText} this expense record?`,
                        //   [
                        //     {
                        //       text: "Cancel",
                        //       style: "cancel",
                        //     },
                        //     {
                        //       text: isCurrentlyApproved ? "Unapprove" : "Approve",
                        //       style: isCurrentlyApproved ? "destructive" : "default",
                        //       onPress: () => {
                        //         // Only change status if user confirms
                        //         setPunchInStatus(isCurrentlyApproved ? 5 : "Approved");
                        //         setRemark('');
                        //         setRemarkError('');
                        //       },
                        //     },
                        //   ],
                        //   { cancelable: true }
                        // );
                      }}
                    >
                      <View
                        style={[
                          styles.circleInner,
                          punchInStatus === 'Approved' && { backgroundColor: "#339D4F", borderRadius: 12 },
                        ]}
                      />
                    </Pressable>
                    <AppText size={14} color='#339D4F' family='InterRegular'>Approved</AppText>
                  </View>

                  <View style={[styles.approveView, styles.row]}>
                    <Pressable style={[styles.circle, styles.center, { borderColor: "#FF3333" }]} onPress={() => {
                      if (user?.id == expenseDetails?.user_id || expenseDetails?.status != "Pending") {
                        return
                      }
                      if (punchInStatus == 'Rejected') {
                        setPunchInStatus(5)
                      } else {
                        setPunchInStatus('Rejected')
                        actionSheetRef1.current?.show()
                        setTimeout(() => {
                          remarkInputRef.current?.focus();
                        }, 200);
                      }
                    }}>
                      <View style={[styles.circleInner, punchInStatus == 'Rejected' && { backgroundColor: "#FF3333", borderRadius: 12, }]} />
                    </Pressable>
                    <AppText size={14} color='#FF3333' family='InterRegular'>Rejected</AppText>
                  </View>
                </View>

                {punchInStatus === 'Rejected' && (
                  <View style={{ marginBottom: 20 }}>
                    <AppText size={14} color="#333333" family="InterMedium">
                      {punchInStatus === 'Approved' ? "Approved Ammount" : "Reason for Rejection"} <AppText color="red">*</AppText>
                    </AppText>

                    <Pressable
                      style={{
                        marginTop: 8,
                        borderWidth: 1,
                        borderColor: remarkError ? 'red' : '#d1d5db',
                        borderRadius: 8,
                        backgroundColor: '#f9fafb',
                      }}
                      onPress={() => {
                        if (user?.id == expenseDetails?.user_id || expenseDetails?.status != "Pending") {
                          return
                        }
                        actionSheetRef1.current?.show()
                        setTimeout(() => {
                          remarkInputRef.current?.focus();
                        }, 200);
                      }}
                    >
                      <TextInput
                        // multiline
                        // numberOfLines={3}
                        editable={false}
                        value={remark}
                        onChangeText={(text) => {
                          setRemark(text);
                          if (remarkError) setRemarkError(''); // clear error on typing
                        }}
                        placeholder="Enter reason for rejection..."
                        placeholderTextColor="#9ca3af"
                        style={{
                          padding: 12,
                          fontSize: 14,
                          color: '#1f2937',
                          textAlignVertical: 'top',
                        }}
                        onPress={() => {
                          if (user?.id == expenseDetails?.user_id || expenseDetails?.status != "Pending") {
                            return
                          }
                          actionSheetRef1.current?.show()
                          setTimeout(() => {
                            remarkInputRef.current?.focus();
                          }, 200);
                        }}
                      />
                    </Pressable>

                    {remarkError ? (
                      <AppText size={12} color="red" family="InterRegular" style={{ marginTop: 4 }}>
                        {remarkError}
                      </AppText>
                    ) : null}
                  </View>
                )}

              </View>
            </ActionSheetScrollView>
          </GestureDetector>
          <Pressable
            style={[
              styles.submit,
              { height: 44, marginHorizontal: 20, },
              styles.center,
              isSubmitting && { opacity: 0.6 },
              isSubmitting2 && { opacity: 0.6 },
            ]}
            disabled={isSubmitting || isSubmitting2}

            onPress={async () => {
              if (user?.id == expenseDetails?.user_id || expenseDetails?.status != "Pending") {
                setRemark('');
                setRemarkError('');
                setPunchInStatus(5);     // reset selection
                actionSheetRef.current?.hide();
                return
              }
              if (!expenseDetails?.id) {
                Alert.alert("Error", "No expense record selected");
                return;
              }

              if (punchInStatus === 5) {
                Alert.alert("No change", "Please select Approve or Reject.");
                return;
              }

              // ── Validation for Reject case ────────────────────────
              if (punchInStatus === 'Rejected') {
                if (!remark.trim()) {
                  setRemarkError("Remark is required when rejecting");
                  return;
                }
                if (remark.trim().length < 1) {
                  setRemarkError("Remark must be at least 5 characters");
                  return;
                }
              }

              try {
                // Prepare payload
                const payload: { expense_id: string | undefined; reasons?: string } = {
                  expense_id: expenseDetails?.id,
                };

                // Only send remark when rejecting
                if (punchInStatus === 'Rejected') {
                  payload.reasons = remark.trim();
                }

                await changeStatus(payload);

                Alert.alert(
                  "Success",
                  `Expense record has been ${punchInStatus === 'Approved' ? "approved" : "rejected"}.`,
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        // Reset local states when closing
                        setRemark('');
                        setRemarkError('');
                        setPunchInStatus(5);     // reset selection
                        actionSheetRef.current?.hide();

                        // Refresh list
                        setCurrentPage(1);
                        setExpenses([]);
                        setHasMore(true);
                        fetchExpenses(1)
                      },
                    },
                  ]
                );
              } catch (err: any) {
                console.log("Status change failed:", err);
                Alert.alert(
                  "Failed",
                  err?.response?.data?.message || "Could not update expense status."
                );
              }
            }}
          >
            {(isSubmitting || isSubmitting2) ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <AppText size={16} color="white" family="InterBold">
                Submit
              </AppText>
            )}
          </Pressable>
          {/* {Platform.OS == "ios" && <View style={{height: 50}} />} */}
        </View>
      </ActionSheet>
      <ActionSheet
        ref={actionSheetRef1}
        gestureEnabled={false}

        containerStyle={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: 'white',
          // paddingBottom: 20,
          height: 'auto'

        }}
        onClose={() => {
          // if (remark.length < 1) {
          //   setPunchInStatus(2)
          // }
          setPunchInStatus(5)
          setRemark('')
          setRemarkError('')
        }}
        indicatorStyle={{
          height: 0,
          backgroundColor: 'transparent',
        }}
        closeOnTouchBackdrop={true}


      >
        <View style={[{}]}>
          <View style={[styles.modalheader]}>
            <AppText size={16} color='white' family='InterSemiBold'>Type {punchInStatus === 'Rejected' ? 'Reason for Rejection' : 'Approved Amount'}</AppText>
            <Pressable style={{ position: "absolute", right: 15 }} onPress={() => {
              actionSheetRef1?.current?.hide();
              // setIsModalVisible(false)
            }}>
              <CrossIcon />
            </Pressable>
          </View>
          <View style={{ marginVertical: 20, paddingHorizontal: 20 }}>
            <AppText size={14} color="#333333" family="InterMedium">
              {punchInStatus === 'Rejected' ? 'Reason for Rejection' : 'Approved Amount'} <AppText color="red">*</AppText>
            </AppText>

            <View
              style={{
                marginTop: 8,
                borderWidth: 1,
                borderColor: remarkError ? 'red' : '#d1d5db',
                borderRadius: 8,
                backgroundColor: '#f9fafb',
              }}
            >
              <TextInput
                // multiline
                // numberOfLines={3}
                ref={remarkInputRef}
                value={remark}
                onChangeText={(text) => {
                  setRemark(text);
                  if (remarkError) setRemarkError(''); // clear error on typing
                }}
                placeholder={punchInStatus === 'Rejected' ? "Enter reason for rejection..." : "Enter approved amount..."}
                placeholderTextColor="#9ca3af"
                inputMode={punchInStatus === 'Rejected' ? 'text' : 'numeric'}
                style={{
                  padding: 12,
                  fontSize: 14,
                  color: '#1f2937',
                  textAlignVertical: 'top',
                }}
              />
            </View>

            {remarkError ? (
              <AppText size={12} color="red" family="InterRegular" style={{ marginTop: 4 }}>
                {remarkError}
              </AppText>
            ) : null}
          </View>
          <Pressable
            style={[
              styles.submit,
              { height: 44, marginHorizontal: 20 },
              styles.center,
              isSubmitting && { opacity: 0.6 },
              isSubmitting2 && { opacity: 0.6 },
            ]}
            disabled={isSubmitting || isSubmitting2}

            onPress={async () => {
              if (user?.id == expenseDetails?.user_id) {
                setRemark('');
                setRemarkError('');
                setPunchInStatus(5);     // reset selection
                actionSheetRef1.current?.hide();
                actionSheetRef.current?.hide();
                setExpenseDetails(null)
                return
              }
              if (!expenseDetails?.id) {
                Alert.alert("Error", "No expense record selected");
                return;
              }

              if (punchInStatus === 5) {
                Alert.alert("No change", "Please select Approve or Reject.");
                return;
              }

              // ── Validation for Reject case ────────────────────────
              if (punchInStatus === "Rejected") {
                if (!remark.trim()) {
                  setRemarkError("Remark is required when rejecting");
                  return;
                }
                if (remark.trim().length < 1) {
                  setRemarkError("Remark must be at least 5 characters");
                  return;
                }
              }

              try {
                // Prepare payload
                const payload: any = {
                  expense_id: expenseDetails?.id,
                };

                // Only send remark when rejecting
                if (punchInStatus == "Rejected") {
                  payload.reasons = remark.trim();
                }
                if (punchInStatus == "Approved") {
                  payload.approve_amnt = parseFloat(remark.trim());
                }

                if (punchInStatus === "Approved") {
                  await changeStatusApprove(payload);
                  setCurrentPage(1)
                  setExpenses([]);
                  setHasMore(true);
                  fetchExpenses(1)
                } else {
                  await changeStatus(payload);
                  setCurrentPage(1)
                  setExpenses([]);
                  setHasMore(true);
                  fetchExpenses(1)
                }

                Alert.alert(
                  "Success",
                  `Expense record has been ${punchInStatus === "Approved" ? "approved" : "rejected"}.`,
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        // Reset local states when closing
                        setRemark('');
                        setRemarkError('');
                        setPunchInStatus(5);     // reset selection
                        actionSheetRef1.current?.hide();
                        actionSheetRef.current?.hide();

                        // Refresh list

                      },
                    },
                  ]
                );
              } catch (err: any) {
                console.log("Status change failed:", err?.response);
                Alert.alert(
                  "Failed",
                  err?.response?.data?.message || "Could not update expense status."
                );
              }
            }}
          >
            {(isSubmitting || isSubmitting2) ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <AppText size={16} color="white" family="InterBold">
                Submit
              </AppText>
            )}
          </Pressable>
          <View style={{ height: 30 }} />
        </View>
      </ActionSheet>
    </SafeAreaView>
  );
};

export default ExpenseReport;