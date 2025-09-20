export interface Transaction {
  id: string;
  type: 'Credit' | 'Debit' | 'Recharge';
  amount: number;
  category:
    | 'Wallet Load'
    | 'Mobile Recharge'
    | 'Deposit'
    | 'Withdrawal'
    | 'Other';
  message: string;
  address: string;
  date: Date | null;
  bank?: string;
  balance?: number;
  description?: string;
}

export interface ExpenseAnalysis {
  today: {spent: number; credited: number};
  week: {spent: number; credited: number};
  month: {spent: number; credited: number};
}

export type DateFilter = 'All' | 'Today' | 'Week' | 'Month';
export type TypeFilter = 'All' | 'Debit' | 'Credit';

export interface SMSMessage {
  body: string;
  address: string;
  date?: string;
}

export interface StatisticsCardValue {
  amount: number | string;
  iconName: string;
  iconColor: string;
}
