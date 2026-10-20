"""Storefront session navigation with mocked Supabase; no real accounts or writes."""
import asyncio,os
from pathlib import Path
from playwright.async_api import async_playwright
import cloud_flows as flows
BASE=os.environ.get('INVITESSE_TEST_BASE','http://127.0.0.1:4174')
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for width in [320,1440]:
   api=flows.Backend();c=await b.new_context(viewport={'width':width,'height':900});await c.route('https://*.supabase.co/**',api.route)
   await c.add_init_script("localStorage.setItem('invitesse.privacy.v1',JSON.stringify({version:1,analytics:false,at:Date.now()}))")
   pg=await c.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
   for path,en in [('/',False),('/en/',True),('/disenos/',False),('/en/disenos/',True)]:
    await pg.goto(BASE+path,wait_until='networkidle');link=pg.locator('.nav-account')
    assert await link.inner_text()==('Sign in' if en else 'Iniciar sesión')
    assert await pg.evaluate('typeof InvitesseBackend')=='undefined'
    assert await link.get_attribute('href')==('/en/account/' if en else '/cuenta/')
   assert not api.calls,api.calls
   flows.USER['user_metadata']={'full_name':'Lina Perez Vergara'}
   await flows.login(pg)
   for path,en in [('/',False),('/en/',True),('/disenos/',False),('/en/disenos/',True)]:
    before=len(api.calls);await pg.goto(BASE+path,wait_until='networkidle');link=pg.locator('.nav-account')
    await pg.wait_for_function("document.querySelector('.nav-account').dataset.authState==='signed-in'")
    assert await link.inner_text()==('Hi, Lina' if en else 'Hola, Lina')
    assert await link.get_attribute('data-clarity-mask')=='true'
    assert not any('/rest/' in url for method,url in api.calls[before:]),api.calls[before:]
    assert await pg.evaluate('document.documentElement.scrollWidth<=innerWidth')
    rect=await link.bounding_box();assert rect['x']>=0 and rect['x']+rect['width']<=width and rect['height']>=44
   await pg.locator('.nav-account').click();await pg.get_by_role('heading',name='My invitations',exact=True).wait_for()
   # Metadata absent: do not infer a name from the email address.
   flows.USER['user_metadata']={};await pg.goto(BASE+'/',wait_until='networkidle');await pg.wait_for_function("document.querySelector('.nav-account').dataset.authState==='signed-in'");assert await pg.locator('.nav-account').inner_text()=='Mi cuenta'
   # Long and HTML-looking metadata stays plain text and cannot break the header.
   flows.USER['user_metadata']={'given_name':'<img-onerror=alert(1)>ExtremelyLongFirstName'}
   await pg.reload(wait_until='networkidle');await pg.wait_for_function("document.querySelector('.nav-account').dataset.authState==='signed-in'");assert await pg.locator('.nav-account img').count()==0
   assert await pg.evaluate('document.documentElement.scrollWidth<=innerWidth')
   flows.USER['user_metadata']={'given_name':'Lina'}
   # An anonymous open tab recognizes login/logout from another tab.
   await pg.evaluate('window.InvitesseBackend.auth.signOut()');await pg.wait_for_function("document.querySelector('.nav-account').dataset.authState==='signed-out'")
   p2=await c.new_page();await flows.login(p2)
   await pg.wait_for_function("document.querySelector('.nav-account').textContent==='Hola, Lina'")
   await p2.locator('[data-act=logout]').click();await pg.wait_for_function("document.querySelector('.nav-account').dataset.authState==='signed-out'")
   assert await pg.locator('.nav-account').inner_text()=='Iniciar sesión'
   assert not errors,errors
   print(width,'ES/EN home/catalogue, anonymous lazy load, named/generic account, account link, masking, long names and cross-tab logout OK',flush=True)
   await c.close()
  await b.close()
if __name__=='__main__':asyncio.run(main())
