"""Loader and parallel private-asset waterfall; synthetic capabilities, no remote requests."""
import asyncio,json,mimetypes
from pathlib import Path
from urllib.parse import urlsplit
from playwright.async_api import async_playwright,expect
ROOT=Path(__file__).resolve().parents[2];DIST=ROOT/'dist'
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce');rpc_gate=asyncio.Event();asset_gate=asyncio.Event();all_started=asyncio.Event();template_started=asyncio.Event();starts=[];requests=[]
  ids=['11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333']
  data={'design':'encaje','content':{'n1':'Ana','n2':'Leo','date':'2028-05-15','cover':'asset:'+ids[0],'monoImg':'asset:'+ids[0],'musicTrackSrc':'asset:'+ids[1],'musicOn':False,'gallery':['asset:'+ids[2],'asset:'+ids[0]]},'household':{'name':'Fixture'},'guests':[{'id':'fixture','name':'Persona ficticia','attendance':None}],'response':{'revision':0,'message':''}}
  async def route(r):
   path=urlsplit(r.request.url).path;requests.append(path)
   if '/rest/v1/rpc/' in path:
    await rpc_gate.wait();return await r.fulfill(content_type='application/json',headers={'Access-Control-Allow-Origin':'*'},body=json.dumps(data))
   if path=='/api/invitation-asset/':
    starts.append(r.request.post_data_json['assetId'])
    if len(starts)>=3:all_started.set()
    await asset_gate.wait();return await r.fulfill(content_type='application/json',body=json.dumps({'url':'https://www.invitesse.com/assets/fotos/muro.webp'}))
   if path=='/demo/encaje/':template_started.set()
   file=DIST/path.lstrip('/')
   if file.is_dir():file=file/'index.html'
   if file.is_file():return await r.fulfill(content_type=mimetypes.guess_type(str(file))[0] or 'application/octet-stream',body=file.read_bytes())
   await r.abort()
  await page.route('**/*',route)
  await page.goto('https://www.invitesse.com/invitacion/#token='+'d'*64,wait_until='domcontentloaded')
  await expect(page.locator('#invitationStatus')).to_be_visible();assert await page.locator('.iv-loader-art').count()==1
  assert await page.locator('body').get_attribute('aria-busy')=='true'
  assert await page.locator('.iv-loader-art').evaluate("e=>getComputedStyle(e).animationName")=='none'
  await page.screenshot(path='/tmp/invitation-loader-390.png')
  rpc_gate.set();await asyncio.wait_for(all_started.wait(),5);await asyncio.wait_for(template_started.wait(),5)
  assert len(starts)==3 and set(starts)==set(ids),starts
  await expect(page.locator('#invitationStatus')).to_be_visible()
  asset_gate.set();await expect(page.locator('#invitationStatus')).to_be_hidden(timeout=20000)
  assert await page.locator('body').get_attribute('aria-busy')=='false'
  assert '/assets/backend/client.js' not in requests
  assert not any('/auth/v1/' in path for path in requests)
  assert await page.locator('#invitationFrame').get_attribute('sandbox')=='allow-scripts allow-popups allow-popups-to-escape-sandbox'
  print('PASS styled loader, reduced motion, parallel template/assets, asset deduplication, no account SDK/auth calls, sandbox and ready handshake',flush=True)
  await page.close();failure=await browser.new_page()
  async def failed_route(r):
   if '/rest/v1/rpc/' in r.request.url:return await r.fulfill(status=503,headers={'Access-Control-Allow-Origin':'*'},content_type='application/json',body='{}')
   await route(r)
  await failure.route('**/*',failed_route)
  await failure.goto('https://www.invitesse.com/invitacion/#token='+'e'*64,wait_until='domcontentloaded')
  await expect(failure.get_by_role('button',name='Reintentar')).to_be_visible()
  await expect(failure.locator('#invitationFrame')).to_be_hidden()
  assert await failure.locator('body').get_attribute('aria-busy')=='false'
  print('PASS failed capability shows usable retry instead of an endless loader',flush=True)
  await browser.close()
asyncio.run(main())
