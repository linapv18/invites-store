import sys,asyncio,json,os
sys.path.insert(0,str(__import__('pathlib').Path(__file__).resolve().parent))
from cloud_flows import Backend,login
from playwright.async_api import async_playwright
BASE=os.environ.get('INVITESSE_TEST_BASE','http://127.0.0.1:4174')
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for lang,width in [('es',1440),('en',390)]:
   c=await b.new_context(viewport={'width':width,'height':1000});api=Backend();await c.add_init_script("window.addEventListener('unhandledrejection',e=>console.error('REJECT',e.reason?.stack||String(e.reason)))");await c.route('https://*.supabase.co/**',api.route);pg=await c.new_page();pg.on('console',lambda m:print(m.type,m.text,flush=True) if m.type=='error' else None);errors=[];pg.on('pageerror',lambda e:(errors.append(str(e)),print('JS ERROR',str(e),flush=True)))
   await login(pg)
   await pg.goto(BASE+'/comprar/?diseno=costa',wait_until='networkidle');await pg.locator('[data-act=testbuy]').click();await pg.wait_for_url('**/editor/?diseno=costa')
   if lang=='es':await pg.goto(BASE+'/editor/?diseno=costa&guia=0',wait_until='networkidle')
   if lang=='en':await pg.goto(BASE+'/en/editor/?diseno=costa&guia=0',wait_until='networkidle')
   await pg.locator('[data-k=n1]').wait_for(timeout=10000)
   for k in ['n1','n2','date','city','msg']:assert await pg.locator('[data-k='+k+']').input_value()=='',k
   content=await pg.evaluate('JSON.parse(localStorage.getItem(window.LazoAuth.invKey("costa")))')
   for k in ['cover','storyTitle','story','sealText','musicTrackSrc']:assert content[k]=='',(k,content[k])
   for k in ['gallery','events','faqs','invitations','polls']:assert content[k]==[],k
   frame=pg.frame_locator('#edFrame');await frame.locator('[data-lz=n1]').first.wait_for(state='attached')
   assert await frame.locator('[data-lz=n1]').first.inner_text()==''
   assert await frame.locator('[data-lz-date]').first.inner_text()==''
   assert not await frame.get_by_text('Por completar',exact=True).count()
   assert not await frame.get_by_text('To complete',exact=True).count()
   assert '2027' not in await frame.locator('[data-lz-date]').first.inner_text()
   assert (await frame.locator('[data-lz-src]').first.get_attribute('src')).startswith('data:image/svg+xml,')
   await pg.locator('[data-k=n1]').fill('Camila');await pg.locator('[data-k=n2]').fill('Daniel');await pg.locator('[data-k=n2]').press('Tab');await pg.wait_for_timeout(2000)
   assert api.rows[0]['content']['n1']=='Camila'
   await pg.reload(wait_until='networkidle');assert await pg.locator('[data-k=n1]').input_value()=='Camila'
   assert await pg.locator('[data-k=n2]').input_value()=='Daniel'
   await pg.locator('[data-act=reset-content]').click();await pg.locator('[data-act=modal-close]').click();assert await pg.locator('[data-k=n1]').input_value()=='Camila'
   await pg.locator('[data-act=reset-content]').click();await pg.locator('[data-act=reset-content-yes]').click();await pg.wait_for_timeout(2000)
   assert await pg.locator('[data-k=n1]').input_value()==''
   assert api.rows[0]['content']['design']=='costa' and api.rows[0]['content']['n1']==''
   await pg.reload(wait_until='networkidle');assert await pg.locator('[data-k=n1]').input_value()==''
   assert not errors,errors

   print(lang,width,'empty draft, neutral preview, save and reload OK',flush=True);await c.close()
  c=await b.new_context();pg=await c.new_page();await pg.goto(BASE+'/demo/costa/',wait_until='networkidle');assert await pg.locator('[data-lz=n1]').first.inner_text() not in ['','Por completar'];print('Public demo retains sample content',flush=True);await b.close()
asyncio.run(main())
