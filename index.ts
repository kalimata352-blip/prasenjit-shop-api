/**
 * FINAL - যা আছে সবটাই রেখে, কোনো চেঞ্জ না করে শুধু PDF ADD
 * GitHub: prasenjit-shop-api / index.ts এ এই ফাইলটা আপলোড করে দাও
 */

export interface Env {
  DB: D1Database;
  ADMIN_TOKEN: string;
}

function generateId(): string {
  const y = new Date().getFullYear();
  const r = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `PS-VOL-${y}-${r}`;
}

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Token",
    "Content-Type": "application/json",
  };
}

const HTML_PAGE = `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prasenjit Shop - Volunteer Registration</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'Noto Sans Bengali',sans-serif}
body{background:#f0f2f5;padding:15px}
.container{max-width:700px;margin:20px auto;background:white;padding:20px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1)}
h1{text-align:center;color:#173a8b;margin-bottom:5px;font-size:24px}
.subtitle{text-align:center;color:#666;margin-bottom:20px;font-size:14px}
label{display:block;margin-top:12px;font-weight:600;color:#333}
input,select,textarea{width:100%;padding:12px;margin-top:5px;border:1px solid #ccc;border-radius:8px;font-size:15px}
.row{display:flex;gap:10px;flex-wrap:wrap}
.row>div{flex:1 1 140px;min-width:0}
button{width:100%;margin-top:15px;padding:12px;border-radius:8px;display:block;text-align:center;background:#1a73e8;color:white;border:0;font-size:16px;cursor:pointer}
#msg{margin-top:15px;padding:12px;border-radius:8px;display:none;text-align:center}
.success{background:#e6f4ea;color:#137333;border:1px solid #b5d8b5}
.error{background:#fce8e6;color:#a50e0e;border:1px solid #f5c6cb}
.tabs{display:flex;gap:8px;margin:20px 0;overflow-x:auto;padding-bottom:5px}
.tab{padding:8px 14px;background:#e8f0fe;border-radius:20px;cursor:pointer;white-space:nowrap;border:1px solid #1a73e8}
.tab.active{background:#1a73e8;color:white;border-color:#1a73e8}
.link-card{display:block;padding:12px;background:#f8f9ff;border:1px solid #d2e3fc;margin-bottom:8px;border-radius:8px;text-decoration:none;color:#1a73e8}
table{width:100%;border-collapse:collapse;margin-top:10px}
th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:14px}
th{background:#f5f5f5}
</style>
</head>
<body>
<div class="container">
<h1>স্বেচ্ছাসেবক রেজিস্ট্রেশন</h1>
<p class="subtitle">Prasenjit Shop - বীরভূম</p>
<form id="volForm">
<label>নাম *</label><input type="text" name="name" required placeholder="আপনার নাম">
<label>পিতার নাম *</label><input type="text" name="father_name" required>
<div class="row"><div><label>জন্ম তারিখ</label><input type="date" name="dob"></div><div><label>লিঙ্গ</label><select name="gender"><option value="">সিলেক্ট</option><option>পুরুষ</option><option>মহিলা</option><option>অন্যান্য</option></select></div></div>
<div class="row"><div><label>মোবাইল নং *</label><input type="tel" name="mobile" required></div><div><label>WhatsApp</label><input type="tel" name="whatsapp"></div></div>
<label>পুরো ঠিকানা *</label><textarea name="full_address" required rows="2"></textarea>
<div class="row"><div><label>জেলা</label><input type="text" name="district" value="বীরভূম"></div><div><label>যোগ্যতা</label><input type="text" name="qualification"></div></div>
<label>অভিজ্ঞতা</label><input type="text" name="experience">
<button type="submit" id="btn">রেজিস্টার করুন</button>
<div id="msg"></div>
</form>

<div style="margin-top:20px;text-align:center;"><small><a href="/status">স্ট্যাটাস চেক</a> | <a href="/admin">Admin</a> | <a href="/links">সব ডাউনলোড</a></small></div>

<hr style="margin:30px 0">
<h2 style="color:#173a8b">📁 পাবলিক ডাউনলোড ও নোটিফিকেশন</h2>
<p style="color:#666;font-size:13px">এখানে ফরম, নোটিফিকেশন, ওয়ার্কার অর্ডার সব পাবেন</p>
<div class="tabs">
<button class="tab active" onclick="loadLinks('all',this)">সব</button>
<button class="tab" onclick="loadLinks('form',this)">ফরম</button>
<button class="tab" onclick="loadLinks('notification',this)">নোটিফিকেশন</button>
<button class="tab" onclick="loadLinks('order',this)">অর্ডার</button>
<button class="tab" onclick="loadLinks('other',this)">অন্যান্য</button>
</div>
<div id="publicLinks">লোড হচ্ছে...</div>
</div>

<script>
const form=document.getElementById('volForm');const msg=document.getElementById('msg');
form.addEventListener('submit',async(e)=>{
 e.preventDefault();const btn=document.getElementById('btn');btn.disabled=true;btn.innerText='পাঠানো হচ্ছে...';msg.style.display='none';
 const data=Object.fromEntries(new FormData(form).entries());
 try{
  const res=await fetch('/api/volunteer/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  const json=await res.json();msg.style.display='block';
  if(json.success){msg.className='success';msg.innerHTML='✅ '+json.message+'<br>ID: '+json.id+'<br><a href="/api/volunteer/pdf/'+json.id+'" target="_blank">📄 PDF ডাউনলোড করুন</a>';form.reset();loadLinks('form');}
  else{msg.className='error';msg.innerText='❌ '+json.message;}
 }catch(err){msg.style.display='block';msg.className='error';msg.innerText='সার্ভার এরর';}
 btn.disabled=false;btn.innerText='রেজিস্টার করুন';
});

function loadLinks(cat,el){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  if(el) el.classList.add('active');
  const box=document.getElementById('publicLinks');box.innerHTML='লোড হচ্ছে...';
  fetch('/api/links?cat='+cat).then(r=>r.json()).then(j=>{
    if(!j.data || j.data.length==0){box.innerHTML='<p style="padding:20px;text-align:center;color:#666">কোনো তথ্য যোগ করা হয়নি</p>';return;}
    box.innerHTML=j.data.map(f=>\`<a class="link-card" href="\${f.link}" target="_blank">\${f.title} - \${f.category} - ডাউনলোড</a>\`).join('');
  }).catch(()=>{box.innerHTML='<p style="color:red">লোড করতে সমস্যা</p>'});
}
loadLinks('all');
</script>
</body>
</html>`;

const ADMIN_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Admin</title>
<style>body{font-family:sans-serif;background:#f5f5f5;padding:15px}.box{max-width:1000px;margin:auto;background:white;padding:15px;border-radius:8px} .card{border:1px solid #ddd;padding:12px;border-radius:8px;margin-bottom:15px} input{padding:8px;border:1px solid #ccc;border-radius:6px} button{padding:8px 12px;background:#1a73e8;color:white;border:0;border-radius:6px;cursor:pointer} table{width:100%;border-collapse:collapse;margin-top:10px} th,td{border:1px solid #ddd;padding:6px;font-size:13px} th{background:#f5f5f5}</style>
</head><body><div class="box">
<h2>Admin Panel - Prasenjit Shop</h2>
<div style="display:flex;gap:8px;margin:10px 0"><input type="password" id="token" placeholder="Admin Token"><button onclick="loadAll()">লোড করুন</button></div>
<div class="card">
<h3>+ নতুন পাবলিক লিংক যোগ করুন</h3>
<input id="f_title" placeholder="টাইটেল" style="width:100%;margin-bottom:6px">
<input id="f_link" placeholder="লিংক" style="width:100%;margin-bottom:6px">
<div style="display:flex;gap:8px"><select id="f_cat"><option value="form">ফরম</option><option value="notification">নোটিফিকেশন</option><option value="order">অর্ডার</option><option value="other">অন্যান্য</option></select><button onclick="addLink()">লিংক যোগ করুন</button><span id="f_msg"></span></div>
</div>
<h3>Volunteers</h3>
<table><thead><tr><th>ID</th><th>নাম</th><th>পিতার নাম</th><th>মোবাইল</th><th>জেলা</th><th>PDF</th></tr></thead><tbody id="volBody"></tbody></table>
<h3 style="margin-top:20px">Public Links</h3>
<table><thead><tr><th>Title</th><th>Category</th><th>Link</th><th>Action</th></tr></thead><tbody id="linkBody"></tbody></table>
</div>
<script>
function getToken(){return document.getElementById('token').value;}
async function loadAll(){
 const token=getToken(); if(!token){alert('Token দিন');return;}
 const resV=await fetch('/api/admin/volunteers',{headers:{'X-Admin-Token':token}});
 const jV=await resV.json();
 document.getElementById('volBody').innerHTML=(jV.data||[]).map(v=>\`<tr><td>\${v.id}</td><td>\${v.name}</td><td>\${v.father_name}</td><td>\${v.mobile}</td><td>\${v.district}</td><td><a href="/api/volunteer/pdf/\${v.id}" target="_blank">PDF</a></td></tr>\`).join('') || '<tr><td colspan=6>কোনো ডাটা নেই</td></tr>';
 const resL=await fetch('/api/admin/links',{headers:{'X-Admin-Token':token}});
 const jL=await resL.json();
 document.getElementById('linkBody').innerHTML=(jL.data||[]).map(l=>\`<tr><td>\${l.title}</td><td>\${l.category}</td><td><a href="\${l.link}" target="_blank">দেখুন</a></td><td><button onclick="delLink('\${l.id}')" style="background:red">Delete</button></td></tr>\`).join('') || '<tr><td colspan=4>কোনো তথ্য নেই</td></tr>';
}
async function addLink(){
 const token=getToken(); const title=document.getElementById('f_title').value; const link=document.getElementById('f_link').value; const cat=document.getElementById('f_cat').value;
 if(!title || !link){alert('Title + Link লাগবে');return;}
 const res=await fetch('/api/admin/links',{method:'POST',headers:{'Content-Type':'application/json','X-Admin-Token':token},body:JSON.stringify({title,link,category:cat})});
 const j=await res.json(); document.getElementById('f_msg').innerText=j.success?'✅ যোগ হয়েছে':'❌ '+j.message; loadAll();
}
async function delLink(id){
 const token=getToken(); if(!confirm('Delete?')) return;
 await fetch('/api/admin/links/'+id,{method:'DELETE',headers:{'X-Admin-Token':token}});
 loadAll();
}
</script></body></html>`;

const STATUS_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Status</title>
<style>body{background:#f0f2f5;font-family:sans-serif;padding:15px}.box{max-width:500px;margin:30px auto;background:white;padding:20px;border-radius:12px}</style></head>
<body><div class="box"><h2>স্ট্যাটাস চেক</h2><input id="q" placeholder="ID লিখুন"><button onclick="check()" style="width:100%;padding:10px;margin-top:10px;background:#1a73e8;color:white;border:0;border-radius:8px">চেক করুন</button><div id="result" style="margin-top:15px"></div><div style="margin-top:10px"><a href="/">হোম</a> | <a id="pdfLink" style="display:none" target="_blank">PDF ডাউনলোড</a></div></div>
<script>
async function check(){
 const q=document.getElementById('q').value.trim(); if(!q) return;
 const box=document.getElementById('result'); box.innerHTML='লোড হচ্ছে...';
 const res=await fetch('/api/volunteer/status/'+encodeURIComponent(q));
 const j=await res.json();
 if(j.success){box.innerHTML='ID: '+j.data.id+'<br>নাম: '+j.data.name+'<br>মোবাইল: '+j.data.mobile; document.getElementById('pdfLink').style.display='inline'; document.getElementById('pdfLink').href='/api/volunteer/pdf/'+j.data.id;}
 else{box.innerHTML='❌ '+j.message;}
}
</script></body></html>`;

const LINKS_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><title>All Downloads</title><style>body{font-family:sans-serif;background:#f0f2f5;padding:15px}.box{max-width:700px;margin:auto;background:white;padding:20px;border-radius:12px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:8px}</style></head><body><div class="box"><h2>সব ডাউনলোড</h2><div id="list">লোড হচ্ছে...</div><br><a href="/">হোম</a></div><script>fetch('/api/links?cat=all').then(r=>r.json()).then(j=>{ if(!j.data || j.data.length==0){document.getElementById('list').innerHTML='কোনো তথ্য নেই';return;} let h='<table><tr><th>Title</th><th>Category</th><th>Link</th></tr>'; j.data.forEach(f=>{h+=\`<tr><td>\${f.title}</td><td>\${f.category}</td><td><a href="\${f.link}" target="_blank">ডাউনলোড</a></td></tr>\`}); h+='</table>'; document.getElementById('list').innerHTML=h;});</script></body></html>`;

// === শুধু এই নতুন PAGE টা ADD করা হলো, পুরানো কিছু চেঞ্জ করা হয়নি ===
const PDF_PAGE = (v:any) => `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Form ${v.id}</title>
<style>body{font-family:'Noto Sans Bengali',sans-serif;padding:20px;background:white} .box{max-width:750px;margin:auto;border:2px solid #000;padding:25px} h1{text-align:center;color:#173a8b} table{width:100%;border-collapse:collapse;margin-top:15px} td{border:1px solid #000;padding:10px;font-size:15px} .no-print{margin-top:20px} @media print{.no-print{display:none}}</style></head>
<body><div class="box"><h1 style="text-align:center">স্বেচ্ছাসেবক রেজিস্ট্রেশন ফর্ম</h1><p>Prasenjit Shop - বীরভূম</p>
<p><b>Application ID:</b> ${v.id} | <b>Date:</b> ${new Date().toLocaleDateString('bn-IN')}</p>
<table>
<tr><td style="width:30%;font-weight:bold">নাম</td><td>${v.name}</td></tr>
<tr><td style="font-weight:bold">পিতার নাম</td><td>${v.father_name}</td></tr>
<tr><td style="font-weight:bold">জন্ম তারিখ</td><td>${v.dob || '-'}</td></tr>
<tr><td style="font-weight:bold">লিঙ্গ</td><td>${v.gender || '-'}</td></tr>
<tr><td style="font-weight:bold">মোবাইল</td><td>${v.mobile}</td></tr>
<tr><td style="font-weight:bold">WhatsApp</td><td>${v.whatsapp || '-'}</td></tr>
<tr><td style="font-weight:bold">ঠিকানা</td><td>${v.full_address}</td></tr>
<tr><td style="font-weight:bold">জেলা</td><td>${v.district || 'বীরভূম'}</td></tr>
<tr><td style="font-weight:bold">যোগ্যতা</td><td>${v.qualification || '-'}</td></tr>
<tr><td style="font-weight:bold">অভিজ্ঞতা</td><td>${v.experience || '-'}</td></tr>
</table>
<br><br>
<div style="display:flex;justify-content:space-between;margin-top:40px"><div>___________________<br>আবেদনকারীর স্বাক্ষর</div><div>___________________<br>কর্তৃপক্ষের স্বাক্ষর</div></div>
<button class="no-print" onclick="window.print()" style="width:100%;padding:14px;background:#1a73e8;color:white;border:0;border-radius:8px;font-size:17px;cursor:pointer">📄 PDF ডাউনলোড / প্রিন্ট করুন</button>
<p class="no-print" style="text-align:center;margin-top:10px"><a href="/">হোমে ফিরুন</a></p>
</div></body></html>`;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const headers = cors() as any;
    if (req.method === "OPTIONS") return new Response(null, { headers });

    try {
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS volunteers (id TEXT PRIMARY KEY, name TEXT, father_name TEXT, dob TEXT, gender TEXT, mobile TEXT, whatsapp TEXT, full_address TEXT, district TEXT, qualification TEXT, experience TEXT, status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`).run();
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS public_links (id TEXT PRIMARY KEY, title TEXT, link TEXT, category TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`).run();
    } catch (e) {}

    if (url.pathname === "/api/links") {
      const cat = url.searchParams.get("cat") || "all";
      if (cat === "all") {
        const { results } = await env.DB.prepare("SELECT * FROM public_links ORDER BY created_at DESC").all();
        return Response.json({ success: true, data: results }, { headers });
      } else {
        const { results } = await env.DB.prepare("SELECT * FROM public_links WHERE category = ? ORDER BY created_at DESC").bind(cat).all();
        return Response.json({ success: true, data: results }, { headers });
      }
    }

    if (url.pathname === "/api/admin/links") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token");
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized" }, { headers });
      if (req.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM public_links ORDER BY created_at DESC").all();
        return Response.json({ success: true, data: results }, { headers });
      }
      if (req.method === "POST") {
        const d: any = await req.json();
        if (!d.title || !d.link) return Response.json({ success: false, message: "Title + Link লাগবে" }, { headers });
        const id = "LINK-" + Date.now();
        await env.DB.prepare("INSERT INTO public_links (id, title, link, category) VALUES (?,?,?,?)").bind(id, d.title, d.link, d.category || "other").run();
        return Response.json({ success: true, id }, { headers });
      }
    }

    if (url.pathname.startsWith("/api/admin/links/") && req.method === "DELETE") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token");
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized" }, { headers });
      const id = url.pathname.split("/").pop() || "";
      await env.DB.prepare("DELETE FROM public_links WHERE id = ?").bind(id).run();
      return Response.json({ success: true }, { headers });
    }

    if (url.pathname === "/admin") return new Response(ADMIN_PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    if (url.pathname === "/status") return new Response(STATUS_PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    if (url.pathname === "/links") return new Response(LINKS_PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } });

    // === নতুন ADD করা PDF রুট ===
    if (url.pathname.startsWith("/api/volunteer/pdf/")) {
      const q = decodeURIComponent(url.pathname.split("/").pop() || "");
      if (!q) return Response.json({ success: false, message: "ID লাগবে" }, { headers });
      const row = await env.DB.prepare("SELECT * FROM volunteers WHERE id = ?").bind(q).first();
      if (!row) return Response.json({ success: false, message: "পাওয়া যায়নি" }, { headers });
      return new Response(PDF_PAGE(row), { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    if (url.pathname === "/api/volunteer/register" && req.method === "POST") {
      try {
        const d: any = await req.json();
        if (!d.name || !d.father_name || !d.mobile) return Response.json({ success: false, message: "নাম, পিতার নাম, মোবাইল আবশ্যক" }, { headers });
        const mobile = d.mobile.toString().trim().replace(/\s/g, "");
        if (!/^[6-9][0-9]{9}$/.test(mobile)) return Response.json({ success: false, message: "সঠিক 10 সংখ্যার মোবাইল দিন" }, { headers });
        const exists = await env.DB.prepare("SELECT id FROM volunteers WHERE mobile = ?").bind(mobile).first();
        if (exists) return Response.json({ success: false, message: "এই মোবাইল নম্বর দিয়ে আগেই রেজিস্ট্রেশন হয়েছে" }, { headers });
        const id = generateId();
        await env.DB.prepare("INSERT INTO volunteers (id, name, father_name, dob, gender, mobile, whatsapp, full_address, district, qualification, experience) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind(id, d.name, d.father_name, d.dob || '', d.gender || '', mobile, d.whatsapp || '', d.full_address, d.district || 'বীরভূম', d.qualification || '', d.experience || '').run();

        // === শুধু এই 3 লাইন ADD - পুরানো কোড অক্ষত ===
        const linkId = "LINK-" + Date.now();
        const pdfLink = `/api/volunteer/pdf/${id}`;
        await env.DB.prepare("INSERT INTO public_links (id, title, link, category) VALUES (?,?,?,?)").bind(linkId, `${d.name} - Volunteer Form (${id})`, pdfLink, "form").run();

        return Response.json({ success: true, id, message: "আবেদন সফল" }, { headers });
      } catch (e: any) {
        return Response.json({ success: false, message: "Server Error: " + e.message }, { headers });
      }
    }

    if (url.pathname.startsWith("/api/volunteer/status/")) {
      const q = decodeURIComponent(url.pathname.split("/").pop() || "");
      const row = await env.DB.prepare("SELECT id, name, mobile, status, created_at FROM volunteers WHERE id = ?").bind(q).first();
      if (!row) return Response.json({ success: false, message: "ID না পাওয়া যায়নি" }, { headers });
      return Response.json({ success: true, data: row }, { headers });
    }

    if (url.pathname === "/api/admin/volunteers") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token");
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized" }, { headers });
      const { results } = await env.DB.prepare("SELECT * FROM volunteers ORDER BY created_at DESC").all();
      return Response.json({ success: true, data: results }, { headers });
    }

    if (url.pathname === "/" || url.pathname === "/index") {
      return new Response(HTML_PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    return new Response(JSON.stringify({ message: "API Not Found" }), { headers, status: 404 });
  },
};
