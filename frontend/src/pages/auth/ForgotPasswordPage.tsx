import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/auth/request-password-reset?email=${encodeURIComponent(email)}`);
      setSent(true);
      toast.success('Reset link sent!');
    } catch {
      toast.error('Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#080812' }}>
      <div className="flex items-center gap-2.5 mb-8">
        <div className="flex items-center justify-center rounded-[10px] text-white font-extrabold text-[18px]" style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>T</div>
        <span className="text-[22px] font-extrabold text-[#e8e8f0]">TaskPro</span>
      </div>
      <div className="w-full max-w-[420px] rounded-[16px] border border-[#1e1e3a] p-8" style={{ background: '#0f0f20' }}>
        <h2 className="text-[20px] font-extrabold text-[#e8e8f0] mb-1">Reset Password</h2>
        <p className="text-[12px] text-[#6b6b8a] mb-6">Enter your email and we'll send you a reset link.</p>
        {sent ? (
          <p className="text-[#10b981] text-[13px]">Check your email for the reset link.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3.5 py-2.5 rounded-[8px] text-[13px] text-[#e8e8f0] outline-none bg-[#0c0c1d] border border-[#1e1e3a] focus:border-[#7c3aed] transition-colors placeholder-[#3b3b5e]"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-[8px] text-[14px] font-bold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        )}
        <p className="text-center text-[12px] text-[#6b6b8a] mt-6">
          <Link to="/login" className="text-[#7c3aed] hover:text-[#a78bfa]">← Back to login</Link>
        </p>
      </div>
    </div>
  );
}
