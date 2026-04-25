import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import type { ApiResponse } from '../../types';

const PASSWORD_SPECIAL = `!@#$%^&*()_+-=[]{}|;':\",./<>?`;

const schema = z.object({
  firstname: z.string().min(1, 'Required'),
  lastname: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .max(128, 'Max 128 characters')
    .regex(/[A-Z]/, 'Need uppercase letter')
    .regex(/[a-z]/, 'Need lowercase letter')
    .regex(/[0-9]/, 'Need a digit')
    .regex(/[!@#$%^&*()_+\-=\[\]{}|;':\",./<>?]/, 'Need a special character')
    .refine((p) => !p.includes(' '), 'No spaces allowed'),
  dateOfBirth: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post<ApiResponse<{ email: string; message: string }>>('/auth/register', data);
      toast.success('Account created! Check your email to verify.');
      navigate('/login');
    } catch (err: any) {
      const code = err.response?.data?.code;
      if (code === 305) toast.error('Email already in use');
      else toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell subtitle="Create your account">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#6b6b8a] mb-1.5 uppercase tracking-widest">
              First name
            </label>
            <input {...register('firstname')} placeholder="John" className={inputCls(!!errors.firstname)} />
            {errors.firstname && <p className="text-[#ef4444] text-[11px] mt-1">{errors.firstname.message}</p>}
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#6b6b8a] mb-1.5 uppercase tracking-widest">
              Last name
            </label>
            <input {...register('lastname')} placeholder="Doe" className={inputCls(!!errors.lastname)} />
            {errors.lastname && <p className="text-[#ef4444] text-[11px] mt-1">{errors.lastname.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#6b6b8a] mb-1.5 uppercase tracking-widest">
            Email
          </label>
          <input {...register('email')} type="email" placeholder="you@example.com" className={inputCls(!!errors.email)} />
          {errors.email && <p className="text-[#ef4444] text-[11px] mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#6b6b8a] mb-1.5 uppercase tracking-widest">
            Password
          </label>
          <input {...register('password')} type="password" placeholder="••••••••" className={inputCls(!!errors.password)} />
          {errors.password && <p className="text-[#ef4444] text-[11px] mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#6b6b8a] mb-1.5 uppercase tracking-widest">
            Date of birth <span className="normal-case font-normal">(optional)</span>
          </label>
          <input {...register('dateOfBirth')} type="date" className={inputCls(false)} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-[8px] text-[14px] font-bold text-white mt-1 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
      <p className="text-center text-[12px] text-[#6b6b8a] mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-[#7c3aed] hover:text-[#a78bfa]">
          Sign in
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#080812' }}>
      <div className="fixed top-0 left-0 pointer-events-none" style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)' }} />
      <div className="fixed bottom-0 right-0 pointer-events-none" style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex items-center justify-center rounded-[10px] text-white font-extrabold text-[18px]" style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>T</div>
          <span className="text-[22px] font-extrabold text-[#e8e8f0]">TaskPro</span>
        </div>
        <p className="text-[13px] text-[#6b6b8a]">{subtitle}</p>
      </div>
      <div className="w-full max-w-[420px] rounded-[16px] border border-[#1e1e3a] p-8 relative z-10" style={{ background: '#0f0f20', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
        {children}
      </div>
    </div>
  );
}
