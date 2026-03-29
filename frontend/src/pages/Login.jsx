import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      const detail = err.response?.data?.detail || ''
      if (detail.includes('No active account')) {
        setError('__unverified__')
      } else {
        setError(detail || 'Invalid credentials. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      {/* Main content — centered, Facebook-style */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          {/* ── Left: Brand / Tagline ── */}
          <div className="lg:flex-1 text-center lg:text-left animate-fade-in-up">
            {/* Logo */}
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <svg className="w-7 h-7 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-display font-bold text-2xl text-emerald-400 tracking-tight">
                FinanceTracker
              </span>
            </div>

            {/* Tagline — large, Facebook-style */}
            <h1 className="font-display text-4xl lg:text-5xl font-black text-slate-100 leading-tight mb-4">
              Your money,<br />
              <span className="text-emerald-400">under control.</span>
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed max-w-sm mx-auto lg:mx-0">
              Track income and expenses, understand your spending, and take control of your financial health — all in one place.
            </p>

            {/* Creator credit */}
            <p className="mt-5 text-slate-600 text-sm tracking-wide">
              — Created by <span className="text-slate-500 font-medium">Susan Acharya</span>
            </p>

            {/* Feature badges */}
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3">
              {[
                { icon: '📊', text: 'Smart Dashboard' },
                { icon: '🏷️', text: 'Categories' },
                { icon: '📤', text: 'CSV Export' },
              ].map(f => (
                <span key={f.text}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-full text-sm text-slate-300">
                  <span>{f.icon}</span>
                  {f.text}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right: Login Card ── */}
          <div className="w-full lg:w-[400px] shrink-0 animate-fade-in-up-delay-1">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 p-8">

              {/* Error banners */}
              {error === '__unverified__' ? (
                <div className="mb-5 p-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm">
                  Your email is not verified.{' '}
                  <Link
                    to={`/verify-email?email=${encodeURIComponent(form.email)}`}
                    className="underline font-medium hover:text-yellow-200"
                  >
                    Verify now
                  </Link>.
                </div>
              ) : error ? (
                <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              ) : null}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  className="input-field"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />

                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="input-field"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    'Log In'
                  )}
                </button>
              </form>

              {/* Forgot password — centered, below button (Facebook style) */}
              <div className="mt-4 text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-slate-500 text-sm">or</span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>

              {/* Create account button */}
              <Link
                to="/register"
                className="block w-full text-center py-3 px-5 rounded-xl font-semibold text-slate-100 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/30 hover:border-emerald-500/50 transition-all duration-200"
              >
                Create New Account
              </Link>
            </div>

          </div>

        </div>
      </div>


      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-xs text-slate-600">
          © 2026 Finance Tracker &nbsp;•&nbsp; Built by{' '}
          <span className="text-slate-500 font-medium">Susan Acharya</span>
        </p>
      </footer>

    </div>
  )
}
