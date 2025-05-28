import React, { useState, useEffect } from 'react';
import {
  SafeAreaView, View, Text, FlatList, Image, StyleSheet, PermissionsAndroid, Alert,
} from 'react-native';
import { NativeModules } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
// import axios from 'axios';

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
  today: { spent: number; credited: number };
  week: { spent: number; credited: number };
  month: { spent: number; credited: number };
}

const FinTrack: React.FC = () => {
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [analysis, setAnalysis] = useState<ExpenseAnalysis>({
    today: { spent: 0, credited: 0 },
    week: { spent: 0, credited: 0 },
    month: { spent: 0, credited: 0 },
  });
  const [refreshing, setRefreshing] = useState(false);

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
      setRefreshing(true);
      const messages: { body: string; address: string; date: string }[] = await SMSModule.getMessages();
      console.log('Fetched Messages:', messages);
      const parsedTransactions = parseTransactions(messages);
      console.log('Parsed Transactions:', parsedTransactions);
      // const aiTransactions = await parseTransactionsBatchAI(messages);
      // console.log('AI Parsed Transactions:', aiTransactions);
      setFilteredTransactions(parsedTransactions);
      analyzeTransactions(parsedTransactions);
    } catch (error) {
      console.error('Error fetching SMS:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // const GEMINI_API_KEY = 'AIzaSyAKKELpuYSyVuhA3Yt45RNx-ZqTVehwTWA';
  // const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  // // Helper: Call Gemini API
  // async function callGeminiAPI(prompt: string): Promise<any> {
  //   try {
  //     const response = await axios.post(GEMINI_URL, {
  //       contents: [
  //         {
  //           parts: [{ text: prompt + "\n\nRespond ONLY with a valid compact JSON array. No explanation, no markdown, no comments." }],
  //         },
  //       ],
  //     }, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     const candidates = response.data.candidates;
  //     if (!candidates || candidates.length === 0) {
  //       throw new Error('No candidates returned');
  //     }

  //     const text = candidates[0].content.parts[0].text.trim();

  //     // 🛡️ Safe Parse: Remove any backticks, spaces
  //     const cleanedText = text.replace(/^`+|`+$/g, '').trim();

  //     // Parse
  //     return JSON.parse(cleanedText);
  //   } catch (error) {
  //     console.error('Error calling Gemini API:', error);
  //     return null;
  //   }
  // }

  // // Helper: Split array into batches
  // function splitIntoBatches<T>(array: T[], batchSize: number): T[][] {
  //   const batches: T[][] = [];
  //   for (let i = 0; i < array.length; i += batchSize) {
  //     batches.push(array.slice(i, i + batchSize));
  //   }
  //   return batches;
  // }

  // // Main function: Parse transactions with batching
  // async function parseTransactionsBatchAI(messages: { body: string; address: string; date?: string }[], batchSize = 10): Promise<Transaction[]> {
  //   const batches = splitIntoBatches(messages, batchSize);
  //   const allTransactions: Transaction[] = [];

  //   for (const batch of batches) {
  //     const prompt = `
  //       Extract structured transaction info for these SMS messages.
  //       Return a JSON array where each transaction object has:
  //         - type: "Credit" or "Debit"
  //         - amount: number
  //         - category: short description

  //       Messages:
  //       ${batch.map((m, i) => `${i + 1}. ${m.body}`).join('\n')}
  //     `;

  //     const aiResponse = await callGeminiAPI(prompt);

  //     if (aiResponse) {
  //       const transactions = aiResponse.map((parsedTxn: any, index: number) => ({
  //         type: parsedTxn.type,
  //         amount: parsedTxn.amount,
  //         category: parsedTxn.category,
  //         message: batch[index].body,
  //         address: batch[index].address,
  //         date: batch[index].date ? new Date(Number(batch[index].date)) : undefined,
  //       }));

  //       allTransactions.push(...transactions);
  //     }
  //   }

  //   return allTransactions;
  // }

  const parseTransactions = (messages: { body: string; address: string; date?: string }[]): Transaction[] => {
    return messages.map((msg) => {
      const body = msg.body.toLowerCase();
      const debitMatch = /(debited|spent|paid|withdrawn|purchase|pos|transaction|atm|payment|transfer to)/i.test(body);
      const creditMatch = /(credited|deposit|deposited|received|refunded|transfer from|salary|income|bonus)/i.test(body);
      const walletLoadMatch = /(wallet load|esewa wallet load|esewa load|khalti load|khalti wallet load|load wallet)/i.test(body);
      const mobileRechargeMatch = /(balance credited|recharge|data pack activated|offer|bonus|data)/i.test(body);

      const amountMatch = body.match(/(?:npr|rs)\.?\s*([\d,]+(?:\.\d{1,2})?)/i);

      let date: Date | null = null;
      if (msg.date) {
        date = new Date(Number(msg.date));
      }

      if (amountMatch) {
        const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
        let type: 'Credit' | 'Debit' | 'Recharge' | null = null;
        let category: string = 'Other';

        if (walletLoadMatch) {
          type = 'Debit';
          category = 'Wallet Load';
        } else if (mobileRechargeMatch) {
          type = 'Recharge';
          category = 'Mobile Recharge';
        } else if (creditMatch) {
          type = 'Credit';
          category = 'Deposit';
        } else if (debitMatch) {
          type = 'Debit';
          category = 'Withdrawal';
        }

        if (type) {
          return { type, amount, category, message: msg.body, address: msg.address, date };
        }
      }
      return null;
    }).filter((txn): txn is Transaction => txn !== null);
  };

  const analyzeTransactions = (transactionsToAnalyze: Transaction[]) => {
    let todaySpent = 0, todayCredited = 0, weekSpent = 0, weekCredited = 0, monthSpent = 0, monthCredited = 0;
    const now = new Date();

    transactionsToAnalyze.forEach((txn) => {
      if (!txn.date) return;
      const txnDate = new Date(txn.date);
      const isToday = txnDate.toDateString() === now.toDateString();
      const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7);
      const isThisWeek = txnDate >= weekAgo && txnDate <= now;
      const isThisMonth = txnDate.getMonth() === now.getMonth() && txnDate.getFullYear() === now.getFullYear();

      if (txn.type === 'Debit') {
        if (isToday) todaySpent += txn.amount;
        if (isThisWeek) weekSpent += txn.amount;
        if (isThisMonth) monthSpent += txn.amount;
      } else {
        if (isToday) todayCredited += txn.amount;
        if (isThisWeek) weekCredited += txn.amount;
        if (isThisMonth) monthCredited += txn.amount;
      }
    });

    setAnalysis({
      today: { spent: todaySpent, credited: todayCredited },
      week: { spent: weekSpent, credited: weekCredited },
      month: { spent: monthSpent, credited: monthCredited },
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={filteredTransactions}
          keyExtractor={(_, index) => index.toString()}
          refreshing={refreshing}
          onRefresh={fetchSMS}
          ListHeaderComponent={
            <>
              <Header />
              <StatisticsSection analysis={analysis} />
              <Text style={styles.transactionTitle}>Transactions</Text>
            </>
          }
          renderItem={({ item }) => (
            <View style={styles.transactionCard}>
              <View style={styles.rowBetween}>
                <Text style={[styles.amount, { color: item.type === 'Debit' ? '#e53935' : '#43a047' }]}>
                  Rs. {item.amount.toFixed(2)}
                </Text>
                <Text style={styles.type}>{item.type}</Text>
              </View>
              <Text style={styles.category}>{item.category}</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.address}>{item.address}</Text>
                <Text style={styles.date}>{formatDate(item.date)}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      </SafeAreaView>
    </GradientBackground>
  );
};

const Header = () => (
  <View style={styles.headerContainer}>
    <View style={styles.headerContent}>
      <View style={styles.headerInfo}>
        <Image
          source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/TYAQi62tlU/n2zjfmr2_expires_30_days.png" }}
          resizeMode="stretch"
          style={styles.headerIcon}
        />
        <Text style={styles.headerText}>{"NPR"}</Text>
      </View>
      <Image
        source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/TYAQi62tlU/nqppen4i_expires_30_days.png" }}
        resizeMode="stretch"
        style={styles.headerImage}
      />
    </View>
    <Image
      source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/TYAQi62tlU/k6mxlwug_expires_30_days.png" }}
      resizeMode="stretch"
      style={styles.headerLogo}
    />
  </View>
);

const StatisticsSection = ({ analysis }: { analysis: ExpenseAnalysis }) => (
  <View style={styles.statisticsContainer}>
    <StatisticsCard
      title="Today"
      values={[
        { amount: analysis.today.spent.toFixed(2), iconName: 'caret-up', iconColor: 'red' },
        { amount: analysis.today.credited.toFixed(2), iconName: 'caret-down', iconColor: 'green' },
      ]}
      textStyle={styles.valueTextDay}
      iconStyle={styles.arrowIconDay}
    />
    <StatisticsCard
      title="Week"
      values={[
        { amount: analysis.week.spent.toFixed(2), iconName: 'caret-up', iconColor: 'red' },
        { amount: analysis.week.credited.toFixed(2), iconName: 'caret-down', iconColor: 'green' },
      ]}
      textStyle={styles.valueTextWeek}
      iconStyle={styles.arrowIconWeek}
    />
    <StatisticsCard
      title="Month"
      values={[
        { amount: analysis.month.spent.toFixed(2), iconName: 'caret-up', iconColor: 'red' },
        { amount: analysis.month.credited.toFixed(2), iconName: 'caret-down', iconColor: 'green' },
      ]}
      textStyle={styles.valueTextMonth}
      iconStyle={styles.arrowIconMonth}
    />
  </View>
);

interface StatisticsCardProps {
  title: string;
  values: { amount: number | string; iconName: string; iconColor: string }[];
  textStyle: any;
  iconStyle: any;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ title, values, textStyle, iconStyle }) => (
  <View style={styles.cardContainer}>
    <Text style={styles.cardTitle}>{title}</Text>
    <View style={styles.cardValues}>
      {values.map((item, index) => (
        <View style={styles.valueRow} key={index}>
          <Text style={textStyle}>{item.amount}</Text>
          <Icon
            name={item.iconName}
            size={24}
            color={item.iconColor}
            style={iconStyle}
          />
        </View>
      ))}
    </View>
  </View>
);

const GradientBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LinearGradient
      colors={['#b6b6ff', '#e1affc']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ flex: 1 }}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  buttonContainer: { margin: 20 },
  headerContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 64, paddingBottom: 24, paddingHorizontal: 24 },
  headerContent: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF4D", borderRadius: 20, padding: 12 },
  headerInfo: { flexDirection: "row", alignItems: "center", paddingRight: 3, marginRight: 12 },
  headerIcon: { width: 24, height: 24, marginRight: 8 },
  headerText: { color: "#000000", fontSize: 18, fontWeight: "bold" },
  headerImage: { borderRadius: 20, width: 20, height: 20 },
  headerLogo: { width: 48, height: 48 },
  statisticsContainer: { paddingVertical: 24, marginBottom: 30 },
  cardContainer: { marginBottom: 32, marginHorizontal: 24 },
  cardTitle: { color: "#000000", fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  cardValues: { alignItems: "flex-start" },
  valueRow: { flexDirection: "row", marginBottom: 4 },
  valueText: { color: "#000000", fontSize: 40, fontWeight: "bold", marginRight: 7 },
  transactionTitle: { fontSize: 20, fontWeight: "bold", marginLeft: 20, marginTop: 10 },
  transactionCard: { margin: 10, padding: 15, borderRadius: 10, backgroundColor: '#f9f9f9', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  amount: { fontSize: 18, fontWeight: 'bold' },
  type: { fontSize: 16, fontWeight: '600', color: '#555' },
  category: { fontSize: 14, fontWeight: '500', marginBottom: 5, color: '#777' },
  address: { fontSize: 12, color: '#999' },
  date: { fontSize: 12, color: '#999' },
  valueTextDay: { fontSize: 56, fontWeight: "bold", color: "#000", marginRight: 8 },
  arrowIconDay: { alignSelf: "flex-end", marginBottom: 10 },
  valueTextWeek: { fontSize: 48, fontWeight: "bold", color: "#000", marginRight: 6 },
  arrowIconWeek: { alignSelf: "flex-end", marginBottom: 6 },
  valueTextMonth: { fontSize: 40, fontWeight: "bold", color: "#000", marginRight: 4 },
  arrowIconMonth: { alignSelf: "flex-end", marginBottom: 4 },
});

export default FinTrack;