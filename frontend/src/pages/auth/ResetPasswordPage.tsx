import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/auth/reset-password?token=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(password)}`);
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch {
      toast.error('Reset failed — link may be expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#080812' }}>
      <div className="w-full max-w-[420px] rounded-[16px] border border-[#1e1e3a] p-8" style={{ background: '#0f0f20' }}>
        <h2 className="text-[20px] font-extrabold text-[#e8e8f0] mb-6">Set New Password</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            required
            className="w-full px-3.5 py-2.5 rounded-[8px] text-[13px] text-[#e8e8f0] outline-none bg-[#0c0c1d] border border-[#1e1e3a] focus:border-[#7c3aed] transition-colors placeholder-[#3b3b5e]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-[8px] text-[14px] font-bold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
          >
            {loading ? 'Saving…' : 'Reset Password'}
          </button>
        </form>
        <p className="text-center text-[12px] text-[#6b6b8a] mt-6">
          <Link to="/login" className="text-[#7c3aed] hover:text-[#a78bfa]">← Back to login</Link>
        </p>
      </div>
    </div>
  );
}
