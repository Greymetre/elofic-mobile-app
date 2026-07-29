import { StyleProp, TextStyle } from "react-native";

export type ParamList = {
  HomeScreen: {
    from: string | any;
  }
};

export type TopTabNameProps = {
  focused: boolean;
  tabName: string;
};

export type RootStackParamList = {
  LoginScreen: undefined;
  ForceUpdateScreen: undefined;
  CustomerDetails: undefined;
  TourPlanPage: undefined;
  CreatePlan: undefined | { item: number | string };
  BottomTab: undefined;
  CustomerList: undefined;
  AddCustomer:undefined;
  AttendanceReport:undefined;
  ExpenseReport:undefined;
  UserActivityPage:undefined;
  ProductCatalogue: undefined | Record<string, unknown>;
  SubmitOrder: undefined | Record<string, unknown>;
  AddNewExpense: undefined | { mode: 'edit'; expense: Record<string, any> };
  AttendanceScreen:undefined;
  AddSecondaryCustomer:undefined;
  VisitReport:undefined;
  UserTourList:undefined;
  BeatCustomerList:undefined;
  OrderHistoryDetailsScreen: undefined | { orderId: number }
  Reports: undefined
  OrderListDetails: undefined
  IndividualPage: undefined
  CreatePac: undefined
  PACDetails: undefined
  Complaint: undefined
  CreateComplaint: undefined
  ComplaintDetails: undefined
  Notifications: undefined
};

export type AppTextProps = {
  size?: number,
  color?: string,
  family?: 'InterBlack' | 'InterBold' | 'InterExtraBold' | 'InterExtraLight' | 'InterLight' | "InterMedium" | 'InterRegular' | 'InterSemiBold' | 'InterThin'
  align?: 'left' | 'center' | 'right' | 'justify'
  transform?: 'capitalize' | 'lowercase' | 'uppercase' | 'none'
  numLines?: number
  children?: React.ReactNode | React.ReactNode[]
  testID?: string,
  animateValue?: any,
  customColor?: string,
  spacing?: number | string | any,
  horizontal?: number | string | any,
  underlineColor?: string,
  underline?: 'underline' | 'line-through' | 'none' | 'underline line-through'
  textDecorationStyle?: 'dashed' | 'dotted' | 'solid' | 'double'
  onPress?: () => void,
  handleTextLayout?: (e: any) => void,
  dotMode?: 'head' | 'tail' | 'middle' | 'clip'
  width?: number | string | any
  maxWidth?: number | string | any
  opacity?: number | string | any
  lineHeight?: number | string | any
  fontStyle?: any
  style?: StyleProp<TextStyle>;
}

export type loginParmas ={
  username: any
  password: any
  app_version?: string
  device_name?: any
  device_type?: any
  unique_id?: string
  fcm_token?: string
}
