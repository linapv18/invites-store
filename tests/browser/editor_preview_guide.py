"""Editor clipping and one-time account onboarding, using mocked Supabase only."""
import asyncio,copy,io,json,os
from pathlib import Path
from PIL import Image
from playwright.async_api import async_playwright
import cloud_flows as flows
BASE=os.environ.get('INVITESSE_TEST_BASE','http://127.0.0.1:4174')
class Backend(flows.Backend):
 def __init__(self):
  super().__init__();self.preferences=0
  for i,d in enumerate(['costa','jardin']):
   self.rows.append({'id':f'22222222-2222-4222-8222-22222222222{i}','design_id':d,'content':{'n1':'Lina','n2':'Nicolás','pal':'barro','hotel':'Hotel de prueba'},'revision':0,'updated_at':'2026-10-19T00:00:00Z'})
 async def route(self,r):
  if '/auth/v1/user' in r.request.url and r.request.method=='PUT':
   self.preferences+=1;flows.USER['user_metadata'].update(r.request.post_data_json.get('data',{}))
   await r.fulfill(status=200,content_type='application/json',body=json.dumps(flows.USER));return
  await super().route(r)
async def no_auto(pg):
 await pg.wait_for_timeout(700);assert await pg.locator('.ed-welcome-box,.ed-tour-pop').count()==0
async def main():
 flows.USER['user_metadata']={}
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);api=Backend()
  async def context(width):
   c=await b.new_context(viewport={'width':width,'height':1000});await c.route('https://*.supabase.co/**',api.route);return c
  c=await context(1440);pg=await c.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)));await flows.login(pg)
  await pg.goto(BASE+'/editor/?diseno=costa',wait_until='networkidle');await pg.locator('.ed-welcome-box').wait_for();await pg.wait_for_function("LazoAuth.current().editorGuideSeen===true");assert api.preferences==1
  await pg.locator('[data-act=guide-later]').click();await pg.reload(wait_until='networkidle');await no_auto(pg)
  await pg.goto(BASE+'/editor/?diseno=jardin',wait_until='networkidle');await no_auto(pg)
  await pg.locator('[data-act=guide]').click();await pg.locator('.ed-gpanel').wait_for();await pg.locator('[data-act=guide-replay]').click();await pg.locator('.ed-tour-pop').wait_for()
  for _ in range(5):await pg.locator('[data-act=tour-next]').click()
  assert await pg.locator('.ed-tour-pop').count()==0;await pg.reload(wait_until='networkidle');await no_auto(pg)
  print('First welcome, skip, completion, design change and explicit guide replay OK; one account preference write',flush=True)
  c2=await context(390);p2=await c2.new_page();await flows.login(p2);await p2.goto(BASE+'/en/editor/?diseno=costa',wait_until='networkidle');await no_auto(p2)
  await p2.locator('[data-act=guide]').click();await p2.locator('[data-act=guide-replay]').click();await p2.locator('[data-act=tour-skip]').click();await p2.reload(wait_until='networkidle');await no_auto(p2)
  print('New browser/device and language respect account preference; manual guide still available',flush=True)
  for page,width in [(pg,1440),(p2,390)]:
   await page.goto(BASE+('/editor/' if width==1440 else '/en/editor/')+'?diseno=costa#viaje',wait_until='networkidle')
   if width<960:await page.locator('[data-act=mode][data-id=preview]').click()
   await page.wait_for_timeout(1500)
   ph=page.locator('#edPhone');screen=ph.locator('.ed-screen');assert await screen.count()==1
   image=Image.open(io.BytesIO(await ph.screenshot())).convert('RGB')
   for x,y in [(20,15),(12,20),(image.width-21,15),(image.width-13,20)]:assert max(abs(a-b) for a,b in zip(image.getpixel((x,y)),(30,38,34)))<=3,(width,x,y,image.getpixel((x,y)))
   assert await screen.evaluate("el=>getComputedStyle(el).overflow==='hidden'")
   await page.frame_locator('#edFrame').locator('#cbar a[href="#rsvp"]').click()
   assert await page.frame_locator('#edFrame').locator('#rsvp').is_visible()
   if width==1440:
    await page.locator('[data-act=device][data-id=d]').click();await page.wait_for_timeout(400)
    assert await screen.evaluate("el=>getComputedStyle(el).borderRadius==='6px'")
    await page.locator('[data-act=device][data-id=m]').click();await page.wait_for_timeout(400)
   print(width,'opaque rounded bezel, screen clipping, iframe navigation and device switching OK',flush=True)
  # Migrate an older per-design local preference without showing the welcome again.
  flows.USER['user_metadata']={};c3=await context(1440);p3=await c3.new_page();await flows.login(p3)
  await p3.evaluate("localStorage.setItem(LazoAuth.invKey('jardin')+':guia',JSON.stringify({seen:true}))")
  await p3.goto(BASE+'/editor/?diseno=costa',wait_until='networkidle');await no_auto(p3);assert flows.USER['user_metadata']['invitesse_editor_guide_seen'] is True
  flows.USER['user_metadata']={};c4=await context(1440);p4=await c4.new_page();await flows.login(p4)
  await p4.goto(BASE+'/editor/?diseno=costa',wait_until='networkidle');await p4.locator('.ed-welcome-box').wait_for();await p4.keyboard.press('Escape');await p4.reload(wait_until='networkidle');await no_auto(p4)
  print('Closing the welcome with Escape also prevents automatic repetition',flush=True)
  assert not errors,errors
  print('Existing local guide state migrates to account preference',flush=True)
  await b.close()
if __name__=='__main__':asyncio.run(main())
