"""Branded not-found page. Local server emulates Vercel's native 404.html fallback."""
import asyncio,functools,os,threading
from pathlib import Path
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[2]
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def send_error(self,code,message=None,explain=None):
  if code!=404:return super().send_error(code,message,explain)
  data=(ROOT/'dist/404.html').read_bytes();self.send_response(404);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Content-Length',str(len(data)));self.end_headers()
  if self.command!='HEAD':self.wfile.write(data)
async def main():
 base=os.environ.get('INVITESSE_TEST_BASE');server=None
 if not base:
  server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT/'dist')));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for width in [320,390,768,1440]:
   for path,en in [('/duiss',False),('/en/not-a-page',True)]:
    context=await browser.new_context(viewport={'width':width,'height':900});pg=await context.new_page();errors=[];external=[]
    pg.on('pageerror',lambda e:errors.append(str(e)));pg.on('request',lambda r:external.append(r.url) if not r.url.startswith(base) else None)
    response=await pg.goto(base+path+'?name=private-example',wait_until='networkidle');assert response.status==404
    assert pg.url.startswith(base+path),pg.url
    assert await pg.locator('html').get_attribute('lang')==('en' if en else 'es')
    assert 'private-example' not in await pg.locator('body').inner_text()
    assert await pg.locator('h1').count()==1
    assert await pg.locator('.error-primary').get_attribute('href')==('/en/' if en else '/')
    assert await pg.locator('[data-designs]').get_attribute('href')==('/en/disenos/' if en else '/disenos/')
    assert await pg.evaluate('document.documentElement.scrollWidth<=innerWidth')
    await pg.keyboard.press('Tab');assert await pg.locator('.error-skip').evaluate('(el)=>document.activeElement===el')
    await pg.keyboard.press('Enter');assert await pg.evaluate('document.activeElement.id')=='main'
    await pg.add_script_tag(path=str(ROOT/'node_modules/axe-core/axe.min.js'))
    violations=await pg.evaluate("async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations");assert not violations,violations
    assert not external,external;assert not errors,errors
    if width in [390,1440] and not en:
     artifacts=Path(os.environ.get('INVITESSE_TEST_ARTIFACTS','/tmp/invitesse-browser-checks'));artifacts.mkdir(parents=True,exist_ok=True);await pg.evaluate('document.activeElement.blur()');await pg.screenshot(path=str(artifacts/f'404-{width}.png'),full_page=True)
    print(path,width,'HTTP404, language, recovery links, keyboard, accessibility and layout OK',flush=True)
    await context.close()
  context=await browser.new_context();pg=await context.new_page()
  for path in ['/demo/costa/missing','/editor/missing','/en/demo/costa/missing']:
   r=await pg.goto(base+path,wait_until='networkidle');assert r.status==404;assert await pg.locator('h1').count()==1
  for path in ['/','/en/','/disenos/','/en/disenos/']:
   r=await context.request.get(base+path);assert r.status==200,(path,r.status)
  nojs=await browser.new_context(java_script_enabled=False);p2=await nojs.new_page();r=await p2.goto(base+'/missing',wait_until='networkidle');assert r.status==404;assert await p2.locator('.error-primary').is_visible();await p2.locator('.error-primary').click();assert p2.url==base+'/'
  print('Nested missing routes, valid pages and recovery without JavaScript OK',flush=True)
  await browser.close()
 if server:server.shutdown()
if __name__=='__main__':asyncio.run(main())
