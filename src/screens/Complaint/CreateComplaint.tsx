import { View, Text, Pressable, Image, TextInput, FlatList, ScrollView, Switch, Modal, ActivityIndicator, Platform, PermissionsAndroid, Alert } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { styles } from './styles'
import { AeroPlaneIcon, AttachmentIcon, BasicBoxIcon, ChatIcon, CircleCheckIcon, CloudUpIcon, FilterIcon, GalleryIcon, HeadSetIcon, InfoIcon, ListIcon, MIcIcon, ResetIcon } from '../../assets/svgs/ComplaintSvgs'
import AppText from '../../components/AppText/AppText'
import { colors } from '../../utils/Colors'
import { ClockIcon, PlusIcon, SearchSvgIcon, UploadIcon } from '../../assets/svgs/HomePageSvgs'
import { shadowStyle } from '../../utils/typography'
import ComplaintView from './ComplaintView'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { TwoMenIcon } from '../../assets/svgs/BottomTabSvgs'
import { UserIcon } from '../../assets/svgs/SvgsFile'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import store from '../../components/redux/Store'
import FastImage from 'react-native-fast-image';
import {
  launchImageLibrary,
  Asset,
} from 'react-native-image-picker';
import {
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';

const CreateComplaint = ({ navigation }: any) => {
  const [partNo, setPartNo] = useState('')
  const [batchNo, setBatchNo] = useState('')
  const [contactNo, setContactNo] = useState('');
  const [whatsappNo, setWhatsappNo] = useState('');
  const [sameAsContact, setSameAsContact] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [stateName, setStateName] = useState('');
  const [district, setDistrict] = useState('');
  const [cityArea, setCityArea] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');

  const [complaintType, setComplaintType] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [attachmentType, setAttachmentType] = useState<'photo' | 'voice' | null>('photo');
  const [distributorModal, setDistributorModal] = useState(false);

  const [selectedDistributor, setSelectedDistributor] = useState<any>(null);

  const [distributors, setDistributors] = useState<any[]>([]);

  const [distributorSearch, setDistributorSearch] = useState('');

  const [distributorPage, setDistributorPage] = useState(1);

  const [distributorLastPage, setDistributorLastPage] = useState(1);

  const [loadingDistributor, setLoadingDistributor] = useState(false);

  const [complaintTypeModal, setComplaintTypeModal] =
    useState(false);

  const [complaintTypes, setComplaintTypes] =
    useState<any[]>([]);

  const [selectedComplaintType, setSelectedComplaintType] =
    useState<any>(null);

  const [loadingComplaintType, setLoadingComplaintType] =
    useState(false);

  const [locationModal, setLocationModal] = useState(false);

  const [modalTitle, setModalTitle] = useState('');

  const [locationSearch, setLocationSearch] =
    useState('');

  const [modalType, setModalType] = useState<
    'state' | 'district' | 'city' | 'pincode' | ''
  >('');

  const [modalData, setModalData] = useState<any[]>(
    [],
  );

  const [loadingLocation, setLoadingLocation] =
    useState(false);

  const [selectedState, setSelectedState] =
    useState<any>(null);

  const [selectedDistrict, setSelectedDistrict] =
    useState<any>(null);

  const [selectedCity, setSelectedCity] =
    useState<any>(null);

  const [selectedPincode, setSelectedPincode] =
    useState<any>(null);

  const [complaintPhoto, setComplaintPhoto] =
    useState<Asset | null>(null);

  const [photoError, setPhotoError] =
    useState('');


  const [submitLoading, setSubmitLoading] =
    useState(false);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitLoading(true);

      const token =
        store.getState()?.auth?.token;

      const formData = new FormData();

      formData.append(
        'part_number',
        partNo,
      );

      formData.append(
        'batch_code',
        batchNo,
      );

      formData.append(
        'distributor_id',
        String(selectedDistributor?.id),
      );

      formData.append(
        'contact_number',
        contactNo,
      );

      formData.append(
        'whatsapp_number',
        whatsappNo,
      );

      formData.append(
        'full_name',
        fullName,
      );

      formData.append(
        'email_address',
        email || '',
      );

      formData.append(
        'state_id',
        String(selectedState?.state_id || ''),
      );

      formData.append(
        'district_id',
        String(
          selectedDistrict?.district_id || '',
        ),
      );

      formData.append(
        'city_id',
        String(selectedCity?.city_id || ''),
      );

      formData.append(
        'pincode_id',
        String(
          selectedPincode?.pincode_id || '',
        ),
      );

      formData.append(
        'address',
        address || '',
      );

      formData.append(
        'place',
        landmark || '',
      );

      formData.append(
        'complaint_type_id',
        String(
          selectedComplaintType?.id,
        ),
      );

      formData.append(
        'description',
        description,
      );

      // Photo Upload
      if (
        complaintPhoto?.uri &&
        complaintPhoto?.fileName
      ) {
        formData.append(
          'attachment_file',
          {
            uri: complaintPhoto.uri,
            name:
              complaintPhoto.fileName ||
              `complaint.jpg`,
            type:
              complaintPhoto.type ||
              'image/jpeg',
          } as any,
        );
      }

      const response = await fetch(
        'https://elofic.fieldkonnect.io/api/complaints',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type':
              'multipart/form-data',
          },
          body: formData,
        },
      );

      const json =
        await response.json();

      console.log(
        'Complaint Response =>',
        json,
      );

      if (
        response.ok &&
        (json.status === true ||
          json.status === 'success')
      ) {
        Alert.alert(
          'Success',
          json.message ||
          'Complaint submitted successfully',
        );

        handleReset();

        navigation.goBack();
      } else {
        Alert.alert(
          'Error',
          json.message ||
          'Something went wrong',
        );
      }
    } catch (error) {
      console.log(
        'Complaint Submit Error =>',
        error,
      );

      Alert.alert(
        'Error',
        'Unable to submit complaint',
      );
    } finally {
      setSubmitLoading(false);
    }
  };


  const getComplaintTypes = async () => {
    try {
      setLoadingComplaintType(true);
      const token = store.getState()?.auth?.token;
      const response = await fetch(
        'https://elofic.fieldkonnect.io/api/getComplaintType',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      const json = await response.json();

      setComplaintTypes(json?.data || []);
    } catch (error) {
      console.log(
        'Complaint Type Error =>',
        error,
      );
    } finally {
      setLoadingComplaintType(false);
    }
  };

  const getStates = async () => {
    try {
      setLoadingLocation(true);

      const token =
        store.getState()?.auth?.token;

      const response = await fetch(
        'https://elofic.fieldkonnect.io/api/getStateList',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      const json = await response.json();

      setModalData(json?.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingLocation(false);
    }
  };


  const getDistricts = async (
    stateId: number,
  ) => {
    try {
      setLoadingLocation(true);

      const token =
        store.getState()?.auth?.token;

      const response = await fetch(
        `https://elofic.fieldkonnect.io/api/getDistrictList?state_id=${stateId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      const json = await response.json();

      setModalData(json?.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const getCities = async (
    districtId: number,
  ) => {
    try {
      setLoadingLocation(true);

      const token =
        store.getState()?.auth?.token;

      const response = await fetch(
        `https://elofic.fieldkonnect.io/api/getCityList?district_id=${districtId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      const json = await response.json();

      setModalData(json?.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const getPincodes = async (
    cityId: number,
  ) => {
    try {
      setLoadingLocation(true);

      const token =
        store.getState()?.auth?.token;

      const response = await fetch(
        `https://elofic.fieldkonnect.io/api/getPincodeList?city_id=${cityId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      const json = await response.json();

      setModalData(json?.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const validateForm = () => {
    let newErrors: any = {};

    if (!partNo.trim()) {
      newErrors.partNo = 'Part Number is required';
    }

    if (!batchNo.trim()) {
      newErrors.batchNo = 'Batch Code is required';
    }

    if (!selectedDistributor) {
      newErrors.distributor = 'Distributor is required';
    }

    if (!contactNo.trim()) {
      newErrors.contactNo = 'Contact Number is required';
    } else if (contactNo.length !== 10) {
      newErrors.contactNo = 'Enter valid contact number';
    }

    if (!whatsappNo.trim()) {
      newErrors.whatsappNo = 'Whatsapp Number is required';
    } else if (whatsappNo.length !== 10) {
      newErrors.whatsappNo = 'Enter valid whatsapp number';
    }

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!selectedComplaintType) {
      newErrors.complaintType = 'Complaint Type is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  const requestGalleryPermission =
    async () => {
      try {
        if (Platform.OS === 'android') {
          if (Platform.Version >= 33) {
            const result =
              await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS
                  .READ_MEDIA_IMAGES,
              );

            return (
              result ===
              PermissionsAndroid.RESULTS.GRANTED
            );
          }

          const result =
            await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS
                .READ_EXTERNAL_STORAGE,
            );

          return (
            result ===
            PermissionsAndroid.RESULTS.GRANTED
          );
        }

        const iosPermission =
          await request(
            PERMISSIONS.IOS.PHOTO_LIBRARY,
          );

        return iosPermission === RESULTS.GRANTED;
      } catch (error) {
        console.log(error);
        return false;
      }
    };

  const confirmReset = () => {
    Alert.alert(
      'Reset Form',
      'Are you sure you want to clear all entered data?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: handleReset,
        },
      ],
    );
  };


  const handleReset = () => {
    // Basic Details
    setPartNo('');
    setBatchNo('');
    setSelectedDistributor(null);

    // Customer Details
    setContactNo('');
    setWhatsappNo('');
    setSameAsContact(false);
    setFullName('');
    setEmail('');

    // Location
    setSelectedState(null);
    setSelectedDistrict(null);
    setSelectedCity(null);
    setSelectedPincode(null);

    setStateName('');
    setDistrict('');
    setCityArea('');
    setPinCode('');
    setAddress('');
    setLandmark('');

    // Complaint Details
    setComplaintType('');
    setSelectedComplaintType(null);
    setDescription('');

    // Attachment
    setAttachmentType('photo');
    setComplaintPhoto(null);
    setPhotoError('');

    // Search States
    setDistributorSearch('');
    setLocationSearch('');

    // Errors
    setErrors({});

    // Modal Data (optional)
    setModalData([]);
  };


  const pickComplaintImage =
    async () => {
      const hasPermission =
        Platform.OS == "android" ? true : await requestGalleryPermission();

      if (!hasPermission) {
        return;
      }

      launchImageLibrary(
        {
          mediaType: 'photo',
          quality: 0.8,
          includeBase64: false,
          selectionLimit: 1,
        },
        response => {
          if (response.didCancel) {
            return;
          }

          if (response.errorCode) {
            console.log(
              response.errorMessage,
            );
            return;
          }

          if (
            response.assets &&
            response.assets.length > 0
          ) {
            setComplaintPhoto(
              response.assets[0],
            );

            setPhotoError('');
          }
        },
      );
    };


  const handleToggleSameAsContact = (value: boolean) => {
    setSameAsContact(value);

    if (value) {
      setWhatsappNo(contactNo);
    }
  };

  useEffect(() => {
    getComplaintTypes();
  }, []);





  const getDistributors = async (
    page = 1,
    search = '',
    isLoadMore = false,
  ) => {
    try {
      setLoadingDistributor(true);

      const token = store.getState()?.auth?.token;

      const response = await fetch(
        `https://elofic.fieldkonnect.io/api/order/distributors?page=${page}&global_search=${search}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      const json = await response.json();

      if (isLoadMore) {
        setDistributors(prev => [
          ...prev,
          ...json.data,
        ]);
      } else {
        setDistributors(json.data);
      }

      setDistributorPage(
        json.pagination.current_page,
      );

      setDistributorLastPage(
        json.pagination.last_page,
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingDistributor(false);
    }
  };

  useEffect(() => {
    if (distributorModal) {
      getDistributors(1, '');
    }
  }, [distributorModal]);


  useEffect(() => {
    const timer = setTimeout(() => {
      if (distributorModal) {
        getDistributors(
          1,
          distributorSearch,
        );
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [distributorSearch]);


  const loadMoreDistributor = () => {
    if (
      loadingDistributor ||
      distributorPage >= distributorLastPage
    ) {
      return;
    }

    getDistributors(
      distributorPage + 1,
      distributorSearch,
      true,
    );
  };


  const filteredLocationData =
    modalData.filter(item => {
      let value = '';

      switch (modalType) {
        case 'state':
          value = item.state_name;
          break;

        case 'district':
          value = item.district_name;
          break;

        case 'city':
          value = item.city_name;
          break;

        case 'pincode':
          value = item.pincode;
          break;
      }

      return value
        ?.toLowerCase()
        ?.includes(
          locationSearch.toLowerCase(),
        );
    });

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
        <View style={{ flex: 1, gap: 5 }}>
          <AppText style={{ flex: 1 }} size={16} color='white' family='InterBold'>New Complaint</AppText>
          <AppText style={{ flex: 1, opacity: 0.7 }} size={12} color='white' family='InterBold'>SEC/26-27/001</AppText>
        </View>
        <View style={styles.headsetView}>
          <HeadSetIcon />
        </View>
      </View>

      <KeyboardAwareScrollView
        bottomOffset={50}
        keyboardDismissMode='on-drag'
        showsVerticalScrollIndicator={false}
        style={[styles.container, { paddingHorizontal: 16, marginTop: 16 }]} >
        <View style={styles.basicDetailsview}>
          <View style={[styles.heading, styles.row]}>
            <View style={styles.box}>
              <BasicBoxIcon />
            </View>
            <AppText size={16} color='white' family='InterBold'>1 · Basic Details</AppText>
          </View>
          <View style={styles.innerView}>
            <View style={[styles.twoInput, styles.row]}>
              <View style={styles.firstInput}>
                <AppText transform='uppercase' size={11} color='rgba(0,0,0,0.8)' spacing={0.3} family='InterMedium'>PART NUMBER<AppText size={12} color='red' family='InterMedium'> *</AppText></AppText>
                <TextInput
                  value={partNo}
                  onChangeText={setPartNo}
                  style={styles.partNo}
                  placeholder='Enter Part No.'
                  placeholderTextColor={'rgba(0,0,0,0.2)'}
                />
                {
                  errors.partNo && (
                    <AppText
                      size={11}
                      color="red"
                      family="InterMedium">
                      {errors.partNo}
                    </AppText>
                  )
                }
              </View>
              <View style={styles.firstInput}>
                <AppText transform='uppercase' size={11} color='rgba(0,0,0,0.8)' spacing={0.3} family='InterMedium'>BATCH CODE<AppText size={12} color='red' family='InterMedium'> *</AppText></AppText>
                <TextInput
                  value={batchNo}
                  onChangeText={setBatchNo}
                  style={styles.partNo}
                  placeholder='Enter Batch Code.'
                  placeholderTextColor={'rgba(0,0,0,0.2)'}
                />
                {
                  errors.batchNo && (
                    <AppText
                      size={11}
                      color="red"
                      family="InterMedium">
                      {errors.batchNo}
                    </AppText>
                  )
                }
              </View>
            </View>
            <View style={styles.firstInput}>
              <AppText transform='uppercase' size={11} color='rgba(0,0,0,0.8)' spacing={0.3} family='InterMedium'>Distributor<AppText size={12} color='red' family='InterMedium'> *</AppText></AppText>
              <Pressable
                onPress={() => setDistributorModal(true)}
                style={[styles.partNo, { justifyContent: 'center' }]}
              >
                <AppText
                  size={12}
                  color={
                    selectedDistributor
                      ? colors.black
                      : 'rgba(0,0,0,0.3)'
                  }
                >
                  {
                    selectedDistributor?.legal_name ||
                    'Select Distributor'
                  }
                </AppText>
              </Pressable>
              {
                errors.distributor && (
                  <AppText
                    size={11}
                    color="red"
                    family="InterMedium">
                    {errors.distributor}
                  </AppText>
                )
              }
              {/* <TextInput
                value={batchNo}
                onChangeText={setBatchNo}
                style={styles.partNo}
                placeholder='Enter Distributor.'
                placeholderTextColor={'rgba(0,0,0,0.1)'}
              /> */}
            </View>
          </View>
        </View>
        <View style={[styles.basicDetailsview, { marginTop: 20 }]}>
          <View style={[styles.heading, styles.row]}>
            <View style={styles.box}>
              <UserIcon size={16} />
            </View>
            <AppText size={16} color='white' family='InterBold'>2 · Customer Details</AppText>
          </View>
          <View style={styles.innerView}>
            <View style={[styles.twoInput, styles.row]}>
              <View style={styles.firstInput}>
                <AppText transform='uppercase' size={11} color='rgba(0,0,0,0.8)' spacing={0.3} family='InterMedium'>Contact Number<AppText size={12} color='red' family='InterMedium'> *</AppText></AppText>
                <TextInput
                  value={contactNo}
                  onChangeText={(text) => {
                    setContactNo(text);

                    if (sameAsContact) {
                      setWhatsappNo(text);
                    }
                  }}
                  style={styles.partNo}
                  placeholder="Enter Contact Number"
                  placeholderTextColor={'rgba(0,0,0,0.2)'}
                  keyboardType="phone-pad"
                />
                {
                  errors.contactNo && (
                    <AppText
                      size={11}
                      color="red"
                      family="InterMedium">
                      {errors.contactNo}
                    </AppText>
                  )
                }
                {/* <View style={[styles.row, styles.infoview]}>
                  <InfoIcon />
                  <AppText size={10} family='InterSemiBold' color='rgba(0,0,0,0.8)'>Auto-fills from existing records</AppText>
                </View> */}
              </View>
            </View>
            <View style={styles.firstInput}>
              <AppText transform='uppercase' size={11} color='rgba(0,0,0,0.8)' spacing={0.3} family='InterMedium'>WhatsApp Number<AppText size={12} color='red' family='InterMedium'> *</AppText></AppText>
              <TextInput
                value={whatsappNo}
                onChangeText={setWhatsappNo}
                editable={!sameAsContact}
                style={styles.partNo}
                placeholder="Enter WhatsApp Number"
                placeholderTextColor={'rgba(0,0,0,0.2)'}
                keyboardType="phone-pad"
              />
              {
                errors.whatsappNo && (
                  <AppText
                    size={11}
                    color="red"
                    family="InterMedium">
                    {errors.whatsappNo}
                  </AppText>
                )
              }
              <View style={[styles.row, styles.infoview]}>
                <Switch
                  value={sameAsContact}
                  onValueChange={handleToggleSameAsContact}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={sameAsContact ? '#36fd36' : '#f4f3f4'}
                />

                <AppText
                  transform="uppercase"
                  size={10}
                  family="InterSemiBold"
                  color="rgba(0,0,0,0.8)">
                  SAME AS CONTACT NUMBER
                </AppText>
              </View>
            </View>
            <View style={styles.firstInput}>
              <AppText transform='uppercase' size={11} color='rgba(0,0,0,0.8)' spacing={0.3} family='InterMedium'>
                FULL NAME
                <AppText size={12} color='red'> *</AppText>
              </AppText>

              <TextInput
                value={fullName}
                onChangeText={setFullName}
                style={styles.partNo}
                placeholder='Enter Full Name'
                placeholderTextColor={'rgba(0,0,0,0.2)'}
              />
              {
                errors.fullName && (
                  <AppText
                    size={11}
                    color="red"
                    family="InterMedium">
                    {errors.fullName}
                  </AppText>
                )
              }
            </View>

            <View style={styles.firstInput}>
              <AppText transform='uppercase' size={11} color='rgba(0,0,0,0.8)' spacing={0.3} family='InterMedium'>
                EMAIL ADDRESS
              </AppText>

              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.partNo}
                placeholder='Enter Email Address'
                placeholderTextColor={'rgba(0,0,0,0.2)'}
                keyboardType='email-address'
              />
            </View>

            <View style={[styles.twoInput, styles.row]}>
              <View style={styles.firstInput}>
                <AppText transform='uppercase' size={11} color='rgba(0,0,0,0.8)' spacing={0.3} family='InterMedium'>
                  STATE
                </AppText>

                <Pressable
                  onPress={() => {
                    setModalType('state');
                    setModalTitle('Select State');
                    setLocationSearch('');
                    getStates();
                    setLocationModal(true);
                  }}
                  style={[
                    styles.partNo,
                    { justifyContent: 'center' },
                  ]}>
                  <AppText
                    size={11}
                    color={selectedState?.state_name ? 'black' : 'rgba(0,0,0,0.3)'}
                    family={selectedState?.state_name ? 'InterBold' : 'InterMedium'}>
                    {selectedState?.state_name ||
                      'Select State'}
                  </AppText>
                </Pressable>
              </View>

              <View style={styles.firstInput}>
                <AppText transform='uppercase' size={11} color='rgba(0,0,0,0.8)' spacing={0.3} family='InterMedium'>
                  DISTRICT
                </AppText>

                <Pressable style={[styles.partNo, { justifyContent: 'center' }]}
                  onPress={() => {
                    if (!selectedState) return;

                    setModalType('district');
                    setModalTitle('Select District');
                    setLocationSearch('');
                    getDistricts(
                      selectedState.state_id,
                    );

                    setLocationModal(true);
                  }}>
                  <AppText
                    size={11}
                    color={selectedDistrict?.district_name ? 'black' : 'rgba(0,0,0,0.3)'}
                    family={selectedDistrict?.district_name ? 'InterBold' : 'InterMedium'}>
                    {selectedDistrict?.district_name || "Select District"}
                  </AppText>
                </Pressable>
              </View>
            </View>

            <View style={[styles.twoInput, styles.row]}>
              <View style={styles.firstInput}>
                <AppText transform='uppercase' size={11} color='rgba(0,0,0,0.8)' spacing={0.3} family='InterMedium'>
                  CITY / AREA
                </AppText>

                <Pressable style={[styles.partNo, { justifyContent: 'center' }]}
                  onPress={() => {
                    if (!selectedDistrict) return;
                    setLocationSearch('');
                    setModalType('city');
                    setModalTitle('Select City');

                    getCities(
                      selectedDistrict.district_id,
                    );

                    setLocationModal(true);
                  }}>
                  <AppText
                    size={11}
                    color={selectedCity?.city_name ? 'black' : 'rgba(0,0,0,0.3)'}
                    family={selectedCity?.city_name ? 'InterBold' : 'InterMedium'}>
                    {selectedCity?.city_name || "Select City / Area"}
                  </AppText>
                </Pressable>
              </View>

              <View style={styles.firstInput}>
                <AppText transform='uppercase' size={11} color='rgba(0,0,0,0.8)' spacing={0.3} family='InterMedium'>
                  PIN CODE
                </AppText>

                <Pressable style={[styles.partNo, { justifyContent: 'center' }]} onPress={() => {
                  if (!selectedCity) return;
                  setLocationSearch('');
                  setModalType('pincode');
                  setModalTitle('Select Pincode');

                  getPincodes(
                    selectedCity.city_id,
                  );

                  setLocationModal(true);
                }}>
                  <AppText
                    size={11}
                    color={selectedPincode?.pincode ? 'black' : 'rgba(0,0,0,0.3)'}
                    family={selectedPincode?.pincode ? 'InterBold' : 'InterMedium'}>
                    {selectedPincode?.pincode || "Select Pin Code"}
                  </AppText>
                </Pressable>
              </View>
            </View>

            <View style={styles.firstInput}>
              <AppText transform='uppercase' size={11} color='rgba(0,0,0,0.8)' spacing={0.3} family='InterMedium'>
                ADDRESS
              </AppText>

              <TextInput
                value={address}
                onChangeText={setAddress}
                style={[styles.partNo, {}]}
                placeholder='Enter Address'
                placeholderTextColor={'rgba(0,0,0,0.2)'}
              />
            </View>

            <View style={styles.firstInput}>
              <AppText transform='uppercase' size={11} color='rgba(0,0,0,0.8)' spacing={0.3} family='InterMedium'>
                LANDMARK / PLACE
              </AppText>

              <TextInput
                value={landmark}
                onChangeText={setLandmark}
                style={styles.partNo}
                placeholder='Enter Landmark'
                placeholderTextColor={'rgba(0,0,0,0.2)'}
              />
            </View>

          </View>

        </View>
        <View style={[styles.basicDetailsview, { marginTop: 20 }]}>
          <View style={[styles.heading, styles.row]}>
            <View style={styles.box}>
              <ChatIcon />
            </View>

            <AppText
              size={16}
              color='white'
              family='InterBold'>
              3 · Complaint Details
            </AppText>
          </View>

          <View style={styles.innerView}>
            <View style={styles.firstInput}>
              <AppText
                transform='uppercase'
                size={11}
                color='rgba(0,0,0,0.8)'
                spacing={0.3}
                family='InterMedium'>
                Complaint Type
                <AppText size={12} color='red'> *</AppText>
              </AppText>

              <Pressable
                onPress={() => {
                  setDistributorSearch('')
                  setComplaintTypeModal(true)
                }}
                style={[
                  styles.partNo,
                  { justifyContent: 'center' },
                ]}>
                <AppText
                  size={11}
                  color={
                    selectedComplaintType
                      ? colors.black
                      : 'rgba(0,0,0,0.3)'
                  }
                  family="InterMedium">
                  {
                    selectedComplaintType?.name ||
                    'Select Complaint Type'
                  }
                </AppText>
              </Pressable>
              {
                errors.complaintType && (
                  <AppText
                    size={11}
                    color="red"
                    family="InterMedium">
                    {errors.complaintType}
                  </AppText>
                )
              }
            </View>

            <View style={styles.firstInput}>
              <AppText
                transform='uppercase'
                size={11}
                color='rgba(0,0,0,0.8)'
                spacing={0.3}
                family='InterMedium'>
                Description
                <AppText size={12} color='red'> *</AppText>
              </AppText>

              <TextInput
                value={description}
                onChangeText={setDescription}
                style={styles.partNoMultiline}
                multiline
                textAlignVertical="top"
                placeholder='Enter Complaint Description'
                placeholderTextColor={'rgba(0,0,0,0.2)'}
              />
              {
                errors.description && (
                  <AppText
                    size={11}
                    color="red"
                    family="InterMedium">
                    {errors.description}
                  </AppText>
                )
              }
            </View>
          </View>
        </View>
        <View style={[styles.basicDetailsview, { marginTop: 20, marginBottom: 30 }]}>
          <View style={[styles.heading, styles.row]}>
            <View style={styles.box}>
              <AttachmentIcon />
            </View>

            <AppText
              size={16}
              color='white'
              family='InterBold'>
              3 · Complaint Details
            </AppText>
          </View>

          <View style={styles.innerView}>
            <View style={[styles.row, styles.photoVoiceTab]}>
              <Pressable
                onPress={() => setAttachmentType('photo')}
                style={[
                  styles.photView,
                  styles.row,
                  attachmentType === 'photo' && styles.activePhotoVoiceTab,
                ]}>
                <GalleryIcon
                  size={16}
                  color={attachmentType === 'photo' ? '#fff' : 'rgba(0,0,0,0.6)'}
                />

                <AppText
                  size={14}
                  color={attachmentType === 'photo' ? 'white' : 'rgba(0,0,0,0.6)'}
                  family='InterBold'>
                  Photo / File
                </AppText>
              </Pressable>

              <Pressable
                onPress={() => setAttachmentType('voice')}
                style={[
                  styles.photView,
                  styles.row,
                  attachmentType === 'voice' && styles.activePhotoVoiceTab,
                ]}>
                <MIcIcon
                  size={18}
                  color={attachmentType === 'voice' ? '#fff' : 'rgba(0,0,0,0.6)'}
                />

                <AppText
                  size={14}
                  color={attachmentType === 'voice' ? 'white' : 'rgba(0,0,0,0.6)'}
                  family='InterBold'>
                  Voice Note
                </AppText>
              </Pressable>
            </View>
          </View>
          {attachmentType === 'photo' && (
            <Pressable
              onPress={pickComplaintImage}
              style={{
                alignItems: 'center',
                marginHorizontal: 16,
                marginBottom: 16,
                borderRadius: 16,
                borderStyle: 'dashed',
                borderColor: complaintPhoto
                  ? '#22C55E'
                  : '#CBD5E1',
                backgroundColor: '#F8FAFC',
                borderWidth: 2,
                paddingVertical: 20,
                overflow: 'hidden',
              }}>
              {!complaintPhoto ? (
                <>
                  <CloudUpIcon />

                  <AppText
                    style={{ marginTop: 10 }}
                    size={13}
                    color="black"
                    family="InterBold"
                    align="center">
                    Tap to upload
                  </AppText>

                  <AppText
                    style={{ marginTop: 4 }}
                    size={13}
                    color="#64748B"
                    family="InterMedium"
                    align="center">
                    JPG, PNG · Max 10MB
                  </AppText>
                </>
              ) : (
                <>
                  <FastImage
                    source={{
                      uri: complaintPhoto.uri,
                    }}
                    style={{
                      width: '100%',
                      height: 220,
                    }}
                    resizeMode="cover"
                  />

                  <View
                    style={{
                      padding: 12,
                      width: '100%',
                    }}>
                    <AppText
                      size={12}
                      family="InterMedium">
                      {
                        complaintPhoto.fileName
                      }
                    </AppText>

                    <View
                      style={{
                        flexDirection: 'row',
                        marginTop: 10,
                      }}>
                      <Pressable
                        onPress={pickComplaintImage}
                        style={{
                          flex: 1,
                          height: 42,
                          borderRadius: 8,
                          backgroundColor: colors.blue,
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 8,
                        }}>
                        <AppText
                          color="white"
                          family="InterBold">
                          Re-upload
                        </AppText>
                      </Pressable>
                      <Pressable
                        onPress={() =>
                          setComplaintPhoto(null)
                        }
                        style={{
                          flex: 1,
                          height: 42,
                          borderRadius: 8,
                          backgroundColor: '#EF4444',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <AppText
                          color="white"
                          family="InterBold">
                          Remove
                        </AppText>
                      </Pressable>
                    </View>
                  </View>
                </>
              )}

            </Pressable>
          )}

          {attachmentType === 'voice' && (
            <>
              <View style={[styles.voiceView, styles.center]}>
                <View style={[styles.micView, styles.center]}>
                  <MIcIcon size={35} color={'white'} />
                </View>
                <AppText style={{ marginTop: 10 }} size={13} color="#64748B" family="InterBold" align="center">
                  Tap to start recording
                </AppText>
                <AppText style={{ marginTop: 4 }} size={20} color="black" family="InterBold" align="center">
                  00:00
                </AppText>
              </View>
            </>
          )}
        </View>
        <View style={[styles.row, styles.buttonView]}>
          <Pressable
            onPress={confirmReset}
            style={[
              styles.resetBtn,
              styles.center,
              styles.row,
              { opacity: 0.8 }
            ]}>
            <ResetIcon size={16} />
            <AppText
              size={16}
              color="rgba(0,0,0,1)"
              family="InterBold">
              Reset
            </AppText>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            style={[
              styles.resetBtn,
              styles.center,
              styles.row,
              {
                flex: 0.7,
                backgroundColor: colors.blue
              }
            ]}>
            <AeroPlaneIcon size={18} />
            {
              submitLoading ? (
                <ActivityIndicator
                  color="white"
                />
              ) : (
                <AppText
                  size={16}
                  color="rgba(255,255,255,1)"
                  family="InterBold"> 
                  Submit Complaint
                </AppText>
              )
            }
          </Pressable>
        </View>
        <View style={{ height: 90 }} />
      </KeyboardAwareScrollView >
      <Modal
        visible={distributorModal}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setDistributorSearch('');
        }}
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              height: '80%',
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
              }}
            >
              <AppText
                size={16}
                family="InterBold"
              >
                Select Distributor
              </AppText>

              <TextInput
                value={distributorSearch}
                onChangeText={
                  setDistributorSearch
                }
                placeholder="Search Distributor"
                style={[
                  styles.partNo,
                  {
                    marginTop: 10,
                  },
                ]}
              />
            </View>

            <FlatList
              data={distributors}
              keyExtractor={(item: any) =>
                item.id.toString()
              }
              renderItem={({ item }: any) => (
                <Pressable
                  onPress={() => {
                    setSelectedDistributor(item);
                    setDistributorSearch('');
                    setDistributorModal(false);
                  }}
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor:
                      '#f1f1f1',
                  }}
                >
                  <AppText
                    family="InterBold"
                    color="black"
                  >
                    {item.legal_name}
                  </AppText>
                </Pressable>
              )}
              onEndReached={
                loadMoreDistributor
              }
              onEndReachedThreshold={
                0.3
              }
              ListFooterComponent={
                loadingDistributor ? (
                  <ActivityIndicator size="large" color={colors.blue} />
                ) : null
              }
            />

            <Pressable
              onPress={() =>
                setDistributorModal(
                  false,
                )
              }
              style={{
                padding: 16 + useSafeAreaInsets()?.bottom,
                alignItems: 'center',
              }}
            >
              <AppText
                color="red"
                family="InterBold"
              >
                Close
              </AppText>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        visible={complaintTypeModal}
        animationType="slide"
        transparent
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            backgroundColor:
              'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: '60%',
            }}
          >
            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
              }}
            >
              <AppText
                size={16}
                family="InterBold"
              >
                Select Complaint Type
              </AppText>
            </View>

            {
              loadingComplaintType ? (
                <ActivityIndicator
                  size="large"
                  color={colors.blue}
                  style={{ marginTop: 30 }}
                />
              ) : (
                <FlatList
                  data={complaintTypes}
                  keyExtractor={item =>
                    item.id.toString()
                  }
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => {
                        setSelectedComplaintType(
                          item,
                        );

                        setComplaintTypeModal(
                          false,
                        );
                      }}
                      style={{
                        padding: 16,
                        borderBottomWidth: 1,
                        borderBottomColor:
                          '#f1f1f1',
                      }}
                    >
                      <AppText
                        family="InterBold"
                        color="black"
                      >
                        {item.name}
                      </AppText>
                    </Pressable>
                  )}
                />
              )
            }

            <Pressable
              onPress={() =>
                setComplaintTypeModal(
                  false,
                )
              }
              style={{
                padding: 16 + useSafeAreaInsets()?.bottom,
                alignItems: 'center',
              }}
            >
              <AppText
                color="red"
                family="InterBold"
              >
                Close
              </AppText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={locationModal}
        transparent
        animationType="slide"
        statusBarTranslucent>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor:
              'rgba(0,0,0,0.5)',
          }}>
          <View
            style={{
              height: '80%',
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}>

            <View style={{ padding: 16 }}>
              <AppText
                size={16}
                family="InterBold">
                {modalTitle}
              </AppText>

              <TextInput
                value={locationSearch}
                onChangeText={
                  setLocationSearch
                }
                placeholder="Search..."
                style={[
                  styles.partNo,
                  { marginTop: 10 },
                ]}
              />
            </View>

            <FlatList
              data={filteredLocationData}
              keyExtractor={(_, index) =>
                index.toString()
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    if (
                      modalType === 'state'
                    ) {
                      setSelectedState(item);

                      setSelectedDistrict(
                        null,
                      );

                      setSelectedCity(null);

                      setSelectedPincode(
                        null,
                      );
                    }

                    if (
                      modalType ===
                      'district'
                    ) {
                      setSelectedDistrict(
                        item,
                      );

                      setSelectedCity(null);

                      setSelectedPincode(
                        null,
                      );
                    }

                    if (
                      modalType === 'city'
                    ) {
                      setSelectedCity(item);

                      setSelectedPincode(
                        null,
                      );
                    }

                    if (
                      modalType ===
                      'pincode'
                    ) {
                      setSelectedPincode(
                        item,
                      );
                    }

                    setLocationModal(
                      false,
                    );
                  }}
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor:
                      '#f1f1f1',
                  }}>
                  <AppText>
                    {
                      item.state_name ||
                      item.district_name ||
                      item.city_name ||
                      item.pincode
                    }
                  </AppText>
                </Pressable>
              )}
            />

            <Pressable
              onPress={() =>
                setLocationModal(false)
              }
              style={{
                padding: 20 + useSafeAreaInsets()?.bottom,
                alignItems: 'center',
              }}>
              <AppText color="red">
                Close
              </AppText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View >
  )
}

export default CreateComplaint