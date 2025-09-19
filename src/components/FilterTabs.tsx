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
        justifyContent: 'center',
        marginVertical: 10,
    },
    typeTab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: COLORS.BACKGROUND.TAB,
    },
    activeTypeTab: {
        backgroundColor: COLORS.BACKGROUND.ACTIVE_TAB,
    },
    typeTabText: {
        color: COLORS.TEXT.SECONDARY,
        fontWeight: '600',
    },
    activeTypeTabText: {
        color: COLORS.TEXT.WHITE,
    },
});
