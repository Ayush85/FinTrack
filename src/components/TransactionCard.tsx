import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Transaction } from '../types';
import { formatDate, formatCurrency } from '../utils';
import { COLORS } from '../constants';

interface TransactionCardProps {
    transaction: Transaction;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const getTransactionIcon = (type: Transaction['type']) => {
        switch (type) {
            case 'Credit':
                return 'arrow-circle-down';
            case 'Debit':
                return 'arrow-circle-up';
            default:
                return 'exchange';
        }
    };

    return (
        <TouchableOpacity 
            onPress={() => setIsExpanded(!isExpanded)}
            style={[styles.transactionCard, isExpanded && styles.expandedCard]}
            accessibilityRole="button"
            accessibilityLabel={`Transaction details for ${transaction.category}`}
        >
            <View style={styles.rowBetween}>
                <View style={styles.amountContainer}>
                    <Icon
                        name={getTransactionIcon(transaction.type)}
                        size={isExpanded ? 28 : 24}
                        color={transaction.type === 'Credit' ? COLORS.TRANSACTION.CREDIT : COLORS.TRANSACTION.DEBIT}
                        style={styles.icon}
                    />
                    <Text
                        style={[
                            styles.amount,
                            {
                                color: transaction.type === 'Credit'
                                    ? COLORS.TRANSACTION.CREDIT
                                    : COLORS.TRANSACTION.DEBIT,
                            },
                            isExpanded && styles.expandedAmount
                        ]}
                        accessibilityLabel={`Amount: ${transaction.amount}`}
                    >
                        {formatCurrency(transaction.amount)}
                    </Text>
                </View>
                <Text style={[
                    styles.type,
                    {
                        backgroundColor: transaction.type === 'Credit'
                            ? 'rgba(5, 150, 105, 0.1)'
                            : 'rgba(185, 28, 28, 0.1)',
                        color: transaction.type === 'Credit'
                            ? COLORS.TRANSACTION.CREDIT
                            : COLORS.TRANSACTION.DEBIT,
                    }
                ]}>
                    {transaction.type}
                </Text>
            </View>

            <Text style={[styles.category, isExpanded && styles.expandedCategory]}>
                {transaction.category}
            </Text>

            <View style={styles.rowBetween}>
                <Text style={styles.address}>{transaction.address}</Text>
                <Text style={styles.date}>{transaction.date ? formatDate(transaction.date) : '-'}</Text>
            </View>

            {isExpanded && (
                <View style={styles.expandedDetails}>
                    <View style={[styles.detailRow, styles.messageRow]}>
                        <Text style={styles.detailLabel}>SMS</Text>
                        <Text style={[styles.detailValue, styles.message]}>
                            {transaction.message || '-'}
                        </Text>
                    </View>
                </View>
            )}
            <View style={styles.expandIconContainer}>
                <Icon
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={COLORS.TEXT.SECONDARY}
                    style={styles.expandIcon}
                />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    transactionCard: {
        backgroundColor: COLORS.BACKGROUND.CARD,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 16,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(100, 116, 139, 0.1)',
    },
    expandedCard: {
        padding: 24,
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 10,
        opacity: 0.9,
    },
    amount: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    expandedAmount: {
        fontSize: 22,
    },
    type: {
        fontSize: 13,
        fontWeight: '600',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },
    category: {
        fontSize: 15,
        color: COLORS.TEXT.PRIMARY,
        marginVertical: 8,
        fontWeight: '500',
    },
    expandedCategory: {
        fontSize: 17,
        marginTop: 12,
        marginBottom: 10,
    },
    address: {
        fontSize: 13,
        color: COLORS.TEXT.SECONDARY,
        opacity: 0.8,
    },
    date: {
        fontSize: 13,
        color: COLORS.TEXT.SECONDARY,
        opacity: 0.8,
    },
    expandedDetails: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(100, 116, 139, 0.1)',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: COLORS.TEXT.SECONDARY,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        color: COLORS.TEXT.PRIMARY,
        fontWeight: '600',
        flexShrink: 1,
        textAlign: 'right',
        marginLeft: 16,
    },
    expandIconContainer: {
        alignItems: 'center',
        marginTop: 8,
    },
    expandIcon: {
        opacity: 0.6,
    },
    messageRow: {
        alignItems: 'flex-start',
    },
    message: {
        fontSize: 13,
        lineHeight: 18,
        flexShrink: 1,
        textAlign: 'left',
    },
});
