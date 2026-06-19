/* ──────────────────────────────────────────────────────────────────────────
   _compat.js — 호환 심(shim)
   주신 _data.js(디자인검증 5안용)는 EVENTS/THREADS/PALETTE/byId/fmtDate/fmtYear
   /dayCount/uniqueDates 만 정의합니다. 그런데 다른 폴더(차트구성·히스토리x시간축)
   출신 시안들(v_A/v_B/v_C, h_1/h_2/h_3)은 추가 심볼을 더 기대합니다:
     CAT, TODAY, STAGES, stageOf, COLGROUPS, PLAN, allTeeth, threadOf, gapLabel
     + 이벤트에 .s/.e/.cat/.st/.point/.stage, + THREADS.steps 를 {id,stage} 객체로.
   이 파일은 그 심볼들을 "원본 EVENTS/THREADS/PALETTE에서 파생"해 정의합니다.
   ※ 임상 내용(무엇을·언제·어느 치아에)은 원본 그대로. 카테고리/단계/컬럼 묶음 등
     "표현 골격"만 type 기반으로 재구성한 것이라 원저자 설계와 다를 수 있습니다.
   ※ 05_vmodel.html 에는 의도적으로 로드하지 않습니다(이미 원본 그대로 작동).
   ────────────────────────────────────────────────────────────────────────── */
(function () {
  if (typeof window.EVENTS === 'undefined' || typeof window.THREADS === 'undefined') return;
  if (window.__COMPAT_DONE__) return;
  window.__COMPAT_DONE__ = true;

  var PALETTE = window.PALETTE || {};

  // type → 임상 단계 라벨 (V-Model: 증상→검사→진단→처치→…)
  var STAGE_OF_TYPE = {
    'CC':   '증상',
    'PI':   '검사',
    '진료': '처치',
    '처방': '처방',
    '동의서':'동의',
    'Next': '예정',
    '메모': '계획'
  };
  function stageForType(t){ return STAGE_OF_TYPE[t] || t; }

  // ── 1) 이벤트에 파생 필드 부착 (point/gantt 모델 호환) ──
  window.EVENTS.forEach(function (e) {
    if (e.s == null)    e.s = e.date;             // 시작 = 종료 (지속시간 없음 → 점 이벤트)
    if (e.e == null)    e.e = e.date;
    if (e.cat == null)  e.cat = e.type;           // 카테고리 = 기록 타입
    if (e.point == null) e.point = true;          // 전부 점 이벤트로 표시
    if (e.st == null)   e.st = (e.type === 'Next' ? 'plan' : 'done');
    if (e.stage == null) e.stage = stageForType(e.type);
    if (e.det == null)  e.det = e.details || [];  // h_* 팝오버는 e.det 사용
  });

  // ── 2) byId를 문자열 id / {id} 객체 모두 허용하게 래핑 ──
  var _byId = window.byId;
  window.byId = function (x) {
    var id = (x && x.id !== undefined) ? x.id : x;
    return _byId(id);
  };

  // ── 3) THREADS.steps 를 {id, stage} 객체로 정규화 + 이벤트에 단계 부착 ──
  window.THREADS.forEach(function (th) {
    th.steps = (th.steps || []).map(function (st) {
      var id = (st && st.id !== undefined) ? st.id : st;
      var ev = window.byId(id);
      var stage = (st && st.stage) ? st.stage : (ev ? ev.stage : id);
      if (ev) ev.stage = stage;
      return { id: id, stage: stage };
    });
  });

  // ── 4) TODAY / _MIN / _MAX / xp — 간트(h_*) 타임라인 좌표계 ──
  var _allDates = window.EVENTS.map(function (e) { return e.date; }).sort();
  window.TODAY = _allDates[_allDates.length - 1];
  // _MIN = 가장 이른 달의 1일, _MAX = 가장 늦은 날 + 2개월(오늘선이 끝에 붙지 않게)
  var _minD = new Date(_allDates[0]);
  var _maxD = new Date(_allDates[_allDates.length - 1]);
  // Date 객체로 둔다: 파일들이 `new Date(_MIN)`(클론 OK) 와 `d < _MAX`(Date 비교 OK) 둘 다 사용
  window._MIN = new Date(_minD.getFullYear(), _minD.getMonth(), 1);
  window._MAX = new Date(_maxD.getFullYear(), _maxD.getMonth() + 2, 1);
  var _minMs = +window._MIN, _maxMs = +window._MAX, _spanMs = (_maxMs - _minMs) || 1;
  window.xp = function (iso) {
    var v = (+new Date(iso) - _minMs) / _spanMs * 100;
    return Math.max(0, Math.min(100, v));
  };

  // ── 5) CAT = PALETTE 파생 ( CAT[type] = [label, color] ) ──
  window.CAT = {};
  Object.keys(PALETTE).forEach(function (t) {
    window.CAT[t] = [PALETTE[t].label || t, PALETTE[t].c || '#64748b'];
  });

  // ── 6) STAGES = THREADS 단계들을 임상 순서로 정렬 ──
  var ORDER = ['증상', '검사', '진단', '처치', '처방', '동의', '예정', '계획', '메모'];
  var present = [];
  window.THREADS.forEach(function (th) {
    th.steps.forEach(function (s) { if (present.indexOf(s.stage) < 0) present.push(s.stage); });
  });
  window.STAGES = ORDER.filter(function (k) { return present.indexOf(k) >= 0; })
                       .map(function (k) { return { k: k, label: k }; });
  present.forEach(function (k) {
    if (!window.STAGES.some(function (s) { return s.k === k; })) window.STAGES.push({ k: k, label: k });
  });
  window.stageOf = function (k) {
    var f = window.STAGES.filter(function (s) { return s.k === k; })[0];
    return f || { k: k, label: k };
  };

  // ── 7) COLGROUPS = 그리드 컬럼(타입 묶음) ──
  function col(label, type, types) {
    var p = PALETTE[type] || {};
    return { label: label, c: p.c || '#64748b', types: types };
  }
  window.COLGROUPS = [
    col('증상',      'CC',   ['CC']),
    col('검사',      'PI',   ['PI']),
    col('진료·처치', '진료', ['진료']),
    col('처방·동의', '처방', ['처방', '동의서']),
    col('메모·예정', '메모', ['메모', 'Next'])
  ];

  // ── 8) PLAN = 전체 치료계획 흐름(시간순) — v_B_tooth '계획흐름' 모드용 ──
  var chrono = window.EVENTS.slice().sort(function (a, b) {
    return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0);
  });
  window.PLAN = {
    id: 'plan', tooth: null, color: '#64748b',
    label: '전체 치료계획 흐름 (초진 → 최근)',
    steps: chrono.map(function (e) { return { id: e.id, stage: e.stage }; })
  };

  // ── 9) 헬퍼 ──
  // fmtD: h_* 들이 쓰는 날짜 포맷터(연도 포함). _data.js엔 fmtDate(MM.DD)만 있음.
  window.fmtD = function (d) {
    if (!d) return '';
    var p = ('' + d).split('-');
    return p.length === 3 ? (p[0].slice(2) + '.' + p[1] + '.' + p[2]) : d;
  };
  window.allTeeth = function () {
    var out = [];
    window.THREADS.forEach(function (th) {
      if (th.tooth != null && out.indexOf(th.tooth) < 0) out.push(th.tooth);
    });
    return out;
  };
  window.threadOf = function (t) {
    return window.THREADS.filter(function (th) { return th.tooth == t; })[0] || null;
  };
  window.gapLabel = function (older, newer) {
    var d = Math.round((new Date(newer) - new Date(older)) / 864e5);
    if (isNaN(d)) return '';
    if (d <= 0)   return '같은 날';
    if (d < 14)   return d + '일';
    if (d < 60)   return Math.round(d / 7) + '주';
    if (d < 365)  return Math.round(d / 30) + '개월';
    var y = Math.floor(d / 365), m = Math.round((d % 365) / 30);
    return y + '년' + (m ? ' ' + m + '개월' : '');
  };
})();
