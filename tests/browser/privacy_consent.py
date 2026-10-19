"""Intercepts Google and Clarity endpoints: never sends test visits to production analytics."""
import asyncio,json,os,time
from pathlib import Path
from playwright.async_api import async_playwright
BASE=os.environ.get('INVITESSE_TEST_BASE','http://127.0.0.1:4174')
ROOT=Path(__file__).resolve().parents[2]
KEY='invitesse.privacy.v1'
ID='G-2YPN2SZT3R'
async def context(b,**kwargs):
 c=await b.new_context(**kwargs);calls=[]
 async def google(r):
  calls.append(r.request.url)
  await r.fulfill(status=200,content_type='application/javascript',body='window.__clarityLoaded=true;' if 'clarity.ms' in r.request.url else 'window.__googleLoaded=true;')
 await c.route('https://www.googletagmanager.com/**',google)
 await c.route('https://*.google-analytics.com/**',google)
 await c.route('https://*.clarity.ms/**',google)
 await c.route('https://clarity.ms/**',google)
 return c,calls
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for lang,width in [('es',1440),('en',390)]:
   c,calls=await context(b,viewport={'width':width,'height':900});pg=await c.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
   home=BASE+('/en/' if lang=='en' else '/')
   await pg.goto(home+'?email=private@example.invalid#secret',wait_until='networkidle')
   await pg.locator('.iv-privacy-banner').wait_for();assert not calls
   assert await pg.locator('.iv-privacy-launch').count()==0
   assert await pg.locator('footer [data-privacy=settings]').count()==1
   assert await pg.evaluate('document.documentElement.scrollWidth <= innerWidth')
   await pg.add_script_tag(path=str(ROOT/'node_modules/axe-core/axe.min.js'))
   violations=await pg.evaluate("async()=> (await axe.run(document.querySelector('.iv-privacy'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations")
   assert not violations,violations
   await pg.locator('section [data-privacy=reject]').click();await pg.reload(wait_until='networkidle');assert not calls
   assert await pg.locator('.iv-privacy-banner').is_hidden()
   await pg.locator('footer [data-privacy=settings]').click();await pg.locator('dialog input').check();await pg.locator('[data-privacy=save]').click();await pg.wait_for_function('window.__googleLoaded===true')
   assert len(calls)==1
   data=await pg.evaluate('dataLayer.map(x=>Array.from(x))')
   for command in data:
    raw=json.dumps(command,default=str);assert 'private@example' not in raw and '#secret' not in raw
   config=next(x[2] for x in data if x[0]=='config');assert config['send_page_view']==False and config['allow_google_signals']==False and config['page_referrer']==''
   link=pg.locator('a[href*="/demo/"]').first
   await link.evaluate("el=>el.addEventListener('click',e=>e.preventDefault())");await link.click()
   click=await pg.evaluate("dataLayer.map(x=>Array.from(x)).filter(x=>x[0]==='event'&&x[1]==='commercial_click').at(-1)")
   assert click[2]['action']=='open_demo' and 'private@example' not in json.dumps(click)
   # Mimic first-party cookies created by GA, then withdraw. Necessary storage must survive.
   await pg.evaluate("document.cookie='_ga=test;path=/';document.cookie='_ga_2YPN2SZT3R=test;path=/';document.cookie='_clck=test;path=/';document.cookie='_clsk=test;path=/';localStorage.setItem('necessary-test','keep')")
   await pg.locator('footer [data-privacy=settings]').click();await pg.locator('[data-privacy=reject]').last.click();await pg.wait_for_timeout(500);await pg.wait_for_load_state('networkidle')
   assert len(calls)==1
   cookies=await pg.evaluate('document.cookie');assert all(name not in cookies for name in ['_ga=','_clck=','_clsk='])
   assert await pg.evaluate("localStorage.getItem('necessary-test')")=='keep'
   # An old consent is expired, not an automatic opt-in.
   await pg.evaluate('(args)=>localStorage.setItem(args[0],JSON.stringify(args[1]))',[KEY,{'version':1,'analytics':True,'at':int(time.time()*1000)-181*86400000}]);await pg.reload(wait_until='networkidle');await pg.locator('.iv-privacy-banner').wait_for();assert len(calls)==1
   await pg.locator('section [data-privacy=settings]').click();await pg.locator('[data-privacy=close]').click()
   assert not errors,errors
   print(lang,width,'no pre-consent requests; rejection, opt-in, sanitized pageview, withdrawal, expiry and accessibility OK',flush=True)
   await c.close()
  c,calls=await context(b);await c.add_init_script("Object.defineProperty(navigator,'globalPrivacyControl',{get:()=>true})");pg=await c.new_page();await pg.goto(BASE+'/',wait_until='networkidle');assert not calls;await pg.locator('footer [data-privacy=settings]').click();assert await pg.locator('dialog input').is_disabled();await c.close();print('Global Privacy Control respected',flush=True)
  c,calls=await context(b);pg=await c.new_page()
  await pg.goto(BASE+'/',wait_until='networkidle');await pg.locator('section [data-privacy=accept]').click();await pg.wait_for_function('window.__googleLoaded===true')
  await pg.wait_for_function('window.__clarityLoaded===true');assert len(calls)==2
  consent=await pg.evaluate('clarity.q.map(x=>Array.from(x))');assert consent[0]==['consentv2',{'ad_Storage':'denied','analytics_Storage':'granted'}]
  await pg.goto(BASE+'/disenos/',wait_until='networkidle');assert len(calls)==4
  for route in ['/cuenta/','/en/account/','/editor/','/demo/costa/','/en/demo/costa/','/privacidad/','/en/privacy/']:
   await pg.goto(BASE+route,wait_until='networkidle');assert len(calls)==4,(route,calls)
  print('Opt-in persists to catalogue; account, editor, demos and legal pages excluded',flush=True)
  # Storage failure must never silently enable tracking.
  c,calls=await context(b);await c.add_init_script("Storage.prototype.setItem=function(){throw new Error('Unavailable')}");pg=await c.new_page();await pg.goto(BASE+'/',wait_until='networkidle');await pg.locator('section [data-privacy=accept]').click();assert not calls;assert await pg.locator('.iv-privacy-error').is_visible();await c.close()
  # Withdrawing in another tab disables and unloads an already loaded tag.
  c,calls=await context(b);pg=await c.new_page();await pg.goto(BASE+'/',wait_until='networkidle');await pg.locator('section [data-privacy=accept]').click();await pg.wait_for_function('window.__googleLoaded===true')
  legal=await c.new_page();await legal.goto(BASE+'/privacidad/',wait_until='networkidle');await legal.locator('footer [data-privacy=settings]').click();await legal.locator('dialog [data-privacy=reject]').click();await pg.wait_for_timeout(1000);await pg.wait_for_load_state('networkidle');assert len(calls)==2;assert await pg.evaluate("window['ga-disable-G-2YPN2SZT3R']") is True
  await c.close();print('Storage failure stays blocked; cross-tab withdrawal stops analytics',flush=True)
  await b.close()
if __name__=='__main__':asyncio.run(main())
