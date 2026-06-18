// 진료실상황.html 에 셀링 인트로(_intro_fragment.html)를 주입한다.
//  node patch-intro.mjs preview   → _tmp_board_with_intro.html (복호화 보드 + 인트로) 생성 (로컬 검증용)
//  node patch-intro.mjs encrypt   → 진료실상황.html 재암호화(인트로 주입) (실배포 대상)
import { webcrypto } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
const { subtle } = webcrypto;

const PASSWORD = '1111';
const TARGET = '진료실상황.html';
const FRAGMENT = '_intro_fragment.html';
const PREVIEW = '_tmp_board_with_intro.html';
const START = '<!-- ===== SB-INTRO (셀링 인트로 투어) START';
const END = '<!-- ===== SB-INTRO END ===== -->';

// ---- staticrypt crypto (decrypt-edit-encrypt.mjs와 동일) ----
const hexParse = h => { const b = new Uint8Array(h.length/2); for(let i=0;i<h.length;i+=2)b[i/2]=parseInt(h.substring(i,2+i),16); return b; };
const hexStr = b => Array.from(b).map(x=>x.toString(16).padStart(2,'0')).join('');
async function pbkdf2(pw,salt,it,hash){const e=new TextEncoder();const k=await subtle.importKey('raw',e.encode(pw),'PBKDF2',false,['deriveBits']);const bits=await subtle.deriveBits({name:'PBKDF2',hash,iterations:it,salt:e.encode(salt)},k,256);return hexStr(new Uint8Array(bits));}
async function hashPassword(pw,salt){let h=await pbkdf2(pw,salt,1000,'SHA-1');h=await pbkdf2(h,salt,14000,'SHA-256');return pbkdf2(h,salt,585000,'SHA-256');}
async function decryptMsg(signed,hp){const m=signed.substring(64);const iv=hexParse(m.substring(0,32));const ct=hexParse(m.substring(32));const k=await subtle.importKey('raw',hexParse(hp),'AES-CBC',false,['decrypt']);return new TextDecoder().decode(await subtle.decrypt({name:'AES-CBC',iv},k,ct));}
async function encryptMsg(msg,hp){const iv=webcrypto.getRandomValues(new Uint8Array(16));const k=await subtle.importKey('raw',hexParse(hp),'AES-CBC',false,['encrypt']);const enc=await subtle.encrypt({name:'AES-CBC',iv},k,new TextEncoder().encode(msg));const hex=hexStr(iv)+hexStr(new Uint8Array(enc));const hk=await subtle.importKey('raw',hexParse(hp),{name:'HMAC',hash:'SHA-256'},false,['sign']);const sig=await subtle.sign('HMAC',hk,new TextEncoder().encode(hex));return hexStr(new Uint8Array(sig))+hex;}
const extract = (h,k)=>{const m=h.match(new RegExp(`"${k}":"([^"]+)"`));return m?m[1]:null;};
const replaceBlob=(h,b)=>h.replace(/"staticryptEncryptedMsgUniqueVariableName":"[^"]+"/,`"staticryptEncryptedMsgUniqueVariableName":"${b}"`);

// 프래그먼트에서 START~END 블록만 추출
function fragment(){
  const f = readFileSync(FRAGMENT,'utf8');
  const s = f.indexOf(START), e = f.indexOf(END);
  if(s<0||e<0) throw new Error('fragment markers not found');
  return f.substring(s, e+END.length);
}
// 기존 주입분 제거(idempotent) 후 <body> 직후 재주입
function inject(plain){
  let out = plain;
  const s = out.indexOf(START);
  if(s>=0){ const e=out.indexOf(END); out = out.substring(0,s)+out.substring(e+END.length); out = out.replace(/\n[ \t]*\n([ \t]*<\/?)/, '\n$1'); }
  const frag = fragment();
  return out.replace(/<body([^>]*)>/i, (m)=> m+'\n'+frag+'\n');
}

const mode = process.argv[2] || 'preview';
const html = readFileSync(TARGET,'utf8');
const salt = extract(html,'staticryptSaltUniqueVariableName');
const blob = extract(html,'staticryptEncryptedMsgUniqueVariableName');
const hp = await hashPassword(PASSWORD, salt);
const plain = await decryptMsg(blob, hp);
const patched = inject(plain);

if(mode==='preview'){
  writeFileSync(PREVIEW, patched, 'utf8');
  console.log(`✅ preview written: ${PREVIEW} (${patched.length} chars, intro ${patched.includes(START)?'OK':'MISSING'})`);
} else if(mode==='encrypt'){
  const newBlob = await encryptMsg(patched, hp);
  const newHtml = replaceBlob(html, newBlob);
  writeFileSync(TARGET, newHtml, 'utf8');
  // 검증: 다시 복호화해서 마커 존재 확인
  const verifyBlob = extract(newHtml,'staticryptEncryptedMsgUniqueVariableName');
  const verifyPlain = await decryptMsg(verifyBlob, hp);
  const ok = verifyPlain.includes(START) && verifyPlain.includes(END);
  console.log(`✅ encrypted into ${TARGET}. round-trip verify: ${ok?'PASS (intro present)':'FAIL'}`);
  if(!ok) process.exit(1);
} else {
  console.log('mode? preview | encrypt');
}
