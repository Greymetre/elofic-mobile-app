import { View, Text, Pressable, Image, TextInput, FlatList, ActivityIndicator, Platform } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { styles } from './styles'
import { CircleCheckIcon, FilterIcon, HeadSetIcon, ListIcon } from '../../assets/svgs/ComplaintSvgs'
import AppText from '../../components/AppText/AppText'
import { colors } from '../../utils/Colors'
import { ClockIcon, PlusIcon, SearchSvgIcon } from '../../assets/svgs/HomePageSvgs'
import { shadowStyle } from '../../utils/typography'
import ComplaintView from './ComplaintView'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import store from '../../components/redux/Store'
import { useFocusEffect } from '@react-navigation/native'
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomerCalendar from '../../components/CustomCalendar/CalendarPopupView';
import { CrossIcon } from '../../assets/svgs/SvgsFile'

const data = [
  { id: 1, name: 'Ramesh Kumar', custId: "CK-2627-001", complainNo: "PT-1042", mobile: "9876543210", location: "Near palace, Mumbai, Maharashtra, India", date: "01-Jun-26", type: "Product Defect", status: "Pending" },
  { id: 2, name: 'Meena Joshi', custId: "CK-2627-002", complainNo: "PT-3310", mobile: "9823456710", location: "Indore, MP", date: "02-Jun-26", type: "Warranty Claim", status: "Closed" },
  { id: 3, name: 'Meena Joshi', custId: "CK-2627-002", complainNo: "PT-3310", mobile: "9823456710", location: "Indore, MP", date: "02-Jun-26", type: "Warranty Claim", status: "Closed" },
  { id: 4, name: 'Meena Joshi', custId: "CK-2627-002", complainNo: "PT-3310", mobile: "9823456710", location: "Indore, MP", date: "02-Jun-26", type: "Warranty Claim", status: "Closed" },
]
const Complaint = ({ navigation }: any) => {
  // const [search, setSearch] = useState('')

  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [search, setSearch] = useState('');
  const [searchText, setSearchText] = useState('');

  const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'pending' | 'closed'
  >('all');

  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    closed: 0,
  });

  const [showFilter, setShowFilter] = useState(false);

  const [showStartDatePicker, setShowStartDatePicker] =
    useState(false);

  const [showEndDatePicker, setShowEndDatePicker] =
    useState(false);

  const [tempDate, setTempDate] = useState(new Date());
  const [showCal, setShowCal] = useState(false);

  const [rangeType, setRange] =
    useState('currentMonth');

  const [startDate, setStartDate] =
    useState<any>(null);

  const [endDate, setEndDate] =
    useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const getComplaintList = async (
    pageNumber = 1,
    isLoadMore = false,
  ) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
      }

      let url = `/complaintList?page=${pageNumber}`;

      if (selectedStatus !== 'all') {
        url += `&status=${selectedStatus}`;
      }

      if (search?.trim()) {
        url += `&search=${search}`;
      }

      if (startDate) {
        url += `&start_date=${formatYYYYMMDD(
          startDate,
        )}`;
      }

      if (endDate) {
        url += `&end_date=${formatYYYYMMDD(
          endDate,
        )}`;
      }

      const token = store.getState()?.auth?.token;

      const response = await fetch(
        `https://elofic.fieldkonnect.io/api${url}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      const json = await response.json();

      const result = json?.data;

      const formattedData =
        result?.data?.map((item: any) => ({
          id: item?.id,

          name:
            item?.customer?.customer_name?.trim() ||
            item?.distributor?.trade_name ||
            'N/A',

          custId:
            item?.distributor?.distributor_code ||
            '--',

          complainNo:
            item?.complaint_number ||
            '--',

          mobile:
            item?.customer?.customer_number ||
            item?.whatsapp_number ||
            '--',

          location:
            item?.customer?.customer_address ||
            item?.customer?.customer_place ||
            '--',

          date: item?.updated_at,

          type:
            item?.complaint_type_details?.name ||
            '--',

          status:
            item?.complaint_status === 4
              ? 'Closed'
              : 'Pending',

          rawData: item,
        })) || [];

      if (isLoadMore) {
        setComplaints(prev => [...prev, ...formattedData]);
      } else {
        setComplaints(formattedData);
      }

      setPage(result?.current_page);
      setLastPage(result?.last_page);

    
      setCounts({
        total: result?.counts?.all || 0,
        closed: result?.counts?.closed || 0,
        pending: result?.counts?.pending || 0,
      });
    } catch (error) {
      console.log('Complaint Error =>', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getComplaintList(1);
    }, [
      selectedStatus,
      search,
      startDate,
      endDate,
    ])
  );


  const formatApiDate = (date: Date) => {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1,
    ).padStart(2, '0');

    const day = String(
      date.getDate(),
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const formatYYYYMMDD = (
    date: any,
  ): string => {
    if (!date) return '';

    const d = new Date(date);

    const year = d.getFullYear();

    const month = String(
      d.getMonth() + 1,
    ).padStart(2, '0');

    const day = String(
      d.getDate(),
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };


  const handleApply = (
    start: Date | null,
    end: Date | null,
    type: string,
  ) => {
    if (!start || !end) {
      return;
    }

    const normalizedStart =
      new Date(start);

    normalizedStart.setHours(
      0,
      0,
      0,
      0,
    );

    const normalizedEnd =
      new Date(end);

    normalizedEnd.setHours(
      23,
      59,
      59,
      999,
    );

    setStartDate(normalizedStart);

    setEndDate(normalizedEnd);

    setRange(type);

    setShowCal(false);

    // getComplaintList(1);
  };

  useEffect(() => {
    if (startDate && endDate) {
      setPage(1);
      getComplaintList(1);
    }
  }, [startDate, endDate]);



  const loadMore = () => {
    if (loading) return;

    if (page < lastPage) {
      getComplaintList(page + 1, true);
    }
  };

  const renderItem = useCallback(({ item, index }: { item: any, index: number }) => {
    return (
      <ComplaintView
        item={item}
        index={index}
        navigation={navigation} />
    )
  },
    [complaints],)



  // if (loading && page === 1) {
  //   return (
  //     <View
  //       style={{
  //         flex: 1,
  //         justifyContent: 'center',
  //         alignItems: 'center',
  //       }}>
  //       <ActivityIndicator
  //         size="large"
  //         color={colors.blue}
  //       />
  //     </View>
  //   );
  // }

  return (
    <View style={styles.container}>
      <View style={[styles.header, styles.row, { alignItems: "flex-start", }]}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Image
            source={require('../../assets/images/Dummy/back.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </Pressable>
        <View style={{ flex: 1 }}>
          <AppText style={{ flex: 1 }} size={16} color='white' family='InterBold'>Complaint Listing</AppText>
          <AppText style={{ flex: 1, opacity: 0.7 }} size={12} color='white' family='InterBold'>FieldKonnect-</AppText>
        </View>
        <View style={styles.headsetView}>
          <HeadSetIcon />
        </View>
      </View>
      <View style={[styles.row, styles.typeView,]}>
        <Pressable style={[
          styles.typeInnerBox,
          selectedStatus === 'all' && {
            borderWidth: 2,
            borderColor: colors.blue,
          },
        ]}
          onPress={() => {
            setSelectedStatus('all');
            setPage(1);
          }}>
          <View style={styles.iconView}>
            <ListIcon color={colors.blue} />
          </View>
          <AppText color={colors.blue} size={26} family='InterBold'>{counts?.total}</AppText>
          <AppText style={{ top: -4 }} opacity={0.6} color={'black'} size={10} family='InterMedium'>TOTAL</AppText>
        </Pressable>
        <Pressable style={[
          styles.typeInnerBox,
          selectedStatus === 'pending' && {
            borderWidth: 2,
            borderColor: '#cf9744',
          },
        ]}
          onPress={() => {
            setSelectedStatus('pending');
            setPage(1);
          }}>
          <View style={[styles.iconView, { backgroundColor: '#efe8da' }]}>
            <ClockIcon color={"#cf9744"} />
          </View>
          <AppText color={"#cf9744"} size={26} family='InterBold'>{counts?.pending}</AppText>
          <AppText style={{ top: -4 }} opacity={0.6} color={'black'} size={10} family='InterMedium'>PENDING</AppText>
        </Pressable>
        <Pressable style={[
          styles.typeInnerBox,
          selectedStatus === 'closed' && {
            borderWidth: 2,
            borderColor: '#2aae2a',
          },
        ]}
          onPress={() => {
            setSelectedStatus('closed');
            setPage(1);
          }}>
          <View style={[styles.iconView, { backgroundColor: '#d9f4d9' }]}>
            <CircleCheckIcon color={"#2aae2a"} />
          </View>
          <AppText color={"#2aae2a"} size={26} family='InterBold'>{counts?.closed}</AppText>
          <AppText style={{ top: -4 }} opacity={0.6} color={'black'} size={10} family='InterMedium'>CLOSED</AppText>
        </Pressable>
      </View>
      <View style={[styles.inputFilterView, styles.row]}>
        <View style={[styles.input, styles.row]}>
          <SearchSvgIcon color={'rgba(0,0,0,0.4)'} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            style={styles.singleInput}
            placeholder='Search name, ID, part, type...'
            placeholderTextColor='rgba(0,0,0,0.3)'
          />
        </View>
        <Pressable
          style={[
            styles.filterView,
            styles.center,
          ]}
          onPress={() =>
            setShowFilter(prev => !prev)
          }
        >
          {showFilter ? <CrossIcon /> : <FilterIcon />}
        </Pressable>
      </View>
      {
        showFilter && (
          <View
            style={{
              // marginTop: 10,
              paddingHorizontal: 16
            }}
          >
            <Pressable
              style={{
                height: 48,
                backgroundColor: '#fff',
                borderRadius: 12,
                paddingHorizontal: 14,
                justifyContent:
                  'space-between',
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={() =>
                setShowCal(true)
              }
            >
              <AppText>
                {startDate && endDate
                  ? `${formatYYYYMMDD(
                    startDate,
                  )} : ${formatYYYYMMDD(
                    endDate,
                  )}`
                  : 'Select Date Range'}
              </AppText>

              <FilterIcon />
            </Pressable>

            <Pressable
              style={{
                marginTop: 10,
                height: 45,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#ddd',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                setStartDate(null);
                setEndDate(null);
                setPage(1);
                getComplaintList(1);
              }}
            >
              <AppText size={15} color='red' family='InterBold'>
                Reset Filter
              </AppText>
            </Pressable>
          </View>
        )
      }
      <FlatList
        data={complaints}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshing={refreshing}
        style={{ flex: 1, paddingHorizontal: 16 }}
        onRefresh={() => {
          setRefreshing(true);
          getComplaintList(1);
        }}
        ListEmptyComponent={() => (
          <View
            style={{
              alignItems: 'center',
              marginTop: 80,
            }}>
            <AppText>
              No Complaints Found
            </AppText>
          </View>
        )}
        ListFooterComponent={
          page < lastPage ? (
            <ActivityIndicator
              size="small"
              color={colors.blue}
            />
          ) : <View style={{ height: 50 }} />
        }
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
          navigation.navigate('CreateComplaint');   // Uncomment when you have navigation
        }}
      >
        <PlusIcon width={28} height={28} color="white" />
      </Pressable>
      {
        showStartDatePicker &&
        Platform.OS === 'android' && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowStartDatePicker(false);

              if (date) {
                setStartDate(
                  formatApiDate(date),
                );
              }
            }}
          />
        )
      }
      {
        showEndDatePicker &&
        Platform.OS === 'android' && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowEndDatePicker(false);

              if (date) {
                setEndDate(
                  formatApiDate(date),
                );
              }
            }}
          />
        )
      }
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
  )
}

export default Complaint