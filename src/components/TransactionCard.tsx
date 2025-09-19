import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Transaction } from '../types';
import { formatDate, formatCurrency } from '../utils';
import { COLORS } from '../constants';

interface TransactionCardProps {
    transaction: Transaction;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => (
    <View style={styles.transactionCard}>
        <View style={styles.rowBetween}>
            <Text
                style={[
                    styles.amount,
                    {
                        color: transaction.type === 'Debit'
                            ? COLORS.TRANSACTION.DEBIT
                            : COLORS.TRANSACTION.CREDIT,
                    },
                ]}
            >
                {formatCurrency(transaction.amount)}
            </Text>
            <Text style={styles.type}>{transaction.type}</Text>
        </View>
        <Text style={styles.category}>{transaction.category}</Text>
        <View style={styles.rowBetween}>
            <Text style={styles.address}>{transaction.address}</Text>
            <Text style={styles.date}>{formatDate(transaction.date)}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    transactionCard: {
        backgroundColor: COLORS.BACKGROUND.CARD,
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    amount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    type: {
        fontSize: 14,
        color: COLORS.TEXT.DISABLED,
    },
    category: {
        fontSize: 14,
        color: COLORS.TEXT.SECONDARY,
        marginVertical: 4,
    },
    address: {
        fontSize: 12,
        color: COLORS.TEXT.LIGHT,
    },
    date: {
        fontSize: 12,
        color: COLORS.TEXT.LIGHT,
    },
});
