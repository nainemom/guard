import{j as e,e as o,r as d,f,B as g,u as b,g as N,I as c,s as w}from"./index-c5eed8fe.js";import{u as k,i as y,j as v}from"./files-4f820b59.js";function C(t){return new Promise(n=>{var s;const a=()=>{prompt("Copy this to clipboard!",t),n()};(s=navigator==null?void 0:navigator.clipboard)!=null&&s.writeText?navigator.clipboard.writeText(t).then(()=>n()).catch(a):a()})}function L(t){return navigator.share({text:t})}function M(t){try{return L(t).then(()=>"os")}catch{return C(t).then(()=>"clipboard")}}const I={onMenu:()=>{},onClick:()=>{}};function P({children:t,className:n}){return e.jsx("ul",{className:o("x-list",n),children:t})}function T(t){const{children:n,className:a,clickable:s,selected:r,onClick:l,onMenu:u}={...I,...t},m=d.useCallback(x=>{x.preventDefault(),u(x)},[u]);return e.jsx("li",{className:o("x-list-item",s&&"x-list-item-clickable",r&&"x-list-item-selected",a),...s&&{onContextMenu:m,onClick:l,tabIndex:1},children:n})}function p(t){const{children:n,className:a,...s}={...f,...t};return e.jsx(g,{className:o("x-menu-activator",a),...s,children:n})}function i({children:t,className:n,onClick:a}){return e.jsx(T,{clickable:!0,className:o("p-3 py-3 min-h-[4.5rem] flex flex-row items-center gap-4",n),...a&&{onClick:a},children:t})}function A({children:t,className:n}){const a=d.Children.map(t,r=>(r==null?void 0:r.type)===p?r:null),s=d.Children.map(t,r=>(r==null?void 0:r.type)===i?r:null);return e.jsxs("div",{className:o("x-menu group",n),children:[a,e.jsx("div",{className:"hidden group-focus-within:block absolute bg-section-normal text-section-content shadow-2xl w-80 right-0 mt-4 mr-2 rounded-xl overflow-hidden z-10",children:e.jsx(P,{className:"!gap-0",children:s})})]})}function R({title:t,subtitle:n,startButtons:a}){const[s,r]=k(),l=b(),{pathname:u}=N(),m=()=>{if(!s)return;const h=y(s);v(h)},x=()=>{if(!s)return;const h=new URL(window.location.href);h.hash=`#/encrypt/${encodeURIComponent(s.public_key)}`,M(h.href).then(j=>{j==="clipboard"&&w("Share Link Copied To Clipboard!")})};return e.jsxs("header",{className:"h-[4.5rem] shrink-0 flex items-center bg-section-normal text-section-content p-3 gap-3",children:[a&&e.jsx("div",{children:a}),e.jsxs("div",{className:"flex-grow flex flex-row items-center gap-3",children:[e.jsx("img",{src:"/guard/logo_white.svg",className:"w-10 h-10",alt:"Guard Logo"}),e.jsxs("div",{children:[t&&e.jsx("h2",{className:"text-xl font-semibold",children:t}),n&&e.jsx("p",{className:"text-xs text-section-subtitle",children:n})]})]}),e.jsx("a",{className:"x-button x-button-transparent x-button-rounded x-button-lg x-button-circle",href:"https://github.com/nainemom/guard",target:"_blank","aria-label":"Github Page",children:e.jsx(c,{name:"github",className:"h-6 w-6"})}),e.jsxs(A,{children:[e.jsx(p,{circle:!0,theme:"transparent",size:"lg",ariaLabel:"Profile Menu",children:e.jsx(c,{name:"manage_accounts",className:"w-8 h-8"})}),s&&u!=="/decrypt"&&e.jsxs(i,{onClick:()=>l("/decrypt"),children:[e.jsx(c,{name:"drafts",className:"w-6 h-6"}),e.jsxs("div",{children:[e.jsx("h3",{children:"Decrypt"}),e.jsx("p",{className:"text-xs text-section-subtitle",children:"You can decrypt your encrypted message through this page"})]})]}),s&&e.jsxs(i,{onClick:()=>x(),children:[e.jsx(c,{name:"share",className:"w-6 h-6 shrink-0"}),e.jsxs("div",{children:[e.jsx("h3",{children:"Share"}),e.jsx("p",{className:"text-xs text-section-subtitle",children:"Create a unique url with your public key to let others encrypt data for you"})]})]}),s&&e.jsxs(i,{onClick:()=>m(),children:[e.jsx(c,{name:"save",className:"w-6 h-6 shrink-0"}),e.jsxs("div",{children:[e.jsx("h3",{children:"Export"}),e.jsx("p",{className:"text-xs text-section-subtitle",children:"Generate a .auth file from your account to access it in future"})]})]}),s&&e.jsxs(i,{onClick:()=>r(null),children:[e.jsx(c,{name:"logout",className:"w-6 h-6 shrink-0"})," Logout"]}),!s&&e.jsxs(i,{onClick:()=>l("/setup"),children:[e.jsx(c,{name:"login",className:"w-6 h-6"}),e.jsxs("div",{children:[e.jsx("h3",{children:"Login"}),e.jsx("p",{className:"text-xs text-section-subtitle",children:"Login to your own account or just generate a new account"})]})]})]})]})}export{R as H,M as s};
