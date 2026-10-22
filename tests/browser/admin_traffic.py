"""Admin analytics fixture, no real sessions or provider credentials."""
import asyncio,json,mimetypes
from pathlib import Path
from urllib.parse import urlsplit,parse_qs
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[2]/'dist'
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for width in [390,1440]:
   c=await b.new_context(viewport={'width':width,'height':1000});state={'status':'ready'}
   async def route(r):
    u=urlsplit(r.request.url)
    if u.path=='/assets/backend/client.js':return await r.fulfill(content_type='application/javascript',body="window.InvitesseBackend={client:{auth:{getSession:async()=>({data:{session:{access_token:'fixture'}}})}}};")
    if u.path.startswith('/api/admin'):
     action=parse_qs(u.query)['action'][0]
     if action=='me':data={'email':'fixture@example.invalid'}
     elif action=='analytics':data={'funnel':{'started':5,'paid':2}}
     else:
      row={'label':'/disenos/<script>','pageviews':15,'visitors':7}
      data={'status':state['status'],'days':int(parse_qs(u.query).get('days',['30'])[0]),'pageviews':15,'visitors':7,'updated_at':'2026-10-22T18:00:00Z','granularity':'day','series':[{'timestamp':'2026-10-22T00:00:00Z','pageviews':15,'visitors':7}],'pages':[row],'sources':[],'countries':[dict(row,label='CO')],'devices':[dict(row,label='mobile')]}
     return await r.fulfill(content_type='application/json',body=json.dumps(data))
    f=ROOT/u.path.lstrip('/');f=f/'index.html' if f.is_dir() else f
    if not f.is_file():return await r.fulfill(status=404,body='')
    await r.fulfill(content_type=mimetypes.guess_type(str(f))[0] or 'application/octet-stream',body=f.read_bytes())
   await c.route('**/*',route);pg=await c.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
   await pg.goto('https://www.invitesse.com/admin/#analiticas',wait_until='networkidle')
   await pg.get_by_text('Visitantes estimados',exact=True).wait_for()
   assert await pg.get_by_text('Colombia',exact=True).count()==1
   assert await pg.locator('svg[aria-label="Páginas vistas por día"]').count()==1
   assert await pg.evaluate('document.documentElement.scrollWidth<=innerWidth')
   await pg.locator('[data-days]').select_option('7');await pg.get_by_text('Visitantes estimados',exact=True).wait_for()
   assert 'últimos 7 días' in await pg.locator('main').inner_text()
   state['status']='not_configured';await pg.reload(wait_until='networkidle');await pg.get_by_text('La conexión con las estadísticas',exact=False).wait_for()
   assert await pg.get_by_text('De elegir un diseño a la invitación publicada',exact=True).count()==1
   assert not errors,errors
   await c.close();print('Admin traffic: desktop/mobile, periods, chart, escaped labels and missing configuration OK',width)
  await b.close()
asyncio.run(main())
