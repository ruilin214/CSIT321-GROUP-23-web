import test from 'node:test';
import assert from 'node:assert/strict';

test('failed cloud save remains queued, preserves its warning and retries the complete attempt',async()=>{
  const values=new Map<string,string>();
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>values.set(k,v),removeItem:(k:string)=>values.delete(k)}});
  const {useTrainingStore}=await import('../src/store/useTrainingStore');
  const {trainingApi}=await import('../src/services/trainingApi');
  const {sessionRepository:repo}=await import('../src/services/sessionRepository');
  const original={...trainingApi}; const saved: Parameters<typeof trainingApi.save>[0][]=[];
  let offline=false;
  trainingApi.list=async()=>saved.slice();
  trainingApi.save=async s=>{if(offline)throw new Error('Network unavailable');saved.splice(0,saved.length,s)};
  const store=()=>useTrainingStore.getState();
  try {
    store().setUser({userId:'test-cloud-user',role:'trainee',authMode:'cloud'});
    await store().sync();
    offline=true;
    const session=store().startSession('ladder-inspection','unity')!;
    await store().sync();
    assert.equal(store().syncStatus,'error'); assert.equal(repo.pending().length,1);
    store().reportError(null); assert.match(store().syncError!,/Network unavailable/);
    store().applyEvent({channel:'csit321-training',version:1,type:'XR_CHANGED',immersive:true,eventId:crypto.randomUUID(),sessionId:session.sessionId,scenarioId:session.scenarioId,timestamp:new Date().toISOString()});
    store().resumeSession();
    for(const task of session.taskResults) assert.equal(store().applyEvent({channel:'csit321-training',version:1,type:'TASK_COMPLETED',eventId:crypto.randomUUID(),sessionId:session.sessionId,scenarioId:session.scenarioId,timestamp:new Date().toISOString(),taskId:task.id}).accepted,true);
    store().applyEvent({channel:'csit321-training',version:1,type:'SESSION_FINISHED',eventId:crypto.randomUUID(),sessionId:session.sessionId,scenarioId:session.scenarioId,timestamp:new Date().toISOString()});
    await store().sync();
    assert.equal(repo.pending()[0].status,'completed');
    offline=false; await store().sync();
    assert.equal(repo.pending().length,0); assert.equal(store().syncStatus,'saved');assert.equal(store().syncError,null);
    assert.equal(saved[0].finalScore,100);assert.equal(saved[0].status,'completed');
    store().reportError('Scene error');await store().sync();assert.equal(store().error,'Scene error');
  } finally {Object.assign(trainingApi,original)}
});
