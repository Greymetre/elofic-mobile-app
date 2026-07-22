import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, TouchableOpacity, View } from 'react-native';
import { NavigationProp, ParamListBase, useNavigation, useRoute } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';
import { ArrowDownIcon } from '../../assets/svgs/SvgsFile';
import AppText from '../../components/AppText/AppText';
import store from '../../components/redux/Store';
import { BASE_URL } from '../../api/AxiosClient';
import { colors } from '../../utils/Colors';
import { rw } from '../../utils/responsive';
import { styles } from './styles';
import { extractOrderError } from '../../utils/orderUtils';

interface OrderItem {
    id: string | number;
    detailId: string | number;
    productName: string;
    quantity: number;
    rate: number;
    amount: number;
}

interface CustomerOption {
    id: number | string;
    text: string;
    name?: string;
    code?: string;
    mobile?: string;
    entity_type: string;
    label: string;
    value: string;
    parent_id?: number | string | null;
    parent_name?: string | null;
    parent_entity_type?: string | null;
}

type OptionMode = 'customer' | 'parent';

const customerTypeData = [
    { label: 'Distributor', value: 'DISTRIBUTOR' },
    { label: 'Retailer', value: 'RETAILER' },
    { label: 'Workshop', value: 'WORKSHOP' },
    { label: 'Mechanic', value: 'MECHANIC' },
    { label: 'Garage', value: 'GARAGE' },
];

const TableHeader = () => (
    <View style={styles.tableHeader}>
        <AppText size={14} color="#000000" family="InterSemiBold" width="45%" align="center">Product</AppText>
        <AppText size={14} color="#000000" family="InterSemiBold" width="15%" align="center">Qty</AppText>
        <AppText size={14} color="#000000" family="InterSemiBold" width="20%" align="center">Rate</AppText>
        <AppText size={14} color="#000000" family="InterSemiBold" width="20%" align="center">Amount</AppText>
    </View>
);

const TableRow = ({ item, onRemove }: { item: OrderItem; onRemove: (id: string | number) => void }) => (
    <View style={styles.tableRows}>
        <TouchableOpacity
            style={{ height: 22, width: 22, backgroundColor: colors.blue, borderRadius: 50, alignItems: 'center' }}
            onPress={() => onRemove(item.id)}>
            <AppText size={14} color="white">-</AppText>
        </TouchableOpacity>
        <View style={{ width: '36%', marginLeft: 10 }}>
            <AppText size={14} color="#333333" family="InterRegular">{item.productName}</AppText>
        </View>
        <View style={{ width: '15%', alignItems: 'center' }}>
            <AppText size={14} color="#333333" family="InterRegular">{item.quantity}</AppText>
        </View>
        <View style={{ width: '20%', alignItems: 'center' }}>
            <AppText size={14} color="#333333" family="InterRegular">{item.rate.toFixed(2)}</AppText>
        </View>
        <AppText size={14} color="#333333" family="InterBold" width="20%" align="center">
            {item.amount.toFixed(2)}
        </AppText>
    </View>
);

const optionKey = (id: string | number, entityType: string) => `${entityType}:${id}`;

const normalizeOption = (item: any, fallbackType: string): CustomerOption => ({
    ...item,
    id: item.id,
    text: item.text || item.name || 'Customer',
    entity_type: item.entity_type || fallbackType,
    label: item.text || item.name || 'Customer',
    value: optionKey(item.id, item.entity_type || fallbackType),
});

const mergeOptions = (current: CustomerOption[], incoming: CustomerOption[]) => {
    const options = new Map(current.map(item => [item.value, item]));
    incoming.forEach(item => options.set(item.value, item));
    return Array.from(options.values());
};

const SubmitOrder = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const { cartItems = [], updateCart, routeData = {} } = route.params || {};
    const editOrderData = route.params?.editOrderData;
    const isEditMode = Boolean(route.params?.editOrderId);

    const initialType = String(editOrderData?.customer_type || routeData.customerType || (routeData.type === 'Distributor' ? 'DISTRIBUTOR' : '')).toUpperCase();
    const initialCustomerId = editOrderData?.buyer_id ?? routeData.customer_id ?? routeData.retailer_id ?? routeData.distributor_id;
    const initialCustomerName = editOrderData?.buyer_name ?? routeData.customer_name ?? routeData.customerName ?? routeData.text ?? routeData.legal_name ?? routeData.shop_name;
    const initialParentId = editOrderData?.seller_id ?? routeData.parent_id ?? routeData.distributor_name;
    const initialParentName = editOrderData?.seller_name ?? routeData.parent_name ?? routeData.distributor?.trade_name ?? routeData.distributor?.legal_name;
    const initialParentType = editOrderData?.seller_type ?? routeData.parent_entity_type ?? (initialParentId != null ? 'DISTRIBUTOR' : null);

    const [customerType, setCustomerType] = useState<string | null>(initialType || null);
    const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([]);
    const [parentOptions, setParentOptions] = useState<CustomerOption[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null);
    const [selectedParent, setSelectedParent] = useState<CustomerOption | null>(null);
    const [customerTerm, setCustomerTerm] = useState('');
    const [parentTerm, setParentTerm] = useState('');
    const [customerPage, setCustomerPage] = useState(1);
    const [parentPage, setParentPage] = useState(1);
    const [customerMore, setCustomerMore] = useState(false);
    const [parentMore, setParentMore] = useState(false);
    const [customerLoading, setCustomerLoading] = useState(false);
    const [parentLoading, setParentLoading] = useState(false);
    const [loader, setLoader] = useState(false);
    const [remark, setRemark] = useState(editOrderData?.order_remark || '');
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const customerAbortRef = useRef<AbortController | null>(null);
    const parentAbortRef = useRef<AbortController | null>(null);
    const hasAppliedRouteDefault = useRef(false);
    const selectedCustomerRef = useRef<CustomerOption | null>(null);
    const selectedParentRef = useRef<CustomerOption | null>(null);

    useEffect(() => {
        const sourceItems = cartItems.length ? cartItems : (editOrderData?.orderdetails || []);
        setOrderItems(sourceItems.map((item: any) => {
            const rate = Number(item.price || 0);
            return {
                id: item.productId ?? item.product_id,
                detailId: item.productDetailId ?? item.product_detail_id,
                productName: item.productName ?? item.product_name,
                quantity: Number(item.quantity || 0),
                rate,
                amount: Number(item.quantity || 0) * rate,
            };
        }));
    }, [cartItems, editOrderData]);

    useEffect(() => {
        if (!isEditMode || !editOrderData?.seller_id || initialType === 'DISTRIBUTOR') return;
        const parent = normalizeOption({
            id: editOrderData.seller_id,
            text: editOrderData.seller_name,
            entity_type: editOrderData.seller_type,
        }, editOrderData.seller_type || 'DISTRIBUTOR');
        setParentOptions(previous => mergeOptions(previous, [parent]));
        selectedParentRef.current = parent;
        setSelectedParent(parent);
    }, [editOrderData, initialType, isEditMode]);

    const fetchOptions = useCallback(async (
        mode: OptionMode,
        page: number,
        term: string,
        append: boolean,
        typeOverride?: string,
    ) => {
        const type = typeOverride || customerType;
        if (!type) return;

        const abortRef = mode === 'customer' ? customerAbortRef : parentAbortRef;
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        const setLoading = mode === 'customer' ? setCustomerLoading : setParentLoading;
        setLoading(true);

        try {
            const params = new URLSearchParams({
                customer_type: type,
                mode,
                term,
                page: String(page),
                per_page: '20',
            });
            const token = store.getState().auth?.token;
            const response = await fetch(`${BASE_URL}api/order/customer-options?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
                signal: controller.signal,
            });
            const json = await response.json();
            if (!response.ok || json?.status !== 'success') {
                throw new Error(json?.message || 'Unable to load customer options');
            }
            const options = (json.data || []).map((item: any) => normalizeOption(item, type));
            const setOptions = mode === 'customer' ? setCustomerOptions : setParentOptions;
            const selectedOption = mode === 'customer'
                ? selectedCustomerRef.current
                : selectedParentRef.current;
            setOptions(previous => {
                if (append) return mergeOptions(previous, options);
                return selectedOption ? mergeOptions([selectedOption], options) : options;
            });
            (mode === 'customer' ? setCustomerMore : setParentMore)(Boolean(json?.pagination?.more));
        } catch (error: any) {
            if (error?.name !== 'AbortError') {
                Toast.show({ type: 'error', text1: error?.message || 'Unable to load customers' });
            }
        } finally {
            if (abortRef.current === controller) setLoading(false);
        }
    }, [customerType]);

    useEffect(() => {
        if (!customerType) return;
        const timer = setTimeout(() => {
            setCustomerPage(1);
            fetchOptions('customer', 1, customerTerm, false);
        }, 350);
        return () => clearTimeout(timer);
    }, [customerTerm, customerType, fetchOptions]);

    useEffect(() => {
        if (!customerType || customerType === 'DISTRIBUTOR') return;
        const timer = setTimeout(() => {
            setParentPage(1);
            fetchOptions('parent', 1, parentTerm, false);
        }, 350);
        return () => clearTimeout(timer);
    }, [parentTerm, customerType, fetchOptions]);

    useEffect(() => {
        if (hasAppliedRouteDefault.current || !initialType || initialCustomerId == null || customerType !== initialType) return;
        const matchingOption = customerOptions.find(item => String(item.id) === String(initialCustomerId));
        if (matchingOption) {
            const customerWithAssignedParent = normalizeOption({
                ...matchingOption,
                parent_id: matchingOption.parent_id ?? initialParentId,
                parent_name: matchingOption.parent_name ?? initialParentName,
                parent_entity_type: matchingOption.parent_entity_type ?? initialParentType,
            }, initialType);
            selectedCustomerRef.current = customerWithAssignedParent;
            setSelectedCustomer(customerWithAssignedParent);
            hasAppliedRouteDefault.current = true;
            return;
        }
        if (initialCustomerName) {
            const routeOption = normalizeOption({
                id: initialCustomerId,
                text: initialCustomerName,
                entity_type: initialType,
                parent_id: initialParentId,
                parent_name: initialParentName,
                parent_entity_type: initialParentType,
            }, initialType);
            setCustomerOptions(previous => mergeOptions(previous, [routeOption]));
            selectedCustomerRef.current = routeOption;
            setSelectedCustomer(routeOption);
            hasAppliedRouteDefault.current = true;
        }
    }, [customerOptions, customerType, initialCustomerId, initialCustomerName, initialParentId, initialParentName, initialParentType, initialType]);

    useEffect(() => {
        if (!selectedCustomer || customerType === 'DISTRIBUTOR' || isEditMode) return;

        if (selectedCustomer.parent_id == null) {
            selectedParentRef.current = null;
            setSelectedParent(null);
            return;
        }

        const assignedParent = normalizeOption({
            id: selectedCustomer.parent_id,
            text: selectedCustomer.parent_name || 'Assigned Parent',
            entity_type: selectedCustomer.parent_entity_type || 'DISTRIBUTOR',
        }, selectedCustomer.parent_entity_type || 'DISTRIBUTOR');
        selectedParentRef.current = assignedParent;
        setSelectedParent(assignedParent);
        setParentOptions(previous => mergeOptions(previous, [assignedParent]));
    }, [customerType, isEditMode, selectedCustomer]);

    useEffect(() => () => {
        customerAbortRef.current?.abort();
        parentAbortRef.current?.abort();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            updateCart?.(orderItems.map(item => ({
                productId: item.id,
                productDetailId: item.detailId,
                productName: item.productName,
                quantity: item.quantity,
                price: item.rate,
            })));
        });
        return unsubscribe;
    }, [navigation, orderItems, updateCart]);

    const handleCustomerTypeChange = (nextType: string) => {
        customerAbortRef.current?.abort();
        parentAbortRef.current?.abort();
        hasAppliedRouteDefault.current = nextType !== initialType;
        setCustomerType(nextType);
        selectedCustomerRef.current = null;
        selectedParentRef.current = null;
        setSelectedCustomer(null);
        setSelectedParent(null);
        setCustomerOptions([]);
        setParentOptions([]);
        setCustomerTerm('');
        setParentTerm('');
        setCustomerPage(1);
        setParentPage(1);
        setCustomerMore(false);
        setParentMore(false);
        setCustomerLoading(false);
        setParentLoading(false);
    };

    const loadMore = (mode: OptionMode) => {
        if (mode === 'customer') {
            if (!customerMore || customerLoading) return;
            const nextPage = customerPage + 1;
            setCustomerPage(nextPage);
            fetchOptions(mode, nextPage, customerTerm, true);
            return;
        }
        if (!parentMore || parentLoading) return;
        const nextPage = parentPage + 1;
        setParentPage(nextPage);
        fetchOptions(mode, nextPage, parentTerm, true);
    };

    const totalOrderValue = orderItems.reduce((sum, item) => sum + item.amount, 0);
    const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);

    const submitOrder = async () => {
        if (isEditMode) {
            Toast.show({ type: 'info', text1: 'Edit Save is unavailable until the backend update API is provided' });
            return;
        }
        if (!customerType) {
            Toast.show({ type: 'error', text1: 'Please select Customer Type' });
            return;
        }
        if (!selectedCustomer) {
            Toast.show({ type: 'error', text1: 'Please select Customer' });
            return;
        }
        if (customerType !== 'DISTRIBUTOR' && !selectedParent) {
            Toast.show({ type: 'error', text1: 'Please select Parent' });
            return;
        }
        if (!orderItems.length) {
            Toast.show({ type: 'error', text1: 'Please select at least one product' });
            return;
        }
        const invalidItem = orderItems.find(item => !item.id || !item.detailId || item.quantity <= 0 || !Number.isFinite(item.rate) || item.rate < 0);
        if (invalidItem) {
            Toast.show({ type: 'error', text1: 'Every product requires a detail ID, quantity greater than zero, and a valid price' });
            return;
        }

        const seller = customerType === 'DISTRIBUTOR' ? selectedCustomer : selectedParent;
        const body = {
            customer_type: customerType,
            buyer_id: selectedCustomer.id,
            seller_id: seller?.id,
            seller_type: customerType === 'DISTRIBUTOR' ? 'DISTRIBUTOR' : seller?.entity_type,
            remark: remark || 'NA',
            grand_total: totalOrderValue,
            orderdetail: orderItems.map(item => ({
                product_id: item.id,
                product_detail_id: item.detailId,
                quantity: item.quantity,
                price: item.rate,
                line_total: item.amount,
            })),
        };

        try {
            setLoader(true);
            const token = store.getState().auth?.token;
            const response = await fetch(`${BASE_URL}api/insertOrder`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            const responseText = await response.text();
            let json: any = responseText;
            try {
                json = responseText ? JSON.parse(responseText) : {};
            } catch {
                // Keep a plain-string response so extractOrderError can display it.
            }
            if (!response.ok || json?.status !== 'success') {
                const validationMessage = extractOrderError(json);
                throw new Error(validationMessage || 'Order could not be created');
            }
            Toast.show({ type: 'success', text1: json?.message || 'Order placed successfully' });
            navigation.navigate('BottomTab');
        } catch (error: any) {
            Toast.show({ type: 'error', text1: error?.message || 'Something went wrong' });
        } finally {
            setLoader(false);
        }
    };

    const dropdownProps = {
        style: styles.selectUser,
        placeholderStyle: { color: '#718096', fontSize: 14 },
        selectedTextStyle: { color: colors.black, fontSize: 14 },
        inputSearchStyle: { height: 40, fontSize: 14 },
        maxHeight: 300,
        labelField: 'label',
        valueField: 'value',
        renderRightIcon: () => <ArrowDownIcon />,
    } as const;

    return (
        <View style={styles.container}>
            <KeyboardAwareScrollView
                style={[styles.container, { paddingHorizontal: rw(18) }]}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bottomOffset={50}>
                <View style={[styles.row, { gap: 10, marginTop: 20 }]}>
                    <View style={{ flex: 1, gap: 10 }}>
                        <Dropdown
                            {...dropdownProps}
                            data={customerTypeData}
                            search
                            placeholder="Select Customer Type"
                            searchPlaceholder="Search Customer Type"
                            value={customerType}
                            onChange={item => handleCustomerTypeChange(item.value)}
                        />
                    </View>
                </View>

                <View style={{ flex: 1, marginTop: 20, opacity: customerType ? 1 : 0.55 }} pointerEvents={customerType ? 'auto' : 'none'}>
                    <Dropdown
                        {...dropdownProps}
                        data={customerOptions}
                        search
                        placeholder={customerType ? 'Select Customer' : 'Select Customer Type first'}
                        searchPlaceholder="Search Customer"
                        value={selectedCustomer?.value}
                        onChangeText={setCustomerTerm}
                        onChange={item => {
                            selectedCustomerRef.current = item;
                            setSelectedCustomer(item);
                        }}
                        flatListProps={{
                            onEndReached: () => loadMore('customer'),
                            onEndReachedThreshold: 0.4,
                            ListFooterComponent: customerLoading
                                ? <ActivityIndicator style={{ padding: 10 }} color={colors.blue} />
                                : null,
                        }}
                    />
                </View>

                {customerType && customerType !== 'DISTRIBUTOR' && (
                    <View style={{ flex: 1, marginTop: 20 }}>
                        <Dropdown
                            {...dropdownProps}
                            data={parentOptions}
                            search
                            placeholder="Select Parent"
                            searchPlaceholder="Search Parent"
                            value={selectedParent?.value}
                            onChangeText={setParentTerm}
                            onChange={item => {
                                selectedParentRef.current = item;
                                setSelectedParent(item);
                            }}
                            flatListProps={{
                                onEndReached: () => loadMore('parent'),
                                onEndReachedThreshold: 0.4,
                                ListFooterComponent: parentLoading
                                    ? <ActivityIndicator style={{ padding: 10 }} color={colors.blue} />
                                    : null,
                            }}
                        />
                    </View>
                )}

                <View style={styles.tableContainers}>
                    <TableHeader />
                    <View style={{ borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 10 }} />
                    {orderItems.map(item => (
                        <TableRow key={String(item.id)} item={item} onRemove={id => setOrderItems(previous => previous.filter(row => row.id !== id))} />
                    ))}
                </View>

                <View style={[styles.tableContainers, { paddingHorizontal: 14 }]}>
                    <View style={[styles.tableRow, { paddingTop: rw(10), justifyContent: 'space-between', paddingRight: 20 }]}>
                        <AppText size={14} color="#333333" family="InterRegular">Total Quantity</AppText>
                        <AppText size={16} color={colors.blue} family="InterBold">{totalQuantity}</AppText>
                    </View>
                    <View style={[styles.tableRow, { paddingTop: rw(10) }]}>
                        <AppText size={14} color="#333333" family="InterRegular">Total Order Value</AppText>
                        <AppText size={16} color={colors.blue} family="InterBold" horizontal={20}>{totalOrderValue.toFixed(2)}</AppText>
                    </View>
                </View>

                <View style={styles.remarkContainer}>
                    <TextInput
                        style={styles.remarkInput}
                        placeholder="Enter Remark"
                        placeholderTextColor="#718096"
                        value={remark}
                        onChangeText={setRemark}
                    />
                </View>
                {isEditMode && (
                    <AppText size={13} color="#8A5A00" align="center" style={{ marginTop: 16 }}>
                        Existing order loaded for editing. Save is disabled because no authenticated mobile update endpoint exists.
                    </AppText>
                )}
                <Pressable style={[styles.buttonView, isEditMode && { opacity: 0.55 }]} disabled={loader} onPress={submitOrder}>
                    {loader
                        ? <ActivityIndicator size="small" color="white" />
                        : <AppText color="white" family="InterBold" size={16}>{isEditMode ? 'SAVE UNAVAILABLE' : 'SUBMIT'}</AppText>}
                </Pressable>
                <View style={{ height: 90 }} />
            </KeyboardAwareScrollView>
        </View>
    );
};

export default SubmitOrder;
