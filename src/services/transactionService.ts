import {NativeModules, PermissionsAndroid, Alert} from 'react-native';
import {Transaction, SMSMessage} from '../types';
import {TRANSACTION_CATEGORIES, TRANSACTION_TYPES} from '../constants';

const {SMSModule} = NativeModules;

/**
 * Service class for handling SMS permissions and transaction parsing
 */
export class TransactionService {
  /**
   * Requests SMS permission from the user
   * @returns Promise<boolean> - True if permission granted, false otherwise
   */
  static async requestSMSPermission(): Promise<boolean> {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission',
          message: 'FinTrack needs access to your SMS to track expenses.',
          buttonPositive: 'OK',
        },
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(
          'Permission Denied',
          'FinTrack cannot read SMS without permission.',
        );
        return false;
      }

      return true;
    } catch (err) {
      console.warn('Error requesting SMS permission:', err);
      return false;
    }
  }

  /**
   * Fetches SMS messages from the device
   * @returns Promise<SMSMessage[]> - Array of SMS messages
   */
  static async fetchSMSMessages(): Promise<SMSMessage[]> {
    try {
      const messages: SMSMessage[] = await SMSModule.getMessages();
      return messages;
    } catch (error) {
      console.error('Error fetching SMS:', error);
      throw new Error('Failed to fetch SMS messages');
    }
  }

  /**
   * Parses SMS messages to extract transaction information
   * @param messages - Array of SMS messages to parse
   * @returns Transaction[] - Array of parsed transactions
   */
  static parseTransactions(messages: SMSMessage[]): Transaction[] {
    return messages
      .map(msg => {
        const body = msg.body.toLowerCase();

        // Pattern matching for different transaction types
        const debitMatch =
          /(debited|spent|paid|withdrawn|purchase|pos|transaction|atm|payment|transfer to)/i.test(
            body,
          );
        const creditMatch =
          /(credited|deposit|deposited|received|refunded|transfer from|salary|income|bonus)/i.test(
            body,
          );
        const walletLoadMatch =
          /(wallet load|esewa wallet load|khalti wallet load|load wallet)/i.test(
            body,
          );
        const mobileRechargeMatch =
          /(balance credited|recharge|data pack activated|offer|bonus|data)/i.test(
            body,
          );

        // Extract amount from message
        const amountMatch = body.match(
          /(?:npr|rs)\.?\s*([\d,]+(?:\.\d{1,2})?)/i,
        );
        const date: Date | null = msg.date ? new Date(Number(msg.date)) : null;

        if (!amountMatch) {
          return null;
        }

        const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
        let type: 'Credit' | 'Debit' | 'Recharge' | null = null;
        let category:
          | 'Wallet Load'
          | 'Mobile Recharge'
          | 'Deposit'
          | 'Withdrawal'
          | 'Other' = TRANSACTION_CATEGORIES.OTHER;

        // Determine transaction type and category
        if (walletLoadMatch) {
          type = TRANSACTION_TYPES.DEBIT;
          category = TRANSACTION_CATEGORIES.WALLET_LOAD;
        } else if (mobileRechargeMatch) {
          type = TRANSACTION_TYPES.RECHARGE;
          category = TRANSACTION_CATEGORIES.MOBILE_RECHARGE;
        } else if (creditMatch) {
          type = TRANSACTION_TYPES.CREDIT;
          category = TRANSACTION_CATEGORIES.DEPOSIT;
        } else if (debitMatch) {
          type = TRANSACTION_TYPES.DEBIT;
          category = TRANSACTION_CATEGORIES.WITHDRAWAL;
        }

        if (!type) {
          return null;
        }

        return {
          type,
          amount,
          category,
          message: msg.body,
          address: msg.address,
          date,
        };
      })
      .filter((txn): txn is Transaction => txn !== null);
  }

  /**
   * Main method to fetch and parse SMS transactions
   * @returns Promise<Transaction[]> - Array of parsed transactions
   */
  static async getTransactions(): Promise<Transaction[]> {
    const hasPermission = await this.requestSMSPermission();

    if (!hasPermission) {
      throw new Error('SMS permission denied');
    }

    const messages = await this.fetchSMSMessages();
    return this.parseTransactions(messages);
  }
}
