import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '../../components/AppText/AppText';

const FormRow = ({
  label,
  children,
  right
}: {
  label: string; 
  right?: 'select' | 'input' | 'multi' | 'calendar';
  children: React.ReactNode;
}) => {
  return (
    <View style={styles.row}>
      <AppText
        family="InterBold"
        size={12}
        color="#5d6a83"
        width={120}
      >
        {label}
      </AppText>

      <View style={{ flex: 1 }}>
        {children}
      </View>
      {
        right == 'select' && (
          <AppText
            family="InterBold"
            size={10}
            color="rgba(51, 40, 1, 1)"
            transform="capitalize"
            style ={{paddingHorizontal: 8, paddingVertical: 2, backgroundColor: 'rgba(213, 183, 84, 0.4)', borderRadius: 14}}
          >
            {right}
          </AppText>
        )
      }
      {
        right == 'input' && (
          <AppText
            family="InterBold"
            size={10}
            color="#122f7d"
            transform="capitalize"
            style ={{paddingHorizontal: 8, paddingVertical: 2, backgroundColor: 'rgba(138, 151, 187, 0.4)', borderRadius: 14}}
          >
            {right}
          </AppText>
        )
      }
      {
        right == 'multi' && (
          <AppText
            family="InterBold"
            size={10}
            color="#102502"
            transform="capitalize"
            style ={{paddingHorizontal: 8, paddingVertical: 2, backgroundColor: 'rgba(130, 239, 130, 0.4)', borderRadius: 14}}
          >
            {right}
          </AppText>
        )
      }
      {
        right == 'calendar' && (
          <AppText
            family="InterBold"
            size={10}
            color="#102502"
            transform="capitalize"
            style ={{paddingHorizontal: 8, paddingVertical: 2, backgroundColor: 'rgba(130, 239, 130, 0.4)', borderRadius: 14}}
          >
            {right}
          </AppText>
        )
      }
      
      
    </View>
  );
};

export default FormRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
});