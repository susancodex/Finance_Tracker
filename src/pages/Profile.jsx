import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'

export default function Profile() {
  const { user, fetchCurrentUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ username: user?.username || '', phone_number: user?.phone_number || '' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError, setPwError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handlePwChange = (e) => setPwForm({ ...pwForm, [e.target.name]: e.target.value })

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await api.patch('/api/users/me/', { username: form.username, phone_number: form.phone_number })
      await fetchCurrentUser()
      setSuccess('Profile updated successfully.')
      setEditing(false)
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n') : 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError('New passwords do not match.')
      return
    }
    if (pwForm.new_password.length < 6) {
      setPwError('Password must be at least 6 characters.')
      return
    }
    setPwSaving(true)
    setPwError('')
    setPwSuccess('')
    try {
      await api.post('/api/change-password/', {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      })
      setPwSuccess('Password changed successfully.')
      setPwForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      const data = err.response?.data
      setPwError(data?.detail || data?.error || 'Failed to change password.')
    } finally {
      setPwSaving(false)
    }
  }

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'FT'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="font-display text-3xl font-bold text-slate-100">Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account information</p>
      </div>

      {/* Profile card */}
      <div className="card animate-fade-in-up-delay-1">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 font-bold text-xl flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-display text-xl font-bold text-slate-100">{user?.username || 'User'}</p>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <span className="mt-1 inline-block text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium capitalize">
              {user?.role || 'user'}
            </span>
          </div>
        </div>

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm whitespace-pre-line">
            {error}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input name="username" className="input-field" value={form.username} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Phone Number <span className="text-slate-600">(optional)</span></label>
              <input name="phone_number" className="input-field" placeholder="+1 555 000 0000" value={form.phone_number} onChange={handleChange} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setEditing(false); setError('') }} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving && <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <p className="text-xs text-slate-500 mb-1">Username</p>
                <p className="text-sm text-slate-200">{user?.username || '—'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <p className="text-xs text-slate-500 mb-1">Email</p>
                <p className="text-sm text-slate-200">{user?.email || '—'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <p className="text-xs text-slate-500 mb-1">Phone</p>
                <p className="text-sm text-slate-200">{user?.phone_number || '—'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <p className="text-xs text-slate-500 mb-1">Member since</p>
                <p className="text-sm text-slate-200">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</p>
              </div>
            </div>
            <button onClick={() => { setEditing(true); setSuccess(''); setError('') }} className="btn-primary w-full">
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* Change password */}
      <div className="card animate-fade-in-up-delay-2">
        <h2 className="font-display text-lg font-bold text-slate-100 mb-6">Change Password</h2>

        {pwSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            {pwSuccess}
          </div>
        )}
        {pwError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {pwError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input name="current_password" type="password" className="input-field" value={pwForm.current_password} onChange={handlePwChange} required />
          </div>
          <div>
            <label className="label">New Password</label>
            <input name="new_password" type="password" className="input-field" placeholder="At least 6 characters" value={pwForm.new_password} onChange={handlePwChange} required />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input name="confirm_password" type="password" className="input-field" value={pwForm.confirm_password} onChange={handlePwChange} required />
          </div>
          <button type="submit" disabled={pwSaving} className="btn-primary w-full flex items-center justify-center gap-2">
            {pwSaving && <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />}
            Change Password
          </button>
        </form>
      </div>
    </div>
  )
}
