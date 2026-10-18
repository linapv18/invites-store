import asyncio,json
from urllib.parse import urlparse,parse_qs
from cloud_flows import Backend,BASE,ARTIFACTS
from pathlib import Path
from playwright.async_api import async_playwright
class GoogleBackend(Backend):
 def __init__(self):super().__init__();self.authorize=None
 async def route(self,r):
  if '/auth/v1/settings' in r.request.url:
   await asyncio.sleep(1)
   return await r.fulfill(status=200,content_type='application/json',body=json.dumps({'external':{'google':True}}))
  if '/auth/v1/authorize' in r.request.url:
   self.authorize=r.request.url
   return await r.fulfill(status=200,content_type='text/html',body='<p>Simulated OAuth provider</p>')
  return await super().route(r)
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for lang in ['', 'en/']:
   for width in [1440,390,320]:
    c=await browser.new_context(viewport={'width':width,'height':900},is_mobile=width<500,has_touch=width<500);backend=GoogleBackend();await c.route('https://*.supabase.co/**',backend.route);page=await c.new_page()
    account=lang+('account/' if lang else 'cuenta/')
    await page.goto(BASE+'/'+account,wait_until='domcontentloaded');await page.locator('[name=email]').fill('typed@example.invalid')
    button=page.locator('[data-act=google]');await button.wait_for();assert await page.locator('[name=email]').input_value()=='typed@example.invalid'
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    if width==390:
     await page.add_script_tag(path=str(Path(__file__).resolve().parents[2]/'node_modules/axe-core/axe.min.js'))
     violations=await page.evaluate("async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>v.id)}")
     assert not violations,violations
     await page.screenshot(path=str(ARTIFACTS/('google-account-'+(lang.strip('/') or 'es')+'.png')))

    await page.goto(BASE+'/'+lang+'comprar/?diseno=rosa',wait_until='networkidle');await button.wait_for();await button.click();await page.wait_for_url('**/auth/v1/authorize**')
    options=parse_qs(urlparse(backend.authorize).query);assert options['provider']==['google'];assert options['code_challenge_method']==['s256'];assert 'code_challenge' in options
    assert options['redirect_to']==[BASE+('/en/cuenta/' if lang else '/cuenta/')]
    await page.goto(BASE+'/'+account+'?code=fake-google-code',wait_until='networkidle');await page.wait_for_url('**/comprar/?diseno=rosa');await page.locator('[data-act=testbuy]').wait_for();assert await page.evaluate('!!LazoAuth.current()')
    print(json.dumps({'language':lang or 'es','width':width,'GooglePKCE':'OK','returnToDesign':'OK','noRealGoogleRequests':True}),flush=True);await c.close()
  c=await browser.new_context();backend=GoogleBackend();await c.route('https://*.supabase.co/**',backend.route);pg=await c.new_page();await pg.goto(BASE+'/cuenta/?error=access_denied',wait_until='networkidle');assert 'No se completó' in await pg.locator('.ac-error').inner_text()
  print('Cancellation is explained; email login remains available.',flush=True);await browser.close()
asyncio.run(main())
