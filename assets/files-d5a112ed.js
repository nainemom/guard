import{j as i,e as E,r as u,u as N}from"./index-1813056b.js";function $({children:e,stickyArea:n,stickyPadding:t,className:s}){return i.jsxs("div",{className:"flex-grow overflow-hidden relative contain-layout",children:[i.jsx("div",{className:E("overflow-auto h-full",n&&t&&"pb-12",s),children:e}),n&&i.jsx("div",{className:"fixed w-full left-0 bottom-0 p-3 h-auto flex flex-row justify-end pointer-events-none",children:i.jsx("div",{className:"pointer-events-auto",children:n})})]})}function z({children:e}){return i.jsx("div",{className:"h-full min-h-full flex flex-col",children:e})}const O=(e,n)=>{const t=()=>{const c=localStorage.getItem(e);let l;try{c===null?l=n:l=JSON.parse(c)}catch{l=n}finally{return l}},[s,a]=u.useState(t()),o=()=>a(t()),r=c=>{if(c===null)localStorage.removeItem(e);else{const l=JSON.stringify(c);localStorage.setItem(e,l)}window.dispatchEvent(new StorageEvent("storage",{key:e}))};return u.useEffect(()=>(window.addEventListener("storage",o),()=>window.removeEventListener("storage",o)),[]),u.useMemo(()=>[s,r],[s])},k="guard-auth",v=()=>O(k,null),P=()=>{const[e]=v();return(e==null?void 0:e.public_key)&&`/encrypt/${encodeURIComponent(e.public_key)}`},J=()=>{const[e]=v(),n=N();u.useEffect(()=>{e!=null&&e.private_key||n("/setup")},[e])},f="RSA-OAEP",b=512,I="auth",_="text/plain",F="SHA-1",w=e=>btoa(new Uint8Array(e).reduce((n,t)=>n+String.fromCharCode(t),"")),L=e=>Uint8Array.from(atob(e),n=>n.charCodeAt(0)),T=e=>new TextDecoder().decode(e),S=e=>new TextEncoder().encode(e),j=e=>{const n=new ArrayBuffer(e.reduce((s,a)=>s+a.byteLength,0)),t=new Uint8Array(n);return e.reduce((s,a)=>(t.set(new Uint8Array(a),s),s+a.byteLength),0),n},V=e=>e/8,M=e=>e/8-2*b/8-2,Y=async(e=2048)=>{const n=await crypto.subtle.generateKey({name:f,modulusLength:e,publicExponent:new Uint8Array([1,0,1]),hash:`SHA-${b}`},!0,["encrypt","decrypt"]),[t,s]=await Promise.all([crypto.subtle.exportKey("spki",n.publicKey),crypto.subtle.exportKey("pkcs8",n.privateKey)]);return{public_key:w(t),private_key:w(s)}},D=async(e,n,t)=>{const s=t||(()=>{});let a=0;s(a,e.byteLength);const o=await crypto.subtle.importKey("pkcs8",L(n),{name:f,hash:`SHA-${b}`},!1,["decrypt"]);let r=[];const c=V(o.algorithm.modulusLength);do{const l=Math.min(a+c,e.byteLength);r=[...r,await crypto.subtle.decrypt({name:f},o,e.slice(a,l))],a=l,s(a,e.byteLength)}while(a<e.byteLength);return j(r)},G=async(e,n,t)=>{const s=t||(()=>{});let a=0;s(a,e.byteLength);const o=await crypto.subtle.importKey("spki",L(n),{name:f,hash:`SHA-${b}`},!1,["encrypt"]);let r=[];const c=M(o.algorithm.modulusLength);do{const l=Math.min(a+c,e.byteLength);r=[...r,await crypto.subtle.encrypt({name:f},o,e.slice(a,l))],a=l,s(a,e.byteLength)}while(a<e.byteLength);return j(r)},g=new Map,X=e=>{if(g.has(e)){const t=g.get(e);return t instanceof Promise?t:Promise.resolve(t)}const n=crypto.subtle.digest(F,S(e)).then(t=>w(t)).catch(t=>{throw g.delete(e),t});return g.set(e,n),n},A=u.createContext(null);function Z({children:e,className:n,value:t,onInput:s,onSubmit:a,validator:o}){const[r,c]=u.useState(t||{}),[l,m]=u.useState({});u.useEffect(()=>{s(r)},[r]),u.useEffect(()=>{t&&c(t)},[t]);const h=u.useCallback((x,p)=>{c(C=>({...C,[x]:p}))},[c]),d=u.useMemo(()=>[r,h,l],[r,h,l]),y=u.useCallback(x=>{if(x.preventDefault(),o){const p=o(r);if(Object.keys(p).length>0){m(p);return}}a&&a(r)},[r,a]);return i.jsx(A.Provider,{value:d,children:i.jsx("form",{onSubmit:y,className:E(n),children:e})})}function U({label:e}){return typeof e=="string"?i.jsx("label",{className:"block text-base mb-1",children:e}):i.jsx(i.Fragment,{})}function B({error:e}){return typeof e=="string"?i.jsx("p",{className:"text-xs mt-3 text-danger-normal",children:e}):i.jsx(i.Fragment,{})}const R=(e,n)=>{const t=u.useContext(A);if(!t)return u.useMemo(()=>[e.value,e.onInput||(()=>{}),!1],[e]);const[s,a,o]=t,r=u.useMemo(()=>{if(!e.name)throw new Error("Form field must have name!");return s&&Object.hasOwnProperty.call(s,e.name)?s[e.name]:n},[s,e]),c=u.useMemo(()=>{if(!e.name)throw new Error("Form field must have name!");return Object.hasOwnProperty.call(o,e.name)&&(o==null?void 0:o[e.name])||!1},[o,e]),l=u.useCallback(m=>{if(!e.name)throw new Error("Form field must have name!");return a(e.name,m)},[a]);return u.useMemo(()=>[r,l,c],[r,l,c])};const H={size:"md"};function q(e){const{className:n,size:t,placeholder:s,readOnly:a,multiLine:o,...r}={...H,...e},[c,l,m]=R(r,""),h=u.useMemo(()=>o?"textarea":"input",[o]);return i.jsxs(i.Fragment,{children:[i.jsx(U,{label:r.label}),i.jsx(h,{className:E("x-input",`x-input-${t}`,n),value:c,placeholder:s,readOnly:a,onInput:d=>{var y;return l((y=d==null?void 0:d.target)==null?void 0:y.value)}}),i.jsx(B,{error:m})]})}const Q=e=>new File([S(JSON.stringify(e))],`guard_access_key.${I}`,{type:_}),W=async e=>JSON.parse(T(await e.arrayBuffer())),ee=e=>new Promise(n=>{const t=URL.createObjectURL(e),s=document.createElement("a");s.href=t,s.download=e.name,document.body.appendChild(s),setTimeout(()=>{s.click(),n(),setTimeout(()=>{document.body.removeChild(s),window.URL.revokeObjectURL(t)},100)},100)}),te=()=>new Promise((e,n)=>{const t=document.createElement("input");t.type="file",t.name="file",t.style.position="fixed",t.style.top="-999px",document.body.appendChild(t);const s=a=>{var r,c;const o=(c=(r=a==null?void 0:a.target)==null?void 0:r.files)==null?void 0:c[0];o?e(o):n(),t.removeEventListener("change",s),document.body.removeChild(t)};t.addEventListener("change",s),setTimeout(()=>{t.click()},100)});export{$ as B,Z as F,q as I,z as L,te as a,w as b,P as c,D as d,G as e,L as f,Y as g,X as h,T as i,Q as j,ee as k,J as n,W as o,S as s,v as u};