import { View, Pressable, Image } from 'react-native'
import React, { } from 'react'
import { styles } from './styles'
import { BasicBoxIcon, HeadSetIcon } from '../../assets/svgs/ComplaintSvgs'
import AppText from '../../components/AppText/AppText'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import FastImage from 'react-native-fast-image'
import { BASE_URL } from '../../api/AxiosClient'

const ComplaintDetails = ({ navigation, route }: any) => {
  const data = route?.params?.item?.rawData
  console.log(route?.params, 'reasdfasfd')
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
          <AppText style={{ flex: 1 }} size={16} color='white' family='InterBold'>{route?.params?.item?.rawData?.part_number}</AppText>
          <AppText style={{ flex: 1, opacity: 0.7 }} size={12} color='white' family='InterBold'>Complaint Detail</AppText>
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
            <View style={[styles.row, styles.firstrowView]}>
              <View style={styles.firstItem}>
                <AppText size={11} transform='uppercase' family='InterMedium' color='rgba(0,0,0,0.5)'>Complaint No</AppText>
                <AppText size={13} family='InterBold' color='black'>{data?.id}</AppText>
              </View>
              <View style={styles.firstItem}>
                <AppText size={11} transform='uppercase' family='InterMedium' color='rgba(0,0,0,0.5)'>Part Number</AppText>
                <AppText size={13} family='InterBold' color='black'>{data?.part_number}</AppText>
              </View>
            </View>
            <View style={[styles.row, styles.firstrowView]}>
              <View style={styles.firstItem}>
                <AppText size={11} transform='uppercase' family='InterMedium' color='rgba(0,0,0,0.5)'>Batch Code</AppText>
                <AppText size={13} family='InterBold' color='black'>{data?.batch_code}</AppText>
              </View>
              <View style={styles.firstItem}>
                <AppText size={11} transform='uppercase' family='InterMedium' color='rgba(0,0,0,0.5)'>Complaint Date</AppText>
                <AppText size={13} family='InterBold' color='black'>{data?.complaint_date}</AppText>
              </View>
            </View>
            <View style={[styles.row, styles.firstrowView]}>
              <View style={styles.firstItem}>
                <AppText size={11} transform='uppercase' family='InterMedium' color='rgba(0,0,0,0.5)'>Complaint Type</AppText>
                <AppText size={13} family='InterBold' color='black'>{data?.complaint_type_details?.name}</AppText>
              </View>
            </View>
            <View style={[styles.row, styles.firstrowView]}>
              <View style={styles.firstItem}>
                <AppText size={11} transform='uppercase' family='InterMedium' color='rgba(0,0,0,0.5)'>Distributor</AppText>
                <AppText size={13} family='InterBold' color='black'>{data?.distributor?.trade_name}</AppText>
              </View>
            </View>

          </View>
        </View>
        <View style={[styles.basicDetailsview, { marginTop: 22 }]}>
          <View style={[styles.heading, styles.row]}>
            <View style={styles.box}>
              <BasicBoxIcon />
            </View>
            <AppText size={16} color='white' family='InterBold'>1 · Customer Details</AppText>
          </View>
          <View style={styles.innerView}>
            <View style={[styles.row, styles.firstrowView]}>
              <View style={styles.firstItem}>
                <AppText size={11} transform='uppercase' family='InterMedium' color='rgba(0,0,0,0.5)'>Name</AppText>
                <AppText size={13} family='InterBold' color='black'>{data?.customer?.customer_name}</AppText>
              </View>
              <View style={styles.firstItem}>
                <AppText size={11} transform='uppercase' family='InterMedium' color='rgba(0,0,0,0.5)'>Contact</AppText>
                <AppText size={13} family='InterBold' color='black'>{data?.customer?.customer_number}</AppText>
              </View>
            </View>
            <View style={[styles.row, styles.firstrowView]}>
              <View style={styles.firstItem}>
                <AppText size={11} transform='uppercase' family='InterMedium' color='rgba(0,0,0,0.5)'>Email</AppText>
                <AppText size={13} family='InterBold' color='black'>{data?.customer?.customer_email}</AppText>
              </View>
            </View>
            <View style={[styles.row, styles.firstrowView]}>
              <View style={styles.firstItem}>
                <AppText size={11} transform='uppercase' family='InterMedium' color='rgba(0,0,0,0.5)'>State</AppText>
                <AppText size={13} family='InterBold' color='black'>{data?.customer?.customer_name}</AppText>
              </View>
              <View style={styles.firstItem}>
                <AppText size={11} transform='uppercase' family='InterMedium' color='rgba(0,0,0,0.5)'>District</AppText>
                <AppText size={13} family='InterBold' color='black'>{data?.customer?.customer_number}</AppText>
              </View>
            </View>
            <View style={[styles.row, styles.firstrowView]}>
              <View style={styles.firstItem}>
                <AppText size={11} transform='uppercase' family='InterMedium' color='rgba(0,0,0,0.5)'>City</AppText>
                <AppText size={13} family='InterBold' color='black'>{data?.customer?.customer_name}</AppText>
              </View>
              <View style={styles.firstItem}>
                <AppText size={11} transform='uppercase' family='InterMedium' color='rgba(0,0,0,0.5)'>Pincode</AppText>
                <AppText size={13} family='InterBold' color='black'>{data?.customer?.customer_number}</AppText>
              </View>
            </View>
            <View style={[styles.row, styles.firstrowView]}>
              <View style={styles.firstItem}>
                <AppText size={11} transform='uppercase' family='InterMedium' color='rgba(0,0,0,0.5)'>Address</AppText>
                <AppText size={13} family='InterBold' color='black'>{data?.customer?.customer_address}</AppText>
              </View>

            </View>


          </View>
        </View>
        <View style={[styles.basicDetailsview, { marginTop: 22 }]}>
          <View style={[styles.heading, styles.row]}>
            <View style={styles.box}>
              <BasicBoxIcon />
            </View>
            <AppText size={16} color='white' family='InterBold'>1 · Complaint Details</AppText>
          </View>
          <View style={styles.innerView}>
            <View style={[styles.row, styles.firstrowView]}>
              <View style={styles.firstItem}>
                <AppText size={11} transform='uppercase' family='InterMedium' color='rgba(0,0,0,0.5)'>Description</AppText>
                <AppText size={13} family='InterBold' color='black'>{data?.description}</AppText>
              </View>
            </View>
            <View style={[styles.row, styles.firstrowView]}>
              <View style={styles.firstItem}>
                <AppText size={11} transform='uppercase' family='InterMedium' color='rgba(0,0,0,0.5)'>Status</AppText>
                <AppText size={13} family='InterBold' color='black'>{data?.complaint_status == 1 && "Pending" || data?.complaint_status == 4 && "Closed" || data?.complaint_status == 5 && "Rejected"}</AppText>
              </View>
            </View>
            {
              data.attachment_file && (
                <View style={[styles.row, styles.firstrowView]}>
                  <View style={styles.firstItem}>
                    <AppText size={11} transform='uppercase' family='InterMedium' color='rgba(0,0,0,0.5)'>Attachment</AppText>
                    <FastImage
                      source={{
                        uri: BASE_URL + "public/storage/" + data.attachment_file,
                      }}
                      style={{
                        width: '100%',
                        height: 220,
                        marginTop: 10,
                        borderRadius: 12,
                        overflow: 'hidden',
                      }}
                      resizeMode="cover"
                    />
                  </View>
                </View>
              )
            }

          </View>
        </View>
        <View style={{ height: 50 }} />
      </KeyboardAwareScrollView>
    </View>
  )
}

export default ComplaintDetails