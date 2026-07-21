import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { rw } from '../../utils/responsive';
import { fonts } from '../../utils/typography';
import { CalenderIcon } from '../../assets/svgs/SvgsFile';
import { LocationIcon } from '../../assets/svgs/HomePageSvgs';
import store from '../../components/redux/Store';
import { EditIcon } from '../../assets/svgs/PACSvg';
import { useFocusEffect } from '@react-navigation/native';

const discussionPoints = [
  'Focus on NPD Product',
  'Nishta Coupon to Dealer',
  'All manufacturing process in-house',
  'Range in ongoing',
];

const promotionalMaterials = [
  'Pen',
  'Snacks',
  'Playing Card',
];

const customerFeedback = [
  'Increase Nishta Point',
];

const SectionCard = ({
  title,
  data,
  circleColor,
}: any) => {
  return (
    <>
      <Text style={styles.sectionHeading}>
        {title}
      </Text>

      <View style={styles.card}>
        {data.map((item: string, index: number) => (
          <View
            key={index}
            style={[
              styles.row,
              index !== data.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: '#E5EAF1',
              },
            ]}
          >
            <View
              style={[
                styles.circle,
                { backgroundColor: circleColor },
              ]}
            >
              <Text style={styles.circleText}>
                {index + 1}
              </Text>
            </View>

            <Text style={styles.rowText}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
};

const PACDetails = ({ navigation, route }: any) => {
  const { itemId } = route.params;
  const [activityDetails, setActivityDetails] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchActivityDetails();
    }, []) 
  )


  const fetchActivityDetails = async () => {
    try {
      setLoading(true);

      const token =
        store.getState().auth?.token;

      const response = await fetch(
        `https://elofic.fieldkonnect.io/api/promotional-activities/${itemId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      const result = await response.json();

      if (result?.status) {
        const data = result?.data;

        setActivityDetails({
          ...data,

          discussionPoints:
            JSON.parse(
              data?.discussion_Points ||
              '[]',
            ),

          promotionalMaterials:
            JSON.parse(
              data?.material_and_Samples ||
              '[]',
            ),

          customerFeedback:
            JSON.parse(
              data?.feedback || '[]',
            ),
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white'
        }}
      >
        <ActivityIndicator
          size="large"
          color="#1F447D"
        />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1F447D"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Image
                  source={require('../../assets/images/Dummy/back.png')}
                  style={styles.image}
                  resizeMode="contain"
                />
              </Pressable>
              <Text style={styles.headerTitle}>
                Activity Detail
              </Text>

            </View>
          </View>

          <Text style={styles.activityTitle}>
            {activityDetails?.activity_type} - {activityDetails?.target_market}
          </Text>


          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <CalenderIcon size={14} color="#abb6c9" />
              <Text style={[styles.locationText, { paddingLeft: 8 }]}>
                {new Date(
                  activityDetails?.activity_date,
                ).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>

            <Text style={styles.separator}>•</Text>

            <View style={styles.infoItem}>
              <LocationIcon size={16} color="#abb6c9" />
              <Text style={styles.locationText}>
                {activityDetails?.target_market}
              </Text>
            </View>
          </View>
          <View style={styles.tagRow}>
            <View style={styles.blueTag}>
              <Text style={styles.blueTagText}>
                {activityDetails?.activity_type ||
                  'Activity'}
              </Text>
            </View>

            <View style={styles.orangeTag}>
              <Text style={styles.orangeTagText}>
                {activityDetails?.product_category}
              </Text>
            </View>

            <View style={styles.approvedTag}>
              <Text style={styles.approvedTagText}>
                ✓ Approved by{' '}{activityDetails?.activity_approved_by_name}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.bigNumber}>{activityDetails?.total_participants}</Text>
            <Text style={styles.statLabel}>
              {activityDetails?.customer_type}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statTitle}>
              {activityDetails?.retailer_name}
            </Text>
            <Text style={styles.statLabel}>
              CUSTOMER
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statTitle}>
              {activityDetails?.distributor_name}
            </Text>
            <Text style={styles.statLabel}>
              DISTRIBUTOR
            </Text>
          </View>
        </View>

        {/* Discussion */}

        <SectionCard
          title="DISCUSSION POINTS"
          data={activityDetails?.discussionPoints ||
            []
          }
          circleColor="#EAF0FB"
        />

        {/* Promotional */}

        <SectionCard
          title="PROMOTIONAL MATERIALS"
          data={activityDetails?.promotionalMaterials ||
            []}
          circleColor="#FFF2E1"
        />

        {/* Feedback */}

        <SectionCard
          title="CUSTOMER FEEDBACK & QUERIES"
          data={activityDetails?.customerFeedback ||
            []}
          circleColor="#E8F6EE"
        />

        {/* Order Summary */}

        <Text style={styles.sectionHeading}>
          ORDER SUMMARY
        </Text>

        <View style={styles.orderCard}>
          <View style={styles.orderTopRow}>
            <View style={styles.orderBox}>
              <Text style={styles.orderLabel}>
                Total Qty
              </Text>

              <Text style={styles.orderValue}>
                {activityDetails?.total_order_qty}
              </Text>
            </View>

            <View style={styles.orderBox}>
              <Text style={styles.orderLabel}>
                Order Amount
              </Text>

              <Text style={styles.orderAmount}>
                ₹{Number(
                  activityDetails?.total_order_amount ||
                  0,
                ).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          <View style={[styles.confirmedContainer, { borderTopWidth: 1, borderTopColor: '#E5EAF1', paddingTop: 10 }]}>
            <Text style={styles.confirmedLabel}>
              Confirmed By
            </Text>

            <Text style={styles.confirmedName}>
              {activityDetails?.order_confirm_by}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>
          ATTENDEES
        </Text>

        <View style={styles.attendeesCard}>
          <View style={styles.attendeesHeader}>
            <Text style={styles.attendeesTitle}>
              Activity Attendees List
            </Text>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>{
                activityDetails?.attendees
                  ?.length || 0
              }</Text>
            </View>
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeadText, { flex: 0.4 }]}>#</Text>
            <Text style={[styles.tableHeadText, { flex: 1.3 }]}>NAME</Text>
            <Text style={[styles.tableHeadText, { flex: 1.5 }]}>CONTACT</Text>
            <Text style={[styles.tableHeadText, { flex: 1.5 }]}>ADDRESS</Text>
          </View>

          {activityDetails?.attendees?.map(
            (item: any, index: number) => (
              <View
                key={index}
                style={styles.tableRow}
              >
                <Text style={[styles.tableValue, { flex: 0.4 }]}>
                  {index + 1}
                </Text>

                <Text style={[styles.tableValueBold, { flex: 1.3 }]}>
                  {item.person_name}
                </Text>

                <Text style={[styles.tableValueBold, { flex: 1.5 }]}>
                  {item.contact_no}
                </Text>

                <Text style={[styles.tableValue, { flex: 1.5 }]}>
                  {item.address}
                </Text>
              </View>
            ))}
        </View>

        {/* Manager Remark */}
        <Text style={styles.sectionHeading}>
          MANAGER'S REMARK
        </Text>

        <View style={styles.remarkCard}>
          <View style={styles.remarkHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>M</Text>
            </View>

            <Text style={styles.managerName}>
              Manager
            </Text>
          </View>

          <View style={styles.remarkDivider} />

          <Text style={styles.remarkText}>
            {activityDetails?.managers_remarks}
          </Text>
        </View>
      </ScrollView>
      <Pressable
        style={styles.floatingButton}
        onPress={() =>
          navigation.navigate('CreatePac', {
            isEdit: true,
            activityData: activityDetails,
          })
        }
      >
        <EditIcon color={'white'} />
        <Text style={styles.floatingButtonText}>
          Edit Activity
        </Text>
      </Pressable>
    </View>
  );
};



export default PACDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4fb',
  },

  header: {
    backgroundColor: '#1a3a6c',
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 25,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    justifyContent: 'space-between',
  },


  headerTitle: {
    color: '#fff',
    fontSize: 16,
    paddingLeft: 15,
    fontFamily: fonts?.InterBold
  },

  submittedBadge: {
    backgroundColor: '#e6f8ee',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },

  submittedText: {
    color: '#2c8151',
    fontSize: 12,
    fontFamily: fonts?.InterBold
  },

  activityTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: fonts?.InterBold,
    marginTop: 10,
    textTransform: 'capitalize'
  },

  locationText: {
    color: '#b0bacc',
    fontSize: 13,
    paddingLeft: 6,
    fontFamily: fonts?.InterRegular,
    textTransform: 'capitalize',
    overflow: 'visible',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
  },

  infoItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoIcon: {
    width: 18,
    height: 18,
    tintColor: '#CDD5E4', // remove if icon already has desired color
  },


  separator: {
    color: '#CDD5E4',
    fontSize: 18,
    marginHorizontal: 10,
  },

  tagRow: {
    flexDirection: 'row',
    // marginTop: 12,
    flexWrap: 'wrap',
  },

  blueTag: {
    backgroundColor: '#455e86',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 25,
    marginRight: 10,
    marginTop: 10
  },

  blueTagText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts?.InterBold,
  },

  orangeTag: {
    backgroundColor: '#e8502a',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 25,
    marginRight: 10,
    marginTop: 10
  },

  orangeTagText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts?.InterBold,
  },

  approvedTag: {
    backgroundColor: '#e6f8ee',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 25,
    marginTop: 10
  },

  approvedTagText: {
    color: '#247d4d',
    fontSize: 12,
    fontFamily: fonts?.InterBold,
  },

  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
  },

  statItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5EAF1',
  },

  bigNumber: {
    fontSize: 18,
    fontFamily: fonts?.InterBold,
    color: '#1a3a6c',
  },

  statTitle: {
    textAlign: 'center',
    fontSize: 15,
    fontFamily: fonts?.InterBold,
    color: '#1a3a6c',
    marginHorizontal: 8
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: rw(18),
    height: rw(18),
  },
  statLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#9aabbe',
    fontFamily: fonts?.InterBold,
  },

  sectionHeading: {
    marginHorizontal: 16,
    marginTop: 15,
    marginBottom: 10,
    color: '#9aabbe',
    fontFamily: fonts.InterBold,
    fontSize: 12,
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10
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

  rowText: {
    marginLeft: 16,
    fontSize: 13,
    fontFamily: fonts?.InterBold,
    color: '#20232D',
    flex: 1,

  },

  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F447D',
    borderRadius: 40,
    paddingHorizontal: 14,
    paddingLeft: 16,
    height: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,

    elevation: 12,
  },

  floatingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.InterBold,
    marginLeft: 10,
  },

  editIcon: {
    width: 22,
    height: 22,
    tintColor: '#fff',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 16,
    overflow: 'hidden',
  },

  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },

  orderBox: {
    width: '48%',
    backgroundColor: '#f0f4fb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E1E8F2',
  },

  orderLabel: {
    color: '#5f6c84',
    fontSize: 12,
    fontFamily: fonts.InterBold,
  },

  orderValue: {
    color: '#111827',
    fontSize: 22,
    fontFamily: fonts.InterBold,
  },

  orderAmount: {
    color: '#1F447D',
    fontSize: 22,
    fontFamily: fonts.InterBold,
  },

  confirmedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },

  confirmedLabel: {
    color: '#647187',
    fontSize: 12,
    fontFamily: fonts.InterBold,
  },

  confirmedName: {
    color: '#1e7a49',
    fontSize: 12,
    marginLeft: 40,
    fontFamily: fonts.InterBold,
  },

  attendeesCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
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
    width: 38,
    height: 24,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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

  remarkCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },

  remarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  avatar: {
    width: 28,
    height: 28,
    borderRadius: 28,
    backgroundColor: '#1F447D',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: fonts.InterBold,
  },

  managerName: {
    marginLeft: 12,
    color: '#5a6880',
    fontSize: 13,
    fontFamily: fonts.InterBold,
  },

  remarkDivider: {
    height: 1,
    backgroundColor: '#E5EAF1',
  },

  remarkText: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#5a6880',
    fontFamily: fonts.InterBold,
  },
});