import test from 'node:test';
import assert from 'node:assert/strict';
import { supabaseOrigin } from '../lib/supabase/config.mjs';
test('build accepts the existing project and the exact branded endpoint',()=>{
 assert.equal(supabaseOrigin('https://fqtfdzqrialgjkdirdfr.supabase.co'), 'https://fqtfdzqrialgjkdirdfr.supabase.co');
 assert.equal(supabaseOrigin('https://auth.invitesse.com/'), 'https://auth.invitesse.com');
});
test('endpoint configuration rejects deceptive hosts, insecure URLs and embedded credentials',()=>{
 for(const value of ['http://auth.invitesse.com','https://auth.invitesse.com.evil.example','https://evil.example','https://user:password@auth.invitesse.com','https://auth.invitesse.com/path','https://auth.invitesse.com?redirect=evil','https://auth.invitesse.com:8443','https://auth.invitesse.com/#secret']) assert.throws(()=>supabaseOrigin(value));
});
