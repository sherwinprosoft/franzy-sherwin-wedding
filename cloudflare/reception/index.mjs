const MAX_FILE = 80 * 1024 * 1024;
const FILE_TYPE = /^(video\/(mp4|quicktime|webm)|audio\/(mpeg|mp4|x-m4a|wav|x-wav|webm|ogg|aac)|image\/(png|jpeg|webp)|application\/pdf)$/;
const ID = /^[a-zA-Z0-9-]{12,100}$/;
const noCache = {'cache-control':'private, no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'};
const json=(data,status=200)=>Response.json(data,{status,headers:noCache});
const equal=(a,b)=>{if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;};
const rowData=row=>({key:row.key,data:JSON.parse(row.value),rev:row.revision,updatedAt:row.updated_at,updatedBy:row.updated_by});
async function parse(request,limit=100000){
 if(Number(request.headers.get('content-length')||0)>limit)throw new Error('BODY_LIMIT');
 const reader=request.body?.getReader();if(!reader)throw new Error('BODY_INVALID');
 const chunks=[];let total=0;
 while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>limit){await reader.cancel();throw new Error('BODY_LIMIT');}chunks.push(value);}
 const text=await new Blob(chunks).text();return JSON.parse(text);
}
function validRecord(key,data){
 if(typeof key!=='string'||!/^(event|live|notes|cue:[a-zA-Z0-9-]{1,80}|task:[a-zA-Z0-9-]{1,80}|contact:[a-zA-Z0-9-]{1,80}|media:[a-zA-Z0-9-]{1,80})$/.test(key))return false;
 if(data===null)return !['event','live','notes'].includes(key);
 if(typeof data!=='object'||Array.isArray(data)||JSON.stringify(data).length>80000)return false;
 if(key==='event')return typeof data.couple==='string'&&typeof data.start==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(data.start);
 if(key==='live')return (data.cueId===null||typeof data.cueId==='string')&&typeof data.paused==='boolean'&&Number.isFinite(data.elapsedMs)&&data.elapsedMs>=0&&Number.isFinite(data.startedAt);
 if(key==='notes')return typeof data.body==='string';
 if(key.startsWith('cue:'))return typeof data.title==='string'&&Number.isFinite(data.duration)&&data.duration>=1&&data.duration<=240&&Number.isFinite(data.position)&&typeof data.done==='boolean';
 if(key.startsWith('task:'))return typeof data.text==='string'&&typeof data.done==='boolean';
 if(key.startsWith('contact:'))return typeof data.name==='string'&&typeof data.role==='string';
 if(key.startsWith('media:'))return typeof data.title==='string'&&typeof data.url==='string'&&['file','link'].includes(data.kind);
 return false;
}
async function state(env){
 const rows=await env.DB.prepare('SELECT key,value,revision,updated_at,updated_by FROM reception_records').all();
 return json({records:Object.fromEntries(rows.results.map(row=>[row.key,rowData(row)])),serverTime:new Date().toISOString()});
}
async function sync(request,env){
 const op=await parse(request);
 if(!op||!ID.test(op.id||'')||!Number.isSafeInteger(op.baseRev)||op.baseRev<0||!validRecord(op.key,op.data))return json({error:'Invalid update'},400);
 const now=new Date().toISOString(),actor=(request.headers.get('x-reception-actor')||'Reception team').slice(0,100),value=JSON.stringify(op.data);
 // All compare-and-swap and acknowledgement statements run in one D1 batch
 // transaction. Retried operation IDs preserve their original acknowledgement.
 const result=await env.DB.batch([
  env.DB.prepare('INSERT OR IGNORE INTO reception_records(key,value,revision,updated_at,last_op,updated_by) SELECT ?,?,1,?,?,? WHERE ?=0 AND NOT EXISTS(SELECT 1 FROM reception_operations WHERE id=?)').bind(op.key,value,now,op.id,actor,op.baseRev,op.id),
  env.DB.prepare('UPDATE reception_records SET value=?,revision=revision+1,updated_at=?,last_op=?,updated_by=? WHERE key=? AND revision=? AND ?>0 AND NOT EXISTS(SELECT 1 FROM reception_operations WHERE id=?)').bind(value,now,op.id,actor,op.key,op.baseRev,op.baseRev,op.id),
  env.DB.prepare('INSERT OR IGNORE INTO reception_operations(id,key,value,revision,updated_at,updated_by) SELECT ?,key,value,revision,updated_at,updated_by FROM reception_records WHERE key=? AND last_op=?').bind(op.id,op.key,op.id),
  env.DB.prepare('SELECT key,value,revision,updated_at,updated_by FROM reception_operations WHERE id=?').bind(op.id),
  env.DB.prepare('SELECT key,value,revision,updated_at,updated_by FROM reception_records WHERE key=?').bind(op.key),
 ]);
 const ack=result[3].results[0],current=result[4].results[0];
 if(ack&&ack.key===op.key)return json({record:rowData(ack)});
 return json({error:'This item changed on another device.',current:current?rowData(current):{key:op.key,data:null,rev:0}},409);
}
async function loginAttempt(request,env,clear){
 const {key}=await parse(request,1000);if(!/^[a-f0-9]{64}$/.test(key||''))return json({error:'Invalid request'},400);
 if(clear){await env.DB.prepare('DELETE FROM reception_login_attempts WHERE key=?').bind(key).run();return json({ok:true});}
 const now=Date.now(),windowMs=15*60*1000;
 const result=await env.DB.batch([
  env.DB.prepare('INSERT INTO reception_login_attempts(key,count,started_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN started_at>? THEN count+1 ELSE 1 END,started_at=CASE WHEN started_at>? THEN started_at ELSE ? END').bind(key,now,now-windowMs,now-windowMs,now),
  env.DB.prepare('SELECT count FROM reception_login_attempts WHERE key=?').bind(key),
  env.DB.prepare('DELETE FROM reception_login_attempts WHERE started_at<?').bind(now-24*60*60*1000),
 ]);
 return result[1].results[0].count>10?json({error:'Please wait before trying again.'},429):json({ok:true});
}
async function signingKey(env){return crypto.subtle.importKey('raw',new TextEncoder().encode('media-v1:'+env.SERVICE_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
function base64url(bytes){let text='';for(const b of bytes)text+=String.fromCharCode(b);return btoa(text).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function decode(value){const text=atob(value.replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(text,c=>c.charCodeAt(0));}
async function grant(request,env){
 if(!env.BUCKET)return json({error:'Shared file uploads are not enabled yet. Existing files and device copies still work.'},503);
 const data=await parse(request,3000),method=data.method==='GET'?'GET':'PUT';
 if(!ID.test(data.id||''))return json({error:'Invalid file'},400);
 if(method==='PUT'&&(!Number.isSafeInteger(data.bytes)||data.bytes<=0||data.bytes>MAX_FILE||!FILE_TYPE.test(data.type||'')))return json({error:'Choose a supported file under 80 MB.'},400);
 if(method==='GET'&&!await env.BUCKET.head('reception/'+data.id))return json({error:'File not found'},404);
 const payload=base64url(new TextEncoder().encode(JSON.stringify({id:data.id,method,bytes:data.bytes,type:data.type,exp:Date.now()+15*60*1000})));
 const signature=base64url(new Uint8Array(await crypto.subtle.sign('HMAC',await signingKey(env),new TextEncoder().encode(payload))));
 const url=new URL('/media/'+data.id,request.url);url.searchParams.set('token',payload+'.'+signature);
 return json({url:url.href});
}
async function media(request,env,url){
 const id=url.pathname.slice('/media/'.length),token=url.searchParams.get('token')||'';
 const origin=request.headers.get('origin'),allowed=env.ALLOWED_ORIGIN;
 if(origin&&origin!==allowed)return new Response('Access denied',{status:403,headers:noCache});
 const cors=origin?{'access-control-allow-origin':origin,'vary':'Origin','access-control-expose-headers':'Content-Length, Content-Range, Accept-Ranges, Content-Type'}:{};
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...cors,'access-control-allow-methods':'GET, HEAD, PUT, OPTIONS','access-control-allow-headers':'Content-Type, Range','access-control-max-age':'600'}});
 try{
  if(!env.BUCKET||!ID.test(id)||token.length>1800)throw new Error('access');
  const [payload,signature,extra]=token.split('.');
  if(extra||!payload||!signature||!await crypto.subtle.verify('HMAC',await signingKey(env),decode(signature),new TextEncoder().encode(payload)))throw new Error('access');
  const info=JSON.parse(new TextDecoder().decode(decode(payload)));
  if(info.id!==id||!Number.isSafeInteger(info.exp)||info.exp<Date.now()||(request.method==='HEAD'?'GET':request.method)!==info.method)throw new Error('access');
  const key='reception/'+id;
  if(request.method==='PUT'){
   if(request.headers.get('content-type')!==info.type||!request.body)return new Response('Invalid upload',{status:400,headers:{...noCache,...cors}});
   const declared=request.headers.get('content-length');if(declared&&Number(declared)!==info.bytes)return new Response('Wrong file size',{status:400,headers:{...noCache,...cors}});
   // File IDs are immutable: retries may succeed, but a shared file URL can
   // never silently change underneath a device's offline size check.
   const exists=await env.BUCKET.head(key);
   if(exists)return new Response(null,{status:exists.size===info.bytes?204:409,headers:{...noCache,...cors}});
   const stream=request.body.pipeThrough(new FixedLengthStream(info.bytes));
   await env.BUCKET.put(key,stream,{httpMetadata:{contentType:info.type},onlyIf:{etagDoesNotMatch:'*'}});
   return new Response(null,{status:204,headers:{...noCache,...cors}});
  }
  const meta=await env.BUCKET.head(key);if(!meta)return new Response('File not found',{status:404,headers:{...noCache,...cors}});
  const headers=new Headers({...noCache,...cors,'content-type':meta.httpMetadata?.contentType||'application/octet-stream','accept-ranges':'bytes','content-length':String(meta.size)});
  let range;
  if(request.headers.has('range')){
   const match=/^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range'));
   if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{...noCache,...cors,'content-range':`bytes */${meta.size}`}});
   const start=match[1]?Number(match[1]):Math.max(0,meta.size-Number(match[2])),end=match[1]&&match[2]?Math.min(Number(match[2]),meta.size-1):meta.size-1;
   if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=meta.size)return new Response(null,{status:416,headers:{...noCache,...cors,'content-range':`bytes */${meta.size}`}});
   range={offset:start,length:end-start+1};headers.set('content-range',`bytes ${start}-${end}/${meta.size}`);headers.set('content-length',String(range.length));
  }
  const object=request.method==='HEAD'?null:await env.BUCKET.get(key,range?{range}:{});
  return new Response(object?.body||null,{status:range?206:200,headers});
 }catch{return new Response('Access denied or file transfer failed',{status:403,headers:{...noCache,...cors}});}
}
const LIBRARY_BYTES={'nover-ton-mac-intermission-7682861210999687968.mp3':526775,'harana-v6-tagalog-host-guide.mp4':11218017,'bridesquad-flashmob-preview-22-full.mp3':5535405,'bridesmaids-entrance-mama-mia-instrumental-v1.mp3':2162982,'bridesmaids-entrance-mama-mia.mp3':1842199,'bridesquad-flashmob-version-2.mp3':6269805,'harana-v6-rehearsal.mp4':11200619,'harana-v6-audio.mp3':8856385,'harana-formation.png':90190,'forevermore-reference-sample.mp4':1197143};
const LIBRARY = new Set(['nover-ton-mac-intermission-7682861210999687968.mp3','harana-v6-tagalog-host-guide.mp4','bridesquad-flashmob-preview-22-full.mp3','bridesmaids-entrance-mama-mia-instrumental-v1.mp3','bridesmaids-entrance-mama-mia.mp3','bridesquad-flashmob-version-2.mp3','harana-v6-rehearsal.mp4','harana-v6-audio.mp3','harana-formation.png','forevermore-reference-sample.mp4']);
async function libraryGrant(request,env){
 const {file}=await parse(request,1000);
 if(!env.ASSETS||!LIBRARY.has(file))return json({error:'File not found'},404);
 const payload=base64url(new TextEncoder().encode(JSON.stringify({file,method:'GET',exp:Date.now()+15*60*1000})));
 const signature=base64url(new Uint8Array(await crypto.subtle.sign('HMAC',await signingKey(env),new TextEncoder().encode(payload))));
 const url=new URL('/library/files/'+file,request.url);url.searchParams.set('token',payload+'.'+signature);
 return json({url:url.href});
}
async function libraryDownload(request,env,url){
 const file=url.pathname.slice('/library/files/'.length),origin=request.headers.get('origin');
 const cors=origin===env.ALLOWED_ORIGIN?{'access-control-allow-origin':origin,'vary':'Origin','access-control-expose-headers':'Content-Length, Content-Range, Accept-Ranges, Content-Type'}:{};
 if(origin&&origin!==env.ALLOWED_ORIGIN)return new Response('Access denied',{status:403,headers:noCache});
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...cors,'access-control-allow-methods':'GET, HEAD, OPTIONS','access-control-allow-headers':'Range','access-control-max-age':'600'}});
 try{
  const token=url.searchParams.get('token')||'';
  if(!env.ASSETS||!LIBRARY.has(file)||token.length>1800||!['GET','HEAD'].includes(request.method))throw new Error('access');
  const [payload,signature,extra]=token.split('.');
  if(extra||!payload||!signature||!await crypto.subtle.verify('HMAC',await signingKey(env),decode(signature),new TextEncoder().encode(payload)))throw new Error('access');
  const info=JSON.parse(new TextDecoder().decode(decode(payload)));
  if(info.file!==file||info.method!=='GET'||!Number.isSafeInteger(info.exp)||info.exp<Date.now())throw new Error('access');
  const headers=new Headers();if(request.headers.has('range'))headers.set('range',request.headers.get('range'));
  const response=await env.ASSETS.fetch(new Request(new URL('/library/'+file,url.origin),{method:request.method,headers}));
  const output=new Headers(response.headers);for(const [key,value]of Object.entries({...noCache,...cors}))output.set(key,value);
  const range=request.headers.get('range'),size=Number(response.headers.get('content-length'))||LIBRARY_BYTES[file];
  if(response.status===200){output.set('accept-ranges','bytes');output.set('content-length',String(size));}
  // Some asset runtimes ignore Range. Stream just the requested bytes in that
  // case, without buffering the entire media file in the Worker.
  if(range&&response.status===200&&Number.isSafeInteger(size)&&size>0){
   const match=/^bytes=(\d*)-(\d*)$/.exec(range);
   if(!match||(!match[1]&&!match[2])){await response.body?.cancel();return new Response(null,{status:416,headers:{...noCache,...cors,'content-range':`bytes */${size}`}});}
   const start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2])),end=match[1]&&match[2]?Math.min(Number(match[2]),size-1):size-1;
   if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=size){await response.body?.cancel();return new Response(null,{status:416,headers:{...noCache,...cors,'content-range':`bytes */${size}`}});}
   output.set('accept-ranges','bytes');output.set('content-range',`bytes ${start}-${end}/${size}`);output.set('content-length',String(end-start+1));
   if(request.method==='HEAD')return new Response(null,{status:206,headers:output});
   const reader=response.body.getReader();let offset=0;
   const body=new ReadableStream({async pull(controller){try{while(true){const {done,value}=await reader.read();if(done){controller.close();return;}const before=offset;offset+=value.byteLength;const from=Math.max(0,start-before),to=Math.min(value.byteLength,end+1-before);if(to>from)controller.enqueue(value.subarray(from,to));if(offset>end){controller.close();await reader.cancel();return;}if(to>from)return;}}catch(error){controller.error(error);}},cancel(reason){return reader.cancel(reason);}});
   return new Response(body,{status:206,headers:output});
  }
  return new Response(response.body,{status:response.status,headers:output});
 }catch{return new Response('Access denied',{status:403,headers:{...noCache,...cors}});}
}
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname.startsWith('/library/files/'))return libraryDownload(request,env,url);
  if(url.pathname.startsWith('/media/')&&url.pathname!=='/media/grant')return media(request,env,url);
  if(!env.SERVICE_SECRET||env.SERVICE_SECRET.length<32||!equal(request.headers.get('authorization')||'','Bearer '+env.SERVICE_SECRET))return json({error:'Access denied'},401);
  try{
   if(request.method==='POST'&&url.pathname==='/library/grant')return await libraryGrant(request,env);
   if(request.method==='GET'&&url.pathname==='/state')return await state(env);
   if(request.method==='POST'&&url.pathname==='/sync')return await sync(request,env);
   if(request.method==='POST'&&url.pathname==='/auth/attempt')return await loginAttempt(request,env,false);
   if(request.method==='POST'&&url.pathname==='/auth/clear')return await loginAttempt(request,env,true);
   if(request.method==='POST'&&url.pathname==='/media/grant')return await grant(request,env);
   return json({error:'Not found'},404);
  }catch(error){return json({error:error?.message==='BODY_LIMIT'?'Request too large':error instanceof SyntaxError?'Invalid request':'The shared reception plan is temporarily unavailable.'},error?.message==='BODY_LIMIT'?413:error instanceof SyntaxError?400:503);}
 },
};
