'use strict';
// This worker only handles the private reception app. Guest pages and APIs
// are never cached or intercepted by its navigation strategy.
const CACHE='reception-private-shell-__RECEPTION_VERSION__';
const HOME='/reception';
const ASSETS=[HOME,'/reception/desk.css','/reception/brand.css','/reception/desk.js','/reception/manifest.webmanifest','/reception/icon.svg','/reception/icon-192.png','/reception/icon-512.png','/reception/logo-dark.svg','/reception/logo-light.svg','/reception/logo-date.svg','/reception/inter-latin.woff2','/reception/cormorant-garamond-latin.woff2','/reception/cormorant-garamond-italic-latin.woff2','/reception/great-vibes-latin.woff2'];
async function saveShell(){
 const downloaded=[];
 for(const path of ASSETS){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
  let response;try{response=await fetch(path,{credentials:'same-origin',cache:'reload',signal:controller.signal});}finally{clearTimeout(timeout);}
  if(!response.ok||response.redirected||(path===HOME&&response.headers.get('x-reception-shell')!=='1'))throw new Error('Open and sign in online before offline preparation.');
  const bytes=await response.arrayBuffer();
  const headers=new Headers(response.headers);headers.delete('content-encoding');headers.delete('content-length');headers.delete('transfer-encoding');
  downloaded.push([path,new Response(bytes,{status:response.status,headers})]);
 }
 const cache=await caches.open(CACHE);
 for(const [path,response]of downloaded)await cache.put(path,response);
}
self.addEventListener('install',event=>event.waitUntil((async()=>{await saveShell();await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith('reception-private-shell-')&&name!==CACHE)await caches.delete(name);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'&&(url.pathname===HOME||url.pathname===HOME+'/')){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE),saved=await cache.match(HOME);
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),2500);
   try{
    const response=await fetch(request,{signal:controller.signal});
    if(response.ok&&!response.redirected&&response.headers.get('x-reception-shell')==='1'){await cache.put(HOME,response.clone());return response;}
    // An online sign-in redirect or access denial must never reveal a cached
    // private page. Only connection/server failures use the saved device copy.
    if(response.status>=500&&saved)return saved;
    return response;
   }catch{if(saved)return saved;return new Response('Open Reception Desk online and prepare this device before using it offline.',{status:503,headers:{'content-type':'text/plain;charset=utf-8'}});}
   finally{clearTimeout(timeout);}
  })());return;
 }
 if(ASSETS.includes(url.pathname)&&url.pathname!==HOME)event.respondWith((async()=>{
  const cache=await caches.open(CACHE);return await cache.match(url.pathname)||fetch(request);
 })());
});
self.addEventListener('message',event=>{
 if(event.data?.type!=='SAVE_SHELL')return;
 event.waitUntil((async()=>{try{await saveShell();event.ports[0]?.postMessage({ok:true});}catch{event.ports[0]?.postMessage({ok:false});}})());
});
