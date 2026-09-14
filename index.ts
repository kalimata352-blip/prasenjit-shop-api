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

const HTML_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Prasenjit Shop - Volunteer Registration</title><style>*{margin:0;padding:0;box-sizing:border-box;font-family:'Noto Sans Bengali',sans-serif}body{background:#f0f2f5;padding:15px}.container{max-width:700px;margin:20px auto;background:white;padding:20px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,.1)}h1{text-align:center;color:#173a8b;margin-bottom:5px;font-size:24px}.subtitle{text-align:center;color:#666;margin-bottom:20px;font-size:14px}label{display:block;margin-top:12px;font-weight:600;color:#333}input,select,textarea{width:100%;padding:12px;margin-top:5px;border:1px solid #ddd;border-radius:8px}.row{display:flex;gap:10px;flex-wrap:wrap}.row>div{flex:1 1 140px;min-width:0}button{width:100%;margin-top:15px;padding:12px;border-radius:8px;display:block;background:#173a8b;color:white;border:0;font-size:16px;cursor:pointer}#msg{margin-top:15px;padding:12px;border-radius:8px;display:none;text-align:center}.success{background:#e6fae6;color:#13733c;border:1px solid #50b685}.error{background:#fce6e6;color:#9a503d;border:1px solid #f58c8b}.tabs{display:flex;gap:8px;margin:20px 0;overflow-x:auto;padding-bottom:5px}.tab{padding:8px 14px;background:#f8f9fe;border-radius:20px;cursor:pointer;white-space:nowrap;border:1px solid #ddd}.tab.active{background:#173a8b;color:white;border-color:#173a8b}.link-card{display:block;padding:12px;background:#f8f9ff;border:1px solid #ddd;border-radius:8px;margin-top:10px;text-decoration:none;color:#000}</style></head><body><div class="container"><h1>প্রসেনজিৎ শপ</h1><p class="subtitle">ভলেন্টিয়ার রেজিস্ট্রেশন</p><form id="volForm"><label>নাম *</label><input type="text" name="name" required placeholder="আপনার নাম"><label>পিতার নাম *</label><input type="text" name="father_name" required><div class="row"><div><label>জন্ম তারিখ *</label><input type="date" name="dob" required></div><div><label>মোবাইল *</label><input type="tel" name="mobile" required placeholder="10 digit number"></div></div><div class="row"><div><label>WhatsApp</label><input type="text" name="whatsapp"></div><div><label>জেলা *</label><input type="text" name="district" required></div></div><label>সম্পূর্ণ ঠিকানা *</label><textarea name="full_address" required rows="2"></textarea><div class="row"><div><label>শিক্ষাগত যোগ্যতা</label><input type="text" name="qualification"></div><div><label>অভিজ্ঞতা</label><input type="text" name="experience"></div></div><button type="submit" id="btn">রেজিস্টার করুন</button><div id="msg"></div></form><div style="margin-top:20px;text-align:center;"><small><a href="/status">আপনার ID স্ট্যাটাস চেক করুন</a> | <a href="/links">গুরুত্বপূর্ণ লিঙ্ক</a></small></div><hr style="margin:30px 0"><h2 style="color:#173a8b">গুরুত্বপূর্ণ লিঙ্ক ও নোটিফিকেশন</h2><p style="color:#666;font-size:13px;">এখানে ফর্ম, নোটিফিকেশন, অর্ডারর খবর পাবেন</p><div class="tabs"><button class="tab active" onclick="loadLinks('all',this)">সব</button><button class="tab" onclick="loadLinks('form',this)">ফর্ম</button><button class="tab" onclick="loadLinks('notification',this)">নোটিফিকেশন</button><button class="tab" onclick="loadLinks('order',this)">অর্ডার</button><button class="tab" onclick="loadLinks('other',this)">অন্যান্য</button></div><div id="publicLinks">লোড হচ্ছে...</div></div><script>const form=document.getElementById('volForm');const msg=document.getElementById('msg');form.addEventListener('submit',async(e)=>{e.preventDefault();const btn=document.getElementById('btn');btn.disabled=true;btn.innerText='জমা হচ্ছে...';const data=Object.fromEntries(new FormData(form).entries());try{const res=await fetch('/api/volunteer/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const json=await res.json();msg.style.display='block';if(json.success){msg.className='success';msg.innerHTML='✅ '+json.message+'<br><b>ID: '+json.id+'</b><br>এই ID টি মনে রাখুন। <a href="/status">স্ট্যাটাস দেখুন</a>';form.reset();}else{msg.className='error';msg.innerText='❌ '+json.message;}}catch(err){msg.style.display='block';msg.className='error';msg.innerText='সার্ভার সমস্যা';}btn.disabled=false;btn.innerText='রেজিস্টার করুন';});function loadLinks(cat,el){document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));if(el)el.classList.add('active');const box=document.getElementById('publicLinks');box.innerHTML='লোড হচ্ছে...';fetch('/api/links?cat='+cat).then(r=>r.json()).then(j=>{if(!j.data||j.data.length==0){box.innerHTML='<p style="padding:20px">কোনো লিঙ্ক নেই</p>';return;}box.innerHTML=j.data.map(l=>\`<a class="link-card" href="\${l.link}" target="_blank"><b>\${l.title}</b><br><small>\${l.category||''}</small></a>\`).join('');}).catch(()=>{box.innerHTML='<p style="color:red">লোড করতে সমস্যা</p>';});}loadLinks('all');</script></body></html>`;

const ADMIN_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin Panel - Prasenjit Shop</title><style>body{font-family:sans-serif;background:#f5f5f5;padding:15px}.box{max-width:1100px;margin:auto;background:white;padding:15px;border-radius:10px}table{width:100%;border-collapse:collapse;margin-top:10px}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}th{background:#f5f5f5}select{padding:5px;border-radius:5px}.card{border:1px solid #ddd;padding:10px;border-radius:8px;margin-top:15px}</style></head><body><div class="box"><h2>Admin Panel - Prasenjit Shop</h2><div style="display:flex;gap:8px;margin:10px 0"><input type="password" id="token" placeholder="Admin Token লিখুন" style="flex:1;padding:10px"><button onclick="loadAll()" style="padding:10px 15px;background:#173a8b;color:white;border:0;border-radius:5px">Login</button></div><div class="card"><h3>নতুন লিঙ্ক যোগ করুন</h3><input id="f_title" placeholder="টাইটেল" style="width:100%;margin-bottom:6px;padding:8px"><input id="f_link" placeholder="লিঙ্ক" style="width:100%;margin-bottom:6px;padding:8px"><div style="display:flex;gap:8px"><select id="f_cat"><option value="form">Form</option><option value="notification">Notification</option><option value="order">Order</option><option value="other">Other</option></select><button onclick="addLink()" style="padding:8px 15px">Add Link</button></div><div id="f_msg"></div></div><h3>Volunteers</h3><table><thead><tr><th>ID</th><th>নাম</th><th>মোবাইল</th><th>স্ট্যাটাস</th><th>Action</th></tr></thead><tbody id="volBody"></tbody></table><h3 style="margin-top:20px">Public Links</h3><table><thead><tr><th>Title</th><th>Category</th><th>Link</th><th>Action</th></thead><tbody id="linkBody"></tbody></table></div><script>function getToken(){return document.getElementById('token').value;}async function loadAll(){const token=getToken();if(!token){alert('Token দিন');return;}const res=await fetch('/api/admin/volunteers',{headers:{'X-Admin-Token':token}});const j=await res.json();if(!j.success){alert(j.message||'Token ভুল');return;}document.getElementById('volBody').innerHTML=j.data.map(v=>\`<tr><td>\${v.id}</td><td>\${v.name}</td><td>\${v.mobile}</td><td><span style="padding:3px 8px;border-radius:10px;color:white;background:\${v.status=='approved'?'green':v.status=='rejected'?'red':'orange'}">\${v.status}</span></td><td><select onchange="changeStatus('\${v.id}',this.value)"><option>Change</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select> <a href="/api/volunteer/pdf/\${v.id}" target="_blank">PDF</a></td></tr>\`).join('');const rl=await fetch('/api/admin/links',{headers:{'X-Admin-Token':token}});const jl=await rl.json();document.getElementById('linkBody').innerHTML=(jl.data||[]).map(l=>\`<tr><td>\${l.title}</td><td>\${l.category}</td><td>\${l.link}</td><td><button onclick="delLink('\${l.id}')">Delete</button></td></tr>\`).join('');}async function changeStatus(id,status){if(status=='Change')return;const token=getToken();const res=await fetch('/api/admin/volunteers/'+id+'/status',{method:'PUT',headers:{'Content-Type':'application/json','X-Admin-Token':token},body:JSON.stringify({status})});const j=await res.json();if(j.success){alert('Status '+status+' করা হলো');loadAll();}else alert(j.message);}async function addLink(){const token=getToken();const title=document.getElementById('f_title').value;const link=document.getElementById('f_link').value;const cat=document.getElementById('f_cat').value;if(!title||!link){alert('Title + Link লাগবে');return;}const res=await fetch('/api/admin/links',{method:'POST',headers:{'Content-Type':'application/json','X-Admin-Token':token},body:JSON.stringify({title,link,category:cat})});const j=await res.json();document.getElementById('f_msg').innerText=j.success?'Added: '+j.id:j.message;loadAll();}async function delLink(id){const token=getToken();if(!confirm('Delete?'))return;await fetch('/api/admin/links/'+id,{method:'DELETE',headers:{'X-Admin-Token':token}});loadAll();}</script></body></html>`;

const STATUS_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Status Check</title><style>body{font-family:'Noto Sans Bengali',sans-serif;background:#f0f2f5;padding:15px}.box{max-width:500px;margin:30px auto;background:white;padding:20px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,.1)}input{width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;margin-top:10px}button{width:100%;padding:12px;margin-top:10px;background:#173a8b;color:white;border:0;border-radius:8px} .badge{padding:6px 12px;border-radius:20px;color:white;font-weight:bold;display:inline-block;margin-top:5px}</style></head><body><div class="box"><h2>আইডি স্ট্যাটাস চেক</h2><p style="color:#666;font-size:13px">ID নম্বর বা মোবাইল নম্বর লিখুন</p><input id="q" placeholder="যেমন: PS-VOL-2024-XXXXX বা 9876543210"><button onclick="check()">চেক করুন</button><div id="result" style="margin-top:15px"></div><div style="margin-top:15px;text-align:center"><a href="/">হোমে ফিরুন</a></div></div><script>async function check(){const q=document.getElementById('q').value.trim();if(!q){alert('ID বা মোবাইল নম্বর লিখুন');return;}const box=document.getElementById('result');box.innerHTML='লোড হচ্ছে...';try{const res=await fetch('/api/volunteer/status/'+encodeURIComponent(q));const j=await res.json();if(j.success){const s=j.data.status||'pending';let color=s=='approved'?'#16a34a':s=='rejected'?'#dc2626':'#f59e0b';let txt=s=='approved'?'✅ Approved':s=='rejected'?'❌ Rejected':'⏳ Pending';box.innerHTML='<b>ID:</b> '+j.data.id+'<br><b>নাম:</b> '+j.data.name+'<br><b>মোবাইল:</b> '+j.data.mobile+'<br><b>স্ট্যাটাস:</b> <span class=badge style=background:'+color+'>'+txt+'</span><br><br><small>এডমিন সিদ্ধান্ত নেওয়ার সঙ্গে সঙ্গে এখানে আপডেট হয়ে যাবে।</small><br><br><a href=/api/volunteer/pdf/'+j.data.id+' target=_blank style=color:#173a8b>PDF ডাউনলোড করুন</a>';}else{box.innerHTML='<span style=color:red>❌ '+j.message+'</span>';}}catch(e){box.innerHTML='<span style=color:red>সার্ভার সমস্যা</span>';}}</script></body></html>`;

const LINKS_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Links</title><style>body{font-family:sans-serif;background:#f0f2f5;padding:15px}.box{max-width:700px;margin:auto;background:white;padding:15px;border-radius:10px}</style></head><body><div class="box"><h2>গুরুত্বপূর্ণ লিঙ্ক</h2><div id="list">লোড হচ্ছে...</div></div><script>fetch('/api/links?cat=all').then(r=>r.json()).then(j=>{document.getElementById('list').innerHTML=(j.data||[]).map(l=>'<p><a href="'+l.link+'" target="_blank">'+l.title+'</a> - '+l.category+'</p>').join('');});</script></body></html>`;

const PDF_PAGE = (v: any) => `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:'Noto Sans Bengali',sans-serif;padding:20px;background:white}.box{max-width:700px;margin:auto;border:1px solid #000;padding:20px}h1{style=text-align:center}<table style="width:100%;font-weight:bold"><tr><td style="width:30%;font-weight:bold">ID</td><td>${v.id}</td></tr><tr><td style="font-weight:bold">নাম</td><td>${v.name}</td></tr><tr><td style="font-weight:bold">পিতার নাম</td><td>${v.father_name}</td></tr><tr><td style="font-weight:bold">মোবাইল</td><td>${v.mobile}</td></tr><tr><td style="font-weight:bold">WhatsApp</td><td>${v.whatsapp||'-'}</td></tr><tr><td style="font-weight:bold">ঠিকানা</td><td>${v.full_address}</td></tr><tr><td style="font-weight:bold">জেলা</td><td>${v.district}</td></tr><tr><td style="font-weight:bold">স্ট্যাটাস</td><td>${v.status}</td></tr></table><br><div style="display:flex;justify-content:space-between;margin-top:40px"><span>Application ID: ${v.id}</span><span>Date: ${new Date().toLocaleDateString('bn-IN')}</span></div><button class="no-print" style="width:100px" onclick="window.print()">Print</button><p class="no-print" style="text-align:center;margin-top:10px"><a href="/">Home</a></p></div></body></html>`;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const headers = cors() as any;
    if (req.method === "OPTIONS") return new Response(null, { headers });

    try {
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS volunteers (id TEXT PRIMARY KEY, name TEXT, father_name TEXT, dob TEXT, mobile TEXT, whatsapp TEXT, full_address TEXT, district TEXT, qualification TEXT, experience TEXT, status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`).run();
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS public_links (id TEXT PRIMARY KEY, title TEXT, link TEXT, category TEXT DEFAULT 'other', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`).run();
    } catch (e) {}

    if (url.pathname === "/api/links") {
      const cat = url.searchParams.get("cat") || "all";
      try {
        let results;
        if (cat === "all") {
          results = await env.DB.prepare("SELECT * FROM public_links ORDER BY created_at DESC").all();
        } else {
          results = await env.DB.prepare("SELECT * FROM public_links WHERE category = ? ORDER BY created_at DESC").bind(cat).all();
        }
        return Response.json({ success: true, data: results.results }, { headers });
      } catch (e: any) {
        return Response.json({ success: true, data: [] }, { headers });
      }
    }

    if (url.pathname === "/api/admin/links") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token") || "";
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized" }, { status: 401, headers });
      if (req.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM public_links ORDER BY created_at DESC").all();
        return Response.json({ success: true, data: results }, { headers });
      }
      if (req.method === "POST") {
        const d: any = await req.json();
        if (!d.title || !d.link) return Response.json({ success: false, message: "Title + Link required" }, { headers });
        const id = "LINK-" + Date.now();
        await env.DB.prepare("INSERT INTO public_links (id, title, link, category) VALUES (?, ?, ?, ?)").bind(id, d.title, d.link, d.category || 'other').run();
        return Response.json({ success: true, id }, { headers });
      }
    }

    if (url.pathname.startsWith("/api/admin/links/") && req.method === "DELETE") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token") || "";
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized" }, { status: 401, headers });
      const id = url.pathname.split("/").pop() || "";
      await env.DB.prepare("DELETE FROM public_links WHERE id = ?").bind(id).run();
      return Response.json({ success: true }, { headers });
    }

    if (url.pathname === "/admin") return new Response(ADMIN_PAGE, { headers: { "Content-Type": "text/html" } });
    if (url.pathname === "/status") return new Response(STATUS_PAGE, { headers: { "Content-Type": "text/html" } });
    if (url.pathname === "/links") return new Response(LINKS_PAGE, { headers: { "Content-Type": "text/html" } });

    // PDF
    if (url.pathname.startsWith("/api/volunteer/pdf/")) {
      const q = decodeURIComponent(url.pathname.split("/").pop() || "");
      if (!q) return Response.json({ success: false, message: "ID লাগবে" }, { headers });
      const row = await env.DB.prepare("SELECT * FROM volunteers WHERE id = ? OR mobile = ?").bind(q, q).first();
      if (!row) return Response.json({ success: false, message: "পাওয়া যায়নি" }, { headers });
      return new Response(PDF_PAGE(row), { headers: { "Content-Type": "text/html" } });
    }

    if (url.pathname === "/api/volunteer/register" && req.method === "POST") {
      try {
        const d: any = await req.json();
        if (!d.name || !d.father_name || !d.mobile) return Response.json({ success: false, message: "নাম, পিতার নাম, মোবাইল আবশ্যক" }, { headers });
        if (!/^[6-9][0-9]{9}$/.test(d.mobile.trim().replace(/\s/g, ""))) return Response.json({ success: false, message: "সঠিক মোবাইল নম্বর দিন" }, { headers });
        const exists = await env.DB.prepare("SELECT id FROM volunteers WHERE mobile = ?").bind(d.mobile.trim()).first();
        if (exists) return Response.json({ success: false, message: "এই মোবাইল দিয়ে আগেই রেজিস্টার করা আছে" }, { headers });
        const id = generateId();
        await env.DB.prepare("INSERT INTO volunteers (id, name, father_name, dob, mobile, whatsapp, full_address, district, qualification, experience, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')").bind(id, d.name, d.father_name, d.dob||'', d.mobile.trim(), d.whatsapp||'', d.full_address||'', d.district||'', d.qualification||'', d.experience||'').run();
        const pdfLink = "/api/volunteer/pdf/" + id;
        await env.DB.prepare("INSERT INTO public_links (id, title, link, category) VALUES (?, ?, ?, ?)").bind("LINK-"+Date.now(), "New Volunteer - "+d.name, pdfLink, "other").run().catch(()=>{});
        return Response.json({ success: true, id, message: "রেজিস্ট্রেশন সফল! আপনার ID: "+id }, { headers });
      } catch (e: any) {
        return Response.json({ success: false, message: "Server Error: "+e.message }, { headers });
      }
    }

    // === STATUS CHECK - FIXED TO SEARCH BY ID OR MOBILE ===
    if (url.pathname.startsWith("/api/volunteer/status/")) {
      const q = decodeURIComponent(url.pathname.split("/").pop() || "").trim();
      if (!q) return Response.json({ success: false, message: "ID বা মোবাইল দিন" }, { headers });
      const row = await env.DB.prepare("SELECT id, name, mobile, status, created_at FROM volunteers WHERE id = ? OR mobile = ?").bind(q, q).first();
      if (!row) return Response.json({ success: false, message: "ID বা মোবাইল নম্বর পাওয়া যায়নি" }, { headers });
      return Response.json({ success: true, data: row }, { headers });
    }

    // ADMIN - list volunteers
    if (url.pathname === "/api/admin/volunteers") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token") || "";
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized - Token ভুল" }, { status: 401, headers });
      const { results } = await env.DB.prepare("SELECT * FROM volunteers ORDER BY created_at DESC").all();
      return Response.json({ success: true, data: results }, { headers });
    }

    // ADMIN - update status: pending / approved / rejected
    if (url.pathname.startsWith("/api/admin/volunteers/") && url.pathname.endsWith("/status") && req.method === "PUT") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token") || "";
      if (token !== env.ADMIN_TOKEN) return Response.json({ success: false, message: "Unauthorized" }, { status: 401, headers });
      const parts = url.pathname.split("/");
      const id = parts[3]; // /api/admin/volunteers/ID/status
      const body: any = await req.json();
      const newStatus = (body.status||'').toLowerCase();
      if (!['pending','approved','rejected'].includes(newStatus)) return Response.json({ success: false, message: "Status must be pending, approved, rejected" }, { headers });
      await env.DB.prepare("UPDATE volunteers SET status = ? WHERE id = ?").bind(newStatus, id).run();
      return Response.json({ success: true, message: "Status updated to "+newStatus }, { headers });
    }

    if (url.pathname === "/" || url.pathname === "/index") {
      return new Response(HTML_PAGE, { headers: { "Content-Type": "text/html" } });
    }

    return new Response(JSON.stringify({ message: "API Not Found" }), { status: 404, headers });
  },
};
