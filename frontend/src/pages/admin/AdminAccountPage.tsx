import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAccountMutations } from '@/features/admin/mutations';
import { AdminCard } from '@/features/admin/ui';

export default function AdminAccountPage() {
  const { user } = useAuth();
  const mut = useAccountMutations();

  const [profile, setProfile] = useState({ name: user?.name ?? '', email: user?.email ?? '', username: user?.username ?? '' });
  const [pass, setPass] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passError, setPassError] = useState('');

  const saveProfile = () => mut.profile.mutate(profile);
  const savePassword = () => {
    setPassError('');
    if (pass.newPassword.length < 8) {
      setPassError('New password must be at least 8 characters.');
      return;
    }
    if (pass.newPassword !== pass.confirmPassword) {
      setPassError('New password and confirm password do not match.');
      return;
    }
    mut.password.mutate(pass, {
      onSuccess: () => setPass({ currentPassword: '', newPassword: '', confirmPassword: '' }),
    });
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-white">Account</h1>
        <p className="mt-1 text-sm text-zinc-500">Your admin profile and security.</p>
      </div>

      <AdminCard title="Profile">
        <div className="grid gap-3">
          <Field label="Name">
            <input className="input-dark" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </Field>
          <Field label="Email">
            <input className="input-dark" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          </Field>
          <Field label="Username">
            <input className="input-dark" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} />
          </Field>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={saveProfile}
              disabled={mut.profile.isPending}
              className="rounded-md bg-gold px-5 py-2 text-sm font-semibold text-black hover:bg-gold-300 disabled:opacity-50"
            >
              Save profile
            </button>
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Security — change password">
        <div className="grid gap-3">
          <Field label="Current password">
            <input className="input-dark" type="password" value={pass.currentPassword} onChange={(e) => setPass({ ...pass, currentPassword: e.target.value })} />
          </Field>
          <Field label="New password (min 8 chars)">
            <input className="input-dark" type="password" value={pass.newPassword} onChange={(e) => setPass({ ...pass, newPassword: e.target.value })} />
          </Field>
          <Field label="Confirm new password">
            <input className="input-dark" type="password" value={pass.confirmPassword} onChange={(e) => setPass({ ...pass, confirmPassword: e.target.value })} />
          </Field>
          {passError && <p className="text-sm text-red-400">{passError}</p>}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={savePassword}
              disabled={mut.password.isPending}
              className="rounded-md bg-gold px-5 py-2 text-sm font-semibold text-black hover:bg-gold-300 disabled:opacity-50"
            >
              Update password
            </button>
          </div>
          <p className="text-xs text-zinc-600">Passwords are hashed with Argon2 and never stored in plain text.</p>
        </div>
      </AdminCard>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-zinc-400">{label}</span>
      {children}
    </label>
  );
}