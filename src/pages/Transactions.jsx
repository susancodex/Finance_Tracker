import { useEffect, useState } from 'react'
import api from '../api/axios'

const EMPTY_FORM = {
  note: '',
  amount: '',
  type: 'expense',
  category: '',
  date: new Date().toISOString().slice(0, 10),
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [filter, setFilter] = useState('all')

  const fetchAll = async () => {
    try {
      const [txRes, catRes] = await Promise.all([
        api.get('/api/transactions/'),
        api.get('/api/categories/'),
      ])
      setTransactions(txRes.data)
      setCategories(catRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.id === catId)
    return cat?.name || '—'
  }

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setError('')
    setShowForm(true)
  }

  const openEdit = (tx) => {
    setForm({
      note: tx.note || '',
      amount: tx.amount,
      type: tx.type || 'expense',
      category: tx.category || '',
      date: tx.date || new Date().toISOString().slice(0, 10),
    })
    setEditId(tx.id)
    setError('')
    setShowForm(true)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      amount: parseFloat(form.amount),
      category: form.category ? parseInt(form.category) : null,
    }

    try {
      if (editId) {
        await api.put(`/api/transactions/${editId}/`, payload)
      } else {
        await api.post('/api/transactions/', payload)
      }
      setShowForm(false)
      fetchAll()
    } catch (err) {
      const data = err.response?.data
      if (data) {
        setError(Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n'))
      } else {
        setError('Failed to save transaction.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/transactions/${id}/`)
      setDeleteId(null)
      fetchAll()
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter(t => t.type === filter)

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-100">Transactions</h1>
          <p className="text-slate-400 text-sm mt-1">{transactions.length} total transactions</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Transaction
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 animate-fade-in-up-delay-1">
        {['all', 'income', 'expense'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
              filter === f
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md animate-fade-in-up shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-slate-100">
                {editId ? 'Edit Transaction' : 'New Transaction'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm whitespace-pre-line">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Note <span className="text-slate-600">(optional)</span></label>
                <input name="note" className="input-field" placeholder="What was this for?" value={form.note} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Amount</label>
                  <input name="amount" type="number" step="0.01" min="0" className="input-field" placeholder="0.00" value={form.amount} onChange={handleChange} required />
                </div>
                <div>
                  <label className="label">Date</label>
                  <input name="date" type="date" className="input-field" value={form.date} onChange={handleChange} required />
                </div>
              </div>

              <div>
                <label className="label">Type</label>
                <select name="type" className="input-field" value={form.type} onChange={handleChange}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="label">Category</label>
                <select name="category" className="input-field" value={form.category} onChange={handleChange}>
                  <option value="">— None —</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" /> : null}
                  {editId ? 'Save Changes' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-display text-lg font-bold text-slate-100 mb-2">Delete Transaction?</h3>
            <p className="text-slate-400 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 hover:bg-red-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-95">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card animate-fade-in-up-delay-2 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Note</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Category</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Date</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Type</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Amount</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map(tx => {
                  const isIncome = tx.type === 'income'
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-200">{tx.note || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
                          {getCategoryName(tx.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                        {tx.date || tx.created_at?.slice(0, 10)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          isIncome
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {isIncome ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-mono font-medium ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isIncome ? '+' : '-'}{fmt(tx.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(tx)} className="btn-edit text-xs px-3 py-1.5">Edit</button>
                          <button onClick={() => setDeleteId(tx.id)} className="btn-danger text-xs px-3 py-1.5">Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
