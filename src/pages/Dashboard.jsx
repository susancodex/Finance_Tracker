import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'

function StatCard({ label, value, sub, icon, accent, delay }) {
  return (
    <div className={`card animate-fade-in-up-delay-${delay} relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 -translate-y-6 translate-x-6 ${accent}`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
            {icon}
          </div>
          {sub && (
            <span className={`text-xs font-mono px-2 py-1 rounded-lg ${
              sub.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {sub}
            </span>
          )}
        </div>
        <p className="text-slate-400 text-sm mb-1">{label}</p>
        <p className="text-2xl font-display font-bold text-slate-100">{value}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/transactions/'),
      api.get('/api/categories/'),
    ]).then(([txRes, catRes]) => {
      setTransactions(txRes.data)
      setCategories(catRes.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  // Compute summary
  const income = transactions
    .filter(t => t.transaction_type === 'income' || t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

  const expense = transactions
    .filter(t => t.transaction_type === 'expense' || t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

  const balance = income - expense

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at))
    .slice(0, 5)

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.id === catId)
    return cat?.name || '—'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="font-display text-3xl font-bold text-slate-100">
          Good {new Date().getHours() < 12 ? 'morning' : 'evening'},{' '}
          <span className="text-emerald-400">{user?.username}</span> 👋
        </h1>
        <p className="text-slate-400 mt-1">Here's your financial overview.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          delay={1}
          label="Net Balance"
          value={fmt(balance)}
          accent={balance >= 0 ? 'bg-emerald-500' : 'bg-red-500'}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          delay={2}
          label="Total Income"
          value={fmt(income)}
          accent="bg-emerald-500"
          icon={
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          }
        />
        <StatCard
          delay={3}
          label="Total Expenses"
          value={fmt(expense)}
          accent="bg-red-500"
          icon={
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-5.94 2.28m5.94-2.28l-2.28-5.941" />
            </svg>
          }
        />
        <StatCard
          delay={4}
          label="Categories"
          value={categories.length}
          accent="bg-violet-500"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            </svg>
          }
        />
      </div>

      {/* Recent transactions */}
      <div className="card animate-fade-in-up-delay-3">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-bold text-slate-100">Recent Transactions</h2>
          <Link to="/transactions" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 mb-3">No transactions yet.</p>
            <Link to="/transactions" className="btn-primary text-sm">Add your first transaction</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((tx) => {
              const isIncome = tx.transaction_type === 'income' || tx.type === 'income'
              return (
                <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-colors group">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isIncome ? 'bg-emerald-500/10' : 'bg-red-500/10'
                  }`}>
                    <svg
                      className={`w-4 h-4 ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      {isIncome
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                      }
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{tx.description || tx.title || 'Transaction'}</p>
                    <p className="text-xs text-slate-500">{getCategoryName(tx.category)} · {tx.date || tx.created_at?.slice(0, 10)}</p>
                  </div>
                  <span className={`text-sm font-mono font-medium ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isIncome ? '+' : '-'}{fmt(tx.amount)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Categories summary */}
      {categories.length > 0 && (
        <div className="card animate-fade-in-up-delay-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-bold text-slate-100">Your Categories</h2>
            <Link to="/categories" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
              Manage →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span key={cat.id} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm border border-slate-700">
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
