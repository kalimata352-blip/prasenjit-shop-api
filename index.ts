type Env = {
  DB: D1Database;
  ADMIN_TOKEN: string;
};

function generateId() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `নোহনা -${num}`;
}

function generateUniqueId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Token",
    "Content-Type": "application/json",
  };
}

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
<a class="btn" href="/quiz" style="background:#2563eb">MCQ Quiz (60 প্রশ্ন)</a>
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

// ===== QUIZ QUESTIONS =====
const QUIZ_QUESTIONS = [
  {s:"বাংলা",k:"bengali",q:"রবীন্দ্রনাথ ঠাকুরের কোন কাব্যগ্রন্থের জন্য তিনি নোবেল পুরস্কার পান?",o:["গীতাঞ্জলি","সোনার তরী","মানসী","চিত্রা"],a:0},
  {s:"বাংলা",k:"bengali",q:"বঙ্কিমচন্দ্রের 'আনন্দমঠ'-এ কোন গান অন্তর্ভুক্ত?",o:["বন্দে মাতরম","জনগণমন","আমার সোনার বাংলা","ধনধান্যে পুষ্পে ভরা"],a:0},
  {s:"বাংলা",k:"bengali",q:"নজরুলের 'বিদ্রোহী' কবিতা প্রথম কোন পত্রিকায় প্রকাশিত?",o:["বিজলী","প্রবাসী","সবুজপত্র","কল্লোল"],a:0},
  {s:"বাংলা",k:"bengali",q:"বাংলা সাহিত্যের প্রথম আধুনিক উপন্যাস কোনটি?",o:["আলালের ঘরের দুলাল","দুর্গেশনন্দিনী","কপালকুণ্ডলা","বিষবৃক্ষ"],a:0},
  {s:"বাংলা",k:"bengali",q:"শরৎচন্দ্রের কোন উপন্যাস নিষিদ্ধ হয়েছিল?",o:["পথের দাবী","দেবদাস","পরিণীতা","চরিত্রহীন"],a:0},
  {s:"বাংলা",k:"bengali",q:"জীবনানন্দ দাশের 'বনলতা সেন'-এ কোন শহরের উল্লেখ?",o:["নটোর","কলকাতা","ঢাকা","পাটনা"],a:0},
  {s:"বাংলা",k:"bengali",q:"বাংলা ভাষায় প্রথম মুদ্রিত বই কোনটি?",o:["কৃপার শাস্ত্রের অর্থভেদ","হুতোম প্যাঁচার নকশা","আলালের ঘরের দুলাল","মেঘনাদবধ কাব্য"],a:0},
  {s:"বাংলা",k:"bengali",q:"মাইকেল মধুসূদনের মহাকাব্য কোনটি?",o:["মেঘনাদবধ কাব্য","পদ্মাবতী","বীরাঙ্গনা","কৃষ্ণকুমারী"],a:0},
  {s:"বাংলা",k:"bengali",q:"'হাজার চুরাশির মা' এর লেখক কে?",o:["মহাশ্বেতা দেবী","আশাপূর্ণা দেবী","তারাশঙ্কর","বিভূতিভূষণ"],a:0},
  {s:"বাংলা",k:"bengali",q:"বাংলা বর্ণমালায় ব্যঞ্জনবর্ণ কয়টি?",o:["৩৯","৩৬","৪১","৩৩"],a:0},
  {s:"ইংরেজি",k:"english",q:"Synonym of 'Ephemeral'?",o:["Transient","Permanent","Eternal","Infinite"],a:0},
  {s:"ইংরেজি",k:"english",q:"Antonym of 'Benevolent'?",o:["Malevolent","Kind","Generous","Charitable"],a:0},
  {s:"ইংরেজি",k:"english",q:"'Neither the teacher nor the students ___ present.'",o:["were","was","is","are"],a:0},
  {s:"ইংরেজি",k:"english",q:"Passive of 'He writes a letter'?",o:["A letter is written by him","A letter was written by him","A letter is being written by him","A letter has written by him"],a:0},
  {s:"ইংরেজি",k:"english",q:"Figure of speech: 'The pen is mightier than the sword'",o:["Metonymy","Metaphor","Simile","Personification"],a:0},
  {s:"ইংরেজি",k:"english",q:"'I wish I ___ a bird.'",o:["were","was","am","be"],a:0},
  {s:"ইংরেজি",k:"english",q:"'Bibliography' means?",o:["List of books","Study of insects","Life history","Science of numbers"],a:0},
  {s:"ইংরেজি",k:"english",q:"Correct spelling?",o:["Accommodation","Acommodation","Accomodation","Acomodation"],a:0},
  {s:"ইংরেজি",k:"english",q:"'To bury the hatchet' means?",o:["To make peace","To dig a hole","To start a fight","To hide something"],a:0},
  {s:"ইংরেজি",k:"english",q:"Tense of 'She has been working since morning'?",o:["Present Perfect Continuous","Present Continuous","Past Perfect","Simple Present"],a:0},
  {s:"ইতিহাস",k:"history",q:"কোন আন্দোলনে 'ডান্ডি মার্চ' হয়েছিল?",o:["লবণ সত্যাগ্রহ","অসহযোগ","ভারত ছাড়ো","খিলাফত"],a:0},
  {s:"ইতিহাস",k:"history",q:"মৌর্য সাম্রাজ্যের প্রতিষ্ঠাতা কে?",o:["চন্দ্রগুপ্ত মৌর্য","অশোক","বিন্দুসার","চাণক্য"],a:0},
  {s:"ইতিহাস",k:"history",q:"১৮৫৭ সালের মহাবিদ্রোহের সময় দিল্লির সম্রাট কে?",o:["বাহাদুর শাহ জাফর","আকবর","শাহজাহান","আওরঙ্গজেব"],a:0},
  {s:"ইতিহাস",k:"history",q:"গান্ধীজির 'হিন্দ স্বরাজ' কোন ভাষায় লেখা?",o:["গুজরাটি","হিন্দি","ইংরেজি","মারাঠি"],a:0},
  {s:"ইতিহাস",k:"history",q:"সংবিধান রচনা কমিটির চেয়ারম্যান কে?",o:["ড. বি.আর. আম্বেদকর","রাজেন্দ্র প্রসাদ","নেহেরু","প্যাটেল"],a:0},
  {s:"ইতিহাস",k:"history",q:"পলাশীর যুদ্ধ কোন যুদ্ধের আগে?",o:["বক্সারের যুদ্ধের আগে","বক্সারের যুদ্ধের পরে","পানিপথের যুদ্ধের পরে","হলদিঘাটির যুদ্ধের পরে"],a:0},
  {s:"ইতিহাস",k:"history",q:"সুভাষচন্দ্র বসু কোন বছর কংগ্রেসের সভাপতি হন?",o:["১৯৩৮","১৯৪২","১৯৩০","১৯৪৭"],a:0},
  {s:"ইতিহাস",k:"history",q:"ভারতের প্রথম গভর্নর জেনারেল কে?",o:["ওয়ারেন হেস্টিংস","রবার্ট ক্লাইভ","লর্ড কর্নওয়ালিস","লর্ড ডালহৌসি"],a:0},
  {s:"ইতিহাস",k:"history",q:"'সাবিনার কারাগার' কোন আন্দোলনের সাথে যুক্ত?",o:["স্বদেশী আন্দোলন","অসহযোগ","খিলাফত","ভারত ছাড়ো"],a:0},
  {s:"ইতিহাস",k:"history",q:"গান্ধীজি কত সালে দক্ষিণ আফ্রিকা থেকে ভারতে ফিরে আসেন?",o:["১৯১৫","১৯১৯","১৯২০","১৯১০"],a:0},
  {s:"ভূগোল",k:"geography",q:"ভারতের কোন রাজ্যে সবচেয়ে বেশি বনভূমি?",o:["মধ্যপ্রদেশ","অরুণাচল প্রদেশ","মহারাষ্ট্র","ওড়িশা"],a:0},
  {s:"ভূগোল",k:"geography",q:"গঙ্গা নদীর উৎস কোন হিমবাহ?",o:["গঙ্গোত্রী","সিয়াচেন","জিমু","পুন্ডু"],a:0},
  {s:"ভূগোল",k:"geography",q:"'সিলিকন ভ্যালি অব ইন্ডিয়া' কোন শহর?",o:["বেঙ্গালুরু","হায়দ্রাবাদ","পুণে","চেন্নাই"],a:0},
  {s:"ভূগোল",k:"geography",q:"থার মরুভূমি কোন দুই রাজ্যে বিস্তৃত?",o:["রাজস্থান ও গুজরাট","রাজস্থান ও হরিয়ানা","গুজরাট ও মহারাষ্ট্র","রাজস্থান ও পাঞ্জাব"],a:0},
  {s:"ভূগোল",k:"geography",q:"ভারতের দীর্ঘতম উপকূল কোন রাজ্যের?",o:["গুজরাট","অন্ধ্রপ্রদেশ","তামিলনাড়ু","মহারাষ্ট্র"],a:0},
  {s:"ভূগোল",k:"geography",q:"সুন্দরবন কোন নদীর বদ্বীপ?",o:["গঙ্গা-ব্রহ্মপুত্র","মহানদী","গোদাবরী","কৃষ্ণা"],a:0},
  {s:"ভূগোল",k:"geography",q:"নীলগিরি কোন পাহাড়ে?",o:["পশ্চিমঘাট","পূর্বঘাট","হিমালয়","আরাবল্লী"],a:0},
  {s:"ভূগোল",k:"geography",q:"ভারতের সর্বোচ্চ জলপ্রপাত?",o:["কুনচিকল","যোগ জলপ্রপাত","দুধসাগর","চিত্রকোট"],a:0},
  {s:"ভূগোল",k:"geography",q:"'ভারতের ফলের বাটি' কোন রাজ্য?",o:["হিমাচল প্রদেশ","জম্মু ও কাশ্মীর","উত্তরাখণ্ড","কেরল"],a:0},
  {s:"ভূগোল",k:"geography",q:"বিষুব রেখার সবচেয়ে কাছের শহর?",o:["তিরুবনন্তপুরম","চেন্নাই","বেঙ্গালুরু","হায়দ্রাবাদ"],a:0},
  {s:"অংক",k:"math",q:"একটি সংখ্যার ২০% ৪০ হলে সংখ্যাটি কত?",o:["২০০","৮০","১০০","১৬০"],a:0},
  {s:"অংক",k:"math",q:"৩/৪ + ৫/৬ = ?",o:["১৯/১২","৮/১০","১৫/২৪","২/৩"],a:0},
  {s:"অংক",k:"math",q:"ত্রিভুজের কোণ ২:৩:৪ হলে সবচেয়ে বড় কোণ?",o:["৮০°","৬০°","৯০°","৭০°"],a:0},
  {s:"অংক",k:"math",q:"৫ জন ১০ দিনে কাজ করে। ১০ জন কত দিনে করবে?",o:["৫ দিন","১০ দিন","২ দিন","২০ দিন"],a:0},
  {s:"অংক",k:"math",q:"বর্গের পরিধি ৪৮ সেমি হলে ক্ষেত্রফল?",o:["১৪৪ বর্গ সেমি","১২ বর্গ সেমি","২৪ বর্গ সেমি","৯৬ বর্গ সেমি"],a:0},
  {s:"অংক",k:"math",q:"২৫% লাভে ৫০০ টাকায় বিক্রি হলে ক্রয়মূল্য?",o:["৪০০","৩৭৫","৪২৫","৪৫০"],a:0},
  {s:"অংক",k:"math",q:"১২ এর বর্গমূল?",o:["২√৩","৪","৬","৩"],a:0},
  {s:"অংক",k:"math",q:"৭ দিয়ে ভাগ করলে অবশিষ্ট ৩। ১০ বাড়ালে অবশিষ্ট?",o:["৬","৩","০","১"],a:0},
  {s:"অংক",k:"math",q:"৩ ঘণ্টায় ৭৫ কিমি গেলে গতি?",o:["২৫ কিমি/ঘণ্টা","২০","৩০","১৫"],a:0},
  {s:"অংক",k:"math",q:"১ থেকে ১০০ পর্যন্ত মৌলিক সংখ্যা কয়টি?",o:["২৫","২৩","২৬","২৪"],a:0},
  {s:"GK",k:"gk",q:"বর্তমান প্রধানমন্ত্রী কোন লোকসভা কেন্দ্র থেকে?",o:["বারাণসী","রায়বরেলী","গান্ধীনগর","মেদিনীপুর"],a:0},
  {s:"GK",k:"gk",q:"ভারতের জাতীয় জলজ প্রাণী?",o:["গঙ্গা ডলফিন","কুমির","কচ্ছপ","হাঙর"],a:0},
  {s:"GK",k:"gk",q:"ভারত স্বাধীনতা পায় কোন বছর?",o:["১৯৪৭","১৯৫০","১৯৪২","১৯৩০"],a:0},
  {s:"GK",k:"gk",q:"ক্ষেত্রফলে সবচেয়ে বড় রাজ্য?",o:["রাজস্থান","মধ্যপ্রদেশ","মহারাষ্ট্র","উত্তরপ্রদেশ"],a:0},
  {s:"GK",k:"gk",q:"জাতীয় ক্যালেন্ডার কোন যুগ অনুসারে?",o:["শক যুগ","বিক্রম সংবৎ","হিজরি","খ্রিস্টাব্দ"],a:0},
  {s:"GK",k:"gk",q:"সংসদ ভবন কোন শহরে?",o:["নয়াদিল্লি","মুম্বাই","কলকাতা","চেন্নাই"],a:0},
  {s:"GK",k:"gk",q:"ভারতের প্রথম মহিলা রাষ্ট্রপতি?",o:["প্রতিভা পাটিল","ইন্দিরা গান্ধী","সারোজিনী নাইডু","দ্রৌপদী মুর্মু"],a:0},
  {s:"GK",k:"gk",q:"অলিম্পিকে ভারতের প্রথম স্বর্ণপদক কে জিতেন?",o:["অভিনিব বিন্দ্রা","মিলখা সিং","পি.টি. উষা","সায়না নেহওয়াল"],a:0},
  {s:"GK",k:"gk",q:"ভারতের জাতীয় নদী?",o:["গঙ্গা","যমুনা","ব্রহ্মপুত্র","গোদাবরী"],a:0},
  {s:"GK",k:"gk",q:"বিশ্ব পরিবেশ দিবস কোন দিন?",o:["৫ জুন","২২ এপ্রিল","২১ মার্চ","১৬ সেপ্টেম্বর"],a:0}
];

const QUIZ_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>MCQ Exam - 600 Marks</title>
<style>
body{font-family:system-ui;padding:12px;background:#f0f9ff;margin:0}
.card{max-width:700px;margin:15px auto;background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 12px #0001}
.qbox{border:1px solid #e2e8f0;padding:14px;border-radius:10px;margin-bottom:12px;background:#fafafa}
.qbox h4{margin:0 0 8px;color:#1e40af;font-size:15px}
.opt{display:block;padding:8px 12px;margin:4px 0;border:1px solid #cbd5e1;border-radius:8px;cursor:pointer;background:#fff}
.opt:hover{background:#eff6ff}
.opt input{margin-right:8px}
.sub{font-size:12px;color:#64748b;margin-bottom:4px}
button{width:100%;padding:14px;background:#2563eb;color:#fff;border:none;border-radius:10px;font-size:16px;font-weight:bold;cursor:pointer;margin-top:10px}
button:disabled{opacity:0.6}
#scoreBox{text-align:center;padding:20px;background:#f0fdf4;border-radius:12px;margin-top:15px;display:none}
.timer{text-align:center;font-size:18px;color:#dc2626;margin-bottom:10px;font-weight:bold}
input.login{width:100%;padding:14px;margin:8px 0;border:1px solid #ccc;border-radius:10px;box-sizing:border-box;font-size:16px}
#loginBox,#examBox{display:none}
#loginBox{display:block}
.warn{background:#fef2f2;color:#dc2626;padding:12px;border-radius:8px;margin:10px 0;text-align:center}
</style>
</head><body>
<div class="card">
<h2 style="text-align:center">📝 MCQ পরীক্ষা (৬০০ নম্বর)</h2>
<p style="text-align:center;color:#64748b">৬টি বিষয় × ১০০ নম্বর • পাস মার্ক: ২১০ • শুধু Approved • একবার সুযোগ</p>
<div id="loginBox">
  <p style="text-align:center">আপনার <b>Volunteer ID</b> দিন (শুধু Approved ব্যক্তি প্রবেশ করতে পারবেন)</p>
  <input class="login" id="volId" placeholder="যেমন: a1b2c3d4">
  <button onclick="startExam()">প্রশ্নপত্র খুলুন</button>
  <div id="loginMsg"></div>
</div>
<div id="examBox">
  <div class="timer" id="timer">সময়: ৬০:০০</div>
  <p style="text-align:center" id="examInfo"></p>
  <form id="quizForm"></form>
  <button type="button" id="submitQuiz" onclick="submitQuiz()">উত্তরপত্র জমা দিন (একবারই)</button>
  <div id="scoreBox"></div>
</div>
<div style="text-align:center;margin-top:15px"><a href="/">← Home</a> | <a href="/result">Result চেক</a> | <a href="/status">Status</a></div>
</div>
<script>
const QUESTIONS = ${JSON.stringify(QUIZ_QUESTIONS)};
const MARKS_PER_Q = 10;
const PASS_MARK = 210;
let timeLeft = 60 * 60;
let timerInterval;
let currentVol = null;
async function startExam(){
  const id = document.getElementById('volId').value.trim();
  if(!id) return alert('ID দিন');
  document.getElementById('loginMsg').innerHTML='⏳ চেক করা হচ্ছে...';
  try{
    const r = await fetch('/api/quiz/check/'+encodeURIComponent(id));
    const j = await r.json();
    if(!j.success){
      document.getElementById('loginMsg').innerHTML='<div class="warn">❌ '+j.message+'</div>';
      return;
    }
    currentVol = j.data;
    document.getElementById('loginBox').style.display='none';
    document.getElementById('examBox').style.display='block';
    document.getElementById('examInfo').innerHTML='<b>'+currentVol.name+'</b> | ID: '+currentVol.id+' | মোবাইল: '+currentVol.mobile;
    render();
    startTimer();
  }catch(e){
    document.getElementById('loginMsg').innerHTML='<div class="warn">❌ Server Error</div>';
  }
}
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
      <div class="sub">\${q.s} • প্রশ্ন \${i+1}/৬০ • ১০ নম্বর</div>
      <h4>\${i+1}. \${q.q}</h4>
      \${q.o.map((opt,j)=>\`
        <label class="opt"><input type="radio" name="q\${i}" value="\${j}"> \${opt}</label>
      \`).join('')}
    </div>
  \`).join('');
}
async function submitQuiz(){
  if(!currentVol) return;
  if(!confirm('উত্তরপত্র জমা দিলে আর পরিবর্তন করা যাবে না। নিশ্চিত?')) return;
  clearInterval(timerInterval);
  document.getElementById('submitQuiz').disabled=true;
  document.getElementById('submitQuiz').textContent='জমা হচ্ছে...';
  const subjectScores = {bengali:0,english:0,history:0,geography:0,math:0,gk:0};
  let total=0;
  QUESTIONS.forEach((q,i)=>{
    const sel=document.querySelector('input[name="q'+i+'"]:checked');
    const ans=sel ? parseInt(sel.value) : -1;
    if(ans===q.a){
      subjectScores[q.k] += MARKS_PER_Q;
      total += MARKS_PER_Q;
    }
  });
  try{
    const r = await fetch('/api/quiz/submit',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        volunteer_id: currentVol.id,
        name: currentVol.name,
        phone: currentVol.mobile,
        ...subjectScores,
        total
      })
    });
    const j = await r.json();
    const box=document.getElementById('scoreBox');
    box.style.display='block';
    if(!j.success){
      box.innerHTML='<div class="warn">❌ '+j.message+'</div>';
      return;
    }
    const passed = total >= PASS_MARK;
    box.innerHTML=\`
      <h2>🎯 আপনার স্কোর: \${total}/৬০০</h2>
      <p>বাংলা: \${subjectScores.bengali}/১০০ | ইংরেজি: \${subjectScores.english}/১০০</p>
      <p>ইতিহাস: \${subjectScores.history}/১০০ | ভূগোল: \${subjectScores.geography}/১০০</p>
      <p>অংক: \${subjectScores.math}/১০০ | GK: \${subjectScores.gk}/১০০</p>
      <h3 style="color:\${passed?'#16a34a':'#dc2626'}">\${passed?'✅ পাস (Pass) — সিলেক্টেড':'❌ ফেল (Fail) — ন্যূনতম ২১০ লাগবে'}</h3>
      <p>রেজাল্ট অটো সেভ হয়েছে। <a href="/result?id=\${currentVol.id}">Result দেখুন</a> | <a href="/status">Status চেক</a></p>
    \`;
    document.getElementById('submitQuiz').textContent='জমা সম্পন্ন';
  }catch(e){
    document.getElementById('scoreBox').style.display='block';
    document.getElementById('scoreBox').innerHTML='<div class="warn">❌ Network Error</div>';
  }
}
</script>
</body></html>`;

const ADMIN_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:system-ui;padding:12px;background:#f9f9f9}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{border:1px solid #ddd;padding:6px;text-align:left}
th{background:#eee}
.card{background:#fff;padding:15px;border-radius:10px;margin-bottom:15px;box-shadow:0 1px 5px #0001}
input,select,textarea{padding:8px;margin:4px 0;border:1px solid #ccc;border-radius:6px;width:100%;box-sizing:border-box}
button{padding:8px 12px;border:none;border-radius:6px;background:#000;color:#fff;cursor:pointer;margin:2px}
.tab{padding:10px 15px;background:#ddd;border:none;margin-right:5px;border-radius:8px 8px 0 0;cursor:pointer}
.tab.active{background:#000;color:#fff}
.marks-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:10px}
label{font-size:13px;font-weight:600}
.note-box{background:#f8fafc;border:1px solid #e2e8f0;padding:10px;border-radius:8px;margin:6px 0;font-size:13px}
.note-date{font-size:11px;color:#64748b}
</style>
</head><body>
<div style="max-width:1100px;margin:auto">
<h2>Admin Panel</h2>
Admin Token: <input id="token" type="password" placeholder="Admin Token লিখুন" style="width:70%"><button onclick="saveToken()">Save</button>
<hr>
<button class="tab active" onclick="showTab('vol')">Volunteers</button>
<button class="tab" onclick="showTab('exam')">Exam Result</button>
<button class="tab" onclick="showTab('links')">Links / PDF</button>
<button class="tab" onclick="showTab('emp')">কর্মচারী / মালিক নোট</button>

<div id="volTab" class="card"><h3>Volunteers <button onclick="loadVolunteers()" style="margin-left:10px;padding:6px 10px;font-size:12px">রিফ্রেশ</button></h3><div id="vlist"></div></div>

<div id="examTab" class="card" style="display:none">
<h3>📝 পরীক্ষার মার্কস এন্ট্রি (০-১০০)</h3>
<p style="color:#16a34a;font-size:13px">⭐ মার্কস দিলেই গ্রেড ও পার্সেন্টেজ অটো হিসাব হবে<br>
স্কেল: ≤৩৪ = F | ৩৫-৪৫ = B | ৪৬-৬০ = B+ | ৬১-৮০ = A | ৮১+ = A+</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
<input id="e_id" placeholder="Volunteer ID *">
<input id="e_name" placeholder="নাম">
<input id="e_phone" placeholder="ফোন">
</div>
<div class="marks-grid">
<div><label>বাংলা</label><input type="number" id="e_ben" min="0" max="100" value="0" oninput="calcTotal()"></div>
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
  <b>মোট গ্রেড = <span id="e_total_display" style="font-size:20px">F</span></b> |
  পার্সেন্টেজ = <span id="autoPercent" style="font-size:20px;color:#16a34a">0%</span> |
  রেজাল্ট = <span id="autoResult" style="font-size:18px;color:#dc2626">ফেল</span>
  <input type="hidden" id="e_total" value="F">
</div>
<button onclick="saveExam()" style="width:100%;margin-top:15px;background:#16a34a;padding:12px">💾 Result Save</button>
<div id="examMsg"></div>
<hr><h4>সব রেজাল্ট</h4><div id="examList"></div>
</div>

<div id="linksTab" class="card" style="display:none">
<h3>গুরুত্বপূর্ণ লিংক / PDF</h3>
<input id="ltitle" placeholder="টাইটেল" style="width:60%">
<input id="llink" placeholder="লিংক" style="width:80%">
<button onclick="addLink()">Add Link</button>
<br><small style="display:block;margin:8px 0;color:#666">PDF আপলোড:</small>
<input type="file" id="pdffile" accept=".pdf,.jpg,.png,.jpeg,.doc,.docx">
<input id="pdftitle" placeholder="ফাইলের নাম">
<button onclick="uploadPdf()">আপলোড</button>
<div id="uploadMsg"></div>
<hr><div id="linkList"></div>
</div>

<div id="empTab" class="card" style="display:none">
<h3>👥 কর্মচারী ও মালিকের নোট (ID অনুযায়ী)</h3>
<p style="font-size:13px;color:#555;background:#fef3c7;padding:8px;border-radius:6px">
  <b>আইডি লিখে "লোড করুন" চাপলে</b> পুরনো নোট + তথ্য অটো আসবে।<br>
  উদাহরণ ID: <code>নোহনা -521080</code>
</p>

<div style="margin-bottom:12px">
  <label>কর্মচারী ID *</label>
  <div style="display:flex;gap:8px;align-items:center">
    <input id="emp_id" placeholder="যেমন: নোহনা -521080" style="flex:1">
    <button type="button" onclick="loadEmployeeById()" style="background:#2563eb;white-space:nowrap;padding:10px 14px">🔍 লোড করুন</button>
  </div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
  <div>
    <label>কর্মচারীর নাম *</label>
    <input id="emp_name" placeholder="নাম লিখুন">
  </div>
  <div>
    <label>পদ / ডিপার্টমেন্ট</label>
    <input id="emp_post" placeholder="যেমন: Volunteer / Office Staff">
  </div>
  <div>
    <label>মোবাইল</label>
    <input id="emp_mobile" placeholder="মোবাইল">
  </div>
</div>

<label>আজকের নোট (মালিক লিখবেন)</label>
<textarea id="emp_note" rows="3" placeholder="আজকের কাজ, উপস্থিতি, মন্তব্য, নির্দেশ ইত্যাদি..."></textarea>
<button onclick="saveEmployee()" style="width:100%;margin-top:10px;background:#16a34a;padding:12px">💾 সেভ / নোট যোগ করুন</button>
<div id="empMsg" style="margin-top:8px"></div>

<hr>
<h4>সব কর্মচারী</h4>
<button onclick="loadEmployees()" style="margin-bottom:10px">রিফ্রেশ করুন</button>
<div id="empList"></div>

<hr>
<h4>নির্বাচিত কর্মচারীর পুরনো নোট</h4>
<div id="noteHistory" style="background:#f8fafc;padding:12px;border-radius:8px;min-height:80px">
  আইডি লোড করলে এখানে পুরনো নোট দেখাবে
</div>
</div>

</div>
<script>
let ADMIN_TOKEN = localStorage.getItem('ADMIN_TOKEN') || '';
document.getElementById('token').value = ADMIN_TOKEN;
function saveToken(){ADMIN_TOKEN=document.getElementById('token').value.trim(); localStorage.setItem('ADMIN_TOKEN',ADMIN_TOKEN); alert('Token Saved!');}
function showTab(t){
  document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
  ['volTab','examTab','linksTab','empTab'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.style.display='none';
  });
  const tabs=document.querySelectorAll('.tab');
  if(t=='vol'){document.getElementById('volTab').style.display='block'; tabs[0].classList.add('active');}
  if(t=='exam'){document.getElementById('examTab').style.display='block'; tabs[1].classList.add('active'); loadExamList();}
  if(t=='links'){document.getElementById('linksTab').style.display='block'; tabs[2].classList.add('active'); loadLinksAdmin();}
  if(t=='emp'){document.getElementById('empTab').style.display='block'; tabs[3].classList.add('active'); loadEmployees();}
}
function marksToGrade(m){m=Number(m)||0; if(m<=34)return'F'; if(m<=45)return'B'; if(m<=60)return'B+'; if(m<=80)return'A'; return'A+';}
function gradeToPoint(g){return{'A+':5,'A':4,'B+':3.5,'B':3,'C':2,'D':1,'F':0}[g]||0;}
function pointToGrade(avg){if(avg>=4.5)return'A+'; if(avg>=3.5)return'A'; if(avg>=2.75)return'B+'; if(avg>=2)return'B'; if(avg>=1)return'C'; return'F';}
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
  const resultText=percent>=35?'পাস':'ফেল';
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
  
  let html = '<table><tr><th>ID</th><th>নাম</th><th>মোবাইল</th><th>ভোটার</th><th>District</th><th>Status</th><th>Action</th></tr>';
  (j.data || []).forEach(v => {
    const safeId = (v.id || '').replace(/'/g, "\\\\'");
    const safeName = (v.name || '').replace(/'/g, "\\\\'");
    const safeMobile = (v.mobile || '').replace(/'/g, "\\\\'");
    html += \`<tr>
      <td>\${v.id}</td>
      <td>\${v.name}</td>
      <td>\${v.mobile}</td>
      <td>\${v.voter_card||'-'}</td>
      <td>\${v.district||''}</td>
      <td>\${v.status}</td>
      <td>
        <button onclick="updateStatus('\${safeId}','approved')">Approve</button>
        <button onclick="updateStatus('\${safeId}','rejected')">Reject</button>
        <button onclick="fillExamForm('\${safeId}','\${safeName}','\${safeMobile}')">Exam</button>
      </td>
    </tr>\`;
  });
  html += '</table>';
  document.getElementById('vlist').innerHTML = html;
}
async function updateStatus(id,status){
  if(!ADMIN_TOKEN) return alert('আগে Token দিন');
  try {
    const r = await fetch('/api/admin/volunteers/' + encodeURIComponent(id) + '/status', {
      method: 'PUT',
      headers: {'Content-Type': 'application/json','X-Admin-Token': ADMIN_TOKEN},
      body: JSON.stringify({ status })
    });
    const j = await r.json();
    alert(j.message || JSON.stringify(j));
    if (j.success) loadVolunteers();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}
function fillExamForm(id,name,mobile){
  showTab('exam');
  document.getElementById('e_id').value=id;
  document.getElementById('e_name').value=name;
  document.getElementById('e_phone').value=mobile;
  ['e_ben','e_eng','e_his','e_geo','e_math','e_gk'].forEach(id=>document.getElementById(id).value=0);
  calcTotal();
}
async function saveExam(){
  if(!ADMIN_TOKEN){alert('আগে Token দিন'); return;}
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
  document.getElementById('examMsg').innerHTML='⏳ সেভ হচ্ছে...';
  try{
    const r=await fetch('/api/admin/results',{method:'POST',headers:{'Content-Type':'application/json','X-Admin-Token':ADMIN_TOKEN},body:JSON.stringify(data)});
    const j=await r.json();
    document.getElementById('examMsg').innerHTML=j.success?'✅ '+j.message:'❌ '+j.message;
    if(j.success) loadExamList();
  }catch(err){document.getElementById('examMsg').innerHTML='❌ Error';}
}
async function loadExamList(){
  const r=await fetch('/api/admin/results',{headers:{'X-Admin-Token':ADMIN_TOKEN}});
  const j=await r.json();
  if(!j.success){document.getElementById('examList').innerHTML='❌ '+j.message; return;}
  document.getElementById('examList').innerHTML='<table><tr><th>ID</th><th>নাম</th><th>বাং</th><th>ইং</th><th>ইতি</th><th>ভূগো</th><th>অংক</th><th>GK</th><th>মোট</th><th>%</th><th>Del</th></tr>'+j.data.map(e=>{
    const marks=[e.bengali,e.english,e.history,e.geography,e.math,e.gk].map(Number);
    const pct=Math.round(marks.reduce((a,b)=>a+b,0)/6);
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
  if(!title||!link) return alert('Title + Link দিন');
  const r=await fetch('/api/admin/links',{method:'POST',headers:{'Content-Type':'application/json','X-Admin-Token':ADMIN_TOKEN},body:JSON.stringify({title,link})});
  const j=await r.json(); alert(j.message); if(j.success) loadLinksAdmin();
}
async function delLink(id){
  if(!confirm('Delete?')) return;
  await fetch('/api/admin/links/'+id,{method:'DELETE',headers:{'X-Admin-Token':ADMIN_TOKEN}});
  loadLinksAdmin();
}
async function uploadPdf(){
  const file=document.getElementById('pdffile').files[0]; const title=document.getElementById('pdftitle').value.trim();
  if(!file) return alert('ফাইল সিলেক্ট করুন');
  document.getElementById('uploadMsg').textContent='আপলোড হচ্ছে...';
  const reader=new FileReader();
  reader.onload=async function(){
    const r=await fetch('/api/admin/upload',{method:'POST',headers:{'Content-Type':'application/json','X-Admin-Token':ADMIN_TOKEN},body:JSON.stringify({title:title||file.name,data:reader.result,filename:file.name})});
    const j=await r.json();
    if(j.success){document.getElementById('uploadMsg').innerHTML='✅ সফল! <a href="'+j.link+'" target="_blank">'+j.link+'</a>'; loadLinksAdmin();}
    else document.getElementById('uploadMsg').textContent='❌ '+j.message;
  };
  reader.readAsDataURL(file);
}

// ===== কর্মচারী নোট =====
async function loadEmployeeById(){
  if(!ADMIN_TOKEN) return alert('আগে Token দিন');
  const empId = document.getElementById('emp_id').value.trim();
  if(!empId) return alert('আগে ID লিখুন');
  document.getElementById('empMsg').innerHTML = '⏳ লোড হচ্ছে...';
  try{
    const r = await fetch('/api/admin/employees',{headers:{'X-Admin-Token':ADMIN_TOKEN}});
    const j = await r.json();
    if(!j.success){ document.getElementById('empMsg').innerHTML='❌ '+j.message; return; }
    const found = (j.data || []).find(e => e.emp_id === empId || e.emp_id.toUpperCase() === empId.toUpperCase());
    if(found){
      document.getElementById('emp_name').value = found.name || '';
      document.getElementById('emp_post').value = found.post || '';
      document.getElementById('emp_mobile').value = found.mobile || '';
      document.getElementById('emp_id').value = found.emp_id;
      document.getElementById('empMsg').innerHTML = '✅ পুরনো তথ্য লোড হয়েছে';
      loadNoteHistory(found.emp_id);
    } else {
      document.getElementById('emp_name').value = '';
      document.getElementById('emp_post').value = '';
      document.getElementById('emp_mobile').value = '';
      document.getElementById('empMsg').innerHTML = 'ℹ️ এই ID-তে আগে কোনো রেকর্ড নেই। নতুন হিসেবে সেভ করতে পারবেন।';
      document.getElementById('noteHistory').innerHTML = '<p>এই ID-তে এখনো কোনো নোট নেই</p>';
    }
  }catch(e){
    document.getElementById('empMsg').innerHTML = '❌ Network Error';
  }
}

async function saveEmployee(){
  if(!ADMIN_TOKEN) return alert('আগে Token দিন');
  const name = document.getElementById('emp_name').value.trim();
  let empId = document.getElementById('emp_id').value.trim();
  const post = document.getElementById('emp_post').value.trim();
  const mobile = document.getElementById('emp_mobile').value.trim();
  const note = document.getElementById('emp_note').value.trim();
  if(!name || !empId) return alert('নাম ও ID আবশ্যক');
  document.getElementById('empMsg').innerHTML='⏳ সেভ হচ্ছে...';
  try{
    const r = await fetch('/api/admin/employees',{
      method:'POST',
      headers:{'Content-Type':'application/json','X-Admin-Token':ADMIN_TOKEN},
      body:JSON.stringify({emp_id:empId, name, post, mobile, note})
    });
    const j = await r.json();
    document.getElementById('empMsg').innerHTML = j.success ? '✅ '+j.message : '❌ '+j.message;
    if(j.success){
      document.getElementById('emp_note').value = '';
      loadEmployees();
      loadNoteHistory(empId);
    }
  }catch(e){document.getElementById('empMsg').innerHTML='❌ Network Error';
}

async function loadEmployees(){
  if(!ADMIN_TOKEN) return;
  const r = await fetch('/api/admin/employees',{headers:{'X-Admin-Token':ADMIN_TOKEN}});
  const j = await r.json();
  if(!j.success){document.getElementById('empList').innerHTML='❌ '+j.message; return;}
  if(!j.data || j.data.length===0){
    document.getElementById('empList').innerHTML='<p>এখনো কোনো কর্মচারী নেই</p>';
    return;
  }

  let html = '<table><tr><th>নাম</th><th>ID</th><th>পদ</th><th>মোবাইল</th><th>সর্বশেষ নোট</th><th>তারিখ</th><th>Action</th></tr>';

  j.data.forEach(e => {
    const id = (e.emp_id || '').replace(/'/g, "\\\\'");
    const name = (e.name || '').replace(/'/g, "\\\\'");
    const post = (e.post || '').replace(/'/g, "\\\\'");
    const mobile = (e.mobile || '').replace(/'/g, "\\\\'");

    html += \`
      <tr>
        <td><b>\${e.name||''}</b></td>
        <td><code>\${e.emp_id||''}</code></td>
        <td>\${e.post||'-'}</td>
        <td>\${e.mobile||'-'}</td>
        <td style="max-width:220px;white-space:pre-wrap;font-size:12px">\${e.latest_note||'-'}</td>
        <td style="font-size:11px">\${e.updated_at ? new Date(e.updated_at).toLocaleString('bn-IN') : '-'}</td>
        <td>
          <button onclick="fillEmpForm('\${id}','\${name}','\${post}','\${mobile}')">Edit + নোট</button>
          <button onclick="loadNoteHistory('\${id}')">হিস্ট্রি</button>
          <button onclick="delEmployee('\${id}')" style="background:#dc2626">X</button>
        </td>
      </tr>\`;
  });

  html += '</table>';
  document.getElementById('empList').innerHTML = html;
}

function fillEmpForm(id, name, post, mobile){
  document.getElementById('emp_id').value = id;
  document.getElementById('emp_name').value = name;
  document.getElementById('emp_post').value = post;
  document.getElementById('emp_mobile').value = mobile;
  document.getElementById('emp_note').value = '';
  document.getElementById('emp_note').focus();
  loadNoteHistory(id);
}

async function loadNoteHistory(empId){
  if(!ADMIN_TOKEN || !empId) return;
  document.getElementById('noteHistory').innerHTML = 'লোড হচ্ছে...';
  try{
    const r = await fetch('/api/admin/employees/' + encodeURIComponent(empId) + '/notes', {
      headers: {'X-Admin-Token': ADMIN_TOKEN}
    });
    const j = await r.json();
    if(!j.success){
      document.getElementById('noteHistory').innerHTML = '❌ ' + j.message;
      return;
    }
    if(!j.data || j.data.length === 0){
      document.getElementById('noteHistory').innerHTML = '<p>এই কর্মচারীর কোনো নোট নেই</p>';
      return;
    }
    let html = '<b>' + empId + '</b> এর পুরনো নোট:<br><br>';
    j.data.forEach(n => {
      html += \`
        <div class="note-box">
          <div class="note-date">\${new Date(n.created_at).toLocaleString('bn-IN')}</div>
          <div>\${n.note}</div>
        </div>\`;
    });
    document.getElementById('noteHistory').innerHTML = html;
  }catch(e){
    document.getElementById('noteHistory').innerHTML = '❌ Error';
  }
}

async function delEmployee(id){
  if(!confirm('এই কর্মচারী ও সব নোট মুছে ফেলবেন?')) return;
  const r = await fetch('/api/admin/employees/'+encodeURIComponent(id),{method:'DELETE',headers:{'X-Admin-Token':ADMIN_TOKEN}});
  const j = await r.json();
  alert(j.message||'Deleted');
  loadEmployees();
  document.getElementById('noteHistory').innerHTML = 'আইডি লোড করলে এখানে পুরনো নোট দেখাবে';
}

document.getElementById('emp_id')?.addEventListener('keydown', function(e){
  if(e.key === 'Enter'){ e.preventDefault(); loadEmployeeById(); }
});

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

    // ===== TABLE CREATION (নতুন স্কিমা) =====
    try {
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

      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS quiz_attempts (
        volunteer_id TEXT PRIMARY KEY,
        total_score REAL,
        passed INTEGER,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`).run();

      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS employees (
        emp_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        post TEXT,
        mobile TEXT,
        latest_note TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`).run();

      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS employee_notes (
        id TEXT PRIMARY KEY,
        emp_id TEXT NOT NULL,
        note TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`).run();
    } catch (e) {
      console.error("Table creation error:", e);
    }

    // == PUBLIC LINKS API ==
    if (url.pathname === "/api/links") {
      try {
        const results = await env.DB.prepare(`SELECT * FROM public_links WHERE link NOT LIKE "/api/volunteer/pdf/%" ORDER BY created_at DESC`).all();
        const files = await env.DB.prepare(`SELECT id, title, filename, created_at FROM public_files ORDER BY created_at DESC`).all();
        const fileLinks = (files.results || []).map((f: any) => ({
          id: f.id, title: f.title, link: `/api/file/${f.id}`, created_at: f.created_at, isFile: true
        }));
        const combined = [...(results.results || []), ...fileLinks].sort((a: any, b: any) => (b.created_at || 0) > (a.created_at || 0) ? 1 : -1);
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

    // Volunteer Register
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
        const exist: any = await env.DB.prepare("SELECT id FROM volunteers WHERE voter_card = ?").bind(voter).first();
        if (exist) {
          return Response.json({ success: false, message: "এই ভোটার কার্ড নম্বর ইতিমধ্যে রেজিস্টার করা আছে।" }, { headers });
        }
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

    // Volunteer Status
    if (url.pathname.startsWith("/api/volunteer/status/") && req.method === "GET") {
      const q = decodeURIComponent(url.pathname.split("/").pop() || "");
      const row: any = await env.DB.prepare("SELECT * FROM volunteers WHERE id = ? OR mobile = ? OR voter_card = ?").bind(q, q, q).first();
      if (!row) return Response.json({ success: false, message: "তথ্য পাওয়া যায়নি" }, { headers });
      return Response.json({ success: true, data: row }, { headers });
    }

    // Volunteer PDF
    if (url.pathname.startsWith("/api/volunteer/pdf/")) {
      const parts = url.pathname.split("/");
      const id = parts[4] ? parts[4].split("?")[0] : "";
      const row: any = await env.DB.prepare("SELECT * FROM volunteers WHERE id = ?").bind(id).first();
      if (!row) return Response.json({ success: false, message: "তথ্য পাওয়া যায়নি" }, { headers });
      const html = PDF_PAGE(row);
      return new Response(html, { headers: { "Content-Type": "text/html;charset=utf-8", "Access-Control-Allow-Origin": "*" } });
    }

    // PUBLIC RESULT
    if (url.pathname.startsWith("/api/result/") && req.method === "GET") {
      const q = decodeURIComponent(url.pathname.split("/").pop() || "");
      const volunteer: any = await env.DB.prepare("SELECT * FROM volunteers WHERE id=? OR mobile=? OR voter_card=?").bind(q,q,q).first();
      if (!volunteer) return Response.json({ success: false, message: "Volunteer ID/Phone পাওয়া যায়নি" }, { headers });
      const exam: any = await env.DB.prepare("SELECT * FROM exam_results WHERE volunteer_id=?").bind(volunteer.id).first();
      if (!exam) return Response.json({ success: false, message: "Result এখনো দেওয়া হয়নি" }, { headers });
      const merged = { ...volunteer, ...exam, id: volunteer.id };
      return Response.json({ success: true, data: merged }, { headers });
    }

    // ADMIN EXAM RESULTS
    if (url.pathname === "/api/admin/results") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token") || "";
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized" }, { headers });
      if (req.method === "GET") {
        const results = await env.DB.prepare("SELECT * FROM exam_results ORDER BY created_at DESC").all();
        return Response.json({ success: true, data: results.results }, { headers });
      }
      if (req.method === "POST") {
        try {
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
          return Response.json({ success: true, message: "Result Saved" }, { headers });
        } catch (e: any) {
          return Response.json({ success: false, message: "DB Error: " + (e.message || String(e)) }, { headers });
        }
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
        const id = d.id || generateUniqueId();
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
      const parts = url.pathname.split("/");
      const id = decodeURIComponent(parts[4] || "");
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
      const id = generateUniqueId();
      await env.DB.prepare("INSERT INTO public_files (id, title, filename, data, created_at) VALUES (?,?,?,?,?)").bind(id, body.title||body.filename, body.filename||body.title, body.data, new Date().toISOString()).run();
      await env.DB.prepare("INSERT INTO public_links (id, title, link, created_at) VALUES (?,?,?,?)").bind(id, body.title||body.filename, `/api/file/${id}`, new Date().toISOString()).run();
      return Response.json({ success: true, id, link: `/api/file/${id}` }, { headers });
    }

    // ========== QUIZ APIs ==========
    if (url.pathname.startsWith("/api/quiz/check/") && req.method === "GET") {
      const q = decodeURIComponent(url.pathname.split("/").pop() || "");
      const vol: any = await env.DB.prepare("SELECT * FROM volunteers WHERE id = ? OR mobile = ?").bind(q, q).first();
      if (!vol) return Response.json({ success: false, message: "ID পাওয়া যায়নি" }, { headers });
      if (vol.status !== "approved") {
        return Response.json({ success: false, message: "আপনি এখনো Approved নন। বর্তমান স্ট্যাটাস: " + vol.status }, { headers });
      }
      const attempt: any = await env.DB.prepare("SELECT * FROM quiz_attempts WHERE volunteer_id = ?").bind(vol.id).first();
      if (attempt) {
        return Response.json({ success: false, message: "আপনি ইতিমধ্যে উত্তরপত্র জমা দিয়েছেন। স্কোর: " + attempt.total_score + "/600" }, { headers });
      }
      return Response.json({ success: true, data: { id: vol.id, name: vol.name, mobile: vol.mobile } }, { headers });
    }

    if (url.pathname === "/api/quiz/submit" && req.method === "POST") {
      try {
        const d: any = await req.json();
        if (!d.volunteer_id) return Response.json({ success: false, message: "volunteer_id লাগবে" }, { headers });
        const exist: any = await env.DB.prepare("SELECT * FROM quiz_attempts WHERE volunteer_id = ?").bind(d.volunteer_id).first();
        if (exist) return Response.json({ success: false, message: "ইতিমধ্যে জমা দেওয়া হয়েছে" }, { headers });
        const vol: any = await env.DB.prepare("SELECT * FROM volunteers WHERE id = ?").bind(d.volunteer_id).first();
        if (!vol || vol.status !== "approved") {
          return Response.json({ success: false, message: "Approved নন বা ID ভুল" }, { headers });
        }
        const ben = Number(d.bengali)||0, eng=Number(d.english)||0, his=Number(d.history)||0;
        const geo=Number(d.geography)||0, math=Number(d.math)||0, gk=Number(d.gk)||0;
        const total = Number(d.total)|| (ben+eng+his+geo+math+gk);
        const passed = total >= 210 ? 1 : 0;
        const bg = marksToGrade(ben), eg=marksToGrade(eng), hg=marksToGrade(his);
        const gg=marksToGrade(geo), mg=marksToGrade(math), kkg=marksToGrade(gk);
        const pts = [bg,eg,hg,gg,mg,kkg].map(gradeToPoint);
        const avg = pts.reduce((a:number,b:number)=>a+b,0)/6;
        let totalG = 'F';
        if(avg>=4.5) totalG='A+'; else if(avg>=3.5) totalG='A'; else if(avg>=2.75) totalG='B+'; else if(avg>=2) totalG='B';
        await env.DB.prepare("INSERT INTO quiz_attempts (volunteer_id, total_score, passed) VALUES (?,?,?)")
          .bind(d.volunteer_id, total, passed).run();
        await env.DB.prepare(`INSERT OR REPLACE INTO exam_results
          (volunteer_id, name, phone, bengali, english, history, geography, math, gk,
           bengali_grade, english_grade, history_grade, geography_grade, math_grade, gk_grade, total_grade)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
          .bind(d.volunteer_id, d.name||vol.name, d.phone||vol.mobile, ben, eng, his, geo, math, gk, bg, eg, hg, gg, mg, kkg, totalG).run();
        return Response.json({ success: true, message: "Result Saved", total, passed: !!passed }, { headers });
      } catch (e: any) {
        return Response.json({ success: false, message: "Error: " + (e.message||String(e)) }, { headers });
      }
    }

    // ========== কর্মচারী / মালিক নোট APIs ==========
    if (url.pathname === "/api/admin/employees") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token") || "";
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized" }, { headers });

      if (req.method === "GET") {
        const results = await env.DB.prepare("SELECT * FROM employees ORDER BY updated_at DESC").all();
        return Response.json({ success: true, data: results.results }, { headers });
      }

      if (req.method === "POST") {
        try {
          const d: any = await req.json();
          if (!d.emp_id || !d.name) {
            return Response.json({ success: false, message: "emp_id ও name আবশ্যক" }, { headers });
          }
          const empId = String(d.emp_id).trim();
          const note = (d.note || "").trim();

          await env.DB.prepare(`
            INSERT INTO employees (emp_id, name, post, mobile, latest_note, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(emp_id) DO UPDATE SET
              name = excluded.name,
              post = excluded.post,
              mobile = excluded.mobile,
              latest_note = CASE WHEN ? != '' THEN excluded.latest_note ELSE employees.latest_note END,
              updated_at = CURRENT_TIMESTAMP
          `).bind(empId, d.name, d.post||'', d.mobile||'', note, note).run();

          if (note) {
            const noteId = generateUniqueId();
            await env.DB.prepare(`
              INSERT INTO employee_notes (id, emp_id, note, created_at)
              VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            `).bind(noteId, empId, note).run();
          }

          return Response.json({ success: true, message: "কর্মচারী সেভ / নোট যোগ হয়েছে" }, { headers });
        } catch (e: any) {
          return Response.json({ success: false, message: "DB Error: " + (e.message || String(e)) }, { headers });
        }
      }
    }

    // নোট হিস্ট্রি
    if (url.pathname.startsWith("/api/admin/employees/") && url.pathname.endsWith("/notes") && req.method === "GET") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token") || "";
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized" }, { headers });
      const parts = url.pathname.split("/");
      const empId = decodeURIComponent(parts[4] || "");
      if (!empId) return Response.json({ success: false, message: "emp_id নেই" }, { headers });
      const results = await env.DB.prepare("SELECT * FROM employee_notes WHERE emp_id = ? ORDER BY created_at DESC").bind(empId).all();
      return Response.json({ success: true, data: results.results }, { headers });
    }

    // কর্মচারী ডিলিট
    if (url.pathname.startsWith("/api/admin/employees/") && req.method === "DELETE") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token") || "";
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized" }, { headers });
      const empId = decodeURIComponent(url.pathname.split("/").pop() || "");
      if (!empId) return Response.json({ success: false, message: "ID নেই" }, { headers });
      await env.DB.prepare("DELETE FROM employee_notes WHERE emp_id = ?").bind(empId).run();
      await env.DB.prepare("DELETE FROM employees WHERE emp_id = ?").bind(empId).run();
      return Response.json({ success: true, message: "কর্মচারী ও সব নোট মুছে ফেলা হয়েছে" }, { headers });
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
};
