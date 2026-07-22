import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/Types';
import LoginScreen from '../screens/Login';
import CustomerDetails from '../screens/Customer/CustomerDetails';
import CustomHeader from '../components/Header';
import TourPlanPage from '../screens/TourPlan';
import CreatePlan from '../screens/TourPlan/CreatePlan';
import BottomTab from './BottomTab';
import CustomerList from '../screens/CustomerList';
import AddCustomer from '../screens/AddCustomer';
import ExpenseReport from '../screens/ExpenseReport';
import AttendanceReport from '../screens/AttendanceReport';
import UserActivityScreen from '../screens/UserActivity';
import ProductCatalogue from '../screens/OrderScreen/ProductCatalogue';
import SubmitOrder from '../screens/OrderScreen/SubmitOrder';
import AddNewExpense from '../screens/AddNewExpense';
import AttendanceScreen from '../screens/AttendanceReport/AttendanceScreen';
import store, { useAppSelector } from '../components/redux/Store';
import AddSecondaryCustomer from '../screens/AddCustomer/AddSecondaryCustomer';
import VisitReport from '../screens/AttendanceReport/VisitReport';
import UserTourList from '../screens/TourPlan/UserTourList';
import BeatCustomerDetails from '../screens/BeatScreen/BeatCustomerDetails';
import OrderHistoryDetailsScreen from '../screens/OrderScreen/OrderHistoryDetailsScreen';
import Reports from '../screens/reports';
import OrderList from '../screens/OrderScreen';
import IndividualPage from '../screens/UserActivity/IndividualPage';
import { useDispatch } from 'react-redux';
import { setActiveBg } from '../components/redux/slice/AuthSlice';
import CreatePac from '../screens/PACScreen/CreatePac';
import PACDetails from '../screens/PACScreen/PACDetails';
import Complaint from '../screens/Complaint';
import CreateComplaint from '../screens/Complaint/CreateComplaint';
import ComplaintDetails from '../screens/Complaint/ComplaintDetails';
import ForceUpdateScreen from '../screens/Login/ForceUpdateScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Routes = () => {
  const { user } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setActiveBg(false));
  }, [])
  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          header: (props) => <CustomHeader {...props} />
        }}
        initialRouteName={
          user?.access_token
            ? "BottomTab"
            : "LoginScreen"
        }
      >
        <Stack.Screen name='LoginScreen' component={LoginScreen} />
        <Stack.Screen name='ForceUpdateScreen' component={ForceUpdateScreen} />
        <Stack.Screen name='BottomTab' component={BottomTab} />
        <Stack.Screen name='CustomerDetails' component={CustomerDetails} options={{
          headerShown: true,
          title: 'Customer Details'
        }} />
        <Stack.Screen name='AttendanceReport' component={AttendanceReport} options={{
          headerShown: true,
          title: 'Attendance Report'
        }} />
        <Stack.Screen name='ExpenseReport' component={ExpenseReport} options={{
          headerShown: true,
          title: 'Expense Approval'
        }} />
          <Stack.Screen name='OrderHistoryDetailsScreen' component={OrderHistoryDetailsScreen} options={{
          headerShown: true,
          title: 'Order'
        }} />
        
        <Stack.Screen name='TourPlanPage' component={TourPlanPage} options={{
          headerShown: true,
          title: 'Tour Plan'
        }} />
        <Stack.Screen name='UserTourList' component={UserTourList} options={{
          headerShown: true,
          title: 'Tour Plan'
        }} />
        <Stack.Screen name='AddCustomer' component={AddCustomer} options={{
          headerShown: true,
          title: 'Add Customer'
        }} />
        <Stack.Screen name='AddSecondaryCustomer' component={AddSecondaryCustomer} options={{
          headerShown: true,
          title: 'Add Customer'
        }} />
        <Stack.Screen name='UserActivityPage' component={UserActivityScreen} options={{
          headerShown: true,
          title: 'User Activity'
        }} />
        <Stack.Screen name='ProductCatalogue' component={ProductCatalogue} options={{
          headerShown: true,
          title: 'Product Catalogue'
        }} />

        <Stack.Screen name='SubmitOrder' component={SubmitOrder} options={{
          headerShown: true,
          title: 'Submit Order'
        }} />

        <Stack.Screen name='CreatePlan' component={CreatePlan} options={{
          headerShown: true,
          title: 'Create'
        }} />
        <Stack.Screen name='AddNewExpense' component={AddNewExpense} options={{
          headerShown: true,
          title: 'Add New Expense'
        }} />
        <Stack.Screen name='AttendanceScreen' component={AttendanceScreen} options={{
          headerShown: true,
          title: 'Attendance'
        }} />
        <Stack.Screen name='Reports' component={Reports} options={{
          headerShown: true,
          title: 'Reports'
        }} />
        <Stack.Screen name='VisitReport' component={VisitReport} options={{
          headerShown: true,
          title: 'Visit Report'
        }} />

        <Stack.Screen name='CustomerList' component={CustomerList} options={{
          headerShown: true,
          title: 'Customers'
        }} />

        <Stack.Screen name='BeatCustomerList' component={BeatCustomerDetails} options={{
          headerShown: true,
          title: 'Customers'
        }} />
        <Stack.Screen name='IndividualPage' component={IndividualPage} options={{
          headerShown: true,
          title: 'User Activity'
        }} />
        <Stack.Screen name='OrderListDetails' component={OrderList} options={{
          headerShown: true,
          title: 'Orders'
        }} />
        <Stack.Screen name='CreatePac' component={CreatePac} options={{
          headerShown: false,
          title: 'CreatePac'
        }} />
        <Stack.Screen name='PACDetails' component={PACDetails} options={{
          headerShown: false,
          title: 'PACDetails'
        }} />
        <Stack.Screen name='Complaint' component={Complaint} options={{
          headerShown: false,
          title: 'Complaint'
        }} />
        <Stack.Screen name='CreateComplaint' component={CreateComplaint} options={{
          headerShown: false,
        }} />
        <Stack.Screen name='ComplaintDetails' component={ComplaintDetails} options={{
          headerShown: false,
        }} />


      </Stack.Navigator>
    </>
  )
}

export default Routes
