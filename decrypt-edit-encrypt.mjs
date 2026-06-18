// staticrypt decrypt → edit → re-encrypt script
import { createHash } from 'crypto';
import { webcrypto } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';

const { subtle } = webcrypto;

// --- crypto engine (same as staticrypt) ---
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
  const encryptedMsg = signedMsg.substring(64); // skip HMAC
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
  // HMAC
  const hmacKey = await subtle.importKey('raw', hexParse(hashedPassword), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await subtle.sign('HMAC', hmacKey, new TextEncoder().encode(encryptedHex));
  return hexStringify(new Uint8Array(sig)) + encryptedHex;
}

// --- extract blob from staticrypt html ---
function extractBlob(html) {
  const m = html.match(/"staticryptEncryptedMsgUniqueVariableName":"([^"]+)"/);
  return m ? m[1] : null;
}
function extractSalt(html) {
  const m = html.match(/"staticryptSaltUniqueVariableName":"([^"]+)"/);
  return m ? m[1] : null;
}
function replaceBlob(html, newBlob) {
  return html.replace(
    /"staticryptEncryptedMsgUniqueVariableName":"[^"]+"/,
    `"staticryptEncryptedMsgUniqueVariableName":"${newBlob}"`
  );
}

// --- main ---
const [,, inputFile, outputFile, mode] = process.argv;
// mode: 'decrypt' | 'encrypt' | 'patch-pc' | 'make-mobile'

const PASSWORD = '1111';
const html = readFileSync(inputFile, 'utf8');
const salt = extractSalt(html);
const blob = extractBlob(html);

console.log(`salt: ${salt}`);
console.log(`blob prefix: ${blob?.substring(0, 40)}...`);

const hashedPwd = await hashPassword(PASSWORD, salt);
console.log(`hashed: ${hashedPwd.substring(0, 20)}...`);

const decrypted = await decryptMsg(blob, hashedPwd);
console.log(`decrypted length: ${decrypted.length}`);

if (mode === 'decrypt') {
  writeFileSync(outputFile, decrypted, 'utf8');
  console.log(`Written to ${outputFile}`);
} else if (mode === 'patch-pc') {
  // Add 모바일버전 button to PC index.html
  const mobileBtn = `<a href="m/index.html" id="mobile-version-btn" style="
    position:fixed;top:16px;right:16px;z-index:9999;
    background:#1a73e8;color:#fff;border:none;border-radius:8px;
    padding:8px 16px;font-size:14px;font-weight:600;cursor:pointer;
    text-decoration:none;display:flex;align-items:center;gap:6px;
    box-shadow:0 2px 8px rgba(0,0,0,0.18);
  ">📱 모바일버전</a>`;

  let patched = decrypted;
  // Insert button right after <body> tag
  patched = patched.replace(/<body([^>]*)>/, `<body$1>\n${mobileBtn}`);

  const newBlob = await encryptMsg(patched, hashedPwd);
  const newHtml = replaceBlob(html, newBlob);
  writeFileSync(outputFile, newHtml, 'utf8');
  console.log(`PC patched and written to ${outputFile}`);
} else if (mode === 'make-mobile') {
  // Make mobile version: 1-column layout + PC버전 button
  let mobile = decrypted;

  // Add PC버전 button
  const pcBtn = `<a href="../index.html" id="pc-version-btn" style="
    position:fixed;top:16px;right:16px;z-index:9999;
    background:#34495e;color:#fff;border:none;border-radius:8px;
    padding:8px 16px;font-size:14px;font-weight:600;cursor:pointer;
    text-decoration:none;display:flex;align-items:center;gap:6px;
    box-shadow:0 2px 8px rgba(0,0,0,0.18);
  ">🖥️ PC버전</a>`;
  mobile = mobile.replace(/<body([^>]*)>/, `<body$1>\n${pcBtn}`);

  // Convert 2-col grid to 1-col for cards
  // target common grid patterns used in the index
  mobile = mobile
    .replace(/grid-template-columns:\s*repeat\(2[^;)]+\)/g, 'grid-template-columns: 1fr')
    .replace(/grid-template-columns:\s*1fr\s+1fr/g, 'grid-template-columns: 1fr')
    .replace(/columns:\s*2/g, 'columns: 1')
    .replace(/max-width:\s*1240px/g, 'max-width: 100%')
    .replace(/max-width:\s*1200px/g, 'max-width: 100%');

  // 링크들의 PC 경로를 모바일(m/) 상대경로로 수정 - 개별 치료 페이지는 같은 폴더에 있으므로 그대로

  const mSalt = extractSalt(readFileSync(inputFile.replace('index.html', 'm/index.html'), 'utf8'));
  const mHashedPwd = await hashPassword(PASSWORD, mSalt);
  const newBlob = await encryptMsg(mobile, mHashedPwd);

  const templateHtml = readFileSync(inputFile.replace('index.html', 'm/index.html'), 'utf8');
  const newHtml = replaceBlob(templateHtml, newBlob);
  writeFileSync(outputFile, newHtml, 'utf8');
  console.log(`Mobile version written to ${outputFile}`);
}
