(function(){
 'use strict';
 var en=document.documentElement.lang==='en',base=en?'/en':'',esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
 async function request(data){
  var b=window.InvitesseBackend,s=await b.client.auth.getSession();
  if(!s.data.session) throw Error('AUTH_REQUIRED');
  var r=await fetch('/api/checkout/',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+s.data.session.access_token},body:JSON.stringify(data)}),j=await r.json();
  if(!r.ok) throw Error(j.error || 'PAYMENTS_TEMPORARILY_UNAVAILABLE');return j;
 }
 var messages={
  EVENT_DETAILS_REQUIRED:en?'Enter the event date to calculate publication validity.':'Indiquen la fecha del evento para calcular la vigencia.',
  EVENT_DATE_IN_PAST:en?'Choose an event date from today onward.':'Elijan una fecha de evento a partir de hoy.',
  PURCHASE_EVENT_DATE_LOCKED:en?'The event date is attached to a checkout or purchase. Cancel the pending checkout to change it, or contact support if already paid.':'La fecha está asociada a un pago pendiente o una compra. Cancelen el checkout pendiente para cambiarla; si ya pagaron, contacten con soporte.',
  CHECKOUT_CURRENCY_LOCKED:en?'Cancel the pending checkout before changing currency.':'Cancelen el checkout pendiente antes de cambiar la moneda.',
  PURCHASE_ALREADY_EXISTS:en?'A purchase already exists. Contact hola@invitesse.com; do not pay again.':'Ya existe una compra. Contacten con hola@invitesse.com; no vuelvan a pagar.',
  DRAFT_CONFLICT:en?'Your invitation changed. Reload before paying.':'La invitación cambió. Recarguen antes de pagar.',
  EMAIL_NOT_CONFIRMED:en?'Verify your account email before paying.':'Verifiquen el correo de su cuenta antes de pagar.',
  PAYMENTS_TEMPORARILY_UNAVAILABLE:en?'Checkout is temporarily unavailable. No charge was made. Try again later or contact hola@invitesse.com.':'El checkout no está disponible temporalmente. No se hizo ningún cargo. Reintenten después o contacten con hola@invitesse.com.',
 };
 window.InvitesseCheckout={request:request,mount:async function(root,design){
  var quote=null,busy=false,market='USD',status='',notice='',polls=0,timer;
  root.innerHTML='<div class="ed"><header class="co-top"><a class="co-back" href="'+base+'/disenos/">'+(en?'Designs':'Diseños')+'</a><a class="ed-logo" href="'+base+'/">Invitesse</a></header><main class="co-wrap ac-wrap"><section class="ac-narrow"><h1>'+(en?'Purchase your invitation':'Comprar su invitación')+'</h1><p>'+esc(design)+' · '+(en?'One-time payment. Editing is unlocked after payment.':'Pago único. El pago desbloquea la edición.')+'</p><form id="ivPurchase"><label class="ed-field">'+(en?'Market and currency':'País y moneda')+'<select id="ivCurrency"><option value="USD">'+(en?'Other countries — USD $79':'Otros países — USD $79')+'</option><option value="COP">Colombia — COP $200.000</option></select></label><label class="ed-field">'+(en?'Event date':'Fecha del evento')+'<input id="ivEventDate" type="date" required></label><label class="ed-field">'+(en?'Event time zone':'Zona horaria del evento')+'<select id="ivEventZone"></select></label><p>'+(en?'The invitation remains published through three calendar months after the event. The event date and time zone are fixed with your purchase; contact support for changes afterward.':'La invitación permanece publicada hasta tres meses calendario después del evento. La fecha y zona horaria quedan fijadas con la compra; los cambios posteriores se gestionan con soporte.')+'</p><p id="ivValidity"></p><label style="display:flex;gap:10px;margin:20px 0"><input type="checkbox" required id="ivAccept"><span>'+(en?'I accept the ':'Acepto las ')+'<a target="_blank" rel="noopener" href="'+(en?'/en/terms/':'/condiciones/')+'">'+(en?'terms of service':'condiciones del servicio')+'</a>'+(en?' and the price and validity shown.':' y el precio y la vigencia indicados.')+'</span></label><button class="ed-btn ed-btn-dark" id="ivPay" type="submit">'+(en?'Calculate validity':'Calcular vigencia')+'</button> <button class="ed-btn" id="ivCancel" type="button" hidden>'+(en?'Cancel pending checkout':'Cancelar checkout pendiente')+'</button><p id="ivPayNotice" role="status" aria-live="polite"></p><p>'+(en?'Payment details are entered securely on Stripe.':'Los datos de pago se introducen de forma segura en Stripe.')+'</p></form></section></main></div>';
  var form=root.querySelector('form'),date=root.querySelector('#ivEventDate'),zone=root.querySelector('#ivEventZone'),currency=root.querySelector('#ivCurrency'),pay=root.querySelector('#ivPay'),note=root.querySelector('#ivPayNotice'),validity=root.querySelector('#ivValidity'),cancel=root.querySelector('#ivCancel');
  var zones=typeof Intl.supportedValuesOf==='function'?Intl.supportedValuesOf('timeZone'):['America/Bogota','America/New_York','America/Mexico_City','America/Lima','America/Argentina/Buenos_Aires','America/Panama','UTC'];
  if(zones.indexOf('UTC')<0)zones.push('UTC');
  zone.innerHTML=zones.map(function(z){return '<option>'+esc(z)+'</option>';}).join('');
  zone.value=Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota';if(!zone.value)zone.value='America/Bogota';
  function show(){
   form.noValidate=!!quote?.enabled;
   pay.disabled=busy || status==='processing';currency.disabled=!!quote?.enabled || status==='pending';date.disabled=!!quote?.enabled || status==='pending';zone.disabled=date.disabled;
   cancel.hidden=status!=='pending';cancel.disabled=busy;
   pay.textContent=quote?.enabled?(en?'Open editor':'Abrir editor'):quote?(en?'Continue to Stripe — ':'Continuar a Stripe — ')+(market==='COP'?'COP $200.000':'USD $79'):(en?'Calculate validity':'Calcular vigencia');
   note.textContent=notice;
   validity.textContent=quote?(en?'Publication through ':'Publicación hasta el ')+new Intl.DateTimeFormat(en?'en-US':'es-CO',{timeZone:quote.timezone,dateStyle:'long'}).format(new Date(new Date(quote.expires_at).getTime()-1))+' ('+quote.timezone+').':'';
  }
  function fail(e){notice=messages[e.message] || (en?'Unable to continue. No new payment was started. Try again or contact support.':'No se pudo continuar. No se inició otro pago. Reintenten o contacten con soporte.');}
  async function refresh(){
   try {var q=await request({action:'status',design:design});quote=q;status=q.status;date.value=q.event_date;zone.value=q.timezone;if(q.checkoutCurrency){market=q.checkoutCurrency;currency.value=market;}
    if(q.enabled){notice=en?'Payment confirmed. You can edit your invitation.':'Pago confirmado. Ya pueden editar su invitación.';clearTimeout(timer);}
    else if(new URLSearchParams(location.search).get('payment')==='return' && polls++<10){notice=en?'Verifying payment. Do not pay again.':'Verificando el pago. No vuelvan a pagar.';timer=setTimeout(refresh,2500);}
   }catch(e){if(e.message==='EVENT_DETAILS_REQUIRED' || e.message==='INVITATION_NOT_FOUND'){notice=messages.EVENT_DETAILS_REQUIRED;}else fail(e);}show();
  }
  date.addEventListener('change',function(){quote=null;show();});zone.addEventListener('change',function(){quote=null;show();});currency.addEventListener('change',function(){market=currency.value;show();});
  cancel.addEventListener('click',async function(){busy=true;show();try{await request({action:'cancel',design:design});status='';quote=null;notice=en?'Pending checkout cancelled. You can change the date or currency.':'Checkout pendiente cancelado. Pueden cambiar la fecha o moneda.';}catch(e){fail(e);}busy=false;show();});
  form.addEventListener('submit',async function(e){e.preventDefault();if(busy)return;if(quote?.enabled){location.href=base+'/editor/?diseno='+encodeURIComponent(design);return;}
   busy=true;notice='';show();try{
    if(!quote){quote=await request({action:'details',design:design,date:date.value,timezone:zone.value});notice=en?'Review the expiry date and press Continue to Stripe.':'Revisen la fecha de vencimiento y pulsen Continuar a Stripe.';}
    else {var result=await request({action:'create',design:design,currency:market,revision:quote.revision,locale:en?'en':'es',acceptedTerms:true});if(result.enabled){await refresh();}else if(result.url && new URL(result.url).origin==='https://checkout.stripe.com'){location.assign(result.url);return;}else{status=result.status;notice=en?'Payment is processing. Do not pay again.':'El pago está en proceso. No vuelvan a pagar.';}}
   }catch(e){fail(e);}busy=false;show();
  });
  await refresh();
 }};
})();
