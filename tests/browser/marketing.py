"""Private Marketing UI, local fixtures only; no provider or production calls."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright,expect
ROOT=Path(__file__).resolve().parents[2]
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for width in [1440,390,320]:
   page=await browser.new_page(viewport={'width':width,'height':950},accept_downloads=True)
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.route('**/*',lambda r:r.fulfill(content_type='text/html',body='<html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><main class="ad-main" id="marketing"></main></body></html>'))
   await page.goto('https://fixture.invalid/admin/#marketing')
   await page.add_style_tag(path=str(ROOT/'admin/admin.css'))
   await page.add_script_tag(path=str(ROOT/'admin/marketing-dates.js'))
   await page.add_script_tag(path=str(ROOT/'admin/marketing.js'))
   await page.evaluate('''async()=>{
    const db={settings:{destination:'admin@example.invalid',email_enabled:false,lead_minutes:60,day_before:false,report_currency:'USD'},posts:[],expenses:[],contacts:[],notifications:[],jobs:[],changes:[],order_options:[],exclusions:[],metrics:{paid_orders:0,new_buyers:0,published_buyers:0,checkout_starts:0,visits:null,demos:null,revenue:0,spend:0,cac_media:null,cac_total:null,by_currency:{},sources:{}},capabilities:{email_ready:false,reasons:['Envío desactivado']},review:'{"timezone":"America/Bogota","missing":["Sin medición"]}'};window.fixture=db;
    await InvitesseMarketing.mount(document.querySelector('#marketing'),{catalog:{designs:[{id:'nacar',es:{name:'Nácar'}}]},api:async(action,query,body)=>{
     if(action==='marketing-data')return structuredClone(db);
     if(action==='marketing-subscribers'){window.subscriberQuery=query;return {status:'ready',counts:{subscribed:51,pending:1,unsubscribed:1},total:query.q?0:51,offset:Number(query.offset),limit:50,rows:query.q?[]:Array.from({length:query.offset?1:50},(_,i)=>({email:'persona'+(Number(query.offset)+i)+'@example.invalid',status:i%2?'pending':'subscribed',lang:'es',source:'landing',created_at:'2026-10-22T14:00:00Z',welcome_sent_at:i%2?null:'2026-10-22T14:01:00Z'}))};}
     if(action==='marketing-plan'){if(!db.posts.some(p=>p.seed_key)){for(let i=0;i<30;i++)db.posts.push({id:crypto.randomUUID(),seed_key:'day'+i,title:'Idea '+i,platform:'instagram',format:'reel',status:'idea',goal:'discovery',revision:1,scheduled_at:new Date(Date.now()+i*86400000).toISOString(),content:{}});}return {};}
     if(body.entity==='post'){let index=db.posts.findIndex(p=>p.id===body.id);if(body.operation==='delete'){db.posts.splice(index,1);return {};}
      const payload={...body.payload,content:{...body.payload,manual:body.payload.manual}};const row={...payload,id:body.id||crypto.randomUUID(),revision:(db.posts[index]?.revision||0)+1};if(index<0)db.posts.push(row);else db.posts[index]=row;return row;}
     if(body.entity==='settings'){db.settings=body.payload;return {};}
     return {};
    }});
   }''')
   await page.get_by_role('button',name='Nueva publicación',exact=True).click()
   await page.locator('dialog[open] [name=title]').fill('Apertura de Nácar')
   await page.locator('dialog[open] [name=status]').select_option('scheduled')
   await page.locator('dialog[open] [name=scheduled_at]').fill('2028-02-01T18:00')
   await page.locator('dialog[open] [name=copy]').fill('Contenido real para copiar')
   await page.locator('dialog[open] button[type=submit]').click()
   await expect(page.locator('dialog[open]')).to_have_count(0)
   assert await page.evaluate('fixture.posts[0].scheduled_at')=='2028-02-01T23:00:00.000Z'
   await page.get_by_role('button',name='Calendario',exact=True).click()
   await page.get_by_role('button',name='Mes',exact=True).click()
   await page.locator('[data-month]').fill('2028-02')
   await page.locator('[data-post]').first.click()
   await expect(page.locator('dialog[open] [name=copy]')).to_have_value('Contenido real para copiar')
   await page.get_by_role('button',name='Duplicar',exact=True).click()
   await page.locator('dialog[open] button[type=submit]').click()
   await expect(page.locator('dialog[open]')).to_have_count(0)
   assert await page.evaluate('fixture.posts.length')==2
   await page.locator('[data-post]').first.click()
   await page.locator('dialog[open] [name=scheduled_at]').fill('2028-02-02T10:00')
   await page.locator('dialog[open] button[type=submit]').click()
   await expect(page.locator('dialog[open]')).to_have_count(0)
   await page.get_by_role('button',name='Cargar plan de 30 días',exact=True).click()
   await page.locator('dialog[open] [name=start]').fill('2028-02-01')
   await page.locator('dialog[open] button[type=submit]').click()
   await expect(page.locator('dialog[open]')).to_have_count(0)
   await page.get_by_role('button',name='Resultados',exact=True).click()
   await expect(page.get_by_text('Sin medición',exact=True).first).to_be_visible()
   await page.get_by_role('button',name='Preparar revisión semanal',exact=True).click()
   await expect(page.locator('dialog[open] textarea')).to_contain_text('America/Bogota')
   await page.get_by_role('button',name='Cerrar',exact=True).click()
   await page.get_by_role('button',name='Calendario',exact=True).click()
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'overflow {width}'
   await page.screenshot(path=f'/tmp/marketing-{width}.png',full_page=True)
   await page.get_by_role('button',name='Suscriptores',exact=True).click()
   await expect(page.get_by_text('persona0@example.invalid',exact=True)).to_be_visible()
   assert await page.locator('.mk-content tbody tr').count()==50
   await page.get_by_role('button',name='Siguiente',exact=True).click()
   await expect(page.get_by_text('persona50@example.invalid',exact=True)).to_be_visible()
   await page.locator('[data-subscriber-search]').fill('no-match')
   await page.locator('[data-subscriber-status]').select_option('unsubscribed')
   await page.locator('[data-subscriber-search]').press('Enter')
   await expect(page.get_by_text('No hay suscriptores que coincidan con estos filtros.',exact=True)).to_be_visible()
   assert await page.evaluate('subscriberQuery.offset')==0
   assert await page.evaluate('subscriberQuery.status')=='unsubscribed'
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'subscribers overflow {width}'
   assert not errors,errors
   print('PASS Marketing create/edit/duplicate/reschedule/plan/review/unknown metrics/mobile',width,flush=True)
   await page.close()
  await browser.close()
asyncio.run(main())
