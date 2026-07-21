// import React, { useState } from 'react';
// import {
//   View,
//   StyleSheet,
//   TextInput,
//   FlatList,
//   TouchableOpacity,

// } from 'react-native';
// import AppText from '../../components/AppText/AppText';
// import { SafeAreaView } from 'react-native-safe-area-context';

// const activities = [
//   {
//     id: '1',
//     title: 'Mechanic Meet',
//     location: 'Malad East, Mumbai',
//     date: '04 Apr 2026',
//     status: 'Submitted',
//     mechanics: 20,
//     qty: 98,
//     amount: '₹11,176',
//     employee: 'Sumit Kashyap',
//   },
//   {
//     id: '2',
//     title: 'Retailer Meet',
//     location: 'Andheri West, Mumbai',
//     date: '01 Apr 2026',
//     status: 'Draft',
//     mechanics: 12,
//     qty: 45,
//     amount: '₹8,900',
//     employee: 'Priya Sharma',
//   },
// ];

// const stats = [
//   { label: 'Total', value: 6 },
//   { label: 'Tent', value: 2 },
//   { label: 'Retailer', value: 1 },
//   { label: 'Mechanic', value: 1 },
//   { label: 'Van', value: 2 },
// ];

// const PACScreen = ({navigation}: any) => {
//   const [search, setSearch] = useState('');

//   const renderActivity = ({ item }: any) => {
//     return (
//       <TouchableOpacity style={styles.card}>
//         <View style={styles.cardHeader}>
//           <View style={styles.iconContainer}>
//             <AppText size={20}>🔧</AppText>
//           </View>

//           <View style={{ flex: 1 }}>
//             <AppText family="InterBold" size={14}>
//               {item.title}
//             </AppText>

//             <AppText
//               family="InterRegular"
//               size={12}
//               color="#667085"
//               style={{ marginTop: 4 }}
//             >
//               📍 {item.location}
//             </AppText>

//             <AppText
//               family="InterRegular"
//               size={12}
//               color="#667085"
//               style={{ marginTop: 2 }}
//             >
//               📅 {item.date}
//             </AppText>
//           </View>

//           <View style={styles.statusBadge}>
//             <AppText
//               family="InterSemiBold"
//               size={10}
//               color="#1D7A48"
//             >
//               {item.status}
//             </AppText>
//           </View>
//         </View>

//         <View style={styles.statsRow}>
//           <View style={styles.statBox}>
//             <AppText family="InterBold" size={15}>
//               {item.mechanics}
//             </AppText>
//             <AppText size={10} color="#98A2B3">
//               Mechanics
//             </AppText>
//           </View>

//           <View style={styles.statBox}>
//             <AppText family="InterBold" size={15}>
//               {item.qty}
//             </AppText>
//             <AppText size={10} color="#98A2B3">
//               Order Qty
//             </AppText>
//           </View>

//           <View style={styles.statBox}>
//             <AppText family="InterBold" size={14}>
//               {item.amount}
//             </AppText>
//             <AppText size={10} color="#98A2B3">
//               Amount
//             </AppText>
//           </View>
//         </View>

//         <View style={styles.footer}>
//           <View style={styles.avatar}>
//             <AppText
//               family="InterBold"
//               size={10}
//               color="#fff"
//             >
//               SK
//             </AppText>
//           </View>

//           <AppText size={12} color="#667085">
//             {item.employee}
//           </AppText>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <SafeAreaView style={styles.container} edges={['bottom']}>
//         {/* HEADER */}
//         <View style={styles.header}>
//           <View>
//             <AppText family="InterBold" size={18} color="#fff">
//               Promotional Activity
//             </AppText>

//             <AppText size={11} color="rgba(255,255,255,0.7)">
//               Elofic — Sales Team
//             </AppText>
//           </View>

//           <TouchableOpacity style={styles.newButton} onPress={()=>navigation.navigate('CreatePac')}>
//             <AppText
//               family="InterBold"
//               size={12}
//               color="#fff"
//             >
//               + New
//             </AppText>
//           </TouchableOpacity>
//         </View>

//         {/* STATS */}
//         <View style={styles.statsContainer}>
//           {stats.map(item => (
//             <View key={item.label} style={styles.statsCard}>
//               <AppText
//                 family="InterBold"
//                 size={20}
//                 color="#fff"
//                 align="center"
//               >
//                 {item.value}
//               </AppText>

//               <AppText
//                 size={10}
//                 color="rgba(255,255,255,0.7)"
//                 align="center"
//               >
//                 {item.label}
//               </AppText>
//             </View>
//           ))}
//         </View>

//         {/* SEARCH */}
//         <View style={styles.searchContainer}>
//           <TextInput
//             value={search}
//             onChangeText={setSearch}
//             placeholder="Search activity..."
//             style={styles.searchInput}
//           />
//         </View>

//         {/* DATE FILTER */}
//         <View style={styles.dateRow}>
//           <TouchableOpacity style={styles.dateBox}>
//             <AppText size={11}>From Date</AppText>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.dateBox}>
//             <AppText size={11}>To Date</AppText>
//           </TouchableOpacity>
//         </View>

//         {/* LIST */}
//         <FlatList
//           data={activities}
//           keyExtractor={item => item.id}
//           renderItem={renderActivity}
//           contentContainerStyle={{
//             paddingBottom: 120,
//           }}
//         />

//         {/* FAB */}
//         <TouchableOpacity style={styles.fab}>
//           <AppText size={28} color="#fff">
//             +
//           </AppText>
//         </TouchableOpacity>
//       </SafeAreaView>
//     </View>
//   );
// };

// export default PACScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F0F4FA',
//   },

//   header: {
//     backgroundColor: '#1A3A6B',
//     paddingHorizontal: 16,
//     paddingVertical: 16,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },

//   newButton: {
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },

//   statsContainer: {
//     backgroundColor: '#1A3A6B',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 12,
//     paddingBottom: 16,
//   },

//   statsCard: {
//     flex: 1,
//     marginHorizontal: 4,
//     backgroundColor: 'rgba(255,255,255,0.12)',
//     borderRadius: 12,
//     paddingVertical: 12,
//   },

//   searchContainer: {
//     padding: 16,
//   },

//   searchInput: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E4E7EC',
//     paddingHorizontal: 14,
//     height: 48,
//   },

//   dateRow: {
//     flexDirection: 'row',
//     paddingHorizontal: 16,
//     gap: 10,
//     marginBottom: 10,
//   },

//   dateBox: {
//     flex: 1,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     paddingVertical: 12,
//     alignItems: 'center',
//   },

//   card: {
//     backgroundColor: '#fff',
//     marginHorizontal: 16,
//     marginBottom: 12,
//     borderRadius: 16,
//     overflow: 'hidden',
//   },

//   cardHeader: {
//     flexDirection: 'row',
//     padding: 14,
//   },

//   iconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 12,
//     backgroundColor: '#EAF1FD',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },

//   statusBadge: {
//     backgroundColor: '#E6F7EE',
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 20,
//     alignSelf: 'flex-start',
//   },

//   statsRow: {
//     flexDirection: 'row',
//     borderTopWidth: 1,
//     borderColor: '#F1F3F5',
//   },

//   statBox: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 12,
//   },

//   footer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 14,
//     borderTopWidth: 1,
//     borderColor: '#F1F3F5',
//   },

//   avatar: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: '#1A3A6B',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 8,
//   },

//   fab: {
//     position: 'absolute',
//     bottom: 90,
//     right: 20,
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: '#E8502A',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   bottomNav: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: '#fff',
//     flexDirection: 'row',
//     borderTopWidth: 1,
//     borderColor: '#E4E7EC',
//     paddingVertical: 12,
//   },

//   navItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
// });


import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, View, TextInput, Platform } from 'react-native';
import { ArrowDownIcon, CalenderIcon, PlusAddIcon } from '../../assets/svgs/SvgsFile';
import { colors } from '../../utils/Colors';
import AppText from '../../components/AppText/AppText';
import { rw } from '../../utils/responsive';
import { fonts, shadowStyle } from '../../utils/typography';
import store from '../../components/redux/Store';
import Toast from 'react-native-toast-message';
import CustomerCalendar from '../../components/CustomCalendar/CalendarPopupView';
import { LocationIcon, SearchSvgIcon } from '../../assets/svgs/HomePageSvgs';
import { useFocusEffect } from '@react-navigation/native';

type ActivityItem = {
  id: string;
  type: string;
  title: string;
  location: string;
  date: string;
  mechanics: number;
  orderQty: number;
  amount: number;
  employee: string;
  employeeInitials: string;
  status: 'SUBMITTED' | 'DRAFT';
};

const PACScreen = ({ navigation }: any) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const [loading, setLoading] = useState(false);

  const [paginationLoading, setPaginationLoading] =
    useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState(1);
  const [activityTypeData, setActivityTypeData] = useState<any>();
  const [selectActivity, setSelectActivity] = useState<any>(null);

  const [lastPage, setLastPage] = useState(1);

  const [refreshing, setRefreshing] = useState(false);
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


  const fetchActivities = async (
    pageNumber = 1,
    search = '',
    start?: Date,
    end?: Date,
    reset = true,
    activityType: string | null = null,
  ) => {
    try {
      if (pageNumber === 1) {
        setLoading(true);
      } else {
        setPaginationLoading(true);
      }

      const token =
        store.getState().auth?.token;

      const startDateParam =
        start
          ? formatYYYYMMDD(start)
          : '';

      const endDateParam =
        end
          ? formatYYYYMMDD(end)
          : '';

      const params = new URLSearchParams();

      params.append('page', pageNumber.toString());
      params.append('per_page', '20');

      if (search?.trim()) {
        params.append('search', search);
      }

      if (startDateParam) {
        params.append('start_date', startDateParam);
      }

      if (endDateParam) {
        params.append('end_date', endDateParam);
      }

      if (activityType) {
        params.append('activity_type', activityType);
      }

      const url = `https://elofic.fieldkonnect.io/api/promotional-activities?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const result = await response.json();

      if (result?.status) {
        const apiData =
          result?.data?.data || [];

        const formattedData =
          apiData.map((item: any) => ({
            id: item.id?.toString(),
            type:
              item.activity_type ||
              'Activity',
            title:
              item.target_market ||
              'Activity',
            location:
              item.target_market ||
              '-',
            date: new Date(
              item.activity_date,
            ).toLocaleDateString(
              'en-GB',
              {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              },
            ),
            mechanics:
              item.total_participants || 0,
            orderQty:
              item.total_order_qty || 0,
            amount: Number(
              item.total_order_amount ||
              0,
            ),
            employee:
              item?.approved_by?.name ||
              '-',
            employeeInitials:
              item?.approved_by?.name
                ?.split(' ')
                ?.map(
                  (n: string) => n[0],
                )
                ?.join('')
                ?.slice(0, 2) || '--',
            status: 'SUBMITTED',
          }));

        if (reset || pageNumber === 1) {
          setActivities(formattedData);
        } else {
          setActivities(prev => [
            ...prev,
            ...formattedData,
          ]);
        }

        setPage(
          result?.data?.current_page ||
          1,
        );
        setActivityTypeData(result?.activity_counts)

        setLastPage(
          result?.data?.last_page || 1,
        );
      }
    } catch (error) {
      console.log(error);

      Toast.show({
        type: 'error',
        text1:
          'Failed to load activities',
      });
    } finally {
      setLoading(false);
      setPaginationLoading(false);
      setRefreshing(false);
    }
  };

  const handleApply = (start: Date | null, end: Date | null, type: string) => {
    if (!start || !end) {
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
    fetchActivities(
      1,
      searchQuery,
      normalizedStart,
      normalizedEnd,
      true,
      selectActivity
    );
  };

  const formatYYYYMMDD = (date: any): string => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadMore = () => {
    if (
      paginationLoading ||
      loading ||
      page >= lastPage
    ) {
      return;
    }

    fetchActivities(
      page + 1,
      searchQuery,
      startDate,
      endDate,
      false,
      selectActivity
    );
  };

  const onRefresh = () => {
    setRefreshing(true);

    fetchActivities(
      1,
      searchQuery,
      startDate,
      endDate,
      true,
      selectActivity
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchActivities(
        1,
        '',
        startDate,
        endDate,
        true,
        selectActivity
      );
    }, [])
  )


  useEffect(() => {
    const timer = setTimeout(() => {
      fetchActivities(
        1,
        searchQuery,
        startDate,
        endDate,
        true,
        selectActivity,
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectActivity,]);

  const getStatusStyle = (status: string) => ({
    backgroundColor: status === 'SUBMITTED' ? '#e6f8ee' : '#FEF3E1',
    color: status === 'SUBMITTED' ? '#277f4f' : '#B36B00',
  });

  // Filter activities based on search
  const filteredActivities = activities.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.employee.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderActivity = ({ item }: { item: ActivityItem }) => (
    <Pressable style={[styles.activityCard]} onPress={() => navigation.navigate("PACDetails", { itemId: item.id })}>
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <AppText size={20} family='InterBold' color="#000">
            {item.type.includes('Mechanic') ? '🔧' : item.type.includes('Van') ? '🚐' : item.type.includes('Tent') ? '🏪' : "👤"}
          </AppText>
        </View>
        <View style={{ flex: 1 }}>
          <AppText numLines={1} size={14} family='InterBold' color="#000">{item?.type} - {item.title}</AppText>
          <View style={styles.locationRow}>
            <LocationIcon size={16} color="#abb6c9" />
            <AppText size={12} color="#5a6880" family='InterMedium'> {item.location}</AppText>
          </View>
          <View style={styles.locationRow}>
            <CalenderIcon size={16} color="#abb6c9" />
            <AppText style={{ marginLeft: 4 }} size={12} color="#5a6880" family='InterMedium'>{item.date}</AppText>
          </View>
        </View>
        {/* <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <AppText size={10} family="InterSemiBold" color={getStatusStyle(item.status).color}>
            {item.status}
          </AppText>
        </View> */}
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <AppText size={16} family="InterBold" color="black">{item.mechanics}</AppText>
          <AppText size={10} color="#9aabbe" family='InterSemiBold'>MECHANICS</AppText>
        </View>
        <View style={styles.metric}>
          <AppText size={16} family="InterBold" color="black">{item.orderQty}</AppText>
          <AppText size={10} color="#9aabbe" family='InterSemiBold'>ORDER QTY</AppText>
        </View>
        <View style={styles.metric}>
          <AppText size={16} family="InterBold" color="black">₹{item.amount.toLocaleString('en-IN')}</AppText>
          <AppText size={10} color="#9aabbe" family='InterSemiBold'>AMOUNT</AppText>
        </View>
      </View>

      <View style={styles.employeeRow}>
        <View style={styles.employeeInitials}>
          <AppText size={10} family="InterSemiBold" color="white">{item.employeeInitials}</AppText>
        </View>
        <AppText size={12} family="InterBold" color="#5a6880">{item.employee}</AppText>
        <View style={{ flex: 1 }} />
        <AppText size={10} color={'#1a3a6c'} family='InterBold'>View Details →</AppText>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.row}>
          <View>
            <AppText size={20} family="InterBold" color="white">Promotional Activity</AppText>
            <AppText size={14} color="#a8b3c6" family='InterMedium'>Elofic — Sales Team</AppText>
          </View>
          <Pressable style={styles.newButton} onPress={() => navigation.navigate('CreatePac')}>
            <PlusAddIcon color={'white'} height={14} width={14} />
            <AppText size={14} family='InterBold' color="white">New</AppText>
          </Pressable>
        </View>
        <View style={styles.statsContainer}>
          {[
            { count: (activityTypeData?.["Tent Meet"] + activityTypeData?.["Van Activity"] + activityTypeData?.["Mechanic Meet"] + activityTypeData?.["Retailer Meet"]) || 0, label: 'TOTAL', color: '#fff', value: null },
            { count: (activityTypeData?.["Tent Meet"]) || 0, label: 'TENT', color: '#F59E0B', value: "Tent Meet" },
            { count: (activityTypeData?.["Retailer Meet"]) || 0, label: 'RETAILER', color: '#10B981', value: "Retailer Meet" },
            { count: (activityTypeData?.["Mechanic Meet"]) || 0, label: 'MECHANIC', color: '#3B82F6', value: "Mechanic Meet" },
            { count: (activityTypeData?.["Van Activity"]) || 0, label: 'VAN', color: '#8B5CF6', value: "Van Activity" },
          ].map((stat, index) => (
            <Pressable key={index} style={[
              styles.statCard,
              selectActivity === stat?.value && {
                borderWidth: 2,
                borderColor: '#fff',
              },
            ]}
              onPress={() => {
                setSelectActivity((prev: string | null) =>
                  prev === stat?.value ? null : stat?.value,
                );
              }}>
              <AppText size={20} family="InterBold" color="white">{stat.count}</AppText>
              <AppText numLines={1} size={10} color="#c2c9d7" family="InterBold" align='center'>{stat.label}</AppText>
              <View style={[styles.dot, { backgroundColor: stat.color }]} />
            </Pressable>
          ))}
        </View>
      </View>


      <ScrollView style={{ paddingHorizontal: rw(16), flex: 1 }}>
        {/* Search Bar with TextInput */}
        <View style={[styles.searchContainer, { ...shadowStyle }]}>
          <SearchSvgIcon color={'#9aabbe'} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location, type, employee..."
            placeholderTextColor="#9aabbe"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Date Range - Your Original Calendar Logic */}
        <Pressable style={[styles.dateTimeBox, styles.row, { justifyContent: 'space-between' }]} onPress={() => setShowCal(true)}>
          <View style={{ justifyContent: 'center' }}>
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

        {/* Activity List */}
        <FlatList
          data={activities}
          keyExtractor={item => item.id}
          renderItem={renderActivity}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListFooterComponent={() =>
            paginationLoading ? (
              <ActivityIndicator
                color={colors.blue}
              />
            ) : null
          }
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator
                size="large"
                color={colors.blue}
              />
            ) : (
              <AppText
                align="center"
                style={{ marginTop: 30 }}
              >
                No activities found
              </AppText>
            )
          }
          contentContainerStyle={{
            paddingBottom: 140,
          }}
        />
      </ScrollView>

      {/* Calendar - Your Original Component */}
      <CustomerCalendar
        {...{ showCal, setShowCal }}
        minimumDate={new Date()}
        initialStartDate={startDate}
        initialEndDate={endDate}
        setStartDates={setStartDate}
        setEndDates={setEndDate}
        setRange={setRange}
        range={rangeType}
        onApplyClick={handleApply}
      />
    </View>
  );
};

export default PACScreen;

/* ====================== STYLES ====================== */

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1a3a6c',
    padding: 16,
    paddingTop: 35,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#eef2fa'

  },
  newButton: {
    backgroundColor: '#455e86',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    gap: 8,
    marginTop: 10
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    paddingBottom: 10
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 45,
    shadowOffset: { width: 4, height: 5 },
    shadowColor: Platform.OS == "ios" ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,1)',
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8
  },
  searchInput: {
    flex: 1,
    marginLeft: 5,
    fontSize: 14,
    color: '#1E2937',
    fontFamily: fonts?.InterSemiBold
  },
  dateRangeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateTimeBox: {
    marginTop: 10,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    // flex: 1

  },
  calenderICon: {
    height: 32,
    width: 32,
    backgroundColor: 'white',
    borderColor: "#CBD5E0",
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  calenderIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: Platform.OS == "ios" ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.5)',
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2
  },
  headerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metric: {
    alignItems: 'center',
    gap: 2
  },
  employeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12
  },
  employeeInitials: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});