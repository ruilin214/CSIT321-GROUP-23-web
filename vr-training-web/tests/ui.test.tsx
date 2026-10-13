import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
test('headset-only UI shows registered name, removes demos, blocks uninstalled build and signs out', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://training.example' });
  for (const key of ['window','document','localStorage','HTMLElement','Element','SVGElement','Node','MutationObserver','navigator']) Object.defineProperty(globalThis,key,{value:dom.window[key as keyof typeof dom.window],configurable:true});
  Object.defineProperty(globalThis,'IS_REACT_ACT_ENVIRONMENT',{value:true,configurable:true});
  const React = await import('react'); const {act}=React; const {createRoot}=await import('react-dom/client');
  const {MemoryRouter,Routes,Route}=await import('react-router-dom');
  const {default:MainMenu}=await import('../src/pages/MainMenuPage'); const {default:Briefing}=await import('../src/pages/BriefingPage');
  const {default:Login}=await import('../src/pages/RoleSelectionPage'); const {useTrainingStore}=await import('../src/store/useTrainingStore');
  const {trainingApi}=await import('../src/services/trainingApi'); const {authService}=await import('../src/services/authService');
  const oldList=trainingApi.list, oldLogout=authService.logout; trainingApi.list=async()=>[]; authService.logout=async()=>{};
  useTrainingStore.getState().setUser({userId:'c69d79a6-a1ec-48af-9b4e-6bf8da27a329',email:'trainee@example.com',fullName:'dou Chloe',role:'trainee',authMode:'cloud'});
  const root=createRoot(document.getElementById('root')!);
  try {
    await act(async()=>root.render(<MemoryRouter initialEntries={['/home']}><Routes><Route path="/home" element={<MainMenu/>}/><Route path="/briefing/:scenarioId" element={<Briefing/>}/><Route path="/role" element={<Login/>}/></Routes></MemoryRouter>));
    assert.match(document.body.textContent||'',/Welcome back, dou Chloe/); assert.ok(!(document.body.textContent||'').includes('c69d79a6'));
    assert.throws(()=>useTrainingStore.getState().startSession('ladder-inspection','demo'),/removed/);
    await act(async()=>[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Sign out')!.click());
    assert.equal(useTrainingStore.getState().currentUser,null); assert.ok(!(document.body.textContent||'').includes('Trainee demo'));
    await act(async()=>root.render(<MemoryRouter key="briefing" initialEntries={['/briefing/ladder-inspection']}><Routes><Route path="/briefing/:scenarioId" element={<Briefing/>}/></Routes></MemoryRouter>));
    const open=[...document.querySelectorAll('button')].find(b=>b.textContent==='Open Headset Training')!; assert.equal(open.disabled,true);
    assert.match(document.body.textContent||'',/Headset build not installed/); assert.ok(!document.querySelector('input[type="radio"]'));
  } finally { await act(async()=>root.unmount()); trainingApi.list=oldList; authService.logout=oldLogout; dom.window.close(); }
});
