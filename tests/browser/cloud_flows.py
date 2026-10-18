import asyncio,json,os
from pathlib import Path
ARTIFACTS=Path(os.environ.get("INVITESSE_TEST_ARTIFACTS","/tmp/invitesse-browser-checks"));ARTIFACTS.mkdir(parents=True,exist_ok=True)
import json,time,base64,copy
from playwright.async_api import async_playwright
BASE=os.environ.get('INVITESSE_TEST_BASE','http://127.0.0.1:4174'); UID='11111111-1111-4111-8111-111111111111'; EMAIL='prueba@example.invalid'
def token():
 enc=lambda d:base64.urlsafe_b64encode(json.dumps(d).encode()).decode().rstrip('=')
 return enc({'alg':'HS256','typ':'JWT'})+'.'+enc({'sub':UID,'role':'authenticated','aud':'authenticated','exp':int(time.time())+3600})+'.signature'
USER={'id':UID,'email':EMAIL,'aud':'authenticated','role':'authenticated','email_confirmed_at':'2026-10-18T00:00:00Z','app_metadata':{'provider':'email'},'user_metadata':{},'created_at':'2026-10-18T00:00:00Z'}
class Backend:
 def __init__(self):self.rows=[];self.fail=False;self.calls=[]
 async def route(self,r):
  req=r.request;url=req.url;data=req.post_data_json if req.post_data else {};self.calls.append((req.method,url.split('.co')[-1]))
  status=200;body={}
  if '/auth/v1/settings' in url:body={'external':{'google':False}}
  elif '/auth/v1/token' in url:body={'access_token':token(),'refresh_token':'fake-refresh','expires_in':3600,'expires_at':int(time.time())+3600,'token_type':'bearer','user':USER}
  elif '/auth/v1/user' in url:body=USER
  elif '/auth/v1/signup' in url:body={'user':USER,'session':None}
  elif '/auth/v1/recover' in url or '/auth/v1/logout' in url:body={}
  elif '/rest/v1/invitation_drafts' in url:
   if req.method=='GET':body=self.rows
   else:
    row={**data,'id':'22222222-2222-4222-8222-222222222222','revision':0,'updated_at':'2026-10-18T00:00:00Z'};self.rows.append(row);body=row;status=201
  elif '/rest/v1/rpc/save_invitation_draft' in url:
   row=self.rows[0]
   if self.fail:status=503;body={'message':'Unavailable'}
   elif data['expected_revision']!=row['revision']:status=400;body={'code':'P0001','message':'DRAFT_CONFLICT_OR_NOT_FOUND'}
   else:row['content']=data['draft_content'];row['revision']+=1;body=row
  else:raise Exception('Unexpected Supabase request: '+req.method+' '+url)
  await r.fulfill(status=status,content_type='application/json',body=json.dumps(body))
async def login(pg):
 await pg.goto(BASE+'/cuenta/',wait_until='networkidle')
 await pg.locator('[name=email]').fill(EMAIL);await pg.locator('[name=pass]').fill('PasswordLocal123');await pg.locator('form [type=submit]').click()
 await pg.get_by_role('heading',name='Mis borradores',exact=True).wait_for()
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);api=Backend();c=await b.new_context(viewport={'width':1440,'height':1000});await c.route('https://*.supabase.co/**',api.route);pg=await c.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
  await pg.goto(BASE+'/cuenta/',wait_until='networkidle');await pg.locator('form [type=submit]').click();assert 'correo válido' in await pg.locator('.ac-error').inner_text()
  await pg.locator('[data-id=register]').click();await pg.locator('[name=email]').fill(EMAIL);await pg.locator('[name=pass]').fill('PasswordLocal123');await pg.locator('[name=pass2]').fill('PasswordLocal123');await pg.locator('form [type=submit]').click();await pg.get_by_role('status').filter(has_text='Revisen su correo').wait_for()
  await login(pg)
  await pg.goto(BASE+'/comprar/?diseno=encaje',wait_until='networkidle');await pg.locator('[data-act=testbuy]').click();await pg.wait_for_url('**/editor/?diseno=encaje');await pg.locator('[data-k=n1]').fill('Prueba guardada');await pg.locator('[data-k=n1]').press('Tab');await pg.wait_for_function("document.querySelector('[data-save]').textContent.includes('Cambios guardados')")
  assert api.rows[0]['content']['n1']=='Prueba guardada',api.rows
  print('signup confirmation, login, draft creation and save OK',flush=True)
  # New browser context: no local session/cache; remote state must hydrate editor.
  c2=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True);await c2.route('https://*.supabase.co/**',api.route);p2=await c2.new_page();p2.on('pageerror',lambda e:errors.append(str(e)));await login(p2)
  await p2.goto(BASE+'/editor/?diseno=encaje&guia=0',wait_until='networkidle');await p2.locator('[data-k=n1]').wait_for();assert await p2.locator('[data-k=n1]').input_value()=='Prueba guardada'
  api.fail=True;await p2.locator('[data-k=n1]').fill('Cambio con error');await p2.locator('[data-k=n1]').press('Tab');await p2.locator('[data-act=save-retry]').wait_for();assert api.rows[0]['content']['n1']=='Prueba guardada'
  api.fail=False;await p2.locator('[data-act=save-retry]').click();await p2.wait_for_function("document.querySelector('[data-save]').textContent.includes('Cambios guardados')");assert api.rows[0]['content']['n1']=='Cambio con error'
  print('new device hydration, failure state and retry OK',flush=True)
  api.rows[0]['revision']+=1;await p2.locator('[data-k=n1]').fill('Conflicto');await p2.locator('[data-k=n1]').press('Tab');await p2.locator('[data-act=save-retry]').wait_for();assert api.rows[0]['content']['n1']=='Cambio con error'
  # Clear beforeunload prompt explicitly by accepting navigation for this check.
  p2.on('dialog',lambda d:d.accept());await p2.goto(BASE+'/cuenta/',wait_until='networkidle');await p2.locator('[data-act=logout]').click();await p2.locator('[name=email]').wait_for();assert await p2.evaluate('window.LazoAuth.current()') is None
  assert not errors,errors
  print('revision conflicts and logout OK; no real users/emails/remote writes',flush=True)
  await b.close()
if __name__=='__main__': asyncio.run(main())
