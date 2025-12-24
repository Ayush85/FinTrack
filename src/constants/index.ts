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
} as const;

export const COLORS = {
  GRADIENT: {
    START: '#8C8CFF',
    END: '#D89DFF',
  },
  TRANSACTION: {
    DEBIT: '#e53935',
    CREDIT: '#43a047',
  },
  BACKGROUND: {
    CARD: 'rgba(255, 255, 255, 0.9)',
    HEADER: 'rgba(255, 255, 255, 0.3)',
    ACTIVE_FILTER: 'rgba(140, 78, 226, 0.12)',
    TAB: 'rgba(221, 221, 221, 0.8)',
    ACTIVE_TAB: 'rgba(98, 0, 238, 0.8)',
  },
  TEXT: {
    PRIMARY: '#000',
    SECONDARY: '#333',
    DISABLED: '#666',
    LIGHT: '#888',
    WHITE: '#fff',
  },
} as const;
