// 공통 데이터 — 5개 안이 동일 콘텐츠로 비교되도록 한 곳에서 관리 (디자인검증 원칙: 5안 동일 콘텐츠)
// 출처: 사용자 제공 덴트웹 히스토리 스크린샷 (가상/시연용)

window.PALETTE = {
  'Next'  : { c:'#7c3aed', bg:'#f3e8ff', label:'Next',   icon:'⏭' },
  'CC'    : { c:'#db2777', bg:'#fce7f3', label:'CC',     icon:'🗣' },
  'PI'    : { c:'#ea580c', bg:'#ffedd5', label:'PI검사', icon:'🔬' },
  '진료'  : { c:'#2563eb', bg:'#dbeafe', label:'진료',   icon:'🦷' },
  '처방'  : { c:'#0d9488', bg:'#ccfbf1', label:'처방',   icon:'💊' },
  '동의서': { c:'#16a34a', bg:'#dcfce7', label:'동의서', icon:'📝' },
  '메모'  : { c:'#64748b', bg:'#f1f5f9', label:'메모',   icon:'📌' },
};

// 시간 역순(최신 위) 원본. 차트 흐름: 초진(24.01) → 계획(26.03) → 집중치료일(26.04.30)
window.EVENTS = [
  { id:'e1',  date:'2026-04-30', type:'Next',  title:'ce (크라운 시작) [1주 후]', doctor:'dr.조/효정', teeth:[], details:[] },
  { id:'e2',  date:'2026-04-30', type:'CC',    title:'우측 시린 증상, 괜찮으면 #26 근관치료 시작', doctor:'조효정', teeth:[26],
    details:['ca pol · 우측 시림 지속 → #26 endo 시작 예정 (/dr.조/정연)'] },
  { id:'e3',  date:'2026-04-30', type:'PI',    title:'Present Illness — 우측 시림 검사', doctor:'dr.조성아', teeth:[17,15], flag:true,
    details:['#7 Air(+) · #54 Air(−) · #7654 Bite(−)', '환자: "맨 뒤 큰어금니가 시려요 / 똑같이 시려요"',
             '#17 endo-cr 필요 — 보호자 동의 필요 (전화 확인 /민)', '📷 방사선 1매 · 우클릭 판독문'] },
  { id:'e4',  date:'2026-04-30', type:'진료',  title:'근관치료 — #26 Caviton Sealing', doctor:'dr.조성아', teeth:[26],
    details:['inject 14:48 (dr이)'] },
  { id:'e5',  date:'2026-04-30', type:'진료',  title:'발수·근관확대·치근단·보철물제거', doctor:'dr.조성아', teeth:[17], code:'K04.01 비가역적 치수염',
    details:['치근단 1매 외 9개 항목'] },
  { id:'e6',  date:'2026-04-30', type:'진료',  title:'충전물 연마', doctor:'dr.조성아', teeth:[46], code:'K03.18 치아 마모', details:[] },
  { id:'e7',  date:'2026-04-30', type:'동의서', title:'[문진표/동의서] 근관치료 동의서', doctor:'2층 태블릿', teeth:[],
    details:['📍 2층 태블릿'] },
  { id:'e8',  date:'2026-04-30', type:'처방',  title:'원외 처방 — 경증 3일분', doctor:'dr.조성아', teeth:[],
    details:['씨트클러캡슐 250mg(세파클러) 외 1항목'] },
  { id:'e9',  date:'2026-03-10', type:'메모',  title:'환자 요청 — 발치를 4월 이후 희망', doctor:'염도윤', teeth:[], details:[] },
  { id:'e10', date:'2026-03-06', type:'메모',  title:'현재 치료계획 수립 (우측 참고)', doctor:'dr.진송아', teeth:[], details:[] },
  { id:'e11', date:'2024-01-24', type:'메모',  title:'최초 치료계획 수립 (초진)', doctor:'dr.김병훈', teeth:[], details:[] },
];

// 인과 체인(V-Model용): 같은 임상 문제 스레드를 잇는다
window.THREADS = [
  { id:'t26', label:'#26 — 우측 시림 → 근관치료', tooth:26, color:'#2563eb',
    steps:['e2','e4','e1'] },               // 시림CC → Sealing → 다음 크라운
  { id:'t17', label:'#17 — 시림 검사 → 비가역적 치수염', tooth:17, color:'#ea580c',
    steps:['e3','e5'] },                      // PI검사 → 발수/근관확대
  { id:'t46', label:'#46 — 치아 마모 충전물 연마', tooth:46, color:'#16a34a',
    steps:['e6'] },
  { id:'tplan', label:'치료계획 — 초진 → 수립 → 발치 보류', tooth:null, color:'#64748b',
    steps:['e11','e10','e9'] },
];

// 헬퍼
window.fmtDate = (d) => { const [y,m,day]=d.split('-'); return `${m}.${day}`; };
window.fmtYear = (d) => d.split('-')[0].slice(2);
window.byId = (id) => window.EVENTS.find(e=>e.id===id);
window.uniqueDates = () => [...new Set(window.EVENTS.map(e=>e.date))].sort();
window.dayCount = (date) => window.EVENTS.filter(e=>e.date===date).length;
