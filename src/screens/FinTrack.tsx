import React from 'react';
import { SafeAreaView, FlatList, Text, Alert, StyleSheet } from 'react-native';
import {
    GradientBackground,
    Header,
    StatisticsSection,
    TransactionCard,
    FilterTabs,
} from '../components';
import { useTransactions, useFilters } from '../hooks';
import { globalStyles } from '../styles';

const FinTrack: React.FC = () => {
    const {
        allTransactions,
        analysis,
        refreshing,
        loading,
        error,
        fetchTransactions,
    } = useTransactions();

    const {
        dateFilter,
        typeFilter,
        filteredTransactions,
        setDateFilter,
        setTypeFilter,
    } = useFilters({ transactions: allTransactions });

    // Show error alert if there's an error
    React.useEffect(() => {
        if (error) {
            Alert.alert('Error', error);
        }
    }, [error]);

    if (loading) {
        // You could add a loading component here
        return null;
    }

    return (
        <GradientBackground>
            <SafeAreaView style={globalStyles.safeArea}>
                <FlatList
                    data={filteredTransactions}
                    keyExtractor={(_, index) => index.toString()}
                    refreshing={refreshing}
                    onRefresh={fetchTransactions}
                    ListHeaderComponent={
                        <>
                            <Header />
                            <StatisticsSection
                                analysis={analysis}
                                onFilterChange={setDateFilter}
                                activeFilter={dateFilter}
                            />
                            <Text style={globalStyles.transactionTitle}>Transactions</Text>
                            <FilterTabs
                                activeFilter={typeFilter}
                                onFilterChange={setTypeFilter}
                            />
                        </>
                    }
                    renderItem={({ item }) => <TransactionCard transaction={item} />}
                    contentContainerStyle={styles.contentContainer}
                />
            </SafeAreaView>
        </GradientBackground>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 50,
    },
});

export default FinTrack;
