/* Survival v1.3 single login and personal-best bridge, trial mode. */
(()=>{'use strict';
 const ORIGIN='https://tavia08.github.io', SERVER='https://script.google.com/macros/s/AKfycbxaNVvX4B1moP5mlKyk2wUP1NMfOyghLXGtRlWbK7l4x4uKRHOdW-Uj53QvjVYkYHhg/exec', KEY='HS_AUTH_SESSION_V13';
 function query(params){return new Promise((resolve,reject)=>{
  const cb='hs_cb_'+Date.now()+'_'+Math.random().toString(36).slice(2),script=document.createElement('script');let done=false;
  const clean=()=>{if(done)return;done=true;clearTimeout(timer);delete window[cb];script.remove()};
  const timer=setTimeout(()=>{clean();reject(Error('서버 응답 시간 초과'))},13000);
  window[cb]=r=>{clean();r?.status==='ok'?resolve(r):reject(Error(r?.message||'서버 오류'))};
  script.onerror=()=>{clean();reject(Error('서버 연결 실패'))};
  script.src=SERVER+'?'+new URLSearchParams({...params,callback:cb}).toString();document.head.appendChild(script);
 })}
 let authenticated=false;
 function session(){try{const x=JSON.parse(sessionStorage.getItem(KEY)||'null');return x&&x.token&&x.expiresAt>Date.now()?x:null}catch{return null}}
 async function accept(data){
   if(data.serverUrl!==SERVER || !data.token || !Number.isFinite(Date.parse(data.expiresAt)) || Date.parse(data.expiresAt)<=Date.now())return;
   const verified=await query({action:'verifyToken',token:data.token});
   if(!verified.valid||verified.expiresAt!==data.expiresAt)throw Error('인증 검증 실패');
   sessionStorage.setItem(KEY,JSON.stringify({token:data.token,expiresAt:Date.parse(data.expiresAt),student:verified.student}));
   authenticated=true;document.dispatchEvent(new CustomEvent('hs-auth-ready'));render();await load();
 }
 window.addEventListener('message',e=>{
   if(e.source!==window.opener||e.origin!==ORIGIN||e.data?.type!=='HS_AUTH_HANDOFF_V13'||authenticated)return;
   accept(e.data).catch(err=>status('로그인 연결 실패: '+err.message));
 });
 function status(msg){let el=document.getElementById('hs-login-state');if(el)el.textContent=msg;console.info('[HS]',msg)}
 function render(){const el=document.getElementById('hs-login-state');if(el)el.textContent=session()?'학생 로그인 연결 완료 · 개인 기록 서버 연동':'직접 접속: 학습실에서 로그인하면 개인 기록이 연결됩니다.'}
 let best={};
 async function load(){const x=session();if(!x)return null;
   try{const data=await query({action:'loadBest',token:x.token});best={};(data.scores||[]).filter(r=>/^survival_/.test(r.stageId)).forEach(r=>best[r.stageId]=r);renderBest();return best;}
   catch(err){status('기록 조회 실패: '+err.message);return null}
 }
 function renderBest(){const el=document.getElementById('hs-best-state');if(!el)return;const names={survival_hwangsanbeol:'황산벌',survival_cheonghaejin:'청해진',survival_gahanmok:'가한목'};el.textContent=Object.keys(best).length?'개인 최고점 · '+Object.entries(best).map(([id,r])=>(names[id]||id)+' '+Number(r.bestScore||0).toLocaleString()+'점').join(' / '):'개인 서버 기록 없음';}
 async function save(id,data){const x=session();if(!x){status('학습실 로그인 없이 실행했습니다. 개인 서버 기록은 저장하지 않습니다.');return null}
  const params={action:'saveBest',token:x.token,stageId:'survival_'+id,stageName:({hwangsanbeol:'황산벌',cheonghaejin:'청해진의 밤',gahanmok:'가한목 전투'})[id]||id,score:Math.max(0,Math.floor(Number(data.score)||0)),result:data.win?'승리':'패배',playSeconds:Math.max(0,Math.floor(Number(data.seconds)||0)),kills:Math.max(0,Math.floor(Number(data.kills)||0))};
  try{const r=await query(params);status('개인 최고점 서버 확인: '+Number(r.bestScore||0).toLocaleString()+'점');await load();return r}
  catch(err){status('개인 기록 저장 실패: '+err.message);return null}
 }
 function addUI(){if(!document.body||document.getElementById('hs-login-state'))return;
  const box=document.createElement('div');box.id='hs-sync-box';box.style.cssText='display:none;position:fixed;left:8px;bottom:8px;max-width:min(92vw,360px);z-index:4000;padding:9px 12px;background:#302419;color:#fff0c9;border:1px solid #b18b47;border-radius:10px;font:12px/1.5 system-ui;box-shadow:0 4px 18px #0008';
  const line=document.createElement('div');line.id='hs-login-state';const record=document.createElement('div');record.id='hs-best-state';record.style.opacity='.85';box.append(line,record);document.body.append(box);render();if(session())load();
 }
 document.addEventListener('DOMContentLoaded',addUI);if(document.readyState!=='loading')addUI();
 if(location.pathname.endsWith('/history-survival/')||location.pathname.endsWith('/history-survival/index.html')){let tries=0;let t=setInterval(()=>{if(authenticated||session()||++tries>60){clearInterval(t);return}if(window.opener)window.opener.postMessage({type:'HS_AUTH_READY_V13'},ORIGIN)},350)}
 window.HSSyncV13={session,save,load};
})();