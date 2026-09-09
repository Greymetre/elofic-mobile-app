import React from 'react';
import { Pressable, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import AppText from '../../components/AppText/AppText';
import { styles } from './styles';

const AccountPendingScreen = ({ navigation }: { navigation: any }) => (
  <View style={styles.container}>
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      bottomOffset={50}
    >
      <View style={[styles.logoView, styles.center]}>
        <FastImage
          style={styles.logo}
          resizeMode="contain"
          source={require('../../assets/images/FieldKonnectLogo.png')}
        />
        <FastImage
          style={styles.eloficLogo}
          resizeMode="contain"
          source={require('../../assets/images/elofic_logo_login.png')}
        />
      </View>
      <View style={[styles.container, styles.subContainer]}>
        <AppText color="#111111" family="InterSemiBold" align="center" size={24}>
          Account Under Review
        </AppText>
        <View style={{ height: 10 }} />
        <AppText color="#515151" family="InterRegular" align="center" size={16} lineHeight={26}>
          Your account request has been submitted successfully.{`\n\n`}
          Admin will verify your account and contact you soon.
        </AppText>
        <Pressable
          style={[styles.buttonView, { marginTop: 40, width: '80%', alignSelf: 'center' }]}
          onPress={() => navigation.replace('LoginScreen')}
        >
          <AppText color="white" family="InterBold" size={16}>Back to Login</AppText>
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  </View>
);

export default AccountPendingScreen;
