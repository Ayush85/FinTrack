import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { StatisticsCard } from './StatisticsCard';
import { ExpenseAnalysis, DateFilter } from '../types';
import { DATE_FILTERS, COLORS } from '../constants';

interface StatisticsSectionProps {
    analysis: ExpenseAnalysis;
    onFilterChange: (filter: DateFilter) => void;
    activeFilter: DateFilter;
}

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({
    analysis,
    onFilterChange,
    activeFilter,
}) => (
    <View style={styles.statisticsContainer}>
        {DATE_FILTERS.filter(filter => filter !== 'All').map((period) => (
            <TouchableOpacity
                key={period}
                onPress={() => onFilterChange(period as DateFilter)}
                style={[
                    activeFilter === period && styles.activeStatisticsCard,
                ]}
            >
                <StatisticsCard
                    title={period}
                    values={[
                        {
                            amount: analysis[period.toLowerCase() as keyof ExpenseAnalysis].spent.toFixed(2),
                            iconName: 'caret-up',
                            iconColor: 'red',
                        },
                        {
                            amount: analysis[period.toLowerCase() as keyof ExpenseAnalysis].credited.toFixed(2),
                            iconName: 'caret-down',
                            iconColor: 'green',
                        },
                    ]}
                    textStyle={getTextStyle(period)}
                    iconStyle={getIconStyle(period)}
                />
            </TouchableOpacity>
        ))}
    </View>
);

const getTextStyle = (period: string) => {
    switch (period) {
        case 'Today':
            return styles.valueTextDay;
        case 'Week':
            return styles.valueTextWeek;
        case 'Month':
            return styles.valueTextMonth;
        default:
            return styles.valueTextDay;
    }
};

const getIconStyle = (period: string) => {
    switch (period) {
        case 'Today':
            return styles.arrowIconDay;
        case 'Week':
            return styles.arrowIconWeek;
        case 'Month':
            return styles.arrowIconMonth;
        default:
            return styles.arrowIconDay;
    }
};

const styles = StyleSheet.create({
    statisticsContainer: {
        paddingVertical: 24,
        marginBottom: 10,
    },
    activeStatisticsCard: {
        borderRadius: 10,
        backgroundColor: COLORS.BACKGROUND.ACTIVE_FILTER,
    },
    valueTextDay: {
        fontSize: 56,
        fontWeight: 'bold',
        color: COLORS.TEXT.PRIMARY,
        marginRight: 8,
    },
    arrowIconDay: {
        alignSelf: 'flex-end',
        marginBottom: 10,
    },
    valueTextWeek: {
        fontSize: 48,
        fontWeight: 'bold',
        color: COLORS.TEXT.PRIMARY,
        marginRight: 6,
    },
    arrowIconWeek: {
        alignSelf: 'flex-end',
        marginBottom: 6,
    },
    valueTextMonth: {
        fontSize: 40,
        fontWeight: 'bold',
        color: COLORS.TEXT.PRIMARY,
        marginRight: 4,
    },
    arrowIconMonth: {
        alignSelf: 'flex-end',
        marginBottom: 4,
    },
});
