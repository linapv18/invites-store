"""Refresh the self-hosted font CSS/files and OFL licenses. Requires network access, not used during build."""
from pathlib import Path
import re,urllib.request,urllib.parse,hashlib,concurrent.futures,time
root=Path(__file__).resolve().parents[1];target=root/'assets/brand/fonts';target.mkdir(parents=True,exist_ok=True);paths=[];urls=set()
import json
manifestPath=target/'sources.json'
previous=json.loads(manifestPath.read_text()) if manifestPath.exists() else {}
urls.update(previous)
for p in root.rglob('*.html'):
 if set(p.relative_to(root).parts)&{'node_modules','dist','.git'}:continue
 s=p.read_text();paths.append((p,s))
 for tag in re.findall('<link[^>]+>',s):
  m=re.search('href="(https://fonts.googleapis.com/[^\"]+)"',tag)
  if m:urls.add(m.group(1).replace('&amp;','&'))
def get(url):
 for attempt in range(3):
  try:return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36'}),timeout=35).read()
  except Exception:
   if attempt==2:raise
families={v.split(':')[0] for u in urls for k,v in urllib.parse.parse_qsl(urllib.parse.urlparse(u).query) if k=='family'}
def license(family):
 name=family.replace(' ','').lower();data=get('https://raw.githubusercontent.com/google/fonts/main/ofl/'+name+'/OFL.txt');(target/('LICENSE-'+name+'.txt')).write_bytes(data)
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:list(pool.map(license,sorted(families)))
csses={}
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
 for url,data in zip(sorted(urls),pool.map(get,sorted(urls))):csses[url]=data.decode()
fonturls=sorted({u for css in csses.values() for u in re.findall(r'url\((https://[^)]+)\)',css)})
fontmap={}
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
 for url,data in zip(fonturls,pool.map(get,fonturls)):
  ext=Path(urllib.parse.urlparse(url).path).suffix
  if ext not in ['.woff2','.woff','.ttf']:ext={b'wOF2':'.woff2',b'wOFF':'.woff',b'\x00\x01\x00\x00':'.ttf'}.get(data[:4])
  if not ext:raise RuntimeError('Unexpected font format: '+url)
  name=hashlib.sha256(data).hexdigest()[:16]+ext;(target/name).write_bytes(data);fontmap[url]='/assets/brand/fonts/'+name
mapping={}
for url,css in csses.items():
 for old,new in fontmap.items():css=css.replace(old,new)
 name='set-'+hashlib.sha256(css.encode()).hexdigest()[:16]+'.css';(target/name).write_text('/* Self-hosted Google Fonts. See adjacent LICENSE files. */\n'+css);mapping[url]='/assets/brand/fonts/'+name
manifestPath.write_text(json.dumps(mapping,ensure_ascii=False,indent=2)+'\n')
for p,s in paths:
 before=s
 for old,new in mapping.items():
  if old in previous:s=s.replace(previous[old],new)
 for old,new in mapping.items():s=s.replace(old.replace('&','&amp;'),new).replace(old,new)
 if before!=s:
  s=re.sub(r'<link[^>]+href="https://fonts\.(?:googleapis|gstatic)\.com"[^>]*>\s*','',s);p.write_text(s)
print('Vendored',len(mapping),'stylesheets;',len(fontmap),'font URLs;',len(families),'family licenses. All language subsets preserved.')
