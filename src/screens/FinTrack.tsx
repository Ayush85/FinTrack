import React from 'react';
import {
    SafeAreaView,
    FlatList,
    Text,
    Alert,
    StyleSheet,
    View,
    ActivityIndicator,
} from 'react-native';
import {
    GradientBackground,
    Header,
    StatisticsSection,
    TransactionCard,
    FilterTabs,
} from '../components';
import Icon from 'react-native-vector-icons/FontAwesome';
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
        return (
            <GradientBackground>
                <SafeAreaView style={globalStyles.safeArea}>
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text style={styles.loadingText}>Loading transactions...</Text>
                    </View>
                </SafeAreaView>
            </GradientBackground>
        );
    }

    if (error) {
        return (
            <GradientBackground>
                <SafeAreaView style={globalStyles.safeArea}>
                    <View style={styles.centered}>
                        <Icon name="exclamation-circle" size={80} color="#EF4444" style={styles.illustration} />
                        <Text style={styles.errorText}>Something went wrong</Text>
                        <Text style={styles.errorSubText}>{error}</Text>
                    </View>
                </SafeAreaView>
            </GradientBackground>
        );
    }

    if (!filteredTransactions.length) {
        return (
            <GradientBackground>
                <SafeAreaView style={globalStyles.safeArea}>
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
                    <View style={styles.centered}>
                        <Icon name="inbox" size={80} color="#9CA3AF" style={styles.illustration} />
                        <Text style={styles.emptyText}>No transactions found</Text>
                        <Text style={styles.emptySubText}>Try changing your filters or refresh.</Text>
                    </View>
                </SafeAreaView>
            </GradientBackground>
        );
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#3B82F6',
        fontWeight: '500',
    },
    errorText: {
        fontSize: 20,
        color: '#EF4444',
        fontWeight: '700',
        marginTop: 12,
    },
    errorSubText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#6B7280',
        fontWeight: '600',
        marginTop: 12,
    },
    emptySubText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
        textAlign: 'center',
    },
    illustration: {
        marginBottom: 16,
    },
});

export default FinTrack;
