/* ===== 도시·지역개발 연구실 홈페이지 =====
   내용(공지·행사·자료·논문·구성원 등)은 data/*.json 에 있고, Pages CMS 관리 화면에서 수정합니다. */
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ext=u=>/^https?:/.test(u||"")?' target="_blank" rel="noopener"':'';
const hl=s=>esc(s).replace(/(홍석호|Sukho Hong)/g,'<span class="me">$1</span>');
const asset=p=>{p=String(p||"");return p.startsWith("/")&&!p.startsWith("//")?p.slice(1):p};
const arr=v=>Array.isArray(v)?v.filter(Boolean):(v?[v]:[]);
let L="ko",curFilter="all";
let SD={notices:[],events:[],resources:[],publications:[],projects:[],members:[],professor:{},press:[]};
const pick=(o,k)=>L==="en"&&o&&o[k+"_en"]?o[k+"_en"]:((o&&o[k])||"");

const UI={
  ko:{now:"현재",go:"바로가기",tags:{dev:"도시개발·정비",reg:"지역·문화",des:"설계·디자인"},caps:["MNU Green Road 기본계획 배치도","MNU Green Road 공간계획","대상지: 국립목포대학교 후문 대학촌"],pause:"슬라이드 정지",play:"슬라이드 재생",btn:"English",title:"도시·지역개발 연구실 | 국립목포대학교 도시계획및지역개발학전공",
      groups:{phd_researcher:"박사 연구원",researcher:"연구원",phd:"박사과정",ms:"석사과정",ug:"학부연구생",alumni:"졸업생"},loading:"불러오는 중…",loadErr:"내용을 불러오지 못했습니다. 잠시 후 새로고침해 주세요."},
  en:{now:"Current",go:"Open",tags:{dev:"Urban Development",reg:"Regional & Cultural",des:"Design"},caps:["MNU Green Road master plan layout","MNU Green Road spatial plan","Site: university town at MNU’s back gate"],pause:"Pause slideshow",play:"Play slideshow",btn:"한국어",title:"Urban & Regional Development Lab | Mokpo National University",
      groups:{phd_researcher:"Postdoctoral Researchers",researcher:"Researchers",phd:"Ph.D. Students",ms:"Master’s Students",ug:"Undergraduate Researchers",alumni:"Alumni"},loading:"Loading…",loadErr:"Could not load content. Please refresh in a moment."}
};
const GROUP_ORDER=["phd_researcher","researcher","phd","ms","ug","alumni"];

/* ---------- 홈 섹션 ---------- */
const tl=(id,rows,cur)=>$(id).innerHTML=(rows||[]).map(r=>`<li><time>${esc(r.period)}</time><span>${esc(pick(r,"text"))}${cur&&r.current?`<span class="now">${UI[L].now}</span>`:''}</span></li>`).join("");
const proj=f=>{curFilter=f;$("#projBody").innerHTML=[...SD.projects].sort((a,b)=>String(b.period).localeCompare(String(a.period))).filter(p=>f==="all"||p.field===f).map(p=>`<tr><td class="d">${esc(p.period)}</td><td>${esc(pick(p,"title"))}</td><td>${p.field?`<span class="tag ${esc(p.field)}">${esc(UI[L].tags[p.field]||p.field)}</span>`:""}</td></tr>`).join("")};
function renderData(){
  renderBoardHome();
  const P=SD.professor||{};
  if(pick(P,"bio"))$("#profBio").innerHTML=esc(pick(P,"bio"));
  tl("#t-edu",P.education);tl("#t-career",P.career,true);tl("#t-award",P.awards);
  proj(curFilter);
  $("#pubBody").innerHTML=[...SD.publications].sort((a,b)=>String(b.year||"").localeCompare(String(a.year||""))).map(p=>{const a=pick(p,"authors"),v=pick(p,"venue");return `<tr><td class="d">${esc(p.year||"—")}</td><td>${esc(pick(p,"title"))}</td><td>${hl(a)}${a&&v?" · ":""}${esc(v)}</td></tr>`}).join("");
  const groups=GROUP_ORDER.map(g=>[g,SD.members.filter(m=>m.group===g)]).filter(([,l])=>l.length);
  $("#memberGroups").innerHTML=groups.map(([g,list])=>`<div class="mgroup"><h3>${esc(UI[L].groups[g])}</h3><div class="members">${list.map(m=>{const n=pick(m,"name"),ph=asset(m.photo);return `<div class="member"><div class="avatar">${ph?`<img src="${esc(ph)}" alt="">`:esc((m.name||"")[0]||"")}</div><div><b>${esc(n)}</b><span>${esc(pick(m,"role"))}</span>${pick(m,"note")?`<span>${esc(pick(m,"note"))}</span>`:''}${m.email?`<span><a href="mailto:${esc(m.email)}">${esc(m.email)}</a></span>`:''}</div></div>`}).join("")}</div></div>`).join("");
  $("#pressLinks").innerHTML=SD.press.map(p=>`<a href="${esc(p.url)}" target="_blank" rel="noopener"><small>${esc(pick(p,"source"))}</small><b>${esc(pick(p,"title"))}</b><span>${UI[L].go}</span></a>`).join("");
}
document.querySelectorAll('[role="tab"]').forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll('[role="tab"]').forEach(x=>{x.setAttribute("aria-selected",x===b);$("#"+x.getAttribute("aria-controls")).hidden=x!==b});
}));
document.querySelectorAll(".filter button").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".filter button").forEach(x=>x.setAttribute("aria-pressed",x===b));proj(b.dataset.f)}));

/* ---------- 슬라이드 ---------- */
const slides=[...document.querySelectorAll(".slide")];
let si=0,playing=!matchMedia("(prefers-reduced-motion: reduce)").matches,timer;
const show=i=>{slides[si].classList.remove("on");si=i;slides[si].classList.add("on");$("#slideCap").textContent=UI[L].caps[si]};
const start=()=>{clearInterval(timer);if(playing)timer=setInterval(()=>show((si+1)%slides.length),5000)};
const pb=$("#slidePause");
const setBtn=()=>{pb.textContent=playing?"❚❚":"▶";pb.setAttribute("aria-label",playing?UI[L].pause:UI[L].play)};
pb.addEventListener("click",()=>{playing=!playing;setBtn();start()});

/* ---------- 사진 크게 보기 ---------- */
const lb=$("#lightbox");
function openLB(src,cap){$("#lbImg").src=src;$("#lbImg").alt=cap;$("#lbCap").textContent=cap;lb.showModal()}
document.querySelectorAll("#gallery button").forEach(b=>b.addEventListener("click",()=>openLB(b.querySelector("img").src,L==="en"?b.dataset.capEn:b.dataset.cap)));
$("#lbClose").addEventListener("click",()=>lb.close());
lb.addEventListener("click",e=>{if(e.target===lb)lb.close()});

/* ---------- 게시판 ---------- */
const BUI={
  ko:{home:"홈",board:"게시판",notice:"공지사항",events:"연구실 행사",resources:"자료실",total:"총",items:"건",search:"검색어 입력",no:"번호",cat:"분류",title:"제목",date:"작성일",reg:"등록일",get:"받기",pin:"공지",empty:"등록된 글이 없습니다.",noresult:"검색 결과가 없습니다.",list:"목록",prev:"이전글",next:"다음글",none:"없음",files:"첨부파일",link:"관련 링크 바로가기",photos:"장",all:"전체",download:"다운로드",open:"바로가기",evEmpty:"등록된 행사가 없습니다.",place:"장소",notfound:"게시글을 찾을 수 없습니다.",
      cats:{"공지":"공지","소식":"소식","링크":"링크","양식":"양식","발표자료":"발표자료","참고자료":"참고자료","연구자료":"연구자료"}},
  en:{home:"Home",board:"Board",notice:"Notices",events:"Lab Events",resources:"Resources",total:"Total",items:"",search:"Search",no:"No.",cat:"Type",title:"Title",date:"Date",reg:"Date",get:"File",pin:"Notice",empty:"No posts yet.",noresult:"No results found.",list:"Back to list",prev:"Previous",next:"Next",none:"None",files:"Attachments",link:"Open related link",photos:"photos",all:"All",download:"Download",open:"Open",evEmpty:"No events yet.",place:"Place",notfound:"Post not found.",
      cats:{"공지":"Notice","소식":"News","링크":"Link","양식":"Form","발표자료":"Slides","참고자료":"Reference","연구자료":"Research"}}
};
const bt=k=>BUI[L][k];
const catName=c=>BUI[L].cats[c]||c||"";
const byDate=(a,b)=>String(b.date||"").localeCompare(String(a.date||""));
const pid=(o,i)=>String(o.id||("n"+i));
const notices=()=>SD.notices.map((n,i)=>({...n,_id:pid(n,i)})).sort((a,b)=>(b.pin?1:0)-(a.pin?1:0)||byDate(a,b));
const events=()=>SD.events.map((n,i)=>({...n,_id:pid(n,i)})).sort(byDate);
const resources=()=>[...SD.resources].sort(byDate);
const camSvg='<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="10" width="30" height="22" rx="2"/><circle cx="20" cy="21" r="6"/><path d="M14 10l2-4h8l2 4"/></svg>';
const nLink=n=>n.link&&!n.body&&!arr(n.files).length?n.link:"#/notice/"+encodeURIComponent(n._id);
function evCard(e){
  const ph=arr(e.photos).map(asset);
  return `<a class="ev-card" href="#/events/${encodeURIComponent(e._id)}"><div class="ev-cover">${ph[0]?`<img src="${esc(ph[0])}" alt="" loading="lazy">`:camSvg}</div><div class="ev-body"><span class="ev-t">${esc(pick(e,"title"))}</span><span class="ev-m">${esc(e.date)}${ph.length>1?`<span class="ev-count">${ph.length}${L==="en"?" ":""}${bt("photos")}</span>`:""}</span></div></a>`;
}
function renderBoardHome(){
  const ns=notices().slice(0,6);
  $("#homeNews").innerHTML=ns.length?ns.map(n=>{const u=nLink(n);return `<li><a href="${esc(u)}"${ext(u)}>${n.pin?`<span class="badge">${bt("pin")}</span> `:""}${esc(pick(n,"title"))}</a><time>${esc(n.date)}</time></li>`}).join(""):`<li>${bt("empty")}</li>`;
  const es=events().slice(0,4);
  $("#homeEvents").innerHTML=es.length?es.map(evCard).join(""):`<div class="empty" style="grid-column:1/-1">${bt("evEmpty")}</div>`;
}
const BS={nq:"",np:1,rq:"",rc:"all"};
const PER=10;
function shell(key,inner){
  const tabs=["notice","events","resources"].map(k=>`<a href="#/${k}"${k===key?' aria-current="page"':''}>${bt(k)}</a>`).join("");
  return `<div class="subvis"><div class="wrap"><p class="crumb"><a href="#">${bt("home")}</a> › ${bt("board")} › ${bt(key)}</p><h1>${bt(key)}</h1></div></div><div class="wrap bwrap"><nav class="btabs" aria-label="${bt("board")}">${tabs}</nav>${inner}</div>`;
}
function noticeList(){
  const q=BS.nq.trim().toLowerCase();
  const all=notices();const rows=all.filter(n=>!q||(pick(n,"title")+" "+pick(n,"body")).toLowerCase().includes(q));
  const pages=Math.max(1,Math.ceil(rows.length/PER));BS.np=Math.min(BS.np,pages);
  const unpinned=all.filter(n=>!n.pin);
  const body=rows.slice((BS.np-1)*PER,BS.np*PER).map(n=>{
    const num=n.pin?`<span class="badge">${bt("pin")}</span>`:(unpinned.length-unpinned.indexOf(n));
    const u=nLink(n);const clip=arr(n.files).length?`<span class="clip" aria-label="${bt("files")}">📎</span>`:"";
    return `<tr class="${n.pin?"pin":""}"><td class="c hide-m">${num}</td><td class="c"><span class="badge soft">${esc(catName(n.cat))}</span></td><td class="t"><a href="${esc(u)}"${ext(u)}>${esc(pick(n,"title"))}</a>${clip}</td><td class="d">${esc(n.date)}</td></tr>`;}).join("");
  $("#nCount").innerHTML=`${bt("total")} <b>${rows.length}</b>${bt("items")}`;
  $("#nBody").innerHTML=body||`<tr><td colspan="4"><div class="empty">${q?bt("noresult"):bt("empty")}</div></td></tr>`;
  $("#nPager").innerHTML=pages>1?Array.from({length:pages},(_,i)=>`<button data-p="${i+1}"${i+1===BS.np?' aria-current="true"':''}>${i+1}</button>`).join(""):"";
  $("#nPager").querySelectorAll("button").forEach(b=>b.onclick=()=>{BS.np=+b.dataset.p;noticeList();window.scrollTo({top:0,behavior:"instant"})});
}
function viewNotice(){
  $("#boardView").innerHTML=shell("notice",`<div class="btool"><span class="cnt" id="nCount"></span><div class="bsearch"><input type="search" id="nQ" placeholder="${bt("search")}" aria-label="${bt("search")}" value="${esc(BS.nq)}"></div></div>
  <div class="tablewrap"><table class="list"><thead><tr><th class="c hide-m">${bt("no")}</th><th class="c">${bt("cat")}</th><th>${bt("title")}</th><th>${bt("date")}</th></tr></thead><tbody id="nBody"></tbody></table></div><div class="pager" id="nPager"></div>`);
  $("#nQ").addEventListener("input",e=>{BS.nq=e.target.value;BS.np=1;noticeList()});
  noticeList();
}
const paras=s=>esc(s).split(/\n\s*\n/).map(p=>`<p>${p.replace(/\n/g,"<br>")}</p>`).join("");
const navRow=(lab,p,k)=>`<li><span>${lab}</span>${p?`<a href="#/${k}/${encodeURIComponent(p._id)}">${esc(pick(p,"title"))}</a>`:`<span>${bt("none")}</span>`}</li>`;
function viewNoticeDetail(id){
  const list=notices();const i=list.findIndex(n=>n._id===id);
  if(i<0){$("#boardView").innerHTML=shell("notice",`<div class="empty">${bt("notfound")}</div><div class="post-actions"><a class="btn-list" href="#/notice">${bt("list")}</a></div>`);return}
  const n=list[i],files=arr(n.files);
  $("#boardView").innerHTML=shell("notice",`<article class="post"><header class="post-h"><span class="badge soft">${esc(catName(n.cat))}</span><h2>${esc(pick(n,"title"))}</h2><div class="meta">${esc(n.date)}</div></header>
  <div class="post-b">${paras(pick(n,"body"))}${n.link?`<a class="post-link" href="${esc(n.link)}"${ext(n.link)}>${bt("link")}</a>`:""}</div>
  ${files.length?`<div class="post-files"><b>${bt("files")}</b><br>${files.map(f=>{const p=asset(f.url||f);return `<a href="${esc(p)}" download>📎 ${esc(f.name||decodeURIComponent(p.split("/").pop()))}</a>`}).join("")}</div>`:""}
  <ul class="post-nav">${navRow(bt("prev"),list[i+1],"notice")}${navRow(bt("next"),list[i-1],"notice")}</ul></article><div class="post-actions"><a class="btn-list" href="#/notice">${bt("list")}</a></div>`);
}
function viewEvents(){
  const es=events();const years=[...new Set(es.map(e=>String(e.date||"").slice(0,4)))];
  $("#boardView").innerHTML=shell("events",es.length?years.map(y=>`<h2 class="ev-year">${esc(y)}</h2><div class="ev-grid">${es.filter(e=>String(e.date||"").startsWith(y)).map(evCard).join("")}</div>`).join(""):`<div class="empty">${bt("evEmpty")}</div>`);
}
function viewEventDetail(id){
  const list=events();const i=list.findIndex(e=>e._id===id);
  if(i<0){$("#boardView").innerHTML=shell("events",`<div class="empty">${bt("notfound")}</div><div class="post-actions"><a class="btn-list" href="#/events">${bt("list")}</a></div>`);return}
  const e=list[i],ph=arr(e.photos).map(asset);const ttl=pick(e,"title");
  $("#boardView").innerHTML=shell("events",`<article class="post"><header class="post-h"><h2>${esc(ttl)}</h2><div class="meta">${esc(e.date)}${pick(e,"place")?` · ${bt("place")}: ${esc(pick(e,"place"))}`:""}</div></header>
  ${pick(e,"desc")?`<div class="post-b">${paras(pick(e,"desc"))}</div>`:""}
  ${ph.length?`<div class="photos">${ph.map((p,k)=>`<button data-src="${esc(p)}" data-k="${k+1}"><img src="${esc(p)}" alt="${esc(ttl)} ${k+1}" loading="lazy"></button>`).join("")}</div>`:""}
  <ul class="post-nav">${navRow(bt("prev"),list[i+1],"events")}${navRow(bt("next"),list[i-1],"events")}</ul></article><div class="post-actions"><a class="btn-list" href="#/events">${bt("list")}</a></div>`);
  $("#boardView").querySelectorAll(".photos button").forEach(b=>b.onclick=()=>openLB(b.dataset.src,`${ttl} (${b.dataset.k}/${ph.length})`));
}
function resList(){
  const q=BS.rq.trim().toLowerCase();
  const rows=resources().filter(r=>(BS.rc==="all"||r.cat===BS.rc)&&(!q||(pick(r,"title")+" "+pick(r,"desc")).toLowerCase().includes(q)));
  $("#rCount").innerHTML=`${bt("total")} <b>${rows.length}</b>${bt("items")}`;
  $("#rBody").innerHTML=rows.map(r=>{const f=asset(arr(r.file)[0]);const u=f||r.url||"";
    return `<tr><td class="c"><span class="badge soft">${esc(catName(r.cat))}</span></td><td>${esc(pick(r,"title"))}${pick(r,"desc")?`<span class="rdesc">${esc(pick(r,"desc"))}</span>`:""}</td><td class="d hide-m">${esc(r.date)}</td><td class="c">${u?`<a class="dl" href="${esc(u)}"${f?" download":ext(u)}>${f?bt("download"):bt("open")}</a>`:""}</td></tr>`}).join("")||`<tr><td colspan="4"><div class="empty">${q||BS.rc!=="all"?bt("noresult"):bt("empty")}</div></td></tr>`;
}
function viewResources(){
  const cats=[...new Set(SD.resources.map(r=>r.cat).filter(Boolean))];
  $("#boardView").innerHTML=shell("resources",`<div class="btool"><div class="chips" role="group" aria-label="${bt("cat")}">${["all",...cats].map(c=>`<button data-c="${esc(c)}" aria-pressed="${c===BS.rc}">${c==="all"?bt("all"):esc(catName(c))}</button>`).join("")}</div><div class="bsearch"><input type="search" id="rQ" placeholder="${bt("search")}" aria-label="${bt("search")}" value="${esc(BS.rq)}"></div></div>
  <p class="cnt" id="rCount" style="color:var(--muted);font-size:14px;margin:0 0 10px"></p>
  <div class="tablewrap"><table class="list"><thead><tr><th class="c">${bt("cat")}</th><th>${bt("title")}</th><th class="hide-m">${bt("reg")}</th><th class="c">${bt("get")}</th></tr></thead><tbody id="rBody"></tbody></table></div>`);
  $("#rQ").addEventListener("input",e=>{BS.rq=e.target.value;resList()});
  $("#boardView").querySelectorAll(".chips button").forEach(b=>b.onclick=()=>{BS.rc=b.dataset.c;$("#boardView").querySelectorAll(".chips button").forEach(x=>x.setAttribute("aria-pressed",x===b));resList()});
  resList();
}
let lastWasBoard=false;
function route(){
  const h=location.hash||"";
  const m=h.match(/^#\/(notice|events|resources)(?:\/([^/]+))?/);
  const hv=$("#homeView"),bv=$("#boardView");
  if(m){
    hv.hidden=true;bv.hidden=false;
    const k=m[1],id=m[2]?decodeURIComponent(m[2]):undefined;
    if(k==="notice")id?viewNoticeDetail(id):viewNotice();
    else if(k==="events")id?viewEventDetail(id):viewEvents();
    else viewResources();
    document.querySelectorAll("#gnb a").forEach(a=>a.toggleAttribute("aria-current",a.getAttribute("href")==="#/"+k));
    window.scrollTo({top:0,behavior:"instant"});
    lastWasBoard=true;
  }else{
    const wasBoard=hv.hidden;
    hv.hidden=false;bv.hidden=true;bv.innerHTML="";
    document.querySelectorAll("#gnb a").forEach(a=>a.removeAttribute("aria-current"));
    if(wasBoard||lastWasBoard){const el=h.length>1&&document.getElementById(h.slice(1));el?el.scrollIntoView({behavior:"instant"}):window.scrollTo({top:0,behavior:"instant"})}
    lastWasBoard=false;
  }
}

/* ---------- 언어 ---------- */
const i18nEls=[...document.querySelectorAll("[data-en]")];
i18nEls.forEach(el=>el.dataset.ko=el.innerHTML);
function setLang(l){
  L=l;
  document.documentElement.lang=l;document.title=UI[l].title;
  i18nEls.forEach(el=>el.innerHTML=l==="en"?el.dataset.en:el.dataset.ko);
  const lbtn=$("#langBtn");lbtn.textContent=UI[l].btn;lbtn.lang=l==="en"?"ko":"en";
  renderData();route();$("#slideCap").textContent=UI[l].caps[si];setBtn();
  try{localStorage.setItem("lab-lang",l)}catch(e){}
  try{const u=new URL(location.href);if(l==="en")u.searchParams.set("lang","en");else u.searchParams.delete("lang");history.replaceState(null,"",u)}catch(e){}
}
$("#langBtn").addEventListener("click",()=>setLang(L==="en"?"ko":"en"));

/* ---------- 모바일 메뉴 ---------- */
const mb=$(".menu-btn"),g=$("#gnb");
mb.addEventListener("click",()=>{const o=g.classList.toggle("open");mb.setAttribute("aria-expanded",o)});
g.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{g.classList.remove("open");mb.setAttribute("aria-expanded",false)}));

/* ---------- 데이터 불러오기 ---------- */
const FILES=["notices","events","resources","publications","projects","members","professor","press"];
async function loadData(){
  if(window.__SITE_DATA__)return window.__SITE_DATA__;
  const out={};
  await Promise.all(FILES.map(async n=>{
    try{const r=await fetch(`data/${n}.json`,{cache:"no-cache"});out[n]=r.ok?await r.json():null}catch(e){out[n]=null}
  }));
  return out;
}
let initial="ko";
try{const q=new URLSearchParams(location.search).get("lang");if(q==="en"||q==="ko")initial=q;else if(localStorage.getItem("lab-lang")==="en")initial="en"}catch(e){}
window.addEventListener("hashchange",route);
loadData().then(d=>{
  for(const k of FILES){if(d[k]!=null)SD[k]=k==="professor"?(d[k]||{}):(Array.isArray(d[k])?d[k]:[])}
  if(FILES.every(k=>d[k]==null))$("#homeNews").innerHTML=`<li>${UI[initial].loadErr}</li>`;
  setLang(initial);
  if(location.hash.length>1&&!location.hash.startsWith("#/")){const el=document.getElementById(location.hash.slice(1));if(el)el.scrollIntoView({behavior:"instant"})}
});
setBtn();start();
