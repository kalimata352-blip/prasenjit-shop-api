type Env = {
  DB: D1Database,
  ADMIN_TOKEN: string
}

function generateId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Token",
    "Content-Type": "application/json",
  }
}

// Grade from marks (out of 100)
function marksToGrade(m: number): string {
  if (m <= 34) return "F";
  if (m <= 45) return "B";
  if (m <= 60) return "B+";
  if (m <= 80) return "A";
  return "A+";
}

function gradeToPoint(g: string): number {
  const map: Record<string, number> = { "A+": 5, "A": 4, "B+": 3.5, "B": 3, "C": 2, "D": 1, "F": 0 };
  return map[g] || 0;
}

// ==================== HTML TEMPLATES ====================

const HTML_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ভলান্টিয়ার ফর্ম</title>
<style>body{font-family:system-ui,sans-serif;background:#f5f5f5;margin:0;padding:12px}.card{max-width:600px;margin:auto;background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 10px #0001} .btn{display:inline-block;padding:10px 16px;background:#ff6a00;color:#fff;border-radius:8px;text-decoration:none;margin:5px} input,textarea{width:100%;padding:10px;margin:6px 0;border:1px solid #ccc;border-radius:8px;box-sizing:border-box} button[type=submit]{width:100%;padding:14px;background:#ff6a00;color:#fff;border:none;border-radius:10px;font-size:16px;font-weight:bold;cursor:pointer;margin-top:10px} button[type=submit]:disabled{opacity:0.6}</style>
</head><body><div class="card"><h2 style="text-align:center">ভলান্টিয়ার ফর্ম - তথ্য দিন নিচের ফর্মে</h2>
<div style="text-align:center;margin-bottom:15px">
<a class="btn" href="/status">আপনার ID স্ট্যাটাস চেক করুন</a>
<a class="btn" href="/links">গুরুত্বপূর্ণ লিংক ও ফাইল</a>
<a class="btn" href="/result" style="background:#16a34a">Result & Certificate</a>
<a class="btn" href="/quiz" style="background:#2563eb">MCQ Quiz (30 প্রশ্ন)</a>
</div>
<form id="f">
<input name="name" placeholder="নাম *" required>
<input name="father_name" placeholder="পিতার নাম *">
<input name="dob" type="date" placeholder="জন্ম তারিখ *">
<input name="mobile" placeholder="মোবাইল *" required pattern="[6-9][0-9]{9}" title="10 digit mobile">
<input name="whatsapp" placeholder="WhatsApp">
<input name="voter_card" placeholder="ভোটার কার্ড নম্বর * (একবারই এন্ট্রি)" required>
<input name="district" placeholder="জেলা *">
<textarea name="address" placeholder="সম্পূর্ণ ঠিকানা *"></textarea>
<input name="qualification" placeholder="শিক্ষাগত যোগ্যতা *">
<input name="experience" placeholder="অভিজ্ঞতা">
<button type="submit" id="submitBtn">জমা দিন</button>
</form>
<div id="msg"></div><hr><h3>গুরুত্বপূর্ণ লিংক ও নোটিফিকেশন</h3><div id="links">লোড হচ্ছে...</div>
<a id="adminFloat" href="/admin" style="position:fixed;bottom:20px;right:20px;background:#000;color:#fff;padding:10px 15px;border-radius:20px;text-decoration:none">Admin</a>
</div>
<script>
const f=document.getElementById('f'),msg=document.getElementById('msg'),submitBtn=document.getElementById('submitBtn');
f.addEventListener('submit',async e=>{
  e.preventDefault();
  submitBtn.disabled=true;
  const d=Object.fromEntries(new FormData(f));
  msg.textContent='পাঠানো হচ্ছে...';
  try{
    const r=await fetch('/api/volunteer/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});
    const j=await r.json();
    if(j.success){
      msg.innerHTML='<span style="color:green">✅ রেজিস্ট্রেশন সম্পন্ন! আপনার ID: <b>'+j.id+'</b><br><a target="_blank" href="/api/volunteer/pdf/'+j.id+'">PDF দেখুন</a></span>';
      f.reset();
      loadLinks();
    } else {
      msg.innerHTML='<span style="color:red">❌ '+j.message+'</span>';
    }
  }catch(err){
    msg.innerHTML='<span style="color:red">❌ Server Error</span>';
  }
  submitBtn.disabled=false;
});
async function loadLinks(){
  try{
    const r=await fetch('/api/links'); const j=await r.json();
    const el=document.getElementById('links');
    if(!j.data || j.data.length==0){el.innerHTML='কোনো নোটিফিকেশন নেই'; return;}
    el.innerHTML=j.data.map(x=>{
      const isPdf = x.link.toLowerCase().endsWith('.pdf') || x.link.includes('/api/file/');
      const isImage = x.link.toLowerCase().match(/\\.(jpg|jpeg|png|gif|webp)/);
      const downloadAttr = isPdf ? ' download ' : '';
      const preview = isImage ? \`<div style="margin-top:8px"><img src="\${x.link}" style="max-width:100%;border-radius:8px"></div>\` : '';
      const icon = isPdf ? '📄' : isImage ? '🖼️' : '🔗';
      return \`<div style="border:1px solid #eee;padding:10px;border-radius:8px;margin-bottom:8px"><b>\${x.title}</b><br>\${preview}<a href="\${x.link}" target="_blank" \${downloadAttr}>\${icon} \${isPdf?'PDF ডাউনলোড':'লিংক দেখুন'}</a></div>\`;
    }).join('');
  }catch(e){document.getElementById('links').textContent='লোড করতে সমস্যা'}
}
loadLinks();
</script></body></html>`;

const STATUS_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:system-ui;padding:20px;background:#f5f5f5}.card{max-width:500px;margin:auto;background:#fff;padding:20px;border-radius:12px}</style></head><body><div class="card">
<h3>ID দিয়ে স্ট্যাটাস চেক করুন</h3>
<input id="q" placeholder="ID বা মোবাইল নম্বর লিখুন" style="width:100%;padding:10px;margin:8px 0;border:1px solid #ccc;border-radius:8px;box-sizing:border-box">
<button onclick="check()" style="width:100%;padding:12px;background:#ff6a00;color:#fff;border:none;border-radius:8px">চেক করুন</button>
<div id="res" style="margin-top:15px"></div>
<div style="text-align:center;margin-top:15px"><a href="/">← Home</a></div>
</div>
<script>
async function check(){
  const q=document.getElementById('q').value.trim(); if(!q) return alert('ID দিন');
  const r=await fetch('/api/volunteer/status/'+encodeURIComponent(q));
  const j=await r.json();
  const res=document.getElementById('res');
  if(!j.success){res.innerHTML='❌ '+j.message; return;}
  const d=j.data;
  res.innerHTML='<b>নাম:</b> '+d.name+'<br><b>মোবাইল:</b> '+d.mobile+'<br><b>ভোটার কার্ড:</b> '+(d.voter_card||'-')+'<br><b>স্ট্যাটাস:</b> <b style="color:'+(d.status=='approved'?'green':'orange')+'">'+d.status+'</b><br><a href="/api/volunteer/pdf/'+d.id+'">PDF দেখুন</a> | <a href="/result?id='+d.id+'">Result দেখুন</a>';
}
</script></body></html>`;

const LINKS_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:system-ui;padding:12px}.card{max-width:600px;margin:auto}</style></head><body><div class="card">
<h3>গুরুত্বপূর্ণ লিংক</h3>
<div id="list"></div>
<div style="text-align:center;margin-top:15px"><a href="/">← Home</a></div>
</div>
<script>
async function load(){
  const r=await fetch('/api/links'); const j=await r.json();
  const el=document.getElementById('list');
  if(!j.data || j.data.length==0){el.innerHTML='কোনো লিংক নেই'; return;}
  el.innerHTML=j.data.map(x=>{
    const isPdf = x.link.toLowerCase().endsWith('.pdf') || x.isFile || x.link.includes('/api/file/');
    const downloadAttr = isPdf ? ' download ' : '';
    const meta = isPdf ? ' | PDF' : '';
    return \`<div style="border-bottom:1px solid #eee;padding:10px 0"><span><b>\${x.title}</b></span><br><span style="font-size:12px">\${x.created_at||''}\${meta}</span> - <a href="\${x.link}" target="_blank" \${downloadAttr}>\${isPdf?'📄 ডাউনলোড / দেখুন':'🔗 দেখুন'}</a></div>\`;
  }).join('');
}
load();
</script></body></html>`;

// RESULT PAGE - marks based
const RESULT_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Result & Certificate</title>
<style>body{font-family:system-ui;padding:15px;background:#f5f5f5;margin:0}.card{max-width:650px;margin:20px auto;background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 10px #0001} input,button{width:100%;padding:14px;margin:8px 0;border-radius:10px;box-sizing:border-box} input{border:1px solid #ccc} button{background:#16a34a;color:#fff;border:none;font-weight:bold;font-size:16px} table{width:100%;border-collapse:collapse;margin:15px 0} th,td{border:1px solid #ddd;padding:10px;text-align:center} th{background:#fff7ed} .badge{padding:4px 12px;border-radius:20px;color:#fff;font-weight:bold;display:inline-block} .cert{border:6px double #ff6a00;padding:25px;margin-top:25px;text-align:center;background:#fffaf0} @media print{.no-print{display:none} body{background:#fff}}</style>
</head><body><div class="card" id="searchBox">
<h2 style="text-align:center">🔍 Result & Certificate চেক করুন</h2>
<p style="text-align:center">আপনার Volunteer ID বা ফোন নম্বর দিন</p>
<input id="q" placeholder="যেমন: a1b2c3 বা 9876543210"><button onclick="search()">ফলাফল দেখুন</button>
<div id="res" style="margin-top:20px"></div>
<div style="text-align:center;margin-top:15px"><a href="/">← Home</a> | <a href="/status">Status চেক</a></div>
</div>
<script>
function gradeColor(g){
  if(g==='A+'||g==='A') return '#16a34a';
  if(g==='B+'||g==='B') return '#2563eb';
  if(g==='C') return '#ea580c';
  if(g==='F'||g==='D') return '#dc2626';
  return '#999';
}
function calcPercent(u){
  const marks=[u.bengali,u.english,u.history,u.geography,u.math,u.gk].map(Number).filter(n=>!isNaN(n));
  if(marks.length===0) return 0;
  const avg=marks.reduce((s,m)=>s+m,0)/marks.length;
  return Math.round(avg);
}
async function search(){
  const q=document.getElementById('q').value.trim(); if(!q) return alert('ID/Phone দিন');
  const r=await fetch('/api/result/'+encodeURIComponent(q));
  const j=await r.json();
  const el=document.getElementById('res');
  if(!j.success){el.innerHTML='<p style="color:red;text-align:center">❌ '+j.message+'</p>'; return;}
  const u=j.data;
  const percent = calcPercent(u);
  const resultText = percent>=35 ? 'পাস (Pass)' : 'ফেল (Fail)';
  const resultColor = percent>=35 ? '#16a34a' : '#dc2626';
  const subjects=[
    {name:'বাংলা',m:u.bengali,g:u.bengali_grade},
    {name:'ইংরেজি',m:u.english,g:u.english_grade},
    {name:'ইতিহাস',m:u.history,g:u.history_grade},
    {name:'ভূগোল',m:u.geography,g:u.geography_grade},
    {name:'অংক',m:u.math,g:u.math_grade},
    {name:'জেনারেল নলেজ',m:u.gk,g:u.gk_grade}
  ];
  el.innerHTML=\`
    <h3 style="text-align:center">📜 \${u.name} - রেজাল্ট</h3>
    <p><b>ID:</b> \${u.id} | <b>ফোন:</b> \${u.mobile} | <b>ভোটার:</b> \${u.voter_card||'-'}</p>
    <table>
      <tr><th>বিষয়</th><th>মার্কস (১০০)</th><th>গ্রেড</th></tr>
      \${subjects.map(s=>\`<tr><td>\${s.name}</td><td>\${s.m??'-'}</td><td><span class="badge" style="background:\${gradeColor(s.g)}">\${s.g||'-'}</span></td></tr>\`).join('')}
      <tr style="font-weight:bold;background:#fff7ed"><td>মোট গ্রেড</td><td colspan="2"><span class="badge" style="background:#000">\${u.total_grade||'-'}</span></td></tr>
      <tr style="font-weight:bold;background:#f0fdf4"><td>পার্সেন্টেজ (অটো)</td><td colspan="2"><span style="font-size:18px;color:#16a34a">\${percent}%</span></td></tr>
      <tr style="font-weight:bold;background:#fef2f2"><td>রেজাল্ট</td><td colspan="2"><span style="font-size:18px;color:\${resultColor}">\${resultText}</span></td></tr>
    </table>
    <div class="cert" id="cert">
      <h1>🎓 সার্টিফিকেট</h1>
      <h2>\${u.name}</h2>
      <p>S/o \${u.father_name||''}</p>
      <p>বাংলা, ইংরেজি, ইতিহাস, ভূগোল, অংক, জেনারেল নলেজ বিষয়ে পরীক্ষায় উত্তীর্ণ</p>
      <h2>চূড়ান্ত গ্রেড: <span style="color:#ff6a00">\${u.total_grade}</span></h2>
      <h3 style="color:#16a34a">পার্সেন্টেজ: \${percent}%</h3>
      <p style="font-size:16px;color:\${resultColor}"><b>রেজাল্ট: \${resultText}</b></p>
      <p style="font-size:12px">ID: \${u.id} | তারিখ: \${new Date().toLocaleDateString('bn-IN')}</p>
      <p style="font-size:11px;color:#666">এটি একটি কম্পিউটার জেনারেটেড সার্টিফিকেট</p>
    </div>
    <button class="no-print" onclick="window.print()" style="margin-top:15px;background:#ff6a00">📥 Certificate Print / PDF Save</button>
  \`;
}
const urlParams = new URLSearchParams(window.location.search);
if(urlParams.get('id')){document.getElementById('q').value=urlParams.get('id'); search();}
</script></body></html>`;

// QUIZ PAGE - 30 MCQ across 4 subjects (History, Geography, Math, GK - Indian style)
const QUIZ_QUESTIONS = [
  // History (8)
  {s:"ইতিহাস",q:"ভারতের স্বাধীনতা দিবস কবে?",o:["১৫ আগস্ট ১৯৪৭","২৬ জানুয়ারি ১৯৫০","২ অক্টোবর ১৯৪৭","১৪ আগস্ট ১৯৪৭"],a:0},
  {s:"ইতিহাস",q:"মহাত্মা গান্ধী কোথায় জন্মগ্রহণ করেন?",o:["পোরবন্দার","আহমেদাবাদ","দিল্লি","মুম্বাই"],a:0},
  {s:"ইতিহাস",q:"ভারতের প্রথম প্রধানমন্ত্রী কে ছিলেন?",o:["জওহরলাল নেহেরু","সরদার প্যাটেল","মহাত্মা গান্ধী","ড. রাজেন্দ্র প্রসাদ"],a:0},
  {s:"ইতিহাস",q:"ভারতের সংবিধান কবে কার্যকর হয়?",o:["২৬ জানুয়ারি ১৯৫০","১৫ আগস্ট ১৯৪৭","২৬ নভেম্বর ১৯৪৯","২৬ জানুয়ারি ১৯৪৯"],a:0},
  {s:"ইতিহাস",q:"চাণক্য কোন রাজার মন্ত্রী ছিলেন?",o:["চন্দ্রগুপ্ত মৌর্য","অশোক","হর্ষবর্ধন","সম্রাট আকবর"],a:0},
  {s:"ইতিহাস",q:"তাজমহল কে নির্মাণ করেন?",o:["শাহজাহান","আকবর","বাবর","আওরঙ্গজেব"],a:0},
  {s:"ইতিহাস",q:"ভারতের জাতীয় পতাকা কে ডিজাইন করেন?",o:["পিঙ্গলি ভেঙ্কাইয়া","গান্ধী","নেহেরু","সুভাষ চন্দ্র বসু"],a:0},
  {s:"ইতিহাস",q:"ভারত ছাড়ো আন্দোলন কবে শুরু হয়?",o:["১৯৪২","১৯৪৭","১৯৩০","১৯১৯"],a:0},
  // Geography (7)
  {s:"ভূগোল",q:"ভারতের দীর্ঘতম নদী কোনটি?",o:["গঙ্গা","ব্রহ্মপুত্র","যমুনা","গোদাবরী"],a:0},
  {s:"ভূগোল",q:"ভারতের সর্বোচ্চ পর্বত কোনটি?",o:["কাঞ্চনজঙ্ঘা","এভারেস্ট","নন্দাদেবী","অন্নপূর্ণা"],a:0},
  {s:"ভূগোল",q:"ভারতের রাজধানী কোন শহর?",o:["নয়াদিল্লি","মুম্বাই","কলকাতা","চেন্নাই"],a:0},
  {s:"ভূগোল",q:"থার মরুভূমি কোন রাজ্যে অবস্থিত?",o:["রাজস্থান","গুজরাট","পাঞ্জাব","হরিয়ানা"],a:0},
  {s:"ভূগোল",q:"ভারতের দক্ষিণতম বিন্দু কোনটি?",o:["কন্যাকুমারী","ইন্দিরা পয়েন্ট","চেন্নাই","কোচি"],a:1},
  {s:"ভূগোল",q:"সুন্দরবন কোন রাজ্যে?",o:["পশ্চিমবঙ্গ","ওড়িশা","অসম","বিহার"],a:0},
  {s:"ভূগোল",q:"ভারতের সবচেয়ে বড় রাজ্য (ক্ষেত্রফল) কোনটি?",o:["রাজস্থান","মধ্যপ্রদেশ","মহারাষ্ট্র","উত্তরপ্রদেশ"],a:0},
  // Math (7)
  {s:"অংক",q:"২৫ + ৩৭ = ?",o:["৬২","৬০","৬৪","৫৮"],a:0},
  {s:"অংক",q:"১২ × ৮ = ?",o:["৯৬","৮৪","১০৮","৮৮"],a:0},
  {s:"অংক",q:"১০০ ÷ ৫ = ?",o:["২০","২৫","১৫","৩০"],a:0},
  {s:"অংক",q:"একটি ত্রিভুজের কোণের যোগফল কত?",o:["১৮০°","৯০°","৩৬০°","২৭০°"],a:0},
  {s:"অংক",q:"৫ এর বর্গমূল কত?",o:["√৫ ≈ ২.২৩৬","২","২.৫","৩"],a:0},
  {s:"অংক",q:"১০% অফ ২০০ = ?",o:["২০","২৫","১৫","৩০"],a:0},
  {s:"অংক",q:"একটি বৃত্তের ব্যাসার্ধ ৭ হলে ব্যাস কত?",o:["১৪","৭","২১","২৮"],a:0},
  // GK (8)
  {s:"GK",q:"ভারতের জাতীয় পশু কোনটি?",o:["বাঘ","সিংহ","হাতি","ময়ূর"],a:0},
  {s:"GK",q:"ভারতের জাতীয় পাখি কোনটি?",o:["ময়ূর","কাক","শকুন","হাঁস"],a:0},
  {s:"GK",q:"ভারতের জাতীয় ফল কোনটি?",o:["আম","কলা","আপেল","কমলা"],a:0},
  {s:"GK",q:"ভারতের মুদ্রা কোনটি?",o:["রুপি","ডলার","ইউরো","পাউন্ড"],a:0},
  {s:"GK",q:"বর্তমান ভারতের রাষ্ট্রপতি কে? (২০২৪+)",o:["দ্রৌপদী মুর্মু","রামনাথ কোবিন্দ","প্রণব মুখোপাধ্যায়","প্রতিভা পাটিল"],a:0},
  {s:"GK",q:"ক্রিকেট বিশ্বকাপ কত বছর অন্তর হয়?",o:["৪ বছর","২ বছর","৫ বছর","৩ বছর"],a:0},
  {s:"GK",q:"জাতীয় সংগীত কে রচনা করেন?",o:["রবীন্দ্রনাথ ঠাকুর","বঙ্কিমচন্দ্র","গান্ধী","নেহেরু"],a:0},
  {s:"GK",q:"ভারতের জাতীয় খেলা কোনটি?",o:["হকি","ক্রিকেট","ফুটবল","কাবাডি"],a:0}
];

const QUIZ_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>MCQ Quiz - 30 প্রশ্ন</title>
<style>
body{font-family:system-ui;padding:12px;background:#f0f9ff;margin:0}
.card{max-width:700px;margin:15px auto;background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 12px #0001}
.qbox{border:1px solid #e2e8f0;padding:14px;border-radius:10px;margin-bottom:12px;background:#fafafa}
.qbox h4{margin:0 0 8px;color:#1e40af}
.opt{display:block;padding:8px 12px;margin:4px 0;border:1px solid #cbd5e1;border-radius:8px;cursor:pointer;background:#fff}
.opt:hover{background:#eff6ff}
.opt input{margin-right:8px}
.sub{font-size:12px;color:#64748b;margin-bottom:4px}
button{width:100%;padding:14px;background:#2563eb;color:#fff;border:none;border-radius:10px;font-size:16px;font-weight:bold;cursor:pointer;margin-top:10px}
#scoreBox{text-align:center;padding:20px;background:#f0fdf4;border-radius:12px;margin-top:15px;display:none}
.timer{text-align:center;font-size:18px;color:#dc2626;margin-bottom:10px}
</style>
</head><body>
<div class="card">
<h2 style="text-align:center">📝 Computer Generated MCQ Quiz</h2>
<p style="text-align:center;color:#64748b">৪টি বিষয় • মোট ৩০টি প্রশ্ন • প্রতিটি সঠিক উত্তরে ১ নম্বর</p>
<div class="timer" id="timer">সময়: ৩০:০০</div>
<form id="quizForm"></form>
<button type="button" id="submitQuiz" onclick="submitQuiz()">উত্তর জমা দিন ও স্কোর দেখুন</button>
<div id="scoreBox"></div>
<div style="text-align:center;margin-top:15px"><a href="/">← Home</a></div>
</div>
<script>
const QUESTIONS = ${JSON.stringify(QUIZ_QUESTIONS)};
let timeLeft = 30 * 60;
let timerInterval;
function startTimer(){
  timerInterval = setInterval(()=>{
    timeLeft--;
    const m=Math.floor(timeLeft/60), s=timeLeft%60;
    document.getElementById('timer').textContent = 'সময়: '+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
    if(timeLeft<=0){clearInterval(timerInterval); submitQuiz();}
  },1000);
}
function render(){
  const form=document.getElementById('quizForm');
  form.innerHTML = QUESTIONS.map((q,i)=>\`
    <div class="qbox">
      <div class="sub">\${q.s} • প্রশ্ন \${i+1}/৩০</div>
      <h4>\${i+1}. \${q.q}</h4>
      \${q.o.map((opt,j)=>\`
        <label class="opt"><input type="radio" name="q\${i}" value="\${j}"> \${opt}</label>
      \`).join('')}
    </div>
  \`).join('');
}
function submitQuiz(){
  clearInterval(timerInterval);
  let score=0;
  const detail=[];
  QUESTIONS.forEach((q,i)=>{
    const sel=document.querySelector('input[name="q'+i+'"]:checked');
    const ans=sel ? parseInt(sel.value) : -1;
    const correct = ans===q.a;
    if(correct) score++;
    detail.push({q:q.q, correct, your: ans>=0?q.o[ans]:'উত্তর দেননি', right:q.o[q.a]});
  });
  const percent=Math.round((score/30)*100);
  const grade = percent<=34?'F':percent<=45?'B':percent<=60?'B+':percent<=80?'A':'A+';
  const box=document.getElementById('scoreBox');
  box.style.display='block';
  box.innerHTML=\`
    <h2>🎯 আপনার স্কোর: \${score}/৩০</h2>
    <p style="font-size:22px">পার্সেন্টেজ: <b style="color:#16a34a">\${percent}%</b> | গ্রেড: <b>\${grade}</b></p>
    <p>\${percent>=35?'✅ পাস':'❌ ফেল'}</p>
    <hr>
    <h4>বিস্তারিত:</h4>
    <div style="text-align:left;max-height:300px;overflow:auto;font-size:13px">
      \${detail.map((d,i)=>\`<div style="margin:6px 0;padding:6px;background:\${d.correct?'#f0fdf4':'#fef2f2'};border-radius:6px">
        <b>\${i+1}.</b> \${d.q}<br>
        আপনার: \${d.your} \${d.correct?'✅':'❌'} | সঠিক: \${d.right}
      </div>\`).join('')}
    </div>
  \`;
  document.getElementById('submitQuiz').disabled=true;
  document.getElementById('submitQuiz').textContent='জমা দেওয়া হয়েছে';
}
render();
startTimer();
</script>
</body></html>`;

const ADMIN_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:system-ui;padding:12px;background:#f9f9f9} table{width:100%;border-collapse:collapse;font-size:13px} th,td{border:1px solid #ddd;padding:6px;text-align:left} th{background:#eee} .card{background:#fff;padding:15px;border-radius:10px;margin-bottom:15px;box-shadow:0 1px 5px #0001} input,select{padding:8px;margin:4px 0;border:1px solid #ccc;border-radius:6px;width:100%;box-sizing:border-box} button{padding:8px 12px;border:none;border-radius:6px;background:#000;color:#fff;cursor:pointer;margin:2px} .tab{padding:10px 15px;background:#ddd;border:none;margin-right:5px;border-radius:8px 8px 0 0;cursor:pointer} .tab.active{background:#000;color:#fff} .marks-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:10px} label{font-size:13px;font-weight:600}</style>
</head><body>
<div style="max-width:1000px;margin:auto">
<h2>Admin Panel</h2>
Admin Token: <input id="token" type="password" placeholder="Admin Token লিখুন" style="width:70%"><button onclick="saveToken()">Save</button>
<hr>
<button class="tab active" onclick="showTab('vol')">Volunteers</button>
<button class="tab" onclick="showTab('exam')">Exam Result (মার্কস)</button>
<button class="tab" onclick="showTab('links')">Links / PDF</button>

<div id="volTab" class="card"><h3>Volunteers <button onclick="loadVolunteers()" style="margin-left:10px;padding:6px 10px;font-size:12px">রিফ্রেশ করুন</button></h3><div id="vlist"></div></div>

<div id="examTab" class="card" style="display:none">
<h3>📝 পরীক্ষার মার্কস এন্ট্রি (০-১০০)</h3>
<p style="color:#16a34a;font-size:13px">⭐ মার্কস দিলেই <b>গ্রেড ও পার্সেন্টেজ অটো</b> হিসাব হবে<br>
স্কেল: ≤৩৪ = F | ৩৫-৪৫ = B | ৪৬-৬০ = B+ | ৬১-৮০ = A | ৮১+ = A+</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
<input id="e_id" placeholder="Volunteer ID * (যেমন a1b2c3)">
<input id="e_name" placeholder="নাম (অটো আসবে)">
<input id="e_phone" placeholder="ফোন (অটো আসবে)">
</div>
<div class="marks-grid">
<div><label>বাংলা (০-১০০)</label><input type="number" id="e_ben" min="0" max="100" value="0" oninput="calcTotal()"></div>
<div><label>ইংরেজি</label><input type="number" id="e_eng" min="0" max="100" value="0" oninput="calcTotal()"></div>
<div><label>ইতিহাস</label><input type="number" id="e_his" min="0" max="100" value="0" oninput="calcTotal()"></div>
<div><label>ভূগোল</label><input type="number" id="e_geo" min="0" max="100" value="0" oninput="calcTotal()"></div>
<div><label>অংক</label><input type="number" id="e_math" min="0" max="100" value="0" oninput="calcTotal()"></div>
<div><label>GK</label><input type="number" id="e_gk" min="0" max="100" value="0" oninput="calcTotal()"></div>
</div>
<div style="margin-top:15px;padding:12px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0">
  <b>অটো রেজাল্ট:</b><br>
  বাংলা: <span id="g_ben">F</span> | ইং: <span id="g_eng">F</span> | ইতি: <span id="g_his">F</span><br>
  ভূগো: <span id="g_geo">F</span> | অংক: <span id="g_math">F</span> | GK: <span id="g_gk">F</span><br>
  <b>মোট গ্রেড = <span id="e_total_display" style="font-size:20px;color:#000">F</span></b> &nbsp;|&nbsp; 
  পার্সেন্টেজ = <span id="autoPercent" style="font-size:20px;color:#16a34a">0%</span> &nbsp;|&nbsp;
  রেজাল্ট = <span id="autoResult" style="font-size:18px;color:#dc2626">ফেল</span>
  <input type="hidden" id="e_total" value="F">
</div>
<button onclick="saveExam()" style="width:100%;margin-top:15px;background:#16a34a;padding:12px">💾 Result Save করুন</button>
<div id="examMsg"></div>
<hr>
<h4>সব রেজাল্ট লিস্ট</h4><div id="examList"></div>
</div>

<div id="linksTab" class="card" style="display:none">
<h3>গুরুত্বপূর্ণ লিংক / PDF / ছবি আপলোড</h3>
<input id="ltitle" placeholder="টাইটেল - যেমন: নোটিশ PDF" style="width:60%">
<input id="llink" placeholder="লিংক - যদি থাকে - https://..." style="width:80%">
<button onclick="addLink()">Add Link</button>
<br><small style="display:block;margin:8px 0;color:#666">সরাসরি PDF আপলোড করতে চাইলে - নিচের ফর্ম ব্যবহার করুন</small>
<input type="file" id="pdffile" accept=".pdf,.jpg,.png,.jpeg,.doc,.docx"><input id="pdftitle" placeholder="ফাইলের নাম"><button onclick="uploadPdf()">আপলোড ও সেভ করুন</button>
<div id="uploadMsg"></div>
<hr><div id="linkList" style="margin-top:12px"></div>
</div>

</div>
<script>
let ADMIN_TOKEN = localStorage.getItem('ADMIN_TOKEN') || '';
document.getElementById('token').value = ADMIN_TOKEN;
function saveToken(){ADMIN_TOKEN=document.getElementById('token').value.trim(); localStorage.setItem('ADMIN_TOKEN',ADMIN_TOKEN); alert('Token Saved! এখন রিফ্রেশ করুন');}
function showTab(t){
  document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
  document.getElementById('volTab').style.display='none';
  document.getElementById('examTab').style.display='none';
  document.getElementById('linksTab').style.display='none';
  if(t=='vol'){document.getElementById('volTab').style.display='block'; document.querySelectorAll('.tab')[0].classList.add('active');}
  if(t=='exam'){document.getElementById('examTab').style.display='block'; document.querySelectorAll('.tab')[1].classList.add('active'); loadExamList();}
  if(t=='links'){document.getElementById('linksTab').style.display='block'; document.querySelectorAll('.tab')[2].classList.add('active'); loadLinksAdmin();}
}
function marksToGrade(m){
  m=Number(m)||0;
  if(m<=34) return 'F';
  if(m<=45) return 'B';
  if(m<=60) return 'B+';
  if(m<=80) return 'A';
  return 'A+';
}
function gradeToPoint(g){
  return {'A+':5,'A':4,'B+':3.5,'B':3,'C':2,'D':1,'F':0}[g]||0;
}
function pointToGrade(avg){
  if(avg>=4.5) return 'A+';
  if(avg>=3.5) return 'A';
  if(avg>=2.75) return 'B+';
  if(avg>=2) return 'B';
  if(avg>=1) return 'C';
  return 'F';
}
function calcTotal(){
  const ids=['e_ben','e_eng','e_his','e_geo','e_math','e_gk'];
  const gradeIds=['g_ben','g_eng','g_his','g_geo','g_math','g_gk'];
  const marks=ids.map(id=>Number(document.getElementById(id).value)||0);
  const grades=marks.map(m=>marksToGrade(m));
  grades.forEach((g,i)=>document.getElementById(gradeIds[i]).textContent=g);
  const avgMarks=marks.reduce((a,b)=>a+b,0)/marks.length;
  const points=grades.map(g=>gradeToPoint(g));
  const avgP=points.reduce((a,b)=>a+b,0)/points.length;
  const totalG=pointToGrade(avgP);
  const percent=Math.round(avgMarks);
  const resultText=percent>=35?'পাস (Pass)':'ফেল (Fail)';
  const resultColor=percent>=35?'#16a34a':'#dc2626';
  document.getElementById('e_total').value=totalG;
  document.getElementById('e_total_display').textContent=totalG;
  document.getElementById('autoPercent').textContent=percent+'%';
  document.getElementById('autoResult').textContent=resultText;
  document.getElementById('autoResult').style.color=resultColor;
}
async function loadVolunteers(){
  if(!ADMIN_TOKEN) return alert('আগে Token দিন');
  const r=await fetch('/api/admin/volunteers',{headers:{'X-Admin-Token':ADMIN_TOKEN}});
  const j=await r.json();
  if(!j.success){document.getElementById('vlist').innerHTML='❌ '+j.message; return;}
  document.getElementById('vlist').innerHTML='<table><tr><th>ID</th><th>নাম</th><th>মোবাইল</th><th>ভোটার</th><th>District</th><th>Status</th><th>Action</th></tr>'+j.data.map(v=>{
    return \`<tr><td>\${v.id}</td><td>\${v.name}</td><td>\${v.mobile}</td><td>\${v.voter_card||'-'}</td><td>\${v.district||''}</td><td>\${v.status}</td><td><button onclick="updateStatus('\${v.id}','approved')">Approve</button><button onclick="updateStatus('\${v.id}','rejected')">Reject</button><button onclick="fillExamForm('\${v.id}','\${v.name}','\${v.mobile}')">Exam Entry</button></td></tr>\`
  }).join('')+'</table>';
}
async function updateStatus(id,status){
  const r=await fetch('/api/admin/volunteers/'+id+'/status',{method:'PUT',headers:{'Content-Type':'application/json','X-Admin-Token':ADMIN_TOKEN},body:JSON.stringify({status})});
  const j=await r.json(); alert(j.message||JSON.stringify(j)); if(j.success) loadVolunteers();
}
function fillExamForm(id,name,mobile){
  showTab('exam');
  document.getElementById('e_id').value=id;
  document.getElementById('e_name').value=name;
  document.getElementById('e_phone').value=mobile;
  ['e_ben','e_eng','e_his','e_geo','e_math','e_gk'].forEach(id=>{document.getElementById(id).value=0});
  calcTotal();
}
async function saveExam(){
  calcTotal();
  const data={
    volunteer_id: document.getElementById('e_id').value.trim(),
    name: document.getElementById('e_name').value.trim(),
    phone: document.getElementById('e_phone').value.trim(),
    bengali: Number(document.getElementById('e_ben').value)||0,
    english: Number(document.getElementById('e_eng').value)||0,
    history: Number(document.getElementById('e_his').value)||0,
    geography: Number(document.getElementById('e_geo').value)||0,
    math: Number(document.getElementById('e_math').value)||0,
    gk: Number(document.getElementById('e_gk').value)||0,
    total_grade: document.getElementById('e_total').value
  };
  if(!data.volunteer_id) return alert('ID দিন');
  const r=await fetch('/api/admin/results',{method:'POST',headers:{'Content-Type':'application/json','X-Admin-Token':ADMIN_TOKEN},body:JSON.stringify(data)});
  const j=await r.json();
  document.getElementById('examMsg').innerHTML=j.success?'✅ '+j.message+' (গ্রেড ও পার্সেন্টেজ অটো সেভ হয়েছে)':'❌ '+j.message;
  if(j.success) loadExamList();
}
async function loadExamList(){
  const r=await fetch('/api/admin/results',{headers:{'X-Admin-Token':ADMIN_TOKEN}});
  const j=await r.json();
  if(!j.success){document.getElementById('examList').innerHTML='❌ '+j.message; return;}
  document.getElementById('examList').innerHTML='<table><tr><th>ID</th><th>নাম</th><th>বাং</th><th>ইং</th><th>ইতি</th><th>ভূগো</th><th>অংক</th><th>GK</th><th>মোট</th><th>%</th><th>Del</th></tr>'+j.data.map(e=>{
    const marks=[e.bengali,e.english,e.history,e.geography,e.math,e.gk].map(Number);
    const avg=marks.reduce((a,b)=>a+b,0)/6;
    const pct=Math.round(avg);
    return \`<tr><td>\${e.volunteer_id}</td><td>\${e.name||''}</td><td>\${e.bengali}</td><td>\${e.english}</td><td>\${e.history}</td><td>\${e.geography}</td><td>\${e.math}</td><td>\${e.gk}</td><td><b>\${e.total_grade}</b></td><td><b style="color:#16a34a">\${pct}%</b></td><td><button onclick="delExam('\${e.volunteer_id}')">X</button></td></tr>\`;
  }).join('')+'</table>';
}
async function delExam(id){
  if(!confirm('Delete?')) return;
  const r=await fetch('/api/admin/results/'+id,{method:'DELETE',headers:{'X-Admin-Token':ADMIN_TOKEN}});
  const j=await r.json(); alert(j.message); loadExamList();
}
async function loadLinksAdmin(){
  if(!ADMIN_TOKEN) return;
  const r=await fetch('/api/admin/links',{headers:{'X-Admin-Token':ADMIN_TOKEN}});
  const j=await r.json();
  if(!j.success){document.getElementById('linkList').innerHTML='❌ '+j.message; return;}
  document.getElementById('linkList').innerHTML=j.data.map(x=>\`<div style="border-bottom:1px solid #eee;padding:6px 0">\${x.title} - <a href="\${x.link}" target="_blank">\${x.link}</a> <button onclick="delLink('\${x.id}')">Delete</button></div>\`).join('');
}
async function addLink(){
  const title=document.getElementById('ltitle').value.trim(), link=document.getElementById('llink').value.trim();
  if(!title || !link) return alert('Title + Link দিন');
  const r=await fetch('/api/admin/links',{method:'POST',headers:{'Content-Type':'application/json','X-Admin-Token':ADMIN_TOKEN},body:JSON.stringify({title,link})});
  const j=await r.json(); alert(j.message); if(j.success) loadLinksAdmin();
}
async function delLink(id){
  if(!confirm('Delete?')) return;
  const r=await fetch('/api/admin/links/'+id,{method:'DELETE',headers:{'X-Admin-Token':ADMIN_TOKEN}});
  const j=await r.json(); alert('Deleted'); loadLinksAdmin();
}
async function uploadPdf(){
  const file=document.getElementById('pdffile').files[0]; const title=document.getElementById('pdftitle').value.trim();
  if(!file) return alert('ফাইল সিলেক্ট করুন');
  document.getElementById('uploadMsg').textContent='আপলোড হচ্ছে...';
  const reader=new FileReader();
  reader.onload=async function(){
    const base64=reader.result;
    const r=await fetch('/api/admin/upload',{method:'POST',headers:{'Content-Type':'application/json','X-Admin-Token':ADMIN_TOKEN},body:JSON.stringify({title:title||file.name,data:base64,filename:file.name})});
    const j=await r.json();
    if(j.success){document.getElementById('uploadMsg').innerHTML='✅ আপলোড সফল! লিংক: <a href="'+j.link+'" target="_blank">'+j.link+'</a>'; loadLinksAdmin();}
    else document.getElementById('uploadMsg').textContent='❌ '+j.message;
  };
  reader.readAsDataURL(file);
}
if(ADMIN_TOKEN){loadVolunteers();}
calcTotal();
</script></body></html>`;

const PDF_PAGE = function(v: any){
  const d = new Date().toLocaleDateString('bn-IN');
  return `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>body{font-family:system-ui,sans-serif;background:#f1f1f1;padding:20px;color:#111}.card{max-width:700px;margin:auto;background:#fff;padding:20px;border-radius:10px} .row{display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding:6px 0} .actions{text-align:center;margin-top:15px} .btn{padding:10px 15px;border:none;border-radius:8px;background:#000;color:#fff;margin:5px;cursor:pointer}</style></head><body><div class="card" id="pdfContent">
  <h2 style="text-align:center">ভলান্টিয়ার ফর্ম - ${v.name}</h2>
  <p style="text-align:center">ID: ${v.id} | Date: ${d}</p>
  <div class="row"><span>নাম:</span><span>${v.name}</span></div>
  <div class="row"><span>পিতার নাম:</span><span>${v.father_name||''}</span></div>
  <div class="row"><span>জন্ম তারিখ:</span><span>${v.dob||''}</span></div>
  <div class="row"><span>মোবাইল:</span><span>${v.mobile}</span></div>
  <div class="row"><span>WhatsApp:</span><span>${v.whatsapp||''}</span></div>
  <div class="row"><span>ভোটার কার্ড:</span><span>${v.voter_card||''}</span></div>
  <div class="row"><span>জেলা:</span><span>${v.district||''}</span></div>
  <div class="row"><span>ঠিকানা:</span><span>${v.address||''}</span></div>
  <div class="row"><span>যোগ্যতা:</span><span>${v.qualification||''}</span></div>
  <div class="row"><span>অভিজ্ঞতা:</span><span>${v.experience||''}</span></div>
  <div class="row"><span>স্ট্যাটাস:</span><span><b>${v.status||'pending'}</b></span></div>
  <br><p style="text-align:center">এটি অনলাইন কপি - প্রিন্ট করুন</p>
  </div>
  <div class="actions">
  <button class="btn" onclick="window.print()">🖨️ প্রিন্ট করুন</button>
  <button class="btn" onclick="downloadAsPdf()">📄 PDF ডাউনলোড</button>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
  <script>
  function downloadAsPdf(){
    const el=document.getElementById('pdfContent');
    const opt={margin:10,filename:'volunteer-${v.id}.pdf',image:{type:'jpeg',quality:0.98},html2canvas:{scale:2},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}};
    html2pdf().set(opt).from(el).save();
  }
  <\/script>
  </body></html>`;
};

// ==================== MAIN FETCH HANDLER ====================

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const headers = cors();
    if (req.method === "OPTIONS") return new Response(null, { headers });

    try {
      // Create tables if missing (safe on every request)
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS volunteers (
        id TEXT PRIMARY KEY,
        name TEXT,
        father_name TEXT,
        dob TEXT,
        mobile TEXT,
        whatsapp TEXT,
        voter_card TEXT UNIQUE,
        district TEXT,
        address TEXT,
        qualification TEXT,
        experience TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`).run();
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS public_links (
        id TEXT PRIMARY KEY,
        title TEXT,
        link TEXT,
        category TEXT DEFAULT 'general',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`).run();
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS public_files (
        id TEXT PRIMARY KEY,
        title TEXT,
        filename TEXT,
        data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`).run();
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS exam_results (
        volunteer_id TEXT PRIMARY KEY,
        name TEXT,
        phone TEXT,
        bengali REAL,
        english REAL,
        history REAL,
        geography REAL,
        math REAL,
        gk REAL,
        bengali_grade TEXT,
        english_grade TEXT,
        history_grade TEXT,
        geography_grade TEXT,
        math_grade TEXT,
        gk_grade TEXT,
        total_grade TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`).run();
      // Try add voter_card if old table exists without it (ignore error if already present)
      try {
        await env.DB.prepare(`ALTER TABLE volunteers ADD COLUMN voter_card TEXT`).run();
      } catch (_) {}
    } catch (e) {}

    // == PUBLIC LINKS API ==
    if (url.pathname === "/api/links") {
      const cat = url.searchParams.get("cat") || "all";
      try {
        let results: any;
        if (cat === "all") {
          results = await env.DB.prepare(`SELECT * FROM public_links WHERE link NOT LIKE "/api/volunteer/pdf/%" ORDER BY created_at DESC`).all();
        } else {
          results = await env.DB.prepare(`SELECT * FROM public_links WHERE category = ? AND link NOT LIKE "/api/volunteer/pdf/%" ORDER BY created_at DESC`).bind(cat).all();
        }
        const files = await env.DB.prepare(`SELECT id, title, filename, created_at FROM public_files ORDER BY created_at DESC`).all();
        const fileLinks = (files.results || []).map((f: any) => ({
          id: f.id, title: f.title, link: `/api/file/${f.id}`, created_at: f.created_at, isFile: true
        }));
        const combined = [...(results.results || []), ...fileLinks].sort((a: any, b: any) => (b.created_at || 0) - (a.created_at || 0));
        return Response.json({ success: true, data: combined }, { headers });
      } catch (e: any) {
        return Response.json({ success: true, data: [] }, { headers });
      }
    }

    // Serve uploaded file
    if (url.pathname.startsWith("/api/file/")) {
      const q = decodeURIComponent(url.pathname.split("/").pop() || "");
      if (!q) return Response.json({ success: false, message: "ID পাওয়া যায়নি" }, { headers });
      const row: any = await env.DB.prepare("SELECT * FROM public_files WHERE id = ?").bind(q).first();
      if (!row) return Response.json({ success: false, message: "ফাইল পাওয়া যায়নি" }, { headers });
      const dataUrl = row.data as string;
      const commaIdx = dataUrl.indexOf(",");
      if (commaIdx === -1) {
        return new Response(dataUrl, { headers: { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*" } });
      }
      const meta = dataUrl.substring(0, commaIdx);
      const b64 = dataUrl.substring(commaIdx + 1);
      const mimeM = meta.match(/data:(.*?);base64/);
      const mime = mimeM ? mimeM[1] : "application/octet-stream";
      try {
        const binary = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        return new Response(binary, {
          headers: {
            "Content-Type": mime,
            "Content-Disposition": `inline; filename="${row.filename || row.title || 'file'}"`,
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=86400"
          }
        });
      } catch {
        return Response.json({ success: false, message: "File decode error" }, { headers });
      }
    }

    // Volunteer Register - with voter_card unique check
    if (url.pathname === "/api/volunteer/register" && req.method === "POST") {
      try {
        const body: any = await req.json();
        if (!body.name || !body.mobile) {
          return Response.json({ success: false, message: "নাম ও মোবাইল আবশ্যক" }, { headers });
        }
        if (!body.voter_card || !body.voter_card.trim()) {
          return Response.json({ success: false, message: "ভোটার কার্ড নম্বর আবশ্যক" }, { headers });
        }
        const voter = body.voter_card.trim();
        // Check unique voter_card
        const exist: any = await env.DB.prepare("SELECT id FROM volunteers WHERE voter_card = ?").bind(voter).first();
        if (exist) {
          return Response.json({ success: false, message: "এই ভোটার কার্ড নম্বর ইতিমধ্যে রেজিস্টার করা আছে। দ্বিতীয়বার নেওয়া যাবে না।" }, { headers });
        }
        // Also check mobile unique optional
        const existM: any = await env.DB.prepare("SELECT id FROM volunteers WHERE mobile = ?").bind(body.mobile).first();
        if (existM) {
          return Response.json({ success: false, message: "এই মোবাইল নম্বর ইতিমধ্যে রেজিস্টার করা আছে।" }, { headers });
        }
        const id = generateId();
        await env.DB.prepare(`INSERT INTO volunteers (id, name, father_name, dob, mobile, whatsapp, voter_card, district, address, qualification, experience, status)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
          .bind(id, body.name, body.father_name||'', body.dob||'', body.mobile, body.whatsapp||'', voter, body.district||'', body.address||'', body.qualification||'', body.experience||'', 'pending').run();
        return Response.json({ success: true, id }, { headers });
      } catch (e: any) {
        if (e.message && e.message.includes("UNIQUE")) {
          return Response.json({ success: false, message: "ভোটার কার্ড বা মোবাইল ইতিমধ্যে আছে" }, { headers });
        }
        return Response.json({ success: false, message: e.message }, { headers });
      }
    }

    // Volunteer Status Public
    if (url.pathname.startsWith("/api/volunteer/status/") && req.method === "GET") {
      const q = decodeURIComponent(url.pathname.split("/").pop() || "");
      const row: any = await env.DB.prepare("SELECT * FROM volunteers WHERE id = ? OR mobile = ? OR voter_card = ?").bind(q, q, q).first();
      if (!row) return Response.json({ success: false, message: "তথ্য পাওয়া যায়নি" }, { headers });
      return Response.json({ success: true, data: row }, { headers });
    }

    // Volunteer PDF View
    if (url.pathname.startsWith("/api/volunteer/pdf/")) {
      const parts = url.pathname.split("/");
      const id = parts[4] ? parts[4].split("?")[0] : "";
      const row: any = await env.DB.prepare("SELECT * FROM volunteers WHERE id = ?").bind(id).first();
      if (!row) return Response.json({ success: false, message: "তথ্য পাওয়া যায়নি" }, { headers });
      const html = PDF_PAGE(row);
      return new Response(html, { headers: { "Content-Type": "text/html;charset=utf-8", "Access-Control-Allow-Origin": "*" } });
    }

    // PUBLIC RESULT API
    if (url.pathname.startsWith("/api/result/") && req.method === "GET") {
      const q = decodeURIComponent(url.pathname.split("/").pop() || "");
      const volunteer: any = await env.DB.prepare("SELECT * FROM volunteers WHERE id=? OR mobile=? OR voter_card=?").bind(q,q,q).first();
      if (!volunteer) return Response.json({ success: false, message: "Volunteer ID/Phone পাওয়া যায়নি" }, { headers });
      const exam: any = await env.DB.prepare("SELECT * FROM exam_results WHERE volunteer_id=?").bind(volunteer.id).first();
      if (!exam) return Response.json({ success: false, message: "Result এখনো দেওয়া হয়নি, Admin এর সাথে যোগাযোগ করুন" }, { headers });
      const merged = { ...volunteer, ...exam, id: volunteer.id };
      return Response.json({ success: true, data: merged }, { headers });
    }

    // ADMIN EXAM RESULTS API - marks based
    if (url.pathname === "/api/admin/results") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token") || "";
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized" }, { headers });
      if (req.method === "GET") {
        const results = await env.DB.prepare("SELECT * FROM exam_results ORDER BY created_at DESC").all();
        return Response.json({ success: true, data: results.results }, { headers });
      }
      if (req.method === "POST") {
        const d: any = await req.json();
        if (!d.volunteer_id) return Response.json({ success: false, message: "volunteer_id লাগবে" }, { headers });
        const ben = Number(d.bengali)||0, eng=Number(d.english)||0, his=Number(d.history)||0;
        const geo=Number(d.geography)||0, math=Number(d.math)||0, gk=Number(d.gk)||0;
        const bg = marksToGrade(ben), eg=marksToGrade(eng), hg=marksToGrade(his);
        const gg=marksToGrade(geo), mg=marksToGrade(math), kkg=marksToGrade(gk);
        const totalG = d.total_grade || (() => {
          const pts = [bg,eg,hg,gg,mg,kkg].map(gradeToPoint);
          const avg = pts.reduce((a,b)=>a+b,0)/6;
          if(avg>=4.5) return 'A+'; if(avg>=3.5) return 'A'; if(avg>=2.75) return 'B+'; if(avg>=2) return 'B'; return 'F';
        })();
        await env.DB.prepare(`INSERT OR REPLACE INTO exam_results
          (volunteer_id, name, phone, bengali, english, history, geography, math, gk,
           bengali_grade, english_grade, history_grade, geography_grade, math_grade, gk_grade, total_grade)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
          .bind(d.volunteer_id, d.name||'', d.phone||'', ben, eng, his, geo, math, gk, bg, eg, hg, gg, mg, kkg, totalG).run();
        return Response.json({ success: true, message: "Result Saved (মার্কস + গ্রেড অটো)" }, { headers });
      }
    }
    if (url.pathname.startsWith("/api/admin/results/") && req.method === "DELETE") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token") || "";
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized" }, { headers });
      const id = url.pathname.split("/").pop() || "";
      await env.DB.prepare("DELETE FROM exam_results WHERE volunteer_id = ?").bind(id).run();
      return Response.json({ success: true, message: "Deleted" }, { headers });
    }

    // ADMIN LINKS
    if (url.pathname === "/api/admin/links") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token") || "";
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized" }, { headers });
      if (req.method === "GET") {
        const results = await env.DB.prepare("SELECT * FROM public_links ORDER BY created_at DESC").all();
        return Response.json({ success: true, data: results.results }, { headers });
      }
      if (req.method === "POST") {
        const d: any = await req.json();
        if (!d.title || !d.link) return Response.json({ success: false, message: "title/link লাগবে" }, { headers });
        const id = d.id || generateId();
        await env.DB.prepare("INSERT INTO public_links (id, title, link, created_at) VALUES (?,?,?,?)").bind(id, d.title, d.link, new Date().toISOString()).run();
        return Response.json({ success: true, id, message: "Link added" }, { headers });
      }
    }

    if (url.pathname.startsWith("/api/admin/links/") && req.method === "DELETE") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token") || "";
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized" }, { headers });
      const id = url.pathname.split("/").pop() || "";
      await env.DB.prepare("DELETE FROM public_links WHERE id = ?").bind(id).run();
      await env.DB.prepare("DELETE FROM public_files WHERE id = ?").bind(id).run();
      return Response.json({ success: true }, { headers });
    }

    // ADMIN Volunteers
    if (url.pathname === "/api/admin/volunteers" && req.method === "GET") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token") || "";
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized" }, { headers });
      const results = await env.DB.prepare("SELECT * FROM volunteers ORDER BY created_at DESC").all();
      return Response.json({ success: true, data: results.results }, { headers });
    }

    if (url.pathname.startsWith("/api/admin/volunteers/") && url.pathname.endsWith("/status") && req.method === "PUT") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token") || "";
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized" }, { headers });
      const id = url.pathname.split("/")[4];
      const body: any = await req.json();
      await env.DB.prepare("UPDATE volunteers SET status = ? WHERE id = ?").bind(body.status, id).run();
      return Response.json({ success: true, message: "Updated - " + body.status }, { headers });
    }

    // ADMIN Upload
    if (url.pathname === "/api/admin/upload" && req.method === "POST") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token") || "";
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized" }, { headers });
      const body: any = await req.json();
      if (!body.data) return Response.json({ success: false, message: "File data missing" }, { headers });
      const id = generateId();
      await env.DB.prepare("INSERT INTO public_files (id, title, filename, data, created_at) VALUES (?,?,?,?,?)").bind(id, body.title||body.filename, body.filename||body.title, body.data, new Date().toISOString()).run();
      await env.DB.prepare("INSERT INTO public_links (id, title, link, created_at) VALUES (?,?,?,?)").bind(id, body.title||body.filename, `/api/file/${id}`, new Date().toISOString()).run();
      return Response.json({ success: true, id, link: `/api/file/${id}` }, { headers });
    }

    // Pages
    if (url.pathname === "/") {
      return new Response(HTML_PAGE, { headers: { "Content-Type": "text/html;charset=utf-8", "Access-Control-Allow-Origin": "*" } });
    }
    if (url.pathname === "/status") {
      return new Response(STATUS_PAGE, { headers: { "Content-Type": "text/html;charset=utf-8" } });
    }
    if (url.pathname === "/links") {
      return new Response(LINKS_PAGE, { headers: { "Content-Type": "text/html;charset=utf-8" } });
    }
    if (url.pathname === "/result") {
      return new Response(RESULT_PAGE, { headers: { "Content-Type": "text/html;charset=utf-8" } });
    }
    if (url.pathname === "/quiz") {
      return new Response(QUIZ_PAGE, { headers: { "Content-Type": "text/html;charset=utf-8" } });
    }
    if (url.pathname === "/admin") {
      return new Response(ADMIN_PAGE, { headers: { "Content-Type": "text/html;charset=utf-8" } });
    }

    return new Response("Not Found", { status: 404 });
  }
}
