"""Optional gifts in all templates plus persisted editor controls (mock backend)."""
import asyncio,subprocess,time
from pathlib import Path
from playwright.async_api import async_playwright
from photo_colors import Backend
import cloud_flows as flows
BASE=flows.BASE
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);c=await b.new_context(viewport={'width':390,'height':844})
  await c.route('https://**/*',lambda r:r.abort());page=await c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  for d in sorted(x.parent.name for x in Path('demo').glob('*/index.html')):
   await page.goto(BASE+'/demo/'+d+'/?lz=editor&k=gifts-test',wait_until='domcontentloaded');await page.wait_for_function('window.LazoContent && document.querySelector("#lz-gifts")')
   box=page.locator('#lz-gifts');assert await box.get_attribute('hidden') is not None,d
   await page.evaluate('LazoContent.apply({giftsOn:true,giftsMessage:"Gracias <script> por acompañarnos.",giftsEnvelopes:true,giftsRegistryUrl:"https://example.com/lista"})')
   assert await box.get_attribute('hidden') is None,d
   assert '<script>' in await box.locator('.lz-gifts-message').inner_text();assert await box.locator('script').count()==0
   assert await box.locator('a').get_attribute('href')=='https://example.com/lista'
   await page.evaluate('LazoContent.apply({giftsOn:true,giftsRegistryUrl:"javascript:alert(1)"})');assert await box.locator('a').count()==0 and await box.get_attribute('hidden') is not None,d
   await page.evaluate('LazoContent.apply({giftsOn:true,giftsEnvelopes:true})');assert await box.get_attribute('hidden') is None
   await page.evaluate('LazoContent.apply({giftsOn:false,giftsMessage:"Texto guardado"})');assert await box.get_attribute('hidden') is not None
   assert await page.locator('#lz-gifts').count()==1
   if d=='moderno':assert await page.locator('[data-go]').filter(has_text='Regalos').count()>=1
   print(d,'optional gifts/safe links OK',flush=True)
  await c.close();api=Backend();flows.USER['user_metadata']={'invitesse_editor_guide_seen':True}
  api.rows=[{'id':'22222222-2222-4222-8222-222222222222','design_id':'onix','content':{'n1':'Lina','n2':'Nico'},'revision':0,'updated_at':'2026-10-19T00:00:00Z'}]
  c=await b.new_context(viewport={'width':1440,'height':1000});await c.route('https://*.supabase.co/**',api.route);page=await c.new_page();await flows.login(page)
  await page.goto(BASE+'/editor/?diseno=onix&guia=0#regalos',wait_until='networkidle');await page.locator('[data-k=giftsOn]').wait_for();assert await page.locator('[data-k=giftsMessage]').count()==0
  await page.locator('[data-k=giftsOn]').click();await page.locator('[data-k=giftsMessage]').fill('Su compañía es nuestro mejor regalo.');await page.locator('[data-k=giftsEnvelopes]').click();await page.locator('[data-k=giftsRegistryUrl]').fill('javascript:alert(1)');assert await page.locator('#giftUrlError').is_visible()
  await page.locator('[data-k=giftsRegistryUrl]').fill('https://example.com/lista');assert not await page.locator('#giftUrlError').is_visible()
  await page.wait_for_function("document.querySelector('[data-save]').textContent.includes('Cambios guardados')")
  assert api.rows[0]['content']['giftsOn'] is True and api.rows[0]['content']['giftsEnvelopes'] is True
  await page.reload(wait_until='networkidle');assert await page.locator('[data-k=giftsRegistryUrl]').input_value()=='https://example.com/lista'
  await page.locator('[data-k=giftsOn]').click();await page.wait_for_function("document.querySelector('[data-save]').textContent.includes('Cambios guardados')")
  assert api.rows[0]['content']['giftsOn'] is False and api.rows[0]['content']['giftsMessage']=='Su compañía es nuestro mejor regalo.'
  assert not errors,errors;print('Editor defaults, validation, save/reload and disable without data loss OK',flush=True);await b.close()
if __name__=='__main__':
 server=subprocess.Popen(['python','-m','http.server','4174','--directory','dist'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(.4)
 try:asyncio.run(main())
 finally:server.terminate()
