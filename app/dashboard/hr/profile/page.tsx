'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HRProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    phone: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    pan_number: '',
  });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPwd, setChangingPwd] = useState(false);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }
      try {
        const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Unable to load profile');
        const data = await res.json();
        setForm({
          phone: data.phone ?? '',
          address: data.address ?? '',
          emergency_contact: data.emergency_contact ?? '',
          emergency_phone: data.emergency_phone ?? '',
          bank_name: data.bank_name ?? '',
          account_number: data.account_number ?? '',
          ifsc_code: data.ifsc_code ?? '',
          pan_number: data.pan_number ?? '',
        });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const updateField = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out?.error || 'Failed to save');
      alert(out?.pendingApproval ? 'Saved. Some changes will be applied after Admin approval.' : 'Saved');
    } catch (e: any) {
      alert(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwdForm.currentPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) {
      alert('Fill all password fields');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    setChangingPwd(true);
    const token = localStorage.getItem('token');
    if (!token) { setChangingPwd(false); return; }
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out?.error || 'Failed to change password');
      alert('Password updated');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      alert(e?.message || 'Failed to change password');
    } finally {
      setChangingPwd(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-black">My Profile</h1>
          <button onClick={() => router.back()} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Back</button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-6 py-6">
        <section className="rounded-2xl border border-white/40 bg-white/80 p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Contact & Emergency</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs text-slate-600">Phone</label>
              <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-600">Emergency Contact Name</label>
              <input value={form.emergency_contact} onChange={(e) => updateField('emergency_contact', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-600">Emergency Phone</label>
              <input value={form.emergency_phone} onChange={(e) => updateField('emergency_phone', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-slate-600">Address</label>
              <input value={form.address} onChange={(e) => updateField('address', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/40 bg-white/80 p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Change Password</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className="text-xs text-slate-600">Current Password</label>
              <input type="password" value={pwdForm.currentPassword} onChange={(e) => setPwdForm((p) => ({ ...p, currentPassword: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-600">New Password</label>
              <input type="password" value={pwdForm.newPassword} onChange={(e) => setPwdForm((p) => ({ ...p, newPassword: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-600">Confirm Password</label>
              <input type="password" value={pwdForm.confirmPassword} onChange={(e) => setPwdForm((p) => ({ ...p, confirmPassword: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={handleChangePassword} disabled={changingPwd} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {changingPwd ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-white/40 bg-white/80 p-6">
          <h2 className="mb-2 text-lg font-bold text-slate-900">Bank & KYC</h2>
          <p className="mb-4 text-xs text-slate-500">Changes to these fields require Admin approval.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs text-slate-600">Bank Name</label>
              <input value={form.bank_name} onChange={(e) => updateField('bank_name', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-600">Account Number</label>
              <input value={form.account_number} onChange={(e) => updateField('account_number', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-600">IFSC Code</label>
              <input value={form.ifsc_code} onChange={(e) => updateField('ifsc_code', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-600">PAN Number</label>
              <input value={form.pan_number} onChange={(e) => updateField('pan_number', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-3">
          <button onClick={() => router.push('/dashboard/hr')} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </main>
    </div>
  );
}
