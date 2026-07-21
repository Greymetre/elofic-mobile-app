import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    BackHandler,
    Keyboard,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ArrowDownIcon } from '../../assets/svgs/SvgsFile';
import AppText from '../../components/AppText/AppText';
import { styles } from './styles';
import { rw } from '../../utils/responsive';
import FastImage from 'react-native-fast-image';
import {
    AddCartMiunsIcon,
    PlaceOrderIcon,
    PlusIcon,
} from '../../assets/svgs/HomePageSvgs';
import { colors } from '../../utils/Colors';
import { Dropdown } from 'react-native-element-dropdown';
import Toast from 'react-native-toast-message';
import store from '../../components/redux/Store';
import { useFocusEffect } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

type ProductCatalogueProps = {
    navigation: any;
    route: any;
};

interface CartItem {
    productId: number | string;
    productDetailId: number | string;
    productName: string;
    quantity: number;
    price?: number;
}

interface DropdownItem {
    label: string;
    value: number | string;
}
const ProductCatalogue = ({ navigation, route }: ProductCatalogueProps) => {
    const [familySelect, setFamilySelect] = useState<DropdownItem[]>([]);
    const [selectedFamilyId, setSelectedFamilyId] = useState<
        number | string | null
    >(null);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingFamily, setLoadingFamily] = useState<boolean>(true);
    const [productDetails, setProductDetails] = useState<any | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isEditingQty, setIsEditingQty] = useState(false);
    const [tempQuantity, setTempQuantity] = useState<string>('');
    const [cart, setCart] = useState<CartItem[]>(() => (route?.params?.initialCart || []));

    const resetPageState = useCallback(() => {
        setSelectedFamilyId(null);
        setSelectedProduct(null);
        setQuantity(1);
        setCart([]); // ← clear cart (remove if you want to keep it)
        // reset any other form-related state here
    }, []);


    useEffect(() => {
        fetchFamily();
    }, []);

    const fetchFamily = async () => {
        setLoadingFamily(true);
        const token = store.getState().auth?.token;

        if (!token) {
            Toast.show({ type: 'error', text1: 'Authentication token not found' });
            setLoadingFamily(false);
            return;
        }

        try {
            const response = await fetch(
                `https://elofic.fieldkonnect.io/api/getSubCategoryList`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (!response.ok) throw new Error('Failed to fetch users');

            const json = await response.json();
            if (json?.data && Array.isArray(json.data)) {
                const userList: DropdownItem[] = json.data.map((u: any) => ({
                    label: u.subcategory_name,
                    value: u.id,
                }));
                setFamilySelect(userList);
            } else {
                Toast.show({ type: 'error', text1: 'Invalid user list response' });
            }
        } catch (err) {
            console.error('User fetch error:', err);
            Toast.show({ type: 'error', text1: 'Could not load users' });
        } finally {
            setLoadingFamily(false);
        }
    };

    useEffect(() => {
        if (!selectedFamilyId) {
            setProducts([]);
            setSelectedProduct(null);
            return;
        }

        const fetchProducts = async () => {
            setLoadingProducts(true);
            const token = store.getState().auth?.token;
            if (!token) return;

            try {
                const res = await fetch(
                    `https://elofic.fieldkonnect.io/api/getProductList?subcategory_id=${selectedFamilyId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );

                const json = await res.json();

                if (json?.status === 'success' && Array.isArray(json?.data)) {
                    const productList: DropdownItem[] = json.data.map((u: any) => ({
                        label: u.product_name,
                        value: u.id,
                        detailId: u.detail_id,
                        price: Number(u?.price || 0),
                    }));
                    setProducts(productList);
                } else {
                    setProducts([]);
                }
            } catch (err) {
                console.error('Products fetch error:', err);
                Toast.show({ type: 'error', text1: 'Failed to load products' });
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchProducts();
    }, [selectedFamilyId]);

    const fetchProductDetails = async (productId: number | string) => {
        const token = store.getState().auth?.token;

        try {
            const res = await fetch(
                `https://elofic.fieldkonnect.io/api/getProductDetails?product_id=${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                },
            );

            const json = await res.json();

            if (json?.status === 'success') {
                setProductDetails(json.data);
            } else {
                setProductDetails(null);
            }
        } catch (error) {
            console.log('Product details error', error);
            Toast.show({
                type: 'error',
                text1: 'Failed to load product details',
            });
        }
    };

    const resetForm = () => {
        if (!selectedProduct) {
            Toast.show({
                type: 'info',
                text1: 'Please add product',
                position: 'top',
            });
            return;
        }
        setSelectedProduct(null);
        setQuantity(1);
        setIsEditingQty(false);
        setTempQuantity('');
    };
    const addToCart = () => {
        if (!selectedProduct) {
            Toast.show({
                type: 'info',
                text1: 'Please select product',
                position: 'top',
            });
            return;
        }

        const existingIndex = cart.findIndex(item => item.productId === selectedProduct.value);
        if (existingIndex !== -1) {
            setCart(previous => previous.map((item, index) => index === existingIndex
                ? { ...item, quantity }
                : item));
            Toast.show({ type: 'success', text1: 'Quantity updated', position: 'top' });
            return;
        }

        const newItem: CartItem = {
            productId: selectedProduct.value,
            productDetailId: selectedProduct.detailId,
            productName: selectedProduct.label,
            quantity,
            price: selectedProduct?.price,
        };

        setCart(previous => [...previous, newItem]);
        Toast.show({ type: 'success', text1: 'Added to cart', position: 'top' });
    };

    const getTotalCartItems = () => {
        return cart?.length;
    };

    const goToPlaceOrder = () => {
        if (cart.length === 0) {
            Toast.show({ type: 'info', text1: 'Cart is empty', position: 'top' });
            return;
        }

        // Optional: check if current selected product is in cart with correct qty
        if (selectedProduct) {
            const currentInCart = cart.find(item => item.productId === selectedProduct.value);
            if (currentInCart && currentInCart.quantity !== quantity) {
                Toast.show({
                    type: 'info',
                    text1: 'You have unsaved quantity changes',
                    text2: 'Press "Add to Cart" first',
                    position: 'top',
                });
                return;
            }
        }
        // console.log(route?.params, 'route?.paramsroute?.params')
        navigation.navigate('SubmitOrder', {
            cartItems: cart,
            routeData: route?.params,
            editOrderId: route?.params?.editOrderId,
            editOrderData: route?.params?.editOrderData,
            updateCart: (updatedCart: CartItem[]) => setCart(updatedCart),
        });
        // if (cart?.length === 0) {
        //     Toast.show({
        //         type: 'info',
        //         text1: 'Please add product',
        //         position: 'top',
        //     });
        //     return;
        // }
        // navigation.navigate('SubmitOrder', { cartItems: cart });
        console.log(cart, 'cartcart');
    };
    
    return (
        <View style={styles.container}>
            <KeyboardAwareScrollView
                style={[styles.container, { paddingHorizontal: rw(18) }]}
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                bottomOffset={50}
            // contentContainerStyle={{ padding: 16 }}
            >
                {/* <ScrollView style={[styles.container, { paddingHorizontal: rw(18) }]} > */}
                <View style={[styles.row, { gap: 10, marginVertical: 20 }]}>
                    <View style={{ flex: 1, gap: 10 }}>
                        <AppText size={16} color="black" family="InterBold" opacity={0.8}>
                            Segment Name
                        </AppText>
                        <Dropdown
                            style={styles.selectUser}
                            placeholderStyle={{ color: '#718096', fontSize: 14 }}
                            selectedTextStyle={{ color: colors.black, fontSize: 14 }}
                            inputSearchStyle={{ height: 40, fontSize: 14 }}
                            data={familySelect}
                            search
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="Select Segment"
                            searchPlaceholder="Search Segment..."
                            value={selectedFamilyId}
                            onChange={item => {
                                setSelectedFamilyId(item.value);
                                setProductDetails(null);
                                setSelectedProduct(null);
                            }}
                            renderRightIcon={() => <ArrowDownIcon />}
                        />
                    </View>
                </View>

                <View style={{ flex: 1, gap: 10 }}>
                    <AppText size={16} color="black" family="InterBold" opacity={0.8}>
                        Product Name
                    </AppText>
                    <Dropdown
                        style={styles.selectUser}
                        placeholderStyle={{ color: '#718096', fontSize: 14 }}
                        selectedTextStyle={{ color: colors.black, fontSize: 14 }}
                        inputSearchStyle={{ height: 40, fontSize: 14 }}
                        data={products}
                        search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Product"
                        searchPlaceholder="Select Product..."
                        value={selectedProduct}
                        disable={
                            loadingProducts || !selectedFamilyId || products.length === 0
                        }
                        onChange={item => {
                            setSelectedProduct(item);
                            fetchProductDetails(item.value);
                        }}
                        renderRightIcon={() => <ArrowDownIcon />}
                    />
                    {selectedFamilyId && !loadingProducts && products.length === 0 && (
                        <AppText
                            size={13}
                            color="#e74c3c"
                            family="InterMedium"
                            style={{ marginTop: rw(8), textAlign: 'center' }}
                        >
                            No products found in this family
                        </AppText>
                    )}
                </View>
                {productDetails && (
                    <View style={styles.quantitySection}>
                        <View style={styles.productContainer}>
                            <FastImage
                                style={styles.productImage}
                                source={require('../../assets/images/Dummy/order2.png')}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={[styles.tableContainer, { alignSelf: 'center' }]}>
                            <View
                                style={[
                                    styles.tableRow,
                                    {
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#E1DEDF',
                                        width: '100%',
                                    },
                                ]}
                            >
                                <View style={{ width: '48%' }}>
                                    <AppText
                                        size={14}
                                        color="black"
                                        family="InterSemiBold"
                                        opacity={0.8}
                                    >
                                        Family
                                    </AppText>
                                    <AppText
                                        size={13}
                                        color="black"
                                        family="InterRegular"
                                        opacity={0.8}
                                    >
                                        {productDetails?.subcategory_name}
                                    </AppText>
                                </View>
                                <View style={{ width: '48%', alignItems: 'center' }}>
                                    <AppText
                                        size={14}
                                        color="black"
                                        family="InterSemiBold"
                                        opacity={0.8}
                                    >
                                        Model
                                    </AppText>
                                    <AppText
                                        size={13}
                                        color="black"
                                        family="InterRegular"
                                        opacity={0.8}
                                        align="center"
                                    >
                                        {productDetails?.product_name}
                                    </AppText>
                                </View>
                            </View>

                            <View
                                style={[
                                    styles.tableRow,
                                    {
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#E1DEDF',
                                    },
                                ]}
                            >
                                <View style={{ width: '48%' }}>
                                    <AppText
                                        size={14}
                                        color="black"
                                        family="InterSemiBold"
                                        opacity={0.8}
                                    >
                                        Code
                                    </AppText>
                                    <AppText
                                        size={13}
                                        color="black"
                                        family="InterRegular"
                                        opacity={0.8}
                                    >
                                        {productDetails?.product_code}
                                    </AppText>
                                </View>
                                <View style={{ width: '48%', alignItems: 'center' }}>
                                    <AppText
                                        size={14}
                                        color="black"
                                        family="InterSemiBold"
                                        opacity={0.8}
                                    >
                                        MRP
                                    </AppText>
                                    <AppText
                                        size={13}
                                        color="black"
                                        family="InterRegular"
                                        opacity={0.8}
                                        align="center"
                                    >
                                        ₹ {productDetails?.mrp}
                                    </AppText>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                <View style={styles.quantityRow}>
                    <View style={styles.quantityControls}>
                        <TouchableOpacity
                            onPress={() => {
                                setQuantity(q => Math.max(1, q - 1));
                            }}
                        >
                            <AddCartMiunsIcon />
                        </TouchableOpacity>
                        <View style={[{ width: 60 }]}>
                            <TextInput
                                style={{
                                    flex: 1,
                                    fontSize: 15,
                                    fontFamily: 'InterBold',
                                    color: '#395299',
                                    textAlign: 'center',
                                    paddingHorizontal: 4,
                                }}
                                value={isEditingQty ? tempQuantity : String(quantity)} // ← key part
                                onChangeText={text => {
                                    const cleaned = text.replace(/[^0-9]/g, '');

                                    setTempQuantity(cleaned); // ⭐ IMPORTANT

                                    const num = cleaned === '' ? 1 : Number(cleaned);
                                    setQuantity(num < 1 ? 1 : num);
                                }}
                                keyboardType="number-pad"
                                maxLength={6}
                                onFocus={() => {
                                    setIsEditingQty(true);
                                    setTempQuantity(String(quantity)); // start with current value
                                }}
                                onBlur={() => {
                                    setIsEditingQty(false);
                                    const num = tempQuantity === '' ? 1 : Number(tempQuantity);
                                    setQuantity(isNaN(num) || num < 1 ? 1 : num);
                                    setTempQuantity(''); // clean up
                                }}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                Keyboard.dismiss();
                                setQuantity(q => q + 1);
                            }}
                        >
                            <PlusIcon />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.placeOrderBtn}
                        onPress={goToPlaceOrder}
                    >
                        <PlaceOrderIcon color={'white'} />
                        <View style={styles.cartBadge}>
                            <AppText size={10} color="white" family="InterBold">
                                {getTotalCartItems()}
                            </AppText>
                        </View>
                        <AppText size={15} color="white" family="InterBold">
                            Place Order
                        </AppText>
                    </TouchableOpacity>
                </View>
                <View
                    style={[
                        styles.row,
                        { justifyContent: 'space-between', marginTop: 25 },
                    ]}
                >
                    <Pressable
                        style={[styles.chatButton, { backgroundColor: colors.blue }]}
                        onPress={resetForm}
                    >
                        <AppText size={14} color={colors.white} family="InterBold">
                            Add More Product
                        </AppText>
                    </Pressable>
                    <Pressable
                        style={[styles.chatButton, { backgroundColor: '#D2DAEE' }]}
                        onPress={addToCart}
                    >
                        <PlaceOrderIcon />
                        <AppText size={14} color={'#395299'} family="InterBold">
                            Add to Cart
                        </AppText>
                    </Pressable>
                </View>
                {/* </ScrollView> */}
                <View style={{ height: 50 }} />
            </KeyboardAwareScrollView>
        </View>
    );
};

export default ProductCatalogue;
