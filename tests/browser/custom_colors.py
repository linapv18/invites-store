"""Custom colors in eight demos and editor drafts; no real backend writes."""
import asyncio,subprocess,time
from playwright.async_api import async_playwright
from photo_colors import Backend
import cloud_flows as flows
D=['clasico','moderno','noir','tinta','arco','lino','gala','onix'];BASE=flows.BASE
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);c=await b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce');api=Backend();flows.USER['user_metadata']={'invitesse_editor_guide_seen':True}
  await c.route('https://*.supabase.co/**',api.route);await c.route('https://fonts.googleapis.com/**',lambda r:r.abort());page=await c.new_page()
  for d in D:
   await page.goto(BASE+'/demo/'+d+'/',wait_until='domcontentloaded');inp=page.locator('.lz-custom-color input');await inp.wait_for(state='attached')
   for color in ['#ffffff','#faff00','#2244aa']:
    await inp.evaluate('(e,c)=>{e.value=c;e.dispatchEvent(new Event("input",{bubbles:true}));}',color)
    style=await page.locator('html').get_attribute('style');assert style and color!='',d
   before=await page.locator('html').get_attribute('style');await page.locator('.lz-colors button:not(.lz-photo)').first.evaluate('e=>e.click()');assert before!=await page.locator('html').get_attribute('style'),d
   assert await page.locator('.lz-colors').evaluate('e=>e.getBoundingClientRect().right<=innerWidth'),d
   print('demo',d,'OK',flush=True)
  for i,d in enumerate(D):api.rows.append({'id':f'22222222-2222-4222-8222-{i:012d}','design_id':d,'content':{'n1':'Lina','n2':'Nico'},'revision':0,'updated_at':'2026-10-19T00:00:00Z'})
  await page.set_viewport_size({'width':1440,'height':1000});await flows.login(page)
  for d in D:
   await page.goto(BASE+'/editor/?diseno='+d+'&guia=0',wait_until='networkidle');inp=page.locator('input[data-k=palCustom]');await inp.fill('#2244aa');await inp.dispatch_event('input')
   await page.wait_for_function("document.querySelector('[data-save]').textContent.includes('Cambios guardados')")
   row=next(r for r in api.rows if r['design_id']==d);assert row['content']['pal']=='custom' and row['content']['palCustom']=='#2244aa',d
   frame=page.frame_locator('#edFrame');await frame.locator('html[style]').wait_for(state='attached')
   await page.reload(wait_until='networkidle');assert await page.locator('input[data-k=palCustom]').input_value()=='#2244aa',d
   print('editor',d,'save/reload OK',flush=True)
  await b.close()
if __name__=='__main__':
 server=subprocess.Popen(['python','-m','http.server','4174','--directory','dist'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(.4)
 try:asyncio.run(main())
 finally:server.terminate()
