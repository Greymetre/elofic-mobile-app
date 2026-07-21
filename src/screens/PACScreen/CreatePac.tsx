import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  Pressable,
  Modal as RNModal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AppText from '../../components/AppText/AppText';
import FormRow from './FormRow';
import FormSection from './FormSection';
import FormCard from './FormCard';
import AttendeesTab from './AttendeesTab';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityformIcon, AttendeesIcon } from '../../assets/svgs/PACSvg';
import store, { useAppSelector } from '../../components/redux/Store';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fonts } from '../../utils/typography';
import { colors } from '../../utils/Colors';
import { CrossIcon, PlusAddIcon } from '../../assets/svgs/SvgsFile';
import DiscussionPoints from './DiscussionPoints';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';


interface Attendee {
  id: string;
  name: string;
  phone: string;
  address: string;
  remarks?: string;
}

const PromotionalActivityFormScreen = ({ navigation, route }: any) => {
  const { isEdit = false, activityData = null } =
    route?.params || {};
  const [tab, setTab] = useState(1);
  const { user } = useAppSelector((state) => state.auth);
  const [approvedByModal, setApprovedByModal] = useState(false);
  const [approvedBy, setApprovedBy] = useState<any>(null);
  const [reportingUsers, setReportingUsers] = useState([]);
  //date related states
  const [activityDate, setActivityDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  //date related states end
  //target market
  const [targetMarket, setTargetMarket] = useState('');
  //Product category states
  const [categoryModal, setCategoryModal] = useState(false);
  const [categories, setCategories] = useState<any | null | undefined>([]);
  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  // Activity Type states
  const [activityTypeModal, setActivityTypeModal] = useState(false);
  const [totalQty, setTotalQty] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [confirmedBy, setConfirmedBy] = useState('');
  const [managerRemarks, setManagerRemarks] = useState('');
  const [selectedActivityType, setSelectedActivityType] =
    useState('');

  const activityTypes = [
    'Tent Meet',
    'Van Activity',
    'Mechanic Meet',
    'Retailer Meet',
  ];
  //total participants states
  const [participantModal, setParticipantModal] = useState(false);

  const [participantType, setParticipantType] = useState('');

  const [participantCount, setParticipantCount] = useState('');

  const participantTypes = [
    'Mechanic',
    'Retailer',
    'Workshop',
    'Garage',
  ];
  //select customer 
  const [customerModal, setCustomerModal] = useState(false);

  const [customers, setCustomers] = useState<any[]>([]);

  const [selectedCustomer, setSelectedCustomer] =
    useState<any>(null);

  const [customerSearch, setCustomerSearch] =
    useState('');

  const [customerPage, setCustomerPage] = useState(1);

  const [customerLastPage, setCustomerLastPage] =
    useState(1);

  const [customerLoading, setCustomerLoading] =
    useState(false);

  const [customerRefreshing, setCustomerRefreshing] =
    useState(false);
  //distributor states
  const [distributorModal, setDistributorModal] = useState(false);

  const [distributors, setDistributors] = useState<any[]>([]);

  const [selectedDistributor, setSelectedDistributor] =
    useState<any>(null);

  const [distributorSearch, setDistributorSearch] =
    useState('');
  const [distributorPage, setDistributorPage] = useState(1);
  const [distributorLastPage, setDistributorLastPage] = useState(1);
  const [distributorLoading, setDistributorLoading] = useState(false);
  const [discussionPoints, setDiscussionPoints] = useState<string[]>([]);

  const [promotionalMaterials, setPromotionalMaterials] =
    useState<string[]>([]);

  const [customerFeedbackQueries, setCustomerFeedbackQueries] =
    useState<string[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);


  useEffect(() => {
    if (!isEdit || !activityData) {
      return;
    }

    setApprovedBy({
      id: activityData.activity_approved_by,
      name:
        activityData.activity_approved_by_name,
    });

    const activityDateObj = new Date(
      activityData.activity_date,
    );

    setActivityDate(
      formatDate(activityDateObj),
    );

    setTargetMarket(
      activityData.target_market || '',
    );

    setSelectedActivityType(
      activityData.activity_type || '',
    );

    setParticipantType(
      activityData.customer_type || '',
    );

    setParticipantCount(
      String(
        activityData.total_participants || 0,
      ),
    );

    setTotalQty(
      String(
        activityData.total_order_qty || '',
      ),
    );

    setTotalAmount(
      String(
        activityData.total_order_amount || '',
      ),
    );

    setConfirmedBy(
      activityData.order_confirm_by || '',
    );

    setManagerRemarks(
      activityData.managers_remarks || '',
    );

    setSelectedCustomer({
      id: activityData.retailer_id,
      shop_name:
        activityData.retailer_name,
    });

    setSelectedDistributor({
      id: activityData.distributor_id,
      legal_name:
        activityData.distributor_name,
    });

    try {
      setDiscussionPoints(
        JSON.parse(
          activityData.discussion_Points ||
          '[]',
        ),
      );
    } catch { }

    try {
      setPromotionalMaterials(
        JSON.parse(
          activityData.material_and_Samples ||
          '[]',
        ),
      );
    } catch { }

    try {
      setCustomerFeedbackQueries(
        JSON.parse(
          activityData.feedback || '[]',
        ),
      );
    } catch { }

    setAttendees(
      (activityData.attendees || []).map(
        (item: any) => ({
          id: String(item.id),
          name: item.person_name,
          phone: item.contact_no,
          address: item.address,
          remarks: item.remarks,
        }),
      ),
    );
  }, [isEdit, activityData]);

  const getReportingUsers = async () => {
    const token = store.getState().auth?.token;
    try {
      const response = await fetch(
        'https://elofic.fieldkonnect.io/api/reporting-users',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: user?.id,
          }),
        },
      );

      const result = await response.json();

      if (result?.success) {
        setReportingUsers(result.data || []);
      }
    } catch (error) {
      console.log('Reporting Users Error:', error);
    }
  };

  const getApiDate = (dateString: string) => {
    if (!dateString) return '';

    const [day, month, year] = dateString.split('/');

    return `${year}-${month}-${day}`;
  };

  const validateForm = () => {
    if (!approvedBy?.id) {
      Alert.alert('Please select Approved By');
      return false;
    }

    if (!activityDate) {
      Alert.alert('Please select Activity Date');
      return false;
    }

    if (!targetMarket.trim()) {
      Alert.alert('Please enter Target Market');
      return false;
    }

    if (selectedCategories.length === 0) {
      Alert.alert('Please select Product Category');
      return false;
    }

    if (!selectedActivityType) {
      Alert.alert('Please select Activity Type');
      return false;
    }

    return true;
  };

  const submitReport = async () => {
    if (submitLoading) {
      return;
    }
    if (!validateForm()) {
      return;
    }

    const token = store?.getState()?.auth?.token;

    try {
      setSubmitLoading(true);
      const payload = {
        activity_approved_by: approvedBy?.id,

        activity_date: getApiDate(activityDate),

        target_market: targetMarket,

        product_category: selectedCategories
          .map(item => item.subcategory_name)
          .join(', '),

        activity_type: selectedActivityType,

        customer_type: participantType,

        total_participants:
          Number(participantCount) || 0,

        customer_count:
          Number(participantCount) || 0,

        retailer_id: selectedCustomer?.id || null,

        distributor_id:
          selectedDistributor?.id || null,

        discussion_Points: discussionPoints,

        material_and_Samples:
          promotionalMaterials,

        feedback:
          customerFeedbackQueries,

        managers_remarks:
          managerRemarks,

        total_order_qty:
          Number(totalQty) || 0,

        total_order_amount:
          Number(totalAmount) || 0,

        order_confirm_by:
          confirmedBy,

        attendees: attendees.map(item => ({
          person_name: item.name,
          contact_no: item.phone,
          address: item.address,
          remarks: 'NA',
        })),
      };

      console.log(
        'PAYLOAD =>',
        JSON.stringify(payload, null, 2),
      );


      const apiUrl = isEdit
        ? `https://elofic.fieldkonnect.io/api/promotional-activities/${activityData.id}`
        : `https://elofic.fieldkonnect.io/api/promotional-activities`;

      const method = isEdit
        ? 'PUT'
        : 'POST';

      const response = await fetch(
        apiUrl,
        {
          method: method,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      console.log(
        'PROMOTIONAL ACTIVITY RESPONSE',
        result,
      );

      if (
        response.ok ||
        result?.success ||
        result?.status
      ) {
        Alert.alert(
          'Success',
          isEdit
            ? 'Activity updated successfully'
            : 'Promotional Activity submitted successfully',
        );
        setSubmitLoading(false);
        navigation.goBack();
      } else {
        Alert.alert(
          'Error',
          result?.message ||
          'Something went wrong',
        );
      }
    } catch (error) {
      console.log(
        'PROMOTIONAL ACTIVITY ERROR',
        error,
      );
      setSubmitLoading(false);
      Alert.alert(
        'Error',
        `Unable to ${isEdit
          ? 'Update Activity'
          : 'Submit Report'}`,
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const getDistributors = async (
    page = 1,
    search = '',
    reset = false,
  ) => {
    const token = store.getState().auth?.token;

    try {
      setDistributorLoading(true);

      const response = await fetch(
        `https://elofic.fieldkonnect.io/api/order/distributors?page=${page}&global_search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      const result = await response.json();

      if (result?.status) {
        if (reset || page === 1) {
          setDistributors(result.data || []);
        } else {
          setDistributors(prev => [
            ...prev,
            ...(result.data || []),
          ]);
        }

        setDistributorPage(
          result?.pagination?.current_page || 1,
        );

        setDistributorLastPage(
          result?.pagination?.last_page || 1,
        );
      }
    } catch (error) {
      console.log('Distributor Error:', error);
    } finally {
      setDistributorLoading(false);
    }
  };

  //category api call
  const getSubCategories = async () => {
    const token = store.getState().auth?.token;

    try {
      const response = await fetch(
        'https://elofic.fieldkonnect.io/api/getSubCategoryList',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      const result = await response.json();

      if (result?.status === 'success') {
        setCategories(result?.data || []);
      }
    } catch (error) {
      console.log('Category Error:', error);
    }
  };

  useEffect(() => {
    if (
      !isEdit ||
      !activityData ||
      !categories?.length
    ) {
      return;
    }

    const selectedNames =
      activityData.product_category
        ?.split(',')
        ?.map((x: string) => x.trim()) || [];

    const matchedCategories =
      categories.filter((cat: any) =>
        selectedNames.includes(
          cat.subcategory_name,
        ),
      );

    setSelectedCategories(
      matchedCategories,
    );
  }, [
    categories,
    isEdit,
    activityData,
  ]);

  //restrict type
  const getRestrictType = () => {
    return participantType?.toUpperCase();
  };

  const getCustomers = async (
    page = 1,
    search = '',
    reset = false,
  ) => {
    if (!participantType) return;

    const token = store.getState().auth?.token;

    try {
      setCustomerLoading(true);

      const response = await fetch(
        `https://elofic.fieldkonnect.io/api/order/secondary-customers?page=${page}&global_search=${search}&restrict=${participantType?.toUpperCase()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      const result = await response.json();

      if (result?.status) {
        if (reset) {
          setCustomers(result.data || []);
        } else {
          setCustomers(prev => [
            ...prev,
            ...(result.data || []),
          ]);
        }

        setCustomerLastPage(
          result?.pagination?.last_page || 1,
        );

        setCustomerPage(
          result?.pagination?.current_page || 1,
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setCustomerLoading(false);
      setCustomerRefreshing(false);
    }
  };

  // date related start
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);

    if (selectedDate) {
      setActivityDate(formatDate(selectedDate));
    }
  };

  // date related end
  //Product category selection handlers
  const toggleCategory = (item: any) => {
    const exists = selectedCategories.find(
      cat => cat.id === item.id,
    );

    if (exists) {
      setSelectedCategories(prev =>
        prev.filter(cat => cat.id !== item.id),
      );
    } else {
      setSelectedCategories(prev => [...prev, item]);
    }
  };
  useEffect(() => {
    getReportingUsers();
    getSubCategories();

  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (customerModal) {
        getCustomers(
          1,
          customerSearch,
          true,
        );
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [customerSearch]);

  //load more customers when page changes
  const loadMoreCustomers = () => {
    if (
      customerLoading ||
      customerPage >= customerLastPage
    ) {
      return;
    }

    getCustomers(
      customerPage + 1,
      customerSearch,
      false,
    );
  };

  const resetCustomerModal = () => {
    setCustomerModal(false);

    setCustomerSearch('');

    setCustomers([]);

    setCustomerPage(1);

    setCustomerLastPage(1);

    setCustomerLoading(false);

    setCustomerRefreshing(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (distributorModal) {
        getDistributors(
          1,
          distributorSearch,
          true,
        );
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [distributorSearch]);

  const loadMoreDistributors = () => {
    if (
      distributorLoading ||
      distributorPage >= distributorLastPage
    ) {
      return;
    }

    getDistributors(
      distributorPage + 1,
      distributorSearch,
      false,
    );
  };

  const resetDistributorModal = () => {
    setDistributorModal(false);

    setDistributorSearch('');

    setDistributors([]);

    setDistributorPage(1);

    setDistributorLastPage(1);

    setDistributorLoading(false);
  };
  return (
    <View style={styles.container}>
      {/* Header */}

      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? useSafeAreaInsets()?.top + 20 : 0 }]}>
        <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 42, justifyContent: 'center', alignItems: 'center', height: 42, width: 42, paddingBottom: 10 }} onPress={() => navigation.goBack()}>
          <AppText color="#fff" size={20}>
            ←
          </AppText>
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <AppText
            family="InterBold"
            size={17}
            color="#fff"
          >
            {isEdit
              ? 'Edit Promotional Activity'
              : 'New Promotional Activity'}
          </AppText>

          <AppText
            size={12}
            family='InterMedium'
            color="rgba(255,255,255,0.6)"
          >
            Fill all required fields
          </AppText>
        </View>
      </View>

      {/* Tabs */}

      <View style={styles.tabContainer}>
        <Pressable
          style={[
            styles.tab,
            tab === 1 && styles.activeTab,
            { flexDirection: 'row', gap: 6, justifyContent: 'center' }
          ]}
          onPress={() => setTab(1)}
        >
          <ActivityformIcon />
          <AppText
            color={tab === 1 ? '#fff' : '#BFC8DA'}
            family="InterSemiBold"
            size={14}
          >
            Activity Form
          </AppText>
        </Pressable>

        <Pressable
          style={[
            styles.tab,
            tab === 2 && styles.activeTab,
            { flexDirection: 'row', gap: 6, justifyContent: 'center' }
          ]}
          onPress={() => setTab(2)}
        >
          <AttendeesIcon />
          <AppText
            color={tab === 2 ? '#fff' : '#BFC8DA'}
            family="InterSemiBold"
            size={14}
          >
            Attendees ({attendees?.length || 0})
          </AppText>
        </Pressable>
      </View>

      {tab === 1 && (

        <KeyboardAwareScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 120,
          }}
          bottomOffset={50}
          keyboardDismissMode='on-drag'
          showsVerticalScrollIndicator={false}
        >
          <FormSection title="Basic Details" />

          <FormCard>
            <FormRow label="Approved By" right="select">
              <TouchableOpacity
                onPress={() => setApprovedByModal(true)}
                style={{
                  height: 40,
                  justifyContent: 'center',
                }}
              >
                <AppText size={13} family={approvedBy ? "InterBold" : "InterMedium"} color={approvedBy ? '#000' : '#999'}>
                  {approvedBy?.name || 'Select Manager'}
                </AppText>
              </TouchableOpacity>
            </FormRow>

            <FormRow label="Activity Date" right="calendar">
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{
                  height: 40,
                  justifyContent: 'center',
                }}
              >
                <AppText size={13} family={activityDate ? "InterBold" : "InterMedium"} color={activityDate ? '#000' : '#999'}>
                  {activityDate || 'DD/MM/YYYY'}
                </AppText>
              </TouchableOpacity>
            </FormRow>

            <FormRow label="Target Market" right="input">
              <TextInput
                placeholder="Enter Market"
                placeholderTextColor="#999"
                style={[styles.marketInput, { fontFamily: targetMarket?.length > 0 ? fonts.InterBold : fonts.InterMedium }]}
                value={targetMarket}
                onChangeText={setTargetMarket}
              />
            </FormRow>

            <FormRow label="Product Category" right="multi">
              <TouchableOpacity
                onPress={() => setCategoryModal(true)}
                style={{
                  minHeight: 40,
                  justifyContent: 'center',
                  flex: 1,
                }}
              >
                {selectedCategories.length > 0 ? (
                  <View style={{ justifyContent: 'center', }}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{
                        gap: 8,
                        paddingVertical: 2,
                      }}
                    >
                      {selectedCategories.map((item: any) => (
                        <View
                          key={item.id}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#E8EFFB',
                            borderRadius: 20,
                            paddingHorizontal: 5,
                            paddingVertical: 2,
                            // height: 24,
                          }}
                        >
                          <AppText
                            size={11}
                            family="InterBold"
                            color="#1A3A6B"
                          >
                            {item.subcategory_name}
                          </AppText>

                          <TouchableOpacity
                            style={{
                              marginLeft: 6,
                            }}
                            onPress={(e) => {
                              e.stopPropagation();

                              setSelectedCategories(prev =>
                                prev.filter(cat => cat.id !== item.id),
                              );
                            }}
                          >
                            <AppText
                              size={9}
                              family="InterBold"
                              color="#1A3A6B"
                            >
                              ✕
                            </AppText>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                ) : (
                  <AppText
                    size={13}
                    family="InterMedium"
                    color="#999"
                  >
                    Select Category
                  </AppText>
                )}
              </TouchableOpacity>
            </FormRow>

            <FormRow label="Activity Type" right="select">
              <TouchableOpacity
                onPress={() => setActivityTypeModal(true)}
                style={{
                  minHeight: 40,
                  justifyContent: 'center',
                }}
              >
                <AppText
                  size={13}
                  family={
                    selectedActivityType
                      ? 'InterBold'
                      : 'InterMedium'
                  }
                  color={
                    selectedActivityType
                      ? '#000'
                      : '#999'
                  }
                >
                  {selectedActivityType || 'Select Activity'}
                </AppText>
              </TouchableOpacity>
            </FormRow>
          </FormCard>

          <FormSection title="Total Participants" />

          <FormCard>
            <View
              style={[
                styles.participantTypeView,
                styles.row,
                {
                  justifyContent: 'space-between',
                },
              ]}
            >
              {/* Type Selection */}
              <TouchableOpacity
                style={[
                  styles.type,
                  {
                    flex: 1,
                  },
                ]}
                onPress={() => setParticipantModal(true)}
              >
                <AppText
                  size={13}
                  family={
                    participantType
                      ? 'InterBold'
                      : 'InterMedium'
                  }
                  color={
                    participantType
                      ? '#000'
                      : '#999'
                  }
                >
                  {participantType || 'Select Type'}
                </AppText>
              </TouchableOpacity>

              {/* Count */}
              <View
                style={[
                  styles.type,
                  {
                    width: 80,
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                  },
                ]}
              >
                <TextInput
                  value={participantCount}
                  onChangeText={setParticipantCount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                  textAlign="center"
                  style={{
                    fontFamily: fonts.InterBold,
                    color: '#000',
                    fontSize: 14,
                  }}
                />
              </View>
              <AppText
                family="InterBold"
                size={10}
                color="#1a0225"
                transform="capitalize"
                style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor: 'rgba(213, 157, 244, 0.4)', borderRadius: 14, marginTop: 14, }}
              >
                {"Input No"}
              </AppText>
            </View>

            <FormRow label="Customer" right="select">
              <TouchableOpacity
                onPress={() => {
                  if (!participantType) {
                    Alert.alert(
                      'Please select participant type first',
                    );
                    return;
                  }

                  setCustomerModal(true);

                  getCustomers(
                    1,
                    customerSearch,
                    true,
                  );
                }}
              >
                <AppText
                  size={13}
                  family={
                    selectedCustomer
                      ? 'InterBold'
                      : 'InterMedium'
                  }
                  color={
                    selectedCustomer
                      ? '#000'
                      : '#999'
                  }
                >
                  {selectedCustomer?.shop_name ||
                    'Select Customer'}
                </AppText>
              </TouchableOpacity>
            </FormRow>

            <FormRow label="Distributor" right="select">
              <TouchableOpacity
                onPress={() => {
                  setDistributorModal(true);

                  getDistributors(
                    1,
                    '',
                    true,
                  );
                }}
              >
                <AppText
                  size={13}
                  family={
                    selectedDistributor
                      ? 'InterBold'
                      : 'InterMedium'
                  }
                  color={
                    selectedDistributor
                      ? '#000'
                      : '#999'
                  }
                >
                  {selectedDistributor?.legal_name ||
                    'Select Distributor'}
                </AppText>
              </TouchableOpacity>
            </FormRow>
          </FormCard>

          <FormSection title="Key Discussion Points" />

          <FormCard>
            <DiscussionPoints
              value={discussionPoints}
              onChange={setDiscussionPoints}
              maxCount={10}
              placeHolder="Add discussion point..."
            />
          </FormCard>

          <FormSection title="Promotional Materials" />

          <FormCard>
            <DiscussionPoints
              value={promotionalMaterials}
              onChange={setPromotionalMaterials}
              maxCount={4}
              placeHolder="Add material / sample.."
              color={'#FFF2E1'}
            />
          </FormCard>

          <FormSection title="Customer Feedback & Queries" />

          <FormCard>
            <DiscussionPoints
              value={customerFeedbackQueries}
              onChange={setCustomerFeedbackQueries}
              maxCount={10}
              placeHolder="Add feedback and query..."
              color={'#E8F6EE'}
            />
          </FormCard>

          <FormSection title="Order Summary" />

          <FormCard>
            <View style={styles.orderRow}>
              <View style={styles.orderBox}>
                <AppText color='rgba(0,0,0,0.7)' family='InterBold' size={12}>
                  Total Qty
                </AppText>

                <TextInput
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={'rgba(0,0,0,0.4)'}
                  value={totalQty}
                  onChangeText={setTotalQty}
                  style={{
                    flex: 1,
                    color: '#000',
                    fontFamily: fonts.InterBold,
                    fontSize: 20,
                  }}
                />
                <AppText family='InterBold' color='rgba(0,0,0,0.7)' size={12}>
                  Input No
                </AppText>
              </View>

              <View style={styles.orderBox}>
                <AppText size={12}>
                  Amount
                </AppText>

                <TextInput
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={'rgba(0,0,0,0.4)'}
                  value={totalAmount}
                  onChangeText={setTotalAmount}
                  style={{
                    flex: 1,
                    color: '#000',
                    fontFamily: fonts.InterBold,
                    fontSize: 20,
                  }}
                />
                <AppText family='InterBold' color='rgba(0,0,0,0.7)' size={12}>
                  Input No
                </AppText>
              </View>
            </View>

            <FormRow label="Confirmed By" right='input'>
              <TextInput
                placeholder="Name"
                placeholderTextColor={'rgba(0,0,0,0.4)'}
                value={confirmedBy}
                onChangeText={setConfirmedBy}
                style={{
                  color: '#000',
                  fontFamily: fonts.InterBold,
                  fontSize: 13,
                  flex: 1,
                  textTransform: 'capitalize'
                }} />
            </FormRow>
          </FormCard>

          <FormSection title="Manager Remarks" />

          <FormCard>
            <TextInput
              multiline
              placeholder="Enter remarks"
              placeholderTextColor={'rgba(0,0,0,0.4)'}
              value={managerRemarks}
              onChangeText={setManagerRemarks}
              style={{
                minHeight: 100,
                padding: 16,
                color: '#000',
                fontFamily: fonts.InterBold,
                fontSize: 12,
                textAlignVertical: 'top'
              }}
            />
          </FormCard>
        </KeyboardAwareScrollView>
      )}

      {tab === 2 && (
        <KeyboardAwareScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 120,
          }}
          bottomOffset={50}
          keyboardDismissMode='on-drag'
          showsVerticalScrollIndicator={false}
        >
          <AttendeesTab attendees={attendees} setAttendees={setAttendees} />
        </KeyboardAwareScrollView>
      )}

      {/* Bottom Button */}

      <View style={[styles.bottomBar, { paddingBottom: useSafeAreaInsets()?.bottom + 10 }]}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            submitLoading && {
              opacity: 0.6,
            },
          ]}
          disabled={submitLoading}
          onPress={submitReport}
        >
          {submitLoading ? (
            <ActivityIndicator
              color="#fff"
              size="small"
            />
          ) : (
            <AppText
              family="InterBold"
              color="#fff"
            >
              {isEdit
                ? 'Update Activity'
                : 'Submit Report'}
            </AppText>
          )}
        </TouchableOpacity>
      </View>
      <Modal
        isVisible={approvedByModal}
        onBackdropPress={resetCustomerModal}
        onBackButtonPress={resetCustomerModal}
        style={{ justifyContent: 'flex-end', margin: 0 }}
        statusBarTranslucent
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '70%',
            paddingBottom: 40,
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 50,
              height: 5,
              backgroundColor: '#D9D9D9',
              borderRadius: 10,
              marginVertical: 10,
            }}
          />

          <AppText
            family="InterBold"
            size={16}
            style={{
              paddingHorizontal: 20,
              marginBottom: 15,
            }}
          >
            Select Manager
          </AppText>

          <ScrollView>
            {reportingUsers.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  setApprovedBy(item);
                  setApprovedByModal(false);
                }}
                style={{
                  paddingVertical: 15,
                  paddingHorizontal: 20,
                  borderBottomWidth: 1,
                  borderBottomColor: '#F0F0F0',
                }}
              >
                <AppText family="InterMedium">
                  {item.name}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {
        Platform.OS === 'android' &&
        showDatePicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )
      }
      <RNModal
        visible={Platform.OS === 'ios' && showDatePicker}
        transparent
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
            }}
          >
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="inline"
              onChange={(e, date) => {
                if (date) {
                  setTempDate(date);
                }
              }}
            />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 20,
              }}
            >
              <Pressable onPress={() => setShowDatePicker(false)}>
                <AppText>Cancel</AppText>
              </Pressable>

              <Pressable
                onPress={() => {
                  setActivityDate(formatDate(tempDate));
                  setShowDatePicker(false);
                }}
                style={{
                  backgroundColor: '#1A3A6B',
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
              >
                <AppText color="#fff">OK</AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </RNModal>

      <Modal
        isVisible={categoryModal}
        onBackdropPress={() => setCategoryModal(false)}
        style={{
          justifyContent: 'flex-end',
          margin: 0,
        }}
        statusBarTranslucent
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: '75%',
            paddingBottom: 30,
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 50,
              height: 5,
              backgroundColor: '#D9D9D9',
              borderRadius: 10,
              marginVertical: 10,
            }}
          />

          <AppText
            family="InterBold"
            size={16}
            style={{
              paddingHorizontal: 20,
              marginBottom: 15,
            }}
          >
            Select Categories
          </AppText>

          <TextInput
            placeholder="Search Category"
            value={categorySearch}
            onChangeText={setCategorySearch}
            style={{
              marginHorizontal: 20,
              marginBottom: 15,
              borderWidth: 1,
              borderColor: '#E5E5E5',
              borderRadius: 10,
              paddingHorizontal: 15,
              height: 45,
            }}
          />

          <ScrollView>
            {categories
              .filter((item: { subcategory_name: string; }) =>
                item.subcategory_name
                  ?.toLowerCase()
                  .includes(categorySearch.toLowerCase()),
              )
              .map((item: any) => {
                const selected = selectedCategories.some(
                  cat => cat.id === item.id,
                );

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => toggleCategory(item)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 15,
                      paddingHorizontal: 20,
                      borderBottomWidth: 1,
                      borderBottomColor: '#F0F0F0',
                    }}
                  >
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        borderWidth: 2,
                        marginRight: 12,
                        borderColor: selected
                          ? '#1A3A6B'
                          : '#CFCFCF',
                        backgroundColor: selected
                          ? '#1A3A6B'
                          : '#FFF',
                      }}
                    />

                    <AppText family="InterMedium">
                      {item.subcategory_name}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
          </ScrollView>

          <TouchableOpacity
            onPress={() => setCategoryModal(false)}
            style={{
              marginHorizontal: 20,
              marginTop: 15,
              backgroundColor: '#1A3A6B',
              borderRadius: 12,
              alignItems: 'center',
              paddingVertical: 14,
            }}
          >
            <AppText
              family="InterBold"
              color="#FFF"
            >
              Done
            </AppText>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal
        isVisible={activityTypeModal}
        onBackdropPress={() =>
          setActivityTypeModal(false)
        }
        style={{
          justifyContent: 'flex-end',
          margin: 0,
        }}
        statusBarTranslucent
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '60%',
            paddingBottom: 30,
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 50,
              height: 5,
              backgroundColor: '#D9D9D9',
              borderRadius: 10,
              marginVertical: 10,
            }}
          />

          <AppText
            family="InterBold"
            size={16}
            style={{
              paddingHorizontal: 20,
              marginBottom: 15,
            }}
          >
            Select Activity Type
          </AppText>

          <ScrollView>
            {activityTypes.map(item => {
              const selected =
                selectedActivityType === item;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => {
                    setSelectedActivityType(item);
                    setActivityTypeModal(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F0F0F0',
                  }}
                >
                  <AppText
                    family={
                      selected
                        ? 'InterSemiBold'
                        : 'InterMedium'
                    }
                    color="#000"
                  >
                    {item}
                  </AppText>

                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: '#1A3A6B',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {selected && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: '#1A3A6B',
                        }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
      <Modal
        isVisible={participantModal}
        onBackdropPress={() =>
          setParticipantModal(false)
        }
        style={{
          justifyContent: 'flex-end',
          margin: 0,
        }}
        statusBarTranslucent
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '60%',
            paddingBottom: 30,
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 50,
              height: 5,
              backgroundColor: '#D9D9D9',
              borderRadius: 10,
              marginVertical: 10,
            }}
          />

          <AppText
            family="InterBold"
            size={16}
            style={{
              paddingHorizontal: 20,
              marginBottom: 15,
            }}
          >
            Select Participant Type
          </AppText>

          <ScrollView>
            {participantTypes.map(item => {
              const selected =
                participantType === item;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => {
                    setParticipantType(item);
                    setParticipantModal(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F0F0F0',
                  }}
                >
                  <AppText
                    family={
                      selected
                        ? 'InterBold'
                        : 'InterMedium'
                    }
                  >
                    {item}
                  </AppText>

                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: '#1A3A6B',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {selected && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: '#1A3A6B',
                        }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
      <Modal
        isVisible={customerModal}
        onBackdropPress={() => {
          setCustomerModal(false);
          setCustomerSearch('')
        }}
        style={{
          justifyContent: 'flex-end',
          margin: 0,
        }}
        statusBarTranslucent
      >
        <View
          style={{
            backgroundColor: '#fff',
            height: '80%',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          <AppText
            family="InterBold"
            size={16}
            style={{
              paddingHorizontal: 20,
              marginVertical: 15,
            }}
          >
            Select Manager
          </AppText>
          <TextInput
            placeholder="Search Customer"
            value={customerSearch}
            onChangeText={setCustomerSearch}
            style={{
              marginHorizontal: 20,
              marginBottom: 15,
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 10,
              paddingHorizontal: 12,
              height: 45,
            }}
          />
          <FlatList
            data={customers}
            keyExtractor={item =>
              item.id.toString()
            }
            onEndReached={loadMoreCustomers}
            onEndReachedThreshold={0.3}
            renderItem={({ item }) => {
              const selected =
                selectedCustomer?.id === item.id;

              return (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCustomer(item);
                    setCustomerModal(false);
                  }}
                  style={{
                    padding: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <AppText family="InterBold">
                    {item.shop_name}
                  </AppText>

                  {/* <AppText size={12}>
                    {item.owner_name}
                  </AppText>

                  <AppText size={12}>
                    {item.mobile_number}
                  </AppText> */}

                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: '#1A3A6B',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {selected && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: '#1A3A6B',
                        }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
            ListFooterComponent={() =>
              customerLoading ? (
                <ActivityIndicator size="large" color={colors.blue} />
              ) : <View style={{ height: 30 }} />
            }
          />
        </View>
      </Modal>
      <Modal
        isVisible={distributorModal}
        onBackdropPress={resetDistributorModal}
        onBackButtonPress={resetDistributorModal}
        style={{
          justifyContent: 'flex-end',
          margin: 0,
        }}
        statusBarTranslucent
      >
        <View
          style={{
            backgroundColor: '#fff',
            height: '80%',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          <AppText
            family="InterBold"
            size={16}
            style={{
              paddingHorizontal: 20,
              marginVertical: 15,
            }}
          >
            Select Distributor
          </AppText>
          <TextInput
            placeholder="Search Distributor"
            value={distributorSearch}
            onChangeText={setDistributorSearch}
            style={{
              marginHorizontal: 20,
              marginBottom: 15,
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 10,
              paddingHorizontal: 12,
              height: 45,
            }}
          />
          <FlatList
            data={distributors}
            keyExtractor={item =>
              item.id.toString()
            }
            onEndReached={loadMoreDistributors}
            onEndReachedThreshold={0.3}
            renderItem={({ item }) => {
              const selected =
                selectedDistributor?.id === item.id;

              return (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedDistributor(item);
                    resetDistributorModal();
                  }}
                  style={{
                    padding: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <AppText family="InterBold">
                      {item.legal_name}
                    </AppText>

                    <AppText size={12}>
                      {item.distributor_code}
                    </AppText>

                    <AppText size={12}>
                      {item.mobile}
                    </AppText>
                  </View>

                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: '#1A3A6B',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {selected && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: '#1A3A6B',
                        }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
            ListFooterComponent={() =>
              distributorLoading ? (
                <ActivityIndicator
                  size="large"
                  color={colors.blue}
                />
              ) : (
                <View style={{ height: 30 }} />
              )
            }
          />
        </View>
      </Modal>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FA',
  },

  header: {
    backgroundColor: '#1A3A6B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A3A6B',
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },

  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#4FC3F7',
  },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },

  listInput: {
    flex: 1,
    marginLeft: 12,
  },

  orderRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },

  orderBox: {
    flex: 1,
    backgroundColor: '#E4EAF5',
    borderRadius: 12,
    padding: 12,
    gap: -10
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,

  },

  submitButton: {
    backgroundColor: '#1A3A6B',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
  },
  marketInput: {
    color: '#000',
    fontFamily: fonts.InterBold,
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantTypeView: {
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 10,
    paddingBottom: 10,
  },
  type: {
    height: 40,
    backgroundColor: '#e4eaf5',
    marginTop: 14,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  circleText: {
    fontFamily: fonts?.InterBold,
    fontSize: 10,
    color: '#1F447D',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingTop: 16,
  },
  rowText: {
    marginLeft: 16,
    fontSize: 13,
    fontFamily: fonts?.InterBold,
    color: '#20232D',
    flex: 1,

  },
  addButton: {
    backgroundColor: '#f3f3f4',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    height: 40,
    backgroundColor: '#e4eaf5',
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 12,
    flex: 1,
    color: "#000",
    fontFamily: fonts.InterBold,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  addButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 35,
    borderRadius: 10,
    backgroundColor: '#1A3A6B',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignSelf: 'center',
  },
});

export default PromotionalActivityFormScreen; 