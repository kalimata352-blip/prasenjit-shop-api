/**
 * তোমার আগের কোডের উপরেই MINIMAL CHANGE - 5 টা জায়গা
 * ফাইল: index.ts (180 lines)
 */

// ========= তোমার আগের Env, generateId, cors একই থাকবে =========
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
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Token",
    "Content-Type": "application/json",
  };
}

// ========= CHANGE 1: শুধু CSS এ 2 লাইন যোগ - মোবাইল ফিক্স =========
// তোমার আগের <style> এর ভিতরে .row এর নিচে এইটুকু যোগ করো
const MOBILE_CSS_FIX = `
.row{display:flex;gap:10px;flex-wrap:wrap}
.row>div{flex:1 1 140px;min-width:0}
@media(max-width:480px){.container{padding:12px} input,select,textarea{font-size:16px}}
`;

// তোমার আগের HTML_PAGE একই থাকবে, শুধু statusLink টা /status করো
// আগেরটা ছিল: <a href="/api/volunteer/status/" id="statusLink"
// নতুনটা: <a href="/status" 
// এতে মোবাইলে সরাসরি সুন্দর পেজ খুলবে

const HTML_PAGE = `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Prasenjit Shop - Volunteer Registration</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'Noto Sans Bengali',sans-serif}
body{background:#f0f2f5;padding:15px}
.container{max-width:600px;margin:20px auto;background:white;padding:20px;border-radius:12px}
h1{text-align:center;color:#1a73e8;margin-bottom:5px;font-size:24px}
.subtitle{text-align:center;color:#666;margin-bottom:20px;font-size:14px}
label{display:block;margin-top:12px;font-weight:600;color:#333}
input,select,textarea{width:100%;padding:12px;margin-top:5px;border:1px solid #ccc;border-radius:8px;font-size:15px}
input:focus,select:focus,textarea:focus{border-color:#1a73e8;outline:none}
.row{display:flex;gap:10px;flex-wrap:wrap}
.row>div{flex:1 1 140px;min-width:0}
button{width:100%;margin-top:20px;padding:14px;background:#1a73e8;color:#fff;border:none;border-radius:8px;font-size:16px}
#msg{margin-top:15px;padding:12px;border-radius:8px;display:none;text-align:center}
.success{background:#e6f4ea;color:#137333;border:1px solid #a8dab5}
.error{background:#fce8e6;color:#a50e0e;border:1px solid #f5c6cb}
@media(max-width:480px){.container{margin:0;padding:14px} input,select,textarea{font-size:16px}}
</style>
</head>
<body>
<div class="container">
<h1>স্বেচ্ছাসেবক রেজিস্ট্রেশন</h1>
<p class="subtitle">Prasenjit Shop - বীরভূম</p>
<form id="volForm">
<label>নাম *</label><input type="text" name="name" required placeholder="আপনার পুরো নাম">
<label>পিতার নাম *</label><input type="text" name="father_name" required placeholder="পিতার নাম">
<div class="row"><div><label>জন্ম তারিখ</label><input type="date" name="dob"></div><div><label>লিঙ্গ</label><select name="gender"><option value="">সিলেক্ট করুন</option><option>পুরুষ</option><option>মহিলা</option></select></div></div>
<div class="row"><div><label>মোবাইল নং *</label><input type="tel" name="mobile" required placeholder="10 সংখ্যার মোবাইল" inputmode="numeric"></div><div><label>WhatsApp</label><input type="tel" name="whatsapp" placeholder="WhatsApp নম্বর"></div></div>
<label>পুরো ঠিকানা *</label><textarea name="full_address" required rows="2" placeholder="গ্রাম, পোস্ট, থানা"></textarea>
<div class="row"><div><label>জেলা</label><input type="text" name="district" value="বীরভূম"></div><div><label>বিধানসভা</label><input type="text" name="vidhansabha" placeholder="যেমন: সিউড়ি"></div></div>
<label>যোগ্যতা</label><input type="text" name="qualification" placeholder="শিক্ষাগত যোগ্যতা">
<label>অভিজ্ঞতা</label><input type="text" name="experience" placeholder="কাজের অভিজ্ঞতা">
<button type="submit" id="btn">রেজিস্টার করুন</button>
<div id="msg"></div>
</form>
<div style="margin-top:20px;text-align:center;"><small><a href="/status" style="color:#1a73e8">স্ট্যাটাস চেক করুন</a> | <a href="/admin" style="color:#666">Admin</a></small></div>
</div>
<script>
const form=document.getElementById('volForm');
const msg=document.getElementById('msg');
const btn=document.getElementById('btn');
form.addEventListener('submit',async(e)=>{
 e.preventDefault();
 btn.disabled=true; btn.innerText='পাঠানো হচ্ছে...'; msg.style.display='none';
 const data=Object.fromEntries(new FormData(form).entries());
 try{
  const res=await fetch('/api/volunteer/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  const json=await res.json();
  msg.style.display='block';
  if(json.success){
   msg.className='success';
   msg.innerHTML='✅ '+json.message+'<br>ID: <b>'+json.id+'</b>';
   form.reset();
  }else{msg.className='error'; msg.innerText='❌ '+json.message;}
 }catch(err){msg.style.display='block';msg.className='error';msg.innerText='❌ Server Error: '+err.message;}
 btn.disabled=false;btn.innerText='রেজিস্টার করুন';
});
</script>
</body>
</html>`;

// ========= CHANGE 2: Admin আর Status এর জন্য ছোট 2টো HTML যোগ =========
const ADMIN_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin</title><style>body{font-family:sans-serif;background:#f0f2f5;padding:10px}.box{max-width:900px;margin:auto;background:#fff;padding:15px;border-radius:8px}table{width:100%;border-collapse:collapse;font-size:13px}th,td{border:1px solid #ddd;padding:6px}th{background:#1a73e8;color:#fff}</style></head><body><div class="box"><h2>Admin Panel</h2><input id="t" placeholder="Admin Token" style="width:70%;padding:10px"><button onclick="load()" style="padding:10px">Load</button><div id="d" style="margin-top:10px;overflow:auto"></div><script>async function load(){let token=document.getElementById('t').value;let r=await fetch('/api/admin/volunteers',{headers:{'X-Admin-Token':token}});let j=await r.json();if(!j.success){document.getElementById('d').innerText=j.message;return;}let h='<table><tr><th>ID</th><th>নাম</th><th>মোবাইল</th><th>স্ট্যাটাস</th></tr>';j.data.forEach(x=>h+='<tr><td>'+x.id+'</td><td>'+x.name+'</td><td>'+x.mobile+'</td><td>'+x.status+'</td></tr>');h+='</table>';document.getElementById('d').innerHTML=h;}<\/script></div></body></html>`;

const STATUS_PAGE = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Status</title><style>body{font-family:sans-serif;background:#f0f2f5;padding:15px}.box{max-width:500px;margin:auto;background:#fff;padding:18px;border-radius:10px}input,button{width:100%;padding:14px;margin-top:10px;border-radius:8px;border:1px solid #ccc;box-sizing:border-box}button{background:#1a73e8;color:#fff;border:none}</style></head><body><div class="box"><h2>স্ট্যাটাস চেক</h2><input id="q" placeholder="ID বা মোবাইল"><button onclick="chk()">চেক</button><div id="r" style="margin-top:12px"></div><script>async function chk(){let q=document.getElementById('q').value.trim();if(!q)return;let res=await fetch('/api/volunteer/status/'+encodeURIComponent(q));let j=await res.json();document.getElementById('r').innerHTML=j.success?'<div style=background:#e6f4ea;padding:10px;border-radius:6px>ID:'+j.data.id+'<br>নাম:'+j.data.name+'<br>স্ট্যাটাস:'+j.data.status+'</div>':'<span style=color:red>'+j.message+'</span>';}let id=new URLSearchParams(location.search).get('id');if(id){document.getElementById('q').value=id;chk();}<\/script></div></body></html>`;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const headers = cors() as any;

    if (req.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    // CHANGE 3: নতুন 2টো রুট যোগ - তোমার আগের কোডে এটা ছিল না
    if (url.pathname === "/admin") {
      return new Response(ADMIN_PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
    if (url.pathname === "/status") {
      return new Response(STATUS_PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    if (url.pathname === "/api/volunteer/register" && req.method === "POST") {
      try {
        const d: any = await req.json();
        if (!d.name || !d.father_name || !d.mobile || !d.full_address) {
          return Response.json({ success: false, message: "নাম, পিতার নাম, মোবাইল ও ঠিকানা আবশ্যক" }, { headers });
        }
        const mobile = d.mobile.toString().trim().replace(/\s+/g, "");

        if (!/^[6-9]\d{9}$/.test(mobile)) {
          return Response.json({ success: false, message: "সঠিক 10 সংখ্যার মোবাইল দিন" }, { headers });
        }

        // CHANGE 4: এখানে .bind().first() যোগ - এটা তোমার বাগ ছিল
        const exists = await env.DB.prepare("SELECT id FROM volunteers WHERE mobile = ?").bind(mobile).first();
        if (exists) {
          return Response.json({ success: false, message: "এই মোবাইল নম্বর আগে আছে" }, { headers });
        }

        const id = generateId();
        await env.DB.prepare(
          "INSERT INTO volunteers (id, name, father_name, dob, gender, mobile, whatsapp, full_address, district, vidhansabha, qualification, experience, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))"
        ).bind(id, d.name, d.father_name, d.dob || "", d.gender || "", mobile, d.whatsapp || "", d.full_address, d.district || "বীরভূম", d.vidhansabha || "", d.qualification || "", d.experience || "").run();

        return Response.json({ success: true, id, message: "আবেদন সফল! আপনার ID সংরক্ষণ করুন।" }, { headers });

      } catch (e: any) {
        return Response.json({ success: false, message: "Server Error: " + e.message }, { headers });
      }
    }

    // CHANGE 5: স্ট্যাটাস API ঠিক - .bind(q,q).first() যোগ
    if (url.pathname.startsWith("/api/volunteer/status/")) {
      const q = decodeURIComponent(url.pathname.split("/").pop() || "").trim();
      if (!q) return Response.json({ success: false, message: "ID বা মোবাইল দিন" }, { headers });
      
      // এখানেই তোমার ID চেক হচ্ছিল না
      const row = await env.DB.prepare("SELECT id, name, mobile, status, district, created_at FROM volunteers WHERE id = ? OR mobile = ? LIMIT 1").bind(q, q).first();
      
      if (!row) {
        return Response.json({ success: false, message: "ID বা মোবাইল মিলল না" }, { headers });
      }
      return Response.json({ success: true, data: row }, { headers });
    }

    if (url.pathname === "/api/admin/volunteers") {
      const token = req.headers.get("X-Admin-Token") || url.searchParams.get("token");
      if (token !== env.ADMIN_TOKEN) {
        return Response.json({ success: false, message: "Unauthorized" }, { headers, status: 401 });
      }
      const { results } = await env.DB.prepare("SELECT * FROM volunteers ORDER BY created_at DESC LIMIT 200").all();
      return Response.json({ success: true, data: results }, { headers });
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(HTML_PAGE, {
        headers: { "Content-Type": "text/html; charset=utf-8", "Access-Control-Allow-Origin": "*" },
      });
    }

    return new Response(JSON.stringify({ message: "API OK" }), { headers });
  },
};
