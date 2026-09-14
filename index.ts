/**
 * তোমার আগের কোডের উপরে MINIMAL CHANGE - নতুন ফিচার: পাবলিক লিংক সিস্টেম
 * ফাইল: index.ts
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
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Prasenjit Shop - Volunteer Registration</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'Noto Sans Bengali', sans-serif}
body{background:#f0f2f5;padding:15px}
.container{max-width:700px;margin:20px auto;background:white;padding:20px;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.1)}
h1{text-align:center;color:#1a73e8;margin-bottom:5px;font-size:24px}
.subtitle{text-align:center;color:#666;margin-bottom:20px;font-size:14px}
label{display:block;margin-top:12px;font-weight:600;color:#333}
input,select,textarea{width:100%;padding:12px;margin-top:5px;border:1px solid #ddd;border-radius:8px}
.row{display:flex;gap:10px;flex-wrap:wrap}
.row>div{flex:1 1 140px;min-width:0}
button{width:100%;margin-top:20px;padding:14px;background:#1a73e8;color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer}
#msg{margin-top:15px;padding:12px;border-radius:8px;display:none;text-align:center}
.success{background:#e6f4ea;color:#137333;border:1px solid #8dab5}
.error{background:#fce8e6;color:#a50e0e;border:1px solid #f5c6cb}
.tabs{display:flex;gap:8px;margin:20px 0;overflow-x:auto;padding-bottom:5px}
.tab{padding:8px 14px;background:#e8f0fe;border-radius:20px;cursor:pointer;white-space:nowrap;border:1px solid #d0d8f0;font-weight:600;font-size:13px}
.tab.active{background:#1a73e8;color:white;border-color:#1a73e8}
.link-card{display:block;padding:12px;background:#f8f9ff;border:1px solid #e0e5f0;margin:8px 0;border-radius:10px;text-decoration:none;color:#222}
.link-card b{color:#1a73e8}
</style>
</head>
<body>
<div class="container">
<h1>স্বেচ্ছাসেবক রেজিস্ট্রেশন</h1>
<p class="subtitle">Prasenjit Shop - বীরভূম</p>
<form id="volForm">
<label>নাম *</label><input type="text" name="name" required placeholder="আপনার নাম">
<label>পিতার নাম *</label><input type="text" name="father_name" required>
<div class="row"><div><label>জন্ম তারিখ</label><input type="date" name="dob"></div><div><label>লিঙ্গ</label><select name="gender"><option value="">সিলেক্ট</option><option>পুরুষ</option><option>মহিলা</option></select></div></div>
<div class="row"><div><label>মোবাইল নং *</label><input type="tel" name="mobile" required></div><div><label>WhatsApp</label><input type="tel" name="whatsapp"></div></div>
<label>পুরো ঠিকানা *</label><textarea name="full_address" required rows="2"></textarea>
<div class="row"><div><label>জেলা</label><input type="text" name="district" value="বীরভূম"></div><div><label>যোগ্যতা</label><input type="text" name="qualification"></div></div>
<label>অভিজ্ঞতা</label><input type="text" name="experience">
<button type="submit" id="btn">রেজিস্টার করুন</button>
<div id="msg"></div>
</form>
<div style="margin-top:20px;text-align:center;"><small><a href="/status">স্ট্যাটাস চেক</a> | <a href="/admin">Admin</a> | <a href="/links">সব ডাউনলোড</a></small></div>

<hr style="margin:30px 0">
<h2 style="color:#1a73e8;">📂 পাবলিক ডাউনলোড ও নোটিফিকেশন</h2>
<p style="color:#666;font-size:13px">এখানে ফরম, নোটিফিকেশন, ওয়ার্কার অর্ডার সব পাবেন</p>
<div class="tabs">
<button class="tab active" onclick="loadLinks('all',this)">সব</button>
<button class="tab" onclick="loadLinks('form',this)">ফরম</button>
<button class="tab" onclick="loadLinks('notification',this)">নোটিফিকেশন</button>
<button class="tab" onclick="loadLinks('order',this)">অর্ডার / জারি</button>
<button class="tab" onclick="loadLinks('other',this)">অন্যান্য</button>
</div>
<div id="publicLinks">লোড হচ্ছে...</div>
</div>
<script>
const form=document.getElementById('volForm');const msg=document.getElementById('msg');const btn=document.getElementById('btn');
form.addEventListener('submit',async(e)=>{
e.preventDefault();btn.disabled=true;btn.innerText='পাঠানো হচ্ছে...';msg.style.display='none';
const data=Object.fromEntries(new FormData(form).entries());
try{
const res=await fetch('/api/volunteer/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
const json=await res.json();msg.style.display='block';
if(json.success){msg.className='success';msg.innerHTML='✅ '+json.message+'<br>ID: <b>'+json.id+'</b>';form.reset();}
else{msg.className='error';msg.innerText='❌ '+json.message;}
}catch(err){msg.style.display='block';msg.className='error';msg.innerText='Error: '+err.message;}
btn.disabled=false;btn.innerText='রেজিস্টার করুন';
});
function loadLinks(cat,el){
document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));if(el)el.classList.add('active');
const box=document.getElementById('publicLinks');box.innerHTML='লোড হচ্ছে...';
fetch('/api/links?cat='+cat).then(r=>r.json()).then(j=>{
if(!j.data||j.data.length==0){box.innerHTML='<p style="padding:20px;color:#888">কোনো তথ্য যোগ করা হয়নি</p>';return;}
box.innerHTML=j.data.map(f=>\`<a class="link-card" href="\${f.link}" target="_blank"><b>⬇️ \${f.title}</b> [\${f.category}]<br><small>\${f.description||''} - \${new Date(f.created_at).toLocaleDateString('bn-IN')}</small></a>\`).join('');
});
}
loadLinks('all');
</script>
</body>
</html>`;

const ADMIN_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Admin Panel</title>
<style>body{font-family:sans-serif;background:#f5f5f5;padding:15px}.box{max-width:900px;margin:auto;background:white;padding:20px;border-radius:12px}input,select{width:100%;padding:10px;margin:5px 0;border:1px solid #ccc;border-radius:6px}button{padding:10px 16px;background:#1a73e8;color:white;border:none;border-radius:6px;cursor:pointer;margin:3px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #ddd;padding:6px;font-size:13px}th{background:#1a73e8;color:white}.card{background:#f0f6ff;padding:12px;border-radius:8px;margin:15px 0}</style></head>
<body><div class="box">
<h2>Admin Panel - Prasenjit Shop</h2>
<div style="display:flex;gap:8px"><input type="password" id="token" placeholder="Admin Token (admin123)"><button onclick="loadAll()">Load Data</button></div>

<div class="card">
<h3>➕ নতুন পাবলিক লিংক যোগ করুন (ফরম/নোটিফিকেশন/অর্ডার)</h3>
<input id="f_title" placeholder="টাইটেল - যেমন: নোটিফিকেশন ১৪ সেপ্টেম্বর">
<input id="f_link" placeholder="লিংক - Google Drive / PDF / Image লিংক">
<div style="display:flex;gap:8px"><select id="f_cat"><option value="form">ফরম</option><option value="notification">নোটিফিকেশন</option><option value="order">ওয়ার্কার অর্ডার / জারি</option><option value="other">অন্যান্য</option></select><input id="f_desc" placeholder="বিবরণ"></div>
<button onclick="addLink()">লিংক যোগ করুন</button><span id="f_msg"></span>
</div>

<h3>Volunteers</h3>
<table><thead><tr><th>ID</th><th>নাম</th><th>মোবাইল</th><th>ঠিকানা</th></tr></thead><tbody id="volBody"></tbody></table>
<h3 style="margin-top:20px">Public Links</h3>
<table><thead><tr><th>Title</th><th>Category</th><th>Link</th><th>Action</th></tr></thead><tbody id="linkBody"></tbody></table>
</div>
<script>
function getToken(){return document.getElementById('token').value;}
async function loadAll(){
const token=getToken();
const v=await fetch('/api/admin/volunteers',{headers:{'X-Admin-Token':token}}).then(r=>r.json()).catch(()=>({data:[]}));
document.getElementById('volBody').innerHTML=(v.data||[]).map(x=>\`<tr><td>\${x.id}</td><td>\${x.name}</td><td>\${x.mobile}</td><td>\${(x.full_address||x.address||'').substring(0,30)}</td></tr>\`).join('');
const l=await fetch('/api/admin/links',{headers:{'X-Admin-Token':token}}).then(r=>r.json()).catch(()=>({data:[]}));
document.getElementById('linkBody').innerHTML=(l.data||[]).map(x=>\`<tr><td>\${x.title}</td><td>\${x.category}</td><td><a href="\${x.link}" target="_blank">Open</a></td><td><button onclick="delLink('\${x.id}')">Del</button></td></tr>\`).join('');
}
async function addLink(){
const token=getToken();
const body={title:document.getElementById('f_title').value,link:document.getElementById('f_link').value,category:document.getElementById('f_cat').value,description:document.getElementById('f_desc').value};
if(!body.title||!body.link){alert('Title + Link লাগবে');return;}
const res=await fetch('/api/admin/links',{method:'POST',headers:{'Content-Type':'application/json','X-Admin-Token':token},body:JSON.stringify(body)}).then(r=>r.json());
document.getElementById('f_msg').innerText=res.success?'✅ যোগ হয়েছে':'❌ '+res.message;loadAll();
}
async function delLink(id){
const token=getToken();if(!confirm('Delete?'))return;
await fetch('/api/admin/links/'+id,{method:'DELETE',headers:{'X-Admin-Token':token}});loadAll();
}
</script></body></html>`;

const STATUS_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Status</title>
<style>body{background:#f0f2f5;font-family:sans-serif;padding:15px}.box{max-width:500px;margin:60px auto;background:white;padding:24px;border-radius:16px}input{width:100%;padding:12px;border:1px solid #ddd;border-radius:8px}button{width:100%;padding:12px;margin-top:10px;background:#1a73e8;color:white;border:none;border-radius:8px}#result{margin-top:15px;padding:12px;background:#e6f4ea;border-radius:8px;display:none}</style></head>
<body><div class="box"><h2>স্ট্যাটাস চেক</h2><input id="q" placeholder="মোবাইল নম্বর বা ID দিন"><button onclick="check()">চেক</button><div id="result"></div><p style="margin-top:15px;text-align:center"><a href="/">Home</a></p></div>
<script>
async function check(){
const q=document.getElementById('q').value.trim();if(!q)return;
const res=await fetch('/api/volunteer/status/'+encodeURIComponent(q)).then(r=>r.json());
const box=document.getElementById('result');box.style.display='block';
if(res.success){box.innerHTML='ID:'+res.data.id+'<br>নাম:'+res.data.name+'<br>মোবাইল:'+res.data.mobile+'<br>স্ট্যাটাস:'+res.data.status;}else{box.innerHTML='❌ '+res.message;}
}
</script></body></html>`;

const LINKS_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>All Downloads</title><style>body{font-family:sans-serif;background:#f0f2f5;padding:15px}.c{max-width:700px;margin:auto;background:white;padding:20px;border-radius:12px}.card{display:block;padding:14px;background:#f8f9ff;border:1px solid #ddd;margin:10px 0;border-radius:10px;text-decoration:none;color:#222}</style></head><body><div class="c"><h2>📂 সব নোটিফিকেশন ও ফরম</h2><div id="list">Loading...</div><br><a href="/">← Home</a></div><script>fetch('/api/links').then(r=>r.json()).then(j=>{document.getElementById('list').innerHTML=(j.data||[]).map(f=>\`<a class="card" href="\${f.link}" target="_blank"><b>\${f.title}</b> [\${f.category}]<br><small>\${f.description||''}</small></a>\`).join('')})</script></body></html>`;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const headers = cors() as any;

    if (req.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    // ====== AUTO CREATE TABLES ======
    try {
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS volunteers (id TEXT PRIMARY KEY, name TEXT, father_name TEXT, dob TEXT, gender TEXT, mobile TEXT, whatsapp TEXT, full_address TEXT, address TEXT, district TEXT, vidhansabha TEXT, qualification TEXT, experience TEXT, status TEXT DEFAULT 'pending', created_at TEXT)`).run();
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS public_links (id TEXT PRIMARY KEY, title TEXT, link TEXT, category TEXT, description TEXT, created_at TEXT)`).run();
    } catch(e){}

    // ====== NEW: PUBLIC LINKS API ======
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
      if (token !== env.ADMIN_TOKEN) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401, headers });
      }
      if (req.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM public_links ORDER BY created_at DESC").all();
        return Response.json({ success: true, data: results }, { headers });
      }
      if (req.method === "POST") {
        try {
          const d: any = await req.json();
          if (!d.title || !d.link) return Response.json({ success: false, message: "title & link required" }, { headers });
          const id = "LINK-" + Date.now();
          await env.DB.prepare("INSERT INTO public_links (id, title, link, category, description, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(id, d.title, d.link, d.category || "other", d.description || "", new Date().toISOString()).run();
          return Response.json({ success: true, id }, { headers });
        } catch(e:any){ return Response.json({ success: false, message: e.message }, { headers }); }
      }
    }

    if (url.pathname.startsWith("/api/admin/links/") && req.method === "DELETE") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token");
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false }, { status: 401, headers });
      const id = url.pathname.split("/").pop() || "";
      await env.DB.prepare("DELETE FROM public_links WHERE id = ?").bind(id).run();
      return Response.json({ success: true }, { headers });
    }

    // ====== PAGES ======
    if (url.pathname === "/admin") {
      return new Response(ADMIN_PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
    if (url.pathname === "/status") {
      return new Response(STATUS_PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
    if (url.pathname === "/links") {
      return new Response(LINKS_PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    // ====== YOUR OLD APIs (FIXED) ======
    if (url.pathname === "/api/volunteer/register" && req.method === "POST") {
      try {
        const d: any = await req.json();
        if (!d.name || !d.father_name || !d.mobile) {
          return Response.json({ success: false, message: "নাম, পিতার নাম, মোবাইল আবশ্যক" }, { headers });
        }
        const mobile = d.mobile.toString().trim().replace(/\s+/g, "");
        if (!/^[6-9]\d{9}$/.test(mobile)) {
          return Response.json({ success: false, message: "সঠিক 10 সংখ্যার মোবাইল দিন" }, { headers });
        }
        const exists = await env.DB.prepare("SELECT id FROM volunteers WHERE mobile = ?").bind(mobile).first();
        if (exists) {
          return Response.json({ success: false, message: "এই মোবাইল নম্বর দিয়ে আগেই রেজিস্ট্রেশন হয়েছে" }, { headers });
        }
        const id = generateId();
        await env.DB.prepare(
          "INSERT INTO volunteers (id, name, father_name, dob, gender, mobile, whatsapp, full_address, district, vidhansabha, qualification, experience, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(id, d.name, d.father_name, d.dob || "", d.gender || "", mobile, d.whatsapp || "", d.full_address || "", d.district || "বীরভূম", d.vidhansabha || "", d.qualification || "", d.experience || "", "pending", new Date().toISOString()).run();
        return Response.json({ success: true, id, message: "আবেদন সফল!" }, { headers });
      } catch (e: any) {
        return Response.json({ success: false, message: "Server Error: " + e.message }, { headers });
      }
    }

    if (url.pathname.startsWith("/api/volunteer/status/")) {
      const q = decodeURIComponent(url.pathname.split("/").pop() || "");
      if (!q) return Response.json({ success: false, message: "ID বা মোবাইল দিন" }, { headers });
      const row = await env.DB.prepare("SELECT id, name, mobile, status, created_at FROM volunteers WHERE mobile = ? OR id = ?").bind(q, q).first();
      if (!row) {
        return Response.json({ success: false, message: "ID বা মোবাইল লিংক পাওয়া যায়নি" }, { headers });
      }
      return Response.json({ success: true, data: row }, { headers });
    }

    if (url.pathname === "/api/admin/volunteers") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token");
      if (token !== env.ADMIN_TOKEN) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401, headers });
      }
      const { results } = await env.DB.prepare("SELECT * FROM volunteers ORDER BY created_at DESC").all();
      return Response.json({ success: true, data: results }, { headers });
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(HTML_PAGE, {
        headers: { "Content-Type": "text/html; charset=utf-8", "Access-Control-Allow-Origin": "*" },
      });
    }

    return new Response(JSON.stringify({ message: "API OK", links: "/api/links", admin: "/admin" }), { headers });
  },
};
