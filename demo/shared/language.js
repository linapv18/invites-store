/* Invitation language is saved content, independent of the storefront URL.
   Runs before template layout and behavior to avoid mixed-language UI. */
(function(){
  'use strict';
  var params=new URLSearchParams(location.search),mode=params.get('lz'),key=params.get('k');
  if(mode!=='editor' && mode!=='vista')return;
  // Defense in depth; response headers also exclude preview documents before JS.
  var robots=document.querySelector('meta[name=robots]')||document.createElement('meta');
  robots.name='robots';robots.content='noindex,nofollow';document.head.appendChild(robots);
  if(!key)return;
  var current=document.documentElement.lang.slice(0,2)==='en'?'en':'es',redirecting=false;
  function ensure(content){
    var lang=content && content.invitationLanguage==='en'?'en':'es';
    if(lang===current)return false;
    if(!redirecting){
      var route=location.pathname.replace(/^\/en(?=\/)/,'');
      if(!/^\/demo\/[a-z]+\/$/.test(route))return false;
      redirecting=true;document.documentElement.style.visibility='hidden';
      location.replace((lang==='en'?'/en':'')+route+location.search+location.hash);
    }
    return true;
  }
  window.LazoInvitationLanguage={ensure:ensure};
  try{ensure(JSON.parse(localStorage.getItem(key)||'{}'));}catch(_) {ensure({});}
})();
