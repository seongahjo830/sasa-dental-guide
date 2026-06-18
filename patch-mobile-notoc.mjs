// Patch all m/*.html: hide #toc (left sidebar) in mobile version
import { createHash } from 'crypto';
import { webcrypto } from 'crypto';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

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

const PASSWORD = '1111';
const NO_TOC_CSS = `<style id="mobile-notoc">#toc{display:none!important;}.wrap{display:block!important;}#main{width:100%!important;}</style>`;

const mDir = '내원별설명/m';
const files = readdirSync(mDir).filter(f => f.endsWith('.html'));

let count = 0;
for (const file of files) {
  const path = join(mDir, file);
  const html = readFileSync(path, 'utf8');
  const salt = extractSalt(html);
  const blob = extractBlob(html);
  if (!salt || !blob) { console.log(`skip (no salt/blob): ${file}`); continue; }

  const hashedPwd = await hashPassword(PASSWORD, salt);
  const decrypted = await decryptMsg(blob, hashedPwd);

  // Skip if already patched
  if (decrypted.includes('mobile-notoc')) {
    console.log(`already patched: ${file}`);
    continue;
  }

  // Inject CSS right before </head>
  const patched = decrypted.replace('</head>', `${NO_TOC_CSS}</head>`);

  const newBlob = await encryptMsg(patched, hashedPwd);
  const newHtml = replaceBlob(html, newBlob);
  writeFileSync(path, newHtml, 'utf8');
  console.log(`patched: ${file}`);
  count++;
}
console.log(`\nDone. ${count} files patched.`);
