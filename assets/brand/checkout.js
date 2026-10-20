(function(){
 'use strict';
 var en=document.documentElement.lang==='en',base=en?'/en':'',esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
 async function request(data){
  var b=window.InvitesseBackend,s=await b.client.auth.getSession();
  if(!s.data.session) throw Error('AUTH_REQUIRED');
  var r=await fetch('/api/checkout/',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+s.data.session.access_token},body:JSON.stringify(data)}),j=await r.json();
  if(!r.ok){var error=Error(j.error || 'PAYMENTS_TEMPORARILY_UNAVAILABLE');error.reference=j.reference;error.requestId=j.requestId;throw error;}return j;
 }
 var messages={
  EVENT_DETAILS_REQUIRED:en?'Enter the event date to calculate publication validity.':'Indiquen la fecha del evento para calcular la vigencia.',
  EVENT_DATE_IN_PAST:en?'Choose an event date from today onward.':'Elijan una fecha de evento a partir de hoy.',
  PURCHASE_EVENT_DATE_LOCKED:en?'The event date is attached to a checkout or purchase. Cancel the pending checkout to change it, or contact support if already paid.':'La fecha está asociada a un pago pendiente o una compra. Cancelen el checkout pendiente para cambiarla; si ya pagaron, contacten con soporte.',
  CHECKOUT_CURRENCY_LOCKED:en?'Cancel the pending checkout before changing currency.':'Cancelen el checkout pendiente antes de cambiar la moneda.',
  PURCHASE_ALREADY_EXISTS:en?'A purchase already exists. Contact hola@invitesse.com; do not pay again.':'Ya existe una compra. Contacten con hola@invitesse.com; no vuelvan a pagar.',
  PAYMENT_PROCESSING:en?'Payment is processing. Wait for confirmation; do not pay again.':'El pago está en proceso. Esperen la confirmación; no vuelvan a pagar.',
  CHECKOUT_BEING_PREPARED:en?'The previous checkout is still being prepared. Wait a moment and try applying the code again.':'El checkout anterior todavía se está preparando. Esperen un momento y vuelvan a aplicar el código.',
  DRAFT_CONFLICT:en?'Your invitation changed. Reload before paying.':'La invitación cambió. Recarguen antes de pagar.',
  EMAIL_NOT_CONFIRMED:en?'Verify your account email before paying.':'Verifiquen el correo de su cuenta antes de pagar.',
  DISCOUNT_NOT_FOUND:en?'That code does not exist or is no longer active.':'Ese código no existe o ya no está activo.',
  DISCOUNT_NOT_STARTED:en?'That code is not active yet.':'Ese código todavía no está activo.',
  DISCOUNT_EXPIRED:en?'That code has expired.':'Ese código ya venció.',
  DISCOUNT_NOT_APPLICABLE:en?'That code does not apply to this design.':'Ese código no aplica para este diseño.',
  DISCOUNT_EXHAUSTED:en?'That code has reached its limit.':'Ese código ya alcanzó su límite de usos.',
  DISCOUNT_ALREADY_USED:en?'You already used that code.':'Ya usaron ese código.',
  DISCOUNT_TOO_LARGE:en?'That code cannot be applied to this price.':'Ese código no se puede aplicar a este precio.',
  PAYMENTS_TEMPORARILY_UNAVAILABLE:en?'We could not continue with payment. If you already paid, do not pay again. Contact hola@invitesse.com.':'No pudimos continuar con el pago. Si ya pagaron, no lo repitan. Contacten con hola@invitesse.com.',
 };
 window.InvitesseCheckout={request:request,mount:async function(root,design){
  var quote=null,busy=false,market=null,amount=null,status='',notice='',polls=0,timer;
  var verifyingReturn=new URLSearchParams(location.search).get('payment')==='return';
  var selected=(window.LazoCatalog?.designs || []).find(function(d){return d.id===design;}),info=selected?.[en?'en':'es'];
  var name=info?.name || design,photo=selected?.thumb?selected.thumb+'-280.webp':selected?.img?.[0];
  var lock='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
  var card='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h4"/></svg>';
  root.innerHTML='<div class="ed"><header class="co-top"><a class="co-back" href="'+base+'/disenos/">← '+(en?'Back to designs':'Volver a los diseños')+'</a><span class="ed-spacer"></span><a class="ed-logo ed-logo-full" href="'+base+'/" aria-label="Invitesse"><img src="/assets/brand/logo/invitesse-logo-black.svg" width="116" height="32" alt="Invitesse"></a><span class="ed-spacer"></span><span class="co-secure">'+lock+(en?'Secure checkout':'Pago seguro')+'</span></header><form class="co-wrap iv-checkout" id="ivPurchase"><section class="co-main"><div class="ed-head"><span class="ed-kicker">'+(en?'Your wedding, your way':'Su boda, a su manera')+'</span><h1>'+(en?'Your invitation starts here.':'Su invitación empieza aquí.')+'</h1><p>'+(en?'A design to make your own, ready for every detail of your day.':'Un diseño para hacer suyo y contar cada detalle de su día.')+'</p></div><div class="iv-date-card"><span class="ed-kicker">01 · '+(en?'Your celebration':'Su celebración')+'</span><label class="ed-field iv-event-field" for="ivEventDate">'+(en?'Event date':'Fecha del evento')+'<input id="ivEventDate" type="date" required></label><p class="ed-hint">'+(en?'Your invitation stays online until three months after the event.':'Su invitación estará disponible hasta tres meses después del evento.')+'</p><p id="ivValidity" class="iv-validity" aria-live="polite"></p></div><div class="iv-payment-card"><span class="ed-kicker">02 · '+(en?'Payment':'El pago')+'</span><div class="iv-card-method">'+card+'<div><b>'+(en?'Credit or debit card':'Tarjeta de crédito o débito')+'</b><span>'+(en?'Enter your payment details securely in the next step.':'Ingresen sus datos de pago de forma segura en el siguiente paso.')+'</span></div>'+lock+'</div><p class="ed-hint">'+(en?'One payment for your invitation. Publishing afterward has no additional cost.':'Un solo pago por su invitación. Publicar después no tiene otro costo.')+'</p></div></section><aside class="co-sum" aria-label="'+(en?'Order summary':'Resumen del pedido')+'"><h2>'+(en?'Your invitation':'Su invitación')+'</h2><div class="iv-order-design">'+(photo?'<img src="'+esc(photo)+'" width="84" height="110" alt="">':'')+'<div><span class="ed-kicker">'+(en?'Selected design':'Diseño elegido')+'</span><h3>'+esc(name)+'</h3><p>'+esc((info?.opening || '').replace(/^(Apertura|Opening):\s*/,''))+'</p></div></div><ul class="iv-includes"><li>'+(en?'Personalize text, photos and details':'Personalicen textos, fotos y detalles')+'</li><li>'+(en?'Family links and individual RSVPs':'Enlaces por familia y confirmaciones')+'</li><li>'+(en?'Publish at no extra charge':'Publiquen sin un cobro adicional')+'</li></ul><section class="iv-code" id="ivCodeBox"><h3 class="iv-code-heading">'+(en?'Discount code':'Código de descuento')+'</h3><p class="ed-hint">'+(en?'Apply your code here before continuing to Stripe.':'Apliquen aquí su código antes de continuar a Stripe.')+'</p><div class="iv-code-row"><label class="vh" for="ivCode">'+(en?'Discount code':'Código de descuento')+'</label><input id="ivCode" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="32" placeholder="'+(en?'CODE':'CÓDIGO')+'"><button class="ed-btn" id="ivCodeApply" type="button">'+(en?'Apply':'Aplicar')+'</button></div><p id="ivCodeMsg" class="iv-code-msg" role="status" aria-live="polite" hidden></p></section><div class="co-total"><span>Total</span><b id="ivPrice" role="status">…</b></div><span class="co-note">'+(en?'One-time payment':'Pago único')+'</span><label class="iv-accept"><input type="checkbox" required id="ivAccept"><span>'+(en?'I accept the ':'Acepto las ')+'<a target="_blank" rel="noopener" href="'+(en?'/en/terms/':'/condiciones/')+'">'+(en?'terms of service':'condiciones del servicio')+'</a>'+(en?' and the price and validity shown.':' y el precio y la vigencia indicados.')+'</span></label><button class="ed-btn ed-btn-dark co-pay" id="ivPay" type="submit">'+(en?'Continue to payment':'Continuar al pago')+'</button><button class="ed-btn" id="ivCancel" type="button" hidden>'+(en?'Cancel pending checkout':'Cancelar checkout pendiente')+'</button><p id="ivPayNotice" class="co-notice" role="status" aria-live="polite" hidden></p><span class="co-note iv-stripe-note">'+lock+(en?'Secure payment with Stripe':'Pago seguro con Stripe')+'</span></aside></form></div>';
  var codeInput=root.querySelector('#ivCode'),codeApply=root.querySelector('#ivCodeApply'),codeMsg=root.querySelector('#ivCodeMsg'),codeBox=root.querySelector('#ivCodeBox'),discount=null,codeNote='',codeOk=false;
  var money=function(minor,cur){return cur==='COP'?'COP $'+Math.round(minor/100).toLocaleString('es-CO'):'USD $'+(minor/100).toLocaleString(en?'en-US':'es-CO',{minimumFractionDigits:minor%100?2:0,maximumFractionDigits:2});};
  var form=root.querySelector('form'),date=root.querySelector('#ivEventDate'),price=root.querySelector('#ivPrice'),pay=root.querySelector('#ivPay'),note=root.querySelector('#ivPayNotice'),validity=root.querySelector('#ivValidity'),cancel=root.querySelector('#ivCancel');
  var eventZone=Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota';
  function previewEnd(){
   var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(date.value);if(!m)return '';
   var targetMonth=+m[2]-1+3,year=+m[1]+Math.floor(targetMonth/12),month=targetMonth%12,day=Math.min(+m[3],new Date(Date.UTC(year,month+1,0)).getUTCDate());
   return new Intl.DateTimeFormat(en?'en-US':'es-CO',{timeZone:'UTC',dateStyle:'long'}).format(new Date(Date.UTC(year,month,day)));
  }
  function show(){
   form.noValidate=!!quote?.enabled || verifyingReturn;
   pay.disabled=busy || !market || amount===null || (status==='processing' && !verifyingReturn);
   price.hidden=!!quote?.enabled || verifyingReturn;
   var full=market && amount!==null?market+' $'+new Intl.NumberFormat(market==='COP'?'es-CO':'en-US').format(amount):'…';
   if(discount && discount.currency===market){price.innerHTML='<s class="iv-was">'+esc(full)+'</s> '+esc(money(discount.total_minor,market));}else{price.textContent=full;}
   codeBox.hidden=!!quote?.enabled || verifyingReturn;codeApply.disabled=busy || !market || status==='processing';codeInput.disabled=busy || status==='processing';codeMsg.textContent=codeNote;codeMsg.hidden=!codeNote;codeMsg.classList.toggle('is-ok',codeOk);date.disabled=!!quote?.enabled || status==='pending';
   cancel.hidden=status!=='pending' || verifyingReturn;cancel.disabled=busy;
   root.querySelector('.iv-accept').hidden=verifyingReturn || !!quote?.enabled;
   pay.textContent=verifyingReturn && !quote?.enabled?(en?'Verify purchase':'Verificar compra'):busy?(en?'Preparing payment…':'Preparando el pago…'):quote?.enabled?(en?'Open editor':'Abrir editor'):(en?'Continue to payment':'Continuar al pago');
   note.textContent=notice;note.hidden=!notice;
   var end=quote?new Intl.DateTimeFormat(en?'en-US':'es-CO',{timeZone:quote.timezone,dateStyle:'long'}).format(new Date(new Date(quote.expires_at).getTime()-1)):previewEnd();
   validity.textContent=end?(en?'Available through ':'Disponible hasta el ')+end+'.':'';

  }
  function fail(e){notice=messages[e.message] || (en?'Unable to continue. No new payment was started. Try again or contact support.':'No se pudo continuar. No se inició otro pago. Reintenten o contacten con soporte.');if(e.reference)notice+=' '+(en?'Reference: ':'Referencia: ')+e.reference;}
  async function refresh(){
   try {var q=await request({action:'status',design:design});quote=q;status=q.status;date.value=q.event_date;eventZone=q.timezone;if(q.currency){market=q.currency;amount=q.amount;}
    if(q.enabled){notice=en?'Payment confirmed. You can edit your invitation.':'Pago confirmado. Ya pueden editar su invitación.';clearTimeout(timer);if(verifyingReturn){location.replace(base+'/editor/?diseno='+encodeURIComponent(design));return;}}
    else if(verifyingReturn){notice=en?'Verifying your purchase. Do not pay again.':'Verificando su compra. No vuelvan a pagar.';}
   }catch(e){if(e.message==='EVENT_DETAILS_REQUIRED' || e.message==='INVITATION_NOT_FOUND'){notice='';}else fail(e);}
   if(verifyingReturn && !quote?.enabled && polls++<10){clearTimeout(timer);timer=setTimeout(refresh,2500);}
   show();
  }
  date.addEventListener('change',function(){quote=null;show();});
  cancel.addEventListener('click',async function(){busy=true;show();try{await request({action:'cancel',design:design});status='';quote=null;await loadPrice();notice=en?'Pending checkout cancelled. You can change the event date.':'Checkout pendiente cancelado. Pueden cambiar la fecha del evento.';}catch(e){fail(e);}busy=false;show();});
  async function applyCode(){
   var value=codeInput.value.trim().toUpperCase();
   if(!value){discount=null;codeNote='';show();return;}
   if(busy || quote?.enabled || status==='processing')return;
   busy=true;show();
   try{var d=await request({action:'discount',design:design,code:value,quotedCurrency:market});
    if(status==='pending'){
     var cancelled=await request({action:'cancel',design:design});
     if(cancelled.status!=='cancelled'){
      await refresh();throw Error(cancelled.enabled?'PURCHASE_ALREADY_EXISTS':'PAYMENT_PROCESSING');
     }
     status='unpaid';quote=null;
     await loadPrice();
     if(d.currency!==market)d=await request({action:'discount',design:design,code:value,quotedCurrency:market});
    }
    discount=d;codeOk=true;
    codeNote=(d.percent_off?(en?d.percent_off+'% off applied':d.percent_off+' % de descuento aplicado'):(en?'Discount applied: ':'Descuento aplicado: ')+money(d.discount_minor,d.currency))+' · '+d.code;}
   catch(err){discount=null;codeOk=false;codeNote=messages[err.message] || (en?'We could not check that code. Try again.':'No pudimos revisar ese código. Inténtenlo de nuevo.');}
   busy=false;show();
  }
  codeApply.addEventListener('click',applyCode);
  codeInput.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();applyCode();}});
  codeInput.addEventListener('input',function(){if(discount && codeInput.value.trim().toUpperCase()!==discount.code){discount=null;codeNote='';show();}});
  form.addEventListener('submit',async function(e){e.preventDefault();if(busy)return;if(verifyingReturn && !quote?.enabled){busy=true;show();await refresh();busy=false;show();return;}if(quote?.enabled){location.href=base+'/editor/?diseno='+encodeURIComponent(design);return;}
   busy=true;notice='';show();try{
    if(!quote){var shownMarket=market,shownAmount=amount;quote=await request({action:'details',design:design,date:date.value,timezone:eventZone});market=quote.currency;amount=quote.amount;if(shownMarket!==market || shownAmount!==amount){notice=en?'Your local price changed. Review the total before continuing.':'El precio local cambió. Revisen el total antes de continuar.';busy=false;show();return;}}
    var result=await request({action:'create',design:design,quotedCurrency:market,quotedAmount:amount,revision:quote.revision,locale:en?'en':'es',acceptedTerms:true,code:discount && discount.currency===market?discount.code:undefined});
    if(result.enabled){await refresh();}else if(result.url && new URL(result.url).origin==='https://checkout.stripe.com'){location.assign(result.url);return;}else{status=result.status;notice=en?'Payment is processing. Do not pay again.':'El pago está en proceso. No vuelvan a pagar.';}

   }catch(e){if(e.message==='PRICE_CHANGED'){await refresh();notice=en?'Your local price changed. Review it and continue again.':'El precio local cambió. Revísenlo antes de continuar.';}else fail(e);}busy=false;show();
  });
  async function loadPrice(){var r=await fetch('/api/checkout/',{cache:'no-store'}),p=await r.json();if(!r.ok || !['COP','USD'].includes(p.currency))throw Error('PAYMENTS_TEMPORARILY_UNAVAILABLE');if(!p.prices?.[design])throw Error('PAYMENTS_TEMPORARILY_UNAVAILABLE');market=p.currency;amount=p.prices[design].amount;}
  show();
  try{await loadPrice();await refresh();}catch(e){fail(e);show();}
 }};
})();
