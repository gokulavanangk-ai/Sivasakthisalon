import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/ui/Feedback';
import { Scissors } from 'lucide-react';

export default function AdminLoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0b]">
        <LoadingSpinner label="Checking session" />
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(identifier, password);
      toast('Welcome back', 'success');
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0b0b] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/50">
            <Scissors className="h-6 w-6 text-gold" />
          </span>
          <h1 className="mt-4 font-tamil text-2xl text-white">சிவசக்தி Admin</h1>
          <p className="mt-1 text-sm text-zinc-500">Sign in to manage the salon</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="admin-identifier" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Username or Email
            </label>
            <input
              id="admin-identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-zinc-600 focus:border-gold/60 focus:outline-none"
              placeholder="admin"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-zinc-600 focus:border-gold/60 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-white py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gold disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Protected area · Use the admin credentials from your environment set-up.
        </p>
      </div>
    </div>
  );
}