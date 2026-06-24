// Create a NEW staticrypt-encrypted page from plaintext content, reusing a template wrapper.
// usage: node enc-new.mjs <templateEncryptedHtml> <plaintextContent> <outFile>
import { webcrypto } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
const { subtle } = webcrypto;
const PASSWORD = '1111';

function hexParse(hex){const b=new Uint8Array(hex.length/2);for(let i=0;i<hex.length;i+=2)b[i/2]=parseInt(hex.substring(i,2+i),16);return b;}
function hexStringify(bytes){return Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join('');}
async function pbkdf2(password,salt,iterations,hash){const enc=new TextEncoder();const key=await subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);const bits=await subtle.deriveBits({name:'PBKDF2',hash,iterations,salt:enc.encode(salt)},key,256);return hexStringify(new Uint8Array(bits));}
async function hashPassword(password,salt){let h=await pbkdf2(password,salt,1000,'SHA-1');h=await pbkdf2(h,salt,14000,'SHA-256');h=await pbkdf2(h,salt,585000,'SHA-256');return h;}
async function encryptMsg(msg,hashedPassword){const iv=webcrypto.getRandomValues(new Uint8Array(16));const key=await subtle.importKey('raw',hexParse(hashedPassword),'AES-CBC',false,['encrypt']);const encrypted=await subtle.encrypt({name:'AES-CBC',iv},key,new TextEncoder().encode(msg));const encryptedHex=hexStringify(iv)+hexStringify(new Uint8Array(encrypted));const hmacKey=await subtle.importKey('raw',hexParse(hashedPassword),{name:'HMAC',hash:'SHA-256'},false,['sign']);const sig=await subtle.sign('HMAC',hmacKey,new TextEncoder().encode(encryptedHex));return hexStringify(new Uint8Array(sig))+encryptedHex;}
function extractSalt(html){const m=html.match(/"staticryptSaltUniqueVariableName":"([^"]+)"/);return m?m[1]:null;}
function replaceBlob(html,b){return html.replace(/"staticryptEncryptedMsgUniqueVariableName":"[^"]+"/,`"staticryptEncryptedMsgUniqueVariableName":"${b}"`);}

const [,,tmplFile,contentFile,outFile]=process.argv;
const tmpl=readFileSync(tmplFile,'utf8');
const content=readFileSync(contentFile,'utf8');
const salt=extractSalt(tmpl);
const hashed=await hashPassword(PASSWORD,salt);
const blob=await encryptMsg(content,hashed);
writeFileSync(outFile,replaceBlob(tmpl,blob),'utf8');
console.log(`encrypted ${contentFile} -> ${outFile} (salt ${salt.substring(0,8)}.., ${content.length} chars)`);
