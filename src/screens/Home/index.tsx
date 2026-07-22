import { View, Text, ScrollView, StatusBar, Switch, FlatList, Pressable, TouchableOpacity, Modal, useWindowDimensions, Modal as RNModal, TextInput, ActivityIndicator, Alert, Platform, } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { styles } from './styles'
import { rw } from '../../utils/responsive'
import { CallIcon, ChatIcon, FirstUserIcon, FourthUserIcon, LogoIcon, SecondUserIcon, ThirdUserIcon, VillageIcon } from '../../assets/svgs/HomePageSvgs'
import { SafeAreaView } from 'react-native-safe-area-context'
import AppText from '../../components/AppText/AppText'
import Graph from '../../components/atoms/Graph'
import { ArrowDownIcon, CrossIcon } from '../../assets/svgs/SvgsFile'
import { colors } from '../../utils/Colors'
import { activityTimeline, dashboardTiles, summaryStats } from '../../components/Comman/CommanFunction'
import TileCard from '../../components/atoms/TileCard'
import SummaryCard from '../../components/atoms/SummaryCard'
import ActivityCard from '../../components/atoms/ActivityCard'
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native'
import { useDispatch } from 'react-redux'
import { logout, setActiveBg } from '../../components/redux/slice/AuthSlice'
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet'
import { FifthUserIcon, TwoMenIcon } from '../../assets/svgs/BottomTabSvgs'
import store, { useAppSelector } from '../../components/redux/Store'
import axios from 'axios'
import Animated, { Easing, interpolate, useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler'
import LinearGradient from 'react-native-linear-gradient'
import ProfileTab from './ProfileTab'
import Toast from 'react-native-toast-message'
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import useLocationHook from '../../api/hooks/uselocationhook'
import { requestLocationPermission } from '../../utils/Location/permissions'
import LocationService from '../../utils/Location/LocationService'
import { ANDROID_APP_VERSION, compareVersions } from '../../utils/appVersion'


interface DropdownItem {
  label: string;
  value: string | number;
}

const userTypes = [
  { id: '1', title: 'Distributor', icon: <FirstUserIcon />, navigateTO: "AddCustomer", title2: 'Distributor' },   // You can replace emoji with real SVG/icon
  { id: '2', title: 'Retailer', icon: <SecondUserIcon />, navigateTO: "AddCustomer", title2: 'RETAILER' },
  { id: '3', title: 'Workshop', icon: <ThirdUserIcon />, navigateTO: "AddCustomer", title2: 'WORKSHOP' },
  { id: '4', title: 'Garage', icon: <FourthUserIcon />, navigateTO: "AddCustomer", title2: 'GARAGE' },
  { id: '5', title: 'Mechanic', icon: <FifthUserIcon />, navigateTO: "AddSecondaryCustomer", title2: 'MECHANIC' },
];
const Home = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const dispatch = useDispatch();
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const [pressType, setPressType] = useState<string | null>(null)
  const { user } = useAppSelector(
    (state) => state.auth
  );

  const [isPunchedIn, setIsPunchedIn] = useState<any>(false);
  const [todayPunchInData, setTodayPunchInData] = useState<any>(null);
  const [loadingPunchStatus, setLoadingPunchStatus] = useState(true);
  const [loaderLeave, setLoaderLeave] = useState(false);

  // ─── Leave Modal States ─────────────────────────────────────────────
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveBalances, setLeaveBalances] = useState<any>(null);
  const [loadingBalances, setLoadingBalances] = useState(false);

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedBalType, setSelectedBalType] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const [selectedUser, setSelectedUser] = useState<DropdownItem | null>(null);
  const [showCal, setShowCal] = useState(false);
  const [rangeType, setRange] = useState('currentMonth');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<DropdownItem[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DropdownItem[]>([]);
  const [userSearchText, setUserSearchText] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);

  const [stats, setStats] = useState<{
    total_customers: number;
    total_orders: number;
    total_order_value: number;
    total_quantity?: number; // optional
  } | null>(null);

  const fetchHierarchyStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);

      const token = store.getState()?.auth?.token;
      if (!token) {
        setStatsError("No authentication token found");
        return;
      }

      // Optional: pass selectedUser?.value as user_id
      const params: any = {};
      if (selectedUser?.value) {
        params.user_id = selectedUser.value;
      }
      // You can also add date range if backend supports it
      // if (startDate && endDate) {
      //   params.startdate = formatYYYYMMDD(startDate);
      //   params.enddate = formatYYYYMMDD(endDate);
      // }

      const response = await axios.get(
        `https://elofic.fieldkonnect.io/api/getHierarchyOrderStats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          params,
        }
      );

      if (response.data?.status === 'success') {
        setStats(response.data.data);
      } else {
        setStatsError(response.data?.message || 'Failed to load stats');
      }
    } catch (err: any) {
      console.error('Stats fetch error:', err);
      setStatsError(err.response?.data?.message || 'Error fetching stats');
      Toast.show({
        type: 'error',
        text1: 'Failed to load dashboard stats',
      });
    } finally {
      setStatsLoading(false);
    }
  }, [selectedUser?.value]); // re-fetch when selected user changes

  useEffect(() => {
    // locationTracking()
  }, [])

  const locationTracking = async () => {
    if (LocationService.isTracking()) return;
    await requestLocationPermission();
    await LocationService.startTracking();
  }


  // Re-fetch when user changes (or date range if you add it later)
  useEffect(() => {
    fetchHierarchyStats();
  }, [selectedUser?.value, fetchHierarchyStats]);

  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

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
  };

  const leaveTypes = [
    { label: 'Full Day Leave', value: 'Full Day Leave' },
    { label: 'First Half Leave', value: 'First Half Leave' },
    { label: 'Second Half Leave', value: 'Second Half Leave' },
    // { label: 'Leave', value: 'Leave' },
  ];

  const balanceTypes = [
    { label: 'Casual Balance', value: 'Casual Balance' },
    { label: 'Sick Balance', value: 'Sick Balance' },
    { label: 'Earned Balance', value: 'Earned Balance' },
    { label: 'Comp-off Balance', value: 'Comp-off Balance' },
  ];
  // Your token – in real app use secure storage / redux / context

  const fetchPunchInStatus = async () => {
    try {
      setLoadingPunchStatus(true);
      const token = store.getState()?.auth?.token;

      const res = await axios.get('https://elofic.fieldkonnect.io/api/getPunchin', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const data = res.data;

      if (data.status === 'success' && data.data?.length > 0) {
        const latest = data.data[0]; // assuming latest or only one for today
        // You may want to also check punchin_date === today's date
        const isToday =
          latest.punchin_date ===
          new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(new Date());

        if (isToday && latest?.punchin_date && !latest?.punchout_date) {
          setIsPunchedIn(true);
          await locationTracking();
        } else {
          setIsPunchedIn(false);
          setTodayPunchInData(null);
          await LocationService.stopTracking();
        }
        if (latest?.punchout_date && latest?.punchin_date && isToday) {
          setIsPunchedIn("end");
          await LocationService.stopTracking();
        }
        setTodayPunchInData(latest);
      } else {
        setIsPunchedIn(false);
        setTodayPunchInData(null);
        await LocationService.stopTracking();
      }
    } catch (err) {
      console.error('Failed to fetch punch-in status:', err);
      setIsPunchedIn(false);
      setTodayPunchInData(null);
    } finally {
      setLoadingPunchStatus(false);
    }
  }

  // Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchPunchInStatus();
      checkAppVersion();
    }, [])
  );

  const { coords } = useLocationHook();

  const checkAppVersion = async () => {
    try {
      const token = store.getState()?.auth?.token;
      const response = await axios.get(
        'https://elofic.fieldkonnect.io/api/getAppVersion',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      const currentVersion = Platform.OS === 'ios' ? '1.0' : ANDROID_APP_VERSION;
      const serverVersion = Platform.OS === 'ios'
        ? response?.data?.data?.ios_version
        : response?.data?.data?.android_version;

      console.log('Current Version:', currentVersion);
      console.log('Server Version:', serverVersion);

      if (serverVersion && compareVersions(serverVersion, currentVersion) > 0) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'ForceUpdateScreen' }],
        });
      }
    } catch (error) {
      console.log('Version check error:', error);
    }
  };

  // ─── Fetch Leave Balances ───────────────────────────────────────────
  const fetchLeaveBalances = async () => {
    try {
      setLoadingBalances(true);
      const token = store.getState()?.auth?.token;

      const res = await axios.get('https://elofic.fieldkonnect.io/api/leaves/balance', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.data?.status === true) {
        setLeaveBalances(res.data.data || res.data);
      }
    } catch (err) {
      console.log('Failed to fetch leave balances:', err);
    } finally {
      setLoadingBalances(false);
    }
  };

  // ─── Submit Leave Request ───────────────────────────────────────────
  const submitLeaveRequest = async () => {
    if (!selectedType || !selectedBalType || !reason.trim()) {
      // alert('Please fill all required fields');
      Toast.show({ type: "info", text1: "Please fill all required fields" })
      return;
    }
    setLoaderLeave(true)
    try {
      const token = store.getState()?.auth?.token;
      const userId = user?.id;

      const payload = {
        user_id: userId,
        from_date: fromDate.toISOString().split('T')[0],
        to_date: toDate.toISOString().split('T')[0],
        type: selectedType,
        bal_type: selectedBalType,
        reason: reason.trim(),
      };

      console.log(payload, 'payloadpayloadpayload')


      const res = await axios.post('https://elofic.fieldkonnect.io/api/addLeaves', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setLoaderLeave(false)
      if (res.data?.status === 'success') {
        Toast.show({ type: "success", text1: "Leave request submitted successfully" })
        // alert('Leave request submitted successfully!');
        setShowLeaveModal(false);
        setSelectedType(null);
        setSelectedBalType(null);
        setReason('');
        fetchLeaveBalances(); // refresh balances
      } else {
        Toast.show({ type: "error", text1: res.data?.message || 'Failed to submit leave' })
        // alert(res.data?.message || 'Failed to submit leave');
      }
    } catch (err: any) {
      console.log('Leave submit error:', err);
      Toast.show({ type: "error", text1: err.response?.data?.message || 'Error submitting leave request' })
      setLoaderLeave(false)
      // alert(err.response?.data?.message || 'Error submitting leave request');
    }
  };

  // ─── Handle toggle press ────────────────────────────────────────
  const handleToggleAttendance = () => {
    if (isPunchedIn) {
      // Already punched in → show details / punch-out screen
      navigation.navigate('AttendanceScreen', {
        item: todayPunchInData,   // pass current punch-in record
      });
    } else {
      // Not punched in → go to punch-in flow
      navigation.navigate('AttendanceScreen');
    }
  };

  const handleSelectType = (type: string, title: any) => {
    actionSheetRef.current?.hide();
    // Do whatever you want with the selected type
    console.log('Selected:', type);
    // Example: navigation.navigate('SomeScreen', { type }); 
    if (pressType == 'add') {
      if (title == "Distributor") {
        navigation.navigate(type)
      } else {
        navigation.navigate('AddSecondaryCustomer', { type: title })
      }
    } else {
      if (title == "Distributor") {
        navigation.navigate("CustomerList")
      } else {
        navigation.navigate("CustomerList", { type: title })
      }

    }


    // Or dispatch an action, show toast, etc.
  };

  function getFirstName(fullName: string | null | undefined) {
    if (!fullName || typeof fullName !== 'string') return '';

    // Split by any whitespace and take first non-empty part
    const parts = fullName.trim().split(/\s+/);
    return parts[0] || '';
  }

  //animation code starts
  const { height } = useWindowDimensions();
  const { width } = useWindowDimensions();
  const y = useSharedValue(height);
  const x = useSharedValue(0);
  const isScrolling = useSharedValue(0);

  const unlockGestureHandler = (event: PanGestureHandlerGestureEvent) => {
    x.value = Math.max(0, Math.min(event.nativeEvent.absoluteX, width));
    isScrolling.value = 1;
  };

  const onGestureEnd = (event: PanGestureHandlerGestureEvent) => {
    isScrolling.value = 0;
    if (event.nativeEvent.absoluteX > width / 2) {
      // Open drawer
      x.value = withTiming(width, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      // Close drawer
      x.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  };

  const blurContainerStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: isScrolling.value ? 2 : -1, // Change z-index based on scroll state
    pointerEvents: isScrolling.value ? 'auto' : 'none', // Disable interaction when not scrolling
  }));


  const animatedProfileStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          x.value,
          [0, width],
          [-width, 0],
          'clamp'
        ),
      },
    ],
  }));


  const homeScreenStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          x.value,
          [0, width],
          [1, 0.85],
          'clamp'
        ),
      },
    ],
  }));

  const handleDrawerPress = () => {
    // Animate x value to full width
    x.value = withTiming(width, {
      duration: 500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    dispatch(setActiveBg(true))
    // Set scrolling state to show blur
    // isScrolling.value = 1;
  };

  const handleDrawerClose = () => {
    x.value = withTiming(0, {
      duration: 500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    dispatch(setActiveBg(false))
    // isScrolling.value = 0;
  };

  const fetchUsers = async (pageNum = 1) => {
    const token = store.getState().auth?.token;

    if (!token || loading || (!hasMore && pageNum !== 1)) return;

    setLoading(true);

    try {
      const response = await fetch(
        `https://ksb-pr.fieldkonnect.in/api/getMyHierarchyUsers?type=RETAILER`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await response.json();

      const userData = json?.users || [];

      const userList: DropdownItem[] = userData.map((u: any) => ({
        label: u.name,
        value: u.id,
      }));

      const updatedUsers =
        pageNum === 1 ? userList : [...users, ...userList];

      setUsers(userList);

      // setPage(pageNum);
      // setHasMore(json.data.current_page < json.data.last_page);

    } catch (err) {
      console.error('Fetch users error:', err);
      Toast.show({ type: 'error', text1: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreUsers = () => {
    if (!loading && hasMore && !userSearchText) {
      fetchUsers(page + 1);
    }
  };

  useEffect(() => {
    const search = userSearchText.toLowerCase().trim();

    if (!search) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.label.toLowerCase().includes(search)
    );

    setFilteredUsers(filtered);
  }, [userSearchText, users]);


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

  return (
    <View style={[styles.container,]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={"light-content"}
      />
      <Animated.View style={[
        {
          position: 'absolute',
          width: '100%',
          height: '100%',
          zIndex: 1,
        },
        animatedProfileStyle
      ]}>
        <LinearGradient colors={['transparent', 'transparent']} style={{ flex: 1, height: height, width: "100%", position: 'absolute', }} />
        <ProfileTab handleDrawerClose={handleDrawerClose} />

        <Animated.View style={[blurContainerStyle]}>

        </Animated.View>

      </Animated.View>
      <View style={{ flex: 1 }}>
        <Animated.View style={[{ flex: 1, }, homeScreenStyle]}>
          <ScrollView style={[styles.container, { marginBottom: 100 }]} showsVerticalScrollIndicator={false}>
            <View style={styles.blueContaier} />
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
              <View style={[styles.header, styles.row]}>
                <Pressable onPress={handleDrawerPress}>
                  <LogoIcon />
                </Pressable>
                <View style={[styles.row, styles.button]}>
                  {loadingPunchStatus ? (
                    <AppText size={14} color="white">...</AppText>
                  ) : (
                    <>
                      {
                        isPunchedIn == "end" ? (
                          <>
                            <Pressable style={{ height: 30, paddingHorizontal: 12, borderRadius: 19, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                              <AppText color={colors.blue} size={12} family='InterMedium'>Day Ended</AppText>
                            </Pressable>
                          </>
                        ) : (
                          <Switch
                            value={isPunchedIn}
                            onValueChange={() => handleToggleAttendance()}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={isPunchedIn ? '#36fd36' : '#f4f3f4'}
                          />
                        )
                      }

                    </>
                  )}
                  <Pressable
                    onPress={() => {
                      setShowLeaveModal(true);
                      fetchLeaveBalances();
                    }}
                  >
                    <VillageIcon />
                  </Pressable>
                </View>
              </View>
              <View style={styles.helloName}>
                <AppText size={24} color='white' family='InterLight'>Hello!
                  <AppText size={26} color='white' family='InterSemiBold'> {getFirstName(user?.name)}</AppText>
                </AppText>
              </View>

              <View style={styles.topOptionView}>
                <FlatList
                  data={dashboardTiles}
                  numColumns={3}
                  keyExtractor={(item) => item.id}
                  columnWrapperStyle={{ justifyContent: "space-between", }}
                  contentContainerStyle={{ padding: rw(12), gap: 12, marginTop: rw(21), backgroundColor: 'white', marginHorizontal: 19, borderRadius: 10 }}
                  renderItem={({ item }) => (
                    <TileCard item={item} onpress={(item: any) => {
                      if (item?.id == 2 || item?.id == 3) {
                        if (item?.id == 2) {
                          setPressType('add')
                        }
                        if (item?.id == 3) {
                          setPressType('view')
                        }
                        actionSheetRef.current?.show();
                      } else {
                        navigation.navigate(item?.navigateTo)
                      }

                    }} />
                  )}
                />
                {/* <Pressable style={styles.attandence} onPress={() => {
              navigation.navigate('AttendanceScreen')
            }}>
              <AppText size={16} color='white' family='InterMedium'>Attendance Punch IN</AppText>
            </Pressable>
            <Pressable style={styles.attandence} onPress={() => {
              navigation.navigate('AttendanceReport')
            }}>
              <AppText size={16} color='white' family='InterMedium'>Attendance Report</AppText>
            </Pressable> */}
              </View>

              <View style={[styles.container, { paddingHorizontal: rw(20), backgroundColor: 'transparent' }]}>
                <View style={[styles.graphView]}>
                  <AppText size={17} color={colors.blue} family='InterBold'>Target & Achievement</AppText>
                  <View style={[styles.row, { justifyContent: 'space-between', marginVertical: rw(30) }]}>
                    <Graph />
                    <View style={{ gap: 15 }}>
                      <Pressable style={[styles.UserBox, styles.row]} onPress={() => {
                        Toast.show({
                          type: 'info',
                          text1: 'Coming soon'
                        })
                        // setShowUserModal(true)
                      }}>
                        <View style={{ flex: 1, justifyContent: 'center', }}>
                          <AppText size={14} color='#353535' family='InterRegular'>{selectedUser ? selectedUser.label : "User"}</AppText>
                        </View>
                        <ArrowDownIcon />
                      </Pressable>
                      <Pressable style={[styles.UserBox, styles.row]} onPress={() => {
                        Toast.show({
                          type: 'info',
                          text1: 'Coming soon'
                        })
                        // setShowCal(true)
                      }}>
                        <View style={{ flex: 1, justifyContent: 'center', }}>
                          {
                            (startDate && endDate) ? (
                              <AppText size={12} color="black" family="InterRegular">
                                {formatYYYYMMDD(startDate)} : {formatYYYYMMDD(endDate)}
                              </AppText>
                            ) : (
                              <AppText size={14} color='#353535' family='InterRegular'>Year</AppText>
                            )
                          }
                        </View>
                        {/* <ArrowDownIcon /> */}
                      </Pressable>

                    </View>
                  </View>
                  <View style={[styles.row, { justifyContent: 'space-between' }]}>
                    <View>
                      <AppText size={12} color='#353535' family='InterLight' align='center'>Target Value</AppText>
                      <AppText size={14} color={colors.blue} family='InterSemiBold' align='center'>0 Lac</AppText>
                    </View>
                    <View>
                      <AppText size={12} color='#353535' family='InterLight' align='center'>Percentage (%)</AppText>
                      <AppText size={14} color={colors.blue} family='InterSemiBold' align='center'>0%</AppText>
                    </View>
                    <View>
                      <AppText size={12} color='#353535' family='InterLight' align='center'>Achievement Value</AppText>
                      <AppText size={14} color={colors.blue} family='InterSemiBold' align='center'>0 Lac</AppText>
                    </View>
                  </View>
                </View>
              </View>

              <FlatList
                data={summaryStats}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: rw(20), gap: rw(12), marginTop: 20 }}
                renderItem={({ item }) => (
                  <SummaryCard
                    item={item}
                    orderValue={stats?.total_order_value?.toLocaleString()}
                    quantity={stats?.total_quantity}
                    totalCustomer={stats?.total_customers}
                  />
                )}
              />

              <View style={styles.mainContainer}>
                <AppText size={17} color={colors.blue} family='InterBold'>Activity User</AppText>
                <View style={[styles.graphView]}>
                  <FlatList
                    data={activityTimeline}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                      <ActivityCard index={index} todayPunchInData={todayPunchInData} item={item} navigation={navigation} />
                    )}
                  />
                </View>
                <View style={[styles.row, { justifyContent: 'space-between', marginTop: 40 }]}>
                  <Pressable style={[styles.chatButton, { backgroundColor: colors.blue }]}>
                    <ChatIcon />
                    <AppText size={14} color={colors.white} family='InterBold' >Customers</AppText>
                  </Pressable>
                  <Pressable style={[styles.chatButton, { backgroundColor: '#D2DAEE' }]} onPress={() => {
                    navigation?.navigate("ProductCatalogue")

                  }}>
                    <CallIcon />
                    <AppText size={14} color={'#395299'} family='InterBold' >Add Order</AppText>
                  </Pressable>
                </View>
                <View style={{ height: 50 }} />
              </View>
            </SafeAreaView>
          </ScrollView>
        </Animated.View>
      </View>
      {/* ─── Leave Request Modal ──────────────────────────────────────────── */}
      <RNModal
        visible={showLeaveModal}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowLeaveModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)', }}>

          <View
            style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              paddingBottom: 40,
              maxHeight: '90%',
              minHeight: '90%',
              height: '90%'
            }}
          >
            <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
              <KeyboardAwareScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
                keyboardDismissMode='on-drag'
                bottomOffset={50}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <AppText size={20} family="InterSemiBold" color={colors.blue}>
                    Leave Request
                  </AppText>
                  <TouchableOpacity onPress={() => setShowLeaveModal(false)}>
                    <CrossIcon />
                  </TouchableOpacity>
                </View>

                {/* Leave Balances */}
                <AppText underline='underline' size={16} family="InterBold" style={{ marginBottom: 12 }}>
                  Current Leave Balances
                </AppText>

                {loadingBalances ? (
                  <AppText>Loading balances...</AppText>
                ) : leaveBalances ? (
                  <View style={[{ marginBottom: 24, flexWrap: 'wrap' }, styles.row]}>
                    <View
                      style={{
                        flexDirection: 'row',
                        paddingVertical: 8,
                        width: '48%',
                        borderBottomWidth: 1,
                        borderBottomColor: '#f0f0f0',
                      }}
                    >
                      <AppText size={14} color='black' family='InterMedium'>{'Earned Leave:- '}</AppText>
                      <AppText size={14} color='black' family='InterBold'>{leaveBalances?.earned}</AppText>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        paddingVertical: 8,
                        width: '48%',
                        borderBottomWidth: 1,
                        borderBottomColor: '#f0f0f0',
                      }}
                    >
                      <AppText size={14} color='black' family='InterMedium'>{'Casual Leave:- '}</AppText>
                      <AppText size={14} color='black' family='InterBold'>{leaveBalances?.casual}</AppText>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        paddingVertical: 8,
                        width: '48%',
                        borderBottomWidth: 1,
                        borderBottomColor: '#f0f0f0',
                      }}
                    >
                      <AppText size={14} color='black' family='InterMedium'>{'Sick Leave:- '}</AppText>
                      <AppText size={14} color='black' family='InterBold'>{leaveBalances?.sick}</AppText>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        paddingVertical: 8,
                        width: '48%',
                        borderBottomWidth: 1,
                        borderBottomColor: '#f0f0f0',
                      }}
                    >
                      <AppText size={14} color='black' family='InterMedium'>{'Comp-off Leave:- '}</AppText>
                      <AppText size={14} color='black' family='InterBold'>{leaveBalances?.comp_off}</AppText>
                    </View>
                    {/* {Object.entries(leaveBalances).map(([key, value]: [string, any]) => (
                  <View
                    key={key}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingVertical: 8,
                      width:'48%',
                      borderBottomWidth: 1,
                      borderBottomColor: '#f0f0f0',
                    }}
                  >
                    <AppText>{key.replace(/([A-Z])/g, ' $1').trim()}</AppText>
                    <AppText family="InterSemiBold">{value}</AppText>
                  </View>
                ))} */}
                  </View>
                ) : (
                  <AppText color="gray">No balance data available</AppText>
                )}

                {/* Form */}
                <AppText size={15} family="InterMedium" style={{ marginBottom: 8 }}>
                  From Date
                </AppText>
                <Pressable
                  onPress={() => setShowFromPicker(true)}
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                  }}
                >
                  <AppText>{fromDate.toISOString().split('T')[0]}</AppText>
                </Pressable>

                {showFromPicker && (
                  <DateTimePicker
                    value={fromDate}
                    mode="date"
                    display="default"
                    onChange={(_, date) => {
                      setShowFromPicker(false);
                      if (date) setFromDate(date);
                    }}
                  />
                )}

                <AppText size={15} family="InterMedium" style={{ marginBottom: 8 }}>
                  To Date
                </AppText>
                <Pressable
                  onPress={() => setShowToPicker(true)}
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                  }}
                >
                  <AppText>{toDate.toISOString().split('T')[0]}</AppText>
                </Pressable>

                {showToPicker && (
                  <DateTimePicker
                    value={toDate}
                    mode="date"
                    display="default"
                    onChange={(_, date) => {
                      setShowToPicker(false);
                      if (date) setToDate(date);
                    }}
                  />
                )}

                <AppText size={15} family="InterMedium" style={{ marginBottom: 8 }}>
                  Leave Type
                </AppText>
                <Dropdown
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                  }}
                  data={leaveTypes}
                  labelField="label"
                  valueField="value"
                  placeholder="Select leave type"
                  value={selectedType}
                  onChange={(item) => setSelectedType(item.value)}
                />

                <AppText size={15} family="InterMedium" style={{ marginBottom: 8 }}>
                  Balance Type
                </AppText>
                <Dropdown
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                  }}
                  data={balanceTypes}
                  labelField="label"
                  valueField="value"
                  placeholder="Select balance type"
                  value={selectedBalType}
                  onChange={(item) => setSelectedBalType(item.value)}
                />

                <AppText size={15} family="InterMedium" style={{ marginBottom: 8 }}>
                  Reason
                </AppText>
                <TextInput
                  multiline
                  numberOfLines={4}
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    textAlignVertical: 'top',
                    minHeight: 80,
                    marginBottom: 24,
                  }}
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Enter reason for leave..."
                />

                {/* Buttons */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => setShowLeaveModal(false)}
                    style={{
                      flex: 1,
                      padding: 14,
                      backgroundColor: '#f0f0f0',
                      borderRadius: 12,
                      alignItems: 'center',
                    }}
                  >
                    <AppText family="InterMedium">Cancel</AppText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={submitLeaveRequest}
                    style={{
                      flex: 1,
                      padding: 14,
                      backgroundColor: colors.blue,
                      borderRadius: 12,
                      alignItems: 'center',
                    }}
                    disabled={loaderLeave}
                  >
                    {
                      loaderLeave ? (
                        <ActivityIndicator size={'small'} color={'white'} />
                      ) : (
                        <AppText color="white" family="InterSemiBold">
                          Submit Request
                        </AppText>
                      )
                    }

                  </TouchableOpacity>
                </View>
              </KeyboardAwareScrollView>
            </SafeAreaView>
          </View>
        </View>
      </RNModal>

      <ActionSheet
        ref={actionSheetRef}
        gestureEnabled
        containerStyle={{
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: '#fff',
          paddingBottom: 20,
        }}
        indicatorStyle={{
          backgroundColor: '#D1D5DB',
          width: 40,
          height: 5,
        }}
        onClose={() => {
          setPressType(null)
        }}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          {/* Title */}
          <AppText
            size={18}
            color="#111827"
            family="InterSemiBold"
            align="center"
          >
            Select User Type
          </AppText>

          {/* Options */}
          {userTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              activeOpacity={0.7}
              onPress={() => handleSelectType(type.navigateTO, type?.title2)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6',
              }}
            >
              {/* Icon (emoji for now – replace with SVG later) */}
              <Text style={{ fontSize: 24, marginRight: 16 }}>{type.icon}</Text>

              <AppText
                size={16}
                color="#1F2937"
                family="InterMedium"
              >
                {type.title}
              </AppText>
            </TouchableOpacity>
          ))}

          {/* Cancel button */}
          {/* <TouchableOpacity
            onPress={() => actionSheetRef.current?.hide()}
            style={{
              marginTop: 20,
              paddingVertical: 16,
              backgroundColor: '#F3F4F6',
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <AppText size={16} color="#EF4444" family="InterSemiBold">
              Cancel
            </AppText>
          </TouchableOpacity> */}
          <Pressable style={[{ alignSelf: 'center', height: 40, width: 40, borderRadius: 34, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', position: 'absolute', top: -70 }]} onPress={() => actionSheetRef.current?.hide()}>
            <CrossIcon />
          </Pressable>

        </View>
      </ActionSheet>

    </View>
  )
}

export default Home
