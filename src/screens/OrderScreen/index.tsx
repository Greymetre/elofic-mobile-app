import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ArrowDownIcon, CalenderIcon, PlusAddIcon } from '../../assets/svgs/SvgsFile';
import { colors } from '../../utils/Colors';
import { styles } from './styles';
import AppText from '../../components/AppText/AppText';
import { rw } from '../../utils/responsive';
import { shadowStyle } from '../../utils/typography';
import store from '../../components/redux/Store';
import Toast from 'react-native-toast-message';
import { Dropdown } from 'react-native-element-dropdown';
import CustomerCalendar from '../../components/CustomCalendar/CalendarPopupView';
import { orderStatusLabel } from '../../utils/orderUtils';

interface DropdownUser {
    label: string;
    value: number | string;
}

const orderStatusOptions = [
    { label: 'All Orders', value: null },
    { label: 'Pending', value: 0 },
    { label: 'Partially Dispatched', value: 2 },
    { label: 'Dispatched', value: 1 },
];

type OrderListProps = {
    navigation: any
}
const OrderList = ({ navigation }: OrderListProps) => {
    const [users, setUsers] = useState<DropdownUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
    const [usersSelect, setUsersSelect] = useState<DropdownUser[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | string | null>(null);
    const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);
    const [orderList, setOrderList] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [showCal, setShowCal] = useState(false);

    const [rangeType, setRange] = useState('currentMonth');

    const [startDate, setStartDate] = useState<any>(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        return start;
    });

    const [endDate, setEndDate] = useState<any>(() => {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return end;
    });

    const handleApply = (start: Date | null, end: Date | null, type: string) => {
        if (!start || !end) {
            Alert.alert("Invalid range", "Please select both start and end dates.");
            return;
        }

        const normalizedStart = new Date(start);
        normalizedStart.setHours(0, 0, 0, 0);

        const normalizedEnd = new Date(end);
        normalizedEnd.setHours(23, 59, 59, 999);

        setStartDate(normalizedStart);
        setEndDate(normalizedEnd);
        setRange(type || 'custom');

        setShowCal(false);
        fetchOrderList(selectedUserId, normalizedStart, normalizedEnd, selectedStatusId);

    };




    useEffect(() => {
        fetchOrderList(null, startDate, endDate, null);
    }, []);

    const formatYYYYMMDD = (date: any): string => {
        if (!date) return '';

        const d = new Date(date);

        if (isNaN(d.getTime())) return '';

        // Use LOCAL year, month, day — ignore timezone / UTC completely
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); // 01 to 12
        const day = String(d.getDate()).padStart(2, '0');     // 01 to 31

        return `${year}-${month}-${day}`;
    };

    const fetchOrderList = async (
        userId?: number | string | null,
        start?: Date,
        end?: Date,
        statusId?: number | null,
    ) => {
        const token = store.getState().auth?.token;

        if (!token) {
            Toast.show({ type: 'error', text1: 'Token not found' });
            return;
        }

        setLoadingOrders(true);

        try {
            const params = new URLSearchParams();

            if (userId) params.append("user_id", String(userId));
            if (start) params.append("startdate", formatYYYYMMDD(start));
            if (end) params.append("enddate", formatYYYYMMDD(end));
            if (statusId !== null && statusId !== undefined) params.append("status_id", String(statusId));

            const url = `https://elofic.fieldkonnect.io/api/getOrderList?${params.toString()}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await response.json();

            console.log("Order List Response", json);

            if (json?.status) {

                // Order list
                setOrderList(json?.data || []);
                console.log(json.users, 'json.usersjson.users')
                // 👇 Users list from same API
                if (json?.users && Array.isArray(json.users)) {

                    const dropdownUsers = json.users.map((u: any) => ({
                        label: u.name,
                        value: u.id
                    }));
                    console.log(dropdownUsers, 'dropdownUsers')
                    setUsersSelect(dropdownUsers);
                }

            } else {
                Toast.show({
                    type: "error",
                    text1: json?.message || "Failed to load orders",
                });
            }
        } catch (error) {
            console.log("Order list error", error);
        } finally {
            setLoadingOrders(false);
        }
    };
    const renderItem: any = useCallback((item: any) => {
        const items = item?.item
        return (
            <Pressable style={[styles.listItem, shadowStyle]} onPress={() => navigation.navigate("OrderHistoryDetailsScreen", {
                orderId: items?.order_id,
            })}>
                <View style={[styles.row]}>
                    <View style={{ gap: 3 }}>
                        <AppText color='black' family='InterMedium' size={14} opacity={0.8}>Customer Type</AppText>
                        <AppText color='black' family='InterBold' size={14}>{items?.customer_type || '-'}</AppText>
                    </View>
                </View>

                <View style={[styles.row, styles.detailsRow]}>
                    <View style={styles.detailsFirstRow}>
                        <AppText color='black' family='InterMedium' size={14} opacity={0.8}>Buyer</AppText>
                        <View style={{ height: 5 }} />
                        <AppText color='black' family='InterBold' size={14}>{items?.buyer_name || '-'}</AppText>
                    </View>
                    <View style={styles.detailsSecondRow}>
                        <AppText color='black' family='InterMedium' size={14} opacity={0.8}>Seller / Parent</AppText>
                        <View style={{ height: 5 }} />
                        <AppText color='black' family='InterBold' size={14}>{items?.seller_name || '-'}</AppText>
                    </View>
                </View>

                <View style={[styles.row, styles.detailsRow]}>
                    <View style={styles.detailsFirstRow}>
                        <AppText color='black' family='InterMedium' size={14} opacity={0.8}>Order Number</AppText>
                        <View style={{ height: 5 }} />
                        <AppText color='black' family='InterBold' size={14}>{items?.orderno || items?.order_id}</AppText>
                    </View>
                    <View style={styles.detailsSecondRow}>
                        <AppText color='black' family='InterMedium' size={14} opacity={0.8}>Order Date</AppText>
                        <View style={{ height: 5 }} />
                        <AppText color='black' family='InterBold' size={14}>{items?.order_date}</AppText>
                    </View>
                </View>
                <View style={[styles.row, styles.detailsRow]}>
                    <View style={styles.detailsFirstRow}>
                        <AppText color='black' family='InterMedium' size={14} opacity={0.8}>Quantity</AppText>
                        <View style={{ height: 5 }} />
                        <AppText color='black' family='InterBold' size={14}>{items?.total_qty}</AppText>
                    </View>
                    <View style={styles.detailsSecondRow}>
                        <AppText color='black' family='InterMedium' size={14} opacity={0.8}>Amount</AppText>
                        <View style={{ height: 5 }} />
                        <AppText color='black' family='InterBold' size={14}>{items?.grand_total}</AppText>
                    </View>
                </View>
                <View style={styles.line} />
                <View style={[styles.row, styles.detailsRow]}>
                    <View style={styles.detailsFirstRow}>
                        <AppText color='black' family='InterMedium' size={14} opacity={0.8}>Status</AppText>
                        <View style={{ height: 5 }} />
                        <AppText color={colors.blue} family='InterBold' size={14}>{orderStatusLabel(items)}</AppText>
                    </View>
                </View>
                <View style={[styles.row, styles.detailsRow]}>
                    <View style={[styles.detailsFirstRow, {paddingRight: 20}]}>
                        <AppText color='black' family='InterMedium' size={14} opacity={0.8}>Order Remark</AppText>
                        <View style={{ height: 5 }} />
                        <AppText color='black' numLines={1} family='InterSemiBold' size={14}>{items?.order_remark}</AppText>
                    </View>
                    <View style={styles.detailsSecondRow}>
                        <AppText color='black' family='InterMedium' size={14} opacity={0.8}>Created By</AppText>
                        <View style={{ height: 5 }} />
                        <AppText color='black' family='InterBold' size={14}>{items?.creatd_by}</AppText>
                    </View>
                </View>
            </Pressable>
        )
    }, [orderList])

    return (
        <View style={styles.container}>
            <ScrollView style={[styles.container, { paddingHorizontal: rw(18) }]} >
                <View style={{ marginTop: 20 }}>
                    <Dropdown
                        style={styles.selectUser}
                        placeholderStyle={{ color: '#718096', fontSize: 14 }}
                        selectedTextStyle={{ color: colors.black, fontSize: 14 }}
                        inputSearchStyle={{ height: 40, fontSize: 14 }}
                        data={usersSelect}
                        search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder="Select User"
                        searchPlaceholder="Search user..."
                        value={selectedUserId}           // ← null = shows placeholder
                        onChange={(item) => {
                            setSelectedUserId(item.value);
                            fetchOrderList(item.value, startDate, endDate, selectedStatusId);

                        }}
                        renderRightIcon={() => <ArrowDownIcon />}
                    />

                </View>
                <View style={{ marginTop: 10 }}>
                    <Dropdown
                        style={styles.selectUser}
                        placeholderStyle={{ color: '#718096', fontSize: 14 }}
                        selectedTextStyle={{ color: colors.black, fontSize: 14 }}
                        data={orderStatusOptions}
                        labelField="label"
                        valueField="value"
                        placeholder="Filter by Status"
                        value={selectedStatusId}
                        onChange={(item) => {
                            setSelectedStatusId(item.value);
                            fetchOrderList(selectedUserId, startDate, endDate, item.value);
                        }}
                        renderRightIcon={() => <ArrowDownIcon />}
                    />
                </View>
                <Pressable style={[styles.dateTimeBox, styles.row, { justifyContent: 'space-between' }]} onPress={() => setShowCal(true)}>
                    <View style={{ justifyContent: 'center' }}>
                        {
                            (startDate && endDate) ? (
                                <AppText size={12} color="black" family="InterRegular">
                                    {formatYYYYMMDD(startDate)} : {formatYYYYMMDD(endDate)}
                                </AppText>
                            ) : (
                                <AppText size={14} color="#718096" family="InterRegular">
                                    Select Date Range
                                </AppText>
                            )
                        }

                    </View>
                    <View style={[styles.calenderICon, styles.center]}>
                        <CalenderIcon size={16} color={colors.blue} />
                    </View>
                </Pressable>
                <FlatList
                    data={orderList}
                    keyExtractor={(item) => item.order_id.toString()}
                    showsVerticalScrollIndicator={false}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        loadingOrders ? (
                            <View style={{ marginTop: 40, alignItems: 'center' }}>
                                <ActivityIndicator size="large" color={colors.blue} />
                            </View>
                        ) : (
                            <View style={{ marginTop: 20 }}>
                                <AppText size={16} color="black" align='center'>
                                    {'No data found'}
                                </AppText>
                            </View>
                        )

                    }
                    style={{ marginTop: 20, }}
                    ListFooterComponent={() => (
                        <View style={{ height: 120 }} />
                    )} />
            </ScrollView>


            <CustomerCalendar
                {...{ showCal, setShowCal }}
                minimumDate={new Date()}
                initialStartDate={startDate}
                initialEndDate={endDate}
                setStartDates={setStartDate}
                setEndDates={setEndDate}
                setRange={setRange}
                range={rangeType}
                onApplyClick={handleApply}
            />
        </View>
    );
}


export default OrderList;
