import React, { useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { useMutateSignup } from '../../api/query/AuthAPI';
import AppText from '../../components/AppText/AppText';
import ICEye from '../../assets/svgs/eye';
import ICEyeOff from '../../assets/svgs/eye-off';
import { colors } from '../../utils/Colors';
import { styles } from './styles';

type SignUpFormValues = {
  name: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
};

const validationSchema = Yup.object({
  name: Yup.string().trim().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: Yup.string().trim().email('Please enter a valid email').required('Email is required'),
  mobile: Yup.string()
    .matches(/^[6-9][0-9]{9}$/, 'Please enter a valid 10-digit mobile number')
    .required('Mobile number is required'),
  password: Yup.string()
    .min(12, 'Password must be at least 12 characters')
    .matches(/[a-z]/, 'Password must include a lowercase letter')
    .matches(/[A-Z]/, 'Password must include an uppercase letter')
    .matches(/[0-9]/, 'Password must include a number')
    .matches(/[^A-Za-z0-9]/, 'Password must include a symbol')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const initialValues: SignUpFormValues = {
  name: '', email: '', mobile: '', password: '', confirmPassword: '',
};

const SignUpScreen = ({ navigation }: { navigation: any }) => {
  const { mutateAsync: register } = useMutateSignup();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const submit = async (values: SignUpFormValues, { setSubmitting }: any) => {
    try {
      const response = await register({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        mobile: values.mobile.trim(),
        password: values.password,
      });

      if (response?.data?.status === 'success') {
        navigation.replace('AccountPendingScreen');
      } else {
        Toast.show({ type: 'error', text1: response?.data?.message || 'Registration failed' });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message || error?.message || 'Registration failed',
        visibilityTime: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const passwordInput = (
    field: 'password' | 'confirmPassword',
    value: string,
    onChange: (text: string) => void,
    onBlur: () => void,
    visible: boolean,
    toggle: () => void,
  ) => (
    <View style={{ position: 'relative', marginTop: 12 }}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        secureTextEntry={!visible}
        placeholder={field === 'password' ? 'Password' : 'Confirm Password'}
        placeholderTextColor="rgba(0,0,0,0.4)"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Pressable
        style={{ position: 'absolute', right: 12, top: 10, padding: 4 }}
        onPress={toggle}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        {visible ? <ICEye width={22} height={22} stroke={colors.blue} /> : <ICEyeOff width={22} height={22} stroke={colors.blue} />}
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView style={styles.container} keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false} bottomOffset={50}>
        <View style={[styles.logoView, styles.center]}>
          <FastImage style={styles.logo} resizeMode="contain" source={require('../../assets/images/FieldKonnectLogo.png')} />
          <FastImage style={styles.eloficLogo} resizeMode="contain" source={require('../../assets/images/elofic_logo_login.png')} />
        </View>
        <View style={[styles.container, styles.subContainer]}>
          <AppText color="#111111" family="InterSemiBold" align="center" size={24}>Create Account</AppText>
          <View style={{ height: 7 }} />
          <AppText color="#515151" family="InterLight" align="center" size={16}>Please fill the details to continue</AppText>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={submit}>
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, isValid }) => (
              <View style={styles.inputCollectionView}>
                <TextInput style={styles.input} value={values.name} onChangeText={handleChange('name')} onBlur={handleBlur('name')} placeholder="Full Name" placeholderTextColor="rgba(0,0,0,0.4)" autoCapitalize="words" />
                {touched.name && errors.name && <AppText color="#BE0B0B" family="InterRegular" size={12}>{errors.name}</AppText>}
                <View style={{ height: 8 }} />
                <TextInput style={styles.input} value={values.email} onChangeText={handleChange('email')} onBlur={handleBlur('email')} placeholder="Email Address" placeholderTextColor="rgba(0,0,0,0.4)" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
                {touched.email && errors.email && <AppText color="#BE0B0B" family="InterRegular" size={12}>{errors.email}</AppText>}
                <View style={{ height: 8 }} />
                <TextInput style={styles.input} value={values.mobile} onChangeText={handleChange('mobile')} onBlur={handleBlur('mobile')} placeholder="Mobile Number" placeholderTextColor="rgba(0,0,0,0.4)" keyboardType="phone-pad" maxLength={10} />
                {touched.mobile && errors.mobile && <AppText color="#BE0B0B" family="InterRegular" size={12}>{errors.mobile}</AppText>}
                {passwordInput('password', values.password, handleChange('password'), () => handleBlur('password'), showPassword, () => setShowPassword(value => !value))}
                {touched.password && errors.password && <AppText color="#BE0B0B" family="InterRegular" size={12}>{errors.password}</AppText>}
                {passwordInput('confirmPassword', values.confirmPassword, handleChange('confirmPassword'), () => handleBlur('confirmPassword'), showConfirmPassword, () => setShowConfirmPassword(value => !value))}
                {touched.confirmPassword && errors.confirmPassword && <AppText color="#BE0B0B" family="InterRegular" size={12}>{errors.confirmPassword}</AppText>}
                <Pressable style={[styles.buttonView, { backgroundColor: isValid ? colors.blue : '#A0A0A0', marginTop: 24 }]} onPress={() => handleSubmit()} disabled={!isValid || isSubmitting}>
                  {isSubmitting ? <ActivityIndicator size="small" color="white" /> : <AppText color="white" family="InterBold" size={16}>Sign Up</AppText>}
                </Pressable>
                <View style={{ height: 5 }} />
                <AppText color="gray" family="InterSemiBold" size={14} align="center">
                  Already have an account?{' '}
                  <AppText color={colors.blue} family="InterSemiBold" size={14} onPress={() => navigation.replace('LoginScreen')}>Sign In</AppText>
                </AppText>
                <View style={{ height: 70 }} />
              </View>
            )}
          </Formik>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default SignUpScreen;
