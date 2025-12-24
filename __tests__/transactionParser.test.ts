import {TransactionService} from '../src/services/transactionService';
import {SMSMessage} from '../src/types';

describe('TransactionService.parseTransactions', () => {
  it('parses common SMS formats into transactions', () => {
    const messages: SMSMessage[] = [
      {
        body:
          'Your A/c XXXX1234 has been debited by NPR 1,250.00 on 24-12-2025. Available balance NPR 5,000.00',
        address: 'BANK',
        date: String(Date.now()),
      },
      {
        body: 'Your A/c credited with Rs. 2,000.00 via NEFT. Thank you.',
        address: 'BANK',
        date: String(Date.now()),
      },
      {
        body: 'Khalti wallet load of Rs 500 successful. Ref: 12345',
        address: 'KHALTI',
        date: String(Date.now()),
      },
      {
        body: 'Recharge of Rs 299 successful for 9801234567',
        address: 'MOB',
        date: String(Date.now()),
      },
      {
        body: 'Your OTP is 123456 for FinTrack login',
        address: 'SERVICE',
        date: String(Date.now()),
      },
    ];

    const txns = TransactionService.parseTransactions(messages);

    // OTP should be skipped
    expect(txns.find(t => t.message.includes('OTP'))).toBeUndefined();

    // Check amounts and types
    const debit = txns.find(t => t.message.includes('debited'));
    expect(debit).toBeDefined();
    expect(debit?.amount).toBeCloseTo(1250);
    expect(debit?.type).toBe('Debit');

    const credit = txns.find(t => t.message.includes('credited'));
    expect(credit).toBeDefined();
    expect(credit?.amount).toBeCloseTo(2000);
    expect(credit?.type).toBe('Credit');

    const wallet = txns.find(t => t.message.includes('Khalti'));
    expect(wallet).toBeDefined();
    expect(wallet?.amount).toBeCloseTo(500);
    expect(wallet?.category).toBe('Wallet Load');

    const recharge = txns.find(t => t.message.includes('Recharge'));
    expect(recharge).toBeDefined();
    expect(recharge?.amount).toBeCloseTo(299);
    expect(recharge?.type).toBe('Recharge');
  });
});
