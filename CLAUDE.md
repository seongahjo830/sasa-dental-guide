# sasa-dental-guide — Claude 작업 지침

## 레포 기본 정보
- **로컬 경로**: `C:\myhome\sasa-dental-guide\`
- **GitHub**: https://github.com/seongahjo830/sasa-dental-guide
- **배포 URL**: https://seongahjo830.github.io/sasa-dental-guide/
- **배포 방식**: GitHub Pages (**master** 브랜치 push → 자동 배포, 보통 1~2분 소요)
- **빌드 도구 없음**: 순수 정적 HTML/CSS/JS. 빌드 단계 없음. 파일 수정 → git push = 배포 완료.

---

## 파일 구조 — 어디를 수정하면 되나

```
sasa-dental-guide/
├── index.html                  ← 메인 랜딩 페이지 (https://.../index.html)
├── 전략페이지.html
├── 홍보페이지.html
├── 차트확인.html
├── 치료계획.html
├── 진료실상황.html / 진료실상황-자세히.html
├── 확장비전.html
├── 제작과정.html / 진행상황.html
│
├── 내원별설명/
│   ├── index.html              ← 내원별설명 목록 페이지
│   ├── 00_검사진단.html
│   ├── 01_레진.html            ← 치료별 환자설명 페이지 (00~26)
│   ├── ...
│   ├── 26_구내염.html
│   ├── 증상별치료.html
│   ├── m/                      ← 모바일 버전 (내원별설명과 1:1 대응)
│   │   ├── index.html
│   │   ├── 00_검사진단.html
│   │   └── ... (동일 파일명)
│   ├── card/                   ← 각 치료별 카드 이미지 (.jpg)
│   ├── img/                    ← 본문 삽입 이미지
│   └── _백업-.../              ← 건드리지 말 것 (백업용)
│
├── demo/                       ← 시연용 경량 버전 (실제 서비스 아님)
├── tour.css / tour.js          ← 전체 공통 스타일·스크립트 (여기 바꾸면 전체 영향)
└── .nojekyll                   ← GitHub Pages Jekyll 비활성화 (건드리지 말 것)
```

### 버전 파일 규칙
`내원별설명/` 아래 `01_레진_v0.html`, `01_레진_v1.html` 등은 **이전 버전 백업**. 실제 서비스되는 파일은 **버전 번호 없는 것** (`01_레진.html`).  
→ 수정 요청이 오면 버전 없는 파일을 수정할 것. 버전 파일은 건드리지 말 것.

### PC vs 모바일
- `내원별설명/XX_치료명.html` = PC 버전
- `내원별설명/m/XX_치료명.html` = 모바일 버전
- 내용 수정 시 보통 **둘 다 수정**해야 함. 사용자가 "PC만" 또는 "모바일만"이라고 하면 해당만.

---

## 수정 → 배포 워크플로우

```powershell
# 1. 파일 수정 (Edit 도구)
# 2. 커밋 & 푸시
cd C:\myhome\sasa-dental-guide
git add <수정한파일>
git commit -m "fix: 설명 수정 내용 한 줄"
git push origin master
# → GitHub Pages 자동 배포 (1~2분 후 반영)
```

---

## 자주 쓰는 패턴

### 특정 치료 페이지 수정
"레진 설명 수정해줘" → `내원별설명/01_레진.html` + `내원별설명/m/01_레진.html` 둘 다 수정.

### 전체 공통 스타일 수정
`tour.css` 수정 (+ `demo/tour.css`도 동일하게 반영 여부 확인).

### 새 치료 페이지 추가
기존 치료 HTML을 복사해 번호 순서대로 추가 → `내원별설명/index.html`의 목록도 갱신.

### GitHub 링크로 파일 특정해서 요청이 올 때
예: `https://github.com/seongahjo830/sasa-dental-guide/blob/main/내원별설명/01_레진.html`
→ 로컬 경로 `C:\myhome\sasa-dental-guide\내원별설명\01_레진.html` 로 바로 매핑.

---

## 주의사항
- 🚫 **새 창/새 탭/팝업으로 절대 열지 말 것 (최우선 규칙)**: 이 사이트의 **모든 링크 — 내부 페이지든 외부 사이트(논문·근거 출처)든 예외 없이 — 같은 탭에서 이동**해야 한다. `<a>`에 `target="_blank"` 절대 금지(외부 링크도 금지), JS `window.open(...)` 금지, `openmode=window`·`newpane` 금지. **새 HTML을 만들 때는 반드시 이 CLAUDE.md를 먼저 읽고**, 기존 페이지를 복사·참고하더라도 `target="_blank"`가 따라 들어오지 않게 점검할 것(02-tooth.html 등 옛 페이지에 남아 있던 것을 무심코 복제하는 사고가 실제로 났음). 커밋 전 `grep -rn 'target="_blank"\|window.open' *.html` = 0 확인 필수.
  - 이력: 2026-06-19 ① 차트제작과정.html 참고자료 9개 수정 → ② emr-철학 9개 페이지·emr-가독성가이드·신규 3페이지(시간지도/공간지도/감정과스토리)의 `target="_blank"` 19개 전수 제거.
- `_백업-*/` 폴더, `*_v0.html` `*_v1.html` 등 버전 파일 = **읽기 전용 백업**, 수정 금지.
- `.nojekyll` 삭제 금지.
- 이미지(`img/`, `card/`) 교체 시 파일명 유지 (HTML에서 하드코딩된 경로 다수).
- 배포 URL의 페이지 = GitHub Pages 1~2분 딜레이 있음. push 직후 안 보이면 정상.
