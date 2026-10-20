"""Catalogue cards and filters use each design's range in the detected market."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
CONFIG=json.loads(Path('lib/payments/prices.json').read_text())
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for currency in ['COP','USD']:
   prices={design:{'tier':tier,'currency':currency,'amount':CONFIG['tiers'][tier][currency]} for design,tier in CONFIG['designs'].items()}
   for width in [390,1440]:
    for prefix in ['', '/en']:
     ctx=await browser.new_context(viewport={'width':width,'height':900})
     await ctx.route('**/api/checkout/',lambda r:r.fulfill(content_type='application/json',body=json.dumps({'available':True,'currency':currency,'prices':prices})))
     page=await ctx.new_page()
     await page.goto('http://127.0.0.1:4174'+prefix+'/disenos/',wait_until='networkidle')
     await page.wait_for_function("[...document.querySelectorAll('.lz-price')].filter(n=>!n.hidden).length===22")
     for card in await page.locator('.lz-card').all():
      design=await card.get_attribute('data-id');actual=await card.locator('.lz-price').inner_text()
      amount=prices[design]['amount'];formatted=f'{amount:,}'.replace(',','.') if currency=='COP' else str(amount)
      assert actual==currency+' $'+formatted,(design,actual)
     await page.goto('http://127.0.0.1:4174'+prefix+'/disenos/?gama=luxury',wait_until='networkidle')
     await page.wait_for_function("document.querySelectorAll('.lz-card:not([hidden])').length===4")
     assert await page.locator('.lz-card:not([hidden]) .lz-price:not([hidden])').count()==4
     assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
     print('PASS 22 card prices and Luxury filter',currency,width,prefix or 'es',flush=True)
     await ctx.close()
  await browser.close()
asyncio.run(main())
