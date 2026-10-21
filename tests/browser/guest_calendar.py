"""A real ICS download from an opaque published invitation, with fictional data only."""
import asyncio,json,mimetypes
from pathlib import Path
from urllib.parse import urlsplit
from playwright.async_api import async_playwright,expect
ROOT=Path(__file__).resolve().parents[2];DIST=ROOT/'dist'
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for lang in ['es','en']:
   page=await browser.new_page(viewport={'width':390,'height':844},accept_downloads=True,reduced_motion='reduce')
   data={'design':'encaje','content':{'n1':'Ana','n2':'Leo','date':'2028-05-15','timeZone':'America/Bogota','invitationLanguage':lang,'city':'Bogotá','events':[{'name':'Ceremonia','time':'15:30','place':'Lugar de prueba','address':'Dirección de prueba'}]},'household':{'name':'Familia ficticia'},'guests':[{'id':'fixture','name':'Invitado ficticio','attendance':None}],'response':{'revision':0,'message':''}}
   sdk='window.InvitesseGuestBackend={guests:{open:async()=>('+json.dumps(data)+')}};'
   async def route(r):
    path=urlsplit(r.request.url).path
    if 'guest-client.' in path:return await r.fulfill(content_type='application/javascript',body=sdk)
    file=DIST/path.lstrip('/')
    if file.is_dir():file=file/'index.html'
    if file.is_file():return await r.fulfill(content_type=mimetypes.guess_type(str(file))[0] or 'application/octet-stream',body=file.read_bytes())
    await r.abort()
   await page.route('**/*',route)
   await page.goto('https://www.invitesse.com/invitacion/#token='+'f'*64)
   frame=page.frame_locator('#invitationFrame');await frame.locator('html[data-reply-bound=true]').wait_for(state='attached')
   await frame.locator('body').evaluate('LzTemplate.open()')
   button=frame.locator('#addCal');await expect(button).to_be_enabled()
   async with page.expect_download(timeout=8000) as download:
    await button.click()
   file=await download.value;assert file.suggested_filename=='boda.ics';ics=Path(await file.path()).read_text()
   assert 'BEGIN:VCALENDAR' in ics and 'BEGIN:VEVENT' in ics
   assert 'DTSTART:20280515T203000Z' in ics,ics
   assert 'DTEND:20280516T023000Z' in ics
   assert 'Lugar de prueba' in ics and 'Dirección de prueba' in ics
   assert 'Invitado ficticio' not in ics and 'f'*64 not in ics
   assert page.url.endswith('f'*64)
   sandbox=await page.locator('#invitationFrame').get_attribute('sandbox');assert 'allow-downloads' not in sandbox and 'allow-same-origin' not in sandbox
   print('PASS published ICS download, Bogotá timezone, real event location, private token omitted:',lang,flush=True)
   await page.close()
  await browser.close()
asyncio.run(main())
