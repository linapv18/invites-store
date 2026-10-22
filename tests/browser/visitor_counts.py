"""Local production-host fixture; no analytics requests leave the browser."""
import asyncio,mimetypes
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[2]/'dist'
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  c=await b.new_context();hits={'basic':0,'optional':0}
  async def route(r):
   from urllib.parse import urlsplit
   u=urlsplit(r.request.url)
   if u.hostname!='www.invitesse.com':
    if 'googletagmanager' in u.hostname or 'clarity.ms' in u.hostname:hits['optional']+=1
    return await r.fulfill(status=200,content_type='application/javascript',body='')
   if u.path=='/_vercel/insights/script.js':
    hits['basic']+=1
    return await r.fulfill(content_type='application/javascript',body="window.__countEvent=vaq.find(x=>x[0]==='beforeSend')[1]({type:'pageview',url:location.href});")
   f=ROOT/u.path.lstrip('/');f=f/'index.html' if f.is_dir() else f
   if not f.is_file():return await r.fulfill(status=404,body='')
   return await r.fulfill(content_type=mimetypes.guess_type(str(f))[0] or 'application/octet-stream',body=f.read_bytes())
  await c.route('**/*',route);pg=await c.new_page()
  await pg.goto('https://www.invitesse.com/?secret=private#token',wait_until='networkidle')
  assert hits=={'basic':1,'optional':0},hits
  assert await pg.evaluate('__countEvent.url')=='https://www.invitesse.com/'
  await pg.locator('section [data-privacy=reject]').click();await pg.reload(wait_until='networkidle')
  assert hits=={'basic':2,'optional':0},hits
  await pg.locator('footer [data-privacy=settings]').click();await pg.locator('dialog input').check();await pg.locator('[data-privacy=save]').click();await pg.wait_for_timeout(500)
  # Query parameters deliberately prevent Clarity loading; GA is still opt-in.
  assert hits=={'basic':2,'optional':1},hits
  await pg.goto('https://www.invitesse.com/disenos/',wait_until='networkidle')
  assert hits=={'basic':3,'optional':3},hits
  await pg.goto('https://www.invitesse.com/invitacion/',wait_until='networkidle')
  assert hits=={'basic':3,'optional':3},hits
  await b.close();print('Built page counts without consent; GA/Clarity remain opt-in; URL secrets and private invitations excluded.')
asyncio.run(main())
