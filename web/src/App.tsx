import React from 'react'
import TransactionCard from './components/TransactionCard'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'

type Transaction = {
  id: string
  title: string
  amount: number
  date: string
  type: 'credit' | 'debit'
}

const sample: Transaction[] = [
  { id: '1', title: 'Salary', amount: 50000, date: '2025-12-01', type: 'credit' },
  { id: '2', title: 'Grocery', amount: 2500, date: '2025-12-10', type: 'debit' },
  { id: '3', title: 'Phone Recharge', amount: 299, date: '2025-12-12', type: 'debit' }
]

export default function App() {
  const [transactions] = React.useState<Transaction[]>(sample)
  const [view, setView] = React.useState<'home' | 'privacy' | 'terms'>('home')

  const balance = transactions.reduce((acc, t) => acc + (t.type === 'credit' ? t.amount : -t.amount), 0)

  if (view === 'privacy') return <PrivacyPage onBack={() => setView('home')} />
  if (view === 'terms') return <TermsPage onBack={() => setView('home')} />

  return (
    <div className="app">
      <header>
        <h1>FinTrack</h1>
        <nav>
          <button onClick={() => setView('home')}>Home</button>
          <button onClick={() => setView('privacy')}>Privacy Policy</button>
          <button onClick={() => setView('terms')}>Terms</button>
        </nav>
        <div className="balance">Balance: ₹{balance.toLocaleString()}</div>
      </header>

      <main>
        <h2>Recent Transactions</h2>
        <div className="list">
          {transactions.map(t => (
            <TransactionCard key={t.id} transaction={t} />
          ))}
        </div>
      </main>
    </div>
  )
}
