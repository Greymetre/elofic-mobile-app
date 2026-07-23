import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  Pressable,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { rw } from '../../utils/responsive';
import { colors } from '../../utils/Colors';
import AppText from '../../components/AppText/AppText';
import { MinusIcon, PlusIcon, UploadIcon } from '../../assets/svgs/HomePageSvgs';
import { styles } from './styles'; // ← same file as AddCustomer
import { ArrowDownIcon } from '../../assets/svgs/SvgsFile';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import {
  useGetBeatListApi,
  useGetCityListApi,
  useGetDistributorDropdownListApi,
  useGetDistributorListApi,
  useGetDistrictListApi,
  useGetPincodeListAPi,
  useGetPincodeLocationListAPi,
  useGetStateListApi,
} from '../../api/query/CustomerApi'; // assume you have these
import { Asset, launchCamera, ImagePickerResponse, launchImageLibrary } from 'react-native-image-picker';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';
import store from '../../components/redux/Store';
import { BASE_URL } from '../../api/AxiosClient';
import { API_ENDPOINT } from '../../api/ApiUrls'; // adjust if needed
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import Geolocation from '@react-native-community/geolocation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { useFocusEffect } from '@react-navigation/native';
import { requestLocationPermission as requestAndroidLocationPermission } from '../../utils/Location/permissions';




const AccordionSection = ({ title, children, defaultExpanded = false }: any) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const heightValue = useSharedValue(defaultExpanded ? 1000 : 0);

  const toggle = () => {
    const toValue = expanded ? 0 : 1000;
    heightValue.value = withTiming(toValue, {
      duration: !expanded ? 300 : 0,
      easing: Easing.inOut(Easing.ease),
    });
    setExpanded(!expanded);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    maxHeight: heightValue.value,
    overflow: 'hidden',
  }));

  return (
    <View style={styles.sectionWrapper}>
      {!expanded && (
        <TouchableOpacity style={[styles.sectionHeader, { marginBottom: rw(20) }]} onPress={toggle}>
          <AppText size={16} color={colors.black} family="InterSemiBold">
            {title}
          </AppText>
          <PlusIcon />
        </TouchableOpacity>
      )}
      <Animated.View style={animatedStyle}>
        <View style={[styles.sectionContent, { paddingBottom: 20, marginBottom: rw(10) }]}>
          <TouchableOpacity style={[styles.sectionHeader, { marginBottom: 12, marginTop: 4 }]} onPress={toggle}>
            <AppText size={16} color={colors.black} family="InterSemiBold">
              {title}
            </AppText>
            <MinusIcon />
          </TouchableOpacity>
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const CustomTextInput = ({ placeholder, value, onChangeText, keyboardType = 'default', maxLength, editable }: any) => (
  <View style={[styles.selectUser, styles.row, editable && { opacity: 0.6 }]}>
    <TextInput
      style={styles.textInput}
      placeholder={placeholder}
      placeholderTextColor={'#718096'}
      value={value}
      maxLength={maxLength}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize="sentences"
      editable={editable ? !editable : true}
    />
  </View>
);





const AddSecondaryCustomer = ({ navigation, route }: any) => {
  const type = route?.params?.type
  const isEdit = !!route?.params?.customer;
  const existingCustomer = route?.params?.customer;
  const [formData, setFormData] = useState<any>({
    type: type || 'MECHANIC', // fixed
    sub_type: '',
    owner_name: '',
    shop_name: '',
    mobile_number: '',
    whatsapp_number: '',
    address_line: '',
    country_id: '1', // assuming India = 1
    state_id: '',
    district_id: '',
    city_id: '',
    pincode_id: '',
    sales_exception_assignment: '',
    vehicle_segment: [] as string[],
    belt_area_market_name: '',
    saathi_awareness_status: '',
    opportunity_status: '',
    beat_id: '',
    gps_location: '',
    owner_photo: null,
    shop_photo: null,
  });

  // Dropdown lists
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [loading, setLoading] = useState(false)
  const [pinCode, setPincode] = useState('');
  const [stateName, setStateName] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [cityName, setCityName] = useState('');
  const { mutateAsync: getStates } = useGetStateListApi();
  const { mutateAsync: getDistricts } = useGetDistrictListApi();
  const { mutateAsync: getCities } = useGetCityListApi();
  const { mutateAsync: getPincodesList } = useGetPincodeListAPi();
  const { mutateAsync: getPincodes } = useGetPincodeLocationListAPi();
  const { mutateAsync: getBeats } = useGetBeatListApi();
  const { mutateAsync: getDistributors } = useGetDistributorDropdownListApi();
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const [currentUploadField, setCurrentUploadField] = useState<string | null>(null);
  const [currentUploadLabel, setCurrentUploadLabel] = useState<string>('Upload Image');
  const [beats, setBeats] = useState<{ label: string; value: string | number }[]>([]);
  const [distributors, setDistributors] = useState<{ label: string; value: string }[]>([]);
  const [distributorsLoading, setDistributorsLoading] = useState(false);
  const [cityOptions, setCityOptions] = useState<any[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const openUploadSheet = (field: string, label: string) => {
    setCurrentUploadField(field);
    setCurrentUploadLabel(label);
    actionSheetRef.current?.show();
  };

  // Fetch beats once
  useEffect(() => {
    const loadBeats = async () => {
      try {
        const res: any = await getBeats();
        if (res?.status === 'success' || res?.data?.status === 'success') {
          // Adjust according to your actual response structure
          // Most common patterns:
          const beatList = res.data?.data || res.data || [];

          setBeats(
            beatList.map((b: any) => ({
              label: b.beat_name || b.name || b.beat || 'Unknown Beat',
              value: b.beat_id || b.id || b.value || '',
            }))
          );
        } else {
          Toast.show({ type: 'error', text1: 'Failed to load beat list' });
        }
      } catch (err) {
        console.error('Beat list error:', err);
        Toast.show({ type: 'error', text1: 'Could not load beats' });
      }
    };

    loadBeats();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const camera = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs camera access to take photos",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );

        const storage = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);

        if (
          camera === PermissionsAndroid.RESULTS.GRANTED &&
          (storage['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED ||
            Platform.Version >= 33)
        ) {
          return true;
        } else {
          Toast.show({ type: 'error', text1: 'Permissions denied' });
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    } if (Platform.OS === 'ios') {
      try {
        if (Platform.OS === 'ios') {
          const camera = await request(PERMISSIONS.IOS.CAMERA);

          return (
            camera === RESULTS.GRANTED
          );
        }

        return false;
      } catch (error) {
        console.log(error);
        return false;
      }

    }
    return true;
  };

  useEffect(() => {
    const loadDistributors = async () => {
      // Only fetch if relevant type (early exit otherwise)
      const currentType = route?.params?.type?.toUpperCase();
      if (!['RETAILER', 'WORKSHOP'].includes(currentType)) {
        return;
      }

      setDistributorsLoading(true);
      try {
        const res: any = await getDistributors();
        if (res?.data?.status === true && res?.data?.data) {
          const list = res?.data?.data.map((d: any) => ({
            label: d.legal_name || d.trade_name || `Distributor ${d.id}`,
            value: d.id, // ← decide what to send
            // If backend wants ID instead: value: String(d.id),
          }));

          setDistributors(list);
        } else {
          Toast.show({ type: 'error', text1: 'Failed to load distributors' });
        }
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Could not fetch distributor list',
          text2: err instanceof Error ? err.message : undefined,
        });
        console.log(err, 'asdfasdfasdf')
      } finally {
        setDistributorsLoading(false);
      }
    };

    loadDistributors();
  }, []); // once on mount

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      const res = await getStates();
      if (res?.data?.status === 'success') {
        setStates(
          res.data.data.map((s: any) => ({
            label: s.state_name,
            value: s.state_id,
          }))
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  const loadDistricts = async (stateId: any) => {
    try {
      const res = await getDistricts(stateId);
      if (res?.data?.status === 'success') {
        setDistricts(
          res.data.data.map((d: any) => ({
            label: d.district_name,
            value: d.district_id,
          }))
        );
      }
    } catch (e) { }
  };

  const loadCities = async (districtId: any) => {
    try {
      const res = await getCities(districtId);
      if (res?.data?.status === 'success') {
        setCities(
          res.data.data.map((c: any) => ({
            label: c.city_name,
            value: c.city_id,
          }))
        );
      }
    } catch (e) { }
  };

  const loadPincodes = async (cityId: any) => {
    try {
      const res = await getPincodesList(cityId);
      if (res?.data?.status === 'success') {
        setPincodes(
          res.data.data.map((p: any) => ({
            label: p.pincode,
            value: p.pincode_id,
          }))
        );
      }
    } catch (e) { }
  };


  const loadPincodesSearch = async (pincode: string, olddata?: any) => {
    if (pincode.length !== 6) return;

    try {
      const res = await getPincodes(pincode);
      const data = res?.data;

      if (res?.status === 200 && data?.pincode) {

        handleChange("pincode_id", data.pincode_id);

        // MULTIPLE CITY CASE
        if (data?.cities && data.cities.length > 1) {

          setShowCityDropdown(true);

          const options = data.full_data.map((c: any, index: number) => ({
            label: c?.city,
            value: data.city_ids[index],
            state: c?.state,
            district: c?.district,
            state_id: c?.state_id,
            district_id: c?.district_id,
          }));

          setCityOptions(options);

          // Clear old city selection
          const firstCity = options[0];

          if (firstCity) {
            setCityName(firstCity.label);

            setStateName(firstCity.state);
            setDistrictName(firstCity.district);

            handleChange("city_id", firstCity.value);
            handleChange("state_id", firstCity.state_id);
            handleChange("district_id", firstCity.district_id);
          }

          // Edit mode support
          if (olddata?.city_id) {
            const matchedCity = options.find(
              (item: any) => String(item.value) === String(olddata.city_id)
            );

            if (matchedCity) {
              setCityName(matchedCity.label);

              handleChange("city_id", matchedCity.value);
              handleChange("state_id", matchedCity.state_id);
              handleChange("district_id", matchedCity.district_id);

              setStateName(matchedCity.state);
              setDistrictName(matchedCity.district);
            }
          }

        } else {

          // SINGLE CITY CASE
          setShowCityDropdown(false);

          setStateName(data.state);
          setDistrictName(data.district);
          setCityName(data.city);

          handleChange("state_id", data.state_id);
          handleChange("district_id", data.district_id);
          handleChange("city_id", data.city_id);
        }

      } else {
        Toast.show({ type: "error", text1: "Invalid Pincode" });
        clearLocationFields();
      }

    } catch (error) {
      Toast.show({ type: "error", text1: "Invalid Pincode" });
      clearLocationFields();
      console.log("Pincode error", error);
    }
  };

  const ImageUploadBox = ({ label, value, onChange, required = false, existingUri }: any) => {

    const displayUri = value?.uri || existingUri
    const removeImage = () => onChange(null);

    return (
      <View style={{ width: '48%', marginBottom: 16 }}>
        <AppText size={14} color={colors.black} family="InterMedium">
          {label} {required && <AppText color="red">*</AppText>}
        </AppText>

        <TouchableOpacity
          style={[
            styles.uploadBox,
            {
              height: 140,
              justifyContent: value ? 'flex-start' : 'center',
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: value ? '#22C55E' : '#CBD5E1',
              borderStyle: 'dashed',
              borderRadius: 12,
              overflow: 'hidden',
              marginTop: 8,
            },
          ]}
          onPress={() => openUploadSheet(label.includes('Owner') ? 'owner_photo' : 'shop_photo', label)}
        >
          {displayUri ? (
            <>
              <FastImage source={{ uri: displayUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              <TouchableOpacity
                onPress={removeImage}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: 20,
                  padding: 6,
                }}
              >
                <MinusIcon width={16} height={16} fill="white" />
              </TouchableOpacity>
            </>
          ) : (
            <View style={{ alignItems: 'center', gap: 8, justifyContent: 'center', flex: 1 }}>
              <UploadIcon width={40} height={40} />
              <AppText size={13} color="#64748B" family="InterMedium" align="center">
                Tap to upload{' '}
                {label.toLowerCase().includes('cheque') || label.toLowerCase().includes('mou')
                  ? '(PDF or Image allowed)'
                  : ''}
              </AppText>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const pickFromGallery = () => {
    const options: any = {
      mediaType: 'photo' as const,
      quality: 0.85,
      includeBase64: false, // set true only if you really need base64
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (currentUploadField) {
          handleChange(currentUploadField, asset);
        }
        actionSheetRef.current?.hide();
      }
    });
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    launchCamera(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 1,           // ← slightly lower than 1 to save space/bandwidth
        saveToPhotos: Platform.OS === 'ios' ? false : true,      // optional – saves to gallery (good UX)
        cameraType: 'back',      // or 'front' – you can make dynamic if needed
        // Note: selectionLimit has NO EFFECT in launchCamera – it's always single capture
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('User cancelled camera');
          return;
        }

        if (response.errorCode) {
          Toast.show({
            type: 'error',
            text1: response.errorMessage || 'Camera error',
          });
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const uri = response.assets[0]?.uri;
          if (!uri) return;
          const asset = response.assets[0];
          if (currentUploadField) {
            handleChange(currentUploadField, asset);

          }
          actionSheetRef.current?.hide();
        }
      }
    );
  };
  const getBasicCount = () => {
    let count = 0;
    if (formData.sub_type) count++;
    if (formData.owner_name?.trim()) count++;
    if (formData.shop_name?.trim()) count++;
    if (formData.mobile_number?.trim()) count++;
    return count;
  };

  const getAddressCount = () => {
    let count = 0;
    if (formData.address_line?.trim()) count++;
    if (formData.state_id) count++;
    if (formData.district_id) count++;
    if (formData.city_id) count++;
    if (formData.pincode_id) count++;
    return count;
  };

  const getAdditionalCount = () => {
    let count = 0;
    if (formData.saathi_awareness_status) count++;
    if (formData.opportunity_status) count++;
    if (formData.beat_id) count++;
    const currentType = route?.params?.type?.toUpperCase();
    if (['RETAILER', 'WORKSHOP'].includes(currentType)) {
      if (formData.distributor_name) count++;
    }
    return count;
  };

  const getImagesCount = () => {
    let count = 0;
    if (formData.owner_photo) count++;
    if (formData.shop_photo) count++;
    return count;
  };

  const isDistributorRequired = ['RETAILER', 'WORKSHOP'].includes(
    (route?.params?.type || '').toUpperCase()
  );

  const expectedAdditional = isDistributorRequired ? 4 : 3;

  const isFormValid =
    getBasicCount() === 4 &&
    getAddressCount() === 5 &&
    getAdditionalCount() === expectedAdditional &&
    getImagesCount() === 2;

  const handleChange = (field: any, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const prepareFormData = () => {
    const fd = new FormData();

    fd.append('type', formData.type || 'MECHANIC');
    fd.append('sub_type', formData.sub_type);
    fd.append('owner_name', formData.owner_name);
    fd.append('shop_name', formData.shop_name);
    fd.append('mobile_number', formData.mobile_number);
    fd.append('whatsapp_number', formData.whatsapp_number);
    fd.append('address_line', formData.address_line);
    fd.append('country_id', formData.country_id);
    fd.append('state_id', formData.state_id);
    fd.append('district_id', formData.district_id);
    fd.append('city_id', formData.city_id);
    fd.append('pincode_id', formData.pincode_id);

    if (formData.sales_exception_assignment) fd.append('sales_exception_assignment', formData.sales_exception_assignment);
    (formData.vehicle_segment || []).forEach((segment: string) => {
      fd.append('vehicle_segment[]', segment);
    });
    if (formData.belt_area_market_name) fd.append('belt_area_market_name', formData.belt_area_market_name);
    if (route?.params?.type == "MECHANIC" || route?.params?.type == "GARAGE") {
      fd.append('saathi_awareness_status', formData.saathi_awareness_status);
    } else {
      fd.append('distributor_name', formData.distributor_name);
      fd.append('nistha_awareness_status', formData.saathi_awareness_status);
    }

    fd.append('opportunity_status', formData.opportunity_status);
    fd.append('beat_id', formData.beat_id);
    if (formData.gps_location) {
      const [latitude, longitude] = formData.gps_location.split(',');
      fd.append('gps_location', formData.gps_location);
      fd.append('latitude', latitude);
      fd.append('longitude', longitude);
    }
    fd.append('is_current_location', '1');

    // Images
    const addPhoto = (key: any, asset: any) => {
      if (asset?.uri) {
        const filename = asset.fileName || `photo_${Date.now()}.jpg`;
        fd.append(key, {
          uri: asset.uri,
          name: filename,
          type: asset.type || 'image/jpeg',
        });
      }
    };

    if (formData?.owner_photo?.uri) {
      addPhoto('owner_photo', formData.owner_photo);
    }
    if (formData?.shop_photo?.uri) {
      addPhoto('shop_photo', formData.shop_photo);
    }
    console.log(fd, 'formData?.owner_photoformData?.owner_photo')
    return fd;
  };

  const handleSubmit = async () => {
    if (!formData.gps_location) {
      Toast.show({ type: 'error', text1: 'Current location is required', text2: 'Please enable location and try again.' });
      fetchCurrentLocation();
      return;
    }
    if (!isFormValid) {
      Toast.show({ type: 'error', text1: 'Please fill all required fields' });
      return;
    }
    setLoading(true)
    const token = store.getState().auth?.token;
    const url = isEdit
      ? `${BASE_URL}api/secondary-customers/${existingCustomer?.id}`
      : `${BASE_URL}api/secondary-customers`;

    try {
      const payload = prepareFormData();

      const res = await fetch(url, {
        method: 'POST',           // important: use POST + _method=PUT for form-data PUT
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const json = await res.json();
      if (res.ok) {
        Toast.show({
          type: 'success',
          text1: isEdit ? 'Customer updated successfully' : 'Customer added successfully',
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: json.message || 'Failed to add mechanic',
        });
      }
      setLoading(false)
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Network error. Please try again.' });
      console.error(err);
      setLoading(false)
    }
  };

  // ─── Pre-fill data in Edit mode ───
  useEffect(() => {
    if (isEdit && existingCustomer) {
      setFormData({
        type: existingCustomer.type || route?.params?.type || 'MECHANIC',
        sub_type: existingCustomer.sub_type || '',
        owner_name: existingCustomer.owner_name || '',
        shop_name: existingCustomer.shop_name || '',
        mobile_number: existingCustomer.mobile_number || '',
        whatsapp_number: existingCustomer.whatsapp_number || '',
        address_line: existingCustomer.address_line || '',
        country_id: existingCustomer.country_id || '1',
        state_id: existingCustomer.state_id || '',
        district_id: existingCustomer.district_id || '',
        city_id: existingCustomer.city_id || '',
        pincode_id: existingCustomer.pincode_id || '',
        sales_exception_assignment: existingCustomer.sales_exception_assignment || '',
        vehicle_segment: Array.isArray(existingCustomer.vehicle_segment)
          ? existingCustomer.vehicle_segment
          : String(existingCustomer.vehicle_segment || '').split(',').map((item) => item.trim()).filter(Boolean),
        belt_area_market_name: existingCustomer.belt_area_market_name || '',
        saathi_awareness_status:
          existingCustomer.saathi_awareness_status ||
          existingCustomer.nistha_awareness_status ||
          '',
        opportunity_status: existingCustomer.opportunity_status || '',
        beat_id: String(existingCustomer.beat_id || ''),
        distributor_name: existingCustomer.distributor_name || '',
        gps_location: existingCustomer?.gps_location || '',
        owner_photo: existingCustomer?.owner_photo ? `${BASE_URL}public/storage/${existingCustomer.owner_photo}` : null,    // new upload only — existing shown via uri
        shop_photo: existingCustomer?.shop_photo ? `${BASE_URL}public/storage/${existingCustomer.shop_photo}` : null,
      });
      console.log(existingCustomer.distributor_name, 'existingCustomer.distributor_name')
      // Trigger dependent dropdowns
      if (existingCustomer.state_id) {
        loadDistricts(existingCustomer.state_id);
      }
      if (existingCustomer.district_id) {
        loadCities(existingCustomer.district_id);
      }
      if (existingCustomer.city_id) {
        loadPincodes(existingCustomer.city_id);
      }
      setPincode(existingCustomer.pincode?.pincode || '');
      setStateName(existingCustomer.state?.state_name || '');
      setDistrictName(existingCustomer.district?.district_name || '');
      setCityName(existingCustomer.city?.city_name || '');
    }
  }, [isEdit, existingCustomer,]);

  // ── Inside the component (states remain the same) ──
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);

  // ── The fetch function remains almost the same ──
  const fetchCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    Geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);

        setCurrentLat(Number(lat));
        setCurrentLng(Number(lng));

        const coordsString = `${lat},${lng}`;
        handleChange('gps_location', coordsString);

        setLocationLoading(false);

        Toast.show({
          type: 'success',
          text1: 'Location captured',
          text2: coordsString,
          position: 'top',
        });
      },
      (error) => {
        setLocationLoading(false);
        let msg = 'Could not get location';
        if (error.code === 1) msg = 'Location permission denied';
        if (error.code === 2) msg = 'Location services are off';
        if (error.code === 3) msg = 'Location request timeout';

        setLocationError(msg);
        Toast.show({
          type: 'error',
          text1: 'Location Error',
          text2: msg,
          position: 'top',
          visibilityTime: 5000,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 20000,
      }
    );
  };

  // ── Optional: Request location permission on mount (Android mostly) ──
  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await requestAndroidLocationPermission();
          if (granted) fetchCurrentLocation();
        } catch (err) {
          console.warn(err);
        }
      } else if (Platform.OS === 'ios') {
        const granted = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        if (granted === RESULTS.GRANTED) fetchCurrentLocation();
        // iOS permission request can be handled here if you want to proactively ask
        // But usually it's better to ask right before accessing location for better UX
      }
    };

    requestLocationPermission();
  }, []);


  const clearLocationFields = () => {
    setStateName('');
    setDistrictName('');
    setCityName('');

    handleChange("state_id", '');
    handleChange("district_id", '');
    handleChange("city_id", '');
    handleChange("pincode_id", '');

    setShowCityDropdown(false);
    setCityOptions([]);
  };


  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerTitle: `${isEdit ? 'Edit Customer' : 'Add Customer'}`,     // ← change to whatever you want
      });
    }, [navigation, isEdit]
    ));


  return (
    <View style={styles.container}>
      {/* Fixed Type banner */}
      <View
        style={{
          backgroundColor: '#E0F2FE',
          padding: 16,
          marginBottom: 12,
          borderRadius: 12,
          alignItems: 'center',
        }}
      >
        <AppText size={16} family="InterSemiBold" color={colors.blue}>
          Type: {route?.params?.type}
        </AppText>
      </View>

      <KeyboardAwareScrollView
        style={[styles.scrollView, {
          paddingHorizontal: rw(20),
          paddingBottom: rw(120),
          paddingTop: 25,
        }]}
        bottomOffset={50}
        keyboardDismissMode='on-drag'
        showsVerticalScrollIndicator={false}
      >
        <AccordionSection title="Basic Information" defaultExpanded={true}>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <AppText
              size={16}
              color={getBasicCount() === 4 ? '#22C55E' : '#64748B'}
              family="InterSemiBold"
            >
              {getBasicCount()}/4 completed
            </AppText>
          </View>

          <Dropdown
            style={[styles.selectUser, { paddingHorizontal: 12, paddingVertical: 14 }]}
            placeholderStyle={{ color: '#718096', fontSize: 14 }}
            selectedTextStyle={{ color: colors.black, fontSize: 14 }}
            data={route?.params?.type === 'MECHANIC'
              ? [
                { label: 'Two-Wheeler Mechanic', value: 'Two-Wheeler Mechanic' },
                { label: 'Car / 4W Mechanic', value: 'Car / 4W Mechanic' },
                { label: 'HCV-LCV Mechanic', value: 'HCV-LCV Mechanic' },
                { label: 'Tractor / Agri Machine', value: 'Tractor / Agri Machine' },
                { label: 'Diesel/FIP Mechanic', value: 'Diesel/FIP Mechanic' }
              ] : route?.params?.type === 'GARAGE'
                ? [
                  { label: 'ROADSIDE GARAGE', value: 'ROADSIDE GARAGE' },
                  { label: 'MULTI EMPLOYEE GARAGE', value: 'MULTI EMPLOYEE GARAGE' },
                  { label: 'ONE-MAN GARAGE', value: 'ONE-MAN GARAGE' }
                ] : route?.params?.type === 'RETAILER'
                  ? [
                    { label: 'AUTO SPARE PARTS RETAILER', value: 'AUTO SPARE PARTS RETAILER' },
                    { label: 'LUBRICANT RETAILER', value: 'LUBRICANT RETAILER' },
                    { label: 'TWO WHEELER PARTS SHOP', value: 'TWO WHEELER PARTS SHOP' },
                    { label: 'CAR ACCESSORIES & PARTS SHOP', value: 'CAR ACCESSORIES & PARTS SHOP' },
                    { label: 'TRACTOR PARTS SHOP', value: 'TRACTOR PARTS SHOP' },
                    { label: 'HCV-LCV SHOP', value: 'HCV-LCV SHOP' }
                  ] : route?.params?.type === 'WORKSHOP'
                    ? [
                      { label: 'Lube & Filter Change Workshop', value: 'Lube & Filter Change Workshop' },
                      { label: 'Two-Wheeler Service Workshop', value: 'Two-Wheeler Service Workshop' },
                      { label: 'Car Service Workshop', value: 'Car Service Workshop' },
                      { label: 'HCV - LCV Workshop', value: 'HCV - LCV Workshop' }
                    ] : []}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Sub Type *"
            value={formData.sub_type}
            onChange={(item) => handleChange('sub_type', item.value)}
            renderRightIcon={() => <ArrowDownIcon />}
          />

          <CustomTextInput
            placeholder="Owner Name *"
            value={formData.owner_name}
            onChangeText={(v: any) => handleChange('owner_name', v)}
          />

          <CustomTextInput
            placeholder="Shop Name *"
            value={formData.shop_name}
            onChangeText={(v: any) => handleChange('shop_name', v)}
          />

          <CustomTextInput
            placeholder="Mobile Number *"
            value={formData.mobile_number}
            maxLength={10}
            onChangeText={(v: any) => handleChange('mobile_number', v)}
            keyboardType="phone-pad"
            editable={isEdit}
          />

          <CustomTextInput
            placeholder="WhatsApp / Alternate Number (optional)"
            value={formData.whatsapp_number}
            maxLength={10}
            onChangeText={(v: any) => handleChange('whatsapp_number', v)}
            keyboardType="phone-pad"
          />
        </AccordionSection>

        <AccordionSection title="Address Information">
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <AppText
              size={16}
              color={getAddressCount() === 5 ? '#22C55E' : '#64748B'}
              family="InterSemiBold"
            >
              {getAddressCount()}/5 completed
            </AppText>
          </View>

          <CustomTextInput
            placeholder="Address Line *"
            value={formData.address_line}
            onChangeText={(v: any) => handleChange('address_line', v)}
          />

          {/* Country - fixed India for simplicity */}
          {/* <View style={[styles.selectUser, { padding: 14 }]}>
            <AppText size={14} color={colors.black}>
              India
            </AppText>
          </View> */}

          {/* <Dropdown
            style={[styles.selectUser, { paddingHorizontal: 12, paddingVertical: 14, marginTop: 12 }]}
            placeholder="State *"
            placeholderStyle={{ color: '#718096', fontSize: 14 }}
            selectedTextStyle={{ color: colors.black, fontSize: 14 }}
            data={states}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            value={formData.state_id}
            onChange={(item) => {
              handleChange('state_id', item.value);
              handleChange('district_id', '');
              handleChange('city_id', '');
              handleChange('pincode_id', '');
              loadDistricts(item.value);
            }}
            renderRightIcon={() => <ArrowDownIcon />}
          />

          <Dropdown
            style={[styles.selectUser, { paddingHorizontal: 12, paddingVertical: 14, marginTop: 12 }]}
            placeholder="District *"
            placeholderStyle={{ color: '#718096', fontSize: 14 }}
            selectedTextStyle={{ color: colors.black, fontSize: 14 }}
            data={districts}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            value={formData.district_id}
            onChange={(item) => {
              handleChange('district_id', item.value);
              handleChange('city_id', '');
              handleChange('pincode_id', '');
              loadCities(item.value);
            }}
            renderRightIcon={() => <ArrowDownIcon />}
          />

          <Dropdown
            style={[styles.selectUser, { paddingHorizontal: 12, paddingVertical: 14, marginTop: 12 }]}
            placeholder="City *"
            placeholderStyle={{ color: '#718096', fontSize: 14 }}
            selectedTextStyle={{ color: colors.black, fontSize: 14 }}
            data={cities}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            value={formData.city_id}
            onChange={(item) => {
              handleChange('city_id', item.value);
              handleChange('pincode_id', '');
              loadPincodes(item.value);
            }}
            renderRightIcon={() => <ArrowDownIcon />}
          />

          <Dropdown
            style={[styles.selectUser, { paddingHorizontal: 12, paddingVertical: 14, marginTop: 12 }]}
            placeholder="Pincode *"
            placeholderStyle={{ color: '#718096', fontSize: 14 }}
            selectedTextStyle={{ color: colors.black, fontSize: 14 }}
            data={pincodes}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            value={formData.pincode_id}
            onChange={(item) => handleChange('pincode_id', item.value)}
            renderRightIcon={() => <ArrowDownIcon />}
          /> */}

          <View style={[styles.selectUser, { padding: 14, marginBottom: 12 }]}>
            <AppText size={14} color={colors.black}>India</AppText>
          </View>

          <CustomTextInput
            placeholder="Pincode *"
            value={pinCode || formData?.pincode_id?.toString() || ''}
            maxLength={6}
            keyboardType="numeric"
            onChangeText={(text: string) => {
              setPincode(text);
              handleChange('pincode_id', text)
              if (text.length === 6) {
                loadPincodesSearch(text);
              } else {
                clearLocationFields();
              }
            }}
          />

          <CustomTextInput placeholder="State *" value={stateName || formData.state_id} editable={false} />
          <CustomTextInput placeholder="District *" value={districtName} editable={false} />
          {showCityDropdown ? (
            <Dropdown
              style={[styles.selectUser, { padding: 14, marginBottom: 12 }]}
              data={cityOptions}
              value={formData.city_id}
              onChange={(item) => {
                handleChange("city_id", item.value);

                setCityName(item.label);
                setDistrictName(item?.district);
                setStateName(item?.state);

                handleChange("state_id", item.state_id);
                handleChange("district_id", item.district_id);
              }}
              labelField="label"
              valueField="value"
              placeholder="Select City *"
              placeholderStyle={{ color: 'gray', fontSize: 14 }}
              renderRightIcon={() => <ArrowDownIcon />}
            />
          ) : (
            <CustomTextInput
              placeholder="City *"
              value={cityName}
              editable={false}
            />
          )}
        </AccordionSection>

        <AccordionSection title="Additional Information">
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <AppText
              size={16}
              color={getAdditionalCount() === 3 ? '#22C55E' : '#64748B'}
              family="InterSemiBold"
            >
              {getAdditionalCount()}/3 completed
            </AppText>
          </View>
          <CustomTextInput
            placeholder="Sales Exception Assignment (optional)"
            value={formData.sales_exception_assignment}
            onChangeText={(v: any) => handleChange('sales_exception_assignment', v)}
          />

          <MultiSelect
            style={[styles.selectUser, { paddingHorizontal: 12, paddingVertical: 14, marginTop: 12 }]}
            placeholder="Select Vehicle Segment (optional)"
            placeholderStyle={{ color: '#718096', fontSize: 14 }}
            selectedTextStyle={{ color: colors.black, fontSize: 14 }}
            data={[
              { label: '2W', value: '2W' },
              { label: '3W', value: '3W' },
              { label: 'AGRICULTURE – Tractor', value: 'AGRICULTURE – Tractor' },
              { label: 'COOLANT', value: 'COOLANT' },
              { label: 'EARTH MOVING EQUIPMENT', value: 'EARTH MOVING EQUIPMENT' },
              { label: 'HCV', value: 'HCV' },
              { label: 'LCV', value: 'LCV' },
              { label: 'LUBRICANT', value: 'LUBRICANT' },
              { label: 'PASSENGER VEHICLE (PV)', value: 'PASSENGER VEHICLE (PV)' },
            ]}
            maxHeight={300}
            value={formData.vehicle_segment}
            onChange={(items) => handleChange('vehicle_segment', items)}
            renderRightIcon={() => <ArrowDownIcon />} labelField="label"
            valueField="value" />

          <CustomTextInput
            placeholder="Belt / Area / Market Name (optional)"
            value={formData.belt_area_market_name}
            onChangeText={(v: any) => handleChange('belt_area_market_name', v)}
          />

          <Dropdown
            style={[styles.selectUser, { paddingHorizontal: 12, paddingVertical: 14, marginTop: 12 }]}
            placeholderStyle={{ color: '#718096', fontSize: 14 }}
            selectedTextStyle={{ color: colors.black, fontSize: 14 }}
            placeholder={(route?.params?.type == "MECHANIC" || route?.params?.type == "GARAGE") ? "Saathi Awareness Status *" : "Nistha Awareness Status *"}
            data={[
              { label: 'NOT DONE', value: 'Not Done' },
              { label: 'DONE', value: 'Done' },
            ]}
            value={formData.saathi_awareness_status}
            onChange={(item) => handleChange('saathi_awareness_status', item.value)}
            renderRightIcon={() => <ArrowDownIcon />}
            labelField="label"
            valueField="value" />

          <Dropdown
            style={[styles.selectUser, { paddingHorizontal: 12, paddingVertical: 14, marginTop: 12 }]}
            placeholder="Opportunity Status *"
            placeholderStyle={{ color: '#718096', fontSize: 14 }}
            selectedTextStyle={{ color: colors.black, fontSize: 14 }}
            data={[
              { label: 'COLD – Low interest / only enquiry', value: 'COLD' },
              { label: 'WARM – Interested but needs time', value: 'WARM' },
              { label: 'HOT – Very interested/almost confirm', value: 'HOT' },
              { label: 'LOST – Deal cancelled', value: 'LOST' },
              { label: 'EXISTING – Existing customer', value: 'EXISTING' },
            ]}
            value={formData.opportunity_status}
            onChange={(item) => handleChange('opportunity_status', item.value)}
            renderRightIcon={() => <ArrowDownIcon />} labelField="label"
            valueField="value" />

          {['RETAILER', 'WORKSHOP'].includes((route?.params?.type || '').toUpperCase()) && (
            <View>
              {/* <AppText
                size={14}
                color={colors.black}
                family="InterMedium"
                style={{ marginTop: 16, marginBottom: 4 }}
              >
                Select Distributor *
              </AppText> */}

              {/* {distributorsLoading ? (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={colors.blue} />
                  <AppText size={13} color="#64748B" style={{ marginTop: 8 }}>
                    Loading distributors...
                  </AppText>
                </View>
              ) : distributors.length === 0 ? (
                <AppText size={14} color="#EF4444" style={{ padding: 12 }}>
                  No distributors available
                </AppText>
              ) : ( */}
              <Dropdown
                style={[styles.selectUser, { paddingHorizontal: 12, paddingVertical: 14 }]}
                placeholderStyle={{ color: '#718096', fontSize: 14 }}
                selectedTextStyle={{ color: colors.black, fontSize: 14 }}
                placeholder="Select Distributor *"
                search
                maxHeight={320}
                data={distributors}
                labelField="label"
                valueField="value"
                value={parseInt(formData.distributor_name)}
                onChange={(item) => handleChange('distributor_name', item.value)}
                renderRightIcon={() => <ArrowDownIcon />}
              />
              {/* )} */}
            </View>
          )}

          <Dropdown
            style={[styles.selectUser, { paddingHorizontal: 12, paddingVertical: 14, marginTop: 12 }]}
            placeholderStyle={{ color: '#718096', fontSize: 14 }}
            selectedTextStyle={{ color: colors.black, fontSize: 14 }}
            placeholder="Select Beat *"
            search
            maxHeight={320}
            data={beats}
            labelField="label"
            valueField="value"
            value={parseInt(formData.beat_id)}
            onChange={(item) => {
              handleChange('beat_id', item.value);
            }}
            renderRightIcon={() => <ArrowDownIcon />}
          />
        </AccordionSection>

        <AccordionSection title="Attachments">
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <AppText
              size={16}
              color={getImagesCount() === 2 ? '#22C55E' : '#64748B'}
              family="InterSemiBold"
            >
              {getImagesCount()}/2 uploaded
            </AppText>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <ImageUploadBox
              label="Owner Photo"
              value={formData.owner_photo}
              onChange={(asset: any) => handleChange('owner_photo', asset)}
              required
              existingUri={
                isEdit && formData.owner_photo && existingCustomer?.owner_photo
                  ? formData.owner_photo
                  : null
              }
            />

            <ImageUploadBox
              label="Shop Photo"
              value={formData.shop_photo}
              onChange={(asset: any) => handleChange('shop_photo', asset)}
              required
              existingUri={
                isEdit && formData.shop_photo && existingCustomer?.shop_photo
                  ? formData.shop_photo
                  : null
              }
            />
          </View>
        </AccordionSection>
        {locationLoading && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingLeft: 4 }}>
            <ActivityIndicator size="small" color={colors.blue} />
            <AppText size={13} color="#64748B">
              Fetching current location...
            </AppText>
          </View>
        )}

        {locationError && (
          <AppText
            size={13}
            color="red"

          >
            {locationError}
          </AppText>
        )}

        {currentLat !== null && currentLng !== null && (
          <AppText
            size={13}
            color="#22C55E"

          >
            {/* Captured: {currentLat.toFixed(6)}, {currentLng.toFixed(6)} */}
          </AppText>
        )}
        {isFormValid && (
          <>
            {
              loading ? (
                <View style={[styles.buttonView, { backgroundColor: colors.blue, }]}>
                  <ActivityIndicator size={'large'} color={colors.white} />
                </View>
              ) : (
                <Pressable style={styles.buttonView} onPress={handleSubmit}>
                  <AppText color="white" family="InterBold" size={16}>
                    SUBMIT
                  </AppText>
                </Pressable>
              )
            }

          </>
        )}
        <SafeAreaView style={{ height: 100 }} />
      </KeyboardAwareScrollView>
      <ActionSheet
        ref={actionSheetRef}
        gestureEnabled
        containerStyle={{
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: '#fff',
          paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        }}
        indicatorStyle={{
          backgroundColor: '#D1D5DB',
          width: 40,
          height: 5,
        }}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 }}>
          <AppText
            align="center"
            size={20}
            color={colors.black}
            family="InterBold"
          >
            {currentUploadLabel}
          </AppText>
          <View style={{ marginTop: 12 }}>
            <AppText
              align="center"
              size={14}
              color="#6B7280"
              family="InterMedium"
            >
              Please select an option to upload image
            </AppText>
          </View>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: rw(32),
          }}>
            <Pressable
              style={styles.attandence}
              onPress={pickImage}
            >
              <AppText size={16} color={colors.white} family="InterMedium">
                Take Photo
              </AppText>
            </Pressable>

            <Pressable
              style={[styles.attandence, {
                backgroundColor: colors.white,
                borderWidth: 2,
                borderColor: colors.blue

              }]}
              onPress={pickFromGallery}
            >

              <AppText size={16} color={colors.black} family="InterMedium">
                Choose from Gallery
              </AppText>
            </Pressable>
          </View>
        </View>
      </ActionSheet>
    </View>
  );
};

export default AddSecondaryCustomer;
