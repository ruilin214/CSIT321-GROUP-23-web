import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { authService, cloudConfigured } from '../services/authService';
export default function RegisterPage() {
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [result, setResult] = useState<{ requiresEmailConfirmation: boolean } | null>(null);
  async function submit(e: FormEvent) {
    e.preventDefault(); setError('');
    if (!name.trim()) { setError('Enter your name.'); return; }
    if (password.length < 8) { setError('Use a password with at least 8 characters.'); return; }
    if (password !== confirmation) { setError('Passwords do not match. Enter the same password in both fields.'); return; }
    setBusy(true);
    try { setResult(await authService.register(email.trim(), password, name.trim())); setPassword(''); setConfirmation(''); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  const inputClass = 'mt-1 block w-full rounded-lg bg-raised p-3';
  return <main className="mx-auto max-w-2xl px-6 py-12">
    <Link to="/role" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> Back to sign in</Link>
    <h1 className="text-3xl font-bold">Create your trainee account</h1>
    <p className="mb-6 mt-3 text-sm text-muted">Save your progress and view your training results on another device.</p>
    <ol aria-label="Registration steps" className="mb-6 grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
      <li className={`rounded-lg border p-3 ${!result ? 'border-primary text-primary' : 'border-border text-muted'}`}>1. Account details</li>
      <li className={`rounded-lg border p-3 ${result ? 'border-primary text-primary' : 'border-border text-muted'}`}>2. Email confirmation</li>
      <li className="rounded-lg border border-border p-3 text-muted">3. Sign in & train</li>
    </ol>
    <Card>
      {result ? <div role="status" className="space-y-4">
        {result.requiresEmailConfirmation ? <Mail className="text-primary" size={32} /> : <CheckCircle2 className="text-primary" size={32} />}
        <h2 className="text-xl font-semibold">{result.requiresEmailConfirmation ? 'Check your email' : 'Registration submitted'}</h2>
        <p className="break-words text-sm text-muted">{result.requiresEmailConfirmation ? `If registration is accepted for ${email.trim()}, you will receive a confirmation email. Open the link in that email, then return here to sign in.` : 'Email confirmation is not required for this registration. Continue to sign in with your email and password.'}</p>
        <p className="text-sm text-muted">{result.requiresEmailConfirmation ? 'Check your spam folder too. If you already have an account, sign in with your existing password.' : 'Your training records will be linked to your account.'}</p>
        <Link to="/role" className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-center font-semibold text-primaryInk">Go to sign in</Link>
        <Button fullWidth variant="ghost" onClick={() => { setResult(null); setError(''); }}>Use a different email</Button>
      </div> : <>
        <h2 className="mb-4 text-lg font-semibold">Account details</h2>
        {!cloudConfigured && <p role="status" className="mb-4 rounded-lg border border-warning/40 p-3 text-sm text-warning">Registration is unavailable until Supabase is configured. Add your configuration and restart the website.</p>}
        <form onSubmit={submit} className="space-y-4">
          <label className="block" htmlFor="register-name">Full name<input id="register-name" required maxLength={100} autoComplete="name" className={inputClass} value={name} onChange={e => setName(e.target.value)} /></label>
          <label className="block" htmlFor="register-email">Email<input id="register-email" required type="email" autoComplete="email" className={inputClass} value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label className="block" htmlFor="register-password">Password<input id="register-password" required type="password" minLength={8} autoComplete="new-password" aria-describedby="password-help" className={inputClass} value={password} onChange={e => setPassword(e.target.value)} /></label>
          <p id="password-help" className="text-xs text-muted">Use at least 8 characters. Your project's additional password rules may also apply.</p>
          <label className="block" htmlFor="register-confirmation">Confirm password<input id="register-confirmation" required type="password" minLength={8} autoComplete="new-password" className={inputClass} value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label>
          {error && <p role="alert" className="text-sm text-warning">{error}</p>}
          <Button fullWidth disabled={busy || !cloudConfigured} type="submit">{busy ? 'Creating account…' : 'Create trainee account'}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">Already registered? <Link to="/role" className="font-semibold text-primary underline underline-offset-4">Sign in</Link></p>
      </>}
    </Card>
  </main>;
}
