import { useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'

export default function Profile() {
  const { user, fetchCurrentUser } = useAuth()
  const [editing, setEditing]   = useState(false)
  const [form, setForm]         = useState({ username: user?.username || '', phone_number: user?.phone_number || '' })
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState('')
  const [error, setError]       = useState('')

  // Profile picture state
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile]       = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError]     = useState('')
  const fileInputRef = useRef(null)

  // Password state
  const [pwForm, setPwForm]     = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError, setPwError]   = useState('')

  const handleChange   = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handlePwChange = (e) => setPwForm({ ...pwForm, [e.target.name]: e.target.value })

  // ── Avatar selection ──────────────────────────────────────────────────────
  const handleAvatarSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be smaller than 5 MB.')
      return
    }

    setAvatarError('')
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    setUploadingAvatar(true)
    setAvatarError('')
    try {
      const formData = new FormData()
      formData.append('profile_picture', avatarFile)
      await api.patch('/api/users/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await fetchCurrentUser()
      setAvatarFile(null)
      setAvatarPreview(null)
      setSuccess('Profile picture updated.')
    } catch {
      setAvatarError('Failed to upload picture. Please try again.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleAvatarCancel = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    setAvatarError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Profile info save ──────────────────────────────────────────────────────
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
      setError(data
        ? Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n')
        : 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  // ── Password change ────────────────────────────────────────────────────────
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm_password) { setPwError('New passwords do not match.'); return }
    if (pwForm.new_password.length < 6) { setPwError('Password must be at least 6 characters.'); return }
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

  const initials      = user?.username ? user.username.slice(0, 2).toUpperCase() : 'FT'
  const avatarSrc     = avatarPreview || (user?.profile_picture ? user.profile_picture : null)

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="font-display text-3xl font-bold text-slate-100">Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account information</p>
      </div>

      {/* ── Profile card ── */}
      <div className="card animate-fade-in-up-delay-1">

        {/* Avatar + name header */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-800">

          {/* Avatar with click-to-upload */}
          <div className="relative flex-shrink-0 group">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Profile"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 font-bold text-2xl">
                {initials}
              </div>
            )}

            {/* Camera overlay — click to pick file */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="Change photo"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelect}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-display text-xl font-bold text-slate-100 truncate">{user?.username || 'User'}</p>
            <p className="text-slate-400 text-sm truncate">{user?.email}</p>
            <span className="mt-1 inline-block text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium capitalize">
              {user?.role || 'user'}
            </span>
          </div>
        </div>

        {/* Avatar upload confirm strip */}
        {avatarFile && (
          <div className="mb-5 p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center gap-3">
            <img src={avatarPreview} alt="Preview" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-300 truncate">{avatarFile.name}</p>
              <p className="text-xs text-slate-500">{(avatarFile.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              onClick={handleAvatarCancel}
              className="text-slate-500 hover:text-slate-300 transition-colors px-2"
            >
              ✕
            </button>
            <button
              onClick={handleAvatarUpload}
              disabled={uploadingAvatar}
              className="btn-primary text-sm px-4 py-2 flex items-center gap-2 flex-shrink-0"
            >
              {uploadingAvatar && <div className="w-3.5 h-3.5 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />}
              {uploadingAvatar ? 'Uploading…' : 'Save Photo'}
            </button>
          </div>
        )}

        {avatarError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{avatarError}</div>
        )}

        {/* Info feedback */}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{success}</div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm whitespace-pre-line">{error}</div>
        )}

        {/* Edit / view info */}
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
                <p className="text-sm text-slate-200 truncate">{user?.email || '—'}</p>
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

            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Change Photo
              </button>
              <button
                onClick={() => { setEditing(true); setSuccess(''); setError('') }}
                className="btn-primary flex-1"
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Change password ── */}
      <div className="card animate-fade-in-up-delay-2">
        <h2 className="font-display text-lg font-bold text-slate-100 mb-6">Change Password</h2>

        {pwSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{pwSuccess}</div>
        )}
        {pwError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{pwError}</div>
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
