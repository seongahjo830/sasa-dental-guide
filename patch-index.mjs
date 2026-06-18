// staticrypt decrypt → patch PC + make mobile → re-encrypt
import { webcrypto } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';

const { subtle } = webcrypto;

function hexParse(hex) {
  const buf = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) buf[i / 2] = parseInt(hex.substring(i, 2 + i), 16);
  return buf;
}
function hexStringify(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
async function pbkdf2(password, salt, iterations, hash) {
  const enc = new TextEncoder();
  const key = await subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await subtle.deriveBits({ name: 'PBKDF2', hash, iterations, salt: enc.encode(salt) }, key, 256);
  return hexStringify(new Uint8Array(bits));
}
async function hashPassword(password, salt) {
  let h = await pbkdf2(password, salt, 1000, 'SHA-1');
  h = await pbkdf2(h, salt, 14000, 'SHA-256');
  h = await pbkdf2(h, salt, 585000, 'SHA-256');
  return h;
}
async function decryptMsg(signedMsg, hashedPassword) {
  const encryptedMsg = signedMsg.substring(64);
  const iv = hexParse(encryptedMsg.substring(0, 32));
  const ciphertext = hexParse(encryptedMsg.substring(32));
  const key = await subtle.importKey('raw', hexParse(hashedPassword), 'AES-CBC', false, ['decrypt']);
  const decrypted = await subtle.decrypt({ name: 'AES-CBC', iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}
async function encryptMsg(msg, hashedPassword) {
  const iv = webcrypto.getRandomValues(new Uint8Array(16));
  const key = await subtle.importKey('raw', hexParse(hashedPassword), 'AES-CBC', false, ['encrypt']);
  const encrypted = await subtle.encrypt({ name: 'AES-CBC', iv }, key, new TextEncoder().encode(msg));
  const encryptedHex = hexStringify(iv) + hexStringify(new Uint8Array(encrypted));
  const hmacKey = await subtle.importKey('raw', hexParse(hashedPassword), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await subtle.sign('HMAC', hmacKey, new TextEncoder().encode(encryptedHex));
  return hexStringify(new Uint8Array(sig)) + encryptedHex;
}
function extractBlob(html) { return html.match(/"staticryptEncryptedMsgUniqueVariableName":"([^"]+)"/)?.[1]; }
function extractSalt(html) { return html.match(/"staticryptSaltUniqueVariableName":"([^"]+)"/)?.[1]; }
function replaceBlob(html, newBlob) {
  return html.replace(/"staticryptEncryptedMsgUniqueVariableName":"[^"]+"/, `"staticryptEncryptedMsgUniqueVariableName":"${newBlob}"`);
}

const PASSWORD = '1111';

// --- 1. Decrypt PC index.html ---
const pcTemplate = readFileSync('내원별설명/index.html', 'utf8');
const salt = extractSalt(pcTemplate);
const hashedPwd = await hashPassword(PASSWORD, salt);
const pcSource = await decryptMsg(extractBlob(pcTemplate), hashedPwd);

// --- 2. Patch PC: 오른쪽 위 모바일버전 버튼 추가 ---
const mobileBtn = `<a href="m/index.html" style="position:fixed;top:14px;right:14px;z-index:9999;background:#1D4ED8;color:#fff;border-radius:10px;padding:8px 15px;font-size:13.5px;font-weight:700;text-decoration:none;display:flex;align-items:center;gap:5px;box-shadow:0 2px 10px rgba(29,78,216,.35);">📱 모바일버전</a>`;
const pcPatched = pcSource.replace('<body>', `<body>\n${mobileBtn}`);

const pcNewBlob = await encryptMsg(pcPatched, hashedPwd);
writeFileSync('내원별설명/index.html', replaceBlob(pcTemplate, pcNewBlob), 'utf8');
console.log('✅ PC index.html 패치 완료 (모바일버전 버튼 추가)');

// --- 3. Make mobile version ---
// mobile용 CSS 수정: 1열 고정, max-width 제거, 모바일 최적화
let mobileSource = pcSource;

// PC버전 버튼 (모바일버전 버튼 대신)
const pcBtn = `<a href="../index.html" style="position:fixed;top:14px;right:14px;z-index:9999;background:#374151;color:#fff;border-radius:10px;padding:8px 15px;font-size:13.5px;font-weight:700;text-decoration:none;display:flex;align-items:center;gap:5px;box-shadow:0 2px 10px rgba(0,0,0,.2);">🖥️ PC버전</a>`;

// CSS 패치: wrap max-width 제거, grid 1열, 미디어쿼리 1열
mobileSource = mobileSource
  // wrap: 양쪽 패딩 줄이고 max-width 제거
  .replace('.wrap{max-width:1180px;margin:0 auto;padding:24px 22px 90px;}',
           '.wrap{max-width:100%;margin:0 auto;padding:16px 14px 80px;}')
  // 바둑판 grid → 1열 고정
  .replace('grid-template-columns:repeat(auto-fill,minmax(244px,1fr));gap:16px;',
           'grid-template-columns:1fr;gap:12px;')
  // wide 카드 임플란트 4단계: 2열로
  .replace('grid-template-columns:repeat(4,1fr);gap:10px;',
           'grid-template-columns:repeat(2,1fr);gap:8px;')
  // 회차 버튼: 3열로 (기존 auto-fill minmax 72px → 3열)
  .replace('grid-template-columns:repeat(auto-fill,minmax(72px,1fr));',
           'grid-template-columns:repeat(3,1fr);')
  // 미디어쿼리 max-width:560px → 1열 이미 적용되니 삭제 or 재정의
  .replace('@media(max-width:560px){  .wrap{padding:18px 14px 80px;}  .grid{grid-template-columns:1fr 1fr;gap:12px;}  .nm{font-size:15px;padding:11px 12px 9px;}  .visits{grid-template-columns:1fr 1fr;padding:0 11px 12px;}}',
           '@media(max-width:560px){.nm{font-size:15px;padding:11px 12px 9px;}}')
  // 폰트 살짝 축소
  .replace('body{font-size:17px;', 'body{font-size:16px;');

// 홈바 링크: PC인덱스→ ../ 로 수정
mobileSource = mobileSource
  .replace('href="../index.html"', 'href="../../index.html"')
  .replace('href="증상별치료.html"', 'href="../증상별치료.html"');

// 카드 href 링크: 상대경로 ../로 수정 (파일들이 부모 폴더에 있으므로)
// VISITS의 파일 링크들: 'XX_치료명.html' → '../XX_치료명.html'
mobileSource = mobileSource
  .replace(/href="((?:\d\d_[^"]+|00_[^"]+)\.html(?:#[^"]+)?)"(?! *→)/g, 'href="../$1"');

// img src: card/ → ../card/
mobileSource = mobileSource.replace(/img\.src='card\//g, "img.src='../card/");

// PC버튼으로 교체 (모바일버전 버튼이 있다면 제거, pcBtn 삽입)
mobileSource = mobileSource.replace('<body>', `<body>\n${pcBtn}`);

// m/index.html 에 같은 salt로 암호화
const mTemplate = readFileSync('내원별설명/m/index.html', 'utf8');
const mSalt = extractSalt(mTemplate);
const mHashedPwd = await hashPassword(PASSWORD, mSalt);
const mNewBlob = await encryptMsg(mobileSource, mHashedPwd);
writeFileSync('내원별설명/m/index.html', replaceBlob(mTemplate, mNewBlob), 'utf8');
console.log('✅ m/index.html 모바일버전 생성 완료 (1열, PC버전 버튼)');
