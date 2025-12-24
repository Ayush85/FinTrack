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
      // fetched messages returned
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
        const body = msg.body || '';
        const lowered = body.toLowerCase();

        // Skip irrelevant or failed messages (OTP, failures, confirmations not about money)
        const skipPattern = /(?:failed|declined|cancelled|otp|one time password|password|pin|invalid|rejected|unsuccessful|not successful)/i;
        if (skipPattern.test(lowered)) {
          return null;
        }

        // Keyword lists
        const debitKeywords = [
          'debited',
          'spent',
          'paid',
          'withdrawn',
          'purchase',
          'pos',
          'atm',
          'payment',
          'transfer to',
          'sent to',
          'dr.',
          'dr:',
          'payment for',
          'deducted',
        ];
        const creditKeywords = [
          'credited',
          'deposit',
          'deposited',
          'received',
          'refunded',
          'transfer from',
          'received from',
          'salary',
          'income',
          'bonus',
          'cr.',
          'cr:',
          'cash back',
        ];
        const walletLoadKeywords = ['wallet load', 'esewa', 'khalti', 'wallet topup', 'load wallet', 'wallet load'];
        const rechargeKeywords = ['recharge', 'topup', 'top-up', 'data pack', 'package activated', 'airtel recharge', 'ntc recharge'];
        const atmKeywords = ['atm withdrawal', 'withdrawn at', 'atm'];

        // Amount extraction attempts (multiple fallbacks)
        // 1) Currency prefix/suffix like Rs, INR, NPR, ₹, रु
        const currencyRegex = /(?:rs\.?|inr|npr|₹|रु)\s*([\d,]+(?:\.\d{1,2})?)|([\d,]+(?:\.\d{1,2})?)\s*(?:rs\.?|inr|npr|₹|रु)/i;
        let amountMatch = lowered.match(currencyRegex);

        // 2) 'amount' label near number
        if (!amountMatch) {
          amountMatch = lowered.match(/amount\s*(?:is|:)?\s*([\d,]+(?:\.\d{1,2})?)/i);
        }

        // 3) generic number fallback, prefer numbers near transaction keywords
        let amount: number | null = null;
        let amountIndex = -1;

        if (amountMatch) {
          const raw = (amountMatch[1] || amountMatch[2] || '').replace(/,/g, '');
          amount = parseFloat(raw);
          amountIndex = lowered.indexOf(amountMatch[0]);
        } else {
          // find all numeric tokens
          const rawNums = Array.from(lowered.matchAll(/[\d,]+(?:\.\d{1,2})?/g)).map(m => ({text: m[0], index: m.index ?? -1}));
          if (rawNums.length) {
            // filter out tokens that look like phone numbers or long account numbers
            const candidateNums = rawNums.filter(n => {
              const digitsOnly = n.text.replace(/[^\d]/g, '');
              const hasDecimal = /\./.test(n.text);
              // treat as amount candidate if it has decimal or is reasonably short (<7 digits)
              return hasDecimal || digitsOnly.length < 7;
            });

            const keywordList = [...debitKeywords, ...creditKeywords, ...walletLoadKeywords, ...rechargeKeywords, ...atmKeywords, 'fund transfer', 'transfer to', 'transfer from'];
            let best: {text: string; index: number} | null = null;
            let bestScore = -Infinity;

            const scoreFor = (n: {text: string; index: number}) => {
              const text = n.text;
              const idx = n.index;
              let score = 0;
              if (/\./.test(text)) score += 50; // decimals are strong indicator of amount
              const digitsOnly = text.replace(/[^\d]/g, '');
              score += Math.max(0, 20 - digitsOnly.length); // shorter numbers score higher

              // proximity to currency words
              const before = lowered.slice(Math.max(0, (idx || 0) - 15), (idx || 0));
              const after = lowered.slice((idx || 0), (idx || 0) + 15);
              if (/(?:rs\.?|inr|npr|₹|रु)/i.test(before + after)) score += 40;
              if (/\b(of|amount|amt)\b/i.test(before)) score += 30;

              // proximity to transaction keywords (prefer closer)
              for (const kw of keywordList) {
                const kIdx = lowered.indexOf(kw);
                if (kIdx === -1) continue;
                const dist = Math.abs((idx || 0) - kIdx);
                score += Math.max(0, 20 - dist / 5);
              }

              return score;
            };

            const candidates = candidateNums.length ? candidateNums : rawNums;
            for (const n of candidates) {
              const s = scoreFor(n);
              if (!best || s > bestScore) {
                bestScore = s;
                best = n;
              }
            }

            if (best) {
              amount = parseFloat(best.text.replace(/,/g, ''));
              amountIndex = best.index;
            }
          }
        }

        if (!amount || isNaN(amount) || amount <= 0) {
          return null;
        }

        // Pre-check explicit transfer / credit / debit phrases for higher accuracy
        const transferToRegex = /\b(fund transfer of|transfer of|transfer to)\b/i;
        const transferFromRegex = /\b(transfer from|fund transfer from)\b/i;
        const withdrawnRegex = /\bwithdrawn\b|\bwithdrawn by\b/i;
        const debitedRegex = /\bdebited\b|\bdebited by\b|\bdeducted\b|\bpaid to\b/i;
        const creditedRegex = /\bcredited\b|\bdeposited\b|\bcredited with\b|\bdeposit by\b/i;

        // Decide transaction type by proximity of keywords to the amount (more robust)
        const findClosestKeyword = (keywords: string[]) => {
          let closest: {kw: string; dist: number} | null = null;
          for (const kw of keywords) {
            const idx = lowered.indexOf(kw);
            if (idx === -1) continue;
            const dist = Math.abs(idx - (amountIndex === -1 ? 0 : amountIndex));
            if (!closest || dist < closest.dist) closest = {kw, dist};
          }
          return closest;
        };

        // include 'fund transfer'/'transfer to/from' detection
        const debitClosest = findClosestKeyword(debitKeywords.concat(['fund transfer', 'transfer to']));
        const creditClosest = findClosestKeyword(creditKeywords.concat(['transfer from']));

        let type: 'Credit' | 'Debit' | 'Recharge' | null = null;

        const hasWalletLoad = walletLoadKeywords.some(k => lowered.includes(k));
        const hasRecharge = rechargeKeywords.some(k => lowered.includes(k));
        const hasTransferTo = transferToRegex.test(lowered) || /\bto\s+a?\/?c\b/i.test(lowered);
        const hasTransferFrom = transferFromRegex.test(lowered) || /\bfrom\s+a?\/?c\b/i.test(lowered);
        const hasWithdrawn = withdrawnRegex.test(lowered);
        const hasDebited = debitedRegex.test(lowered);
        const hasCredited = creditedRegex.test(lowered);

        // Priority-based decision
        if (hasWalletLoad) {
          type = TRANSACTION_TYPES.DEBIT;
        } else if (hasRecharge) {
          type = TRANSACTION_TYPES.RECHARGE;
        } else if (hasTransferTo || hasWithdrawn || hasDebited) {
          type = TRANSACTION_TYPES.DEBIT;
        } else if (hasTransferFrom || hasCredited) {
          type = TRANSACTION_TYPES.CREDIT;
        } else if (debitClosest && (!creditClosest || debitClosest.dist <= creditClosest.dist)) {
          type = TRANSACTION_TYPES.DEBIT;
        } else if (creditClosest) {
          type = TRANSACTION_TYPES.CREDIT;
        }

        if (!type) {
          return null;
        }

        // Category heuristics
        let category:
          | 'Wallet Load'
          | 'Mobile Recharge'
          | 'Deposit'
          | 'Withdrawal'
          | 'Other' = TRANSACTION_CATEGORIES.OTHER;

        if (walletLoadKeywords.some(k => lowered.includes(k))) {
          category = TRANSACTION_CATEGORIES.WALLET_LOAD;
        } else if (rechargeKeywords.some(k => lowered.includes(k))) {
          category = TRANSACTION_CATEGORIES.MOBILE_RECHARGE;
        } else if (type === TRANSACTION_TYPES.CREDIT) {
          category = TRANSACTION_CATEGORIES.DEPOSIT;
        } else if (type === TRANSACTION_TYPES.DEBIT && atmKeywords.some(k => lowered.includes(k))) {
          category = TRANSACTION_CATEGORIES.WITHDRAWAL;
        } else if (type === TRANSACTION_TYPES.DEBIT) {
          category = TRANSACTION_CATEGORIES.WITHDRAWAL;
        }

        const date: Date | null = msg.date ? new Date(Number(msg.date)) : null;

        const parsed = {
          type,
          amount,
          category,
          message: msg.body,
          address: msg.address,
          date,
        };

        return parsed;
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
