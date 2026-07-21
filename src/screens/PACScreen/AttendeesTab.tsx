import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import AppText from '../../components/AppText/AppText';
import { fonts } from '../../utils/typography';
import FormSection from './FormSection';
import { CrossIcon } from '../../assets/svgs/SvgsFile';


interface Attendee {
  id: string;
  name: string;
  phone: string;
  address: string;
  remarks?: string;
}

const AttendeesTab = ({attendees, setAttendees}: any) => {
  
  const MAX_ATTENDEES = 50;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const addAttendee = () => {
    if (!name.trim()) {
      return;
    }

    if (attendees.length >= MAX_ATTENDEES) {
      Alert.alert(
        'Limit Reached',
        'Maximum 50 attendees allowed',
      );
      return;
    }

    setAttendees((prev: any) => [
      ...prev,
      {
        id: Date.now().toString(),
        name,
        phone,
        address,
      },
    ]);

    setName('');
    setPhone('');
    setAddress('');
  };

  const removeAttendee = (id: string) => {
    setAttendees((prev: any[]) =>
      prev.filter(item => item.id !== id),
    );
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: Attendee;
    index: number;
  }) => (
    <View style={styles.row}>
      <View style={styles.indexBox}>
        <AppText
          family="InterSemiBold"
          size={12}
        >
          {index + 1}
        </AppText>
      </View>

      <View style={styles.details}>
        <AppText family="InterBold" size={13}>
          {item.name}
        </AppText>

        <AppText
          size={12}
          color="#1A3A6B"
          style={{ marginTop: 2 }}
        >
          {item.phone}
        </AppText>

        <AppText
          size={11}
          color="#667085"
          style={{ marginTop: 2 }}
        >
          {item.address}
        </AppText>
      </View>
    </View>
  );

  return (
    <View>
      {/* Header */}

      <View style={{ marginTop: -15 }} />
      {/* List */}
      <FormSection title="Manager Remarks" />
      <View style={styles.attendeesCard}>
        <View style={styles.attendeesHeader}>
          <Text style={styles.attendeesTitle}>
            04 Apr 2026
          </Text>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>{attendees?.length} Attendees</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flex: 1, }}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeadText, { width: 30 }]}>#</Text>
              <Text style={[styles.tableHeadText, { width: 110, }]}>NAME</Text>
              <Text style={[styles.tableHeadText, { width: 110, }]}>CONTACT</Text>
              <Text style={[styles.tableHeadText, { width: 130, }]}>ADDRESS</Text>
              <Text style={[styles.tableHeadText, { width: 30, }]}></Text>


            </View>
            {attendees?.length === 0 ? (
              <View
                style={{
                  padding: 30,
                  
                }}
              >
                <AppText color="rgba(0,0,0,0.5)">
                  No attendees added yet
                </AppText>
              </View>
            ) : (
              <>
                {attendees?.map((item: any, index: number) => (
                  <View
                    key={index}
                    style={styles.tableRow}
                  >
                    <Text style={[styles.tableValue, { width: 30 }]}>
                      {index + 1}
                    </Text>

                    <Text style={[styles.tableValueBold, { width: 110 }]}>
                      {item.name}
                    </Text>

                    <Text style={[styles.tableValueBold, { width: 110 }]}>
                      {item.phone}
                    </Text>

                    <Text style={[styles.tableValue, { width: 130 }]}>
                      {item.address}
                    </Text>
                    <Pressable style={{ width: 30, flex: 1, justifyContent: 'center', alignItems: 'center', }}
                      onPress={() =>
                        removeAttendee(item.id)
                      }>
                      <CrossIcon size={16} color={'rgba(0,0,0,0.5)'} />
                    </Pressable>
                  </View>
                ))}
              </>
            )}

          </View>
        </ScrollView>
      </View>

      {/* Add Attendee */}

      <View style={[styles.addCard, styles.row]}>
        <TextInput
          placeholder="Name"
          placeholderTextColor={'rgba(0,0,0,0.5)'}
          value={name}
          onChangeText={setName}
          style={[styles.input, { width: '25%' }]}
        />

        <TextInput
          placeholder="Contact"
          placeholderTextColor={'rgba(0,0,0,0.5)'}
          value={phone}
          keyboardType="phone-pad"
          onChangeText={setPhone}
          style={[styles.input, { width: '25%' }]}
        />

        <TextInput
          placeholder="Address"
          placeholderTextColor={'rgba(0,0,0,0.5)'}
          value={address}
          onChangeText={setAddress}
          style={[styles.input, { width: '25%' }]}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={addAttendee}
        >
          <AppText
            family="InterBold"
            color="#fff"
            size={12}
          >
            + Add
          </AppText>
        </TouchableOpacity>

        {/* <AppText
          size={11}
          color="#98A2B3"
          style={{ marginTop: 10 }}
        >
          {attendees.length} / 50 Attendees
        </AppText> */}
      </View>
      <View style={[styles.addCard2, styles.row, { justifyContent: 'space-between', }]}>
        <AppText
          family="InterBold"
          color="rgba(0,0,0,0.5)"
          size={12}
        >
          Max 50 attendees
        </AppText>
        <AppText
          family="InterBold"
          color="rgba(0,0,0,0.5)"
          size={12}
        >
          {attendees.length} / {MAX_ATTENDEES}
        </AppText>
      </View>
    </View>
  );
};

export default AttendeesTab;

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#EAF1FD',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  badge: {
    backgroundColor: '#1A3A6B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },

  row: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  indexBox: {
    width: 30,
    alignItems: 'center',
  },

  details: {
    flex: 1,
  },

  addCard: {
    backgroundColor: '#fff',
    padding: 16,
    gap: 7,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#E1E8F2',
  },
  addCard2: {
    backgroundColor: '#fff',
    padding: 16,
    gap: 7,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#E1E8F2',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },

  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 10,
    paddingHorizontal: 12,
    // marginBottom: 10,
    width: '20%',
    color: '#000',
    fontFamily: fonts.InterRegular,
    fontSize: 12
  },

  addButton: {
    height: 35,
    backgroundColor: '#1A3A6B',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: '20%',
  },
  attendeesCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    borderWidth: 0,
    marginTop: 5,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#E1E8F2',
  },

  attendeesHeader: {
    backgroundColor: '#eaf1fd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,

  },

  attendeesTitle: {
    color: '#1F447D',
    fontSize: 12,
    fontFamily: fonts.InterBold,
  },
  countBadge: {
    backgroundColor: '#1F447D',
    height: 24,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10
  },

  countText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts.InterBold,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f4fb',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  tableHeadText: {
    color: '#5a6880',
    fontSize: 12,
    fontFamily: fonts.InterBold,
  },

  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },

  tableValue: {
    color: '#1b1d24',
    fontSize: 12,
    fontFamily: fonts.InterMedium,
  },

  tableValueBold: {
    color: '#1b1d24',
    fontSize: 12,
    fontFamily: fonts.InterBold,
  },
});