"""Automatic local pricing in both UI languages. All auth and Stripe calls intercepted."""
import asyncio,json
from playwright.async_api import async_playwright
BASE='http://127.0.0.1:4174'
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for width in [390,1440]:
   for prefix in ['', '/en']:
    for currency,amount in [('COP',200000),('USD',79)]:
     ctx=await browser.new_context(viewport={'width':width,'height':900});calls=[];errors=[]
     async def sdk(route):
      await route.fulfill(content_type='application/javascript',body="window.InvitesseBackend={client:{auth:{getSession:async()=>({data:{session:{access_token:'fixture'}}})},from:()=>({select:async()=>({data:[]})})},auth:{onChange:()=>{},getUser:async()=>({data:{user:{id:'fixture',email:'fixture@example.invalid'}}}),googleAvailable:async()=>false},drafts:{list:async()=>[]}};")
     async def api(route):
      if route.request.method=='GET':data={'available':True,'currency':currency,'amount':amount}
      else:
       body=route.request.post_data_json;calls.append(body)
       if body['action']=='status':
        await route.fulfill(status=409,content_type='application/json',body=json.dumps({'error':'INVITATION_NOT_FOUND'}));return
       data={'revision':1,'event_date':'2028-08-31','timezone':'America/Bogota','expires_at':'2028-12-01T05:00:00Z','enabled':False,'currency':currency,'amount':amount}
       if body['action']=='create':data={'url':'https://checkout.stripe.com/c/pay/fixture','status':'pending'}
      await route.fulfill(content_type='application/json',body=json.dumps(data))
     await ctx.route('**/assets/backend/client.js',sdk);await ctx.route('**/api/checkout/',api);await ctx.route('https://checkout.stripe.com/**',lambda r:r.fulfill(content_type='text/html',body='<h1>Stripe fixture</h1>'))
     page=await ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
     await page.goto(BASE+prefix+'/comprar/?diseno=nacar',wait_until='networkidle')
     await page.wait_for_function("!document.querySelector('#ivPay').disabled")
     assert await page.locator('#ivCurrency').count()==0
     assert currency in await page.locator('#ivPrice').inner_text()
     assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
     await page.locator('#ivEventDate').fill('2028-08-31');await page.locator('#ivEventZone').select_option('America/Bogota');await page.locator('#ivAccept').check()
     await page.locator('#ivPay').click();await page.wait_for_function("document.querySelector('#ivValidity').textContent.includes('2028')")
     await page.locator('#ivPay').click();await page.wait_for_url('https://checkout.stripe.com/**')
     assert calls[-1]['quotedCurrency']==currency and 'currency' not in calls[-1]
     assert not errors,errors
     print('PASS automatic price, no selector, independent of language/timezone',width,prefix or 'es',currency,flush=True)
     await ctx.close()
  await browser.close()
asyncio.run(main())
