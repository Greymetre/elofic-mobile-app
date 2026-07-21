import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation } from '@react-navigation/native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import { styles } from './styles';
import { rw } from '../../utils/responsive';
import AppText from '../../components/AppText/AppText';
import { ArrowDownIcon, CalenderIcon, CrossIcon, } from '../../assets/svgs/SvgsFile';
import CustomerCalendar from '../../components/CustomCalendar/CalendarPopupView';
import store, { useAppSelector } from '../../components/redux/Store';
import { UploadIcon } from '../../assets/svgs/HomePageSvgs';
import DateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
const AddNewExpense = () => {
  const navigation = useNavigation();
  const { user } = useAppSelector((state) => state.auth);
  console.log(user?.payroll, 'user?.payrolluser?.payroll')
  const payroll_id = user?.payroll || 1;
  const token = store.getState()?.auth?.token || user?.access_token;
  const [expenseDateObj, setExpenseDateObj] = useState(new Date()); // For DateTimePicker
  const [showDatePicker, setShowDatePicker] = useState(false);
  // States
  const [expenseTypes, setExpenseTypes] = useState<any[]>([]);
  const [selectedExpenseType, setSelectedExpenseType] = useState<any>(null);

  const [cities, setCities] = useState<any[]>([]);
  const [filteredCities, setFilteredCities] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  const [expenseDate, setExpenseDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const [startKm, setStartKm] = useState('');
  const [stopKm, setStopKm] = useState('');
  const [totalKm, setTotalKm] = useState('0');
  const [claimAmount, setClaimAmount] = useState('');

  const [attachments, setAttachments] = useState<any[]>([]);

  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [note, setNote] = useState('');

  const checkCameraPermission = async (): Promise<boolean> => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;

    try {
      const result = await check(permission);

      switch (result) {
        case RESULTS.GRANTED:
          return true;

        case RESULTS.DENIED: {
          const requestResult = await request(permission);
          return requestResult === RESULTS.GRANTED;
        }

        case RESULTS.BLOCKED:
          Alert.alert(
            'Permission Required',
            'Camera permission is blocked. Please enable it from settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => openSettings() },
            ]
          );
          return false;

        default:
          return false;
      }
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  };

  // Request Camera Permission (Android + iOS handling)
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      // iOS handles permission automatically via Info.plist (NSCameraUsageDescription)
      // react-native-image-picker will trigger the native prompt
      await checkCameraPermission()
      return true;
    }

    // Android permission handling
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs camera access to take photos for expense attachments.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          'Permission Denied',
          'Camera permission is required. Please enable it from Settings.',
          [{ text: 'OK' }]
        );
        return false;
      } else {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return false;
      }
    } catch (err) {
      console.error('Camera permission error:', err);
      return false;
    }
  };

  // Fetch Expense Types
  const fetchExpenseTypes = useCallback(async () => {
    if (!payroll_id || !selectedCity?.grade) return;
    setLoadingTypes(true);
    try {
      const response = await fetch('https://elofic.fieldkonnect.io/api/getExpensesType', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payroll_id,
          grade: selectedCity.grade,
        }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        setExpenseTypes(result.data || []);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load expense types');
    } finally {
      setLoadingTypes(false);
    }
  }, [payroll_id, selectedCity?.grade, token]);

  useEffect(() => {
    if (selectedExpenseType?.allowance_type_id === 1) {
      const start = parseFloat(startKm) || 0;
      const stop = parseFloat(stopKm) || 0;
      const total = Math.max(0, stop - start);
      setTotalKm(total.toFixed(2));
      setClaimAmount((total * (selectedExpenseType.rate || 0)).toFixed(2));
      // Auto calculate only if user hasn't manually edited claim amount
      // if (!claimAmount || claimAmount === '0.00' || claimAmount === '0') {
      //   setClaimAmount((total * (selectedExpenseType.rate || 0)).toFixed(2));
      // }
    }
  }, [startKm, stopKm, selectedExpenseType]);

  // Fetch Cities
  const fetchCities = useCallback(async () => {
    setLoadingCities(true);
    try {
      const response = await fetch('https://elofic.fieldkonnect.io/api/getCityList', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.status === 'success') {
        setCities(result.data || []);
        setFilteredCities(result.data || []);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load cities');
    } finally {
      setLoadingCities(false);
    }
  }, [token]);

  // Filter cities
  useEffect(() => {
    if (citySearch.trim() === '') {
      setFilteredCities(cities);
    } else {
      const filtered = cities.filter((city) =>
        city.city_name.toLowerCase().includes(citySearch.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [citySearch, cities]);

  // Auto calculate Total Km & Claim Amount
  useEffect(() => {
    const start = parseFloat(startKm) || 0;
    const stop = parseFloat(stopKm) || 0;
    const total = Math.max(0, stop - start);
    setTotalKm(total.toFixed(2));

    // if (selectedExpenseType?.rate) {
    //   setClaimAmount((total * selectedExpenseType.rate).toFixed(2));
    // }
  }, [startKm, stopKm, selectedExpenseType]);

  // ==================== handleExpenseTypeSelect ====================
  const handleExpenseTypeSelect = (type: any) => {
    setSelectedExpenseType(type);

    // If allowance_type_id === 1, reset KM fields and set fixed claim amount
    if (type.allowance_type_id === 1) {
      setStartKm('');
      setStopKm('');
      setTotalKm('0');
      setClaimAmount(type.rate ? type.rate.toFixed(2) : '');
    } else {
      // For other types, claim amount will be calculated from KM
      setClaimAmount('');
    }
  };

  // Fetch data
  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  useEffect(() => {
    if (selectedCity) fetchExpenseTypes();
  }, [selectedCity, fetchExpenseTypes]);

  // Image Picker
  const openCamera = async () => {
    setShowUploadModal(false);

    const hasPermission = await checkCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false   // Change to true if you want to save to gallery
      });

      if (result.assets?.[0]) {
        setAttachments((prev) => [...prev, result.assets[0]]);
      } else if (result.errorCode) {
        console.log(result, 'result.errorMessageresult.errorMessageresult.errorMessage')
        Alert.alert('Error', result.errorMessage || 'Failed to open camera');
      }
    } catch (err) {
      console.error('Camera launch error:', err);
      Alert.alert('Error', 'Failed to launch camera');
    }
  };

  const openGallery = async () => {
    setShowUploadModal(false);
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 5, });
    if (result.assets) setAttachments((prev) => [...prev, ...result.assets]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Show KM fields only when allowance_type_id === 1
  const isKmVisible = selectedExpenseType?.allowance_type_id === 1;



  const handleSubmit = async () => {
    if (!selectedCity || !selectedExpenseType || !expenseDate || !note.trim()) {
      Alert.alert('Missing Fields', 'Please fill all required fields (City, Expense Type, Date, and Note)');
      return;
    }

    // For KM type: validate start/stop km
    if (selectedExpenseType?.allowance_type_id === 1) {
      if (!startKm || !stopKm) {
        Alert.alert('Missing Fields', 'Please enter Start Km and Stop Km');
        return;
      }
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      // Append text fields
      formData.append('expenses_type', selectedExpenseType.id.toString());
      formData.append('claim_amount', claimAmount || '0');
      formData.append('date', expenseDate);                    // YYYY-MM-DD
      formData.append('city_id', selectedCity.city_id.toString());
      formData.append('note', note.trim());

      // KM fields (only if KM type)
      if (selectedExpenseType?.allowance_type_id === 1) {
        formData.append('start_km', startKm);
        formData.append('stop_km', stopKm);
        formData.append('total_km', totalKm);
      } else {
        // Optional: send empty values or skip
        formData.append('start_km', '0');
        formData.append('stop_km', '0');
        formData.append('total_km', '0');
      }

      // Append multiple attachments (if any)
      if (attachments.length > 0) {
        attachments.forEach((asset, index) => {
          formData.append(`expense_file[]`, {
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `expense_image_${index}.jpg`,
          });
        });
      }



      const response = await fetch('https://elofic.fieldkonnect.io/api/createExpense', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type manually for FormData (React Native handles it)
        },
        body: formData,
      });

      const result = await response.json();

      if (result.status === 'success') {
        Alert.alert('Success', 'Expense submitted successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', result.message || 'Failed to submit expense');
      }
    } catch (err) {
      console.error('Submit Error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView style={[styles.container, { paddingHorizontal: rw(18), paddingTop: 20 }]} showsVerticalScrollIndicator={false} bottomOffset={50} keyboardDismissMode='on-drag'>

        {/* City Selection (Required for grade) */}
        <AppText size={16} color="#000000" family="InterSemiBold">Select City</AppText>
        <Pressable style={[styles.UserBox, styles.row]} onPress={() => setShowCityModal(true)}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <AppText size={14} color="#718096" family="InterRegular">
              {selectedCity ? selectedCity.city_name : 'Select City'}
            </AppText>
          </View>
          <ArrowDownIcon color="#000000" />
        </Pressable>

        {/* Expense Type - Dropdown */}
        <AppText size={16} color="#000000" family="InterSemiBold" style={{ marginTop: 20 }}>Select Expense Type</AppText>
        {loadingTypes ? (
          <ActivityIndicator color="#000" style={{ marginVertical: 15 }} />
        ) : (
          <Dropdown
            style={[styles.UserBox, { paddingHorizontal: rw(12) }]}
            data={expenseTypes}
            maxHeight={300}
            labelField="name"
            valueField="id"
            placeholder="Select Type"
            value={selectedExpenseType?.id}
            onChange={handleExpenseTypeSelect}
            renderRightIcon={() => <ArrowDownIcon color="#000000" />}
          />
        )}

        {/* Expense Date - Calendar */}
        <AppText size={16} color="#000000" family="InterSemiBold" style={{ marginTop: 20 }}>Select Expense Date</AppText>
        <Pressable
          style={[styles.UserBox, styles.row]}
          onPress={() => setShowDatePicker(true)}
        >
          <View style={{ flex: 1, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <CalenderIcon color="#3C3C3C" />
            <AppText size={14} color="#718096" family="InterRegular">
              {expenseDate ? new Date(expenseDate).toLocaleDateString('en-GB') : 'DD-MM-YYYY'}
            </AppText>
          </View>
          <ArrowDownIcon color="#000000" />
        </Pressable>

        {/* DateTimePicker (shown only when triggered) */}
        {showDatePicker && Platform.OS == "android" && (
          <DateTimePicker
            testID="dateTimePicker"
            value={expenseDateObj}
            mode="date"
            display="inline"
            themeVariant='light'         // Use "spinner" or "calendar" on iOS if preferred
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setExpenseDateObj(selectedDate);
                // Format as YYYY-MM-DD for your state
                const formattedDate = selectedDate.toISOString().split('T')[0];
                setExpenseDate(formattedDate);
              }
            }}
          />
        )}

        {/* Rate (Non-editable) */}
        <AppText size={16} color="#000000" family="InterSemiBold" style={{ marginTop: 20 }}>Rate</AppText>
        <View style={[styles.UserBox, styles.row]}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <AppText size={14} color="#718096" family="InterRegular">
              ₹ {selectedExpenseType?.rate || '0.00'}
            </AppText>
          </View>
        </View>

        {/* Start / Stop / Total Km - Shown only when allowance_type_id === 1 */}
        {isKmVisible && (
          <>
            <AppText size={16} color="#000000" family="InterSemiBold" style={{ marginTop: 20 }}>Start Km</AppText>
            <View style={[styles.UserBox, styles.row]}>
              <TextInput
                style={{ flex: 1, fontSize: 14, color: '#000' }}
                placeholder="Enter Start Km"
                keyboardType="numeric"
                value={startKm}
                onChangeText={setStartKm}
              />
            </View>

            <AppText size={16} color="#000000" family="InterSemiBold" style={{ marginTop: 20 }}>Stop Km</AppText>
            <View style={[styles.UserBox, styles.row]}>
              <TextInput
                style={{ flex: 1, fontSize: 14, color: '#000' }}
                placeholder="Enter Stop Km"
                keyboardType="numeric"
                value={stopKm}
                onChangeText={setStopKm}
              />
            </View>

            <AppText size={16} color="#000000" family="InterSemiBold" style={{ marginTop: 20 }}>Total Km</AppText>
            <View style={[styles.UserBox, styles.row]}>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <AppText size={14} color="#718096" family="InterRegular">{totalKm} km</AppText>
              </View>
            </View>
          </>
        )}

        {/* Claim Amount */}
        <AppText size={16} color="#000000" family="InterSemiBold" style={{ marginTop: 20 }}>Claim Amount</AppText>
        <View style={[styles.UserBox, styles.row]}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <AppText size={14} color="#000000" family="InterMedium">₹ </AppText>
            <TextInput
              style={{
                flex: 1,
                fontSize: 14,
                color: '#000',
                paddingVertical: 0,
              }}
              placeholder="0.00"
              keyboardType="numeric"
              value={claimAmount}
              onChangeText={(text) => {
                // Allow only numbers and one decimal point
                const cleanedText = text.replace(/[^0-9.]/g, '');
                const formattedText = cleanedText.includes('.')
                  ? cleanedText.split('.').slice(0, 2).join('.')
                  : cleanedText;
                setClaimAmount(formattedText);
              }}
            />
          </View>
        </View>

        <AppText size={16} color="#000000" family="InterSemiBold" style={{ marginTop: 20 }}>Note / Remarks</AppText>
        <View style={[styles.UserBox, { paddingHorizontal: rw(12), height: 'auto', }, Platform.OS === 'ios' ? { paddingVertical: 12 } : {}]}>
          <TextInput
            style={{ flex: 1, fontSize: 14, color: '#000', minHeight: 80, textAlignVertical: 'top' }}
            placeholder="Enter note (e.g. Travelled for client meeting)"
            multiline
            // numberOfLines={4}
            value={note}
            onChangeText={setNote}
          />
        </View>

        {/* Old Upload Box */}
        <View style={[styles.sectionContent, { flexDirection: 'row', alignItems: 'center', marginTop: 20 }]}>
          <Pressable style={styles.uploadBox} onPress={() => setShowUploadModal(true)}>
            <UploadIcon width={24} height={24} />
            <AppText size={13} color="#64748B" family="InterMedium">Upload</AppText>
          </Pressable>
          <View style={{ gap: 3, marginLeft: 12 }}>
            <AppText size={16} color="#000000" family="InterSemiBold" horizontal={6} width="60%">Expense Attachment</AppText>
            <AppText size={12} color="#C25050" family="InterRegular" horizontal={6}>Should be less than 5 MB</AppText>
          </View>
        </View>

        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <FlatList
            data={attachments}
            horizontal
            style={{ paddingTop: 12 }}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <View style={{ marginRight: 12, position: 'relative' }}>
                <Image source={{ uri: item.uri }} style={{ width: 90, height: 90, borderRadius: 8 }} />
                <Pressable
                  style={{ position: 'absolute', top: -6, right: -6, backgroundColor: 'red', borderRadius: 12, padding: 2 }}
                  onPress={() => removeAttachment(index)}
                >
                  <CrossIcon width={18} height={18} color="white" />
                </Pressable>
              </View>
            )}
            keyExtractor={(_, i) => i.toString()}
          />
        )}

        {/* Submit Button */}
        <Pressable style={styles.buttonView} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="white" /> : <AppText color="white" family="InterBold" size={16}>SUBMIT</AppText>}
        </Pressable>
      </KeyboardAwareScrollView>

      <Modal
        visible={Platform.OS === 'ios' && showDatePicker}
        transparent
      // animationType="slide"
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
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,

            }}
          >
            <View style={{ alignItems: "center" }}>

              <DateTimePicker
                testID="dateTimePicker"
                value={expenseDateObj}
                mode="date"
                display="inline"
                themeVariant='light'         // Use "spinner" or "calendar" on iOS if preferred
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setExpenseDateObj(selectedDate);
                    // Format as YYYY-MM-DD for your state
                    const formattedDate = selectedDate.toISOString().split('T')[0];
                    setExpenseDate(formattedDate);
                  }
                }}
              />
            </View>

            {/* iOS Buttons */}
            {Platform.OS === 'ios' && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 20,
                }}
              >
                <Pressable
                  onPress={() => setShowDatePicker(false)}
                  style={{
                    padding: 12,
                  }}
                >
                  <AppText>Cancel</AppText>
                </Pressable>

                <Pressable
                  onPress={() => {
                    // Always save the current value on OK (this fixes the "today" case)
                    const formattedDate = expenseDateObj.toISOString().split('T')[0];
                    setExpenseDate(formattedDate);
                    // Optionally update the object too if needed
                    // setExpenseDateObj(expenseDateObj);

                    setShowDatePicker(false);
                  }}
                  style={{
                    backgroundColor: '#395299',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                  }}
                >
                  <AppText color="white">OK</AppText>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
      {/* City Modal */}
      <Modal visible={showCityModal} animationType="slide" statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 50 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: rw(18), marginBottom: 15 }}>
            <AppText size={18} family="InterSemiBold">Select City</AppText>
            <Pressable onPress={() => setShowCityModal(false)}><CrossIcon /></Pressable>
          </View>
          <TextInput
            style={{ marginHorizontal: rw(18), borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 }}
            placeholder="Search city..."
            value={citySearch}
            onChangeText={setCitySearch}
          />
          {loadingCities ? (
            <ActivityIndicator size="large" style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item.city_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }} onPress={() => { setSelectedCity(item); setShowCityModal(false); setCitySearch(''); }}>
                  <AppText size={16}>{item.city_name}</AppText>
                  <AppText size={12} color="#666">Grade: {item.grade}</AppText>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </Modal>

      {/* Upload Options Modal (Camera / Gallery) */}
      <Modal visible={showUploadModal} transparent animationType="fade" statusBarTranslucent>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} activeOpacity={1} onPress={() => setShowUploadModal(false)}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 50 }}>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', padding: 15 }} onPress={openCamera}>
              <AppText size={16} style={{ marginLeft: 15 }}>Take Photo</AppText>
            </Pressable>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', padding: 15 }} onPress={openGallery}>
              <AppText size={16} style={{ marginLeft: 15 }}>Choose from Gallery</AppText>
            </Pressable>

          </View>
        </TouchableOpacity>
      </Modal>

      {/* Calendar Modal */}
      {/* <CustomerCalendar
        showCal={showCalendar} 
        setShowCal={setShowCalendar}
        initialStartDate={new Date()}           // Today's date as default
        initialEndDate={new Date()}
        setStartDates={(date: Date) => {
          setExpenseDate(date.toISOString().split('T')[0]);   // YYYY-MM-DD format
        }}
        setEndDates={(date: Date) => {
          setExpenseDate(date.toISOString().split('T')[0]);
        }}
        setRange={() => { }}                     // Not used for single day
        range="single"
        onApplyClick={(start: any) => {
          const selectedDate = typeof start === 'string' ? new Date(start) : start;
          setExpenseDate(selectedDate.toISOString().split('T')[0]);
          setShowCalendar(false);
        }}
        calendarType="history"
        minimumDate={null}
      /> */}
    </View>
  );
};

export default AddNewExpense;