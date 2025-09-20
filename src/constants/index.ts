import {DateFilter, TypeFilter} from '../types';

export const DATE_FILTERS: DateFilter[] = ['All', 'Today', 'Week', 'Month'];
export const TYPE_FILTERS: TypeFilter[] = ['All', 'Debit', 'Credit'];

export const TRANSACTION_CATEGORIES = {
  WALLET_LOAD: 'Wallet Load',
  MOBILE_RECHARGE: 'Mobile Recharge',
  DEPOSIT: 'Deposit',
  WITHDRAWAL: 'Withdrawal',
  OTHER: 'Other',
} as const;

export const TRANSACTION_TYPES = {
  CREDIT: 'Credit',
  DEBIT: 'Debit',
  RECHARGE: 'Recharge',
} as const;

export const SMS_PERMISSIONS = {
  READ_SMS: 'android.permission.READ_SMS',
} as const;

export const HEADER_IMAGES = {
  CURRENCY_ICON:
    'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/TYAQi62tlU/n2zjfmr2_expires_30_days.png',
  PROFILE_ICON:
    'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/TYAQi62tlU/nqppen4i_expires_30_days.png',
  LOGO: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/TYAQi62tlU/k6mxlwug_expires_30_days.png',
} as const;

export const COLORS = {
  GRADIENT: {
    START: '#F5F7FA',  // Light gray background
    END: '#FFFFFF',    // White gradient end
  },
  TRANSACTION: {
    DEBIT: '#B91C1C',  // Deep red for expenses
    CREDIT: '#059669', // Teal for income
  },
  BACKGROUND: {
    MAIN: '#F5F7FA',    // Light gray main background
    CARD: '#FFFFFF',    // White card background
    HEADER: '#FFFFFF',  // White header
    ACTIVE_FILTER: 'rgba(14, 165, 233, 0.15)', // Sky blue with opacity
    TAB: 'rgba(255, 255, 255, 0.9)',
    ACTIVE_TAB: '#0EA5E9', // Sky-500
  },
  TEXT: {
    PRIMARY: '#1E293B',   // Slate-800
    SECONDARY: '#64748B', // Slate-500
    LIGHT: '#94A3B8',    // Slate-400
    WHITE: '#FFFFFF',
  },
  ACCENT: '#0EA5E9',     // Sky-500
  HIGHLIGHT: '#FACC15',  // Yellow-400
} as const;
