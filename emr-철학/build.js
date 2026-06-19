/* AI 시대 EMR 철학 — 빌더 (외부 의존성 0, node build.js)
 * 출력: ../emr-가독성가이드.html (허브, 바둑판 그리드) + ./<id>.html (각 안티패턴 독립 reading-mode 페이지)
 * 클릭하면 모달이 아니라 개별 페이지로 들어가 차분히 길게 읽는 구조. */
const fs = require('fs');
const path = require('path');
const OUT = __dirname;                       // emr-철학/
const ROOT = path.join(__dirname, '..');     // repo root

/* ── 안티패턴 데이터 (One source of truth) ──
 * 사실 검증(2026-06-19): 클레임은 '덴트웹이 이미 하는 것'을 못 한다고 우기지 않는다.
 * 덴트웹 강점은 honest 노트로 인정하고, 진짜 남은 격차만 '~하면 안 됩니다'로. */
const P = [
  {
    id: '01-scroll', num: '01', emoji: '📊', tone: '#d32f2f', toneBg: '#fdecec',
    name: ['끝없이 ', '스크롤', '하게 하면 안 됩니다'],
    sub: '정보를 “찾게” 하지 말고 “보이게” 하라',
    cardSub: '5년 기록을 찾으려 드르륵 내리는 차트 → 한 화면에',
    lead: '환자 한 명을 파악하려면 진료 내역을 위에서 아래로 죽 훑어야 한다. 화면은 한 번에 한 시점만 보여주고, “이 환자의 전체 그림”은 결국 보는 사람이 머릿속에서 다시 잇는다.',
    bad: '진료 내역 20~50줄이 시간순으로 길게 나열된다. “이 환자 어디까지 치료했더라”를 알려면 끝까지 내렸다가 다시 위로 올린다. 하루에 수십 명, 이 스크롤이 그대로 쌓인다.',
    good: '5년 치료를 <b>한 화면</b>에 담는다. 좌측 확대 + 가로 시간축(간트 막대)으로, 스크롤 없이 전체 흐름이 한눈에 들어온다.',
    why: [
      '진료 1건당 의료진이 전자차트(EHR)에 쓰는 시간은 평균 <b>약 16분</b>, 그중 <b>3분의 1</b>이 과거 기록을 뒤지는 “차트 읽기”다. 한 화면에 안 보이면 그 시간은 계속 늘어난다.',
      '스크롤은 “지금 어디를 보고 있는지”를 자꾸 잊게 만든다. 전체를 한 번에 보여주면, 사람은 찾는 대신 <b>알아본다</b>.'
    ],
    honest: '덴트웹도 진료 내역은 시간순 리스트라, 환자 기록이 길어지면 똑같이 스크롤이 길어진다. 이건 특정 프로그램의 잘못이라기보다 “시간순 한 줄 나열”이라는 구조 자체의 한계다.',
    evi: [
      ['Overhage & McCallie, 2020 — 진료당 EHR 16분·차트리뷰 33%', 'https://pubmed.ncbi.nlm.nih.gov/31931523/'],
      ['AMA — 30분 진료에 EHR 36분', 'https://www.ama-assn.org/practice-management/digital-health/primary-care-visits-run-half-hour-time-ehr-36-minutes']
    ],
    ours: { label: '실제 EMR 3열 차트 보기', href: '../차트확인.html' }
  },
  {
    id: '02-tooth', num: '02', emoji: '🦷', tone: '#00897b', toneBg: '#e0f2f1',
    name: ['위치를 ', '글자', '로만 쓰면 안 됩니다'],
    sub: '“어디”는 즉시 떠오르는 정보 — 번호로 적으면 한 박자 늦는다',
    cardSub: '‘#26’ → ‘왼쪽 위 어금니’ 번역하는 한 박자',
    lead: '치아를 ‘#26’처럼 번호로만 적으면, 읽는 사람은 매번 머릿속에서 ‘왼쪽 위 큰어금니’로 번역한다. 이 번역 한 단계가 작지만 분명한 지연을 만든다.',
    bad: '내역에 ‘#26 #36 #47 치료함’ — 어느 자리인지 떠올리느라 시선이 잠깐 멈춘다. 환자에게 설명할 때도 머릿속에서 한 번 더 번역한다.',
    good: '실제 <b>입 모양</b> 위에 그 치아를 색칠한다. 보면 바로 “거기”. 위치를 위치로 보여주면 번역 단계가 사라진다.',
    why: [
      '“어디”는 사람이 즉시 떠올리는 <b>공간 정보</b>다. 그걸 글자(번호)로 옮기면 의미를 해독하는 단계를 한 번 더 거치게 만든다 — 강점을 일부러 버리는 셈이다(내부 원칙 INV-7).',
      '위치가 그림으로 보이면, 같은 치아에 모인 사건들(레진→신경→크라운)도 “한 자리에서 벌어진 일”로 묶여 읽힌다.'
    ],
    honest: '⭐ 덴트웹에도 치식도(odontogram)는 있다. 다만 그건 주로 “지금 상태”를 보는 그림이고, “언제 어디를 치료했는지”(시간 × 위치)는 여전히 글자 내역으로 읽어야 한다. 우리는 위치와 시간을 <b>한 화면에서 동시에</b> 보이게 합친다.',
    evi: [],
    ours: { label: '입 위치 색칠 시안 보기', href: '../참고자료/v_B_tooth.html' }
  },
  {
    id: '03-causal', num: '03', emoji: '🔗', tone: '#1565C0', toneBg: '#e8f0fe',
    name: ['왜 했는지 ', '흩어', '놓으면 안 됩니다'],
    sub: '날짜순 나열 대신, 원인부터 결과까지 한 사슬로',
    cardSub: '날짜순 나열로 인과가 끊김 → 사슬로',
    lead: '같은 환자라도 레진·신경치료·스케일링·크라운이 여러 치아에 걸쳐 날짜순으로 뒤섞여 나열된다. “이 치료를 왜 했나”라는 줄거리가 줄과 줄 사이에 흩어진다.',
    bad: '‘#36을 왜 신경치료까지 갔지?’를 알려면 흩어진 줄을 머릿속에서 다시 짜맞춰야 한다. 사건은 다 적혀 있는데, 사건들의 “이유”가 안 보인다.',
    good: '같은 치아(또는 임상 문제)끼리 묶어 <b>증상 → 검사 → 진단 → 처치 → 결과</b>를 한 사슬로 잇는다. ‘#36 시림 → 검사 → 비가역적 치수염 → 근관치료 → 크라운’이 한 줄로 읽힌다.',
    why: [
      '인과(원인 → 결과)가 끊기면 판단이 느려지고, 환자에게 설명하기도 어렵다. 사람은 “사건 목록”보다 “이야기”를 훨씬 빠르게 이해한다.',
      '사슬로 묶어두면 “이 치아는 아직 크라운이 안 끝났다” 같은 <b>미완료</b>도 사슬의 끊긴 자리로 즉시 보인다.'
    ],
    honest: '시간순 나열은 덴트웹만이 아니라 거의 모든 EMR의 기본이다. 기록을 “시간”이 아니라 “문제(치아)” 기준으로 한 번 더 묶는 것이 핵심이다.',
    evi: [],
    ours: { label: '인과사슬(V-모델) 시안 보기', href: '../참고자료/05_vmodel.html' }
  },
  {
    id: '04-overload', num: '04', emoji: '🌊', tone: '#2e7d32', toneBg: '#e8f5e9',
    name: ['다 펼쳐서 ', '쏟으면', ' 안 됩니다'],
    sub: '요약 한 줄을 기본으로, 필요한 것만 펼친다',
    cardSub: '모든 정보를 한꺼번에 → 요약 1줄 + 펼침',
    lead: '모든 메모·처방·영상·수치를 항상 펼쳐 화면을 가득 덮으면, 정작 지금 필요한 한 줄이 정보 더미에 파묻힌다.',
    bad: '한 방문에 메모 10줄 + 처방 + 방사선 설명까지 전부 펼침 × 20방문 = 끝없는 벽. 정보가 많은 게 아니라, <b>다 보이는 게</b> 문제다.',
    good: '기본은 <b>날짜·치아·술식</b> 요약 한 줄. 궁금한 행만 클릭해 메모·처방·사진을 펼친다(확장행).',
    why: [
      '사람 시선은 “전체 훑기 → 관심 항목만 파기” 순으로 움직인다. 다 펼쳐 두면 뇌가 필요 없는 걸 걸러내는 데 에너지를 낭비한다.',
      '접어두면 “전체 흐름”과 “하나의 깊이”를 한 화면에서 자유롭게 오갈 수 있다.'
    ],
    honest: '덴트웹은 “디테일이 강하다”는 평을 받는다 — 정보가 풍부하다는 강점이다. 다만 그 디테일을 <b>항상</b> 펼쳐두면 강점이 부담으로 바뀐다. 평소엔 접고, 필요할 때 꺼내는 게 핵심.',
    evi: [],
    ours: { label: '확장행 시안 보기', href: '../참고자료/2_확장행.html' }
  },
  {
    id: '05-clicks', num: '05', emoji: '🖱️', tone: '#4f46e5', toneBg: '#eef0fe',
    name: ['클릭을 ', '많이', ' 하게 하면 안 됩니다'],
    sub: '자주 하는 일일수록 화면 전환과 클릭을 줄여라',
    cardSub: '한 가지 일에 화면 여러 번 전환 → 최소 클릭',
    lead: '한 가지 일을 하려고 화면을 몇 번이나 옮기고, 팝업을 닫고, 확인을 누르게 만들면 — 그게 하루 수백 번 쌓인다.',
    bad: '한 연구에선 독감주사 1건을 기록하는 데 <b>32번</b> 클릭이 필요했다. 화면 전환·팝업·재확인이 겹겹이 쌓여, 손은 바쁜데 남는 게 없다.',
    good: '자주 하는 일은 <b>한 화면에서 최소 클릭</b>으로. 통화 결과를 버튼 하나로 찍는 리콜 콜로거처럼, “생각의 흐름”을 끊지 않는다.',
    why: [
      '치과 프로그램 사용자 불만에서 가장 자주 나오는 것이 “클릭이 너무 많다 / 화면 전환이 번거롭다”(navigation)이다(Dentrix·Eaglesoft 리뷰 공통).',
      '클릭 수는 단순한 불편이 아니라 <b>실수의 통로</b>다. 단계가 많을수록 빠뜨리거나 잘못 누를 자리가 늘어난다.'
    ],
    honest: '덴트웹은 “엔터 두 번” 류의 빠른 청구를 강점으로 내세운 흐름(오스템 ‘두번에’ 포함)에서 나온 만큼 단축을 중시한다. 우리는 그 원칙을 <b>차트 읽기·기록·콜</b> 전 영역으로 넓힌다.',
    evi: [
      ['AHRQ PSNet — 독감주사 1건에 32클릭', 'https://psnet.ahrq.gov/primer/alert-fatigue'],
      ['치과 PM 소프트웨어 리뷰 — navigation·click-heavy 최다 불만', 'https://revupdental.com/best-dental-practice-management-systems/']
    ],
    ours: { label: '한 화면·버튼 기록 차트 보기', href: '../차트확인.html' }
  },
  {
    id: '06-alert', num: '06', emoji: '🚨', tone: '#e65100', toneBg: '#fff3e0',
    name: ['알림을 ', '남발', '하면 안 됩니다'],
    sub: '중요한 경고는 “팝업”이 아니라 “항상 보이는 자리”에',
    cardSub: '사소한 알림 남발 → 진짜 경고도 무시됨',
    lead: '위험 정보를 잘 보이게 하는 것 — 여기까진 덴트웹도 한다(전신질환·알레르기를 상단에 고정). 진짜 함정은 그 다음에 있다.',
    bad: '사소한 알림까지 매번 팝업으로 띄우면, 의료진은 알림의 <b>46~96%</b>를 습관적으로 닫는다(알림 피로, alert fatigue). 그러다 정작 중요한 경고도 같은 손동작으로 닫힌다.',
    good: '알림은 <b>적게, 진짜 중요한 것만 강하게.</b> 위험 정보(전신질환·항응고제 등)는 팝업으로 매번 띄우는 대신 화면 상단 빨강 한 줄로 <b>항상 그 자리</b>에 둔다.',
    why: [
      '경고가 많을수록 무시당한다. 모든 걸 알리는 것은 아무것도 알리지 않는 것과 같다.',
      '위험은 “찾아서” 보면 늦다. 같은 자리·같은 색으로 늘 떠 있어야, 발치 직전 같은 결정적 순간에 놓치지 않는다.'
    ],
    honest: '⭐ 사용자 지적대로, 당뇨·와파린 같은 전신질환을 <b>상단에 고정</b>해 보여주는 것은 덴트웹이 이미 잘 하고 있다. 따라서 진짜 문제는 “경고를 묻는다”가 아니라 “<b>알림을 너무 많이 띄워 둔감해지는 것</b>”이다. 이 페이지는 그 점을 반영해 다시 썼다.',
    evi: [
      ['임상 알림 override율 46~96% — 체계적 문헌고찰(2020)', 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7400042/'],
      ['AHRQ PSNet — 알림 피로(alert fatigue)', 'https://psnet.ahrq.gov/primer/alert-fatigue']
    ],
    ours: { label: '전신질환 빨강 줄 적용 차트', href: '../차트확인.html' }
  },
  {
    id: '07-claim', num: '07', emoji: '🧾', tone: '#b45309', toneBg: '#fdf3e3',
    name: ['청구 누락을 ', '사람', '이 잡게 하면 안 됩니다'],
    sub: '빠진 청구는 차트가 먼저 알려줘야 한다',
    cardSub: '차팅↔청구 따로 → 빠지면 차트가 먼저 알림',
    lead: '진료는 했는데 청구 항목이 빠지면 그대로 손해다. 이걸 사람 눈으로 매번 대조하게 하면, 바쁜 날엔 반드시 샌다.',
    bad: '차팅과 청구가 따로 놀거나, 빠진 항목을 직원이 기억·수기로 점검한다. 바쁘면 누락 → 삭감·손실. “했는데 못 받는” 돈이 조용히 빠져나간다.',
    good: '차트에서 한 일이 곧바로 청구 후보로 뜨고, 빠진 게 있으면 <b>차트가 먼저 알려준다</b>. 차트 ↔ 청구를 좌우로 나란히 대조하고, “왜 이 청구?”의 근거 체인까지 보여준다.',
    why: [
      '차팅에서 청구로 넘어가는 단계에서 의사·직원 간 소통이 어긋나면 청구 항목이 누락돼 손해 보는 상황이 흔하다(치과신문).',
      '사람이 “마지막에 눈으로 잡는” 구조는 늘 샌다. 점검을 <b>자동·시각</b>으로 옮겨야 누락이 0에 가까워진다.'
    ],
    honest: '덴트웹은 꼼꼼한 청구 점검으로 업계 평균보다 낮은 조정률을 강점으로 내세운다. 우리는 그 점검을 사람의 기억이 아니라 <b>화면의 좌우 대조 + 근거 체인</b>으로 한 단계 더 끌어올린다.',
    evi: [
      ['치과신문 — 차팅·청구 소통 어긋남에 따른 청구 누락 손해', 'https://www.dentalnews.or.kr/news/article.html?no=25705']
    ],
    ours: { label: '리콜·보험 자동화 진행상황', href: '../진행상황.html' }
  },
  {
    id: '08-ai', num: '08', emoji: '🤖', tone: '#7c3aed', toneBg: '#f3e8ff',
    name: ['AI가 못 읽게', ' 쌓으면 안 됩니다'],
    sub: '쌓인 기록이 스스로 일하게 — 구조화가 핵심',
    cardSub: '줄글 덩어리 → 구조화해야 자동으로 일함',
    lead: '모든 걸 자유 줄글로만 적으면, 사람도 나중에 다시 못 찾고 기계는 더더욱 못 읽는다. 데이터는 쌓이는데 <b>아무 일도 하지 않는다.</b>',
    bad: '‘오늘 스케일링하고 다음에 또 보기로 함’ — 언제? 어느 치아? 무슨 결과? 기계가 읽을 칸이 없다. 그래서 리콜도, 점검도 결국 사람이 다시 본다.',
    good: '치아·술식·날짜·결과를 <b>구조화(structured)</b>해 기록한다. 그러면 리콜 대상·미완료 치료·빠진 청구를 차트가 스스로 찾아낸다.',
    why: [
      'AI 시대 EMR의 진짜 가치는 “쌓인 데이터가 자동으로 일한다”는 데 있다 — 리콜 대상 자동 식별, 보험 더블체크, 미완료 치료 탐지.',
      '비정형 줄글은 그 자동화를 막는 벽이다. <b>탐지(detection)가 먼저, 예후 예측은 그 다음</b>이라는 순서를 지킨다.'
    ],
    honest: '많은 EMR이 “입력은 자유롭게”를 편의로 내세운다. 하지만 자유 줄글은 당장은 편하고 나중에 비싸다 — 그 데이터로 아무것도 자동화할 수 없기 때문이다.',
    evi: [],
    ours: { label: '리콜·보험 자동화 진행상황', href: '../진행상황.html' }
  },
  {
    id: '09-patient', num: '09', emoji: '👥', tone: '#db2777', toneBg: '#fde7f1',
    name: ['환자에게 ', '못 보여주면', ' 안 됩니다'],
    sub: '차트는 의료진만 보는 게 아니다 — 환자도 이해해야 한다',
    cardSub: '약어·코드로만 된 화면 → 환자용 화면까지',
    lead: '차트는 의료진만 보는 도구가 아니다. 환자가 자기 상태·계획·비용을 “이해”하게 만드는 것도 차트의 일이다.',
    bad: '약어·코드·전문용어로만 된 화면은 환자 앞에서 띄울 수 없다. 그래서 설명은 매번 말로 다시, 직원마다 다르게 — 같은 치과인데 설명이 제각각이다.',
    good: '같은 데이터를 <b>환자용</b>으로도 보여준다. 현재 상태(본인 구강 사진) → 필요한 치료 → 비용(보험/비보험) → 일정. 글은 줄이고 그림으로, 설명 편차는 0으로.',
    why: [
      '설명이 사람·상황마다 다르면 동의·신뢰·매출이 함께 흔들린다. 차트가 환자 화면까지 책임지면 설명이 한 번에 정렬된다.',
      '환자가 “내 눈으로 본” 계획은 말로만 들은 계획보다 훨씬 잘 받아들여진다.'
    ],
    honest: '이건 대부분의 EMR이 비워둔 칸이다. 차트의 데이터를 환자가 이해하는 화면으로 “한 번 더” 보여주는 것 — 우리 차트의 분명한 차별점이다.',
    evi: [],
    ours: { label: '환자용 치료계획 화면 보기', href: '../치료계획.html' }
  }
];

/* ── 공통 스타일 (reading-mode: 크림 배경·단일 액센트·넉넉한 행간) ── */
const ACCENT = '#4f46e5';
const baseFont = `-apple-system,'Apple SD Gothic Neo','Pretendard','Noto Sans KR',sans-serif`;

function pageCSS(tone, toneBg) {
  return `
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:${baseFont}; background:#FBFAF7; color:#22232a; -webkit-font-smoothing:antialiased; line-height:1.85; }
  nav { position:sticky; top:0; z-index:50; height:52px; background:rgba(251,250,247,.92); backdrop-filter:blur(8px);
        border-bottom:1px solid #ece9e2; display:flex; align-items:center; padding:0 20px; gap:12px; }
  nav a.back { display:flex; align-items:center; gap:6px; color:#6b6b75; text-decoration:none; font-size:13px; padding:5px 10px; border-radius:8px; }
  nav a.back:hover { background:#f0eee8; }
  nav .nt { font-size:13.5px; font-weight:600; color:#33343c; letter-spacing:-.3px; }
  nav .ns { margin-left:auto; font-size:12px; color:#a7a59d; }
  .wrap { max-width:680px; margin:0 auto; padding:44px 22px 72px; }
  .eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:12px; font-weight:700; letter-spacing:.3px;
             color:${tone}; background:${toneBg}; padding:5px 12px; border-radius:30px; margin-bottom:20px; }
  .eyebrow .n { font-variant-numeric:tabular-nums; opacity:.7; }
  h1 { font-size:30px; line-height:1.32; letter-spacing:-1px; font-weight:800; color:#1a1a22; margin-bottom:12px; }
  h1 .x { color:${tone}; }
  .tagline { font-size:16px; color:#6a6a73; line-height:1.7; margin-bottom:34px; font-weight:500; }
  p.lead { font-size:19px; line-height:1.75; color:#2a2b33; margin:0 0 26px; letter-spacing:-.2px; }
  p { font-size:17px; margin:0 0 20px; color:#33343c; }
  p b, li b { color:#15151c; font-weight:700; }
  h2 { font-size:14px; font-weight:800; letter-spacing:.4px; color:#9a988f; text-transform:uppercase; margin:38px 0 14px; }
  .compare { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin:8px 0 30px; }
  .cbox { border-radius:14px; padding:18px 20px; font-size:15.5px; line-height:1.7; }
  .cbox .lbl { font-size:12px; font-weight:800; letter-spacing:.3px; margin-bottom:9px; display:flex; align-items:center; gap:6px; }
  .cbox.bad { background:#fdf3f3; border:1px solid #f6dada; }
  .cbox.bad .lbl { color:#c0392b; }
  .cbox.good { background:#f1f8f2; border:1px solid #d4e8d6; }
  .cbox.good .lbl { color:#2e7d32; }
  .cbox b { color:#15151c; }
  .callout { border-radius:14px; padding:18px 20px; margin:8px 0 30px; font-size:15.5px; line-height:1.75; }
  .callout.note { background:#f6f4fb; border:1px solid #e6e1f3; border-left:3px solid ${ACCENT}; color:#3a3640; }
  .callout.evi  { background:#f7f6f2; border:1px solid #ece9e0; color:#6a685f; font-size:13.5px; line-height:1.7; }
  .callout .ct { font-size:12px; font-weight:800; letter-spacing:.3px; margin-bottom:8px; color:${ACCENT}; }
  .callout.evi .ct { color:#9a988f; }
  .callout.evi a { color:#7c7a70; }
  .ours { display:flex; flex-direction:column; gap:6px; margin:30px 0 8px; padding:20px 22px;
          background:#fff; border:1px solid #ece9e2; border-radius:16px; box-shadow:0 1px 4px rgba(0,0,0,.03); }
  .ours .ot { font-size:12px; font-weight:800; letter-spacing:.3px; color:${tone}; }
  .ours .od { font-size:15.5px; color:#33343c; line-height:1.7; }
  .ours a.btn { align-self:flex-start; margin-top:8px; display:inline-flex; align-items:center; gap:6px;
                font-size:14.5px; font-weight:700; color:#fff; background:${tone}; text-decoration:none;
                padding:10px 16px; border-radius:10px; }
  .ours a.btn:hover { filter:brightness(.93); }
  .pager { display:flex; justify-content:space-between; gap:12px; margin-top:48px; padding-top:24px; border-top:1px solid #ece9e2; }
  .pager a { flex:1; text-decoration:none; padding:14px 16px; border-radius:12px; border:1px solid #ece9e2; background:#fff;
             color:#33343c; font-size:13.5px; line-height:1.5; transition:border-color .15s, transform .15s; }
  .pager a:hover { border-color:${tone}; transform:translateY(-2px); }
  .pager a.next { text-align:right; }
  .pager .pd { font-size:11px; color:#a7a59d; font-weight:700; margin-bottom:3px; }
  .pager a.disabled { visibility:hidden; }
  @media (max-width:560px){ .compare{grid-template-columns:1fr;} h1{font-size:25px;} p.lead{font-size:17.5px;} }
  `;
}

const esc = s => s; // 데이터는 신뢰된 내부 콘텐츠 — 그대로 사용

function renderPage(p, prev, next) {
  const nameHtml = p.name.map((seg, i) => i === 1 ? `<span class="x">${seg}</span>` : seg).join('');
  const whyHtml = p.why.map(w => `      <p>${w}</p>`).join('\n');
  const eviHtml = p.evi.length
    ? `\n  <div class="callout evi"><div class="ct">근거</div>${p.evi.map(e => `<a href="${e[1]}" target="_blank">${e[0]}</a>`).join(' &middot; ')}</div>`
    : '';
  const honestHtml = p.honest
    ? `\n  <div class="callout note"><div class="ct">짚고 넘어가기 — 덴트웹은?</div>${p.honest}</div>`
    : '';
  const prevA = prev
    ? `<a class="prev" href="${prev.id}.html"><div class="pd">← 이전</div>${plain(prev.name)}</a>`
    : `<a class="prev disabled" href="#"></a>`;
  const nextA = next
    ? `<a class="next" href="${next.id}.html"><div class="pd">다음 →</div>${plain(next.name)}</a>`
    : `<a class="next" href="../emr-가독성가이드.html"><div class="pd">다음 →</div>${P.length}가지 한눈에 보기</a>`;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${plain(p.name)} — AI 시대 EMR 철학</title>
<style>${pageCSS(p.tone, p.toneBg)}</style>
</head>
<body>
<nav>
  <a class="back" href="../emr-가독성가이드.html">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
    철학 목록으로
  </a>
  <span style="color:#d8d4cb;">|</span>
  <span class="nt">AI 시대 EMR 철학</span>
  <span class="ns">서울사계절치과</span>
</nav>
<div class="wrap">
  <div class="eyebrow"><span>${p.emoji}</span> <span class="n">${p.num}</span> · 안티패턴</div>
  <h1>${nameHtml}</h1>
  <div class="tagline">${p.sub}</div>

  <p class="lead">${p.lead}</p>

  <h2>이렇게 하면 안 됩니다</h2>
  <div class="compare">
    <div class="cbox bad"><div class="lbl">❌ 흔한 차트</div>${p.bad}</div>
    <div class="cbox good"><div class="lbl">✅ 우리 차트</div>${p.good}</div>
  </div>

  <h2>왜 문제인가</h2>
${whyHtml}
${eviHtml}${honestHtml}

  <div class="ours">
    <div class="ot">그래서 우리는 —</div>
    <div class="od">${p.ours.desc || '말이 아니라 실제 화면으로 확인하세요.'}</div>
    <a class="btn" href="${p.ours.href}" target="_blank">${p.emoji} ${p.ours.label} &#10142;</a>
  </div>

  <div class="pager">
    ${prevA}
    ${nextA}
  </div>
</div>
</body>
</html>`;
}

function plain(name) { return name.join(''); }

/* ── 허브 (바둑판 그리드) ── */
function renderHub() {
  const cards = P.map(p => `
    <a class="guide-card" href="emr-철학/${p.id}.html">
      <div class="gc-icon" style="background:${p.toneBg};color:${p.tone};">${p.emoji}</div>
      <div class="gc-name">${p.name.map((s,i)=> i===1?`<span class="x">${s}</span>`:s).join('')}</div>
      <div class="gc-sub">${p.cardSub}</div>
      <div class="gc-open" style="color:${p.tone};">왜 · 어떻게 &#10142;</div>
    </a>`).join('\n');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>AI 시대 EMR 철학 — 차트 제작 기록</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:${baseFont}; background:#f4f6f9; color:#1a1a2e; -webkit-font-smoothing:antialiased; }
  nav { position:sticky; top:0; z-index:100; height:52px; background:#fff; border-bottom:1px solid #e8eaed; display:flex; align-items:center; padding:0 20px; gap:12px; }
  nav .back-btn { display:flex; align-items:center; gap:6px; color:#555; text-decoration:none; font-size:13px; padding:5px 10px; border-radius:8px; }
  nav .back-btn:hover { background:#f0f2f5; }
  nav .nav-title { font-size:14px; font-weight:600; letter-spacing:-.4px; }
  nav .nav-sub { font-size:12px; color:#888; margin-left:auto; }
  .wrap { max-width:820px; margin:0 auto; padding:32px 20px 60px; }
  .badge { display:inline-flex; align-items:center; gap:6px; background:#ede9fe; color:#6d28d9; font-size:11px; font-weight:700; padding:4px 10px; border-radius:20px; letter-spacing:.3px; margin-bottom:12px; }
  h1.title { font-size:26px; font-weight:800; letter-spacing:-.8px; margin-bottom:10px; line-height:1.3; }
  h1.title em { font-style:normal; color:#6d28d9; }
  .sub { font-size:14.5px; color:#555; margin-bottom:22px; line-height:1.78; }
  .sub b { color:#1a1a2e; font-weight:700; }
  .sub .scroll-word { color:#d32f2f; font-weight:700; }
  .principle { display:flex; gap:12px; align-items:flex-start; background:linear-gradient(180deg,#fbfaff,#f4f0ff); border:1px solid #e4dcfb; border-left:4px solid #7c3aed; border-radius:12px; padding:15px 17px; margin-bottom:18px; }
  .principle .p-ic { font-size:18px; line-height:1.4; }
  .principle .p-tx { font-size:13.5px; line-height:1.7; color:#2a2342; }
  .principle .p-tx b { color:#6d28d9; }
  .grid-hint { font-size:12px; color:#999; margin:6px 0 10px; font-weight:600; }
  .guide-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(190px,1fr)); gap:12px; }
  .guide-card { background:#fff; border:1.5px solid #e8eaed; border-radius:14px; padding:15px 15px 13px; cursor:pointer; text-align:left; display:flex; flex-direction:column; gap:7px; min-height:150px; transition:transform .16s, box-shadow .16s, border-color .16s; color:inherit; text-decoration:none; }
  .guide-card:hover { transform:translateY(-4px); box-shadow:0 12px 30px rgba(0,0,0,.12); border-color:#1a1a2e; }
  .guide-card .gc-icon { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  .guide-card .gc-name { font-size:14px; font-weight:800; letter-spacing:-.5px; line-height:1.35; color:#1a1a2e; }
  .guide-card .gc-name .x { color:#d32f2f; }
  .guide-card .gc-sub { font-size:11.5px; color:#888; line-height:1.5; }
  .guide-card .gc-open { margin-top:auto; font-size:12px; font-weight:700; display:flex; align-items:center; gap:4px; }
  .sources { margin-top:26px; font-size:11px; color:#9aa0aa; line-height:1.7; border-top:1px solid #e8eaed; padding-top:16px; }
  .sources a { color:#8a90a0; }
</style>
</head>
<body>
<nav>
  <a class="back-btn" href="차트제작과정.html">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
    제작과정 보드로
  </a>
  <span style="color:#d0d5dd;font-size:14px;">|</span>
  <span class="nav-title">AI 시대 EMR 철학</span>
  <span class="nav-sub">전자차트 제작 기록 · 서울사계절치과</span>
</nav>
<div class="wrap">
  <div class="badge">&#129517; AI 시대 EMR 철학</div>
  <h1 class="title">좋은 차트는 <em>&lsquo;찾는&rsquo;</em> 게 아니라 <em>&lsquo;보이는&rsquo;</em> 것이다.</h1>
  <div class="sub">
    기존 전자차트(EMR)는 환자 한 명을 파악하려고 <span class="scroll-word">드르륵드르륵</span> 스크롤한다. 정보는 다 있는데 <b>안 보인다</b>.<br>
    <b>AI 시대 차트는 반대여야 한다.</b> 보면 바로 보이고, 쌓인 기록이 알아서 일한다. 아래는 우리가 일부러 피한 <b>안티패턴 ${P.length}가지</b> — 전부 <span class="scroll-word">&lsquo;~하면 안 됩니다&rsquo;</span>.
  </div>
  <div class="principle">
    <span class="p-ic">&#128161;</span>
    <span class="p-tx">설계 원칙 한 줄: <b>사람이 머릿속에서 다시 짜맞추게 만들지 마라.</b> 위치는 위치로 보여주고, 인과는 사슬로 잇고, 위험은 항상 같은 자리에, 데이터는 기계가 읽게 쌓는다.</span>
  </div>
  <div class="grid-hint">&#128073; 각 칸을 누르면 &lsquo;왜 안 되는지 · 우리는 어떻게 했는지&rsquo;를 차분히 풀어 쓴 페이지로 들어갑니다.</div>
  <div class="guide-grid">
${cards}
  </div>
  <div class="sources">
    근거(의료 EMR/EHR 연구 — 치과에도 같은 원리 적용):
    진료 1건당 EHR 16분·차트리뷰 33%(<a href="https://pubmed.ncbi.nlm.nih.gov/31931523/" target="_blank">Overhage &amp; McCallie, 2020</a>) &middot;
    독감주사 1건 기록에 32클릭·알림 피로(<a href="https://psnet.ahrq.gov/primer/alert-fatigue" target="_blank">AHRQ PSNet</a>) &middot;
    임상 알림 무시율 46&ndash;96%(<a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7400042/" target="_blank">체계적 문헌고찰, 2020</a>) &middot;
    치과 청구 누락·차팅 이슈(<a href="https://www.dentalnews.or.kr/news/article.html?no=25705" target="_blank">치과신문</a>).
  </div>
</div>
</body>
</html>`;
}

/* ── 빌드 실행 ── */
let written = [];
P.forEach((p, i) => {
  const html = renderPage(p, P[i - 1], P[i + 1]);
  const fp = path.join(OUT, p.id + '.html');
  fs.writeFileSync(fp, html, 'utf8');
  written.push(path.relative(ROOT, fp));
});
const hubPath = path.join(ROOT, 'emr-가독성가이드.html');
fs.writeFileSync(hubPath, renderHub(), 'utf8');
written.push('emr-가독성가이드.html');

console.log('✅ 생성 완료 (' + P.length + ' 안티패턴 + 허브):');
written.forEach(w => console.log('  · ' + w));
