import {NativeModules, PermissionsAndroid, Alert} from 'react-native';
import {Transaction, SMSMessage} from '../types';
import {TRANSACTION_CATEGORIES, TRANSACTION_TYPES} from '../constants';

const {SMSModule} = NativeModules;

/**
 * Service class for handling SMS permissions and transaction parsing
 */
export class TransactionService {
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
   */
  static parseTransactions(messages: SMSMessage[]): Transaction[] {
    return messages
      .map(msg => {
        const body = msg.body;

        // Extract amount first
        const amountMatch =
          body.match(/(?:npr|rs|usd|cad|eur)\.?\s*([\d,]+(?:\.\d{1,2})?)/i) ||
          body.match(/amount\s+([\d,]+(?:\.\d{1,2})?)/i);

        if (!amountMatch) {
          return null; // No amount, likely not a transaction
        }

        const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
        const date: Date | null = msg.date ? new Date(Number(msg.date)) : null;
        const remarksMatch = body.match(/remarks?:?\s*(.+)/i);
        const remarks = remarksMatch ? remarksMatch[1].trim() : null;

        // Transaction keywords
        const debitKeywords =
          /(debited|spent|paid|withdrawn|purchase|pos|transaction|atm|transfer to|load wallet|wallet load)/i;
        const creditKeywords =
          /(credited|deposit|deposited|received|refunded|transfer from|salary|income|bonus|payment received)/i;
        const rechargeKeywords =
          /(recharge|balance credited|data pack|topup|data|voice pack)/i;

        // Exclusion patterns (promotions/offers)
        const excludePatterns =
          /(offer|free|promotion|discount|cashback|reward|lottery|win|prize|gift|voucher|deal|sale)/i;
        if (excludePatterns.test(body)) {
          return null;
        }

        // Check type
        let type: string | null = null;
        let category: string = TRANSACTION_CATEGORIES.OTHER;

        if (creditKeywords.test(body)) {
          type = TRANSACTION_TYPES.CREDIT;
          category = TRANSACTION_CATEGORIES.DEPOSIT;
        } else if (debitKeywords.test(body)) {
          type = TRANSACTION_TYPES.DEBIT;
          if (/esewa|khalti|imepay|wallet/i.test(body)) {
            category = TRANSACTION_CATEGORIES.WALLET_LOAD;
          } else {
            category = TRANSACTION_CATEGORIES.WITHDRAWAL;
          }
        } else if (rechargeKeywords.test(body)) {
          type = TRANSACTION_TYPES.RECHARGE;
          category = TRANSACTION_CATEGORIES.MOBILE_RECHARGE;
        } else {
          return null; // no valid transaction type
        }

        return {
          type,
          amount,
          category,
          message: msg.body,
          address: msg.address,
          date,
          remarks,
        };
      })
      .filter((txn): txn is Transaction => txn !== null);
  }

  static async getTransactions(): Promise<Transaction[]> {
    const hasPermission = await this.requestSMSPermission();
    if (!hasPermission) {
      throw new Error('SMS permission denied');
    }

    const messages = await this.fetchSMSMessages();
    console.log('Fetched SMS Messages:', messages);
    const transactions = this.parseTransactions(messages);
    console.log('Parsed Transactions:', transactions);
    return transactions;
  }
}
