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

// ============ HTML TEMPLATES - ORIGINAL UNCHANGED ============

const HTML_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Prasenjit Shop - Volunteer Registration</title>
<style>
body{font-family:system-ui,sans-serif;background:#f5f5f5;margin:0;padding:12px}
.card{background:#fff;max-width:600px;margin:auto;padding:20px;border-radius:12px;box-shadow:0 2px 8px #0001}
input,textarea,select{width:100%;padding:10px;margin:6px 0;border:1px solid #ccc;border-radius:6px;box-sizing:border-box}
button{background:#066efd;color:#fff;border:0;padding:12px 18px;border-radius:6px;width:100%;cursor:pointer;margin-top:8px}
.top-links{display:flex;gap:10px;justify-content:center;margin:12px 0;flex-wrap:wrap}
a.btn{padding:8px 14px;background:#eee;border-radius:8px;text-decoration:none;color:#111;font-size:14px}
#adminFloat{position:fixed;right:14px;bottom:14px;background:#111;color:#fff;padding:8px 12px;border-radius:20px;text-decoration:none}
</style></head><body>
<div class="card">
<h2 style="text-align:center">প্রসেনজিৎ শপ - ভলেন্টিয়ার রেজিস্ট্রেশন</h2>
<div class="top-links">
<a class="btn" href="/status">আপনার ID স্ট্যাটাস চেক করুন</a>
<a class="btn" href="/links">গুরুত্বপূর্ণ লিঙ্ক ও নোটিফিকেশন</a>
<a class="btn" href="/admin">Admin</a>
</div>
<form id="f">
<input name="name" placeholder="নাম *" required>
<input name="father_name" placeholder="পিতার নাম *" required>
<input name="dob" type="date" placeholder="জন্ম তারিখ *">
<input name="mobile" placeholder="মোবাইল *" required pattern="[6-9][0-9]{9}" title="10 digit mobile">
<input name="whatsapp" placeholder="WhatsApp">
<input name="district" placeholder="জেলা *">
<textarea name="address" placeholder="সম্পূর্ণ ঠিকানা *" required></textarea>
<input name="qualification" placeholder="শিক্ষাগত যোগ্যতা">
<input name="experience" placeholder="অভিজ্ঞতা">
<button type="submit">রেজিস্ট্রেশন করুন</button>
</form>
<div id="msg"></div>
<hr>
<h3>গুরুত্বপূর্ণ লিঙ্ক ও নোটিফিকেশন</h3>
<div id="links">লোড হচ্ছে...</div>
</div>
<a id="adminFloat" href="/admin">⚙ Admin</a>
<script>
const f=document.getElementById('f'),msg=document.getElementById('msg');
f.addEventListener('submit',async e=>{
  e.preventDefault();
  const d=Object.fromEntries(new FormData(f).entries());
  msg.textContent='পাঠানো হচ্ছে...';
  try{
    const r=await fetch('/api/volunteer/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});
    const j=await r.json();
    if(j.success){
      msg.innerHTML='✅ রেজিস্ট্রেশন সফল! আপনার ID: <b>'+j.id+'</b><br><a target="_blank" href="/api/volunteer/pdf/'+j.id+'">PDF দেখুন / ডাউনলোড</a>';
      f.reset();
      loadLinks();
    } else msg.textContent='❌ '+j.message;
  }catch(err){msg.textContent='❌ Server Error'}
});

// Load notifications
async function loadLinks(){
  try{
    const r=await fetch('/api/links'); const j=await r.json();
    const c=document.getElementById('links');
    if(!j.data || !j.data.length){c.innerHTML='কোনো নোটিফিকেশন নেই'; return;}
    c.innerHTML=j.data.map(x=>{
      const isPdf = x.link.toLowerCase().endsWith('.pdf') || x.link.includes('/api/file/');
      const downloadAttr = isPdf ? ' download' : '';
      return \`<div style="border:1px solid #eee;padding:10px;border-radius:8px;margin-bottom:8px">
        <div><b>\${x.title}</b><br><small>\${new Date(x.created_at||Date.now()).toLocaleDateString('bn-IN')}</small></div>
        <div style="display:flex;gap:6px;margin-top:6px">
          <a class="btn" href="\${x.link}" target="_blank">👁 দেখুন</a>
          <a class="btn" style="background:#0d6efd;color:#fff" href="\${x.link}"\${downloadAttr}>⬇ ডাউনলোড</a>
        </div>
      </div>\`;
    }).join('');
  }catch(e){document.getElementById('links').textContent='লোড করতে সমস্যা'}
}
loadLinks();
</script>
</body></html>`;

const STATUS_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Status Check</title>
<style>body{font-family:system-ui;padding:16px;background:#f5f5f5}.card{max-width:500px;margin:auto;background:#fff;padding:20px;border-radius:12px}input{width:100%;padding:10px;margin:8px 0}button{padding:10px;width:100%;background:#0d6efd;color:#fff;border:0;border-radius:6px}</style>
</head><body><div class="card"><h2>ID / মোবাইল দিয়ে স্ট্যাটাস চেক</h2>
<input id="q" placeholder="ID বা মোবাইল নম্বর লিখুন">
<button onclick="check()">🔍 চেক করুন</button>
<div id="res" style="margin-top:12px"></div>
<p><a href="/">🏠 হোম</a> | <a href="/links">নোটিফিকেশন</a></p>
</div>
<script>
async function check(){
  const q=document.getElementById('q').value.trim(); if(!q) return alert('ID লিখুন');
  const r=await fetch('/api/volunteer/status/'+encodeURIComponent(q));
  const j=await r.json();
  const res=document.getElementById('res');
  if(!j.success) res.innerHTML='❌ '+j.message;
  else {
    const d=j.data;
    res.innerHTML=\`<b>নাম:</b> \${d.name}<br><b>মোবাইল:</b> \${d.mobile}<br><b>স্ট্যাটাস:</b> <b style="color:\${d.status=='approved'?'green':d.status=='rejected'?'red':'orange'}">\${d.status}</b><br><br><a href="/api/volunteer/pdf/\${d.id}" target="_blank">📄 PDF দেখুন / ডাউনলোড</a>\`;
  }
}
</script></body></html>`;

const LINKS_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>গুরুত্বপূর্ণ লিঙ্ক</title>
<style>body{font-family:system-ui;padding:16px;background:#f5f5f5}.card{max-width:700px;margin:auto;background:#fff;padding:16px;border-radius:12px}a.btn{padding:6px 12px;background:#eee;border-radius:6px;text-decoration:none;margin-right:6px;font-size:14px}</style>
</head><body><div class="card"><h2>গুরুত্বপূর্ণ লিঙ্ক ও নোটিফিকেশন</h2><div id="list">লোড হচ্ছে...</div><p><a href="/">🏠 হোম</a></p></div>
<script>
async function load(){
  const r=await fetch('/api/links'); const j=await r.json();
  const el=document.getElementById('list');
  if(!j.data || !j.data.length){el.innerHTML='কোনো লিঙ্ক নেই'; return;}
  el.innerHTML=j.data.map(x=>\`<div style="border-bottom:1px solid #eee;padding:10px 0">
  <span><b>\${x.title}</b></span><br>
  <span style="margin-top:6px;display:inline-block">
    <a class="btn" href="\${x.link}" target="_blank">দেখুন</a>
    <a class="btn" style="background:#198754;color:#fff" href="\${x.link}" download>ডাউনলোড</a>
  </span>
  </div>\`).join('');
}
load();
</script></body></html>`;

const ADMIN_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin Panel</title>
<style>body{font-family:system-ui;padding:16px;background:#f5f5f5}.card{max-width:900px;margin:auto;background:#fff;padding:16px;border-radius:12px}input{padding:8px;margin:4px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #ddd;padding:6px;font-size:13px}button{padding:6px 10px;margin:2px;border:0;border-radius:4px;cursor:pointer}.danger{background:#dc3545;color:#fff}.success{background:#198754;color:#fff}</style>
</head><body><div class="card">
<h2>Admin Panel - Prasenjit Shop</h2>
<div><input id="token" placeholder="Admin Token (Riya@12Mondal)" style="width:70%"><button onclick="saveToken()">Save</button></div>
<hr>
<h3>Volunteers</h3>
<button onclick="loadVolunteers()">🔄 লিস্ট লোড করুন</button>
<div id="vlist"></div>
<hr>
<h3>নোটিফিকেশন / PDF / চিঠি যোগ করুন (ডাউনলোড সহ)</h3>
<input id="ltitle" placeholder="টাইটেল - যেমন: নিয়োগ বিজ্ঞপ্তি PDF" style="width:60%">
<input id="llink" placeholder="লিঙ্ক - /api/volunteer/pdf/ID বা https://..." style="width:80%">
<button onclick="addLink()">➕ যোগ করুন</button>
<small style="display:block;margin:6px 0;color:#666">টিপস: যদি কোনো চিঠি/নোটিশ আপলোড করতে চান নিচের ফাইল আপলোড ব্যবহার করুন</small>
<div style="margin-top:12px;border:1px dashed #ccc;padding:12px;border-radius:8px">
<b>PDF ফাইল আপলোড (D1 এ Base64 হিসাবে সেভ হবে - ছোট ফাইলের জন্য)</b><br>
<input type="file" id="pdfFile" accept=".pdf,.jpg,.png,.jpeg,.doc,.docx">
<input id="pdfTitle" placeholder="ফাইলের টাইটেল">
<button onclick="uploadPdf()">⬆ আপলোড ও লিঙ্ক তৈরি</button>
<div id="uploadMsg"></div>
</div>
<div id="linkList" style="margin-top:12px"></div>
</div>
<script>
let ADMIN_TOKEN = localStorage.getItem('ADMIN_TOKEN') || 'Riya@12Mondal';
document.getElementById('token').value=ADMIN_TOKEN;
function saveToken(){ADMIN_TOKEN=document.getElementById('token').value.trim(); localStorage.setItem('ADMIN_TOKEN',ADMIN_TOKEN); alert('Saved');}
async function loadVolunteers(){
  const r=await fetch('/api/admin/volunteers',{headers:{'X-Admin-Token':ADMIN_TOKEN}});
  const j=await r.json();
  if(!j.success){document.getElementById('vlist').innerHTML='❌ '+j.message; return;}
  document.getElementById('vlist').innerHTML='<table><tr><th>ID</th><th>নাম</th><th>মোবাইল</th><th>স্ট্যাটাস</th><th>Action</th></tr>'+j.data.map(v=>\`<tr>
  <td>\${v.id}</td><td>\${v.name}</td><td>\${v.mobile}</td><td>\${v.status}</td>
  <td>
    <button onclick="updateStatus('\${v.id}','approved')" class="success">Approve</button>
    <button onclick="updateStatus('\${v.id}','rejected')" class="danger">Reject</button>
    <a href="/api/volunteer/pdf/\${v.id}" target="_blank">PDF</a> | <a href="/api/volunteer/pdf/\${v.id}?download=1" target="_blank">Download</a>
  </td></tr>\`).join('')+'</table>';
}
async function updateStatus(id,status){
  const r=await fetch('/api/admin/volunteers/'+id+'/status',{method:'PUT',headers:{'Content-Type':'application/json','X-Admin-Token':ADMIN_TOKEN},body:JSON.stringify({status})});
  const j=await r.json(); alert(j.message||JSON.stringify(j)); if(j.success) loadVolunteers();
}
async function loadLinksAdmin(){
  const r=await fetch('/api/admin/links',{headers:{'X-Admin-Token':ADMIN_TOKEN}});
  const j=await r.json();
  if(!j.success){document.getElementById('linkList').innerHTML='❌ '+j.message; return;}
  document.getElementById('linkList').innerHTML=j.data.map(x=>\`<div style="border-bottom:1px solid #eee;padding:6px 0">
  <span><b>\${x.title}</b> - \${x.link}</span>
  <span><a href="\${x.link}" target="_blank" download>⬇ ডাউনলোড</a> | <a href="#" onclick="delLink('\${x.id}');return false">❌ Delete</a></span>
  </div>\`).join('');
}
async function addLink(){
  const title=document.getElementById('ltitle').value.trim(), link=document.getElementById('llink').value.trim();
  if(!title||!link) return alert('Title + Link দিন');
  const r=await fetch('/api/admin/links',{method:'POST',headers:{'Content-Type':'application/json','X-Admin-Token':ADMIN_TOKEN},body:JSON.stringify({title,link})});
  const j=await r.json(); alert(j.success?'Added':'Failed: '+j.message); if(j.success){loadLinksAdmin(); document.getElementById('ltitle').value=''; document.getElementById('llink').value='';}
}
async function delLink(id){
  if(!confirm('Delete?')) return;
  const r=await fetch('/api/admin/links/'+id,{method:'DELETE',headers:{'X-Admin-Token':ADMIN_TOKEN}});
  const j=await r.json(); if(j.success) loadLinksAdmin();
}
async function uploadPdf(){
  const file=document.getElementById('pdfFile').files[0]; const title=document.getElementById('pdfTitle').value.trim()||file?.name||'Document';
  if(!file) return alert('ফাইল সিলেক্ট করুন');
  document.getElementById('uploadMsg').textContent='আপলোড হচ্ছে...';
  const reader=new FileReader();
  reader.onload=async()=>{
    const base64=reader.result as string;
    const r=await fetch('/api/admin/upload',{method:'POST',headers:{'Content-Type':'application/json','X-Admin-Token':ADMIN_TOKEN},body:JSON.stringify({title, filename:file.name, data:base64})});
    const j=await r.json();
    if(j.success){document.getElementById('uploadMsg').innerHTML='✅ আপলোড সফল! লিঙ্ক: <a href="'+j.link+'" target="_blank">'+j.link+'</a>'; loadLinksAdmin();}
    else document.getElementById('uploadMsg').textContent='❌ '+j.message;
  };
  reader.readAsDataURL(file);
}
loadVolunteers(); loadLinksAdmin();
</script></body></html>`;

const PDF_PAGE = (v: any) => `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Volunteer - ${v.id}</title>
<style>
body{font-family:system-ui,sans-serif;background:#fff;padding:20px;color:#111}
.card{max-width:700px;margin:auto;border:2px solid #333;padding:20px}
h2{text-align:center}
.row{display:flex;justify-content:space-between;border-bottom:1px solid #ddd;padding:6px 0}
.actions{text-align:center;margin:20px 0;display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.btn{padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block;cursor:pointer;border:0}
.btn-print{background:#0d6efd;color:#fff}
.btn-download{background:#198754;color:#fff}
@media print{.actions{display:none}}
</style></head><body>
<div class="card" id="pdfContent">
<h2>ভলেন্টিয়ার ফর্ম - ${v.name}</h2>
<p style="text-align:center">ID: <b>${v.id}</b> | Date: ${new Date().toLocaleDateString('bn-IN')}</p>
<div class="row"><span>নাম:</span><span><b>${v.name}</b></span></div>
<div class="row"><span>পিতার নাম:</span><span><b>${v.father_name}</b></span></div>
<div class="row"><span>মোবাইল:</span><span><b>${v.mobile}</b></span></div>
<div class="row"><span>WhatsApp:</span><span><b>${v.whatsapp||''}</b></span></div>
<div class="row"><span>জেলা:</span><span><b>${v.district||''}</b></span></div>
<div class="row"><span>ঠিকানা:</span><span><b>${v.address||''}</b></span></div>
<div class="row"><span>জন্ম তারিখ:</span><span><b>${v.dob||''}</b></span></div>
<div class="row"><span>যোগ্যতা:</span><span><b>${v.qualification||''}</b></span></div>
<div class="row"><span>অভিজ্ঞতা:</span><span><b>${v.experience||''}</b></span></div>
<div class="row"><span>স্ট্যাটাস:</span><span><b>${v.status||'pending'}</b></span></div>
<br><p style="text-align:center">এই ডকুমেন্টটি অনলাইন রেজিস্ট্রেশনের প্রমাণ।</p>
</div>
<div class="actions">
<button class="btn btn-print" onclick="window.print()">🖨 প্রিন্ট করুন</button>
<button class="btn btn-download" onclick="downloadAsPDF()">📄 PDF ডাউনলোড</button>
<a class="btn btn-download" href="/api/volunteer/pdf/${v.id}?download=1">⬇ সরাসরি ডাউনলোড</a>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
<script>
function downloadAsPDF(){
  const el=document.getElementById('pdfContent');
  const opt={margin:10,filename:'volunteer-${v.id}.pdf',image:{type:'jpeg',quality:0.98},html2canvas:{scale:2},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}};
  html2pdf().set(opt).from(el).save();
}
</script>
</body></html>`;

// ============ MAIN FETCH HANDLER - FIXED ============

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const headers = cors();
    if (req.method === "OPTIONS") return new Response(null, { headers })

    try {
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS volunteers (id TEXT PRIMARY KEY, name TEXT, father_name TEXT, dob TEXT, mobile TEXT, whatsapp TEXT, district TEXT, address TEXT, qualification TEXT, experience TEXT, status TEXT, created_at INTEGER)`).run();
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS public_links (id TEXT PRIMARY KEY, title TEXT, link TEXT, category TEXT DEFAULT 'general', created_at INTEGER)`).run();
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS public_files (id TEXT PRIMARY KEY, title TEXT, filename TEXT, data TEXT, created_at INTEGER)`).run();
    } catch (e) {}

    // === PUBLIC LINKS API - FIXED: Volunteer PDF hide ===
    if (url.pathname === "/api/links") {
      const cat = url.searchParams.get("cat") || "all";
      try {
        let results: any;
        if (cat === "all") {
          results = await env.DB.prepare(`SELECT * FROM public_links WHERE link NOT LIKE '/api/volunteer/pdf/%' ORDER BY created_at DESC`).all();
        } else {
          results = await env.DB.prepare(`SELECT * FROM public_links WHERE category = ? AND link NOT LIKE '/api/volunteer/pdf/%' ORDER BY created_at DESC`).bind(cat).all();
        }
        const files: any = await env.DB.prepare(`SELECT id, title, filename, created_at FROM public_files ORDER BY created_at DESC`).all();
        const filelinks = (files.results || []).map((f: any) => ({
          id: f.id,
          title: f.title,
          link: `/api/file/${f.id}`,
          created_at: f.created_at,
          isFile: true
        }));
        const combined = [...(results.results || []), ...filelinks].sort((a: any, b: any) => (b.created_at || 0) - (a.created_at || 0));
        return Response.json({ success: true, data: combined }, { headers });
      } catch (e: any) {
        return Response.json({ success: true, data: [] }, { headers });
      }
    }

    // Serve uploaded file - FIXED MIME
    if (url.pathname.startsWith("/api/file/")) {
      const q = decodeURIComponent(url.pathname.split("/").pop() || "");
      if (!q) return Response.json({ success: false, message: "ID লাগবে" }, { headers });
      const row: any = await env.DB.prepare("SELECT * FROM public_files WHERE id = ?").bind(q).first();
      if (!row) return Response.json({ success: false, message: "ফাইল পাওয়া যায়নি" }, { headers });
      const dataUrl = row.data as string;
      const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        return new Response(row.data, { headers: { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*" } });
      }
      const mime = matches[1];
      const b64 = matches[2];
      const binary = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      return new Response(binary, {
        headers: {
          "Content-Type": mime,
          "Content-Disposition": `inline; filename="${row.filename || row.title || q}"`,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=86400"
        }
      });
    }

    // ADMIN LINKS
    if (url.pathname === "/api/admin/links") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token") || "";
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized" }, { headers });
      if (req.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM public_links ORDER BY created_at DESC").all();
        return Response.json({ success: true, data: results }, { headers });
      }
      if (req.method === "POST") {
        const d: any = await req.json();
        if (!d.title || !d.link) return Response.json({ success: false, message: "title/link লাগবে" }, { headers });
        const id = "LINK-" + Date.now();
        await env.DB.prepare("INSERT INTO public_links (id, title, link, created_at) VALUES (?,?,?,?)").bind(id, d.title, d.link, Date.now()).run();
        return Response.json({ success: true, id }, { headers });
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

    // NEW: ADMIN FILE UPLOAD
    if (url.pathname === "/api/admin/upload" && req.method === "POST") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token") || "";
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized" }, { headers });
      const d: any = await req.json();
      if (!d.data) return Response.json({ success: false, message: "data লাগবে" }, { headers });
      const id = "FILE-" + Date.now();
      await env.DB.prepare("INSERT INTO public_files (id, title, filename, data, created_at) VALUES (?,?,?,?,?)").bind(id, d.title || d.filename || id, d.filename || id, d.data, Date.now()).run();
      // Auto create link - this is for notification PDFs only
      const link = `/api/file/${id}`;
      await env.DB.prepare("INSERT INTO public_links (id, title, link, created_at) VALUES (?,?,?,?)").bind(id, d.title || d.filename || id, link, Date.now()).run();
      return Response.json({ success: true, id, link }, { headers });
    }

    if (url.pathname === "/admin") return new Response(ADMIN_PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } })
    if (url.pathname === "/status") return new Response(STATUS_PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } })
    if (url.pathname === "/links") return new Response(LINKS_PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } })

    // PDF - FIXED DOWNLOAD
    if (url.pathname.startsWith("/api/volunteer/pdf/")) {
      const q = decodeURIComponent(url.pathname.split("/").pop() || "");
      if (!q) return Response.json({ success: false, message: "ID লাগবে" }, { headers });
      const row: any = await env.DB.prepare("SELECT * FROM volunteers WHERE id = ? OR mobile = ?").bind(q, q).first();
      if (!row) return Response.json({ success: false, message: "পাওয়া যায়নি" }, { headers });
      const isDownload = url.searchParams.get("download") === "1";
      if (isDownload) {
        // HTML হিসাবে download হবে, browser html2pdf button ও কাজ করবে
        return new Response(PDF_PAGE(row), {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Content-Disposition": `attachment; filename="volunteer-${row.id}.html"`,
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      return new Response(PDF_PAGE(row), { headers: { "Content-Type": "text/html; charset=utf-8", "Access-Control-Allow-Origin": "*" } });
    }

    if (url.pathname === "/api/volunteer/register" && req.method === "POST") {
      try {
        const d: any = await req.json();
        if (!d.name || !d.father_name || !d.mobile) return Response.json({ success: false, message: "নাম, পিতার নাম, মোবাইল লাগবে" }, { headers });
        if (!/^[6-9][0-9]{9}$/.test(d.mobile.trim().replace(/\s/g, ""))) return Response.json({ success: false, message: "সঠিক 10 সংখ্যার মোবাইল দিন" }, { headers });
        const exists = await env.DB.prepare("SELECT id FROM volunteers WHERE mobile = ?").bind(d.mobile.trim()).first();
        if (exists) return Response.json({ success: false, message: "এই মোবাইল দিয়ে আগে রেজিস্ট্রেশন হয়েছে" }, { headers });
        const id = generateId();
        await env.DB.prepare("INSERT INTO volunteers (id, name, father_name, dob, mobile, whatsapp, district, address, qualification, experience, status, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
          .bind(id, d.name, d.father_name, d.dob||'', d.mobile.trim(), d.whatsapp||'', d.district||'', d.address||'', d.qualification||'', d.experience||'', 'pending', Date.now()).run();
        
        // FIXED: Volunteer PDF আর public_links এ INSERT হবে না - শুধু Status page থেকে দেখা যাবে
        // const pdfLink = "/api/volunteer/pdf/" + id;
        // await env.DB.prepare("INSERT INTO public_links (id, title, link, created_at) VALUES (?,?,?,?)").bind(id, `Volunteer PDF - ${d.name}`, pdfLink, Date.now()).run();

        return Response.json({ success: true, id, message: "রেজিস্ট্রেশন সফল" }, { headers });
      } catch (e: any) {
        return Response.json({ success: false, message: "Server Error: " + e.message }, { headers });
      }
    }

    // STATUS CHECK
    if (url.pathname.startsWith("/api/volunteer/status/")) {
      const q = decodeURIComponent(url.pathname.split("/").pop() || "");
      if (!q) return Response.json({ success: false, message: "ID বা মোবাইল দিন" }, { headers });
      const row: any = await env.DB.prepare("SELECT id, name, mobile, status FROM volunteers WHERE id = ? OR mobile = ?").bind(q, q).first();
      if (!row) return Response.json({ success: false, message: "ID পাওয়া যায়নি" }, { headers });
      return Response.json({ success: true, data: row }, { headers });
    }

    // ADMIN - list volunteers
    if (url.pathname === "/api/admin/volunteers") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token") || "";
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized" }, { headers });
      const { results } = await env.DB.prepare("SELECT * FROM volunteers ORDER BY created_at DESC").all();
      return Response.json({ success: true, data: results }, { headers });
    }

    // ADMIN - update status
    if (url.pathname.startsWith("/api/admin/volunteers/") && url.pathname.endsWith("/status")) {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token") || "";
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized" }, { headers });
      const parts = url.pathname.split("/");
      const id = parts[4];
      const body: any = await req.json();
      const newStatus = (body.status || '').toLowerCase();
      if (!['pending', 'approved', 'rejected'].includes(newStatus)) return Response.json({ success: false, message: "Invalid status" }, { headers });
      await env.DB.prepare("UPDATE volunteers SET status = ? WHERE id = ?").bind(newStatus, id).run();
      return Response.json({ success: true, message: "Status updated to " + newStatus }, { headers });
    }

    if (url.pathname === "/" || url.pathname === "/index") {
      return new Response(HTML_PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    return new Response(JSON.stringify({ message: "API Not Found" }), { headers, status: 404 });
  },
};
