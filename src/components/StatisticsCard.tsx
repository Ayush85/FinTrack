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
    isExpanded?: boolean;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
    title,
    values,
    textStyle,
    iconStyle,
}) => (
    <View style={[styles.cardContainer]}>
        {/* Only show title if it's different from the selected period in dropdown */}
        {/* {(title !== 'Today' && title !== 'Week' && title !== 'Month') && ( */}
            <Text style={[styles.cardTitle]}>{title}</Text>
        {/* )} */}
        <View style={styles.cardValues}>
            {values.map((item, index) => (
                <View style={styles.valueRow} key={index}>
                    <Text style={[textStyle, styles.amount]}>
                        {item.amount}
                    </Text>
                    <Icon
                        name={item.iconName}
                        size={22}
                        color={item.iconColor}
                        style={iconStyle}
                        accessibilityLabel={item.iconName}
                    />
                </View>
            ))}
        </View>
    </View>
);

const styles = StyleSheet.create({
    cardContainer: {
        width: '100%',
    },
    expandedCard: {
        // Remove transform and other expanding properties
    },
    cardTitle: {
        color: COLORS.TEXT.SECONDARY,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        opacity: 0.9,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    expandedTitle: {
        fontSize: 15,
        marginBottom: 14,
        letterSpacing: 0.5,
    },
    cardValues: {
        flexDirection: 'column',
        gap: 12,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(100, 116, 139, 0.05)',
        padding: 12,
        borderRadius: 12,
    },
    amount: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.TEXT.PRIMARY,
        letterSpacing: 0.5,
    },
    expandedAmount: {
        fontSize: 22,
        letterSpacing: 0.8,
    },
});
