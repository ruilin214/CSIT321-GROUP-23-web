import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useTrainingStore } from '../store/useTrainingStore';
import { authService, cloudConfigured } from '../services/authService';
export default function RoleSelectionPage() {
  const navigate = useNavigate(); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  async function login(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('');
    try { const user = await authService.login(email.trim(), password); useTrainingStore.getState().setUser(user); navigate(user.role === 'educator' ? '/educator' : '/home'); }
    catch (err) { setMessage((err as Error).message); } finally { setBusy(false); }
  }
  return <main className="mx-auto max-w-3xl px-6 py-16"><h1 className="text-3xl font-bold">Industrial Safety Training</h1><p className="mb-8 mt-3 text-muted">Train in Unity, review your results, and track progress.</p>
    <Card><h2 className="mb-2 text-lg font-semibold">Sign in</h2><p className="mb-5 text-sm text-muted">Use your account to save training records across devices.</p>
      {!cloudConfigured && <p role="status" className="mb-4 rounded-lg border border-warning/40 p-3 text-sm text-warning">Cloud accounts are not configured. Add your Supabase configuration and restart the website to sign in.</p>}
      <form onSubmit={login} className="space-y-4">
        <label className="block" htmlFor="login-email">Email<input id="login-email" required type="email" autoComplete="username" className="mt-1 block w-full rounded-lg bg-raised p-3" value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label className="block" htmlFor="login-password">Password<input id="login-password" required type="password" autoComplete="current-password" className="mt-1 block w-full rounded-lg bg-raised p-3" value={password} onChange={e => setPassword(e.target.value)} /></label>
        <Button fullWidth disabled={busy || !cloudConfigured} type="submit">{busy ? 'Signing in…' : 'Sign in'}</Button>
      </form>
      {message && <p role="alert" className="mt-3 text-sm text-warning">{message}</p>}
      <p className="mt-5 text-center text-sm text-muted">New to training? <Link to="/register" className="font-semibold text-primary underline underline-offset-4">Create an account</Link></p>
    </Card>
  </main>;
}
