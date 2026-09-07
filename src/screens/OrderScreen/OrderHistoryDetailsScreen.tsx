import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, View } from 'react-native';
import AppText from '../../components/AppText/AppText';
import { styles } from './styles';
import { rw } from '../../utils/responsive';
import { colors } from '../../utils/Colors';
import { NavigationProp, ParamListBase, useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import store from '../../components/redux/Store';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReactNativeBlobUtil from 'react-native-blob-util';

const API_BASE_URL = 'https://elofic.fieldkonnect.io/api';

const TableHeader = () => (
    <View style={styles.tableHeader}>
        <AppText size={14} color="#000000" family='InterSemiBold' width={'40%'}>
            Product
        </AppText>
        <AppText size={14} color="#000000" family='InterSemiBold' width={'10%'} align='center'>
            Qty
        </AppText>
        <AppText size={14} color="#000000" family='InterSemiBold' width={'25%'} align='center'>
            Rate
        </AppText>
        <AppText size={14} color="#000000" family='InterSemiBold' width={'25%'} align='center'>
            Amount
        </AppText>
    </View>
);

interface TableRowProps {
    label: string;
    value?: string | number;
    rate?: number;
    amount?: number;
}
const TableRow: React.FC<TableRowProps> = ({
    label,
    value,
    rate,
    amount,
}) => (
    <View style={styles.tableRows}>
        <View style={{ width: '35%' }}>
            <AppText size={14} color={'#333333'} family={'InterRegular'}>
                {label}
            </AppText>
        </View>

        <View style={{ width: '15%', alignItems: 'center' }}>
            <AppText size={14} color={'#333333'} family={'InterRegular'}>
                {value}
            </AppText>
        </View>

        <AppText size={14} color={'#333333'} family={'InterRegular'} width={'25%'} align='center'>
            {rate}
        </AppText>

        <AppText size={14} color={'#333333'} family="InterBold" width={'25%'} align='center'>
            {amount}
        </AppText>
    </View>
);


const OrderHistoryDetailsScreen = () => {
    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const route = useRoute();
    const { orderId } = route.params as { orderId: number };
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);


    useEffect(() => {
        fetchOrderDetails();
        // The order ID is fixed for the lifetime of this screen instance.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchOrderDetails = async () => {
        const token = store.getState().auth?.token;

        if (!token) {
            Toast.show({ type: 'error', text1: 'Token not found' });
            return;
        }

        setLoading(true); 

        try {
            const response = await fetch(
                `${API_BASE_URL}/getOrderDetails?order_id=${orderId}`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const json = await response.json();


            if (json?.status) {
                setOrderDetails(json?.data);
                setOrderItems(json?.data?.orderdetails || []);
            } else {
                Toast.show({
                    type: 'error',
                    text1: json?.message || 'Failed to load order',
                });
            }
        } catch (error) {
            console.log("Order details error", error);
        } finally {
            setLoading(false);
        }
    };

    // Calculations
    const totalQuantity = orderItems.reduce((sum, item) => {
        return sum + Number(item.quantity || 0);
    }, 0);

    const totalOrderValue = orderItems.reduce((sum, item) => {
        return sum + Number(item.line_total || 0);
    }, 0);

    const downloadOrderPDF = async () => {
        const token = store.getState().auth?.token;

        if (!token) {
            Toast.show({ type: 'error', text1: 'Token not found' });
            return;
        }

        setDownloading(true);

        try {
            const safeOrderNumber = String(orderDetails?.orderno || orderId)
                .replace(/[^a-zA-Z0-9_-]/g, '_');
            const fileName = `Order_${safeOrderNumber}.pdf`;
            const { config, fs } = ReactNativeBlobUtil;
            const destination = Platform.OS === 'android'
                ? `${fs.dirs.DownloadDir}/${fileName}`
                : `${fs.dirs.DocumentDir}/${fileName}`;

            if (await fs.exists(destination)) {
                await fs.unlink(destination);
            }

            const downloadConfig = Platform.OS === 'android'
                ? {
                    fileCache: true,
                    addAndroidDownloads: {
                        useDownloadManager: true,
                        notification: true,
                        title: fileName,
                        description: 'Order PDF',
                        mime: 'application/pdf',
                        mediaScannable: true,
                        path: destination,
                    },
                }
                : {
                    fileCache: true,
                    path: destination,
                };

            const result = await config(downloadConfig).fetch(
                'GET',
                `${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/pdf`,
                {
                    Accept: 'application/pdf',
                    Authorization: `Bearer ${token}`,
                },
            );

            if (result.info().status < 200 || result.info().status >= 300) {
                let message = 'Unable to download the generated PDF';

                try {
                    const errorBody = JSON.parse(await result.text());
                    message = errorBody?.message || message;
                } catch {
                    // The server did not return a JSON error response.
                }

                if (await fs.exists(destination)) {
                    await fs.unlink(destination);
                }
                throw new Error(message);
            }

            Toast.show({
                type: 'success',
                text1: 'PDF downloaded successfully',
                text2: Platform.OS === 'android' ? 'Saved in Downloads' : fileName,
            });

            if (Platform.OS === 'ios') {
                await ReactNativeBlobUtil.ios.previewDocument(result.path());
            }
        } catch (error: any) {
            console.log('Order PDF download error:', error);
            Toast.show({
                type: 'error',
                text1: 'PDF download failed',
                text2: error?.message || 'Please try again',
            });
        } finally {
            setDownloading(false);
        }
    };


    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>

            {
                loading ? (
                    <View style={{ flex: 1, marginTop: 100 }}>
                        <ActivityIndicator size="large" color={colors.blue} />
                    </View>
                ) : (
                    <ScrollView style={[styles.container, { paddingHorizontal: rw(18) }]} >
                        <View style={{ marginTop: 20, gap: 6 }}>
                            <AppText size={14} color={'black'} family={'InterBold'}>
                                Customer Type : {orderDetails?.customer_type || '-'}
                            </AppText>
                            <AppText size={14} color={'black'} family={'InterBold'}>
                                Buyer Name : {orderDetails?.buyer_name || '-'}
                            </AppText>

                            <AppText size={14} color={'black'} family={'InterBold'}>
                                Buyer Address : {orderDetails?.buyer_address || '-'}
                            </AppText>

                            <AppText size={14} color={'black'} family={'InterBold'}>
                                Seller / Parent Name : {orderDetails?.seller_name || '-'}
                            </AppText>

                            <AppText size={14} color={'black'} family={'InterBold'}>
                                Seller / Parent Address : {orderDetails?.seller_address || '-'}
                            </AppText>

                            <AppText size={14} color={'#333333'} family={'InterRegular'}>
                                Order Number : {orderDetails?.orderno}
                            </AppText>

                            <AppText size={14} color={'#333333'} family={'InterRegular'}>
                                Order Date : {orderDetails?.order_date}
                            </AppText>

                            <AppText size={14} color={'#333333'} family={'InterRegular'}>
                                Created By : {orderDetails?.createdbyname?.name}
                            </AppText>
                            <AppText size={14} color={'#333333'} family={'InterRegular'}>
                                Remark :  {orderDetails?.order_remark}
                            </AppText>
                            <AppText size={14} color={'#333333'} family={'InterRegular'}>
                                Ordered / Dispatched / Pending : {Number(orderDetails?.ordered_quantity ?? totalQuantity)} / {Number(orderDetails?.dispatched_quantity ?? 0)} / {Number(orderDetails?.pending_quantity ?? Math.max(0, totalQuantity - Number(orderDetails?.dispatched_quantity ?? 0)))}
                            </AppText>
                        </View>
                        <View style={styles.tableContainers}>
                            <TableHeader />
                            <View style={{
                                borderBottomWidth: 1,
                                borderBottomColor: '#eee',
                                marginBottom: 10
                            }} />
                            {orderItems.map((item) => (
                                <TableRow
                                    key={item.id}
                                    label={item.product_name}
                                    value={item.quantity}
                                    rate={item.price}
                                    amount={item.line_total}
                                />
                            ))}

                        </View>

                        <View style={[styles.tableContainers, { paddingHorizontal: 14 }]}>
                            <View style={[styles.tableRow, { paddingTop: rw(10), paddingRight: 25 }]}>
                                <AppText size={14} color={'#333333'} family={'InterRegular'}>
                                    Total Quantity
                                </AppText>
                                <AppText size={16} color={colors.blue} family="InterBold">
                                    {totalQuantity}
                                </AppText>
                            </View>
                            <View style={[styles.tableRow, { paddingTop: rw(10) }]}>
                                <AppText size={14} color={'#333333'} family={'InterRegular'}>
                                    Total Order Value
                                </AppText>
                                <AppText size={16} color={colors.blue} family="InterBold" horizontal={20}>
                                    {totalOrderValue.toFixed(2)}
                                </AppText>
                            </View>
                        </View>



                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                            <Pressable style={[styles.buttonView, { width: '48%' }]} onPress={() => navigation.navigate('ProductCatalogue', {
                                editOrderId: orderId,
                                editOrderData: orderDetails,
                                initialCart: orderItems.map(item => ({
                                    productId: item.product_id,
                                    productDetailId: item.product_detail_id,
                                    productName: item.product_name,
                                    quantity: Number(item.quantity || 0),
                                    price: Number(item.price || 0),
                                })),
                            })}>
                                <AppText color='white' family='InterBold' size={16}>Edit</AppText>
                            </Pressable>
                            <Pressable
                                style={[styles.buttonView, { width: '48%', opacity: downloading ? 0.65 : 1 }]}
                                onPress={downloadOrderPDF}
                                disabled={downloading}
                            >
                                {downloading ? (
                                    <ActivityIndicator color='white' />
                                ) : (
                                    <AppText color='white' family='InterBold' size={16}>Download</AppText>
                                )}
                            </Pressable>
                            {/* <Pressable style={[styles.buttonView, { width: '48%', backgroundColor: 'red' }]} >
                                <AppText color='white' family='InterBold' size={16}>Cancel</AppText>
                            </Pressable> */}
                        </View>
                        {/* <Pressable style={[styles.buttonView,]} >
                            <AppText color='white' family='InterBold' size={16}>Order Dispatch</AppText>
                        </Pressable> */}
                    </ScrollView>
                )
            }

        </SafeAreaView>
    );
}


export default OrderHistoryDetailsScreen;
