import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import {
  NavigationProp,
  ParamListBase,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AppText from '../../components/AppText/AppText';
import {colors} from '../../utils/Colors';
import {
  AppNotification,
  getNotifications,
  markNotificationRead,
} from '../../api/query/NotificationApi';

const formatDate = (value: string) =>
  new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const Notifications = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [readingId, setReadingId] = useState<number | null>(null);

  const loadNotifications = useCallback(async (requestedPage = 1) => {
    const result = await getNotifications(requestedPage);
    setItems(current =>
      requestedPage === 1 ? result.data : [...current, ...result.data],
    );
    setPage(result.current_page);
    setLastPage(result.last_page);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadNotifications(1)
        .catch(() => setItems([]))
        .finally(() => setLoading(false));
    }, [loadNotifications]),
  );

  const refresh = async () => {
    setRefreshing(true);
    try {
      await loadNotifications(1);
    } catch {
      // Preserve the existing list when a refresh request fails.
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || page >= lastPage) {
      return;
    }
    setLoadingMore(true);
    try {
      await loadNotifications(page + 1);
    } catch {
      // The user can retry loading the next page by scrolling again.
    } finally {
      setLoadingMore(false);
    }
  };

  const navigateFromNotification = (notification: AppNotification) => {
    if (!notification.model || notification.model_id == null) {
      navigation.navigate('BottomTab');
      return;
    }

    const model = notification.model.trim().toLowerCase();
    const modelId = notification.model_id;

    switch (model) {
      case 'pac':
      case 'pac_management':
        navigation.navigate('PACDetails', {itemId: modelId});
        return;
      case 'order':
      case 'order_history':
        navigation.navigate('OrderHistoryDetailsScreen', {orderId: modelId});
        return;
      case 'expense':
      case 'expense_management':
        navigation.navigate('ExpenseReport', {expenseId: modelId});
        return;
      case 'attendance':
        navigation.navigate('AttendanceReport', {attendanceId: modelId});
        return;
      case 'tour':
      case 'tour_plan':
        navigation.navigate('TourPlanPage', {tourId: modelId});
        return;
      case 'complaint':
        navigation.navigate('Complaint', {complaintId: modelId});
        return;
      case 'customer':
      case 'distributor':
      case 'secondary_customer':
        navigation.navigate('CustomerList', {customerId: modelId});
        return;
      default:
        // Lead, task, opportunity and unknown models do not currently have
        // matching detail screens in this mobile app.
        navigation.navigate('BottomTab');
    }
  };

  const handleNotificationPress = async (notification: AppNotification) => {
    if (readingId !== null) {
      return;
    }

    if (!notification.read) {
      setReadingId(notification.id);
      try {
        await markNotificationRead(notification.id);
        setItems(current =>
          current.map(item =>
            item.id === notification.id ? {...item, read: true} : item,
          ),
        );
      } catch {
        // Navigation remains available even if marking the item read fails.
      } finally {
        setReadingId(null);
      }
    }

    navigateFromNotification(notification);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.blue} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={items}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={[
          styles.content,
          items.length === 0 && styles.emptyContent,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.center}>
            <AppText size={17} family="InterSemiBold" color={colors.blue}>
              No notifications yet
            </AppText>
            <AppText size={13} family="InterRegular" color="#707070">
              New updates will appear here.
            </AppText>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={colors.blue} style={styles.footer} />
          ) : null
        }
        renderItem={({item}) => (
          <Pressable
            onPress={() => handleNotificationPress(item)}
            style={[styles.card, !item.read && styles.unreadCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.titleRow}>
                {!item.read && <View style={styles.unreadDot} />}
                <AppText
                  size={15}
                  family={item.read ? 'InterMedium' : 'InterBold'}
                  color="#202020"
                  numLines={1}
                  style={styles.title}>
                  {item.type || 'FieldKonnect'}
                </AppText>
              </View>
              {readingId === item.id && (
                <ActivityIndicator size="small" color={colors.blue} />
              )}
            </View>
            <AppText
              size={14}
              family="InterRegular"
              color="#4F4F4F"
              lineHeight={20}>
              {item.data}
            </AppText>
            <AppText
              size={11}
              family="InterRegular"
              color="#8A8A8A"
              style={styles.date}>
              {formatDate(item.created_at)}
            </AppText>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgColor,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  emptyContent: {
    flexGrow: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.bgColor,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E7E7',
  },
  unreadCard: {
    backgroundColor: '#F2F5FF',
    borderColor: '#C9D3F2',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.blue,
    marginRight: 8,
  },
  date: {
    marginTop: 10,
  },
  footer: {
    paddingVertical: 16,
  },
});

export default Notifications;
