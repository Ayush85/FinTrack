import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TypeFilter } from '../types';
import { TYPE_FILTERS, COLORS } from '../constants';

interface FilterTabsProps {
    activeFilter: TypeFilter;
    onFilterChange: (filter: TypeFilter) => void;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
    activeFilter,
    onFilterChange,
}) => (
    <View style={styles.typeTabs}>
        {TYPE_FILTERS.map((type) => (
            <TouchableOpacity
                key={type}
                style={[
                    styles.typeTab,
                    activeFilter === type && styles.activeTypeTab,
                ]}
                onPress={() => onFilterChange(type)}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${type}`}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.typeTabText,
                        activeFilter === type && styles.activeTypeTabText,
                    ]}
                >
                    {type}
                </Text>
            </TouchableOpacity>
        ))}
    </View>
);

const styles = StyleSheet.create({
    typeTabs: {
        flexDirection: 'row',
        marginVertical: 12,
        marginLeft: 16,
    },
    typeTab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginRight: 8,
        borderRadius: 8,
        backgroundColor: COLORS.BACKGROUND.MAIN,
        borderWidth: 1,
        borderColor: 'rgba(100, 116, 139, 0.1)',
    },
    activeTypeTab: {
        backgroundColor: COLORS.ACCENT,
        borderColor: COLORS.ACCENT,
    },
    typeTabText: {
        color: COLORS.TEXT.SECONDARY,
        fontWeight: '500',
        fontSize: 14,
    },
    activeTypeTabText: {
        color: COLORS.TEXT.WHITE,
        fontWeight: '600',
    },
});
