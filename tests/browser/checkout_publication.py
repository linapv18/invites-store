"""Checkout before editing and anonymous publication; all payment/auth writes are intercepted."""
import asyncio,json,mimetypes
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[2];BASE='http://127.0.0.1:4174'
DESIGNS=['clasico','moderno','rosa','jardin','costa','gala','aurelia','noir','lino','marfil','fiesta','celeste','cisne','tinta','glicina','estreno','nacar','arco','corazones','encaje','onix','senal']
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for width in [390,1440]:
   ctx=await browser.new_context(viewport={'width':width,'height':900},reduced_motion='reduce');calls=[];errors=[];paid=False
   async def backend(route):
    row={'id':'33333333-3333-4333-8333-333333333333','design_id':'nacar','revision':1,'content':{'design':'nacar','date':'2028-08-31','timeZone':'America/Bogota','invitationLanguage':'es','n1':'Ana','n2':'Leo','city':'Bogotá'}}
    rows=[row] if paid else [];rights=[{'invitation_id':row['id'],'expires_at':'2099-01-01T00:00:00Z','revoked_at':None}] if paid else []
    code="window.InvitesseBackend={client:{auth:{getSession:async()=>({data:{session:{access_token:'fixture'}}})},from:()=>({select:async()=>({data:RIGHTS})})},auth:{onChange:()=>{},getUser:async()=>({data:{user:{id:'fixture',email:'fixture@example.invalid',user_metadata:{invitesse_editor_guide_seen:true}}}}),googleAvailable:async()=>false},drafts:{list:async()=>ROWS}};".replace('ROWS',json.dumps(rows)).replace('RIGHTS',json.dumps(rights))
    await route.fulfill(content_type='application/javascript',body=code)

   async def checkout(route):
    nonlocal paid
    if route.request.method=='GET':
     await route.fulfill(content_type='application/json',body=json.dumps({'available':True,'currency':'COP','amount':200000}));return
    data=route.request.post_data_json;calls.append(data)
    if data['action']=='status' and not paid:
     await route.fulfill(status=409,content_type='application/json',body=json.dumps({'error':'INVITATION_NOT_FOUND'}));return
    q={'revision':1,'event_date':'2028-08-31','timezone':'America/Bogota','expires_at':'2028-12-01T05:00:00Z','enabled':paid,'status':'paid' if paid else 'unpaid','currency':'COP'}
    if data['action']=='create':q={'url':'https://checkout.stripe.com/c/pay/fixture','status':'pending'}
    await route.fulfill(content_type='application/json',body=json.dumps(q))
   await ctx.route('**/assets/backend/client.js',backend);await ctx.route('**/api/checkout/',checkout)
   await ctx.route('https://checkout.stripe.com/**',lambda r:r.fulfill(content_type='text/html',body='<h1>Stripe fixture</h1>'))
   page=await ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
   for base in ['', '/en']:
    await page.goto(BASE+base+'/comprar/?diseno=nacar',wait_until='networkidle');await page.locator('#ivEventDate').wait_for()
    assert 'no' not in (await page.locator('#ivPay').get_attribute('disabled') or '')
    assert await page.locator('#ivCurrency').count()==0;await page.locator('#ivEventDate').fill('2028-08-31');await page.locator('#ivAccept').check()
    await page.wait_for_function("document.querySelector('#ivValidity').textContent.includes('2028')")
    assert '30' in await page.locator('#ivValidity').inner_text()
    await page.locator('#ivPay').click();await page.wait_for_url('https://checkout.stripe.com/**')
    assert calls[-1]['quotedCurrency']=='COP' and calls[-1]['acceptedTerms'] is True
   await page.goto(BASE+'/editor/?diseno=nacar',wait_until='networkidle');await page.wait_for_url('**/comprar/?diseno=nacar');
   paid=True
   await page.goto(BASE+'/comprar/?diseno=nacar',wait_until='networkidle');await page.wait_for_function("document.querySelector('#ivPay').textContent.includes('Abrir editor')")
   await page.locator('#ivPay').click();await page.wait_for_url('**/editor/?diseno=nacar');await page.locator('[data-act=publish]').wait_for();assert await page.locator('#f-date').is_disabled()
   assert not errors,errors
   print('PASS checkout before editor, automatic COP pricing, calendar expiry, Stripe redirect and paid return',width)
   await ctx.close()
  # The invitation template is rendered in an opaque iframe, without owner session/storage.
  for lang in ['es','en']:
   ctx=await browser.new_context(viewport={'width':390,'height':850},reduced_motion='reduce');current='nacar';errors=[]
   async def fixture_backend(route):
    content={'n1':'Prueba','n2':'Privada','date':'2028-08-31','timeZone':'America/Bogota','invitationLanguage':lang,'city':'Bogotá','cover':'/assets/fotos/paseo.webp','gallery':['/assets/fotos/beso.webp'],'photosOn':True,'photoBW':True,'events':[],'faqs':[],'story':'Una historia real','rsvpMsg':'Respondan aquí','design':current}
    data={'id':'33333333-3333-4333-8333-333333333333','design':current,'content':content,'guests':[{'id':'g1','name':'Maria','attendance':None}],'household':{'name':'Familia de prueba'},'response':{'revision':0,'message':''}}
    await route.fulfill(content_type='application/javascript',body='window.InvitesseBackend={guests:{open:async()=>('+json.dumps(data)+'),submit:async()=>({revision:1})}};')
   async def assets(route):
    from urllib.parse import urlparse
    path=urlparse(route.request.url).path.lstrip('/');file=ROOT/'dist'/path
    if file.is_dir():file=file/'index.html'
    if not file.is_file():await route.abort();return
    await route.fulfill(path=str(file),content_type=mimetypes.guess_type(str(file))[0] or 'application/octet-stream',headers={'Access-Control-Allow-Origin':'*'})
   await ctx.route('**/assets/backend/client.js',fixture_backend);await ctx.route('https://www.invitesse.com/**',assets)
   page=await ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
   for design in DESIGNS:
    current=design;errors.clear();print('Checking published',lang,design,flush=True);await page.goto(BASE+'/invitacion/#token='+'a'*64,wait_until='networkidle')
    iframe=page.frame_locator('#invitationFrame');await iframe.locator('#ivRealReply').wait_for(timeout=10000)
    assert await iframe.locator('body').inner_text() and await iframe.locator('body').inner_text()!= 'None'
    # Inside the sandbox, the owner session cannot be read.
    denied=await iframe.locator('body').evaluate("()=>{try{localStorage.getItem('invitesse.auth.v1');return false}catch(e){return true}}")
    assert denied,(design,'iframe can read localStorage')
    await iframe.locator('#ivRealReply').evaluate('(el)=>el.click()');await page.locator('#ivReply').wait_for();await page.locator('input[value=attending]').check();await page.locator('#ivReply button').click()
    await page.wait_for_function("/guardada|saved/.test(document.querySelector('#replyNotice').textContent)")
    assert not errors,(lang,design,errors)
   print('PASS all 22 published templates, sandbox isolation and guest RSVP',lang)
   await ctx.close()
  await browser.close()
asyncio.run(main())
