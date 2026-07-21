import { View, Text, ScrollView, FlatList, Pressable, Modal, Alert, ActivityIndicator, TextInput, Linking, Platform } from 'react-native'
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { rw } from '../../utils/responsive'
import AppText from '../../components/AppText/AppText'
import { ArrowDownIcon, CalenderIcon, CrossIcon, EyeballIcon, LOcationIcon, ThreeDotIcon } from '../../assets/svgs/SvgsFile'
import { colors } from '../../utils/Colors'
import { shadowStyle } from '../../utils/typography'
import { styles } from '../ExpenseReport/styles'
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { useChangeAttendanceStatus, useGetAllAttanceReport, useGetAttendanceData } from '../../api/query/CustomerApi'
import { useFocusEffect } from '@react-navigation/native'
import AnimatedSwitch from '../../components/AnimatedSwitch/AnimatedSwitch'
import { Dropdown } from 'react-native-element-dropdown'
import CustomerCalendar from '../../components/CustomCalendar/CalendarPopupView'
import { useAppSelector } from '../../components/redux/Store'
import { SCREEN_HEIGHT } from '../../utils/misc'
import { SafeAreaView } from 'react-native-safe-area-context'

const AttendanceReport = ({ navigation }: any) => {
  const [loader, setLoader] = useState(false);
  const [loader1, setLoader1] = useState(false);
  const [punchInStatus, setPunchInStatus] = useState(0);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [hirarchyLevelCheck, setHirarchyLevelCheck] = useState<any>(null);
  const [attendanceDataVisit, setAttendanceDataVisit] = useState<any>(null);
  const [leaveCheck, setLeaveCheck] = useState<boolean>(false);
  const [remark, setRemark] = useState<string>('');
  const [remarkError, setRemarkError] = useState<string>('');
  const { user } = useAppSelector(
    (state) => state.auth
  );
  const remarkInputRef = useRef<TextInput>(null);

  // Dropdown & filter states
  const [users, setUsers] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [switchOption, setSwitchOption] = useState(true); // true = Normal (A), false = Leave (L)
  const [showCal, setShowCal] = useState(false);

  const [rangeType, setRange] = useState('currentMonth');

  const [startDate, setStartDate] = useState<any>(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    return start;
  });

  const [endDate, setEndDate] = useState<any>(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return end;
  });

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
    setRange(type || 'custom');

    setShowCal(false);
    handleAttendanceList(
      switchOption ? 'normal' : 'leave',
      selectedUserId,
      selectedStatus,
      normalizedStart,
      normalizedEnd

    )
  };

  const actionSheetRef = useRef<ActionSheetRef>(null);
  const actionSheetRef1 = useRef<ActionSheetRef>(null);
  const { mutateAsync: mutateGetAllAttendance } = useGetAllAttanceReport();
  const { mutateAsync: mutateGetAttendanceData } = useGetAttendanceData();
  const { mutateAsync: changeStatus, isPending: isSubmitting } = useChangeAttendanceStatus();
  useFocusEffect(
    useCallback(() => {
      // Initial load: all users, all statuses, normal view
      handleAttendanceList('normal', null, null);
    }, [])
  );





  const handleAttendanceList = async (
    type: 'normal' | 'leave' = 'normal',
    userId: string | null = null,
    status: string | null = null,
    start?: any,
    end?: any
  ) => {
    setLoader1(true);
    try {
      let query = `?type=${type}`;
      if (userId) query += `&search_name=${userId}`;
      if (status !== null && status !== '') query += `&status=${status}`;
      if (start && end) {
        query += `&start_date=${formatYYYYMMDD(start)}`;
        query += `&end_date=${formatYYYYMMDD(end)}`;
      } else {
        if (startDate && endDate) {
          query += `&start_date=${formatYYYYMMDD(startDate)}`;
          query += `&end_date=${formatYYYYMMDD(endDate)}`;
          // or: &from=${...}&to=${...} — ask backend team for exact names
        }
      }

      const res = await mutateGetAllAttendance(query);

      if (res?.data?.status === 'success') {
        setAttendanceList(res?.data?.data || []);

        // Populate dropdowns only once
        if (users.length === 0 && res?.data?.users?.length > 0) {
          setUsers([{ id: null, name: 'All Users' }, ...res.data.users]);
        }
        if (statuses.length === 0 && res?.data?.all_status?.length > 0) {
          setStatuses([
            { id: null, name: 'All Statuses' },
            ...res.data.all_status,
          ]);
        }
      } else {
        setAttendanceList([])
      }
    } catch (error) {
      console.log('Error fetching attendance list:', error);
    } finally {
      setLoader1(false);
    }
  };

  const handleGetAttendanceData = async (id: string | number) => {
    setLoader(true);
    try {
      const res = await mutateGetAttendanceData(id);
      if (res?.data?.status === 'success') {
        const data = res?.data?.data;
        setAttendanceData(data);
        setAttendanceDataVisit(res?.data)

        const isLeave =
          data?.working_type === 'Full Day Leave' ||
          data?.working_type === 'First Half Leave' ||
          data?.working_type === 'Second Half Leave';

        setLeaveCheck(isLeave);
        // setPunchInStatus(data?.attendance_status || 3);
        setPunchInStatus(data?.attendance_status || 3);
        setRemark(data?.remark_status)
      }
    } catch (error) {
      console.log('Error fetching attendance detail:', error);
    } finally {
      setLoader(false);
    }
  };

  // Switch change handler
  const onSwitchChange = (val: boolean) => {
    setSwitchOption(val);
    handleAttendanceList(
      val ? 'normal' : 'leave',
      selectedUserId,
      selectedStatus
    );
  };

  // User dropdown change
  const onUserChange = (item: any) => {
    const userId = item?.id ? String(item.id) : null;
    setSelectedUserId(userId);
    handleAttendanceList(
      switchOption ? 'normal' : 'leave',
      userId,
      selectedStatus
    );
  };

  // Status dropdown change
  const onStatusChange = (item: any) => {
    const statusId = item?.id ? String(item.id) : null;
    setSelectedStatus(statusId);
    handleAttendanceList(
      switchOption ? 'normal' : 'leave',
      selectedUserId,
      statusId
    );
  };

  const formatYYYYMMDD = (date: any): string => {
    if (!date) return '';

    const d = new Date(date);

    if (isNaN(d.getTime())) return '';

    // Use LOCAL year, month, day — ignore timezone / UTC completely
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // 01 to 12
    const day = String(d.getDate()).padStart(2, '0');     // 01 to 31

    return `${year}-${month}-${day}`;
  };



  const renderItem = useCallback(
    ({ item }: any) => {
      const isLeave =
        item?.working_type === 'Full Day Leave' ||
        item?.working_type === 'First Half Leave' ||
        item?.working_type === 'Second Half Leave';

      return (
        <Pressable
          style={[styles.listItem, shadowStyle]}
          onPress={() => {
            actionSheetRef.current?.show();
            if (item?.hierarchy_level <= 2) {
              setHirarchyLevelCheck(item);
            }
            handleGetAttendanceData(item.attendance_id);
          }}
        >
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <AppText color="black" family="InterSemiBold" size={16}>
                {item?.name || 'Unknown'}
              </AppText>
            </View>
            <View style={[styles.row, { gap: 19 }]}>
              <AppText color="#888888" family="InterMedium" size={13}>
                {item?.date || '-'}
              </AppText>
              <View
              >
                <EyeballIcon />
              </View>
              <View>
                <ThreeDotIcon />
              </View>
            </View>
          </View>

          <View style={styles.line} />

          <View
            style={[
              styles.row,
              { justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' },
            ]}
          >
            <View style={styles.firstPunchIN}>
              <AppText color="#888888" family="InterRegular" size={13}>
                {isLeave ? 'Leave Date' : 'Punch In'}
              </AppText>
              <AppText color="black" family="InterSemiBold" size={14}>
                {isLeave ? item?.date : item?.punch_in || '-'}
              </AppText>
            </View>

            <View style={styles.firstPunchIN}>
              <AppText color="#888888" family="InterRegular" size={13}>
                {isLeave ? 'Leave Type' : 'Punch Out'}
              </AppText>
              <AppText color="black" family="InterSemiBold" size={14}>
                {isLeave ? item?.working_type : item?.punch_out || '-'}
              </AppText>
            </View>

            <View style={styles.firstPunchIN}>
              <AppText color="#888888" family="InterRegular" size={13}>
                Status
              </AppText>
              <AppText
                color={
                  item?.status === 'Pending'
                    ? '#E78422'
                    : item?.status === 'Approve'
                      ? '#1bc804'
                      : '#d31111'
                }
                family="InterSemiBold"
                size={14}
              >
                {item?.status || 'Unknown'}
              </AppText>
            </View>
          </View>
        </Pressable>
      );
    },
    []
  );

  const getTourTownNames = () => {
    const tours = attendanceDataVisit?.tour_details;

    if (!tours || tours.length === 0) {
      return 'N/A'; // fallback
    }

    return tours
      .map((item: any) => item?.town_name)
      .filter(Boolean)
      .join(', ');
  };
  
  const getTourObjective = () => {
    const tours = attendanceDataVisit?.tour_details;

    if (!tours || tours.length === 0) {
      return 'N/A'; // fallback
    }

    return tours
      .map((item: any) => item?.objective)
      .filter(Boolean)
      .join(', ');
  };


  const handleLocation = async () => {
    const addr = attendanceData?.punchin_address?.trim();

    let query = '';

    // Prefer coordinates if available
    if (attendanceData?.punchin_latitude && attendanceData?.punchin_longitude) {
      query = `${attendanceData?.punchin_longitude},${attendanceData?.punchin_latitude}`;
    }

    // Fallback to address
    if (!query && addr) {
      query = encodeURIComponent(addr);
    }

    if (!query) {
      Alert.alert('No Location', 'No GPS or address available.');
      return;
    }

    // ────────────────────────────────────────────────
    // Android: try geo: URI first (works with most map apps)
    // iOS: use maps://
    // Fallback: browser
    // ────────────────────────────────────────────────

    const scheme = Platform.OS === 'android' ? 'geo:0,0?q=' : 'maps://?q=';
    const nativeUrl = scheme + query;
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

    try {
      // Try native map app first
      if (await Linking.canOpenURL(nativeUrl)) {
        await Linking.openURL(nativeUrl);
        return;
      }

      // If native fails → open in browser
      await Linking.openURL(webUrl);
    } catch (err) {
      console.log('Map open failed:', err);

      Alert.alert(
        'Cannot Open Map',
        'No map application is available.\n\nThe location will open in your browser instead.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open in Browser',
            onPress: () => Linking.openURL(webUrl).catch(() => { }),
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={[styles.container, { paddingHorizontal: rw(18) },]}
        showsVerticalScrollIndicator={false}
      >
        {/* Filters */}
        <View style={{ marginTop: 16, }}>
          <View style={[styles.row, { gap: 13 }]}>
            <Dropdown
              style={[localStyles.dropdown, shadowStyle]}
              placeholderStyle={localStyles.placeholderStyle}
              selectedTextStyle={localStyles.selectedTextStyle}
              inputSearchStyle={localStyles.inputSearchStyle}
              data={users}
              search
              maxHeight={320}
              labelField="name"
              valueField="id"
              placeholder="Select User"
              searchPlaceholder="Search user..."
              // value={selectedUserId?.toString()}
              onChange={onUserChange}
            />

            <Dropdown
              style={[localStyles.dropdown, shadowStyle]}
              placeholderStyle={localStyles.placeholderStyle}
              selectedTextStyle={localStyles.selectedTextStyle}
              data={statuses}
              maxHeight={220}
              labelField="name"
              valueField="id"
              placeholder="Select Status"
              value={selectedStatus}
              onChange={onStatusChange}
            />
          </View>
          {/* <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <Pressable onPress={resetFilters}>
              <AppText color={colors.blue} size={14} family="InterMedium">
                Reset Filters
              </AppText>
            </Pressable>


          </View> */}
        </View>

        {/* Placeholder for future date picker */}
        <View style={[styles.row, { marginTop: 16, gap: 13 }]}>
          <Pressable style={[styles.dateTimeBox, styles.row,]} onPress={() => setShowCal(true)}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              {
                (startDate && endDate) ? (
                  <AppText size={12} color="black" family="InterRegular">
                    {formatYYYYMMDD(startDate)} : {formatYYYYMMDD(endDate)}
                  </AppText>
                ) : (
                  <AppText size={14} color="#718096" family="InterRegular">
                    Select Date Range
                  </AppText>
                )
              }

            </View>
            <View style={[styles.calenderICon, styles.center]}>
              <CalenderIcon size={16} color={colors.blue} />
            </View>
          </Pressable>
          <AnimatedSwitch
            text1="A"
            text2="L"
            dataPress={onSwitchChange}
          />
        </View>

        <View style={{ height: 20 }} />

        {loader1 ? (
          <ActivityIndicator
            size="large"
            color={colors.blue}
            style={{ marginTop: 60 }}
          />
        ) : attendanceList.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <AppText size={16} color="#718096" family="InterMedium">
              No {switchOption ? "attendences" : "leaves"} records found
            </AppText>
          </View>
        ) : (
          <FlatList
            data={attendanceList}
            keyExtractor={(item) => String(item?.attendance_id)}
            renderItem={renderItem}
            ListFooterComponent={() => <View style={{ height: 140 }} />}
          />
        )}
        <CustomerCalendar
          {...{ showCal, setShowCal }}
          // minimumDate={new Date()}
          initialStartDate={startDate}
          initialEndDate={endDate}
          setStartDates={setStartDate}
          setEndDates={setEndDate}
          setRange={setRange}
          range={rangeType}
          onApplyClick={handleApply}
          minimumDate={null}
          calendarType="reminder"
        />
      </ScrollView>
      <ActionSheet
        ref={actionSheetRef}
        gestureEnabled={false}
        isModal={false}
        useBottomSafeAreaPadding
        keyboardHandlerEnabled={false}
        containerStyle={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: 'white',
          // paddingBottom: 20,
          maxHeight: SCREEN_HEIGHT * 0.9,
          height: 'auto'

        }}
        onClose={() => {
          setHirarchyLevelCheck(null);
          setAttendanceData(null)
        }}
        indicatorStyle={{
          height: 0,
          backgroundColor: 'transparent',
        }}
        closeOnTouchBackdrop={true}

      >
        <View style={[{}]}>
          <View style={[styles.modalheader]}>
            <AppText size={16} color='white' family='InterSemiBold'>{leaveCheck ? "Leave" : "Attendance"} Detail</AppText>
            <Pressable style={{ position: "absolute", right: 15 }} onPress={() => {
              actionSheetRef.current?.hide();
              // setIsModalVisible(false)
            }}>
              <CrossIcon />
            </Pressable>
          </View>
          <ScrollView style={{ width: '100%', maxHeight: SCREEN_HEIGHT * 0.7 }} showsVerticalScrollIndicator={false} keyboardDismissMode='on-drag'>
            <View style={styles.mainOCntainer} >
              <View style={[styles.row, { gap: 21 }]}>
                <View style={styles.firstViewModal}>
                  <AppText size={14} family='InterMedium' color='#333333'>User Id</AppText>
                  <AppText size={14} family='InterBold' color='black'>{attendanceData?.user_id}</AppText>
                </View>
                <View style={[styles.firstViewModal, { flex: 0.45 }]}>
                  <AppText size={14} family='InterMedium' color='#333333'>Employe Code</AppText>
                  <AppText size={14} family='InterBold' color='black'>{attendanceData?.users?.employee_codes}</AppText>
                </View>
              </View>
              <View style={[styles.row, { gap: 21, marginTop: 15 }]}>
                <View style={styles.firstViewModal}>
                  <AppText size={14} family='InterMedium' color='#333333'>Employe Name</AppText>
                  <AppText size={14} family='InterBold' color='black'>{attendanceData?.users?.name}</AppText>
                </View>
                {
                  !leaveCheck && attendanceDataVisit?.city_names_string && (
                    <View style={[styles.firstViewModal, { flex: 0.45 }]}>
                      <AppText size={14} family='InterMedium' color='#333333'>Punch In City</AppText>
                      <AppText size={14} family='InterBold' color='black'>{attendanceDataVisit?.city_names_string}</AppText>
                    </View>
                  )
                }
                {/* <View style={[styles.firstViewModal, { flex: 0.45 }]}>
                <AppText size={14} family='InterMedium' color='#333333'>Employe Code</AppText>
                <AppText size={14} family='InterBold' color='black'>{attendanceData?.users?.employee_codes}</AppText>
              </View> */}
              </View>
              {
                leaveCheck && (
                  <View style={[styles.row, { gap: 21, marginTop: 15 }]}>
                    <View style={styles.firstViewModal}>
                      <AppText size={14} family='InterMedium' color='#333333'>Leave Date</AppText>
                      <AppText size={14} family='InterBold' color='black'>{attendanceData?.punchin_date}</AppText>
                    </View>
                  </View>
                )
              }
              {
                !leaveCheck && (
                  <>
                    <View style={[styles.row, { gap: 21, marginTop: 15 }]}>

                      <View style={styles.firstViewModal}>
                        <AppText size={14} family='InterMedium' color='#333333'>Punch In Date</AppText>
                        <AppText size={14} family='InterBold' color='black'>{attendanceData?.punchin_date}</AppText>
                      </View>
                      <View style={[styles.firstViewModal, { flex: 0.45 }]}>
                        <AppText size={14} family='InterMedium' color='#333333'>Punch In Time</AppText>
                        <AppText size={14} family='InterBold' color='black'>{attendanceData?.punchin_time}</AppText>
                      </View>
                    </View>
                    <View style={[styles.row, { gap: 21, marginTop: 15 }]}>
                      <View style={styles.firstViewModal}>
                        <AppText size={14} family='InterMedium' color='#333333'>Punch Out Date</AppText>
                        <AppText size={14} family='InterBold' color='black'>{attendanceData?.punchout_date}</AppText>
                      </View>
                      <View style={[styles.firstViewModal, { flex: 0.45 }]}>
                        <AppText size={14} family='InterMedium' color='#333333'>Working Time</AppText>
                        <AppText size={14} family='InterBold' color='black'>{attendanceData?.worked_time}</AppText>
                      </View>
                    </View>
                    <View style={[styles.row, { gap: 21, marginTop: 15 }]}>
                      <View style={styles.firstViewModal}>
                        <AppText size={14} family='InterMedium' color='#333333'>Punch Out Time</AppText>
                        <AppText size={14} family='InterBold' color='black'>{attendanceData?.punchout_time}</AppText>
                      </View>
                      <View style={[styles.firstViewModal, { flex: 0.45 }]}>
                        <AppText size={14} family='InterMedium' color='#333333'>Tour Plan City</AppText>
                        <AppText size={14} family='InterBold' color='black'>
                          {getTourTownNames()}
                        </AppText>
                      </View>
                    </View>
                  </>
                )
              }

              <View style={[styles.row, { gap: 21, marginTop: 15 }]}>
                <View style={styles.firstViewModal}>
                  <AppText size={14} family='InterMedium' color='#333333'>{leaveCheck ? "Leave Type" : "Objective"}</AppText>
                  <AppText size={14} family='InterBold' color='black'>{attendanceData?.working_type}</AppText>
                </View>
                {
                  !leaveCheck && (
                    <Pressable style={[styles.firstViewModal, { flex: 0.45 }]} onPress={handleLocation}>
                      <AppText size={14} family='InterMedium' color='#333333'>Punch In Location</AppText>
                      <View style={[styles.row, { gap: 5 }]}>
                        <LOcationIcon />
                        <AppText size={14} family='InterMedium' color={colors.blue}>View</AppText>
                      </View>
                    </Pressable>
                  )
                }

              </View>

              {
                leaveCheck && (
                  <View style={[styles.row, { gap: 21, marginTop: 15 }]}>
                    <View style={styles.firstViewModal}>
                      <AppText size={14} family='InterMedium' color='#333333'>Leave Reason</AppText>
                      <AppText size={14} family='InterBold' color='black'>{attendanceData?.punchin_summary}</AppText>
                    </View>


                  </View>
                )
              }

              {
                !leaveCheck && (
                  <>
                    {/* <View style={[styles.row, { gap: 21, marginTop: 15 }]}>
                    <View style={[styles.firstViewModal]}>
                      <AppText size={14} family='InterMedium' color='#333333'>Punch Out Location</AppText>
                      <View style={[styles.row, { gap: 5 }]}>
                        <LOcationIcon />
                        <AppText size={14} family='InterMedium' color={colors.blue}></AppText>
                      </View>
                    </View>
                  </View> */}
                    {/* <View style={[styles.row, { gap: 21, marginTop: 15 }]}>
                    <View style={[styles.firstViewModal]}>
                      <AppText size={14} family='InterMedium' color='#333333'>Punch In Summary</AppText>
                      <AppText size={14} family='InterBold' color='black'>{attendanceData?.punchin_summary}</AppText>
                    </View>
                  </View> */}
                    <View style={[styles.row, { gap: 21, marginTop: 15 }]}>
                      <View style={[styles.firstViewModal, { flex: 1 }]}>
                        <AppText size={14} family='InterMedium' color='#333333'>Punch In Address</AppText>
                        <AppText size={14} family='InterBold' color='black'>{attendanceData?.punchin_address}</AppText>
                      </View>
                    </View>
                  </>
                )
              }
              {
                !leaveCheck && (
                  <>
                    <View style={[styles.row, { gap: 21, marginTop: 15 }]}>
                      <View style={[styles.firstViewModal, { flex: 1 }]}>
                        <AppText size={14} family='InterMedium' color='#333333'>Tour Plan Objective</AppText>
                        <AppText size={14} family='InterBold' color='black'>{ getTourObjective()}</AppText>
                      </View>
                    </View>
                  </>
                )
              }
              {
                (attendanceData?.attendance_status == 1 || attendanceData?.attendance_status == 2 || attendanceData?.attendance_status == 0 ) ? (
                  <View style={[styles.approveRejectView, styles.row, { gap: 20 }]}>
                    <View style={[styles.approveView, styles.row]}>
                      <Pressable
                        style={[styles.circle, styles.center]}
                        onPress={() => {

                          // Prevent self-approval
                          if (user?.id === attendanceData?.user_id) {
                            return;
                          }

                          const isCurrentlyApproved = punchInStatus === 1;
                          const actionText = isCurrentlyApproved ? 'unapprove' : 'approve';

                          Alert.alert(
                            "Confirm action",
                            `Are you sure you want to ${actionText} this attendance record?`,
                            [
                              {
                                text: "Cancel",
                                style: "cancel",
                              },
                              {
                                text: isCurrentlyApproved ? "Unapprove" : "Approve",
                                style: isCurrentlyApproved ? "destructive" : "default",
                                onPress: () => {
                                  // Only change status if user confirms
                                  setPunchInStatus(isCurrentlyApproved ? 3 : 1);
                                  setRemark('');
                                  setRemarkError('');
                                },
                              },
                            ],
                            { cancelable: true }
                          );
                        }}
                      >
                        <View
                          style={[
                            styles.circleInner,
                            punchInStatus === 1 && { backgroundColor: "#339D4F", borderRadius: 12 },
                          ]}
                        />
                      </Pressable>
                      <AppText size={14} color='#339D4F' family='InterRegular'>Approved</AppText>
                    </View>

                    <View style={[styles.approveView, styles.row]}>
                      <Pressable style={[styles.circle, styles.center, { borderColor: "#FF3333" }]} onPress={() => {
                        if (user?.id == attendanceData?.user_id) {
                          return
                        }
                        if (punchInStatus == 2) {
                          setPunchInStatus(3)
                        } else {
                          setPunchInStatus(2)
                          actionSheetRef1.current?.show()
                          setTimeout(() => {
                            remarkInputRef.current?.focus();
                          }, 200);
                        }
                      }}>
                        <View style={[styles.circleInner, punchInStatus == 2 && { backgroundColor: "#FF3333", borderRadius: 12, }]} />
                      </Pressable>
                      <AppText size={14} color='#FF3333' family='InterRegular'>Rejected</AppText>
                    </View>
                  </View>
                ) : (
                  <View style={{ height: 30 }} />
                )
              }


              {punchInStatus === 2 && (
                <View style={{ marginBottom: 20 }}>
                  <AppText size={14} color="#333333" family="InterMedium">
                    Remark <AppText color="red">*</AppText>
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
                      if (user?.id == attendanceData?.user_id ) {
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
                        if (user?.id == attendanceData?.user_id) {
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
          </ScrollView>
          <Pressable
            style={[
              styles.submit,
              { height: 44, marginHorizontal: 20, },
              styles.center,
              isSubmitting && { opacity: 0.6 },
            ]}
            disabled={isSubmitting}

            onPress={async () => {
              if (user?.id == attendanceData?.user_id) {
                setRemark('');
                setRemarkError('');
                setPunchInStatus(3);     // reset selection
                actionSheetRef.current?.hide();
                return
              }
              if (!attendanceData?.id) {
                Alert.alert("Error", "No attendance record selected");
                return;
              }

              if (punchInStatus === 3) {
                Alert.alert("No change", "Please select Approve or Reject.");
                return;
              }

              // ── Validation for Reject case ────────────────────────
              if (punchInStatus === 2) {
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
                  attendance_id: attendanceData?.id,
                  status: punchInStatus,           // 1 = Approve, 2 = Reject
                };

                // Only send remark when rejecting
                if (punchInStatus === 2) {
                  payload.remark_status = remark.trim();
                }

                await changeStatus(payload);

                Alert.alert(
                  "Success",
                  `Attendance record has been ${punchInStatus === 1 ? "approved" : "rejected"}.`,
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        // Reset local states when closing
                        setRemark('');
                        setRemarkError('');
                        setPunchInStatus(3);     // reset selection
                        actionSheetRef.current?.hide();

                        // Refresh list
                        handleAttendanceList(
                          switchOption ? "normal" : "leave",
                          selectedUserId,
                          selectedStatus,
                          startDate,
                          endDate
                        );
                      },
                    },
                  ]
                );
              } catch (err: any) {
                console.log("Status change failed:", err);
                Alert.alert(
                  "Failed",
                  err?.response?.data?.message || "Could not update attendance status."
                );
              }
            }}
          >
            {isSubmitting ? (
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

        }}
        indicatorStyle={{
          height: 0,
          backgroundColor: 'transparent',
        }}
        closeOnTouchBackdrop={true}

      >
        <View style={[{}]}>
          <View style={[styles.modalheader]}>
            <AppText size={16} color='white' family='InterSemiBold'>Type Remark</AppText>
            <Pressable style={{ position: "absolute", right: 15 }} onPress={() => {
              actionSheetRef1?.current?.hide();
              // setIsModalVisible(false)
            }}>
              <CrossIcon />
            </Pressable>
          </View>
          <View style={{ marginVertical: 20, paddingHorizontal: 20 }}>
            <AppText size={14} color="#333333" family="InterMedium">
              Remark <AppText color="red">*</AppText>
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
                placeholder="Enter reason for rejection..."
                placeholderTextColor="#9ca3af"
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
            ]}
            disabled={isSubmitting}

            onPress={async () => {
              if (user?.id == attendanceData?.user_id) {
                setRemark('');
                setRemarkError('');
                setPunchInStatus(3);     // reset selection
                actionSheetRef.current?.hide();
                return
              }
              if (!attendanceData?.id) {
                Alert.alert("Error", "No attendance record selected");
                return;
              }

              if (punchInStatus === 3) {
                Alert.alert("No change", "Please select Approve or Reject.");
                return;
              }

              // ── Validation for Reject case ────────────────────────
              if (punchInStatus === 2) {
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
                  attendance_id: attendanceData?.id,
                  status: punchInStatus,           // 1 = Approve, 2 = Reject
                };

                // Only send remark when rejecting
                if (punchInStatus === 2) {
                  payload.remark_status = remark.trim();
                }

                await changeStatus(payload);

                Alert.alert(
                  "Success",
                  `Attendance record has been ${punchInStatus === 1 ? "approved" : "rejected"}.`,
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        // Reset local states when closing
                        setRemark('');
                        setRemarkError('');
                        setPunchInStatus(3);     // reset selection
                        actionSheetRef.current?.hide();
                        actionSheetRef1.current?.hide();

                        // Refresh list
                        handleAttendanceList(
                          switchOption ? "normal" : "leave",
                          selectedUserId,
                          selectedStatus,
                          startDate,
                          endDate
                        );
                      },
                    },
                  ]
                );
              } catch (err: any) {
                console.log("Status change failed:", err);
                Alert.alert(
                  "Failed",
                  err?.response?.data?.message || "Could not update attendance status."
                );
              }
            }}
          >
            {isSubmitting ? (
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
  )
}

// Local styles for dropdowns (add to your styles file or keep here)
const localStyles = {
  dropdown: {
    height: 50,
    backgroundColor: 'rgba(57, 82, 153, 0.07)',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flex: 1,
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#718096',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: 'black', 
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
  },
};

export default AttendanceReport