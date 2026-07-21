import { View, StyleSheet } from 'react-native';
import React from 'react';
import AppText from '../../components/AppText/AppText';

const FormSection = ({ title }: { title: string }) => {
  return (
    <View style={styles.container}>
      <AppText
        family="InterBold"
        size={12}
        color="#3d4451"
        spacing={0.3}
      >
        {title.toUpperCase()}
      </AppText>
    </View>
  );
};

export default FormSection;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 6,
  },
});