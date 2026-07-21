import { View, Text, ScrollView, FlatList, Pressable } from 'react-native'
import React, { useEffect } from 'react'
import { styles } from './styles';
import AppText from '../../components/AppText/AppText';
import { colors } from '../../utils/Colors';
import { useGetUserActivity } from '../../api/query/CustomerApi';
import ActivityCard from '../../components/atoms/ActivityCard';
import UserActivityCard from '../../components/atoms/UserActivityCard';
import Toast from 'react-native-toast-message';

const IndividualPage = ({ navigation, route }: any) => {
  const routeItem = route?.params?.item;
  const [activityTimeline, setActivityTimeline] = React.useState<any[]>([]);
  const [activityLoading, setActivityLoading] = React.useState<boolean>(false);

  const { mutateAsync: muatetGetUserActivity } = useGetUserActivity()

  useEffect(() => {
    handleUserActivity()
  }, [])

  const formatDateToApi = (dateString: string) => {
    if (!dateString) return '';

    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  };

  const handleUserActivity = async () => {
    setActivityLoading(true);
    try {
      const payload = {
        user_id: routeItem?.user_id,
        date: formatDateToApi(routeItem?.date),
      }
      const res: any = await muatetGetUserActivity(payload)

      if (res?.data?.status === true || res?.data?.status == "success") {
        console.log(res?.data, 'res?.datares?.data');

        setActivityTimeline(res?.data?.data)

      }
    } catch (error: any) {
      console.log('Check-in/out error:', error?.response)
      Toast.show({
        type: 'error',
        text1: error?.response?.message || 'Failed',
      })
    } finally {
      setActivityLoading(false)
    }
  }
  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1, marginTop: 20, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <View style={{}}>
          <AppText size={17} color={colors.blue} family='InterBold'>{routeItem?.name} - {routeItem?.date}</AppText>
          <View style={[styles.graphView]}>
            <FlatList
              data={activityTimeline}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <UserActivityCard index={index} todayPunchInData={undefined} item={item} navigation={navigation} />
              )}
            />
          </View>

        </View>
        <View style={{height: 70}} />
      </ScrollView>
    </View>
  )
}

export default IndividualPage