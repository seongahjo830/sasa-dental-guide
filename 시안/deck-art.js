/* =========================================================================
   deck-art.js — 치과 교육용 SVG 일러스트 라이브러리 (5개 시안 공유)
   `.shot[data-art="키"]`를 찾아 해당 SVG를 주입한다.
   ⚠️ 이 그림들은 "이해를 돕는 교육용 도해"이며, 실제 환자 X-ray/사진으로
      교체해 쓰는 것을 전제로 한다(각 .shot-note 참고).
   지원 키: xray-26 · occlusal-25 · perio-chart · caries-stages
   ========================================================================= */
(function () {
  var ART = {};

  /* ── #26 치근단 방사선 도해 (상악 제1대구치, 깊은 충치가 신경 근접) ── */
  ART['xray-26'] =
  '<svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
      '<radialGradient id="xbg" cx="50%" cy="46%" r="70%">' +
        '<stop offset="0%" stop-color="#1b2735"/><stop offset="100%" stop-color="#070d15"/></radialGradient>' +
      '<linearGradient id="xtooth" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#e9eef4"/><stop offset="60%" stop-color="#c2ccd8"/><stop offset="100%" stop-color="#9aa6b4"/></linearGradient>' +
      '<radialGradient id="xcaries" cx="50%" cy="50%" r="55%">' +
        '<stop offset="0%" stop-color="#05080c"/><stop offset="70%" stop-color="#0c131c"/><stop offset="100%" stop-color="#0c131c" stop-opacity="0"/></radialGradient>' +
    '</defs>' +
    '<rect width="400" height="320" fill="url(#xbg)"/>' +
    /* 잔존 뼈 텍스처 */
    '<g opacity="0.25" fill="#33465c">' +
      '<circle cx="60" cy="60" r="2"/><circle cx="120" cy="40" r="1.5"/><circle cx="330" cy="70" r="2"/><circle cx="360" cy="200" r="1.5"/><circle cx="40" cy="220" r="2"/><circle cx="300" cy="270" r="1.5"/></g>' +
    /* 인접치 일부(좌) */
    '<path d="M40 300 L52 150 Q56 120 74 120 L96 120 Q104 150 100 300 Z" fill="url(#xtooth)" opacity="0.55"/>' +
    /* #26 본체 — 치관(아래) + 3개 치근(위로) */
    '<g>' +
      /* 치근 3개 */
      '<path d="M150 150 Q138 70 120 30 Q150 60 160 150 Z" fill="url(#xtooth)"/>' +
      '<path d="M250 150 Q262 70 286 30 Q252 60 244 150 Z" fill="url(#xtooth)"/>' +
      '<path d="M196 150 Q198 58 200 26 Q210 60 208 150 Z" fill="url(#xtooth)"/>' +
      /* 치관 */
      '<path d="M138 150 Q132 250 150 296 L256 296 Q274 250 266 150 Q230 168 200 168 Q168 168 138 150 Z" fill="url(#xtooth)"/>' +
      /* 신경관(가는 어두운 선) */
      '<g stroke="#46586e" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.85">' +
        '<path d="M150 245 Q140 120 128 55"/>' +
        '<path d="M200 250 Q200 110 200 48"/>' +
        '<path d="M250 245 Q260 120 276 55"/></g>' +
      /* 신경실(pulp chamber) */
      '<path d="M178 235 Q200 215 222 235 Q224 252 200 256 Q176 252 178 235 Z" fill="#2b3a4d"/>' +
    '</g>' +
    /* 깊은 충치 — 치관 근심교합 → 신경실 근접한 어두운 음영 */
    '<path d="M150 168 Q158 150 186 158 Q210 168 206 200 Q200 226 182 230 Q160 232 152 210 Q146 188 150 168 Z" fill="#060a0f"/>' +
    '<ellipse cx="180" cy="196" rx="46" ry="40" fill="url(#xcaries)"/>' +
    /* 강조 링 + 라벨 */
    '<g>' +
      '<circle cx="184" cy="206" r="40" fill="none" stroke="#FACC15" stroke-width="3"/>' +
      '<circle cx="184" cy="206" r="40" fill="none" stroke="#FACC15" stroke-width="9" opacity="0.18"/>' +
      '<rect x="96" y="250" width="176" height="26" rx="13" fill="#FACC15"/>' +
      '<text x="184" y="268" text-anchor="middle" font-family="Pretendard,sans-serif" font-size="14" font-weight="800" fill="#1a1205">충치 음영 → 신경 바로 위</text>' +
    '</g>' +
    '<text x="388" y="20" text-anchor="end" font-family="Pretendard,sans-serif" font-size="10.5" fill="#5a6b80">교육용 도해 · 실제 X-ray로 교체</text>' +
  '</svg>';

  /* ── #25 교합면 구내사진 도해 (넓은 충치) ── */
  ART['occlusal-25'] =
  '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
      '<radialGradient id="ogum" cx="50%" cy="45%" r="75%">' +
        '<stop offset="0%" stop-color="#f3c9c4"/><stop offset="100%" stop-color="#d99a93"/></radialGradient>' +
      '<radialGradient id="otooth" cx="42%" cy="38%" r="70%">' +
        '<stop offset="0%" stop-color="#fffdf7"/><stop offset="70%" stop-color="#f3ecdd"/><stop offset="100%" stop-color="#ddd1bb"/></radialGradient>' +
    '</defs>' +
    '<rect width="400" height="300" fill="url(#ogum)"/>' +
    /* 인접치 */
    '<ellipse cx="92" cy="150" rx="62" ry="84" fill="url(#otooth)" opacity="0.8"/>' +
    '<ellipse cx="320" cy="150" rx="58" ry="80" fill="url(#otooth)" opacity="0.8"/>' +
    /* #25 본체(교합면) */
    '<ellipse cx="206" cy="150" rx="78" ry="98" fill="url(#otooth)" stroke="#cdbfa3" stroke-width="2"/>' +
    /* 교두 음영(자연스러운 홈) */
    '<g stroke="#c9bb9d" stroke-width="2.5" fill="none" opacity="0.7">' +
      '<path d="M206 70 Q198 150 206 230"/><path d="M150 150 Q206 142 262 150"/></g>' +
    /* 넓은 충치(검갈색) — 교합면 절반 이상 */
    '<path d="M168 96 Q210 86 246 110 Q262 140 248 178 Q230 214 196 208 Q166 200 158 166 Q152 126 168 96 Z" fill="#3b2410"/>' +
    '<path d="M178 110 Q210 102 236 122 Q248 146 236 174 Q220 198 196 192 Q174 184 170 158 Q166 130 178 110 Z" fill="#5a3a1c" opacity="0.85"/>' +
    /* 충치 범위 점선 표시 */
    '<path d="M160 92 Q214 78 252 106 Q272 142 256 184 Q234 224 192 216 Q156 206 150 166 Q144 122 160 92 Z" fill="none" stroke="#FACC15" stroke-width="3" stroke-dasharray="9 7"/>' +
    '<rect x="120" y="244" width="172" height="26" rx="13" fill="#b45309"/>' +
    '<text x="206" y="262" text-anchor="middle" font-family="Pretendard,sans-serif" font-size="14" font-weight="800" fill="#fff">충치가 씹는 면 절반 이상</text>' +
    '<text x="390" y="20" text-anchor="end" font-family="Pretendard,sans-serif" font-size="10.5" fill="#9a6b55">교육용 도해 · 실제 사진으로 교체</text>' +
  '</svg>';

  /* ── 잇몸 탐침(periodontal) 차트 도해 — #16·26·36·46 = 5·6·5·6mm ── */
  ART['perio-chart'] = (function () {
    var teeth = [['#16', 5], ['#26', 6], ['#36', 5], ['#46', 6]];
    var baseY = 232, x0 = 70, gap = 84, bw = 40, mm = 22; /* 1mm = 22px... too tall; scale */
    var pxPerMm = 19;
    var s = '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="400" height="300" fill="#ffffff"/>' +
      '<text x="24" y="34" font-family="Pretendard,sans-serif" font-size="15" font-weight="800" fill="#211e19">잇몸 주머니 깊이 (탐침)</text>';
    /* 정상 3mm 기준선 */
    var normY = baseY - 3 * pxPerMm;
    s += '<line x1="40" y1="' + normY + '" x2="378" y2="' + normY + '" stroke="#15803d" stroke-width="2" stroke-dasharray="6 5"/>' +
         '<text x="378" y="' + (normY - 7) + '" text-anchor="end" font-family="Pretendard,sans-serif" font-size="12" font-weight="700" fill="#15803d">정상 3mm</text>';
    teeth.forEach(function (t, i) {
      var cx = x0 + i * gap;
      var h = t[1] * pxPerMm;
      var y = baseY - h;
      /* 막대(정상초과=빨강) */
      s += '<rect x="' + (cx - bw / 2) + '" y="' + y + '" width="' + bw + '" height="' + h + '" rx="5" fill="#e11d48"/>';
      /* 정상범위(아래 3mm)는 초록 덧칠 */
      s += '<rect x="' + (cx - bw / 2) + '" y="' + (baseY - 3 * pxPerMm) + '" width="' + bw + '" height="' + (3 * pxPerMm) + '" rx="5" fill="#16a34a" opacity="0.25"/>';
      /* 수치 */
      s += '<text x="' + cx + '" y="' + (y - 8) + '" text-anchor="middle" font-family="Pretendard,sans-serif" font-size="17" font-weight="900" fill="#be123c">' + t[1] + 'mm</text>';
      /* 치아라벨 */
      s += '<text x="' + cx + '" y="' + (baseY + 22) + '" text-anchor="middle" font-family="Pretendard,sans-serif" font-size="13" font-weight="700" fill="#3f3f46">' + t[0] + '</text>';
    });
    s += '<line x1="40" y1="' + baseY + '" x2="378" y2="' + baseY + '" stroke="#d4d4d8" stroke-width="2"/>';
    s += '<text x="390" y="290" text-anchor="end" font-family="Pretendard,sans-serif" font-size="10.5" fill="#a1a1aa">교육용 도해 · 실제 차트로 교체</text>';
    s += '</svg>';
    return s;
  })();

  /* ── 충치 진행 4단계 도해 (지금 = 3단계 강조) ── */
  ART['caries-stages'] = (function () {
    var stages = [
      ['1', '겉(법랑질)', '#22c55e', 0.16],
      ['2', '속(상아질)', '#eab308', 0.42],
      ['3', '신경 근접', '#ef4444', 0.74],
      ['4', '뿌리 염증', '#7f1d1d', 0.96]
    ];
    var s = '<svg viewBox="0 0 440 300" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="440" height="300" fill="#ffffff"/>';
    var x0 = 70, gap = 102, cy = 130;
    /* 진행 화살표 */
    s += '<line x1="40" y1="' + cy + '" x2="404" y2="' + cy + '" stroke="#e4e4e7" stroke-width="3"/>' +
         '<path d="M404 ' + cy + ' l-12 -6 v12 z" fill="#e4e4e7"/>';
    stages.forEach(function (st, i) {
      var cx = x0 + i * gap;
      var now = (i === 2);
      var toothFill = '#f3ecdd', stroke = '#d4c9b0';
      /* 치아(간단한 어금니 실루엣) */
      s += '<g transform="translate(' + cx + ',' + cy + ')">';
      s += '<path d="M-26 -34 Q-30 -44 -16 -44 L16 -44 Q30 -44 26 -34 Q30 6 18 40 Q12 50 6 40 Q0 30 -6 40 Q-12 50 -18 40 Q-30 6 -26 -34 Z" fill="' + toothFill + '" stroke="' + stroke + '" stroke-width="2"/>';
      /* 충치 음영(단계별 깊이) */
      var depth = st[3];
      var cariesY = -34 + depth * 70;
      s += '<ellipse cx="0" cy="' + (cariesY) + '" rx="' + (10 + depth * 8) + '" ry="' + (10 + depth * 14) + '" fill="' + st[2] + '" opacity="0.9"/>';
      if (i >= 2) s += '<line x1="0" y1="36" x2="0" y2="58" stroke="#9aa6b4" stroke-width="2"/>'; /* 신경 노출 암시 */
      s += '</g>';
      /* 단계 번호 원 */
      s += '<circle cx="' + cx + '" cy="' + (cy + 70) + '" r="15" fill="' + (now ? '#ef4444' : '#e4e4e7') + '"/>' +
           '<text x="' + cx + '" y="' + (cy + 75) + '" text-anchor="middle" font-family="Pretendard,sans-serif" font-size="14" font-weight="900" fill="' + (now ? '#fff' : '#71717a') + '">' + st[0] + '</text>';
      /* 라벨 */
      s += '<text x="' + cx + '" y="' + (cy + 108) + '" text-anchor="middle" font-family="Pretendard,sans-serif" font-size="12.5" font-weight="700" fill="#3f3f46">' + st[1] + '</text>';
      /* 지금 여기 */
      if (now) {
        s += '<g transform="translate(' + cx + ',' + (cy - 78) + ')">' +
             '<rect x="-42" y="-20" width="84" height="30" rx="15" fill="#ef4444"/>' +
             '<text x="0" y="0" text-anchor="middle" font-family="Pretendard,sans-serif" font-size="14" font-weight="800" fill="#fff">지금 여기</text>' +
             '<path d="M0 10 l-7 8 h14 z" fill="#ef4444"/></g>';
      }
    });
    s += '<text x="430" y="292" text-anchor="end" font-family="Pretendard,sans-serif" font-size="10.5" fill="#a1a1aa">교육용 도해</text>';
    s += '</svg>';
    return s;
  })();

  function init() {
    var shots = document.querySelectorAll('.shot[data-art]');
    Array.prototype.forEach.call(shots, function (shot) {
      var key = shot.getAttribute('data-art');
      if (!ART[key]) return;
      var mid = shot.querySelector('.shot-mid');
      if (mid) mid.parentNode.removeChild(mid);
      var holder = document.createElement('div');
      holder.className = 'shot-art';
      holder.innerHTML = ART[key];
      shot.insertBefore(holder, shot.firstChild);
      shot.classList.add('has-art');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
