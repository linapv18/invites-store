"""Every design keeps its original gallery slots; overflow remains in the viewer."""
import asyncio, os
from pathlib import Path
from playwright.async_api import async_playwright
BASE=os.environ.get('INVITESSE_TEST_BASE','http://127.0.0.1:4174')
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  context=await browser.new_context()
  await context.route('https://**/*',lambda r:r.abort())
  await context.route('**/assets/fotos/**',lambda r:r.fulfill(status=200,content_type='image/svg+xml',body='<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>'))
  page=await context.new_page()
  designs=sorted(x.parent.name for x in Path('demo').glob('*/index.html'))
  for width in ([390] if os.environ.get('GALLERY_MOBILE_ONLY') else [1440,390]):
   await page.set_viewport_size({'width':width,'height':900})
   for design in designs:
    await page.goto(f'{BASE}/demo/{design}/',wait_until='domcontentloaded')
    group=page.locator('[data-lz-list="gallery"]');await group.wait_for(state='attached')
    original=await group.locator(':scope > [data-lz-item]').count();assert original>0,design
    await page.evaluate("localStorage.setItem('gallery-test',JSON.stringify({n1:'Lina',n2:'Nico',gallery:[]}))")
    await page.goto(f'{BASE}/demo/{design}/?lz=editor&k=gallery-test',wait_until='domcontentloaded')
    await page.wait_for_function('window.LazoContent && document.querySelector(".lz-viewer")')
    for total in [16,2,0,original,original+1]:
     await page.evaluate('n=>window.postMessage({lz:"content",content:{n1:"Lina",n2:"Nico",gallery:Array.from({length:n},(_,i)=>"/assets/fotos/beso.jpg?photo="+i)}},location.origin)',total)
     await page.wait_for_timeout(80)
     assert await group.locator(':scope > [data-lz-item]').count()==min(total,original),(design,width,total)
     section=group.locator('xpath=ancestor::section[1]');button=section.locator('[data-gallery-open]').first
     if total>original:
      assert await button.count()==1,(design,'no button')
      assert not await button.evaluate('e=>e.hidden'),design
      await button.evaluate('e=>e.click()')
      assert await page.locator('.lz-viewer').evaluate('e=>!e.hidden'),design
      assert await page.locator('.lz-v-count').inner_text()==f'1 / {total}'
      await page.keyboard.press('ArrowLeft')
      assert await page.locator('.lz-v-count').inner_text()==f'{total} / {total}'
      await page.keyboard.press('Escape')
      assert await page.locator('.lz-viewer').evaluate('e=>e.hidden')
     elif await button.count(): assert await button.evaluate('e=>e.hidden'),(design,total,'unexpected CTA')
    print(width,design,original,'OK',flush=True)
  await browser.close()
asyncio.run(main())
