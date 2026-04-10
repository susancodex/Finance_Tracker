import { useEffect, useState } from 'react'
import api from '../api/axios'

const EMPTY_FORM = { name: '', type: 'expense' }

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories/')
      setCategories(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setError('')
    setShowForm(true)
  }

  const openEdit = (cat) => {
    setForm({ name: cat.name, type: cat.type || 'expense' })
    setEditId(cat.id)
    setError('')
    setShowForm(true)
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editId) {
        await api.put(`/api/categories/${editId}/`, form)
      } else {
        await api.post('/api/categories/', form)
      }
      setShowForm(false)
      fetchCategories()
    } catch (err) {
      const data = err.response?.data
      if (data) {
        setError(Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n'))
      } else {
        setError('Failed to save category.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/categories/${id}/`)
      setDeleteId(null)
      fetchCategories()
    } catch (err) {
      console.error(err)
    }
  }

  const colors = [
    'from-emerald-500/20 to-teal-500/10 border-emerald-500/20',
    'from-violet-500/20 to-purple-500/10 border-violet-500/20',
    'from-sky-500/20 to-blue-500/10 border-sky-500/20',
    'from-orange-500/20 to-amber-500/10 border-orange-500/20',
    'from-rose-500/20 to-pink-500/10 border-rose-500/20',
    'from-cyan-500/20 to-teal-500/10 border-cyan-500/20',
  ]

  const iconColors = [
    'text-emerald-400', 'text-violet-400', 'text-sky-400',
    'text-orange-400', 'text-rose-400', 'text-cyan-400',
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-100">Categories</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5 sm:mt-1">{categories.length} categories configured</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden sm:inline">New Category</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-md animate-fade-in-up shadow-2xl">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-100">
                {editId ? 'Edit Category' : 'New Category'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-100 transition-colors p-1">
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
                <label className="label">Category Name</label>
                <input
                  name="name"
                  className="input-field"
                  placeholder="e.g. Food & Dining"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="label">Type</label>
                <select
                  name="type"
                  className="input-field"
                  value={form.type}
                  onChange={handleChange}
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving && (
                    <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                  )}
                  {editId ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-sm shadow-2xl">
            <h3 className="font-display text-lg font-bold text-slate-100 mb-2">Delete Category?</h3>
            <p className="text-slate-400 text-sm mb-6">
              This may affect transactions assigned to this category. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category grid */}
      {categories.length === 0 ? (
        <div className="card text-center py-12 sm:py-16 animate-fade-in-up-delay-1">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            </svg>
          </div>
          <p className="text-slate-400 mb-2">No categories yet.</p>
          <p className="text-slate-600 text-sm mb-6">Create categories to organize your transactions.</p>
          <button onClick={openAdd} className="btn-primary">Create first category</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 animate-fade-in-up-delay-1">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className={`relative bg-gradient-to-br ${colors[idx % colors.length]} border rounded-2xl p-4 sm:p-5 group transition-all duration-200 hover:scale-[1.02]`}
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center ${iconColors[idx % iconColors.length]}`}>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                  </svg>
                </div>
                {/* Always visible on mobile, hover on desktop */}
                <div className="flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => openEdit(cat)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                    title="Edit"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteId(cat.id)}
                    className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>

              <h3 className="font-display font-bold text-slate-100 text-base sm:text-lg mb-1">{cat.name}</h3>

              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10 flex items-center justify-between">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cat.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {cat.type === 'income' ? 'Income' : 'Expense'}
                </span>
                <p className="text-xs text-slate-500 font-mono">ID #{cat.id}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
