(function(){
const KEY='gearline-demo-v2', CART='gearline-cart-v1';
const CATS={brakes:'Brakes',engine:'Engine',filters:'Filters',electrical:'Electrical',suspension:'Suspension',bike:'Two-wheeler'};
const STATUS={verify:['Verify UPI payment','warn'],awaiting:['Awaiting payment','warn'],cod:['Cash on delivery','info'],paid:['Paid','good'],shipped:['Shipped','info'],delivered:['Delivered','good'],cancelled:['Cancelled','bad']};
const DAY=864e5, now=Date.now();

const SEED=window.GEARLINE_SEED;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const clone=o=>JSON.parse(JSON.stringify(o));
const inr=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function read(k){try{const v=localStorage.getItem(k);return v?JSON.parse(v):null}catch(e){return null}}
function write(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}

let S=read(KEY)||clone(SEED);
if((S.settingsRev||0)<(SEED.settingsRev||0)){S.settings=Object.assign({},S.settings,SEED.settings);S.settingsRev=SEED.settingsRev;write(KEY,S)}
let cart=read(CART)||[];
const save=()=>write(KEY,S), saveCart=()=>write(CART,cart);
let unlocked=false; try{unlocked=sessionStorage.getItem('gl-admin')==='1'}catch(e){}

const f={q:'',cat:'all',make:'all'};
let draft=null, utrArmed=false, drawerStep='cart', lastOrder=null, adminTab='orders', orderFilter='all', openId=null, pdQty=1;

/* ---------- helpers ---------- */
const ICON={
  brakes:'<circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="5.5"/><circle cx="24" cy="13" r="1.3"/><circle cx="35" cy="24" r="1.3"/><circle cx="24" cy="35" r="1.3"/><circle cx="13" cy="24" r="1.3"/><path d="M35.5 9.5a20 20 0 0 1 6 11" stroke-width="5" stroke-linecap="round"/>',
  engine:'<path d="M20 4h8v5h-8z"/><path d="M18 9h12v7H18z"/><path d="M16 16h16v5H16z"/><path d="M19 21h10v11H19z"/><path d="M19 25h10M19 28h10"/><path d="M22 32h4v6h-4z"/><path d="M24 38v4h4"/>',
  filters:'<ellipse cx="24" cy="11" rx="12" ry="3.5"/><path d="M12 11v26c0 2 5.4 3.5 12 3.5s12-1.5 12-3.5V11"/><path d="M16 15v21M20 15.5v22M24 15.5v22.5M28 15.5v22M32 15v21"/>',
  electrical:'<rect x="7" y="15" width="34" height="24" rx="2"/><path d="M13 15v-4h7v4M28 15v-4h7v4"/><path d="M13 27h7M16.5 23.5v7M28 27h7"/>',
  suspension:'<path d="M24 3v7M24 38v7"/><path d="M15 10h18M15 38h18"/><path d="M16 14l16 4-16 4 16 4-16 4 16 4"/>',
  bike:'<circle cx="24" cy="24" r="15" stroke-width="5" stroke-dasharray="3.2 2.7"/><circle cx="24" cy="24" r="10"/><circle cx="24" cy="24" r="3.5"/><path d="M24 14v6.5M24 27.5V34M14 24h6.5M27.5 24H34"/>'
};
const art=p=>p.img?`<img class="photo" src="${esc(p.img)}" alt="" loading="lazy" onerror="this.nextElementSibling.hidden=false;this.remove()"><span class="art" hidden>${icon(p.cat)}</span>`:icon(p.cat);
const icon=c=>`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true">${ICON[c]||ICON.engine}</svg>`;
const chatIco='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 11.6a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1.4-4.4A8.5 8.5 0 1 1 20.5 11.6z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5" stroke-linecap="round"/></svg>';

const digits=v=>String(v||'').replace(/\D/g,'');
const normPhone=v=>{const d=digits(v);return d.length===10?'91'+d:d};
const showPhone=d=>{d=digits(d);return d.length===12&&d.startsWith('91')?`+91 ${d.slice(2,7)} ${d.slice(7)}`:'+'+d};
const wa=(num,text)=>`https://wa.me/${digits(num)}?text=${encodeURIComponent(text)}`;
const prod=id=>S.products.find(p=>p.id===id);
const SHARE=window.GEARLINE_SHARE||[];
const baseUrl=()=>location.origin+location.pathname.replace(/[^/]*$/,'');
const productUrl=id=>SHARE.includes(id)?baseUrl()+'p/'+id+'/':baseUrl()+'#p-'+id;
const enc=encodeURIComponent;
const upiQuery=o=>`pa=${enc(S.settings.upi)}&pn=${enc(S.settings.shop)}&am=${o.total.toFixed(2)}&cu=INR&tn=${enc('Order '+o.id)}`;
const fmtDate=t=>new Date(t).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});
function stockPill(p){
  if(p.stock<=0) return '<span class="pill bad">Out of stock</span>';
  if(p.stock<=5) return `<span class="pill warn">Only ${p.stock} left</span>`;
  return `<span class="pill good">${p.stock} in stock</span>`;
}
function toast(t){const el=$('#toast');el.textContent=t;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>el.hidden=true,2600)}
function copy(text,el){
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(()=>toast('Copied'),()=>selectFallback(el));
  } else selectFallback(el);
}
function selectFallback(el){if(!el)return;const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);toast('Text selected. Use your device’s Copy.')}

/* ---------- messages ---------- */
function productMsg(p,qty){
  return [`Hi ${S.settings.shop}, I'd like to buy this part:`,'',`*${p.name}*`,`Brand: ${p.brand}`,`Part no: ${p.part}`,`Fits: ${p.fits}`,`Qty: ${qty} × ${inr(p.price)} = *${inr(qty*p.price)}*`,'',`View part: ${productUrl(p.id)}`,'','Please confirm stock and send the UPI payment request here.'].join('\n');
}
function askMsg(p){
  return [`Hi ${S.settings.shop}, will this part fit my vehicle?`,'',`*${p.name}* (${p.brand})`,`Part no: ${p.part}`,`Link: ${productUrl(p.id)}`,'','My vehicle: '].join('\n');
}
function orderMsg(o){
  const L=[`*New order ${o.id}* · ${S.settings.shop}`,''];
  o.items.forEach((it,i)=>{L.push(`${i+1}. ${it.name}`,`   Part no: ${it.part}`,`   ${it.qty} × ${inr(it.price)} = ${inr(it.qty*it.price)}`);if(it.id)L.push(`   ${productUrl(it.id)}`)});
  L.push('',`Subtotal: ${inr(o.subtotal)}`,`Delivery: ${o.delivery?inr(o.delivery):'Free'}`,`*Total: ${inr(o.total)}*`,'',`Name: ${o.name}`,`Phone: ${showPhone(o.phone)}`,`Address: ${o.address}`);
  if(o.vehicle) L.push(`Vehicle: ${o.vehicle}`);
  if(o.pay==='cod') L.push('','Payment: Cash on delivery');
  else L.push('',`Payment: Paid ${inr(o.total)} by UPI to ${S.settings.upi}`,`UPI ref (UTR): ${o.utr||'not entered'}`,'Please verify the payment and confirm my order.');
  return L.join('\n');
}
function payMsg(o){
  return [`Hi ${o.name}, thanks for order *${o.id}* with ${S.settings.shop}.`,'',...o.items.map(it=>`• ${it.name} × ${it.qty}`),'',`Amount to pay: *${inr(o.total)}*`,`UPI ID: ${S.settings.upi}`,'','Pay with any UPI app and reply here with the payment screenshot. We dispatch as soon as it is confirmed.'].join('\n');
}

/* ---------- cart ---------- */
function lines(){return cart.map(c=>({p:prod(c.id),qty:c.qty})).filter(l=>l.p)}
function totals(){
  const sub=lines().reduce((a,l)=>a+l.p.price*l.qty,0);
  const del=sub===0||sub>=S.settings.freeAbove?0:Number(S.settings.delivery)||0;
  return {sub,del,total:sub+del,count:lines().reduce((a,l)=>a+l.qty,0)};
}
function addToCart(id,qty,silent){
  const p=prod(id); if(!p||p.stock<=0) return;
  const c=cart.find(x=>x.id===id);
  const have=c?c.qty:0, next=Math.min(p.stock,have+qty);
  if(next===have){toast(`Only ${p.stock} in stock`);return}
  if(c) c.qty=next; else cart.push({id,qty:next});
  saveCart(); syncCartUI(); if(!silent) toast(`${p.name} added to cart`);
}
function setQty(id,q){
  const p=prod(id), c=cart.find(x=>x.id===id); if(!c||!p) return;
  c.qty=Math.max(0,Math.min(p.stock,q));
  if(c.qty===0) cart=cart.filter(x=>x.id!==id);
  saveCart(); syncCartUI(); renderDrawer();
}
function syncCartUI(){
  const t=totals();
  $('#cartCount').textContent=t.count;
  $('#cbItems').textContent=`${t.count} item${t.count===1?'':'s'}`;
  $('#cbTotal').textContent=inr(t.total);
  $('#cartbar').hidden=!(t.count>0&&view==='shop');
}

/* ---------- shop ---------- */
function renderFilters(){
  const makes=[...new Set(S.products.flatMap(p=>p.makes))].sort();
  if(f.make!=='all'&&!makes.includes(f.make)) f.make='all';
  $('#make').innerHTML=`<option value="all">All vehicles</option>`+makes.map(m=>`<option${m===f.make?' selected':''}>${esc(m)}</option>`).join('');
  const counts={}; S.products.forEach(p=>counts[p.cat]=(counts[p.cat]||0)+1);
  $('#cats').innerHTML=[['all','All parts'],...Object.entries(CATS).filter(([k])=>counts[k])].map(([k,v])=>`<button class="chip" type="button" data-cat="${k}" aria-pressed="${f.cat===k}">${esc(v)}</button>`).join('');
}
function card(p){
  const off=p.mrp>p.price?Math.round((1-p.price/p.mrp)*100):0;
  return `<article class="card">
    <button class="card-hit" type="button" data-open="${p.id}" aria-label="View ${esc(p.name)}">
      <div class="thumb">${art(p)}<span class="pn">${esc(p.part)}</span>${off?`<span class="off">${off}% off</span>`:''}</div>
      <div class="body"><span class="mk">${esc(p.brand)}</span><h3>${esc(p.name)}</h3><span class="fits">Fits ${esc(p.fits)}</span></div>
    </button>
    <div class="foot">
      <div class="price"><b>${inr(p.price)}</b>${p.mrp>p.price?`<s>${inr(p.mrp)}</s>`:''}</div>
      <div>${stockPill(p)}</div>
      <div class="actions">
        <button class="btn primary" type="button" data-add="${p.id}" ${p.stock<=0?'disabled':''}>${p.stock<=0?'Sold out':'Add'}</button>
        <a class="btn wa" href="${wa(S.settings.wa,askMsg(p))}" target="_blank" rel="noopener" aria-label="Ask about ${esc(p.name)} on WhatsApp" title="Ask on WhatsApp">${chatIco}</a>
      </div>
    </div>
  </article>`;
}
function renderShop(){
  renderFilters();
  const q=f.q.trim().toLowerCase();
  const list=S.products.filter(p=>(f.cat==='all'||p.cat===f.cat)&&(f.make==='all'||p.makes.includes(f.make))&&(!q||[p.name,p.part,p.brand,p.fits].join(' ').toLowerCase().includes(q)));
  $('#resultCount').textContent=`${list.length} part${list.length===1?'':'s'}`+(f.make!=='all'?` for ${f.make}`:'');
  $('#grid').innerHTML=list.length?list.map(card).join(''):`<div class="empty"><b>No parts match those filters.</b><span>Try another vehicle or send us the part number on WhatsApp.</span><button class="btn ghost sm" type="button" data-clear>Clear filters</button></div>`;
}

/* ---------- product modal ---------- */
function renderProduct(){
  const p=prod(openId); if(!p) return;
  const off=p.mrp>p.price?p.mrp-p.price:0;
  pdQty=Math.max(1,Math.min(pdQty,Math.max(1,p.stock)));
  $('#pCat').textContent=CATS[p.cat]||'Part';
  $('#pBody').innerHTML=`<div class="pd">
    <div class="thumb">${art(p)}<span class="pn">${esc(p.part)}</span></div>
    <div class="pd-info">
      <span class="eyebrow" style="color:var(--muted)">${esc(p.brand)}</span>
      <h3 id="pTitle">${esc(p.name)}</h3>
      <div class="pd-pn">Part no. <code id="pnCode">${esc(p.part)}</code><button class="btn quiet sm" type="button" data-copy-pn>Copy</button><button class="btn quiet sm" type="button" data-share="${p.id}">Share link</button></div>
      <div class="price"><b>${inr(p.price)}</b>${off?`<s>MRP ${inr(p.mrp)}</s><span class="save">Save ${inr(off)}</span>`:''}</div>
      <div>${stockPill(p)}</div>
      <p>${esc(p.desc)}</p>
      <dl class="specs"><dt>Fits</dt><dd>${esc(p.fits)}</dd>${Object.entries(p.specs||{}).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      <div class="pd-buy">
        ${p.stock>0?`<div class="qty"><div class="step"><button type="button" data-pdq="-1" aria-label="Fewer" ${pdQty<=1?'disabled':''}>−</button><span class="num">${pdQty}</span><button type="button" data-pdq="1" aria-label="More" ${pdQty>=p.stock?'disabled':''}>+</button></div><b class="num" style="font-size:18px">${inr(p.price*pdQty)}</b></div>
        <div class="acts">
          <button class="btn ghost" type="button" data-add-pd="${p.id}">Add to cart</button>
          <button class="btn primary" type="button" data-buy="${p.id}">Buy now</button>
        </div>`:`<a class="btn wa block" href="${wa(S.settings.wa,`Hi ${S.settings.shop}, please tell me when this is back in stock:\n\n*${p.name}* (${p.brand})\nPart no: ${p.part}\n${productUrl(p.id)}`)}" target="_blank" rel="noopener">${chatIco}Ask for restock on WhatsApp</a>`}
        <p class="ask">Not sure it fits? <a href="${wa(S.settings.wa,askMsg(p))}" target="_blank" rel="noopener">Ask the counter on WhatsApp</a> with your vehicle model and year.</p>
      </div>
    </div>
  </div>`;
}
function openProduct(id,setHash){
  if(!prod(id)) return;
  if(openId!==id){openId=id;pdQty=1}
  renderProduct(); $('#pModal').hidden=false; $('#scrim').hidden=false; document.body.classList.add('locked');
  if(setHash!==false&&location.hash!=='#p-'+id) location.hash='p-'+id;
}
function closeProduct(){
  openId=null; $('#pModal').hidden=true; closeScrimIfIdle();
  if(location.hash.startsWith('#p-')) location.hash='shop';
}

/* ---------- drawer ---------- */
function openDrawer(){
  if(drawerStep==='done'&&!lastOrder) drawerStep='cart';
  renderDrawer(); $('#drawer').hidden=false; $('#scrim').hidden=false; document.body.classList.add('locked');
}
function closeDrawer(){
  $('#drawer').hidden=true;
  if(drawerStep==='done'){drawerStep='cart';lastOrder=null}
  closeScrimIfIdle();
}
function closeScrimIfIdle(){
  if($('#drawer').hidden&&$('#pModal').hidden&&$('#fModal').hidden){$('#scrim').hidden=true;document.body.classList.remove('locked')}
}
function totalsHTML(t){
  return `<div class="totals"><div><span>Subtotal</span><span class="num">${inr(t.sub)}</span></div><div><span>Delivery</span><span class="num">${t.del?inr(t.del):'Free'}</span></div><div class="grand"><span>Total</span><span class="num">${inr(t.total)}</span></div></div>`;
}
function renderDrawer(){
  const body=$('#dBody'), foot=$('#dFoot'), t=totals(), L=lines();
  if(drawerStep==='cart'){
    $('#dTitle').textContent='Your cart';
    if(!L.length){
      body.innerHTML=`<div class="empty" style="border:0"><b>Your cart is empty.</b><span>Add parts from the shop, or send a part number straight to us on WhatsApp.</span></div>`;
      foot.innerHTML=`<button class="btn ghost block" type="button" data-close>Browse parts</button>`; return;
    }
    body.innerHTML=L.map(({p,qty})=>`<div class="line"><div class="ic">${art(p)}</div><div><h4>${esc(p.name)}</h4><span class="pn">${esc(p.part)} · ${esc(p.brand)}</span>
      <div class="row"><div class="step"><button type="button" data-q="${p.id}" data-d="-1" aria-label="Fewer">−</button><span class="num">${qty}</span><button type="button" data-q="${p.id}" data-d="1" aria-label="More" ${qty>=p.stock?'disabled':''}>+</button></div><b class="num">${inr(p.price*qty)}</b></div></div></div>`).join('');
    const gap=S.settings.freeAbove-t.sub;
    foot.innerHTML=totalsHTML(t)+(t.del?`<p class="note">Add ${inr(gap)} more for free delivery.</p>`:`<p class="note ok">Free delivery on this order.</p>`)+`<button class="btn primary block" type="button" data-checkout>Continue to delivery details</button>`;
  } else if(drawerStep==='details'){
    $('#dTitle').textContent='Delivery details';
    const d=read('gearline-cust')||{};
    body.innerHTML=`<form class="form" id="coForm" novalidate>
      <label>Full name<input id="c_name" autocomplete="name" value="${esc(d.name)}" placeholder="Ravi Kumar"></label>
      <label>WhatsApp number<input id="c_phone" type="tel" inputmode="tel" autocomplete="tel" value="${esc(d.phone)}" placeholder="98765 43210"></label>
      <label>Delivery address<textarea id="c_addr" rows="3" autocomplete="street-address" placeholder="House, street, area, city, PIN">${esc(d.address)}</textarea></label>
      <label>Vehicle <span class="opt">optional, helps us check fitment</span><input id="c_veh" value="${esc(d.vehicle)}" placeholder="Swift VXi 2020"></label>
      <div class="radio" role="radiogroup" aria-label="Payment">
        <label><input type="radio" name="pay" value="upi" checked><span>Pay now by UPI<small>GPay, PhonePe, Paytm or any UPI app. You can also scan a QR code.</small></span></label>
        <label><input type="radio" name="pay" value="cod"><span>Cash on delivery<small>Pay the delivery partner in cash or UPI when the parts arrive.</small></span></label>
      </div>
      <p class="err" id="coErr" hidden></p>
    </form>`;
    foot.innerHTML=totalsHTML(t)+`<div class="co-acts"><button class="btn ghost" type="button" data-back>Back</button><button class="btn primary" type="button" data-confirm id="coBtn">Continue to UPI payment</button></div>`;
  } else if(drawerStep==='pay'&&draft){
    const o=draft, q=upiQuery(o);
    $('#dTitle').textContent='Pay by UPI';
    body.innerHTML=`<div class="pay-amt"><span>Amount to pay</span><b class="num">${inr(o.total)}</b><small>to ${esc(S.settings.shop)} · Order ${o.id}</small></div>
      <a class="btn primary block lg" href="upi://pay?${q}">Pay ${inr(o.total)} with any UPI app</a>
      <div class="upi-apps" aria-label="Open a specific app"><a class="btn ghost sm" href="tez://upi/pay?${q}">GPay</a><a class="btn ghost sm" href="phonepe://pay?${q}">PhonePe</a><a class="btn ghost sm" href="paytmmp://pay?${q}">Paytm</a></div>
      <div class="qr-box" id="qrBox"><div class="qr" id="qr"></div><div><b>Paying from another phone?</b><span>Scan this QR code with any UPI app. The amount fills in by itself.</span></div></div>
      <div class="seller"><span>UPI ID</span><b id="upiId">${esc(S.settings.upi)}</b><button class="btn quiet sm" type="button" data-copy-upi>Copy</button></div>
      <form class="form" id="utrForm" novalidate><label>UPI transaction ID (UTR) <span class="opt">12 digits, shown in your UPI app after paying</span><input id="c_utr" inputmode="numeric" autocomplete="off" maxlength="22" placeholder="e.g. 430912874561"></label><p class="err" id="utrErr" hidden></p></form>`;
    foot.innerHTML=`<p class="note">After paying, enter the UTR and send your order. We check the payment before dispatch.</p><div class="co-acts"><button class="btn ghost" type="button" data-back-details>Back</button><button class="btn wa" type="button" data-paid>${chatIco}I’ve paid · Send order</button></div>`;
    renderQR('upi://pay?'+q);
  } else if(drawerStep==='done'&&lastOrder){
    const o=lastOrder, msg=orderMsg(o);
    $('#dTitle').textContent='Send your order';
    body.innerHTML=`<div class="done-head"><span class="oid">Order ${o.id} · ${inr(o.total)}</span><h3>Last step: press send in WhatsApp</h3><p class="note">WhatsApp opens with this message filled in. Press send there. Your order is confirmed once the seller replies. If WhatsApp didn’t open, use the button below.</p></div>
      <pre class="msg" id="orderMsg">${esc(msg)}</pre>
      <div class="seller"><span>Seller’s WhatsApp</span><b>${showPhone(S.settings.wa)}</b></div>
      <p class="note">If WhatsApp doesn’t open, copy the message and send it to the number above.</p>`;
    foot.innerHTML=`<a class="btn wa block" href="${wa(S.settings.wa,msg)}" target="_blank" rel="noopener">${chatIco}Open WhatsApp to send</a><div class="done-acts"><button class="btn ghost" type="button" data-copy-order>Copy message</button><button class="btn ghost" type="button" data-close>Back to shop</button></div>`;
  }
}
function renderQR(text){
  const el=$('#qr'); if(!el) return;
  if(window.QRCode){try{new QRCode(el,{text,width:148,height:148,colorDark:'#111111',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});return}catch(e){}}
  $('#qrBox').hidden=true;
}
function confirmOrder(){
  const name=$('#c_name').value.trim(), phone=normPhone($('#c_phone').value), address=$('#c_addr').value.trim(), vehicle=$('#c_veh').value.trim();
  const pay=($('input[name="pay"]:checked')||{}).value||'upi', err=$('#coErr');
  const problems=[];
  if(!name) problems.push('your name');
  if(phone.length<11||phone.length>13) problems.push('a 10-digit WhatsApp number');
  if(address.length<8) problems.push('a full delivery address');
  if(problems.length){err.textContent='Please add '+problems.join(', ')+'.';err.hidden=false;return}
  write('gearline-cust',{name,phone,address,vehicle});
  const L=lines(), t=totals();
  draft={id:'GL-'+S.seq,date:Date.now(),name,phone,address,vehicle,pay,items:L.map(l=>({id:l.p.id,name:l.p.name,part:l.p.part,price:l.p.price,qty:l.qty})),subtotal:t.sub,delivery:t.del,total:t.total,status:pay==='upi'?'verify':'cod'};
  if(pay==='upi'){utrArmed=false;drawerStep='pay';renderDrawer();$('#dBody').scrollTop=0;return}
  placeOrder('');
}
function sendPaid(){
  const utr=digits($('#c_utr').value), err=$('#utrErr');
  if(utr&&utr.length!==12){err.textContent='A UPI transaction ID (UTR) has 12 digits. Check it in your UPI app’s payment details.';err.hidden=false;return}
  if(!utr&&!utrArmed){utrArmed=true;err.textContent='Add the 12-digit UTR so we can match your payment, or tap “I’ve paid” again to send without it.';err.hidden=false;return}
  placeOrder(utr);
}
function placeOrder(utr){
  const o=draft; if(!o) return;
  o.id='GL-'+(S.seq++); o.date=Date.now(); if(o.pay==='upi') o.utr=utr;
  lines().forEach(l=>l.p.stock=Math.max(0,l.p.stock-l.qty));
  S.orders.unshift(o); save();
  cart=[]; saveCart(); lastOrder=o; draft=null; drawerStep='done';
  renderDrawer(); renderShop(); syncCartUI(); if(unlocked) renderAdmin();
  const w=window.open(wa(S.settings.wa,orderMsg(o)),'_blank');
  if(w){try{w.opener=null}catch(e){}}
  else toast('Tap “Open WhatsApp to send” to finish');
}

/* ---------- theme ---------- */
const THEMES=['system','light','dark'], THEME_NAME={system:'Match device',light:'Light',dark:'Dark'};
const THEME_ICON={
  system:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg>',
  light:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  dark:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>'
};
let theme='system'; try{theme=localStorage.getItem('gearline-theme')||'system'}catch(e){}
function applyTheme(t){
  theme=THEMES.includes(t)?t:'system';
  const r=document.documentElement;
  if(theme==='system') r.removeAttribute('data-theme'); else r.setAttribute('data-theme',theme);
  try{localStorage.setItem('gearline-theme',theme)}catch(e){}
  const b=$('#themeBtn'); b.innerHTML=THEME_ICON[theme]; b.setAttribute('aria-label',`Theme: ${THEME_NAME[theme]}. Tap to change.`); b.title=`Theme: ${THEME_NAME[theme]}`;
}
applyTheme(theme);

/* ---------- admin ---------- */
function renderAdmin(){
  $('#gate').hidden=unlocked; $('#console').hidden=!unlocked;
  if(!unlocked) return;
  $('#adminShop').textContent=S.settings.shop;
  const O=S.orders, await_=O.filter(o=>o.status==='awaiting'||o.status==='verify'), paid=O.filter(o=>['paid','shipped','delivered'].includes(o.status));
  const low=S.products.filter(p=>p.stock<=5);
  $('#stats').innerHTML=`
    <div class="stat ${await_.length?'alert':''}"><span>Payments to verify</span><b>${await_.length}</b><small class="num">${inr(await_.reduce((a,o)=>a+o.total,0))} to collect</small></div>
    <div class="stat"><span>Collected</span><b>${inr(paid.reduce((a,o)=>a+o.total,0))}</b><small>${paid.length} paid order${paid.length===1?'':'s'}</small></div>
    <div class="stat"><span>Parts listed</span><b>${S.products.length}</b><small>${S.products.filter(p=>p.stock>0).length} in stock</small></div>
    <div class="stat ${low.length?'alert':''}"><span>Low stock</span><b>${low.length}</b><small>5 or fewer left</small></div>`;
  $('#nOrders').textContent=O.length; $('#nProducts').textContent=S.products.length;
  $$('.tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===adminTab));
  ['orders','products','settings'].forEach(k=>$('#tab-'+k).hidden=k!==adminTab);
  if(adminTab==='orders') renderOrders(); else if(adminTab==='products') renderProducts(); else renderSettings();
}
function renderOrders(){
  const O=S.orders.filter(o=>orderFilter==='all'||o.status===orderFilter);
  const counts={}; S.orders.forEach(o=>counts[o.status]=(counts[o.status]||0)+1);
  const chips=[['all','All',S.orders.length],...Object.entries(STATUS).filter(([k])=>counts[k]).map(([k,v])=>[k,v[0],counts[k]])];
  $('#tab-orders').innerHTML=`<div class="chips">${chips.map(([k,l,n])=>`<button class="chip" type="button" data-of="${k}" aria-pressed="${orderFilter===k}">${l} <span class="num">${n}</span></button>`).join('')}</div>
  <div class="orders">${O.length?O.map(orderCard).join(''):`<div class="empty"><b>No orders here yet.</b><span>Orders placed from the storefront appear in this list.</span></div>`}</div>`;
}
function orderCard(o){
  const [lbl,cls]=STATUS[o.status]||STATUS.awaiting;
  return `<article class="order">
    <header><span class="oid">${o.id}</span><span class="date">${fmtDate(o.date)}</span>${o.sample?'<span class="tag">Sample</span>':''}<span class="pill ${cls}">${lbl}</span></header>
    <div class="o-grid">
      <div class="o-cust"><b>${esc(o.name)}</b><span class="num">${showPhone(o.phone)}</span><span>${esc(o.address)}</span>${o.vehicle?`<span>Vehicle: ${esc(o.vehicle)}</span>`:''}</div>
      <ul class="o-items">${o.items.map(it=>`<li><div>${esc(it.name)} × ${it.qty}<br><span class="pn">${esc(it.part)}</span></div><b>${inr(it.price*it.qty)}</b></li>`).join('')}${o.delivery?`<li><div>Delivery</div><b>${inr(o.delivery)}</b></li>`:''}</ul>
    </div>
    <footer>
      <div class="o-total"><b>${inr(o.total)}</b><small>${o.pay==='cod'?'Cash on delivery':`UPI · ${o.utr?'UTR '+esc(o.utr):'no UTR entered'}`}</small></div>
      <select class="status-sel" data-status="${o.id}" aria-label="Order status for ${o.id}">${Object.entries(STATUS).map(([k,v])=>`<option value="${k}"${k===o.status?' selected':''}>${v[0]}</option>`).join('')}</select>
      ${(o.status==='verify'||o.status==='awaiting')?`<button class="btn primary sm" type="button" data-markpaid="${o.id}">Mark as paid</button>`:''}
      <a class="btn ghost sm" href="${wa(o.phone,`Hi ${o.name}, this is ${S.settings.shop} about your order ${o.id}. `)}" target="_blank" rel="noopener">Message customer</a>
    </footer>
  </article>`;
}
function renderProducts(){
  $('#tab-products').innerHTML=`<div class="panel-top"><p class="note">Stock drops automatically when a customer confirms an order.</p><button class="btn primary sm" type="button" data-new>+ Add part</button></div>
  <div class="tbl-wrap"><table><thead><tr><th>Part</th><th>Category</th><th class="r">Price</th><th class="r">MRP</th><th>Stock</th><th class="r">Actions</th></tr></thead><tbody>
  ${S.products.map(p=>`<tr><td><div class="p-cell"><div class="ic">${art(p)}</div><div><b>${esc(p.name)}</b><br><span class="pn">${esc(p.part)} · ${esc(p.brand)}</span></div></div></td>
    <td data-l="Category">${esc(CATS[p.cat]||p.cat)}</td><td class="r" data-l="Price">${inr(p.price)}</td><td class="r" data-l="MRP">${p.mrp?inr(p.mrp):'—'}</td>
    <td data-l="Stock"><div style="display:flex;align-items:center;gap:8px"><div class="step"><button type="button" data-stock="${p.id}" data-d="-1" aria-label="Decrease stock" ${p.stock<=0?'disabled':''}>−</button><span class="num">${p.stock}</span><button type="button" data-stock="${p.id}" data-d="1" aria-label="Increase stock">+</button></div>${p.stock<=0?'<span class="pill bad">Out</span>':p.stock<=5?'<span class="pill warn">Low</span>':''}</div></td>
    <td class="acts-cell"><div class="row-acts"><button class="btn ghost sm" type="button" data-edit="${p.id}">Edit</button><button class="btn danger sm" type="button" data-del="${p.id}">Delete</button></div></td></tr>`).join('')}
  </tbody></table></div>`;
}
function renderSettings(){
  const s=S.settings;
  $('#tab-settings').innerHTML=`<form class="sets form" id="setForm" novalidate>
    <div><h3>Shop and WhatsApp</h3><p class="note">Customer orders and enquiries go to this WhatsApp number. Use the number with country code.</p></div>
    <label>Shop name<input id="s_shop" value="${esc(s.shop)}"></label>
    <div class="two"><label>Seller WhatsApp number<input id="s_wa" type="tel" inputmode="tel" value="${esc(s.wa)}" placeholder="919876543210"></label>
    <label>UPI ID customers pay to<input id="s_upi" value="${esc(s.upi)}" placeholder="yourshop@okaxis"></label></div>
    <div class="two"><label>Delivery charge (₹)<input id="s_del" type="number" min="0" value="${s.delivery}"></label>
    <label>Free delivery above (₹)<input id="s_free" type="number" min="0" value="${s.freeAbove}"></label></div>
    <p class="err" id="sErr" hidden></p>
    <div><button class="btn primary" type="submit">Save settings</button></div>
    <div class="danger-zone"><h3>Reset demo</h3><p class="note">Restores the 12 sample parts and 3 sample orders, and clears orders placed in this browser.</p><div><button class="btn danger sm" type="button" data-reset>Reset demo data</button></div></div>
  </form>`;
}
function openForm(id){
  const p=id?prod(id):null;
  $('#fTitle').textContent=p?'Edit part':'Add part';
  $('#f_cat').innerHTML=Object.entries(CATS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
  $('#f_id').value=p?p.id:''; $('#f_name').value=p?p.name:''; $('#f_part').value=p?p.part:''; $('#f_brand').value=p?p.brand:'';
  $('#f_cat').value=p?p.cat:'brakes'; $('#f_makes').value=p?p.makes.join(', '):''; $('#f_fits').value=p?p.fits:'';
  $('#f_price').value=p?p.price:''; $('#f_mrp').value=p?p.mrp:''; $('#f_stock').value=p?p.stock:10; $('#f_desc').value=p?p.desc:''; $('#f_img').value=p&&p.img?p.img:'';
  $('#f_specs').value=p?Object.entries(p.specs||{}).map(([k,v])=>`${k}: ${v}`).join('\n'):'';
  $('#fErr').hidden=true; $('#fModal').hidden=false; $('#scrim').hidden=false; document.body.classList.add('locked');
  setTimeout(()=>$('#f_name').focus(),50);
}
function closeForm(){$('#fModal').hidden=true;closeScrimIfIdle()}
function saveForm(e){
  e.preventDefault();
  const name=$('#f_name').value.trim(), part=$('#f_part').value.trim(), price=Number($('#f_price').value), mrp=Number($('#f_mrp').value)||0, stock=Math.max(0,parseInt($('#f_stock').value,10)||0);
  const err=$('#fErr');
  if(!name||!part||!(price>0)){err.textContent='Add a part name, a part number and a price above ₹0.';err.hidden=false;return}
  const specs={}; $('#f_specs').value.split('\n').forEach(l=>{const i=l.indexOf(':');if(i>0){const k=l.slice(0,i).trim(),v=l.slice(i+1).trim();if(k&&v)specs[k]=v}});
  const data={name,part,brand:$('#f_brand').value.trim()||'Unbranded',cat:$('#f_cat').value,makes:$('#f_makes').value.split(',').map(s=>s.trim()).filter(Boolean),fits:$('#f_fits').value.trim()||'Ask for fitment',price,mrp,stock,desc:$('#f_desc').value.trim(),img:$('#f_img').value.trim(),specs};
  const id=$('#f_id').value;
  if(id){Object.assign(prod(id),data);toast('Part updated')}
  else{S.products.unshift({id:'p'+Date.now().toString(36),...data});toast('Part added to the storefront')}
  save(); closeForm(); renderAdmin(); renderShop();
}

/* ---------- routing ---------- */
let view='shop';
function route(){
  const h=location.hash.slice(1);
  view=h==='admin'?'admin':'shop';
  $('#shopView').hidden=view!=='shop'; $('#adminView').hidden=view!=='admin';
  $('#navShop').toggleAttribute('aria-current',false); $('#navAdmin').toggleAttribute('aria-current',false);
  (view==='admin'?$('#navAdmin'):$('#navShop')).setAttribute('aria-current','page');
  $('#shopName').textContent=S.settings.shop; $('#footShop').textContent=S.settings.shop;
  $('#footWa').textContent=showPhone(S.settings.wa); $('#footWaLink').href=wa(S.settings.wa,`Hi ${S.settings.shop}, I need help finding a part.\n\nVehicle: \nPart needed: `);
  if(view==='admin'){if(!$('#drawer').hidden)closeDrawer();renderAdmin()}
  if(h.startsWith('p-')&&prod(h.slice(2))) openProduct(h.slice(2),false);
  else if(!$('#pModal').hidden){openId=null;$('#pModal').hidden=true;closeScrimIfIdle()}
  syncCartUI();
}

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('button,a,[data-open]'); if(!t) { if(e.target.id==='scrim'||e.target.classList.contains('modal')) closeAll(); return }
  const d=t.dataset;
  if(d.open){openProduct(d.open);return}
  if(d.add){addToCart(d.add,1);renderShop();return}
  if(d.addPd){addToCart(d.addPd,pdQty);return}
  if(d.pdq){pdQty+=Number(d.pdq);renderProduct();return}
  if(d.copyPn!==undefined){copy(prod(openId).part,$('#pnCode'));return}
  if(d.share){const p=prod(d.share),url=productUrl(p.id);
    if(navigator.share){navigator.share({title:p.name,text:`${p.name} (${p.part}) · ${inr(p.price)} at ${S.settings.shop}`,url}).catch(()=>{})}
    else if(navigator.clipboard){navigator.clipboard.writeText(url).then(()=>toast('Product link copied'),()=>toast(url))}
    else toast(url);
    return}
  if(d.cat){f.cat=d.cat;renderShop();return}
  if(d.clear!==undefined){f.q='';f.cat='all';f.make='all';$('#q').value='';renderShop();return}
  if(t.id==='cartBtn'||d.openCart!==undefined){openDrawer();return}
  if(d.close!==undefined){
    if(t.closest('#drawer')) closeDrawer(); else if(t.closest('#pModal')) closeProduct(); else if(t.closest('#fModal')) closeForm();
    return;
  }
  if(d.q){const c=cart.find(x=>x.id===d.q);setQty(d.q,(c?c.qty:0)+Number(d.d));return}
  if(d.checkout!==undefined){drawerStep='details';renderDrawer();return}
  if(d.back!==undefined){drawerStep='cart';renderDrawer();return}
  if(d.confirm!==undefined){confirmOrder();return}
  if(d.paid!==undefined){sendPaid();return}
  if(d.backDetails!==undefined){drawerStep='details';renderDrawer();return}
  if(d.copyUpi!==undefined){copy(S.settings.upi,$('#upiId'));return}
  if(d.buy){if(!cart.find(c=>c.id===d.buy))addToCart(d.buy,pdQty,true);closeProduct();drawerStep='details';openDrawer();return}
  if(d.markpaid){const o=S.orders.find(x=>x.id===d.markpaid);o.status='paid';save();renderAdmin();toast(`${o.id} marked paid`);return}
  if(t.id==='themeBtn'){applyTheme(THEMES[(THEMES.indexOf(theme)+1)%3]);toast(`Theme: ${THEME_NAME[theme]}`);return}
  if(d.copyOrder!==undefined){copy(orderMsg(lastOrder),$('#orderMsg'));return}
  if(d.tab){adminTab=d.tab;renderAdmin();return}
  if(d.of){orderFilter=d.of;renderOrders();return}
  if(d.new!==undefined){openForm(null);return}
  if(d.edit){openForm(d.edit);return}
  if(d.stock){const p=prod(d.stock);p.stock=Math.max(0,p.stock+Number(d.d));save();renderAdmin();renderShop();return}
  if(d.del){
    if(t.dataset.armed){S.products=S.products.filter(p=>p.id!==d.del);cart=cart.filter(c=>c.id!==d.del);save();saveCart();syncCartUI();renderAdmin();renderShop();toast('Part removed');return}
    t.dataset.armed='1';t.textContent='Confirm delete';setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.textContent='Delete'}},3500);return;
  }
  if(d.reset!==undefined){
    if(t.dataset.armed){S=clone(SEED);S.orders.forEach((o,i)=>o.date=Date.now()-([0.2,1.1,2.4][i]||i)*DAY);save();cart=[];saveCart();orderFilter='all';syncCartUI();renderAdmin();renderShop();route();toast('Demo data restored');return}
    t.dataset.armed='1';t.textContent='Tap again to reset';setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.textContent='Reset demo data'}},3500);return;
  }
  if(t.id==='lockBtn'){unlocked=false;try{sessionStorage.removeItem('gl-admin')}catch(e){}renderAdmin();return}
});
document.addEventListener('change',e=>{
  if(e.target.name==='pay'){const b=$('#coBtn');if(b){const cod=e.target.value==='cod';b.className='btn '+(cod?'wa':'primary');b.innerHTML=cod?chatIco+'Place order on WhatsApp':'Continue to UPI payment'}}
  if(e.target.id==='c_utr'){utrArmed=false}
  if(e.target.id==='make'){f.make=e.target.value;renderShop()}
  if(e.target.dataset.status){const o=S.orders.find(x=>x.id===e.target.dataset.status);o.status=e.target.value;save();renderAdmin();toast(`${o.id} marked ${STATUS[o.status][0].toLowerCase()}`)}
});
$('#q').addEventListener('input',e=>{f.q=e.target.value;renderShop()});
$('#gate').addEventListener('submit',e=>{
  e.preventDefault();
  if($('#pin').value.trim()==='1234'){unlocked=true;try{sessionStorage.setItem('gl-admin','1')}catch(err){}$('#pin').value='';$('#pinErr').hidden=true;renderAdmin()}
  else $('#pinErr').hidden=false;
});
$('#pForm').addEventListener('submit',saveForm);
document.addEventListener('submit',e=>{
  if(e.target.id==='setForm'){
    e.preventDefault();
    const num=normPhone($('#s_wa').value), err=$('#sErr');
    if(num.length<11||num.length>15){err.textContent='Enter the WhatsApp number with country code, for example 919876543210.';err.hidden=false;return}
    Object.assign(S.settings,{shop:$('#s_shop').value.trim()||'Gearline Spares',wa:num,upi:$('#s_upi').value.trim(),delivery:Math.max(0,Number($('#s_del').value)||0),freeAbove:Math.max(0,Number($('#s_free').value)||0)});
    save(); route(); renderAdmin(); renderShop(); syncCartUI(); toast('Settings saved');
  }
  if(e.target.id==='coForm'){e.preventDefault();confirmOrder()}
});
function closeAll(){if(!$('#fModal').hidden)closeForm();else if(!$('#pModal').hidden)closeProduct();else if(!$('#drawer').hidden)closeDrawer()}
$('#scrim').addEventListener('click',closeAll);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});
window.addEventListener('hashchange',route);

renderShop(); route();
if('serviceWorker' in navigator&&location.protocol==='https:'){addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
})();
