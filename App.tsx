import React, { useState, useEffect } from 'react';
import {
  View, Text, Button, FlatList, PermissionsAndroid, Alert, StyleSheet
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NativeModules } from 'react-native';

const { SMSModule } = NativeModules;

interface Transaction {
  type: 'Credit' | 'Debit';
  amount: number;
  category: string;
  message: string;
  address: string;
  date: Date | null;
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

  useEffect(() => {
    requestSMSPermission();
  }, []);

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
      const parsedTransactions = parseTransactions(messages);
      setTransactions(parsedTransactions);
      filterTransactions(parsedTransactions, selectedCategory);
      analyzeTransactions(parsedTransactions);
    } catch (error) {
      console.error('Error fetching SMS:', error);
    }
  };

  const parseTransactions = (messages: { body: string; address: string }[]): Transaction[] => {
    return messages.map((msg) => {
      const body = msg.body.toLowerCase();
      const debitMatch = /debited|spent|paid|withdrawn|purchase|pos|transaction|atm|payment|transfer to/i.test(body);
      const creditMatch = /credited|deposit|deposited|received|refunded|transfer from|salary|income|bonus/i.test(body);
      const amountMatch = body.match(/(?:NPR|Rs)\.?\s*([\d,]+)/i);

      let date: Date | null = null;
      const dateMatch = body.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/);
      if (dateMatch) {
        const [_, day, month, year] = dateMatch;
        date = new Date(`${year}-${month}-${day}`);
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
    }).filter((txn): txn is Transaction => txn !== null);
  };

  const determineCategory = (message: string): string => {
    if (/food|restaurant|dining|cafe/i.test(message)) return 'Food';
    if (/shopping|mall|clothes|fashion/i.test(message)) return 'Shopping';
    if (/bill|electricity|water|gas|internet/i.test(message)) return 'Bills';
    if (/fuel|petrol|diesel|transport/i.test(message)) return 'Transport';
    if (/salary|income|bonus|deposit/i.test(message)) return 'Income';
    return 'Other';
  };

  const filterTransactions = (txns: Transaction[], category: string) => {
    const filtered = category === 'All' ? txns : txns.filter((txn) => txn.category === category);
    setFilteredTransactions(filtered);
    analyzeTransactions(filtered);
  };

  const analyzeTransactions = (transactionsToAnalyze: Transaction[]) => {
    let totalSpent = 0, totalCredited = 0;
    let categoryBreakdown: Record<string, number> = {};

    transactionsToAnalyze.forEach((txn) => {
      if (txn.type === 'Debit') {
        totalSpent += txn.amount;
        categoryBreakdown[txn.category] = (categoryBreakdown[txn.category] || 0) + txn.amount;
      } else {
        totalCredited += txn.amount;
      }
    });

    setAnalysis({
      totalSpent,
      totalCredited,
      availableBalance: totalCredited - totalSpent,
      categoryBreakdown,
    });
  };

  return (
    <View style={styles.container}>
      <Button title="Fetch Transactions" onPress={fetchSMS} color="#6200EE" />
      <Picker selectedValue={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); filterTransactions(transactions, val); }}>
        <Picker.Item label="All" value="All" />
        <Picker.Item label="Food" value="Food" />
        <Picker.Item label="Shopping" value="Shopping" />
      </Picker>
      <Text>💰 Available Balance: Rs. {analysis.availableBalance}</Text>
      <FlatList
        data={filteredTransactions}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => <Text>{item.type}: Rs. {item.amount} ({item.category})</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5' },
});

export default FinTrack;
