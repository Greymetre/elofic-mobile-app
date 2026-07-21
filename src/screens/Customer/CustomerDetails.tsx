import { View, Text, Pressable, ScrollView, Alert, Platform, Linking } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { styles } from './styles'
import { rw } from '../../utils/responsive'
import AppText from '../../components/AppText/AppText'
import FastImage from 'react-native-fast-image'
import { BuyOrderIcon, CalenderAddIcon, CalenderIcon, OrderBoxIcon, OrderHistoryIcon } from '../../assets/svgs/SvgsFile'
import { colors } from '../../utils/Colors'
import { useGetCustomerData, useGetSecondaryCustomerData, useGetSubmitCheckIN } from '../../api/query/CustomerApi'
import { BASE_URL } from '../../api/AxiosClient'
import { CheckIcon } from '../../assets/svgs/HomePageSvgs'
import Toast from 'react-native-toast-message'
import Geolocation from '@react-native-community/geolocation'
import { useFocusEffect } from '@react-navigation/native'

type CustomerDetailsProps = {
  navigation: any
  route: any
}

const CustomerDetails = ({ navigation, route }: CustomerDetailsProps) => {
  const routePunchInOut = route?.params?.isPunchedIn
  const [activeTab, setactiveTab] = useState(1)
  const [loader, setLoader] = useState<boolean>(false)
  const [checkInLoading, setCheckInLoading] = useState<boolean>(false)
  const [customerData, setCustomerData] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [checkInHanlde, seCheckInHandle] = useState<any>(null)

  // ── New states for location ────────────────────────────────
  const [currentLat, setCurrentLat] = useState<number | null>(null)
  const [currentLng, setCurrentLng] = useState<number | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  const routeItem = route?.params?.item

  const { mutateAsync: mutateCustomerData } = useGetCustomerData()
  const { mutateAsync: mutateSecondaryCustomerData } = useGetSecondaryCustomerData()
  const { mutateAsync: submitCheckIn } = useGetSubmitCheckIN()

  // Get customer data + location on mount
  useFocusEffect(
    useCallback(() => {
      handleGetCustomerData(routeItem?.id)
      getCurrentLocation()
    }, [])
  )

  // ── Fetch current location once ─────────────────────────────
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setCurrentLat(position.coords.latitude)
        setCurrentLng(position.coords.longitude)
        setLocationError(null)
      },
      (error) => {
        console.log('Location fetch error:', error)
        let msg = 'Unable to get location'

        if (error.code === 1) {
          msg = 'Location permission denied'
        } else if (error.code === 2) {
          msg = 'Location services disabled'
        } else if (error.code === 3) {
          msg = 'Location request timed out'
        }

        setLocationError(msg)
        Toast.show({
          type: 'error',
          text1: 'Location Error',
          text2: msg,
          position: 'top',
          visibilityTime: 4000,
        })
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 20000,
      }
    )
  }

  function isCheckoutBeforeCheckin(checkinDatetime: any, checkoutDatetime: any) {
    // Using Date objects (most reliable)
    const checkin: any = new Date(checkinDatetime);
    const checkout: any = new Date(checkoutDatetime);

    // If either date is invalid → treat as not before (safe default)
    if (isNaN(checkin) || isNaN(checkout)) {
      return false;
    }

    return checkout < checkin;
  }

  const handleGetCustomerData = async (id: any) => {
    setLoader(true)

    try {
      const res = route?.params?.type
        ? await mutateSecondaryCustomerData({ id: routeItem?.id, type: routeItem?.type })
        : await mutateCustomerData(id)

      if (res?.data?.status === true) {
        if (route?.params?.type) {
          const data = res?.data?.data
          setData(data)
          setCustomerData({
            shop_image: data?.shop_photo,
            legal_name: data?.shop_name,
            billing_address: data?.address_line,
            billing_city_name: data?.city?.city_name,
            contact_person: data?.owner_name,
            mobile: data?.mobile_number,
            email: '',
            billing_pincode_name: data?.pincode?.pincode,
            registration_type: data?.type,
            owner_photo: data?.owner_photo,
            gps_location: data?.gps_location,
            check_status: res?.data?.check_status,
            belt_area_market_name: data?.belt_area_market_name,
            vehicle_segment: data?.vehicle_segment,
            opportunity_status: data?.opportunity_status,
            distributor: data?.distributor,
            order_summary: res?.data?.order_summary,
          })


        } else {
          setData(res?.data?.data)
          setCustomerData({ ...res?.data?.data, check_status: res?.data?.check_status })
        }
        seCheckInHandle(
          !!res?.data?.check_status?.last_checkin?.checkin_datetime &&
          !res?.data?.check_status?.last_checkin?.checkout_datetime
        )

        const checkInDate = res?.data?.check_status?.last_checkin?.checkin_datetime
        const checkOutdate = res?.data?.check_status?.last_checkout?.checkout_datetime
        if (checkInDate && checkOutdate) {
          const result: any = isCheckoutBeforeCheckin(
            checkInDate,
            checkOutdate,
          );

          if (result != "NA") {
            seCheckInHandle(result)
          }

        } else {
          seCheckInHandle(!!checkInDate &&
            !checkOutdate)
        }
      }
    } catch (error) {
      console.log('handleGetCustomerData error:', error)
    } finally {
      setLoader(false)
    }
  }

  const handleCheckInOut = async () => {
    if (checkInLoading) return
    // Check if we have location
    if (currentLat === null || currentLng === null) {
      Toast.show({
        type: 'error',
        text1: 'Location not available',
        text2: locationError || 'Please enable location and try again',
        position: 'top',
        visibilityTime: 3500,
      })
      // Optional: try to fetch again
      // getCurrentLocation()
      return
    }

    if (checkInHanlde) {
      Toast.show({
        type: 'error',
        text1: 'check in not available',
        text2: locationError || 'Please enable location and try again',
        position: 'top',
        visibilityTime: 3500,
      })
      navigation.navigate('VisitReport', {
        checkin_id: customerData?.check_status?.last_checkin?.checkin_id,
        entity_type: route?.params?.type ? 'secondary_customer' : 'distributor',
        entity_id: routeItem?.id,
        customerData: customerData, // pass full customer data if needed in report
        latitude: currentLat,
        longitude: currentLng,
      });
      return
    } else {
      setCheckInLoading(true)
      const payload = {
        entity_type: route?.params?.type ? "secondary_customer" : 'distributor',
        entity_id: routeItem?.id,
        checkin_latitude: currentLat,
        checkin_longitude: currentLng,
      }

      try {
        const res = await submitCheckIn(payload)

        if (res?.data?.status === true || res?.data?.status == "success") {

          Toast.show({
            type: 'success',
            text1: checkInHanlde ? 'Checked out successfully' : 'Checked in successfully',
            position: 'top',
            visibilityTime: 2500,
          })

          // Refresh data to update button text / status
          handleGetCustomerData(routeItem?.id)
        } else {
          Toast.show({
            type: 'error',
            text1: res || 'Operation failed',
            text2: res?.data?.message || 'Please try again',
            position: 'top',
          })
        }
      } catch (error: any) {
        console.log('Check-in/out error:', error?.response)
        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: error?.response?.data?.message || 'Could not complete action',
          position: 'top',
        })
      } finally {
        setCheckInLoading(false)
      }
    }
  }

  const hasOpenCheckIn =
    !!customerData?.check_status?.last_checkin?.checkin_datetime &&
    !customerData?.check_status?.last_checkin?.checkout_datetime

  const documents = customerData?.documents ? JSON.parse(customerData.documents) : []

  const handleLocation = async () => {
    const gps = customerData?.gps_location?.trim();
    const addr = customerData?.address_line?.trim();

    let query = '';

    // Prefer coordinates if available
    if (gps && gps.includes(',')) {
      const [lat, lng] = gps.split(',').map((s: string) => s.trim());
      if (lat && lng) {
        query = `${lat},${lng}`;
      }
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
    <View style={[styles.container, { marginTop: 14 }]}>
      <ScrollView
        style={[styles.container, { paddingHorizontal: rw(20) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.tabBarView, styles.row, { marginTop: 14 }]}>
          <Pressable
            style={[
              styles.firstTab,
              styles.center,
              activeTab == 1 && styles.activeTab,
              activeTab == 2 && { width: '40%' },
            ]}
            onPress={() => setactiveTab(1)}
          >
            <AppText
              color={activeTab == 1 ? 'white' : 'black'}
              size={activeTab == 1 ? 15 : 14}
              family={activeTab == 1 ? 'InterSemiBold' : 'InterMedium'}
            >
              Dashboard
            </AppText>
          </Pressable>
          <Pressable
            style={[
              styles.firstTab,
              styles.center,
              activeTab == 2 && styles.activeTab,
              activeTab == 2 && { width: '60%' },
            ]}
            onPress={() => setactiveTab(2)}
          >
            <AppText
              color={activeTab == 2 ? 'white' : 'black'}
              size={activeTab == 2 ? 15 : 14}
              family={activeTab == 2 ? 'InterSemiBold' : 'InterMedium'}
            >
              Customer Information
            </AppText>
          </Pressable>
        </View>

        {activeTab == 1 && (
          <View style={styles.activeInnerContainer}>
            <View style={styles.imageView}>
              <FastImage
                source={customerData?.shop_image
                  ? { uri: `${BASE_URL}public/storage/${customerData?.shop_image}` } : require('../../assets/images/Dummy/Customer2.png')}
                style={styles.firstImage}
              />

              <View style={styles.textHeading}>
                <AppText color="black" size={16} family="InterMedium">
                  {customerData?.legal_name || '-'}
                </AppText>
                <AppText color="black" size={14} family="InterRegular" opacity={0.6}>
                  {customerData?.billing_address
                    ? `${customerData.billing_address}, ${customerData.billing_city_name || ''}`
                    : 'Address not available'}
                </AppText>
              </View>
            </View>
            {
              customerData && (
                <Pressable
                  style={[
                    styles.button,
                    { alignSelf: 'flex-start', marginTop: 15, gap: 6 },
                    styles.row,
                    checkInLoading && { opacity: 0.7 },
                  ]}
                  onPress={() => {
                    if (routePunchInOut == true) {
                      handleCheckInOut()
                    } else {
                      if (routePunchInOut == false) {
                        Toast.show({ type: "error", text1: "Please Punch in your attendance" })
                      } else {
                        Toast.show({ type: "error", text1: "Your Today shift is end" })
                      }
                    }
                  }}
                  disabled={checkInLoading || loader}
                >
                  <CheckIcon color="white" />
                  <AppText size={12} color="#FDFDFD" family="InterSemiBold">
                    {checkInLoading
                      ? 'Processing...'
                      : checkInHanlde
                        ? 'Check Out'
                        : 'Check In'}
                  </AppText>
                </Pressable>
              )
            }


            {/* <View style={[styles.row, styles.filter]}>
              <AppText color="#1E1E1E" family="InterRegular" size={14}>
                AUG 2024 - AUG 2025
              </AppText>
              <Pressable style={styles.calender}>
                <CalenderIcon />
              </Pressable>
            </View> */}
            {
              route?.params?.type && (
                <View style={[styles.orderInformation, { marginTop: 20 }]}>
                  <AppText size={16} color="black" family="InterSemiBold">
                    Orders Information
                  </AppText>
                  <View style={[styles.row, styles.rowView]}>
                    <View style={[styles.row, { gap: 13, alignItems: 'flex-start', marginTop: 18 }]}>
                      <View style={{ marginTop: 7 }}>
                        <BuyOrderIcon />
                      </View>
                      <View style={{ gap: 6 }}>
                        <AppText size={14} color="#5C5C5C" opacity={0.8} family="InterMedium">
                          Total Order Value
                        </AppText>
                        <AppText size={14} color="#000" family="InterBold">
                          {/* API doesn't have → keep placeholder or use avg_monthly_purchase × 12 etc */}
                          {customerData?.order_summary?.total_order_value || 'N/A'}
                        </AppText>
                      </View>
                    </View>

                    <View style={[styles.row, { gap: 13, alignItems: 'flex-start', marginTop: 18 }]}>
                      <View style={{ marginTop: 7 }}>
                        <OrderBoxIcon />
                      </View>
                      <View style={{ gap: 6 }}>
                        <AppText size={14} color="#5C5C5C" opacity={0.8} family="InterMedium">
                          Total Order Qty
                        </AppText>
                        <AppText size={14} color="#000" family="InterBold">
                          {customerData?.order_summary?.total_quantity || 'N/A'}
                        </AppText>
                      </View>
                    </View>
                  </View>

                  <View style={[styles.row, styles.rowView]}>
                    <View style={[styles.row, { gap: 13, alignItems: 'flex-start', marginTop: 18 }]}>
                      <View style={{ marginTop: 7 }}>
                        <CalenderAddIcon />
                      </View>
                      <View style={{ gap: 6 }}>
                        <AppText size={14} color="#5C5C5C" opacity={0.8} family="InterMedium">
                          Last Visit Date
                        </AppText>
                        <AppText size={14} color="#000" family="InterBold">
                          {customerData?.check_status?.last_checkin?.checkin_datetime
                            ? new Date(customerData.check_status.last_checkin.checkin_datetime).toLocaleDateString()
                            : '-'}
                        </AppText>
                      </View>
                    </View>

                    <View style={[styles.row, { gap: 13, alignItems: 'flex-start', marginTop: 18 }]}>
                      <View style={{ marginTop: 7 }}>
                        <OrderHistoryIcon />
                      </View>
                      <View style={{ gap: 6 }}>
                        <AppText size={14} color="#5C5C5C" opacity={0.8} family="InterMedium">
                          Last Order Date
                        </AppText>
                        <AppText size={14} color="#000" family="InterBold">
                          {customerData?.order_summary?.last_order_date ? new Date(customerData.order_summary.last_order_date).toLocaleDateString() : 'N/A'}
                        </AppText>
                      </View>
                    </View>
                  </View>
                </View>
              )
            }


            {/* <View style={[styles.row, styles.gapView]}>
              <Pressable
                style={[styles.activityButton, styles.center, { backgroundColor: colors.blue }]}
                onPress={() => navigation.navigate('TourPlanPage')}
              >
                <FastImage
                  source={require('../../assets/images/DetailsIcon/Activity.png')}
                  style={{ height: 29, width: 29 }}
                  resizeMode="contain"
                />
                <AppText size={14} color="white" family="InterMedium">
                  Activity
                </AppText>
              </Pressable>

              <View style={[styles.activityButton, styles.center, { backgroundColor: 'rgba(57, 82, 153, 0.07)' }]}>
                <FastImage
                  source={require('../../assets/images/DetailsIcon/MenTImers.png')}
                  style={{ height: 29, width: 29 }}
                  resizeMode="contain"
                />
                <AppText size={14} color="black" opacity={0.8} family="InterMedium">
                  Order History
                </AppText>
              </View>
            </View> */}

            <View style={{ height: 40 }} />
          </View>
        )
        }

        {
          activeTab == 2 && (
            <View style={styles.activeInnerContainer}>
              {
                route?.params?.type ? (
                  <View style={styles.imageView}>
                    <AppText size={16} color="black" family="InterSemiBold">
                      Customer Details
                    </AppText>
                    <View style={styles.detailsView}>
                      <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                        Shop Name
                      </AppText>
                      <View style={{ height: 10 }} />
                      <AppText color="black" size={14} family="InterBold">
                        {customerData?.legal_name || '-'}
                      </AppText>
                    </View>

                    <View style={[styles.row, styles.detailsRow]}>
                      <View style={styles.detailsFirstRow}>
                        <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                          Person Name
                        </AppText>
                        <View style={{ height: 10 }} />
                        <AppText color="black" size={14} family="InterBold">
                          {customerData?.contact_person || '-'}
                        </AppText>
                      </View>
                      <View style={styles.detailsSecondRow}>
                        <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                          Phone Number
                        </AppText>
                        <View style={{ height: 10 }} />
                        <AppText color="black" size={14} family="InterBold">
                          {customerData?.mobile ? `+91 ${customerData.mobile}` : '+91 ---'}
                        </AppText>
                      </View>
                    </View>

                    <View style={[styles.row, styles.detailsRow]}>
                      <View style={styles.detailsFirstRow}>
                        <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                          Email Id
                        </AppText>
                        <View style={{ height: 10 }} />
                        <AppText color="black" size={14} family="InterBold">
                          {customerData?.email || '-'}
                        </AppText>
                      </View>

                    </View>
                  </View>
                ) : (
                  <View style={styles.imageView}>
                    <AppText size={16} color="black" family="InterSemiBold">
                      Customer Details
                    </AppText>
                    <View style={styles.detailsView}>
                      <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                        Legal Name
                      </AppText>
                      <View style={{ height: 10 }} />
                      <AppText color="black" size={14} family="InterBold">
                        {customerData?.legal_name || '-'}
                      </AppText>
                    </View>

                    <View style={[styles.row, styles.detailsRow]}>
                      <View style={styles.detailsFirstRow}>
                        <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                          Trade Name
                        </AppText>
                        <View style={{ height: 10 }} />
                        <AppText color="black" size={14} family="InterBold">
                          {customerData?.trade_name || '-'}
                        </AppText>
                      </View>
                      <View style={styles.detailsSecondRow}>
                        <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                          Phone Number
                        </AppText>
                        <View style={{ height: 10 }} />
                        <AppText color="black" size={14} family="InterBold">
                          {customerData?.mobile ? `+91 ${customerData.mobile}` : '+91 ---'}
                        </AppText>
                      </View>
                    </View>
                    <View style={[styles.row, styles.detailsRow]}>
                      <View style={styles.detailsFirstRow}>
                        <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                          Distributor Code
                        </AppText>
                        <View style={{ height: 10 }} />
                        <AppText color="black" size={14} family="InterBold">
                          {customerData?.distributor_code || '-'}
                        </AppText>
                      </View>
                      <View style={styles.detailsSecondRow}>
                        <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                          Category
                        </AppText>
                        <View style={{ height: 10 }} />
                        <AppText color="black" size={14} transform='capitalize' family="InterBold">
                          {customerData?.category}
                        </AppText>
                      </View>
                    </View>

                    <View style={[styles.row, styles.detailsRow]}>
                      <View style={styles.detailsFirstRow}>
                        <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                          Email Id
                        </AppText>
                        <View style={{ height: 10 }} />
                        <AppText color="black" size={14} family="InterBold">
                          {customerData?.email || '-'}
                        </AppText>
                      </View>

                    </View>
                  </View>
                )
              }
              {
                !route?.params?.type && (
                  <View style={[styles.imageView, { marginTop: 20 }]}>
                    <AppText size={16} color="black" family="InterSemiBold">
                      Contact Information
                    </AppText>


                    <View style={[styles.row, styles.detailsRow]}>
                      <View style={styles.detailsFirstRow}>
                        <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                          Contact Person
                        </AppText>
                        <View style={{ height: 10 }} />
                        <AppText color="black" size={14} family="InterBold">
                          {customerData?.contact_person || '-'}
                        </AppText>
                      </View>
                      <View style={styles.detailsSecondRow}>
                        <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                          Designation
                        </AppText>
                        <View style={{ height: 10 }} />
                        <AppText color="black" size={14} family="InterBold">
                          {customerData?.designation || '-'}
                        </AppText>
                      </View>

                    </View>

                  </View>
                )
              }


              <View style={[styles.imageView, { marginTop: 20 }]}>
                <View style={[styles.row, styles.headerRow]}>
                  <AppText size={16} color="black" family="InterSemiBold">
                    Location Details
                  </AppText>
                  <Pressable style={styles.button} onPress={() => handleLocation()}>
                    <AppText size={12} color="#FDFDFD" family="InterSemiBold">
                      View Location
                    </AppText>
                  </Pressable>
                </View>

                <View style={[styles.detailsView, { marginTop: 15 }]}>
                  <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                    Shop Address
                  </AppText>
                  <View style={{ height: 10 }} />
                  <AppText color="black" size={14} family="InterBold">
                    {customerData?.billing_address || '-'}
                  </AppText>
                </View>
                <View style={[styles.row, styles.detailsRow]}>
                  <View style={styles.detailsFirstRow}>
                    <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                      Town Name
                    </AppText>
                    <View style={{ height: 10 }} />
                    <AppText color="black" size={14} family="InterBold">
                      {customerData?.billing_city_name || '-'}
                    </AppText>
                  </View>
                  <View style={styles.detailsSecondRow}>
                    <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                      Pin Code
                    </AppText>
                    <View style={{ height: 10 }} />
                    <AppText color="black" size={14} family="InterBold">
                      {customerData?.billing_pincode_name || '-'}
                    </AppText>
                  </View>
                </View>

                <View style={[styles.row, styles.detailsRow]}>
                  <View style={styles.detailsFirstRow}>
                    <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                      Type
                    </AppText>
                    <View style={{ height: 10 }} />
                    <AppText color="black" size={14} family="InterBold">
                      {customerData?.registration_type || '-'}
                    </AppText>
                  </View>
                </View>
              </View>

              <View style={[styles.imageView, { marginTop: 20 }]}>
                <AppText size={16} color="black" family="InterSemiBold">
                  Attachments
                </AppText>
                <View style={[styles.row, { flex: 1, gap: 27, marginTop: 20 }]}>
                  <View style={styles.firstAttachemnt}>
                    <FastImage
                      style={styles.attImg}
                      source={customerData?.shop_image
                        ? { uri: `${BASE_URL}public/storage/${customerData.shop_image}` }
                        : require('../../assets/images/Dummy/Customer2.png')}
                    />
                    <AppText align="center" size={14} color="black" family="InterBold">
                      {route?.params?.type ? 'Shop Image' : 'Shop Image'}
                    </AppText>
                  </View>

                  <View style={styles.firstAttachemnt}>
                    {
                      route?.params?.type ?
                        <FastImage
                          style={styles.attImg}
                          source={customerData?.owner_photo
                            ? { uri: `${BASE_URL}public/storage/${customerData?.owner_photo}` }
                            : require('../../assets/images/Dummy/Customer2.png')}
                        />
                        : (
                          <>
                            {
                              documents && Array.isArray(documents) && (
                                <FastImage
                                  style={styles.attImg}
                                  source={documents[0]
                                    ? { uri: `${BASE_URL}public/storage/${documents[0]}` }
                                    : require('../../assets/images/Dummy/Customer2.png')}
                                />
                              )
                            }
                          </>
                        )
                    }


                    <AppText align="center" size={14} color="black" family="InterBold">
                      {route?.params?.type ? 'Owner Image' : 'Document'}
                    </AppText>
                  </View>
                </View>
                {
                  !route?.params?.type && (
                    <View style={[styles.row, { flex: 1, gap: 27, marginTop: 20 }]}>
                      <View style={styles.firstAttachemnt}>
                        <FastImage
                          style={styles.attImg}
                          source={customerData?.mou_file
                            ? { uri: `${BASE_URL}public/storage/${customerData.mou_file}` }
                            : require('../../assets/images/Dummy/Customer2.png')}
                        />
                        <AppText align="center" size={14} color="black" family="InterBold">
                          {'MOU File'}
                        </AppText>
                      </View>

                      <View style={styles.firstAttachemnt}>

                        <>


                          <FastImage
                            style={styles.attImg}
                            source={customerData?.cancelled_cheque
                              ? { uri: `${BASE_URL}public/storage/${customerData?.cancelled_cheque}` }
                              : require('../../assets/images/Dummy/Customer2.png')}
                          />

                        </>



                        <AppText align="center" size={14} color="black" family="InterBold">
                          {'Cancelled Cheque'}
                        </AppText>
                      </View>
                    </View>
                  )
                }

              </View>

              <View style={[styles.imageView, { marginTop: 20 }]}>
                <AppText size={16} color="black" family="InterSemiBold">
                  Additional Information
                </AppText>

                {
                  !route?.params?.type && (
                    <>
                      <View style={[styles.row, styles.detailsRow]}>
                        <View style={styles.detailsFirstRow}>
                          <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                            GSTIN No.
                          </AppText>
                          <View style={{ height: 10 }} />
                          <AppText color="black" size={14} family="InterBold">
                            {customerData?.gst_number || '-'}
                          </AppText>
                        </View>
                        <View style={styles.detailsSecondRow}>
                          <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                            PAN No.
                          </AppText>
                          <View style={{ height: 10 }} />
                          <AppText color="black" size={14} family="InterBold">
                            {customerData?.pan_number || '-'}
                          </AppText>
                        </View>
                      </View>

                      <View style={[styles.row, styles.detailsRow]}>
                        <View style={styles.detailsFirstRow}>
                          <AppText color="black" transform='capitalize' size={14} family="InterMedium" opacity={0.8}>
                            Monthly Sales
                          </AppText>
                          <View style={{ height: 10 }} />
                          <AppText color="black" size={14} family="InterBold">
                            {customerData?.monthly_sales || '-'}
                          </AppText>
                        </View>
                        <View style={styles.detailsSecondRow}>
                          <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                            Customer Segment
                          </AppText>
                          <View style={{ height: 10 }} />
                          <AppText color="black" size={14} family="InterBold">
                            {customerData?.customer_segment || '-'}
                          </AppText>
                        </View>
                      </View>
                    </>
                  )
                }
                {
                  route?.params?.type && (
                    <>
                      <View style={[styles.row, styles.detailsRow]}>
                        <View style={styles.detailsFirstRow}>
                          <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                            Vehicle Segment
                          </AppText>
                          <View style={{ height: 10 }} />
                          <AppText color="black" size={14} family="InterBold">
                            {Array.isArray(customerData?.vehicle_segment)
                              ? customerData.vehicle_segment.join(', ')
                              : customerData?.vehicle_segment || '-'}
                          </AppText>
                        </View>
                        <View style={styles.detailsSecondRow}>
                          <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                            Distributor Name
                          </AppText>
                          <View style={{ height: 10 }} />
                          <AppText color="black" size={14} family="InterBold">
                            {customerData?.distributor?.legal_name || '-'}
                          </AppText>
                        </View>
                      </View>
                      <View style={[styles.row, styles.detailsRow]}>
                        <View style={styles.detailsFirstRow}>
                          <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                            Opportunity Status
                          </AppText>
                          <View style={{ height: 10 }} />
                          <AppText color="black" size={14} family="InterBold">
                            {customerData?.opportunity_status || '-'}
                          </AppText>
                        </View>
                        <View style={styles.detailsSecondRow}>
                          <AppText color="black" size={14} family="InterMedium" opacity={0.8}>
                            Belt Area
                          </AppText>
                          <View style={{ height: 10 }} />
                          <AppText color="black" size={14} family="InterBold">
                            {customerData?.belt_area_market_name || '-'}
                          </AppText>
                        </View>
                      </View>
                    </>
                  )
                }
              </View>
              <Pressable style={styles.edit} onPress={() => {
                if (!route?.params?.type) {
                  navigation.navigate('AddCustomer', { customer: customerData })
                } else {
                  navigation.navigate('AddSecondaryCustomer', { customer: data, type: routeItem?.type })
                }
              }}>
                <AppText color='white' family='InterSemiBold' size={16}>Edit</AppText>
              </Pressable>

              <View style={{ height: 40 }} />
            </View>
          )
        }
      </ScrollView >
    </View >
  )
}

export default CustomerDetails
