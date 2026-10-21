"""Private couple dashboard and publication flow. Every auth/API request is mocked."""
import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright,expect
BASE=os.environ.get('INVITESSE_TEST_BASE','http://127.0.0.1:4174').rstrip('/')
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for prefix in ['', '/en']:
   for width in [1440,390,320]:
    page=await browser.new_page(viewport={'width':width,'height':950},accept_downloads=True,reduced_motion='reduce');errors=[];calls=[];published=False;fail_once=True
    page.on('pageerror',lambda error:errors.append(str(error)))
    row={'id':'33333333-3333-4333-8333-333333333333','design_id':'nacar','revision':1,'content':{'design':'nacar','invitationLanguage':'en' if prefix else 'es','n1':'Ana','n2':'Leo','date':'2028-08-31','timeZone':'America/Bogota'}}
    rights=[{'invitation_id':row['id'],'source':'purchase','expires_at':'2099-01-01T00:00:00Z','revoked_at':None}]
    sdk="window.InvitesseBackend={client:{auth:{getSession:async()=>({data:{session:{access_token:'fixture'}}})},from:()=>({select:async()=>({data:"+json.dumps(rights)+"})})},auth:{onChange:()=>{},getUser:async()=>({data:{user:{id:'fixture',email:'fixture@example.invalid',user_metadata:{invitesse_editor_guide_seen:true}}}}),googleAvailable:async()=>false},drafts:{list:async()=>["+json.dumps(row)+"],save:async()=>("+json.dumps(row)+")}};"
    await page.route('**/assets/backend/client.js',lambda r:r.fulfill(content_type='application/javascript',body=sdk))
    async def api(r):
     nonlocal published,fail_once
     body=r.request.post_data_json;calls.append(body)
     if body['action']=='publish' and fail_once:
      fail_once=False;await r.fulfill(status=409,content_type='application/json',body='{"error":"PUBLICATION_INCOMPLETE"}');return
     if body['action']=='publish':published=True
     data={'invitation':{'state':'published' if published else 'draft','access_mode':'family'},'revision':1,'publishedRevision':1 if published else None,'publicUrl':None,'households':[{'id':'11111111-1111-4111-8111-111111111111','label':'Familia Privada','household_responses':[{'message':'Un mensaje real'}],'guests':[{'display_name':'=Nombre Privado','guest_responses':[{'attendance':'attending'}]},{'display_name':'Persona Dos','guest_responses':[{'attendance':'declined'}]}]},{'id':'22222222-2222-4222-8222-222222222222','label':'Sin Responder','guests':[{'display_name':'Persona Tres','guest_responses':[]}]}]}
     if body['action']=='rotate':data={'url':'https://www.invitesse.com/invitacion/#token=fixture-token'}
     await r.fulfill(content_type='application/json',body=json.dumps(data))
    await page.route('**/api/publication/',api)
    await page.goto(BASE+prefix+'/editor/?diseno=nacar#portada',wait_until='networkidle')
    await page.locator('[data-act="publish"]').first.click()
    dialog=page.locator('dialog.iv-publish');await dialog.locator('#ivPublishNow:not([disabled])').wait_for()
    assert 'Familia Privada' not in await dialog.inner_text()
    await dialog.locator('#ivPublishNow').click()
    await page.wait_for_function("document.querySelector('#ivPublishNotice').dataset.state==='error'")
    assert '/editor/' in page.url
    await dialog.locator('#ivPublishNow').click()
    await page.wait_for_url('**/panel/?diseno=nacar#resumen');await page.locator('.np-big b').wait_for()
    assert await page.locator('.np-big b').inner_text()=='1'
    assert '3' in await page.locator('.np-big').inner_text()
    assert 'Un mensaje real' in await page.locator('main').inner_text()
    assert await page.locator('.np-tabs a').count()==3
    assert not any(c['action']=='rotate' for c in calls)
    await page.get_by_role('link',name='Guests' if prefix else 'Invitados',exact=True).click()
    await expect(page.locator('.np-family')).to_have_count(2)
    await page.locator('[data-search]').fill('Persona Tres');await expect(page.locator('.np-family')).to_have_count(1)
    await page.locator('[data-search]').fill('')
    await page.locator('[data-filter="attending"]').click();await expect(page.locator('.np-family')).to_have_count(1)
    await page.locator('[data-filter="all"]').click()
    async with page.expect_download() as download_info:await page.locator('[data-export]').click()
    download=await download_info.value;export=Path(await download.path()).read_text(encoding='utf-8-sig');assert "'=Nombre Privado" in export
    await page.get_by_role('link',name='Sending' if prefix else 'Envío',exact=True).click()
    page.on('dialog',lambda dialog:dialog.accept())
    await page.locator('[data-generate]').first.click()
    assert await page.locator('.np-result input').input_value()=='https://www.invitesse.com/invitacion/#token=fixture-token'
    assert 'fixture-token' in await page.locator('a[href^="https://wa.me/"]').get_attribute('href')
    assert len([c for c in calls if c['action']=='rotate'])==1
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    await page.screenshot(path='/tmp/couple-dashboard-'+str(width)+('-en' if prefix else '-es')+'.png',full_page=True)
    await page.get_by_role('link',name='Edit invitation' if prefix else 'Editar invitación',exact=True).click()
    await page.wait_for_function("document.querySelector('[data-act=publish]')?.textContent==="+json.dumps('Published' if prefix else 'Publicado'))
    count=len([c for c in calls if c['action']=='publish']);await page.locator('[data-act="publish"]').first.click()
    await page.wait_for_url('**/panel/?diseno=nacar#resumen')
    assert len([c for c in calls if c['action']=='publish'])==count
    await page.goto(BASE+('/en/account/' if prefix else '/cuenta/'),wait_until='networkidle')
    await page.locator('.ac-guests a').click();await page.wait_for_url('**/panel/?diseno=nacar#resumen')
    await page.locator('.np-tabs a').first.wait_for()
    assert not errors,errors
    print('PASS real dashboard tabs, counts, search, CSV, private sharing, publish redirect, Published button and profile access',width,prefix or 'es',flush=True)
    await page.close()
  # An unpurchased design must never reach the publication API.
  page=await browser.new_page()
  await page.route('**/assets/backend/client.js',lambda r:r.fulfill(content_type='application/javascript',body=sdk))
  leaks=[]
  await page.route('**/api/publication/',lambda r:(leaks.append(r.request.url),r.fulfill(content_type='application/json',body='{}'))[1])
  await page.goto(BASE+'/panel/?diseno=encaje',wait_until='networkidle');await page.wait_for_url('**/cuenta/')
  assert not leaks
  print('PASS dashboard purchase guard',flush=True)
  # Signed-out visitors return to sign-in without requesting any wedding data.
  page=await browser.new_page()
  anonymous="window.InvitesseBackend={auth:{onChange:()=>{},getUser:async()=>({data:{user:null}}),googleAvailable:async()=>false}};"
  await page.route('**/assets/backend/client.js',lambda r:r.fulfill(content_type='application/javascript',body=anonymous))
  denied=[]
  await page.route('**/api/publication/',lambda r:(denied.append(r.request.url),r.fulfill(content_type='application/json',body='{}'))[1])
  await page.goto(BASE+'/panel/?diseno=nacar',wait_until='networkidle');await page.wait_for_url('**/cuenta/?next=*')
  assert not denied
  print('PASS signed-out dashboard privacy',flush=True)
  await browser.close()
asyncio.run(main())
