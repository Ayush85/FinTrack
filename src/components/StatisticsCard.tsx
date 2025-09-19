import React from 'react';
import { View, Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { StatisticsCardValue } from '../types';
import { COLORS } from '../constants';

interface StatisticsCardProps {
    title: string;
    values: StatisticsCardValue[];
    textStyle: TextStyle;
    iconStyle: ViewStyle;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
    title,
    values,
    textStyle,
    iconStyle,
}) => (
    <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.cardValues}>
            {values.map((item, index) => (
                <View style={styles.valueRow} key={index}>
                    <Text style={textStyle}>{item.amount}</Text>
                    <Icon
                        name={item.iconName}
                        size={24}
                        color={item.iconColor}
                        style={iconStyle}
                    />
                </View>
            ))}
        </View>
    </View>
);

const styles = StyleSheet.create({
    cardContainer: {
        marginBottom: 32,
        marginHorizontal: 24,
    },
    cardTitle: {
        color: COLORS.TEXT.PRIMARY,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardValues: {
        alignItems: 'flex-start',
    },
    valueRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
});
