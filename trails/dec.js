// Дешифрование страниц и картинок (AES-GCM, ключ из пароля через PBKDF2). Секретов здесь нет.
(function(){
var enc=new TextEncoder(),dec=new TextDecoder(),KEY="tp_k",$=function(i){return document.getElementById(i)};
function b64(s){return Uint8Array.from(atob(s),function(c){return c.charCodeAt(0)})}
function b64e(u){var s="";u.forEach(function(c){s+=String.fromCharCode(c)});return btoa(s)}
function stored(){try{return localStorage.getItem(KEY)||sessionStorage.getItem(KEY)}catch(e){return null}}
function save(raw,remember){try{(remember?localStorage:sessionStorage).setItem(KEY,b64e(new Uint8Array(raw)))}catch(e){}}
function forget(){try{localStorage.removeItem(KEY);sessionStorage.removeItem(KEY)}catch(e){}}
function fromRaw(b){return crypto.subtle.importKey("raw",b,"AES-GCM",false,["decrypt"])}
async function derive(pass,salt,iter){
  var base=await crypto.subtle.importKey("raw",enc.encode(pass),"PBKDF2",false,["deriveBits"]);
  return crypto.subtle.deriveBits({name:"PBKDF2",salt:salt,iterations:iter,hash:"SHA-256"},base,256);
}
function open(key,p){return crypto.subtle.decrypt({name:"AES-GCM",iv:b64(p.i)},key,b64(p.c))}
async function images(){
  var raw=stored(); if(!raw||!("IntersectionObserver" in window)) return;
  var key=await fromRaw(b64(raw));
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(!e.isIntersecting) return; var im=e.target; io.unobserve(im);
    fetch(im.dataset.e).then(function(r){return r.arrayBuffer()}).then(function(buf){
      var u=new Uint8Array(buf);
      return crypto.subtle.decrypt({name:"AES-GCM",iv:u.slice(0,12)},key,u.slice(12));
    }).then(function(pt){im.src=URL.createObjectURL(new Blob([pt],{type:im.dataset.t}))}).catch(function(){});
  })},{rootMargin:"400px"});
  document.querySelectorAll("img[data-e]").forEach(function(im){io.observe(im)});
}
function logoutLink(){
  var a=document.createElement("a");a.href="#";a.textContent="Выйти";a.style.cssText="position:fixed;right:8px;bottom:8px;font-size:12px;opacity:.6";
  a.onclick=function(e){e.preventDefault();forget();location.reload()};document.body.appendChild(a);
}
async function shell(){
  var p=JSON.parse($("p").textContent),form=$("f"),msg=$("m");
  function show(html){var go=function(){setTimeout(function(){document.open();document.write(html);document.close()},0)};if(document.readyState==="complete")go();else addEventListener("load",go)}
  var raw=stored();
  if(raw){var html;try{html=dec.decode(await open(await fromRaw(b64(raw)),p))}catch(e){forget()} if(html){show(html);return}}
  form.hidden=false;
  form.onsubmit=async function(ev){
    ev.preventDefault();msg.textContent="Проверяю…";
    try{
      var bits=await derive($("pw").value,b64(p.s),p.n);
      var h=dec.decode(await open(await fromRaw(bits),p));
      save(bits,$("rem").checked);
      show(h);
    }catch(e){msg.textContent="Неверный пароль";$("pw").select()}
  };
}
if($("p")) shell(); else {document.addEventListener("DOMContentLoaded",function(){images();logoutLink()});}
})();
