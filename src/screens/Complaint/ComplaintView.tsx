import { View, Text, StyleSheet, Platform, AppRegistry, Pressable } from 'react-native'
import React, { memo } from 'react'
import { shadowStyle } from '../../utils/typography';
import { center } from '@shopify/react-native-skia';
import AppText from '../../components/AppText/AppText';
import { colors } from '../../utils/Colors';
import { BoxIcon } from '../../assets/svgs/ComplaintSvgs';
import { LocationIcon, PhoneICon } from '../../assets/svgs/HomePageSvgs';
import { CalenderIcon, EyeIcon, LOcationIcon } from '../../assets/svgs/SvgsFile';

const ComplaintView = ({ item, index, navigation }: { item: any, index: number, navigation: any }) => {
  return (
    <Pressable style={[styles.mainContainer, item?.status == "Pending" && { borderLeftColor: "#cf9744" }, item?.status == "Closed" && { borderLeftColor: "#2aae2a" }]} onPress={()=>{
      navigation.navigate('ComplaintDetails', {item})
    }}>
      <View style={styles.upperData}>
        <View style={[styles.row, styles.nameView]}>
          <View style={[styles.nameFirst, styles.center]}>
            <AppText color={colors.blue} size={15} family='InterBold'>RK</AppText>
          </View>
          <View style={{ flex: 1, paddingHorizontal: 12 }}>
            <AppText color={colors.black} size={15} family='InterBold'>{item?.name}</AppText>
            <AppText color={colors.blue} size={10} family='InterSemiBold'>{item?.custId}</AppText>
          </View>
          {
            item?.status == "Pending" && (
              <View style={[styles.statusView, { backgroundColor: "#f8f3e8", borderColor: "#c28933" }]}>
                <AppText color='#c28933' size={12} family='InterBold'>
                  <AppText color='#c28933' size={8} family='InterBold'>⏳</AppText>{' '}{item?.status}</AppText>
              </View>
            )
          }
          {
            item?.status == "Closed" && (
              <View style={[styles.statusView, { backgroundColor: "#eaefea", borderColor: "#2aae2a" }]}>
                <AppText color='#2aae2a' size={12} family='InterBold'>
                  <AppText color='#2aae2a' size={10} family='InterBold'>✓</AppText>{' '}{item?.status}</AppText>
              </View>
            )
          }
        </View>
        <View style={[styles.detailsView, styles.row]}>
          <View style={[styles.row, styles.oneView]}>
            <BoxIcon size={14} color={colors.blue} />
            <AppText size={10} color={'rgba(0,0,0,0.6)'} family='InterBold'>{item?.complainNo}</AppText>
          </View>
          <View style={[styles.row, styles.oneView]}>
            <PhoneICon color={colors.blue} />
            <AppText size={10} color={'rgba(0,0,0,0.6)'} family='InterBold'>{item?.mobile}</AppText>
          </View>
        </View>
        <View style={[styles.detailsView, styles.row]}>
          <View style={[styles.row, styles.oneView]}>
            <LocationIcon size={14} color={colors.blue} />
            <AppText style={{marginRight: 20}} numLines={1} size={10} color={'rgba(0,0,0,0.6)'} family='InterBold'>{item?.location}</AppText>
          </View>
          <View style={[styles.row, styles.oneView]}>
            <CalenderIcon size={14} color={colors.blue} />
            <AppText size={10} style={{ left: 7 }} color={'rgba(0,0,0,0.6)'} family='InterBold'>{item?.date}</AppText>
          </View>
        </View>
      </View>
      <View style={styles.bottomView}>
        <Pressable style={[styles.complaintDetails, styles.center, styles.row]}>
          <EyeIcon color={'#2aae2a'} />
          <AppText size={13} family='InterBold' color='#2aae2a'>View Complaint Details</AppText>
        </Pressable>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'white',
    borderLeftWidth: 3,
    marginBottom: 12,
    shadowOffset: { width: 4, height: 5 },
    shadowColor: Platform.OS == "ios" ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.5)',
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 8,
    borderRadius: 14
    // paddingVertical: 10
  },
  upperData: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 1
  },
  row: {
    flexDirection: "row",
    alignItems: "center"
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameView: {
    marginBottom: 14,
  },
  nameFirst: {
    height: 40,
    width: 40,
    borderRadius: 12,
    backgroundColor: "#e0e4f3"
  },
  statusView: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    alignSelf: "flex-start",
    borderWidth: 1
  },
  detailsView: {

    width: "100%"
  },
  oneView: {
    gap: 10,
    width: "48%",
    marginRight: 10,
    marginTop: 6
  },
  bottomView: {
    marginTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 14
  },
  complaintDetails:{
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2aae2a",
    backgroundColor: "#eaefea",
    gap: 10
  },
});

export default memo(ComplaintView)