import React from 'react';
import { Linking, Platform, Pressable, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import AppText from '../../components/AppText/AppText';
import { colors } from '../../utils/Colors';
import { styles } from './styles';

const STORE_URL = Platform.OS === 'android'
  ? 'https://play.google.com/store/apps/details?id=com.fieldconnect'
  : 'https://apps.apple.com/us/search?term=fieldkonnect%20elofic';

const ForceUpdateScreen = () => {
  const handleUpdate = async () => {
    try {
      await Linking.openURL(STORE_URL);
    } catch (error) {
      console.log('App Store open error:', error);
    }
  };

  return (
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
        </View>

        <View style={[styles.container, styles.subContainer]}>
          <AppText color="#111111" family="InterSemiBold" align="center" size={26}>
            Update Required
          </AppText>
          <View style={{ height: 12 }} />
          <AppText color="#515151" family="InterRegular" align="center" size={16} lineHeight={27}>
            A new version of FieldKonnect is now available.
            {'\n\n'}
            Please update the app to continue using the latest features,
            improvements, and security updates.
          </AppText>
          <View style={{ height: 40 }} />
          <Pressable
            style={[styles.buttonView, { backgroundColor: colors.blue, alignSelf: 'center', width: '80%' }]}
            onPress={handleUpdate}
          >
            <AppText color="white" family="InterBold" size={16}>Update Now</AppText>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default ForceUpdateScreen;
