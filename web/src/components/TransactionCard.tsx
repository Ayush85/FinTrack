import React from 'react'

type Transaction = {
  id: string
  title: string
  amount: number
  date: string
  type: 'credit' | 'debit'
}

export default function TransactionCard({ transaction }: { transaction: Transaction }) {
  return (
    <div className={`tx ${transaction.type}`}>
      <div className="tx-left">
        <div className="tx-title">{transaction.title}</div>
        <div className="tx-date">{transaction.date}</div>
      </div>
      <div className="tx-amount">{transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}</div>
    </div>
  )
}
