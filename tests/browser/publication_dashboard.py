"""Publication/dashboard regression checks; all authentication and API writes are mocked."""
import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
CONFIG=json.loads(Path('lib/payments/prices.json').read_text())
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  results={}
  for prefix in ['', '/en']:
   for design,width in [('nacar',1440),('nacar',390),('nacar',320)]:
    page=await b.new_page(viewport={'width':width,'height':1000},reduced_motion='reduce');errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    row={'id':'33333333-3333-4333-8333-333333333333','design_id':design,'revision':1,'content':{'design':design,'invitationLanguage':'en' if prefix else 'es','date':'2028-08-31','timeZone':'America/Bogota','n1':'Ana','n2':'Leo'}}
    rights=[{'invitation_id':row['id'],'source':'purchase','expires_at':'2099-01-01T00:00:00Z','revoked_at':None}]
    sdk="window.InvitesseBackend={client:{auth:{getSession:async()=>({data:{session:{access_token:'fixture'}}})},from:()=>({select:async()=>({data:"+json.dumps(rights)+"})})},auth:{onChange:()=>{},getUser:async()=>({data:{user:{id:'fixture',email:'fixture@example.invalid',user_metadata:{invitesse_editor_guide_seen:true}}}}),googleAvailable:async()=>false},drafts:{list:async()=>["+json.dumps(row)+"],save:async()=>("+json.dumps(row)+")}};"
    await page.route('**/assets/backend/client.js',lambda r:r.fulfill(content_type='application/javascript',body=sdk))
    calls=[];published=False;published_revision=None;fail_once=True
    async def publication(r):
     nonlocal published,published_revision,fail_once
     data=r.request.post_data_json;calls.append(data);action=data['action']
     if action=='publish' and fail_once:
      fail_once=False
      await r.fulfill(status=409,content_type='application/json',body='{"error":"PUBLICATION_INCOMPLETE"}');return
     if action=='publish':published=True;published_revision=data['revision']
     if action=='pause':published=False
     if action=='rotate':body={'url':'https://www.invitesse.com/invitacion/#token=fixture'}
     else:body={'invitation':{'state':'published' if published else 'draft','access_mode':'public' if published else 'family'},'revision':published_revision or 1,'publishedRevision':published_revision,'publicUrl':None,'households':[{'id':'family-fixture','label':'Familia Privada','guests':[{'display_name':'Invitado Privado'}]}]}
     await r.fulfill(content_type='application/json',body=json.dumps(body))
    await page.route('**/api/publication/',publication)
    await page.goto(os.environ.get('INVITESSE_TEST_BASE','http://127.0.0.1:4174').rstrip('/')+prefix+'/editor/?diseno='+design+'#portada',wait_until='networkidle')
    await page.wait_for_function("document.querySelector('#edH1') && !document.querySelector('.ed-sec [role=status]')")
    await page.locator('[data-act="publish"]').first.click()
    dialog=page.locator('dialog.iv-publish')
    await dialog.locator('#ivPublishNow:not([disabled])').wait_for()
    assert 'Familia Privada' not in await dialog.inner_text()
    await dialog.locator('#ivPublishNow').click()
    await page.wait_for_function("document.querySelector('#ivPublishNotice').dataset.state==='error'")
    assert page.url.endswith('#portada')
    assert await dialog.count()==1
    await dialog.locator('#ivPublishNow').click()
    await dialog.wait_for(state='detached')
    await page.locator('.iv-guest-panel [data-link]').wait_for()
    assert page.url.endswith('#invitados')
    assert 'Familia Privada' in await page.locator('.iv-guest-panel').inner_text()
    assert await page.locator('[data-act="publish"]').first.inner_text()==('Published' if prefix else 'Publicado')
    await page.locator('[data-act="publish"]').first.click()
    await page.wait_for_function("document.querySelector('#ivPublishNow') && ['Publicado','Published'].includes(document.querySelector('#ivPublishNow').textContent)")
    assert 'Familia Privada' not in await dialog.inner_text()
    assert await dialog.locator('#ivPublishNow').inner_text()==('Published' if prefix else 'Publicado')
    assert await dialog.locator('#ivPublishNow').is_disabled()
    await dialog.locator('#ivClose').click()
    await dialog.wait_for(state='detached')
    page.on('dialog',lambda d:d.accept())
    await page.locator('.iv-guest-panel [data-link]').click()
    await page.locator('.iv-guest-panel [data-result] input').wait_for()
    assert await page.locator('.iv-guest-panel [data-result] input').input_value()=='https://www.invitesse.com/invitacion/#token=fixture'
    assert not errors,errors
    print('PASS publication failure stays; success redirects; published labels; family data and links only in panel',width,prefix or 'es',flush=True)
    await page.close()
  await b.close()
asyncio.run(main())
