import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';

export function ActivateAccountPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    api.get(`/auth/activate-account?token=${encodeURIComponent(token)}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080812' }}>
      <div className="rounded-[16px] border border-[#1e1e3a] p-10 text-center max-w-md" style={{ background: '#0f0f20' }}>
        {status === 'loading' && <p className="text-[#6b6b8a]">Verifying your account…</p>}
        {status === 'success' && (
          <>
            <div className="text-[#10b981] text-[48px] mb-4">✓</div>
            <h2 className="text-[20px] font-extrabold text-[#e8e8f0] mb-2">Email Verified!</h2>
            <p className="text-[13px] text-[#6b6b8a] mb-6">Your account is ready. You can now sign in.</p>
            <Link to="/login" className="text-[#7c3aed] hover:text-[#a78bfa] text-[13px]">Go to login →</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-[#ef4444] text-[48px] mb-4">✗</div>
            <h2 className="text-[20px] font-extrabold text-[#e8e8f0] mb-2">Verification Failed</h2>
            <p className="text-[13px] text-[#6b6b8a] mb-6">Link is invalid or expired.</p>
            <Link to="/login" className="text-[#7c3aed] hover:text-[#a78bfa] text-[13px]">← Back to login</Link>
          </>
        )}
      </div>
    </div>
  );
}
