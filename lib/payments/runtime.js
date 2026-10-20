const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const origin = 'https://www.invitesse.com';
function adminClient() {
 const url=process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
 if(!url || !process.env.SUPABASE_SECRET_KEY?.startsWith('sb_secret_')) throw new Error('PAYMENTS_NOT_CONFIGURED');
 return createClient(url,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
}
function stripeClient() {
 if(!process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') || !process.env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_')) throw new Error('PAYMENTS_NOT_CONFIGURED');
 return new Stripe(process.env.STRIPE_SECRET_KEY,{maxNetworkRetries:2,timeout:15000});
}
async function userFor(req,admin) {
 const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization || '')?.[1];
 if(!token) throw new Error('AUTH_REQUIRED');
 const {data,error}=await admin.auth.getUser(token);
 if(error || !data.user) throw new Error('AUTH_REQUIRED');
 if(!data.user.email_confirmed_at) throw new Error('EMAIL_NOT_CONFIRMED');
 return data.user;
}
function headers(res) {res.setHeader('Cache-Control','private, no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Robots-Tag','noindex, nofollow');}
async function unwrap(query) {const {data,error}=await query;if(error) {const failure=new Error(error.message);failure.code=error.code;throw failure;}return data;}
module.exports={origin,adminClient,stripeClient,userFor,headers,unwrap};
