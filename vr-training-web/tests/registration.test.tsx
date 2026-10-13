import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

test('registration has its own route, validates confirmation, preserves errors and shows email next steps', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://training.example' });
  for (const key of ['window','document','localStorage','HTMLElement','Element','SVGElement','Node','MutationObserver','navigator']) Object.defineProperty(globalThis, key, { value: dom.window[key as keyof typeof dom.window], configurable: true });
  Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
  const React = await import('react'); const { act } = React;
  const { createRoot } = await import('react-dom/client');
  const { MemoryRouter, Routes, Route } = await import('react-router-dom');
  const { default: RegisterPage } = await import('../src/pages/RegisterPage');
  const { default: RoleSelectionPage } = await import('../src/pages/RoleSelectionPage');
  const { authService } = await import('../src/services/authService');
  const originalRegister = authService.register;
  let calls = 0; let fail = false; let confirmationRequired = true;
  authService.register = async (email, password, name) => {
    calls++;
    assert.equal(email, 'trainee@example.com'); assert.equal(password, 'password123'); assert.equal(name, 'Test Trainee');
    if (fail) throw new Error('Email rate limit exceeded');
    return { requiresEmailConfirmation: confirmationRequired };
  };
  const root = createRoot(document.getElementById('root')!);
  const change = async (id: string, value: string) => {
    const el = document.getElementById(id) as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value')!.set!;
    await act(async () => { setter.call(el, value); el.dispatchEvent(new dom.window.Event('input', { bubbles: true })); });
  };
  const submit = async () => { await act(async () => document.querySelector('form')!.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }))); };
  try {
    await act(async () => root.render(<MemoryRouter initialEntries={['/role']}><Routes><Route path="/role" element={<RoleSelectionPage />} /><Route path="/register" element={<RegisterPage />} /></Routes></MemoryRouter>));
    const entry = document.querySelector<HTMLAnchorElement>('a[href="/register"]')!;
    assert.ok(entry, 'Signup link available without entering login credentials');
    await act(async () => entry.click());
    assert.match(document.body.textContent || '', /Create your trainee account/);
    assert.equal(document.querySelectorAll('input').length, 4);
    assert.ok((document.querySelector('button[type="submit"]') as HTMLButtonElement).disabled, 'Missing cloud config blocks real submission');
    await change('register-name', 'Test Trainee'); await change('register-email', 'trainee@example.com');
    await change('register-password', 'password123'); await change('register-confirmation', 'different123');
    await submit(); assert.equal(calls, 0); assert.match(document.querySelector('[role="alert"]')!.textContent!, /Passwords do not match/);
    await change('register-confirmation', 'password123'); fail = true;
    await submit(); assert.equal(calls, 1); assert.match(document.querySelector('[role="alert"]')!.textContent!, /Email rate limit exceeded/);
    fail = false; await submit(); assert.equal(calls, 2);
    assert.match(document.body.textContent || '', /Check your email/); assert.ok(!document.querySelector('input[type="password"]'));
    assert.ok(document.querySelector('a[href="/role"]'));
    const retry = [...document.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent === 'Use a different email')!;
    await act(async () => retry.click());
    await change('register-password', 'password123'); await change('register-confirmation', 'password123');
    confirmationRequired = false; await submit();
    assert.match(document.body.textContent || '', /Email confirmation is not required/);
  } finally { authService.register = originalRegister; await act(async () => root.unmount()); dom.window.close(); }
});
