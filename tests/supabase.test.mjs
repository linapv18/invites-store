import test from 'node:test';
import assert from 'node:assert/strict';
import { createServices } from '../lib/supabase/services.mjs';

test('draft operations require a verified user before accessing data', async () => {
  let touched = false;
  const service = createServices({ auth: { getUser: async () => ({ data: { user: null }, error: null }) }, from: () => { touched = true; } });
  await assert.rejects(service.drafts.list(), /AUTH_REQUIRED/);
  await assert.rejects(service.drafts.create('rosa'), /AUTH_REQUIRED/);
  await assert.rejects(service.drafts.get('id'), /AUTH_REQUIRED/);
  await assert.rejects(service.drafts.save('id', {}, 0), /AUTH_REQUIRED/);
  assert.equal(touched, false);
});
test('draft saves send the expected revision and surface write conflicts', async () => {
  const conflict = new Error('DRAFT_CONFLICT_OR_NOT_FOUND');
  let received;
  const service = createServices({
    auth: { getUser: async () => ({ data: { user: { id: 'owner' } }, error: null }) },
    rpc: async (name, args) => { received = { name, args }; return { error: conflict }; },
  });
  await assert.rejects(service.drafts.save('draft', { names: 'Ana y León' }, 7), conflict);
  assert.deepEqual(received, { name: 'save_invitation_draft', args: { draft_id: 'draft', draft_content: { names: 'Ana y León' }, expected_revision: 7 } });
});
test('auth redirects accept only implemented account routes', async () => {
  globalThis.window = { location: { origin: 'https://www.invitesse.com' } };
  let options;
  const service = createServices({ auth: { signUp: async (input) => { options = input; return { data: {}, error: null }; } } });
  await service.auth.signUp(' test@example.invalid ', 'password', '/en/account/');
  assert.equal(options.options.emailRedirectTo, 'https://www.invitesse.com/en/cuenta/');
  assert.equal(options.email, 'test@example.invalid');
  assert.throws(() => service.auth.signUp('test@example.invalid', 'password', 'https://evil.example/'), /INVALID_REDIRECT/);
});
test('Google OAuth uses the same allowlisted account callback and fixed provider', async () => {
  globalThis.window = { location: { origin: 'https://www.invitesse.com' } };
  let sent;
  const service = createServices({ auth: { signInWithOAuth: async (options) => { sent = options; return { data: {}, error: null }; } } });
  await service.auth.signInWithGoogle('/en/account/');
  assert.equal(sent.provider, 'google');
  assert.equal(sent.options.redirectTo, 'https://www.invitesse.com/en/cuenta/');
  assert.throws(() => service.auth.signInWithGoogle('https://evil.example/'), /INVALID_REDIRECT/);
});
