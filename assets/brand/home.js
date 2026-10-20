/* The storefront uses native links to full demos; openings run only inside each demo. */
(function () {
  'use strict';
  var nav = document.querySelector('.top nav');
  var button = nav && nav.querySelector('.nav-toggle');
  if (!button) return;
  var narrow = matchMedia('(max-width:800px)');
  function setOpen(open, focus) {
    nav.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? button.dataset.close : button.dataset.open);
    if (focus) button.focus();
  }
  button.addEventListener('click', function () { setOpen(button.getAttribute('aria-expanded') !== 'true'); });
  nav.querySelectorAll('.links a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('open')) setOpen(false, true);
  });
  document.addEventListener('click', function (event) {
    if (nav.classList.contains('open') && !nav.contains(event.target)) setOpen(false);
  });
  narrow.addEventListener('change', function () { setOpen(false); });
})();

/* Keep every design in the document; only the featured collection scrolls sideways. */
(function(){
 'use strict';
 var track=document.querySelector('#collection-track');if(!track)return;
 var container=track.closest('.design-carousel'),controls=container.querySelector('.collection-controls');
 var previous=controls.querySelector('.collection-prev'),next=controls.querySelector('.collection-next'),position=controls.querySelector('.collection-position');
 var cards=Array.from(track.children),en=document.documentElement.lang==='en';
 var reduced=matchMedia('(prefers-reduced-motion:reduce)'),frame;
 var paused=reduced.matches,hovered=false,focused=false,visible=false,timer;
 var toggle=document.createElement('button');toggle.type='button';toggle.className='collection-play';
 controls.querySelector('.collection-arrows').prepend(toggle);
 function playState(){
  toggle.textContent=paused?(en?'Play':'Reproducir'):(en?'Pause':'Pausar');
  toggle.setAttribute('aria-label',paused?(en?'Play carousel':'Reproducir carrusel'):(en?'Pause carousel':'Pausar carrusel'));
  toggle.setAttribute('aria-controls','collection-track');
  position.setAttribute('aria-live',paused?'polite':'off');
 }
 function schedule(){
  clearTimeout(timer);playState();
  if(paused || hovered || focused || !visible || document.hidden || controls.hidden)return;
  timer=setTimeout(function(){
   var m=metrics(),end=track.scrollLeft>=track.scrollWidth-track.clientWidth-2;
   track.scrollTo({left:end?0:(m.first+1)*m.step,behavior:reduced.matches?'instant':'smooth'});
   schedule();
  },4500);
 }
 function pause(){paused=true;schedule();}
 toggle.addEventListener('click',function(){paused=!paused;schedule();});
 container.addEventListener('mouseenter',function(){hovered=true;schedule();});
 container.addEventListener('mouseleave',function(){hovered=false;schedule();});
 container.addEventListener('focusin',function(){focused=true;schedule();});
 container.addEventListener('focusout',function(event){if(!container.contains(event.relatedTarget)){focused=false;schedule();}});
 track.addEventListener('pointerdown',pause,{passive:true});
 track.addEventListener('wheel',pause,{passive:true});
 document.addEventListener('visibilitychange',schedule);
 reduced.addEventListener('change',function(){if(reduced.matches)paused=true;schedule();});
 new IntersectionObserver(function(entries){visible=entries[0].isIntersecting;schedule();},{threshold:.25}).observe(track);
 function metrics(){
  var gap=parseFloat(getComputedStyle(track).columnGap)||0,step=cards[0].getBoundingClientRect().width+gap;
  return {step:step,count:Math.max(1,Math.floor((track.clientWidth+gap)/step)),first:Math.round(track.scrollLeft/step)};
 }
 function update(){
  var m=metrics(),last=Math.min(cards.length,m.first+m.count);
  previous.disabled=track.scrollLeft<2;next.disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-2;
  var label=(m.first+1)+'–'+last+(en?' of ':' de ')+cards.length;
  if(position.textContent!==label)position.textContent=label;
  controls.hidden=track.scrollWidth<=track.clientWidth+2;
 }
 function move(direction){var m=metrics();track.scrollTo({left:(m.first+direction*m.count)*m.step,behavior:reduced.matches?'instant':'smooth'});}
 previous.addEventListener('click',function(){pause();move(-1);});next.addEventListener('click',function(){pause();move(1);});
 track.addEventListener('keydown',function(event){
  if(event.target!==track)return;
  pause();
  if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}
  if(event.key==='Home'||event.key==='End'){event.preventDefault();track.scrollTo({left:event.key==='Home'?0:track.scrollWidth,behavior:reduced.matches?'instant':'smooth'});}
 });
 track.addEventListener('scroll',function(){cancelAnimationFrame(frame);frame=requestAnimationFrame(update);},{passive:true});
 new ResizeObserver(function(){update();schedule();}).observe(track);update();schedule();
})();
