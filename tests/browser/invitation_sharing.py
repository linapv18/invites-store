"""Inspect share links without opening apps or sending messages."""
import asyncio,subprocess,time
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.async_api import async_playwright
import cloud_flows as flows
BASE=flows.BASE
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);c=await b.new_context(viewport={'width':390,'height':844})
  await c.route('https://**/*',lambda r:r.abort());await c.add_init_script("Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.copied=text;}}})")
  page=await c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  for d in sorted(x.parent.name for x in Path('demo').glob('*/index.html')):
   await page.goto(BASE+'/demo/'+d+'/?lz=vista&k=private-preview',wait_until='domcontentloaded');await page.wait_for_function('window.LazoPanel');await page.evaluate('LazoPanel.open()')
   await page.locator('.lz-panel [data-tab=invitados]').first.click();details=page.locator('.lz-share').first;await details.locator('summary').click()
   wa=await details.locator('a').first.get_attribute('href');message=parse_qs(urlparse(wa).query)['text'][0];assert 'Invitesse' in message and 'demostración' in message and 'private-preview' not in message and 'Familia' not in message
   expected='https://www.invitesse.com/demo/'+d+'/';assert expected in message
   sms=await details.locator('a').nth(1).get_attribute('href');assert sms.startswith('sms:?body=')
   await details.locator('[data-copy-link="0"]').click();assert await page.evaluate('window.copied')==expected
   await page.locator('.lz-panel [data-tab=envio]').first.click();await page.locator('#lzTpl').fill('Invitesse — prueba {enlace}');wa=await page.locator('.lz-share a').first.get_attribute('href');assert 'Invitesse — prueba' in parse_qs(urlparse(wa).query)['text'][0]
   print(d,'WhatsApp/SMS/copy, clean public link and editable message OK',flush=True)
  await c.close()
  c=await b.new_context(viewport={'width':390,'height':844},user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)');await c.route('https://**/*',lambda r:r.abort());page=await c.new_page();await page.goto(BASE+'/en/demo/onix/',wait_until='domcontentloaded');await page.evaluate('LazoPanel.open()');await page.locator('.lz-panel [data-tab=envio]').first.click();details=page.locator('.lz-share').first;assert (await details.locator('a').nth(1).get_attribute('href')).startswith('sms:&body=');wa=await details.locator('a').first.get_attribute('href');assert 'not a personal invitation' in parse_qs(urlparse(wa).query)['text'][0];print('English/iOS SMS link OK',flush=True)
  await c.close();api=flows.Backend();flows.USER['user_metadata']={'invitesse_editor_guide_seen':True};api.rows=[{'id':'22222222-2222-4222-8222-222222222222','design_id':'onix','content':{'invitations':[{'id':1,'name':'Familia de prueba','people':['Ana']}]},'revision':0,'updated_at':'2026-10-19T00:00:00Z'}]
  c=await b.new_context(viewport={'width':1440,'height':1000});await c.route('https://*.supabase.co/**',api.route);page=await c.new_page();await flows.login(page);await page.goto(BASE+'/editor/?diseno=onix&guia=0#invitados',wait_until='networkidle');details=page.locator('.ed-pending-share').first;await details.locator('summary').click();assert await details.locator('button:disabled').count()==3;assert await details.locator('a').count()==0
  assert not errors,errors;print('Draft sharing disabled; no editor/private links exposed',flush=True);await b.close()
if __name__=='__main__':
 server=subprocess.Popen(['python','-m','http.server','4174','--directory','dist'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(.4)
 try:asyncio.run(main())
 finally:server.terminate()
