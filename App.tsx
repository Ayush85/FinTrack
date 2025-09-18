import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  PermissionsAndroid,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { NativeModules } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';

const { SMSModule } = NativeModules;

interface Transaction {
  type: 'Credit' | 'Debit' | 'Recharge';
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

type DateFilter = 'All' | 'Today' | 'Week' | 'Month';
type TypeFilter = 'All' | 'Debit' | 'Credit';

const FinTrack: React.FC = () => {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [analysis, setAnalysis] = useState<ExpenseAnalysis>({
    today: { spent: 0, credited: 0 },
    week: { spent: 0, credited: 0 },
    month: { spent: 0, credited: 0 },
  });
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('All');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');

  useEffect(() => {
    requestSMSPermission();
  }, []);

  const applyFilter = useCallback(() => {
    const now = new Date();
    const filtered = allTransactions.filter((txn) => {
      if (!txn.date) return false;
      const txnDate = new Date(txn.date);

      let dateCondition = true;
      if (dateFilter === 'Today') {
        dateCondition = txnDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'Week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        dateCondition = txnDate >= weekAgo && txnDate <= now;
      } else if (dateFilter === 'Month') {
        dateCondition =
          txnDate.getMonth() === now.getMonth() &&
          txnDate.getFullYear() === now.getFullYear();
      }

      let typeCondition = true;
      if (typeFilter === 'Debit') typeCondition = txn.type === 'Debit';
      if (typeFilter === 'Credit') typeCondition = txn.type === 'Credit';

      return dateCondition && typeCondition;
    });
    setFilteredTransactions(filtered);
  }, [allTransactions, dateFilter, typeFilter]);

  useEffect(() => {
    applyFilter();
  }, [allTransactions, dateFilter, typeFilter, applyFilter]);

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
        Alert.alert(
          'Permission Denied',
          'FinTrack cannot read SMS without permission.'
        );
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const fetchSMS = async () => {
    try {
      setRefreshing(true);
      const messages: { body: string; address: string; date: string }[] =
        await SMSModule.getMessages();
      const parsedTransactions = parseTransactions(messages);
      setAllTransactions(parsedTransactions);
      analyzeTransactions(parsedTransactions);
    } catch (error) {
      console.error('Error fetching SMS:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const parseTransactions = (
    messages: { body: string; address: string; date?: string }[]
  ): Transaction[] => {
    return messages
      .map((msg) => {
        const body = msg.body.toLowerCase();
        const debitMatch = /(debited|spent|paid|withdrawn|purchase|pos|transaction|atm|payment|transfer to)/i.test(body);
        const creditMatch = /(credited|deposit|deposited|received|refunded|transfer from|salary|income|bonus)/i.test(body);
        const walletLoadMatch = /(wallet load|esewa wallet load|khalti wallet load|load wallet)/i.test(body);
        const mobileRechargeMatch = /(balance credited|recharge|data pack activated|offer|bonus|data)/i.test(body);

        const amountMatch = body.match(/(?:npr|rs)\.?\s*([\d,]+(?:\.\d{1,2})?)/i);
        let date: Date | null = msg.date ? new Date(Number(msg.date)) : null;

        if (amountMatch) {
          const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
          let type: 'Credit' | 'Debit' | 'Recharge' | null = null;
          let category = 'Other';

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
            return {
              type,
              amount,
              category,
              message: msg.body,
              address: msg.address,
              date,
            };
          }
        }
        return null;
      })
      .filter((txn): txn is Transaction => txn !== null);
  };

  const analyzeTransactions = (txns: Transaction[]) => {
    let todaySpent = 0, todayCredited = 0, weekSpent = 0, weekCredited = 0, monthSpent = 0, monthCredited = 0;
    const now = new Date();
    txns.forEach((txn) => {
      if (!txn.date) return;
      const txnDate = new Date(txn.date);
      const isToday = txnDate.toDateString() === now.toDateString();
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
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
              <StatisticsSection
                analysis={analysis}
                onFilterChange={setDateFilter}
                activeFilter={dateFilter}
              />
              <Text style={styles.transactionTitle}>Transactions</Text>
              <View style={styles.typeTabs}>
                {['All', 'Debit', 'Credit'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeTab, typeFilter === type && styles.activeTypeTab]}
                    onPress={() => setTypeFilter(type as TypeFilter)}
                  >
                    <Text style={[styles.typeTabText, typeFilter === type && styles.activeTypeTabText]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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

// --- Header Component ---
const Header = () => (
  <View style={styles.headerContainer}>
    <View style={styles.headerContent}>
      <View style={styles.headerInfo}>
        <Image
          source={{ uri: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/TYAQi62tlU/n2zjfmr2_expires_30_days.png' }}
          resizeMode="stretch"
          style={styles.headerIcon}
        />
        <Text style={styles.headerText}>NPR</Text>
      </View>
      <Image
        source={{ uri: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/TYAQi62tlU/nqppen4i_expires_30_days.png' }}
        resizeMode="stretch"
        style={styles.headerImage}
      />
    </View>
    <Image
      source={{ uri: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/TYAQi62tlU/k6mxlwug_expires_30_days.png' }}
      resizeMode="stretch"
      style={styles.headerLogo}
    />
  </View>
);

const StatisticsSection = ({ analysis, onFilterChange, activeFilter }: {
  analysis: ExpenseAnalysis;
  onFilterChange: (filter: DateFilter) => void;
  activeFilter: DateFilter;
}) => (
  <View style={styles.statisticsContainer}>
    {['Today', 'Week', 'Month'].map((period) => (
      <TouchableOpacity
        key={period}
        onPress={() => onFilterChange(period as DateFilter)}
        style={[activeFilter === period && styles.activeStatisticsCard]}
      >
        <StatisticsCard
          title={period}
          values={[
            {
              amount: analysis[period.toLowerCase() as keyof ExpenseAnalysis].spent.toFixed(2),
              iconName: 'caret-up',
              iconColor: 'red',
            },
            {
              amount: analysis[period.toLowerCase() as keyof ExpenseAnalysis].credited.toFixed(2),
              iconName: 'caret-down',
              iconColor: 'green',
            },
          ]}
          textStyle={
            period === 'Today'
              ? styles.valueTextDay
              : period === 'Week'
                ? styles.valueTextWeek
                : styles.valueTextMonth
          }
          iconStyle={
            period === 'Today'
              ? styles.arrowIconDay
              : period === 'Week'
                ? styles.arrowIconWeek
                : styles.arrowIconMonth
          }
        />
      </TouchableOpacity>
    ))}
  </View>
);

const StatisticsCard: React.FC<{
  title: string;
  values: { amount: number | string; iconName: string; iconColor: string }[];
  textStyle: any;
  iconStyle: any;
}> = ({ title, values, textStyle, iconStyle }) => (
  <View style={styles.cardContainer}>
    <Text style={styles.cardTitle}>{title}</Text>
    <View style={styles.cardValues}>
      {values.map((item, index) => (
        <View style={styles.valueRow} key={index}>
          <Text style={textStyle}>{item.amount}</Text>
          <Icon name={item.iconName} size={24} color={item.iconColor} style={iconStyle} />
        </View>
      ))}
    </View>
  </View>
);

const GradientBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LinearGradient
    colors={['#b6b6ff', '#e1affc']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={{ flex: 1 }}
  >
    {children}
  </LinearGradient>
);

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 64,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    padding: 12,
  },
  headerInfo: { flexDirection: 'row', alignItems: 'center', paddingRight: 3, marginRight: 12 },
  headerIcon: { width: 24, height: 24, marginRight: 8 },
  headerText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  headerImage: { borderRadius: 20, width: 20, height: 20 },
  headerLogo: { width: 48, height: 48 },

  statisticsContainer: { paddingVertical: 24, marginBottom: 10 },
  activeStatisticsCard: {
    borderRadius: 10,
    backgroundColor: 'rgba(140, 78, 226, 0.12)',
  },
  cardContainer: { marginBottom: 32, marginHorizontal: 24 },
  cardTitle: { color: '#000', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardValues: { alignItems: 'flex-start' },
  valueRow: { flexDirection: 'row', marginBottom: 4 },

  valueTextDay: { fontSize: 56, fontWeight: 'bold', color: '#000', marginRight: 8 },
  arrowIconDay: { alignSelf: 'flex-end', marginBottom: 10 },
  valueTextWeek: { fontSize: 48, fontWeight: 'bold', color: '#000', marginRight: 6 },
  arrowIconWeek: { alignSelf: 'flex-end', marginBottom: 6 },
  valueTextMonth: { fontSize: 40, fontWeight: 'bold', color: '#000', marginRight: 4 },
  arrowIconMonth: { alignSelf: 'flex-end', marginBottom: 4 },

  typeTabs: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10 },
  typeTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(221, 221, 221, 0.8)',
  },
  activeTypeTab: { backgroundColor: 'rgba(98, 0, 238, 0.8)' },
  typeTabText: { color: '#333', fontWeight: '600' },
  activeTypeTabText: { color: '#fff' },

  transactionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 5,
    color: '#000',
  },

  transactionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  amount: { fontSize: 18, fontWeight: 'bold' },
  type: { fontSize: 14, color: '#666' },
  category: { fontSize: 14, color: '#333', marginVertical: 4 },
  address: { fontSize: 12, color: '#888' },
  date: { fontSize: 12, color: '#888' },
});

export default FinTrack;
