import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../api/axios'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [otp, setOtp] = useState(searchParams.get('otp') || '')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [countdown, setCountdown] = useState(0)

  const devOtp = searchParams.get('otp')

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email) { setError('Email is required.'); return }
    if (otp.length !== 6) { setError('Please enter the full 6-digit OTP.'); return }

    setLoading(true)
    try {
      const res = await api.post('/api/verify-email/', { email, otp })
      setSuccess(res.data.detail)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setError('')
    setResending(true)
    try {
      const res = await api.post('/api/resend-otp/', { email, otp_type: 'registration' })
      if (res.data?.otp) {
        setOtp(res.data.otp)
        setSuccess('A new OTP has been generated and auto-filled below.')
      } else {
        setSuccess('A new OTP has been sent to your email.')
      }
      setCountdown(60)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
            <svg className="w-7 h-7 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Check your email</h1>
          <p className="text-slate-400 text-sm mt-2">
            We sent a 6-digit code to <span className="text-emerald-400 font-medium">{email || 'your email'}</span>
          </p>
        </div>

        <div className="card space-y-5">
          {devOtp && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
              Dev mode: OTP auto-filled. Just click verify to continue.
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{success}</div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                  Verifying...
                </>
              ) : 'Verify Email'}
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
            Already verified?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
