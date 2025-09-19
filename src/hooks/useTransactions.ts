import {useState, useEffect, useCallback} from 'react';
import {Transaction, ExpenseAnalysis} from '../types';
import {TransactionService} from '../services/transactionService';
import {analyzeTransactions} from '../utils';

export const useTransactions = () => {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [analysis, setAnalysis] = useState<ExpenseAnalysis>({
    today: {spent: 0, credited: 0},
    week: {spent: 0, credited: 0},
    month: {spent: 0, credited: 0},
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const transactions = await TransactionService.getTransactions();
      setAllTransactions(transactions);
      setAnalysis(analyzeTransactions(transactions));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching transactions:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const initializeTransactions = useCallback(async () => {
    try {
      setLoading(true);
      await fetchTransactions();
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions]);

  useEffect(() => {
    initializeTransactions();
  }, [initializeTransactions]);

  return {
    allTransactions,
    analysis,
    refreshing,
    loading,
    error,
    fetchTransactions,
  };
};
