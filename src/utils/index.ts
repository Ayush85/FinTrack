import {Transaction, ExpenseAnalysis} from '../types';

/**
 * Formats a date object to DD/MM/YYYY format
 * @param date - The date to format
 * @returns Formatted date string or 'N/A' if date is null
 */
export const formatDate = (date: Date | null): string => {
  if (!date) {
    return 'N/A';
  }
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

/**
 * Analyzes transactions to calculate spending and earnings for different periods
 * @param transactions - Array of transactions to analyze
 * @returns ExpenseAnalysis object with today, week, and month data
 */
export const analyzeTransactions = (
  transactions: Transaction[],
): ExpenseAnalysis => {
  const now = new Date();
  const analysis: ExpenseAnalysis = {
    today: {spent: 0, credited: 0},
    week: {spent: 0, credited: 0},
    month: {spent: 0, credited: 0},
  };

  transactions.forEach(txn => {
    if (!txn.date) {
      return;
    }

    const txnDate = new Date(txn.date);
    const isToday = txnDate.toDateString() === now.toDateString();

    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    const isThisWeek = txnDate >= weekAgo && txnDate <= now;

    const isThisMonth =
      txnDate.getMonth() === now.getMonth() &&
      txnDate.getFullYear() === now.getFullYear();

    const amount = txn.amount;

    if (txn.type === 'Debit') {
      if (isToday) {
        analysis.today.spent += amount;
      }
      if (isThisWeek) {
        analysis.week.spent += amount;
      }
      if (isThisMonth) {
        analysis.month.spent += amount;
      }
    } else {
      if (isToday) {
        analysis.today.credited += amount;
      }
      if (isThisWeek) {
        analysis.week.credited += amount;
      }
      if (isThisMonth) {
        analysis.month.credited += amount;
      }
    }
  });

  return analysis;
};

/**
 * Checks if a date falls within a specific filter period
 * @param date - The date to check
 * @param filter - The filter period ('Today', 'Week', 'Month', or 'All')
 * @returns True if the date matches the filter
 */
export const isDateInFilterRange = (
  date: Date | null,
  filter: string,
): boolean => {
  if (!date || filter === 'All') {
    return true;
  }

  const now = new Date();
  const txnDate = new Date(date);

  switch (filter) {
    case 'Today':
      return txnDate.toDateString() === now.toDateString();
    case 'Week':
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return txnDate >= weekAgo && txnDate <= now;
    case 'Month':
      return (
        txnDate.getMonth() === now.getMonth() &&
        txnDate.getFullYear() === now.getFullYear()
      );
    default:
      return true;
  }
};

/**
 * Formats currency amount with proper commas and decimals
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return `NPR ${amount.toFixed(2)}`;
};
