import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [otp, setOtp] = useState(searchParams.get('otp') || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [showPass, setShowPass] = useState(false)

  const startCountdown = () => {
    setCountdown(60)
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(interval); return 0 }
        return c - 1
      })
    }, 1000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirm) { setError('Passwords do not match.'); return }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)
    try {
      const res = await api.post('/api/reset-password/', {
        email,
        otp,
        new_password: newPassword,
      })
      setSuccess(res.data.detail)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setError('')
    setResending(true)
    try {
      await api.post('/api/resend-otp/', { email, otp_type: 'password_reset' })
      setSuccess('A new code has been sent to your email.')
      startCountdown()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend code.')
    } finally {
      setResending(false)
    }
  }

  const devOtp = searchParams.get('otp')

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
            <svg className="w-7 h-7 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Reset password</h1>
          <p className="text-slate-400 text-sm mt-2">Enter the code from your email and choose a new password.</p>
        </div>

        <div className="card space-y-5">
          {devOtp && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
              Dev mode: OTP auto-filled. Enter your new password and submit.
            </div>
          )}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="label">6-digit code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                className="input-field text-center text-2xl tracking-widest"
              />
            </div>

            <div>
              <label className="label">New password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirm password</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                  Resetting...
                </>
              ) : 'Reset password'}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className="text-sm text-slate-400 hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : "Didn't get it? Resend code"}
            </button>
          </div>

          <p className="text-center text-slate-500 text-sm">
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
