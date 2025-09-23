import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { StatisticsCard } from './StatisticsCard';
import { ExpenseAnalysis, DateFilter } from '../types';
import { DATE_FILTERS, COLORS } from '../constants';
import Icon from 'react-native-vector-icons/FontAwesome';

interface StatisticsSectionProps {
    analysis: ExpenseAnalysis;
    onFilterChange: (filter: DateFilter) => void;
    activeFilter: DateFilter;
}

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({
    analysis,
    onFilterChange,
    activeFilter,
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [currentPeriod, setCurrentPeriod] = React.useState(activeFilter);
    React.useEffect(() => {
        setCurrentPeriod(activeFilter);
    }, [activeFilter]);

    const handlePeriodSelect = (period: DateFilter) => {
        setCurrentPeriod(period);
        onFilterChange(period);
        setIsDropdownOpen(false);
    };

    return (
        <View style={styles.statisticsContainer}>
            <View style={styles.headerRow}>
                <TouchableOpacity
                    onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={styles.periodSelector}
                >
                    <Text style={styles.periodText}>{currentPeriod}</Text>
                    <Icon
                        name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                        size={12}
                        color={COLORS.TEXT.SECONDARY}
                        style={styles.chevronIcon}
                    />
                </TouchableOpacity>
                {isDropdownOpen && (
                    <View style={styles.dropdown}>
                        {DATE_FILTERS.map(period => (
                            <TouchableOpacity
                                key={period}
                                style={[
                                    styles.dropdownItem,
                                    currentPeriod === period && styles.selectedDropdownItem,
                                ]}
                                onPress={() => handlePeriodSelect(period as DateFilter)}
                            >
                                <Text style={[
                                    styles.dropdownText,
                                    currentPeriod === period && styles.selectedDropdownText,
                                ]}>
                                    {period}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            <View>
                {currentPeriod === 'All' ? (
                    // Show all period statistics
                    <>
                        <StatisticsCard
                            title="Today"
                            values={[
                                {
                                    amount: analysis.today.spent.toFixed(2),
                                    iconName: 'arrow-down',
                                    iconColor: COLORS.TRANSACTION.DEBIT,
                                },
                                {
                                    amount: analysis.today.credited.toFixed(2),
                                    iconName: 'arrow-up',
                                    iconColor: COLORS.TRANSACTION.CREDIT,
                                },
                            ]}
                            textStyle={getTextStyle('Today')}
                            iconStyle={getIconStyle('Today')}
                            isExpanded={false}
                        />
                        <View style={styles.cardSpacing} />
                        <StatisticsCard
                            title="Week"
                            values={[
                                {
                                    amount: analysis.week.spent.toFixed(2),
                                    iconName: 'arrow-down',
                                    iconColor: COLORS.TRANSACTION.DEBIT,
                                },
                                {
                                    amount: analysis.week.credited.toFixed(2),
                                    iconName: 'arrow-up',
                                    iconColor: COLORS.TRANSACTION.CREDIT,
                                },
                            ]}
                            textStyle={getTextStyle('Week')}
                            iconStyle={getIconStyle('Week')}
                            isExpanded={false}
                        />
                        <View style={styles.cardSpacing} />
                        <StatisticsCard
                            title="Month"
                            values={[
                                {
                                    amount: analysis.month.spent.toFixed(2),
                                    iconName: 'arrow-down',
                                    iconColor: COLORS.TRANSACTION.DEBIT,
                                },
                                {
                                    amount: analysis.month.credited.toFixed(2),
                                    iconName: 'arrow-up',
                                    iconColor: COLORS.TRANSACTION.CREDIT,
                                },
                            ]}
                            textStyle={getTextStyle('Month')}
                            iconStyle={getIconStyle('Month')}
                            isExpanded={false}
                        />
                    </>
                ) : (
                    // Show single period statistics
                    <StatisticsCard
                        title={currentPeriod}
                        values={[
                            {
                                amount: analysis[currentPeriod.toLowerCase() as keyof ExpenseAnalysis].spent.toFixed(2),
                                iconName: 'arrow-down',
                                iconColor: COLORS.TRANSACTION.DEBIT,
                            },
                            {
                                amount: analysis[currentPeriod.toLowerCase() as keyof ExpenseAnalysis].credited.toFixed(2),
                                iconName: 'arrow-up',
                                iconColor: COLORS.TRANSACTION.CREDIT,
                            },
                        ]}
                        textStyle={getTextStyle(currentPeriod)}
                        iconStyle={getIconStyle(currentPeriod)}
                        isExpanded={isDropdownOpen}
                    />
                )}
            </View>
        </View>
    );
};

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
    cardSpacing: {
        marginBottom: 12,
    },
    chartsButton: {
        backgroundColor: COLORS.BACKGROUND.MAIN,
        padding: 8,
        borderRadius: 8,
        marginLeft: 8,
    },
    statisticsContainer: {
        backgroundColor: COLORS.BACKGROUND.CARD,
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(100, 116, 139, 0.1)',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    periodSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.BACKGROUND.MAIN,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    periodText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.TEXT.PRIMARY,
        marginRight: 4,
    },
    chevronIcon: {
        opacity: 0.6,
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        backgroundColor: COLORS.BACKGROUND.CARD,
        borderRadius: 8,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        zIndex: 1000,
        minWidth: 120,
        borderWidth: 1,
        borderColor: 'rgba(100, 116, 139, 0.1)',
    },
    dropdownItem: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    selectedDropdownItem: {
        backgroundColor: 'rgba(100, 116, 139, 0.1)',
    },
    dropdownText: {
        fontSize: 14,
        color: COLORS.TEXT.PRIMARY,
    },
    selectedDropdownText: {
        fontWeight: '600',
    },
    valueTextDay: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.TEXT.PRIMARY,
        marginRight: 8,
    },
    arrowIconDay: {
        alignSelf: 'flex-end',
        marginBottom: 8,
    },
    valueTextWeek: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.TEXT.PRIMARY,
        marginRight: 8,
    },
    arrowIconWeek: {
        alignSelf: 'flex-end',
        marginBottom: 8,
    },
    valueTextMonth: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.TEXT.PRIMARY,
        marginRight: 8,
    },
    arrowIconMonth: {
        alignSelf: 'flex-end',
        marginBottom: 8,
    },
});
