import React, { useState, useEffect } from 'react';
import {
  SafeAreaView, View, Text, FlatList, Image, StyleSheet, PermissionsAndroid, Alert,
} from 'react-native';
import { NativeModules } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';

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
      const parsedTransactions = parseTransactions(messages);
      setFilteredTransactions(parsedTransactions);
      analyzeTransactions(parsedTransactions);
    } catch (error) {
      console.error('Error fetching SMS:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const parseTransactions = (messages: { body: string; address: string; date?: string }[]): Transaction[] => {
    return messages.map((msg) => {
      const body = msg.body.toLowerCase();
      
      // Check for various transaction patterns
      const esewaPattern = /wallet load .* of (\d+(?:,\d+)?(?:\.\d{2})?)/i;
      const ntcPattern = /mobile topup .* of (\d+(?:,\d+)?(?:\.\d{2})?)/i;
      const withdrawalPattern = /withdrawn (?:NPR\s*)?(\d+(?:,\d+)?(?:\.\d{2})?)/i;
      const depositPattern = /deposited (?:NPR\s*)?(\d+(?:,\d+)?(?:\.\d{2})?)/i;
      const generalAmountPattern = /(?:NPR|Rs)?\.?\s*(\d+(?:,\d+)?(?:\.\d{2})?)/i;

      let amount = 0;
      let type: 'Credit' | 'Debit' | null = null;

      // Try to match different patterns
      const esewaMatch = body.match(esewaPattern);
      const ntcMatch = body.match(ntcPattern);
      const withdrawalMatch = body.match(withdrawalPattern);
      const depositMatch = body.match(depositPattern);
      const generalMatch = body.match(generalAmountPattern);

      if (esewaMatch || ntcMatch) {
        amount = parseFloat((esewaMatch?.[1] || ntcMatch?.[1] || '0').replace(/,/g, ''));
        type = 'Debit';
      } else if (withdrawalMatch) {
        amount = parseFloat(withdrawalMatch[1].replace(/,/g, ''));
        type = 'Debit';
      } else if (depositMatch) {
        amount = parseFloat(depositMatch[1].replace(/,/g, ''));
        type = 'Credit';
      } else if (generalMatch && (body.includes('debited') || body.includes('withdrawn'))) {
        amount = parseFloat(generalMatch[1].replace(/,/g, ''));
        type = 'Debit';
      } else if (generalMatch && (body.includes('credited') || body.includes('deposited'))) {
        amount = parseFloat(generalMatch[1].replace(/,/g, ''));
        type = 'Credit';
      }

      let date: Date | null = null;
      if (msg.date) {
        date = new Date(Number(msg.date));
      }

      if (type && amount > 0) {
        const category = determineCategory(body);
        return { type, amount, category, message: msg.body, address: msg.address, date };
      }
      return null;
    }).filter((txn): txn is Transaction => txn !== null);
  };

  const determineCategory = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('esewa') || lowerMessage.includes('wallet')) return 'Digital Wallet';
    if (lowerMessage.includes('mobile') || lowerMessage.includes('ntc')) return 'Mobile Recharge';
    if (/food|restaurant|dining|cafe/i.test(message)) return 'Food';
    if (/shopping|mall|clothes|fashion/i.test(message)) return 'Shopping';
    if (/bill|electricity|water|gas|internet/i.test(message)) return 'Bills';
    if (/fuel|petrol|diesel|transport/i.test(message)) return 'Transport';
    if (/salary|income|bonus|deposit/i.test(message)) return 'Income';
    return 'Other';
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