import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { UnityPlayer, type UnityPlayerHandle } from '../components/training/UnityPlayer';
import { useTrainingStore } from '../store/useTrainingStore';
import { headsetBuildReady } from '../services/headsetConfig';
import { duration } from '../services/trainingState';
import { type CommandType } from '../types/unityMessages';
export default function TrainingPage() {
  const { scenarioId } = useParams(); const navigate = useNavigate();
  const session = useTrainingStore(s => s.activeSession);
  const paused = useTrainingStore(s => s.isPaused);
  const player = useRef<UnityPlayerHandle>(null);
  const [ready, setReady] = useState(false); const [started, setStarted] = useState(false);
  const [busy, setBusy] = useState(false); const [elapsed, setElapsed] = useState(0);
  const [confirmation, setConfirmation] = useState<'restart' | 'exit' | null>(null);
  useEffect(() => {
    const timer = setInterval(() => { const s = useTrainingStore.getState().activeSession; if (s) setElapsed(duration(s)); }, 250);
    return () => { clearInterval(timer); try { useTrainingStore.getState().pauseSession(); } catch { /* error already displayed by store */ } };
  }, []);
  useEffect(() => { setReady(false); setStarted(false); setElapsed(0); }, [session?.sessionId]);
  if (!session || session.scenarioId !== scenarioId) return <div className="p-10"><p>No active training for this scenario.</p><Button onClick={() => navigate('/scenarios')}>Choose a scenario</Button></div>;
  if (!headsetBuildReady || session.source !== 'unity') return <><AppHeader title="Headset training" /><main className="mx-auto max-w-2xl space-y-4 px-6 py-10"><p>Headset build not installed or this is a legacy simulation attempt. Desktop simulation is no longer available.</p><Button onClick={() => navigate('/scenarios')}>Choose a scenario</Button></main></>;
  const store = () => useTrainingStore.getState();
  async function command(type: CommandType) {
    if (!player.current) throw new Error('Headset player is unavailable.'); await player.current.command(type);
  }
  async function run(action: () => Promise<void> | void) {
    setBusy(true);
    try { await action(); store().reportError(null); } catch (e) { store().reportError((e as Error).message); }
    finally { setBusy(false); }
  }
  return <>
    <AppHeader title={session.scenarioName} subtitle="VR headset training — results from scene events" />
    <main className="mx-auto max-w-6xl space-y-5 px-6 py-8">
      <div className="flex flex-wrap gap-5 text-sm"><span>Time {Math.floor(elapsed / 60)}:{String(Math.floor(elapsed % 60)).padStart(2, '0')}</span><span>Score {session.finalScore}/{session.maxPossibleScore}</span><span>Mistakes {session.mistakeCount}</span><span>{session.trainingMode === 'vr' ? 'Immersive VR' : 'Waiting for headset'} · {paused ? 'Paused / waiting' : 'Running'}</span></div>
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <UnityPlayer key={session.sessionId} ref={player} session={session} onReady={setReady} onFinished={id => navigate(`/feedback/${id}`)} />
        </div>
        <Card><h2 className="mb-3 font-semibold">Task checklist</h2><ol className="space-y-3">{session.taskResults.map(t => <li key={t.id} className={t.completed ? 'text-success' : 'text-muted'}>{t.completed ? '✓' : '○'} {t.title}<div className="text-xs">{t.mistakes} mistake(s)</div></li>)}</ol></Card>
      </div>
      {session.trainingMode !== "vr" && <p className="text-sm text-warning">Enter immersive VR using the player’s VR button before starting or resuming training.</p>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:max-w-xl">
        <Button disabled={busy || !ready || (started && session.trainingMode !== "vr")} onClick={() => void run(async () => {
          if (!started) { await command('START'); setStarted(true); }
          else if (paused) { await command('RESUME'); store().resumeSession(); }
          else { await command('PAUSE'); store().pauseSession(); }
        })}>{!started ? 'Prepare headset' : paused ? (elapsed === 0 ? 'Start training' : 'Resume') : 'Pause'}</Button>
        <Button variant="secondary" disabled={busy} onClick={() => setConfirmation('restart')}>Restart attempt</Button>
        <Button variant="danger" disabled={busy} onClick={() => setConfirmation('exit')}>Exit</Button>
      </div>
      {confirmation && <Card><p className="mb-3">{confirmation === 'restart' ? 'End this attempt and start a new one? Unity will reload.' : 'End this attempt and return to the menu?'}</p><div className="flex flex-wrap gap-3"><Button disabled={busy} onClick={() => void run(async () => {
        // Unmount/reload guarantees the scene stops even when the old build has no bridge.
        if (ready && started) { try { await command('EXIT'); } catch { /* teardown is the fallback */ } }
        if (confirmation === 'restart') store().restartSession(); else { store().exitSession(); navigate('/home'); }
        setConfirmation(null);
      })}>Confirm</Button><Button variant="ghost" onClick={() => setConfirmation(null)}>Cancel</Button></div></Card>}
    </main>
  </>;
}
