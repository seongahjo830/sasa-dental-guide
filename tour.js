/* ===== 덴트웹 차트 데모 · 온보딩 가이드 투어 엔진 (공용·무의존) =====
   - 첫 방문(또는 ?tour=1 / #tour)에 자동 시작 · localStorage로 1회만 자동
   - 우상단 "둘러보기 다시보기" 버튼으로 언제든 재생
   - ⭐ 다음/이전/완료 버튼은 '화면 하단 고정 바'에 항상 같은 자리 → 연타로 넘기기 가능
     (읽고 싶으면 말풍선 읽고 같은 자리 클릭 / Enter·→ 로도 진행)
   step: { el:'CSS선택자' 또는 ()=>Element, kick, title, body, place:'auto|top|bottom|left|right',
           tryText, advanceOnClick:true, before:fn, pad:px }
*/
(function(){
  if(window.__dentTour) return;
  var T = window.__dentTour = {};
  var active=false, steps=[], idx=0, cfg=null, cleanups=[];

  function $(sel){ try{ return typeof sel==='function'? sel() : document.querySelector(sel);}catch(e){return null;} }
  function el(tag,cls,html){ var d=document.createElement(tag); if(cls)d.className=cls; if(html!=null)d.innerHTML=html; return d; }
  function lsKey(id){ return 'dentTour:'+id; }

  /* ---------- 환영 / 완료 모달 ---------- */
  function modal(opts, onGo, onSkip){
    var scrim=el('div','dt-scrim');
    var bullets=(opts.bullets||[]).map(function(b,i){
      return '<div class="li"><span class="n">'+(i+1)+'</span><span>'+b+'</span></div>'; }).join('');
    scrim.innerHTML='<div class="dt-card" role="dialog" aria-modal="true">'+
      '<div class="dt-emoji">'+(opts.emoji||'🧭')+'</div>'+
      '<h3>'+(opts.title||'둘러보기')+'</h3>'+
      (opts.lead?'<p class="lead">'+opts.lead+'</p>':'')+
      (bullets?'<div class="dt-list">'+bullets+'</div>':'')+
      '<div class="dt-cta"><button class="go">'+(opts.cta||'확인')+'</button>'+
      (onSkip?'<button class="no">'+(opts.skip||'그냥 둘러볼게요')+'</button>':'')+'</div></div>';
    document.body.appendChild(scrim);
    requestAnimationFrame(function(){ scrim.classList.add('in'); });
    function close(cb){ document.removeEventListener('keydown',mk,true); scrim.classList.remove('in'); setTimeout(function(){ scrim.remove(); cb&&cb(); },300); }
    function mk(e){ if(e.key==='Enter'||e.key==='ArrowRight'){ e.preventDefault(); e.stopPropagation(); close(onGo); }
                    else if(e.key==='Escape' && onSkip){ e.preventDefault(); close(onSkip); } }
    document.addEventListener('keydown',mk,true);
    scrim.querySelector('.go').onclick=function(){ close(onGo); };
    var no=scrim.querySelector('.no'); if(no) no.onclick=function(){ close(onSkip); };
  }

  /* ---------- 투어 레이어 ---------- */
  var mask,spot,ring,pop,beacon,bar;
  function buildLayer(){
    mask=el('div','dt-mask'); spot=el('div','dt-spot'); ring=el('div','dt-ring');
    mask.appendChild(spot); document.body.appendChild(mask); document.body.appendChild(ring);
    pop=el('div','dt-pop'); document.body.appendChild(pop);
    beacon=el('div','dt-beacon'); beacon.style.display='none'; document.body.appendChild(beacon);
    bar=el('div','dt-bar'); document.body.appendChild(bar);            // 항상 같은 자리 컨트롤
  }
  function destroyLayer(){
    [mask,ring,pop,beacon,bar].forEach(function(n){ n&&n.remove(); });
    mask=spot=ring=pop=beacon=bar=null;
    cleanups.forEach(function(f){ try{f();}catch(e){} }); cleanups=[];
    active=false;
    window.removeEventListener('keydown',onKey);
  }

  /* 하단 고정 바 — 다음 버튼은 항상 오른쪽 같은 위치 */
  function updateBar(){
    var dots=steps.map(function(_,i){ return '<i class="'+(i===idx?'on':'')+'"></i>'; }).join('');
    bar.innerHTML='<button class="dt-b prev'+(idx===0?' off':'')+'">이전</button>'+
      '<div class="dt-mid"><div class="dt-dots">'+dots+'</div><span class="dt-step">'+(idx+1)+' / '+steps.length+'</span></div>'+
      '<button class="dt-b next">'+(idx===steps.length-1?'완료 ✓':'다음 →')+'</button>';
    bar.querySelector('.next').onclick=function(){ go(1); };
    bar.querySelector('.prev').onclick=function(){ if(idx>0) go(-1); };
  }

  function render(){
    var s=steps[idx], myIdx=idx; if(!s){ done(); return; }
    var target = s.el? $(s.el) : null;
    var pad = s.pad!=null? s.pad : 8;

    pop.innerHTML='<button class="dt-skip" aria-label="닫기">×</button>'+
      (s.kick?'<span class="dt-kick">'+s.kick+'</span>':'')+
      '<h4>'+(s.title||'')+'</h4>'+
      (s.body?'<p>'+s.body+'</p>':'')+
      (s.tryText?'<div class="dt-try"><span>'+s.tryText+'</span><span class="h">👆</span></div>':'');
    var arrow=el('div','dt-arrow'); pop.appendChild(arrow); pop._arrow=arrow;
    pop.querySelector('.dt-skip').onclick=function(){ done(true); };

    updateBar();

    if(target && s.advanceOnClick){
      var handler=function(){ setTimeout(function(){ if(active) go(1); },260); };
      target.addEventListener('click',handler,{once:true});
      cleanups.push(function(){ target.removeEventListener('click',handler); });
    }

    if(target && s.scroll!==false){ target.scrollIntoView({behavior:'smooth',block:'center'}); }
    pop.classList.remove('in');
    setTimeout(function(){ position(target,pad,s.place||'auto'); pop.classList.add('in'); }, target&&s.scroll!==false?180:0);
    [120,300,560,900].forEach(function(ms){
      setTimeout(function(){ if(active && idx===myIdx) position($(s.el),pad,s.place||'auto'); }, ms);
    });
  }

  function position(target,pad,place){
    if(!spot) return;
    if(!target){ // 타깃 없음 → 화면 중앙 위쪽
      spot.style.width=spot.style.height='0'; spot.style.left='50%'; spot.style.top='50%';
      ring.style.display='none'; beacon.style.display='none'; pop._arrow.style.display='none';
      pop.style.left=(innerWidth/2-pop.offsetWidth/2)+'px';
      pop.style.top=Math.max(20,innerHeight*0.28-pop.offsetHeight/2)+'px';
      return;
    }
    var r=target.getBoundingClientRect();
    var x=r.left-pad, y=r.top-pad, w=r.width+pad*2, h=r.height+pad*2;
    spot.style.left=x+'px'; spot.style.top=y+'px'; spot.style.width=w+'px'; spot.style.height=h+'px';
    ring.style.display='block'; ring.style.left=(x-2)+'px'; ring.style.top=(y-2)+'px';
    ring.style.width=(w+4)+'px'; ring.style.height=(h+4)+'px';

    var pw=pop.offsetWidth, ph=pop.offsetHeight, gap=16, m=10, barGuard=92; // 하단 바 영역 피하기
    var pl=place;
    if(pl==='auto'){
      if(innerHeight-r.bottom > ph+gap+m+barGuard) pl='bottom';
      else if(r.top > ph+gap+m) pl='top';
      else if(innerWidth-r.right > pw+gap+m) pl='right';
      else if(r.left > pw+gap+m) pl='left';
      else pl='top';
    }
    var px,py, arr=pop._arrow; arr.style.display='block';
    if(pl==='bottom'||pl==='top'){
      px=r.left+r.width/2-pw/2;
      py= pl==='bottom'? y+h+gap : y-ph-gap;
      px=Math.max(m,Math.min(px,innerWidth-pw-m));
      var ax=r.left+r.width/2-px-7.5; ax=Math.max(14,Math.min(ax,pw-30));
      arr.style.left=ax+'px'; arr.style.right='';
      if(pl==='bottom'){ arr.style.top='-7px'; arr.style.bottom=''; } else { arr.style.bottom='-7px'; arr.style.top=''; }
    } else {
      py=r.top+r.height/2-ph/2;
      px= pl==='right'? x+w+gap : x-pw-gap;
      py=Math.max(m,Math.min(py,innerHeight-ph-m-barGuard));
      var ay=r.top+r.height/2-py-7.5; ay=Math.max(14,Math.min(ay,ph-30));
      arr.style.top=ay+'px'; arr.style.bottom='';
      if(pl==='right'){ arr.style.left='-7px'; arr.style.right=''; } else { arr.style.right='-7px'; arr.style.left=''; }
    }
    px=Math.max(m,Math.min(px,innerWidth-pw-m));
    py=Math.max(m,Math.min(py,innerHeight-ph-m));
    pop.style.left=px+'px'; pop.style.top=py+'px';

    var s=steps[idx];
    if(s && (s.tryText||s.advanceOnClick)){
      beacon.style.display='block'; beacon.style.left=(r.right-9)+'px'; beacon.style.top=(r.top+9)+'px';
    } else beacon.style.display='none';
  }

  function go(dir){
    idx+=dir;
    if(idx<0) idx=0;
    if(idx>=steps.length){ done(); return; }
    var ns=steps[idx]; if(ns&&ns.before){ try{ns.before();}catch(e){}}
    render();
  }
  function onKey(e){
    if(e.key==='Escape') done(true);
    else if(e.key==='ArrowRight'||e.key==='Enter') go(1);
    else if(e.key==='ArrowLeft') go(-1);
  }

  function run(start){
    active=true; idx=start||0; buildLayer();
    var s=steps[idx]; if(s&&s.before){ try{s.before();}catch(e){} }
    window.addEventListener('keydown',onKey);
    addEventListener('resize',reposition,{passive:true});
    addEventListener('scroll',reposition,{passive:true,capture:true});
    cleanups.push(function(){ removeEventListener('resize',reposition); removeEventListener('scroll',reposition,{capture:true}); });
    render();
    requestAnimationFrame(function(){ bar && bar.classList.add('in'); });
  }
  function reposition(){ var s=steps[idx]; if(s) position($(s.el), s.pad!=null?s.pad:8, s.place||'auto'); }

  function done(skipped){
    try{ localStorage.setItem(lsKey(cfg.id),'1'); }catch(e){}
    destroyLayer();
    if(!skipped && cfg.finish){ modal(Object.assign({cta:'직접 써보기'},cfg.finish), function(){}); }
  }

  /* ---------- 다시보기 버튼 ---------- */
  function replayBtn(){
    if(document.querySelector('.dt-replay')) return;
    var b=el('button','dt-replay','<span class="ic">🧭</span><span class="tx">둘러보기</span>');
    b.title='둘러보기 다시 보기';
    b.onclick=function(){ if(active) return; T.start(cfg,true); };
    document.body.appendChild(b);
  }

  /* ---------- 공개 API ---------- */
  T.start=function(c,force){
    cfg=c; steps=c.steps||[];
    var url=(location.search+location.hash);
    var forced = force || /(?:[?&]tour=1)|#tour/.test(url);
    var seen=false; try{ seen=localStorage.getItem(lsKey(c.id))==='1'; }catch(e){}
    replayBtn();
    if(active) return;
    if(forced || !seen){
      var begin=function(){ if(c.welcome) modal(Object.assign({cta:'둘러보기 시작 →'},c.welcome), function(){ run(0); }, function(){ done(true); }); else run(0); };
      if(document.readyState==='complete') setTimeout(begin, force?60:520);
      else addEventListener('load',function(){ setTimeout(begin,520); });
    }
  };
  window.startDentTour=function(c){ T.start(c,false); };
})();
