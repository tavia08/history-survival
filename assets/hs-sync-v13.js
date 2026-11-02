/* History Survival Common Auth v1 bridge
 * The History Hub already verified the student. A legacy token is optional and is used only for remote personal-best sync.
 * Missing/stale roster data on the legacy server never blocks entry or play.
 */
(()=>{'use strict';
 const SERVER='https://script.google.com/macros/s/AKfycbxaNVvX4B1moP5mlKyk2wUP1NMfOyghLXGtRlWbK7l4x4uKRHOdW-Uj53QvjVYkYHhg/exec';
 const COMMON_KEY='HISTORY_HUB_AUTH_V1', LEGACY_KEY='HS_AUTH_SESSION_V13';
 function read(key){try{return JSON.parse(sessionStorage.getItem(key)||'null')}catch{return null}}
 function common(){const x=read(COMMON_KEY);return x&&x.verified===true&&x.student?.studentNo&&x.student?.studentName?x:null}
 function legacy(){const x=read(LEGACY_KEY);return x&&x.token&&Number(x.expiresAt)>Date.now()?x:null}
 function query(params){return new Promise((resolve,reject)=>{const cb='hs_cb_'+Date.now()+'_'+Math.random().toString(36).slice(2),script=document.createElement('script');let done=false;const clean=()=>{if(done)return;done=true;clearTimeout(timer);try{delete window[cb]}catch{window[cb]=undefined}script.remove()};const timer=setTimeout(()=>{clean();reject(Error('서버 응답 시간 초과'))},12000);window[cb]=r=>{clean();r?.status==='ok'?resolve(r):reject(Error(r?.message||'서버 오류'))};script.onerror=()=>{clean();reject(Error('서버 연결 실패'))};script.src=SERVER+'?'+new URLSearchParams({...params,callback:cb}).toString();document.head.appendChild(script)})}
 function status(msg){const el=document.getElementById('hs-login-state');if(el)el.textContent=msg;console.info('[HS CommonAuth]',msg)}
 function session(){const c=common(),l=legacy();if(c)return {student:c.student,verified:true,token:l?.token||null,expiresAt:l?.expiresAt||null};if(l)return l;return null}
 let best={};
 async function load(){const l=legacy();if(!l){best={};render();renderBest();return best}try{const data=await query({action:'loadBest',token:l.token});best={};(data.scores||[]).filter(r=>/^survival_/.test(r.stageId)).forEach(r=>best[r.stageId]=r);renderBest();return best}catch(err){status('학습실 로그인 연결 완료 · 개인 서버 기록 미연결');return best}}
 function renderBest(){const el=document.getElementById('hs-best-state');if(!el)return;const names={survival_hwangsanbeol:'황산벌',survival_cheonghaejin:'청해진',survival_gahanmok:'가한목'};el.textContent=Object.keys(best).length?'개인 최고점 · '+Object.entries(best).map(([id,r])=>(names[id]||id)+' '+Number(r.bestScore||0).toLocaleString()+'점').join(' / '):(common()?'개인 서버 기록 미연결 · 게임 이용 가능':'개인 서버 기록 없음')}
 async function save(id,data){const l=legacy();if(!l){status(common()?'학습실 로그인 연결 완료 · 게임 기록은 로컬 저장':'직접 접속 · 게임 기록은 로컬 저장');return null}const params={action:'saveBest',token:l.token,stageId:'survival_'+id,stageName:({hwangsanbeol:'황산벌',cheonghaejin:'청해진의 밤',gahanmok:'가한목 전투'})[id]||id,score:Math.max(0,Math.floor(Number(data.score)||0)),result:data.win?'승리':'패배',playSeconds:Math.max(0,Math.floor(Number(data.seconds)||0)),kills:Math.max(0,Math.floor(Number(data.kills)||0))};try{const r=await query(params);status('학습실 로그인 연결 완료 · 개인 최고점 서버 확인');await load();return r}catch(err){status('게임 기록은 로컬 저장 · 개인 서버 기록만 미연결');return null}}
 function render(){const el=document.getElementById('hs-login-state');if(!el)return;if(common())el.textContent='학습실 학생 로그인 연결 완료';else if(legacy())el.textContent='기존 개인 기록 세션 연결';else el.textContent='직접 접속: 학습실에서 로그인하면 학생 정보가 연결됩니다.'}
 function addUI(){if(!document.body||document.getElementById('hs-login-state'))return;const box=document.createElement('div');box.id='hs-sync-box';box.style.cssText='display:none;position:fixed;left:8px;bottom:8px;max-width:min(92vw,360px);z-index:4000;padding:9px 12px;background:#302419;color:#fff0c9;border:1px solid #b18b47;border-radius:10px;font:12px/1.5 system-ui;box-shadow:0 4px 18px #0008';const line=document.createElement('div');line.id='hs-login-state';const record=document.createElement('div');record.id='hs-best-state';record.style.opacity='.85';box.append(line,record);document.body.append(box);render();load()}
 document.addEventListener('DOMContentLoaded',addUI);if(document.readyState!=='loading')addUI();
 window.HSSyncV13={session,save,load,getStudent:()=>common()?.student||legacy()?.student||null};
 if(common())document.dispatchEvent(new CustomEvent('hs-auth-ready',{detail:{student:common().student}}));
})();
