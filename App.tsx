import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, PermissionsAndroid, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NativeModules } from 'react-native';

const { SMSModule } = NativeModules;

interface Transaction {
  type: 'Credit' | 'Debit';
  amount: number;
  category: string;
  message: string;
  address: string;
  date: Date | null;  // Added date to filter transactions for the current month
}

interface ExpenseAnalysis {
  totalSpent: number;
  totalCredited: number;
  availableBalance: number;
  categoryBreakdown: Record<string, number>;
}

const FinTrack: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [analysis, setAnalysis] = useState<ExpenseAnalysis>({
    totalSpent: 0,
    totalCredited: 0,
    availableBalance: 0,
    categoryBreakdown: {},
  });

  const requestSMSPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission',
          message: 'FinTrack needs access to your SMS to track expenses.',
          buttonPositive: 'OK',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'FinTrack cannot read SMS without permission.');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const fetchSMS = async () => {
    try {
      console.log('Fetching SMS...');
      const messages: { body: string; address: string; date: string }[] = await SMSModule.getMessages();
      console.log('Fetched Messages:', messages);
      const parsedTransactions = parseTransactions(messages);
      setTransactions(parsedTransactions);
      filterTransactions(parsedTransactions, selectedCategory);  // Apply category filter
      analyzeTransactions(parsedTransactions);
      console.log('Transactions:', parsedTransactions);
    } catch (error) {
      console.error('Error fetching SMS:', error);
    }
  };

  const parseTransactions = (messages: { body: string; address: string }[]): Transaction[] => {
    return messages
      .map((msg) => {
        const body = msg.body.toLowerCase();

        // Check for the presence of debit or credit keywords
        const debitMatch = body.match(/debited|spent|paid|withdrawn|purchase|pos|transaction|atm|payment|transfer to/i);
        const creditMatch = body.match(/credited|deposit|deposited|received|refunded|transfer from|salary|income|bonus/i);

        // Extract the amount from the message
        const amountMatch = body.match(/(?:NPR|Rs)\.?\s*([\d,]+)/i);

        let date = null;

        // Match date pattern (DD/MM/YYYY)
        const dateMatch = body.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/);  // Matches dates in format 28/03/2024
        if (dateMatch) {
          const [_, day, month, year] = dateMatch;

          // Create a valid date object
          date = new Date(`${year}-${month}-${day}`);  // ISO format YYYY-MM-DD

          // Check if the date is valid
          if (isNaN(date.getTime())) {
            console.warn('Invalid date:', date);
            date = null;
          }
        }

        if (amountMatch) {
          const amount = parseFloat(amountMatch[1].replace(',', ''));
          const type = creditMatch ? 'Credit' : debitMatch ? 'Debit' : null;
          const category = determineCategory(body);

          if (type) {
            return { type, amount, category, message: msg.body, address: msg.address, date };
          }
        }
        return null;
      })
      .filter((txn): txn is Transaction => txn !== null);
  };


  const determineCategory = (message: string): string => {
    if (/food|restaurant|dining|cafe/i.test(message)) { return 'Food'; }
    if (/shopping|mall|clothes|fashion/i.test(message)) { return 'Shopping'; }
    if (/bill|electricity|water|gas|internet/i.test(message)) { return 'Bills'; }
    if (/fuel|petrol|diesel|transport/i.test(message)) { return 'Transport'; }
    if (/salary|income|bonus|deposit/i.test(message)) { return 'Income'; }
    return 'Other';
  };

  const filterTransactions = (txns: Transaction[], category: string) => {
    const filtered = category === 'All'
      ? txns
      : txns.filter((txn) => txn.category === category);
    setFilteredTransactions(filtered);
    analyzeTransactions(filtered);
  };

  const analyzeTransactions = (transactionsToAnalyze: Transaction[]) => {
    let totalSpent = 0;
    let totalCredited = 0;
    let categoryBreakdown: Record<string, number> = {};

    transactionsToAnalyze.forEach((transaction) => {
      if (transaction.type === 'Debit') {
        totalSpent += transaction.amount;
        categoryBreakdown[transaction.category] = (categoryBreakdown[transaction.category] || 0) + transaction.amount;
      } else if (transaction.type === 'Credit') {
        totalCredited += transaction.amount;
      }
    });

    setAnalysis({
      totalSpent,
      totalCredited,
      availableBalance: totalCredited - totalSpent,
      categoryBreakdown,
    });
    console.log('Analysis:', analysis);
  };

  const filterByMonth = () => {
    const currentMonth = new Date().getMonth(); // Get current month (0-11)
    console.log('Current Month:', currentMonth);
    console.log('All Transactions:', transactions);
    const filteredByMonth = transactions.filter((txn) => {
      const txnMonth = txn.date ? new Date(txn.date).getMonth() : -1;
      return txnMonth === currentMonth;
    });
    setFilteredTransactions(filteredByMonth);
    analyzeTransactions(filteredByMonth);
  };

  useEffect(() => {
    requestSMSPermission();
  }, []);

  return (
    <View style={styles.container}>
      <Button title="Fetch Transactions" onPress={fetchSMS} color="#6200EE" />
      <Button title="Show This Month's Transactions" onPress={filterByMonth} color="#03A9F4" />

      <Picker
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => {
          setSelectedCategory(itemValue);
          filterTransactions(transactions, itemValue);
        }}
        style={styles.picker}
      >
        <Picker.Item label="All Categories" value="All" />
        <Picker.Item label="Food" value="Food" />
        <Picker.Item label="Shopping" value="Shopping" />
        <Picker.Item label="Bills" value="Bills" />
        <Picker.Item label="Transport" value="Transport" />
        <Picker.Item label="Income" value="Income" />
      </Picker>

      <Text style={styles.totalText}>💰 Available Balance: Rs. {analysis.availableBalance}</Text>
      <Text style={styles.creditText}>⬆️ Total Credited: Rs. {analysis.totalCredited}</Text>
      <Text style={styles.debitText}>⬇️ Total Spent: Rs. {analysis.totalSpent}</Text>

      {Object.entries(analysis.categoryBreakdown).map(([category, amount]) => (
        <Text key={category} style={styles.categoryText}>
          📌 {category}: Rs. {amount}
        </Text>
      ))}

      <FlatList
        data={filteredTransactions}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => {
          const textColor = item.type === 'Credit' ? '#388E3C' : '#D32F2F';
          return (
            <View style={styles.card}>
              <Text style={[styles.smsText, { color: textColor }]}>
                {item.type === 'Credit' ? '⬆️' : '⬇️'} {item.message} - Rs. {item.amount} ({item.category})
              </Text>
              <TouchableOpacity style={styles.addressButton}>
                <Text style={styles.addressButtonText}>{item.address}</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5' },
  totalText: { fontSize: 18, fontWeight: 'bold', marginTop: 10, color: '#FFD700' },
  creditText: { fontSize: 16, color: '#388E3C', marginTop: 5 },
  debitText: { fontSize: 16, color: '#D32F2F', marginTop: 5 },
  categoryText: { fontSize: 16, marginTop: 5, color: '#1976D2' },
  smsText: { fontSize: 14, marginVertical: 2, color: '#212121' },
  card: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  addressButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#6200EE',
    borderRadius: 10,
    width: '40%',
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressButtonText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  picker: {
    marginTop: 20,
    width: '100%',
  },
});

export default FinTrack;
