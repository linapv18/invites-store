"""Published guest form uses each original demo; no production data or real RSVP writes."""
import asyncio,json,mimetypes,os
from pathlib import Path
from urllib.parse import urlsplit
from playwright.async_api import async_playwright,expect
ROOT=Path(__file__).resolve().parents[2];DIST=ROOT/'dist'
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for design in sorted(x.parent.name for x in (ROOT/'demo').glob('*/index.html')):
   if os.environ.get('DESIGN') and design!=os.environ['DESIGN']:continue
   for lang in (['es','en'] if design in ['nacar','jardin','costa'] else ['es']):
    page=await browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce');errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    fixture={'design':design,'content':{'n1':'Ana','n2':'Leo','date':'2028-05-15','invitationLanguage':lang,'rsvpDiet':True,'rsvpNote':True},'household':{'name':'Familia fixture'},'guests':[{'id':'guest-fixture','name':'Persona fixture','attendance':None,'dietary_notes':'Sin gluten'}],'response':{'revision':0,'message':''}}
    if design=='encaje':fixture['guests'][0]['name']+=' ApellidoExtensoSinEspaciosParaVerificarAjusteEnPantallasPequeñas'
    initial_fixture=json.loads(json.dumps(fixture))
    sdk='window.InvitesseGuestBackend={guests:{open:async()=>('+json.dumps(fixture)+'),submit:async function(...args){window.lastReply=args;window.calls=(window.calls||0)+1;if(window.failReply)throw Error("fixture");return {revision:1};}}};'
    async def route(r):
     path=urlsplit(r.request.url).path
     if 'guest-client.' in path or path=='/assets/brand/guest-client.js':
      fresh=sdk.replace(json.dumps(initial_fixture),json.dumps(fixture))
      return await r.fulfill(content_type='application/javascript',body=fresh)
     file=DIST/path.lstrip('/')
     if file.is_dir():file=file/'index.html'
     if file.is_file():return await r.fulfill(content_type=mimetypes.guess_type(str(file))[0] or 'application/octet-stream',body=file.read_bytes())
     await r.abort()
    await page.route('**/*',route)
    await page.goto('https://www.invitesse.com/invitacion/#token='+'a'*64)
    await expect(page.locator('#invitationFrame')).to_be_visible()
    frame=page.frame_locator('#invitationFrame');await frame.locator('html[data-reply-bound=true]').wait_for(state='attached')
    result=await frame.locator('body').evaluate('''()=>{const box=document.querySelector('#people')||document.querySelector('#switches');return {names:box?.textContent,oldButton:!!document.querySelector('#ivRealReply'),hero:document.querySelectorAll('[data-lz-anchor~="portada"] a[href="#rsvp"],.hero a[href="#rsvp"]').length};}''')
    assert 'Persona fixture' in result['names'],(design,result)
    assert 'Carlos Rodríguez' not in result['names']
    assert await frame.locator('body').evaluate("!document.body.innerText.includes('esta respuesta no se guarda')&&!document.body.innerText.includes('this reply is not saved')")
    assert await frame.locator('body').evaluate("!document.body.innerText.includes('Familia Rodríguez')")
    assert not result['oldButton'] and result['hero']==0,(design,result)
    if design in ['nacar','encaje'] and lang=='es':
     await frame.locator('#enter').evaluate('e=>e.click()')
     await page.wait_for_timeout(1100)
     await frame.locator('#rsvp').evaluate("e=>e.scrollIntoView({behavior:'instant',block:'start'})")
     await page.wait_for_timeout(250)
     if design=='encaje':
      assert await frame.locator('.person-name').first.evaluate('e=>{const a=e.getBoundingClientRect(),b=e.closest(".person").getBoundingClientRect();return a.top>b.top&&a.bottom<b.bottom&&a.left>=b.left&&a.right<=b.right;}')
     await page.screenshot(path='/tmp/guest-rsvp-'+design+'.png')
    await page.evaluate('window.failReply=true')
    await frame.locator('body').evaluate('''()=>{const box=document.querySelector('#people')||document.querySelector('#switches');Array.from(box.children).forEach(row=>row.querySelector('input[type=radio],button[aria-pressed]')?.click());const save=document.querySelector('#rsSave,#sheetSend,[data-lz-anchor~="rsvp"] button[type=submit]');save.click();}''')
    await page.wait_for_function('window.calls===1')
    await expect(frame.get_by_text('No se pudo guardar su respuesta. Intenten de nuevo.' if lang=='es' else 'Your reply could not be saved. Please try again.',exact=True)).to_have_count(1)
    first=await page.evaluate('lastReply[4]');await page.evaluate('window.failReply=false')
    await frame.locator('body').evaluate("document.querySelector('#rsSave,#sheetSend,[data-lz-anchor~=rsvp] button[type=submit]').click()")
    await page.wait_for_function('window.calls===2')
    assert await page.evaluate('lastReply[4]')==first
    assert await page.evaluate('lastReply[1][0].id')=='guest-fixture'
    assert await page.evaluate('lastReply[1][0].attendance')=='attending'
    assert await page.evaluate('lastReply[1][0].dietary_notes')=='Sin gluten'
    assert page.url.endswith('a'*64)
    # Clicking an in-document section must preserve the sandbox document.
    original_frame_url=page.frames[1].url
    await frame.locator('body').evaluate("document.querySelector('a[href=\"#rsvp\"]')?.click()")
    assert page.url.endswith('a'*64)
    await page.wait_for_timeout(60)
    assert page.frames[1].url==original_frame_url,(design,[f.url for f in page.frames])
    await expect(frame.locator('html[data-reply-bound=true]')).to_have_count(1)
    fixture['response']['revision']=1;fixture['guests'][0]['attendance']='attending'
    await page.reload();await frame.locator('html[data-reply-bound=true]').wait_for(state='attached')
    state=await frame.locator('body').evaluate("()=>({form:(document.querySelector('#rsvpForm,#sheetForm')||document.getElementById('rsForm')).hidden,done:(document.querySelector('#rsDone,#thanks,#sheetThanks')).hidden})")
    assert state=={'form':True,'done':False},(design,state)
    assert await page.evaluate('window.calls||0')==0,'Reload must not submit again'
    await frame.locator('body').evaluate("document.querySelector('#rsEdit,#editRsvp,#thanksEdit').click()")
    assert await frame.locator('body').evaluate("!(document.querySelector('#rsvpForm,#sheetForm')||document.getElementById('rsForm')).hidden")
    if design=='encaje':
     fixture['guests'].append({'id':'fixture-new','name':'Persona nueva','attendance':None,'dietary_notes':''})
     await page.reload();await frame.locator('html[data-reply-bound=true]').wait_for(state='attached')
     assert await frame.locator('#rsForm').evaluate('e=>!e.hidden')
     assert await frame.locator('#rsDone').evaluate('e=>e.hidden')
     assert await page.evaluate('window.calls||0')==0
    assert not errors,(design,errors)
    print('PASS original guest form, real guest, failed save/retry/idempotency, local anchors',design,lang,flush=True)
    await page.close()
  await browser.close()
asyncio.run(main())
