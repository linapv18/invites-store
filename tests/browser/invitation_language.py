"""Selected invitation language wins over URL prefix; public demos stay localized."""
import asyncio,subprocess,time
from pathlib import Path
from playwright.async_api import async_playwright
import cloud_flows as flows
BASE=flows.BASE
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);c=await b.new_context(viewport={'width':390,'height':844});await c.route('https://**/*',lambda r:r.abort());page=await c.new_page();await page.goto(BASE+'/')
  for d in sorted(x.parent.name for x in Path('demo').glob('*/index.html')):
   for lang,prefix,wrong in [('en','/en',''),('es','','/en')]:
    await page.goto(BASE+'/',wait_until='domcontentloaded')
    await page.evaluate('lang=>localStorage.setItem("language-test",JSON.stringify({invitationLanguage:lang,n1:"Camila",n2:"Daniel",msg:"Mensaje propio sin traducir",bilingual:true}))',lang)
    await page.goto(BASE+wrong+'/demo/'+d+'/?lz=vista&k=language-test#historia',wait_until='domcontentloaded')
    await page.wait_for_url(BASE+prefix+'/demo/'+d+'/?lz=vista&k=language-test#historia')
    await page.locator('[data-lz=n1]').first.wait_for(state='attached')
    assert await page.locator('html').get_attribute('lang')==lang,d
    await page.wait_for_function("document.querySelector('[data-lz=n1]').textContent==='Camila'")
   print(d,'ES/EN saved language overrides modified URL',flush=True)
  await page.goto(BASE+'/en/demo/onix/',wait_until='domcontentloaded');assert '/en/demo/' in page.url;assert await page.locator('html').get_attribute('lang')=='en'
  await c.close();api=flows.Backend();flows.USER['user_metadata']={'invitesse_editor_guide_seen':True};api.rows=[{'id':'22222222-2222-4222-8222-222222222222','design_id':'onix','content':{'n1':'Camila','n2':'Daniel'},'revision':0,'updated_at':'2026-10-19T00:00:00Z'}]
  c=await b.new_context(viewport={'width':1440,'height':1000});await c.route('https://*.supabase.co/**',api.route);page=await c.new_page();await flows.login(page)
  await page.goto(BASE+'/editor/?diseno=onix&guia=0',wait_until='networkidle');select=page.locator('select[data-k=invitationLanguage]');assert await select.input_value()=='';assert await select.get_attribute('required') is not None
  await select.select_option('en');await page.wait_for_function("document.querySelector('[data-save]').textContent.includes('Cambios guardados')");assert api.rows[0]['content']['invitationLanguage']=='en'
  await page.frame_locator('#edFrame').locator('html[lang=en]').wait_for(state='attached');await page.reload(wait_until='networkidle');assert await select.input_value()=='en'
  await page.locator('[data-act=sec][data-id=bilingue]').first.click();await page.locator('#edH1').filter(has_text='Sitio bilingüe').wait_for()
  await page.goto(BASE+'/en/editor/?diseno=onix&guia=0#portada',wait_until='networkidle');assert await select.input_value()=='en';await select.select_option('es');await page.frame_locator('#edFrame').locator('html[lang=es]').wait_for(state='attached');await page.wait_for_function("document.querySelector('[data-save]').textContent.includes('Changes saved')")
  assert api.rows[0]['content']['invitationLanguage']=='es';print('Required editor choice, reload, independent editor language and bilingual add-on navigation OK',flush=True);await b.close()
if __name__=='__main__':
 server=subprocess.Popen(['python','-m','http.server','4174','--directory','dist'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(.4)
 try:asyncio.run(main())
 finally:server.terminate()
