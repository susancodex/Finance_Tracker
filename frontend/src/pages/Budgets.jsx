import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useToast } from '../contexts/ToastContext'

const currentMonth = () => new Date().toISOString().slice(0, 7)

function stepMonth(monthStr, delta) {
  const [y, m] = monthStr.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthLabel(monthStr) {
  const [y, m] = monthStr.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function Budgets() {
  const { addToast } = useToast()
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(currentMonth())
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ category: '', amount: '', month: currentMonth() })
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchBudgets = async () => {
    try {
      const [budRes, catRes] = await Promise.all([
        api.get(`/api/budgets/with-spending/?month=${month}`),
        api.get('/api/categories/'),
      ])
      setBudgets(budRes.data)
      setCategories(catRes.data.filter(c => c.type === 'expense'))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { setLoading(true); fetchBudgets() }, [month])

  const openAdd = () => {
    setForm({ category: '', amount: '', month })
    setEditId(null)
    setError('')
    setShowForm(true)
  }

  const openEdit = (b) => {
    setForm({ category: b.category, amount: b.amount, month: b.month })
    setEditId(b.id)
    setError('')
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = { ...form, amount: parseFloat(form.amount), category: parseInt(form.category) }
    try {
      if (editId) {
        await api.put(`/api/budgets/${editId}/`, payload)
        addToast('Budget updated!', 'success')
      } else {
        await api.post('/api/budgets/', payload)
        addToast('Budget created!', 'success')
      }
      setShowForm(false)
      fetchBudgets()
    } catch (err) {
      const data = err.response?.data
      setError(data
        ? Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n')
        : 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/api/budgets/${deleteId}/`)
      setDeleteId(null)
      addToast('Budget deleted.', 'info')
      fetchBudgets()
    } catch (err) {
      addToast('Failed to delete.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  const statusColor = (pct) => {
    if (pct >= 100) return { bar: 'bg-red-500', text: 'text-red-400', badge: 'bg-red-500/10 text-red-400 border-red-500/20' }
    if (pct >= 80)  return { bar: 'bg-orange-400', text: 'text-orange-400', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20' }
    return { bar: 'bg-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
  }

  const budgetedCategoryIds = budgets.map(b => b.category)
  const availableCategories = categories.filter(
    c => !budgetedCategoryIds.includes(c.id) || (editId && budgets.find(b => b.id === editId)?.category === c.id)
  )

  // Summary totals
  const totalLimit = budgets.reduce((s, b) => s + parseFloat(b.amount), 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)
  const overBudgetCount = budgets.filter(b => b.percentage >= 100).length

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-100">Budget Limits</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Set monthly spending caps per category</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 touch-manipulation">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden sm:inline">Add Budget</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Month nav */}
      <div className="flex items-center gap-3 animate-fade-in-up-delay-1">
        <button
          onClick={() => setMonth(m => stepMonth(m, -1))}
          className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-90 flex items-center justify-center text-slate-400 hover:text-slate-100 transition-all touch-manipulation"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm font-semibold text-slate-200">{formatMonthLabel(month)}</p>
          {month === currentMonth() && <p className="text-[10px] text-emerald-500 font-medium">Current month</p>}
        </div>
        <button
          onClick={() => setMonth(m => stepMonth(m, 1))}
          className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-90 flex items-center justify-center text-slate-400 hover:text-slate-100 transition-all touch-manipulation"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Summary bar */}
      {!loading && budgets.length > 0 && (
        <div className="grid grid-cols-3 gap-3 animate-fade-in-up-delay-1">
          {[
            { label: 'Total Limit', value: fmt(totalLimit), color: 'text-slate-100' },
            { label: 'Total Spent', value: fmt(totalSpent), color: totalSpent > totalLimit ? 'text-red-400' : 'text-emerald-400' },
            { label: 'Over Budget', value: overBudgetCount, color: overBudgetCount > 0 ? 'text-red-400' : 'text-slate-400' },
          ].map(s => (
            <div key={s.label} className="card p-3 text-center">
              <p className={`text-base sm:text-xl font-display font-bold truncate ${s.color}`}>{s.value}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={e => e.target === e.currentTarget && setShowForm(false)}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-md shadow-2xl animate-fade-in-up">
            {/* Drag handle on mobile */}
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-5 sm:hidden" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-bold text-slate-100">{editId ? 'Edit Budget' : 'New Budget'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-100 p-2 rounded-xl hover:bg-slate-800 transition-colors touch-manipulation">
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
                <label className="label">Category (Expense only)</label>
                <select
                  className="input-field"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  required
                >
                  <option value="">— Select category —</option>
                  {availableCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {availableCategories.length === 0 && !editId && (
                  <p className="text-xs text-slate-500 mt-1.5">All expense categories already have a budget this month.</p>
                )}
              </div>
              <div>
                <label className="label">Budget Limit</label>
                <input
                  type="number" step="0.01" min="0"
                  className="input-field text-lg font-semibold"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Month</label>
                <input
                  type="month"
                  className="input-field"
                  value={form.month}
                  onChange={e => setForm({ ...form, month: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 touch-manipulation">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 touch-manipulation">
                  {saving && <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />}
                  {editId ? 'Save Changes' : 'Create Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-sm shadow-2xl animate-fade-in-up">
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-5 sm:hidden" />
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-slate-100 text-center mb-1">Delete Budget?</h3>
            <p className="text-slate-400 text-sm text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 touch-manipulation">Cancel</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 touch-manipulation"
              >
                {deleting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Loading budgets…</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="card text-center py-14 animate-fade-in-up-delay-1">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p className="text-slate-300 font-semibold mb-1">No budgets for {formatMonthLabel(month)}</p>
          <p className="text-slate-500 text-sm mb-6">Add a spending limit to stay on track.</p>
          <button onClick={openAdd} className="btn-primary touch-manipulation">Create first budget</button>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in-up-delay-1">
          {budgets.map(b => {
            const colors = statusColor(b.percentage)
            const remaining = parseFloat(b.amount) - b.spent
            return (
              <div key={b.id} className="card group hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-100">{b.category_name}</h3>
                      {b.percentage >= 100 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colors.badge}`}>Over budget!</span>
                      )}
                      {b.percentage >= 80 && b.percentage < 100 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colors.badge}`}>Near limit</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {fmt(b.spent)} spent of {fmt(b.amount)}
                      {remaining >= 0
                        ? <span className="text-emerald-500"> · {fmt(remaining)} left</span>
                        : <span className="text-red-400"> · {fmt(Math.abs(remaining))} over</span>
                      }
                    </p>
                  </div>
                  <div className="flex gap-1.5 ml-3 flex-shrink-0">
                    <button
                      onClick={() => openEdit(b)}
                      className="btn-edit text-xs px-3 py-1.5 touch-manipulation"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(b.id)}
                      className="btn-danger text-xs px-3 py-1.5 touch-manipulation"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${colors.bar}`}
                    style={{ width: `${Math.min(b.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">$0</span>
                  <span className={`font-mono font-bold ${colors.text}`}>{b.percentage}%</span>
                  <span className="text-slate-600">{fmt(b.amount)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
