"""Exact demo panel with live data: all API/auth writes use fixtures, never production."""
import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright,expect
BASE=os.environ.get('INVITESSE_TEST_BASE','http://127.0.0.1:4174').rstrip('/')
H1='11111111-1111-4111-8111-111111111111';H2='22222222-2222-4222-8222-222222222222';H3='44444444-4444-4444-8444-444444444444'
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for prefix in ['', '/en']:
   for width in [1440,390,320]:
    page=await browser.new_page(viewport={'width':width,'height':950},accept_downloads=True,reduced_motion='reduce');errors=[];calls=[];published=False;fail_once=True;revision=1
    page.on('pageerror',lambda error:errors.append(str(error)))
    row={'id':'33333333-3333-4333-8333-333333333333','design_id':'nacar','revision':1,'content':{'design':'nacar','invitationLanguage':'en' if prefix else 'es','n1':'Ana','n2':'Leo','date':'2028-08-31','timeZone':'America/Bogota'}}
    rights=[{'invitation_id':row['id'],'source':'purchase','expires_at':'2099-01-01T00:00:00Z','revoked_at':None}]
    sdk="window.InvitesseBackend={client:{auth:{getSession:async()=>({data:{session:{access_token:'fixture'}}})},from:()=>({select:async()=>({data:"+json.dumps(rights)+"})})},auth:{onChange:()=>{},getUser:async()=>({data:{user:{id:'fixture',email:'fixture@example.invalid',user_metadata:{invitesse_editor_guide_seen:true}}}}),googleAvailable:async()=>false},drafts:{list:async()=>["+json.dumps(row)+"],save:async()=>("+json.dumps(row)+")}};"
    await page.route('**/assets/backend/client.js',lambda r:r.fulfill(content_type='application/javascript',body=sdk))
    households=[{'id':H1,'label':'Familia Privada','household_responses':[{'revision':0,'message':'Un mensaje real'}],'guests':[{'id':'g1','display_name':'=Nombre Privado','sort_order':0,'guest_responses':[{'attendance':'attending'}]},{'id':'g2','display_name':'Persona Dos','sort_order':1,'guest_responses':[{'attendance':'declined'}]}]},{'id':H2,'label':'Sin Responder','household_responses':[{'revision':0}],'guests':[{'id':'g3','display_name':'Persona Tres','sort_order':0,'guest_responses':[]}]}]
    async def api(r):
     nonlocal published,fail_once,revision
     body=r.request.post_data_json;calls.append(body)
     if body['action']=='publish' and fail_once:
      fail_once=False;await r.fulfill(status=409,content_type='application/json',body='{"error":"PUBLICATION_INCOMPLETE"}');return
     if body['action']=='publish':published=True
     if body['action']=='panel-save':
      operation=body['operation'];payload=body['payload'];revision+=1
      if operation=='create':households.append({'id':H3,'label':payload['name'],'household_responses':[{'revision':0}],'guests':[{'id':'new'+str(i),'display_name':g['name'],'sort_order':i,'guest_responses':[]} for i,g in enumerate(payload['people'])]})
      else:
       family=next(h for h in households if h['id']==body['householdId'])
       if operation=='sent':family['sent_at']='2026-10-20T12:00:00Z'
       if operation=='edit':family['label']=payload['name'];family['household_responses'][0]['revision']+=1
       if operation=='delete':households.remove(family)
     data={'invitation':{'state':'published' if published else 'draft','access_mode':'family'},'revision':revision,'publishedRevision':1 if published else None,'publicUrl':None,'households':households,'links':{h['id']:'https://www.invitesse.com/invitacion/#token=fixture-'+h['id'] for h in households}}
     await r.fulfill(content_type='application/json',body=json.dumps(data))
    await page.route('**/api/publication/',api)
    await page.goto(BASE+prefix+'/editor/?diseno=nacar#portada',wait_until='networkidle')
    await page.locator('[data-act="publish"]').first.click();dialog=page.locator('dialog.iv-publish')
    await dialog.locator('#ivPublishNow:not([disabled])').wait_for();assert 'Familia Privada' not in await dialog.inner_text()
    await dialog.locator('#ivPublishNow').click();await page.wait_for_function("document.querySelector('#ivPublishNotice').dataset.state==='error'");assert '/editor/' in page.url
    await dialog.locator('#ivPublishNow').click();await page.wait_for_url('**/panel/?diseno=nacar#resumen')
    await page.locator('.lz-panel:not([hidden]) .lz-big b').wait_for()
    assert await page.locator('.lz-big b').inner_text()=='1';assert '3' in await page.locator('.lz-big').inner_text()
    assert await page.locator('.lz-tabs [role=tab]').count()==3
    assert 'Un mensaje real' in await page.locator('.lz-inner').inner_text()
    assert await page.locator('.lz-note').count()==0
    # Verify identical component/theme against the actual demo, not a lookalike.
    demo=await browser.new_page(viewport={'width':width,'height':950},reduced_motion='reduce')
    await demo.goto(BASE+prefix+'/demo/nacar/',wait_until='networkidle');await demo.evaluate('window.LazoPanel.open()')
    theme="el=>({background:getComputedStyle(el).backgroundColor,font:getComputedStyle(el).fontFamily})"
    assert await page.locator('.lz-panel').evaluate(theme)==await demo.locator('.lz-panel').evaluate(theme)
    await demo.close()
    await page.locator('[data-tab="invitados"]').first.click();await expect(page.locator('.lz-item')).to_have_count(2)
    await page.locator('#lzSearch').fill('Persona Tres');await expect(page.locator('.lz-item')).to_have_count(1)
    await page.locator('#lzSearch').fill('')
    async with page.expect_download() as info:await page.locator('[data-act="csv"]').click()
    export=Path(await (await info.value).path()).read_text(encoding='utf-8-sig');assert "'=Nombre Privado" in export
    await page.locator('[data-open="0"]').click()
    await page.locator('[data-f="title"]').fill('Familia Editada')
    await page.locator('[data-act="done"]').click()
    await expect(page.locator('.lz-item strong').first).to_have_text('Familia Editada')
    # Existing invitation links are immediately available, and stable across a page reload.
    await page.locator('.lz-tabs [data-tab="envio"]').click()
    first=await page.locator('.lz-send a[href^="https://wa.me/"]').first.get_attribute('href');assert 'fixture-' in first
    assert await page.get_by_role('button',name='Crear enlace privado',exact=True).count()==0
    await page.reload(wait_until='networkidle');await page.locator('.lz-send').first.wait_for()
    assert await page.locator('.lz-send a[href^="https://wa.me/"]').first.get_attribute('href')==first
    # The demo's New invitation action saves real data and already has a link on return.
    await page.locator('#lzNewTitle').fill('Familia Nueva');await page.locator('[data-new="0"]').fill('Invitado Nuevo')
    await page.locator('[data-act="create"]').click();await expect(page.locator('.lz-send')).to_have_count(3)
    assert 'fixture-'+H3 in await page.locator('.lz-send').last.locator('a[href^="https://wa.me/"]').get_attribute('href')
    await page.locator('[data-sent="0"]').click();await expect(page.locator('[data-sent="0"]')).to_have_attribute('aria-pressed','true')
    assert not any(c['action']=='rotate' for c in calls)
    await page.screenshot(path='/tmp/demo-live-panel-'+str(width)+('-en' if prefix else '-es')+'.png',full_page=True)
    assert not errors,errors
    print('PASS exact demo component/theme, live counts, stable automatic links, create invitation, sent state and CSV',width,prefix or 'es',flush=True)
    await page.close()
  await browser.close()
asyncio.run(main())
