import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { shadowStyle } from '../../utils/typography';

const FormCard = ({ children }: any) => {
    return (   
        <View style={[styles.card, {
            shadowOffset: { width: 4, height: 5 },
            shadowColor: Platform.OS == "ios" ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.3)',
            shadowOpacity: 1,
            shadowRadius: 5,
            elevation: 8
        }]}>
            {children}
        </View>
    );
};

export default FormCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFF',
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
});