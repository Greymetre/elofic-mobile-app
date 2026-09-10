import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import AppText from '../AppText/AppText';
import { colors } from '../../utils/Colors';

const PrimaryShineChip = ({ label = 'TODAY' }: { label?: string }) => {
  const shine = useRef(new Animated.Value(-40)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shine, {
          toValue: 90,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(900),
        Animated.timing(shine, {
          toValue: -40,
          duration: 1,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [shine]);

  return (
    <View style={styles.chip}>
      <Animated.View
        style={[
          styles.shine,
          { transform: [{ translateX: shine }, { rotate: '18deg' }] },
        ]}
      />
      <AppText size={9} color={colors.blue} family="InterBold">
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: '#EDF1FF',
    borderWidth: 1,
    borderColor: '#CDD3F3',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  shine: {
    position: 'absolute',
    top: -8,
    bottom: -8,
    left: 0,
    width: 18,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
});

export default PrimaryShineChip;
