import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail]       = useState(searchParams.get('email') || '');
  const [otp, setOtp]           = useState(searchParams.get('otp') || '');
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [countdown, setCountdown] = useState(0);
  const devOtp = searchParams.get('otp');

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) { setError('Email is required.'); return; }
    if (otp.length !== 6) { setError('Please enter the full 6-digit OTP.'); return; }

    setLoading(true);
    try {
      const res = await api.post('/api/verify-email/', { email, otp });
      setSuccess(res.data.detail);
      // Redirect to login after 2 seconds
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError('');
    setResending(true);
    try {
      const res = await api.post('/api/resend-otp/', { email, otp_type: 'registration' });
      if (res.data?.otp) {
        setOtp(res.data.otp);
        setSuccess(`A new OTP has been generated and auto-filled below.`);
      } else {
        setSuccess('A new OTP has been sent to your email.');
      }
      setCountdown(60); // 60-second cooldown
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-1">Verify Your Email</h1>
        <p className="text-gray-400 text-center text-sm mb-6">
          We sent a 6-digit OTP to <span className="text-indigo-400 font-medium">{email || 'your email'}</span>.
          Enter it below to activate your account.
        </p>

        {devOtp && (
          <div className="mb-4 p-3 bg-yellow-900/40 border border-yellow-600 text-yellow-300 rounded-lg text-sm">
            <strong>Development mode:</strong> Your OTP has been auto-filled below. Just click <em>Verify Email</em> to continue.
          </div>
        )}

        {error   && <div className="mb-4 p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-900/40 border border-green-700 text-green-300 rounded-lg text-sm">{success}</div>}

        <form onSubmit={handleVerify} className="space-y-4">
          {/* Email (editable in case user navigated here manually) */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* OTP input */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">6-Digit OTP</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              required
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-center text-2xl tracking-widest placeholder-gray-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg transition"
          >
            {loading ? 'Verifying…' : 'Verify Email'}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="mt-4 text-center">
          <button
            onClick={handleResend}
            disabled={resending || countdown > 0}
            className="text-sm text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending
              ? 'Sending…'
              : countdown > 0
              ? `Resend OTP in ${countdown}s`
              : "Didn't receive it? Resend OTP"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already verified?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Log in</Link>
        </p>
      </div>
    </div>
  );
}
