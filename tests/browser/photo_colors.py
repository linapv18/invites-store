"""Photo color controls in demos and saved editor drafts, with Supabase mocked."""
import asyncio
from playwright.async_api import async_playwright
import cloud_flows as flows
BASE=flows.BASE
DESIGNS=['moderno','noir','corazones','tinta','estreno','nacar','onix']
class Backend(flows.Backend):
 async def route(self,r):
  if '/rest/v1/rpc/save_invitation_draft' in r.request.url:
   target=r.request.post_data_json['draft_id']
   self.rows.sort(key=lambda row:row['id']!=target)
  await super().route(r)
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  c=await b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce');api=Backend();flows.USER['user_metadata']={'invitesse_editor_guide_seen':True}
  await c.route('https://*.supabase.co/**',api.route)
  await c.route('https://fonts.googleapis.com/**',lambda r:r.abort())
  page=await c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  for d in DESIGNS+['senal']:
   await page.goto(BASE+'/en/demo/'+d+'/',wait_until='domcontentloaded')
   await page.wait_for_timeout(150)
   button=page.locator('.lz-colors .lz-photo').filter(has_text='Color photos')
   if d=='senal':assert await button.count()==0;continue
   assert await button.count()==1,d
   await button.evaluate('e=>e.click()');assert await button.get_attribute('aria-pressed')=='true'
   # Changing the palette must not reset the photo control's pressed state.
   swatch=page.locator('.lz-colors button:not(.lz-photo)').last
   if await swatch.count():await swatch.evaluate('e=>e.click()');assert await button.get_attribute('aria-pressed')=='true'
   photos=page.locator('img[data-lz-src^="photo:"],img[data-lz-f=img]')
   assert await photos.count()>0,d
   await page.wait_for_timeout(600)
   assert await photos.evaluate_all('els=>els.every(e=>getComputedStyle(e).filter==="none")'),d
   await button.evaluate('e=>e.click()');assert await button.get_attribute('aria-pressed')=='false'
   print('Demo',d,'color/original and palette OK',flush=True)
  for i,d in enumerate(DESIGNS+['senal']):
   api.rows.append({'id':f'22222222-2222-4222-8222-{i:012d}','design_id':d,'content':{'n1':'Lina','n2':'Nico','cover':'/assets/fotos/beso.jpg','gallery':['/assets/fotos/muro.jpg'],'photoBW':True},'revision':0,'updated_at':'2026-10-19T00:00:00Z'})
  await page.set_viewport_size({'width':1440,'height':1000});await flows.login(page)
  for i,d in enumerate(DESIGNS+['senal']):
   await page.goto(BASE+'/editor/?diseno='+d+'&guia=0',wait_until='networkidle')
   switch=page.locator('[data-act=toggle][data-k=photoBW]')
   if d=='senal':assert await switch.count()==0;continue
   await switch.wait_for();await switch.click()
   await page.wait_for_function("document.querySelector('[data-save]').textContent.includes('Cambios guardados')")
   assert next(r for r in api.rows if r['design_id']==d)['content']['photoBW'] is False,d
   frame=page.frame_locator('#edFrame');await frame.locator('html.lz-photo-color').wait_for(state='attached')
   assert await frame.locator('img[data-lz-src^="photo:"]').first.evaluate('e=>getComputedStyle(e).filter')=='none',d
   await page.reload(wait_until='networkidle');assert await page.locator('[data-k=photoBW]').get_attribute('aria-checked')=='false',d
   print('Editor',d,'preview/save/reload OK',flush=True)
  assert not errors,errors
  await b.close()
asyncio.run(main())
