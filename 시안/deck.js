/* =========================================================================
   deck.js — PPT형 슬라이드 엔진 컨트롤러 (5개 시안 공유)
   · 키보드: → ↓ Space PageDown / Enter = 다음, ← ↑ PageUp = 이전, Home/End, F = 풀스크린
   · 스크롤스냅 + IntersectionObserver로 현재 슬라이드 추적
   · 진행바 · 카운터 · 좌측 점네비 · prev/next 버튼 자동 생성
   ========================================================================= */
(function () {
  function init() {
    var deck = document.querySelector('.deck');
    if (!deck) return;
    var slides = Array.prototype.slice.call(deck.querySelectorAll('.slide'));
    var total = slides.length;
    if (!total) return;
    var current = 0;

    /* ── UI 주입 ───────────────────────────────────────── */
    var progress = el('div', 'progress'); document.body.appendChild(progress);

    var dots = el('nav', 'dots');
    slides.forEach(function (s, i) {
      var a = document.createElement('a');
      a.href = '#'; a.setAttribute('aria-label', '슬라이드 ' + (i + 1));
      a.addEventListener('click', function (e) { e.preventDefault(); go(i); });
      dots.appendChild(a);
    });
    document.body.appendChild(dots);

    var ui = el('div', 'deck-ui');
    var prev = navBtn('M13 4 L7 10 L13 16', function () { go(current - 1); });
    var counter = el('div', 'deck-counter');
    counter.innerHTML = '<b>1</b> / ' + total;
    var next = navBtn('M7 4 L13 10 L7 16', function () { go(current + 1); });
    ui.appendChild(prev); ui.appendChild(counter); ui.appendChild(next);
    document.body.appendChild(ui);

    /* ── 현재 슬라이드 추적 ───────────────────────────── */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && en.intersectionRatio > 0.55) {
          var i = slides.indexOf(en.target);
          if (i >= 0) setActive(i);
        }
      });
    }, { threshold: [0.55] });
    slides.forEach(function (s) { io.observe(s); });

    function setActive(i) {
      current = i;
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      var dlist = dots.querySelectorAll('a');
      dlist.forEach(function (d, k) { d.classList.toggle('on', k === i); });
      progress.style.width = (total > 1 ? (i / (total - 1)) * 100 : 100) + '%';
      counter.innerHTML = '<b>' + (i + 1) + '</b> / ' + total;
      document.body.classList.toggle('on-cover', slides[i].classList.contains('cover'));
      prev.style.visibility = i === 0 ? 'hidden' : 'visible';
      next.style.visibility = i === total - 1 ? 'hidden' : 'visible';
    }

    function go(i) {
      i = Math.max(0, Math.min(total - 1, i));
      slides[i].scrollIntoView({ behavior: 'smooth' });
      setActive(i);
    }

    /* ── 키보드 ───────────────────────────────────────── */
    document.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ': case 'Enter':
          e.preventDefault(); go(current + 1); break;
        case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
          e.preventDefault(); go(current - 1); break;
        case 'Home': e.preventDefault(); go(0); break;
        case 'End': e.preventDefault(); go(total - 1); break;
        case 'f': case 'F':
          if (document.fullscreenElement) document.exitFullscreen();
          else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
          break;
      }
    });

    /* 첫 슬라이드 활성 */
    setActive(0);
    slides[0].classList.add('is-active');
  }

  function el(tag, cls) { var n = document.createElement(tag); n.className = cls; return n; }
  function navBtn(path, onclick) {
    var b = el('button', 'navbtn');
    b.innerHTML = '<svg viewBox="0 0 20 20" fill="none"><path d="' + path +
      '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    b.addEventListener('click', onclick);
    return b;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
