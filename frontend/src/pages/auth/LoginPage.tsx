import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import type { ApiResponse, UserBasicDTO } from '../../types';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Required'),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post<ApiResponse<{ token: string }>>('/auth/login', data);
      const token = res.data.data.token;
      const meRes = await api.get<ApiResponse<UserBasicDTO>>('/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      login(token, meRes.data.data);
      navigate('/dashboard');
    } catch (err: any) {
      const code = err.response?.data?.businessErrorCode;
      if (code === 307) toast.error('Please verify your email first');
      else if (code === 302) toast.error('Account is locked');
      else if (code === 303) toast.error('Account is disabled');
      else if (code === 304) toast.error('Invalid credentials');
      else toast.error(err.response?.data?.businessErrorMessage ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell subtitle="Sign in to your account">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="block text-[11px] font-semibold text-[#6b6b8a] mb-1.5 uppercase tracking-widest">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            className={inputCls(!!errors.email)}
          />
          {errors.email && <p className="text-[#ef4444] text-[11px] mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-[#6b6b8a] uppercase tracking-widest">
              Password
            </label>
            <Link to="/forgot-password" className="text-[11px] text-[#7c3aed] hover:text-[#a78bfa]">
              Forgot password?
            </Link>
          </div>
          <input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            className={inputCls(!!errors.password)}
          />
          {errors.password && <p className="text-[#ef4444] text-[11px] mt-1">{errors.password.message}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-[8px] text-[14px] font-bold text-white mt-1 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
      <p className="text-center text-[12px] text-[#6b6b8a] mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-[#7c3aed] hover:text-[#a78bfa]">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}

function inputCls(hasError: boolean) {
  return [
    'w-full px-3.5 py-2.5 rounded-[8px] text-[13px] text-[#e8e8f0] outline-none transition-colors',
    'bg-[#0c0c1d] border placeholder-[#3b3b5e]',
    hasError ? 'border-[#ef4444]' : 'border-[#1e1e3a] focus:border-[#7c3aed]',
  ].join(' ');
}

function AuthShell({ subtitle, children }: { subtitle: string; children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#080812' }}
    >
      {/* Glow blobs */}
      <div
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
        }}
      />
      <div
        className="fixed bottom-0 right-0 pointer-events-none"
        style={{
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <div
            className="flex items-center justify-center rounded-[10px] text-white font-extrabold text-[18px]"
            style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
          >
            T
          </div>
          <span className="text-[22px] font-extrabold text-[#e8e8f0]">TaskPro</span>
        </div>
        <p className="text-[13px] text-[#6b6b8a]">{subtitle}</p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-[420px] rounded-[16px] border border-[#1e1e3a] p-8 relative z-10"
        style={{ background: '#0f0f20', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
      >
        {children}
      </div>
    </div>
  );
}
