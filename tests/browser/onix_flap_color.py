"""Repeated Onyx palette changes repaint the animated envelope face."""
import asyncio,subprocess,time,io
from PIL import Image
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  for engine in ['chromium','webkit']:
   try:b=await getattr(p,engine).launch(**({'executable_path':'/usr/bin/chromium','args':['--no-sandbox']} if engine=='chromium' else {}))
   except Exception as e:
    if engine=='webkit':print('WebKit unavailable:',str(e).splitlines()[0]);continue
    raise
   page=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True)
   await page.route('https://**/*',lambda r:r.abort())
   await page.goto('http://127.0.0.1:4174/demo/onix/',wait_until='domcontentloaded')
   face=page.locator('.opening .flap-out');last=None
   for color in ['#ff0000','#00aa00','#0033ee','#ffee00']:
    await page.locator('.lz-custom-color input').evaluate('(e,c)=>{e.value=c;e.dispatchEvent(new Event("input",{bubbles:true}));}',color)
    await page.wait_for_timeout(150)
    pixels=Image.open(io.BytesIO(await face.screenshot())).convert('RGB');rgb=pixels.getpixel((pixels.width//2,20))
    assert rgb!=last,(engine,color,rgb);last=rgb
    gradient=await face.evaluate('e=>getComputedStyle(e).backgroundImage');assert 'gradient' in gradient
    assert await face.locator('.e4').evaluate('e=>getComputedStyle(e).fill')=='rgba(0, 0, 0, 0)'
   for palette in ['bosque','pizarra','onix']:
    await page.evaluate('id=>LazoTheme.apply(id)',palette);await page.wait_for_timeout(100)
    pixels=Image.open(io.BytesIO(await face.screenshot())).convert('RGB');rgb=pixels.getpixel((pixels.width//2,20));assert rgb!=last;last=rgb
   await page.locator('.env-btn').click();await page.wait_for_timeout(4000)
   assert await page.locator('.opening').evaluate('e=>getComputedStyle(e).visibility==="hidden" || getComputedStyle(e).opacity==="0" || e.classList.contains("gone")')
   print(engine,'sequential custom/preset colors and opening OK',flush=True);await b.close()
if __name__=='__main__':
 server=subprocess.Popen(['python','-m','http.server','4174','--directory','dist'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(.4)
 try:asyncio.run(main())
 finally:server.terminate()
