"""SEO user journeys against dist/. Serve the build on 4174, or set INVITESSE_TEST_BASE.
API/email and external analytics requests are intercepted. No real invitations are changed.
"""
import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[2];BASE=os.environ.get('INVITESSE_TEST_BASE','http://127.0.0.1:4174')
async def main():
 results=[]
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for width in [320,390,1440]:
   ctx=await b.new_context(viewport={'width':width,'height':950},reduced_motion='reduce')
   await ctx.route('**/*',lambda r: r.continue_() if r.request.url.startswith(BASE) else r.abort())
   for route in ['/','/en/','/disenos/','/en/disenos/','/disenos/nacar/','/en/disenos/onix/','/disenos/estilos/elegantes/','/invitaciones-con-rsvp/','/en/about/','/recursos/que-incluir-invitacion-digital-boda/','/cotizar/']:
    page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    r=await page.goto(BASE+route,wait_until='networkidle');assert r.status==200
    await page.evaluate('document.fonts.ready');assert await page.locator('h1').count()==1
    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth'),(width,route,'overflow')
    if route in ['/disenos/','/en/disenos/']:
     assert await page.locator('.lz-card').count()==22
     await page.locator('#q').fill('nacar');assert await page.locator('.lz-card:visible').count()==1
     await page.locator('#q').fill('');assert await page.locator('.lz-card:visible').count()==22
     await page.locator('[data-style=botanico]').click();assert 0<await page.locator('.lz-card:visible').count()<22
     await page.locator('#clear').click()
     if width<960:
      await page.locator('#ftoggle').click();await page.keyboard.press('Escape');assert await page.locator('#ftoggle').get_attribute('aria-expanded')=='false'
    await page.add_script_tag(path=str(ROOT/'node_modules/axe-core/axe.min.js'))
    v=await page.evaluate("async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})).slice(0,3)}))")
    results.append({'width':width,'route':route,'violations':v,'errors':errors})
    if width in [390,1440] and route in ['/disenos/nacar/','/disenos/','/']:
     await page.screenshot(path='/tmp/seo-implemented-'+route.strip('/').replace('/','-')+'-'+str(width)+'.png',full_page=True)
    assert not errors,(route,errors)
    print(width,route,'axe',len(v),flush=True);await page.close()
   await ctx.close()
  nojs=await b.new_context(java_script_enabled=False);page=await nojs.new_page()
  for route in ['/disenos/','/en/disenos/']:
   await page.goto(BASE+route);assert await page.locator('.lz-card').count()==22;assert await page.locator('h1').inner_text();await page.locator('.lz-meta h2 a').first.click();assert '/disenos/nacar/' in page.url;assert await page.locator('h1').inner_text()
  await nojs.close()
  # The ordinary demo defers interior photos; personalized previews must not be overwritten.
  ctx=await b.new_context(reduced_motion='reduce');page=await ctx.new_page();photo_requests=[]
  await ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(BASE) else r.abort())
  page.on('request',lambda r:photo_requests.append(r.url) if '/assets/fotos/' in r.url else None)
  await page.goto(BASE+'/demo/nacar/',wait_until='networkidle')
  assert not photo_requests,photo_requests
  await page.locator('#enter').click();await page.wait_for_function("document.querySelector('#heroImg').complete && document.querySelector('#heroImg').naturalWidth>0")
  assert photo_requests
  await page.evaluate("localStorage.setItem('seo-preview',JSON.stringify({invitationLanguage:'es',n1:'Prueba',n2:'SEO',cover:'/assets/fotos/beso.jpg',gallery:[]}))")
  await page.goto(BASE+'/demo/nacar/?lz=editor&k=seo-preview',wait_until='networkidle')
  assert await page.locator('[data-invite-src]').count()==0
  await page.evaluate('window.LzTemplate.open()')
  assert (await page.locator('#heroImg').get_attribute('src')).endswith('/assets/fotos/beso.jpg')
  assert await page.locator('meta[name=robots]').get_attribute('content')=='noindex,nofollow'
  await ctx.close()
  # API calls and analytics are intercepted: never send a real email or test visit.
  ctx=await b.new_context()
  await ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(BASE) else r.fulfill(status=200,content_type='application/javascript',body=''))
  response_ok=False
  async def quote_api(route):
   await route.fulfill(status=200,content_type='application/json',body='{"ok":true}' if response_ok else '{}')
  await ctx.route('**/api/cotizacion',quote_api)
  page=await ctx.new_page();await page.goto(BASE+'/cotizar/?email=private@example.invalid',wait_until='networkidle')
  await page.locator('section [data-privacy=accept]').click()
  await page.locator('[name=names]').fill('SEO Test Couple')
  await page.locator('[name=email]').fill('seo-check@example.invalid')
  await page.locator('[name=vision]').fill('Una invitación de prueba con un sobre y una dirección visual editorial.')
  await page.locator('[name=consent]').check()
  await page.locator('.qt-submit').click();await page.locator('.qt-error').wait_for(state='visible');assert await page.locator('#quote').is_visible()
  assert await page.evaluate("dataLayer.filter(x=>x[0]==='event'&&x[1]==='generate_lead').length")==0
  response_ok=True;await page.locator('.qt-submit').click();await page.locator('#quote-done').wait_for(state='visible')
  events=await page.evaluate("dataLayer.filter(x=>x[0]==='event'&&x[1]==='generate_lead').map(x=>Array.from(x))")
  assert len(events)==1 and 'seo-check@example.invalid' not in json.dumps(events) and 'private@example.invalid' not in json.dumps(events)
  print('Quote: malformed success rejected; confirmed response renders success; lead analytics has no PII.',flush=True)
  await ctx.close();await b.close()
 Path('/tmp/seo-browser-implemented.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
 print('No-JS catalogue → design navigation verified. Total axe findings:',sum(len(r['violations']) for r in results))
asyncio.run(main())
