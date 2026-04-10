import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useToast } from '../contexts/ToastContext'

const EMPTY_FORM = { name: '', target_amount: '', saved_amount: '', target_date: '', status: 'active' }

export default function Goals() {
  const { addToast } = useToast()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Quick "Add Savings" mini modal
  const [addSavingsGoal, setAddSavingsGoal] = useState(null)
  const [addAmount, setAddAmount] = useState('')
  const [addingSavings, setAddingSavings] = useState(false)

  const fetchGoals = async () => {
    try {
      const res = await api.get('/api/goals/')
      setGoals(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGoals() }, [])

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setError('')
    setShowForm(true)
  }

  const openEdit = (g) => {
    setForm({
      name: g.name,
      target_amount: g.target_amount,
      saved_amount: g.saved_amount,
      target_date: g.target_date || '',
      status: g.status,
    })
    setEditId(g.id)
    setError('')
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      target_amount: parseFloat(form.target_amount),
      saved_amount: parseFloat(form.saved_amount || 0),
      target_date: form.target_date || null,
    }
    try {
      if (editId) {
        await api.put(`/api/goals/${editId}/`, payload)
        addToast('Goal updated!', 'success')
      } else {
        await api.post('/api/goals/', payload)
        addToast('Goal created!', 'success')
      }
      setShowForm(false)
      fetchGoals()
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
      await api.delete(`/api/goals/${deleteId}/`)
      setDeleteId(null)
      addToast('Goal deleted.', 'info')
      fetchGoals()
    } catch (err) {
      addToast('Failed to delete.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleAddSavings = async (e) => {
    e.preventDefault()
    const amt = parseFloat(addAmount)
    if (!amt || amt <= 0) return
    setAddingSavings(true)
    try {
      const g = addSavingsGoal
      const newSaved = parseFloat(g.saved_amount) + amt
      const payload = {
        name: g.name,
        target_amount: parseFloat(g.target_amount),
        saved_amount: newSaved,
        target_date: g.target_date || null,
        status: newSaved >= parseFloat(g.target_amount) ? 'completed' : g.status,
      }
      await api.put(`/api/goals/${g.id}/`, payload)
      addToast(`+${fmt(amt)} added to "${g.name}"!`, 'success')
      setAddSavingsGoal(null)
      setAddAmount('')
      fetchGoals()
    } catch (err) {
      addToast('Failed to update savings.', 'error')
    } finally {
      setAddingSavings(false)
    }
  }

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  const statusConfig = {
    active:    { label: 'Active',    class: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
    completed: { label: 'Completed', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    cancelled: { label: 'Cancelled', class: 'bg-slate-700/50 text-slate-500 border-slate-600/30' },
  }

  const daysLeft = (dateStr) => {
    if (!dateStr) return null
    return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))
  }

  const activeGoals    = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-100">Financial Goals</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Set targets and track your savings progress</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 touch-manipulation">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden sm:inline">New Goal</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Summary strip */}
      {goals.length > 0 && (
        <div className="grid grid-cols-3 gap-3 animate-fade-in-up-delay-1">
          {[
            { label: 'Total',     value: goals.length,           color: 'text-slate-100' },
            { label: 'Active',    value: activeGoals.length,     color: 'text-sky-400' },
            { label: 'Completed', value: completedGoals.length,  color: 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="card p-3 text-center">
              <p className={`text-xl sm:text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Goal form modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={e => e.target === e.currentTarget && setShowForm(false)}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-md shadow-2xl animate-fade-in-up">
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-5 sm:hidden" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-bold text-slate-100">{editId ? 'Edit Goal' : 'New Goal'}</h2>
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
                <label className="label">Goal Name</label>
                <input
                  className="input-field"
                  placeholder="e.g. Emergency Fund, New Laptop…"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Target Amount</label>
                  <input
                    type="number" step="0.01" min="0"
                    className="input-field"
                    placeholder="0.00"
                    value={form.target_amount}
                    onChange={e => setForm({ ...form, target_amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Saved So Far</label>
                  <input
                    type="number" step="0.01" min="0"
                    className="input-field"
                    placeholder="0.00"
                    value={form.saved_amount}
                    onChange={e => setForm({ ...form, saved_amount: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">
                    Target Date <span className="text-slate-600">(optional)</span>
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.target_date}
                    onChange={e => setForm({ ...form, target_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select
                    className="input-field"
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 touch-manipulation">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 touch-manipulation">
                  {saving && <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />}
                  {editId ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Savings modal */}
      {addSavingsGoal && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={e => e.target === e.currentTarget && setAddSavingsGoal(null)}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-sm shadow-2xl animate-fade-in-up">
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-5 sm:hidden" />
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display text-lg font-bold text-slate-100">Add Savings</h2>
              <button onClick={() => setAddSavingsGoal(null)} className="text-slate-400 hover:text-slate-100 p-2 rounded-xl hover:bg-slate-800 transition-colors touch-manipulation">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Adding to <span className="text-emerald-400 font-semibold">{addSavingsGoal.name}</span>
              <span className="text-slate-600"> · currently {fmt(addSavingsGoal.saved_amount)} saved</span>
            </p>

            {/* Progress preview */}
            <div className="mb-4">
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.min(addSavingsGoal.percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-500">{fmt(addSavingsGoal.saved_amount)}</span>
                <span className="text-slate-500">{fmt(addSavingsGoal.target_amount)}</span>
              </div>
            </div>

            <form onSubmit={handleAddSavings} className="space-y-4">
              <div>
                <label className="label">Amount to add</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input-field text-2xl font-display font-bold text-emerald-400 text-center"
                  placeholder="0.00"
                  value={addAmount}
                  onChange={e => setAddAmount(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              {/* Quick amount chips */}
              <div className="flex gap-2 flex-wrap">
                {[10, 25, 50, 100, 250].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAddAmount(String(amt))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all touch-manipulation ${
                      addAmount === String(amt)
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    +${amt}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setAddSavingsGoal(null)} className="btn-secondary flex-1 touch-manipulation">
                  Cancel
                </button>
                <button type="submit" disabled={addingSavings} className="btn-primary flex-1 flex items-center justify-center gap-2 touch-manipulation">
                  {addingSavings && <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />}
                  Add Savings
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
            <h3 className="font-display text-lg font-bold text-slate-100 text-center mb-1">Delete Goal?</h3>
            <p className="text-slate-400 text-sm text-center mb-6">All progress will be lost. This cannot be undone.</p>
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
          <p className="text-xs text-slate-500">Loading goals…</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="card text-center py-14 animate-fade-in-up-delay-1">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5" />
            </svg>
          </div>
          <p className="text-slate-300 font-semibold mb-1">No goals yet</p>
          <p className="text-slate-500 text-sm mb-6">Set a target and track your savings progress here.</p>
          <button onClick={openAdd} className="btn-primary touch-manipulation">Create first goal</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 animate-fade-in-up-delay-1">
          {goals.map(g => {
            const days = daysLeft(g.target_date)
            const cfg = statusConfig[g.status]
            const pct = Math.min(g.percentage, 100)
            const remaining = parseFloat(g.target_amount) - parseFloat(g.saved_amount)
            return (
              <div key={g.id} className={`card group relative overflow-hidden hover:border-slate-700 transition-colors ${g.status === 'completed' ? 'border-emerald-500/20' : ''}`}>
                {g.status === 'completed' && (
                  <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
                )}
                <div className="relative z-10">
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-slate-100 text-base truncate">{g.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${cfg.class}`}>{cfg.label}</span>
                      </div>
                      {g.target_date && (
                        <p className={`text-xs mt-0.5 ${days !== null && days < 0 ? 'text-red-400' : days !== null && days <= 30 ? 'text-orange-400' : 'text-slate-500'}`}>
                          {days !== null && days < 0
                            ? `${Math.abs(days)} days overdue`
                            : days !== null
                              ? `${days} days left · ${g.target_date}`
                              : g.target_date}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(g)} className="btn-edit text-xs px-2.5 py-1.5 touch-manipulation">
                        Edit
                      </button>
                      <button onClick={() => setDeleteId(g.id)} className="btn-danger text-xs px-2.5 py-1.5 touch-manipulation">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <p className="text-xs text-slate-500">Saved</p>
                      <p className="text-lg font-display font-bold text-emerald-400">{fmt(g.saved_amount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Target</p>
                      <p className="text-lg font-display font-bold text-slate-200">{fmt(g.target_amount)}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        g.status === 'completed'
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-sky-500 to-emerald-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs mb-3">
                    <span className="text-slate-500">
                      {g.percentage >= 100 ? '🎉 Goal reached!' : `${fmt(remaining)} to go`}
                    </span>
                    <span className="font-mono font-bold text-sky-400">{g.percentage}%</span>
                  </div>

                  {/* Quick Add Savings button */}
                  {g.status === 'active' && (
                    <button
                      onClick={() => { setAddSavingsGoal(g); setAddAmount('') }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition-all duration-200 active:scale-[0.98] touch-manipulation"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Add Savings
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
