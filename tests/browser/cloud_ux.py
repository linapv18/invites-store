import asyncio,json,os
from pathlib import Path
ARTIFACTS=Path(os.environ.get("INVITESSE_TEST_ARTIFACTS","/tmp/invitesse-browser-checks"));ARTIFACTS.mkdir(parents=True,exist_ok=True)
import json
from cloud_flows import Backend,BASE,login
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for lang in ['', 'en/']:
   for w in [1440,768,390,320]:
    c=await b.new_context(viewport={'width':w,'height':900},is_mobile=w<500,has_touch=w<500);api=Backend();await c.route('https://*.supabase.co/**',api.route);pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(BASE+'/'+lang+'cuenta/',wait_until='networkidle');await pg.locator('[name=email]').wait_for();assert await pg.evaluate('document.documentElement.scrollWidth<=innerWidth')
    await pg.locator('[data-id=reset]').click();assert await pg.locator('[name=pass]').count()==0;await pg.locator('[name=email]').fill('test@example.invalid');await pg.locator('[type=submit]').click();await pg.get_by_role('status').wait_for()
    await pg.add_script_tag(path=str(Path(__file__).resolve().parents[2]/'node_modules/axe-core/axe.min.js'));r=await pg.evaluate("async()=>{let r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.html)}))}");assert not r,r
    if lang=='' and w==390:await pg.screenshot(path=str(ARTIFACTS/'cloud-account-mobile.png'))
    assert not errs,errs;print(json.dumps({'language':lang or 'es','width':w,'account':'OK','recovery':'OK','axe':'OK'}),flush=True);await c.close()
  # Configuration/network failures must not silently fall back to local identities.
  c=await b.new_context();await c.route('https://*.supabase.co/**',lambda r:r.abort());pg=await c.new_page();await pg.goto(BASE+'/cuenta/',wait_until='networkidle');await pg.locator('[name=email]').wait_for();await pg.locator('[name=email]').fill('test@example.invalid');await pg.locator('[name=pass]').fill('PasswordLocal123');await pg.locator('[type=submit]').click();await pg.locator('.ac-error:not([hidden])').wait_for(timeout=60000);assert await pg.evaluate('window.LazoAuth.current()') is None
  print('Network errors do not create local accounts. All provider requests intercepted.',flush=True);await b.close()
asyncio.run(main())
