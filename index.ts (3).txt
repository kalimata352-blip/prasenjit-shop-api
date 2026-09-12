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
    "Content-Type": "application/json"
  };
}

const HTML_PAGE = `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Prasenjit Shop - Volunteer Registration</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;font-family: 'Noto Sans Bengali', sans-serif;}
  body{background:#f0f2f5;padding:15px;}
  .container{max-width:600px;margin:20px auto;background:white;padding:25px;border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,0.1);}
  h1{text-align:center;color:#1a73e8;margin-bottom:5px;font-size:24px;}
  .subtitle{text-align:center;color:#666;margin-bottom:20px;font-size:14px;}
  label{display:block;margin-top:12px;font-weight:600;color:#333;font-size:14px;}
  input,select,textarea{width:100%;padding:12px;margin-top:5px;border:1px solid #ccc;border-radius:8px;font-size:15px;}
  input:focus,select:focus,textarea:focus{border-color:#1a73e8;outline:none;}
  .row{display:flex;gap:10px;}
  .row>div{flex:1;}
  button{width:100%;margin-top:20px;padding:14px;background:#1a73e8;color:white;border:none;border-radius:8px;font-size:16px;font-weight:bold;cursor:pointer;}
  button:hover{background:#1557b0;}
  #msg{margin-top:15px;padding:12px;border-radius:8px;display:none;text-align:center;font-weight:600;}
  .success{background:#d4edda;color:#155724;border:1px solid #c3e6cb;}
  .error{background:#f8d7da;color:#721c24;border:1px solid #f5c6cb;}
</style>
</head>
<body>
<div class="container">
  <h1>স্বেচ্ছাসেবক রেজিস্ট্রেশন</h1>
  <p class="subtitle">Prasenjit Shop - বীরভূম</p>
  <form id="volForm">
    <label>নাম *</label>
    <input type="text" name="name" required placeholder="আপনার পুরো নাম">
    
    <label>পিতার নাম *</label>
    <input type="text" name="father_name" required placeholder="পিতার নাম">
    
    <div class="row">
      <div><label>জন্ম তারিখ</label><input type="date" name="dob"></div>
      <div><label>লিঙ্গ</label>
        <select name="gender"><option value="">সিলেক্ট করুন</option><option value="পুরুষ">পুরুষ</option><option value="মহিলা">মহিলা</option><option value="অন্যান্য">অন্যান্য</option></select>
      </div>
    </div>
    
    <div class="row">
      <div><label>মোবাইল নং *</label><input type="tel" name="mobile" required placeholder="10 সংখ্যার মোবাইল" pattern="[6-9][0-9]{9}"></div>
      <div><label>WhatsApp</label><input type="tel" name="whatsapp" placeholder="WhatsApp নম্বর"></div>
    </div>
    
    <label>পুরো ঠিকানা *</label>
    <textarea name="full_address" required rows="2" placeholder="গ্রাম, পোস্ট, থানা"></textarea>
    
    <div class="row">
      <div><label>জেলা</label><input type="text" name="district" value="বীরভূম"></div>
      <div><label>বিধানসভা</label><input type="text" name="assembly" placeholder="যেমন: সিউড়ি"></div>
    </div>
    
    <label>যোগ্যতা</label>
    <input type="text" name="qualification" placeholder="শিক্ষাগত যোগ্যতা">
    
    <label>অভিজ্ঞতা</label>
    <input type="text" name="experience" placeholder="কাজের অভিজ্ঞতা">
    
    <button type="submit" id="btn">রেজিস্টার করুন</button>
    <div id="msg"></div>
  </form>
  
  <div style="margin-top:20px;text-align:center;">
    <small><a href="/api/volunteer/status/" id="statusLink" style="color:#1a73e8;">স্ট্যাটাস চেক করুন</a></small>
  </div>
</div>

<script>
const form = document.getElementById('volForm');
const msg = document.getElementById('msg');
const btn = document.getElementById('btn');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  btn.disabled = true;
  btn.innerText = 'পাঠানো হচ্ছে...';
  msg.style.display = 'none';
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    const res = await fetch('/api/volunteer/register', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    const json = await res.json();
    msg.style.display = 'block';
    if(json.success){
      msg.className = 'success';
      msg.innerHTML = '✅ ' + json.message + '<br>ID: <b>' + json.id + '</b>';
      form.reset();
    } else {
      msg.className = 'error';
      msg.innerText = '❌ ' + json.message;
    }
  } catch(err){
    msg.style.display = 'block';
    msg.className = 'error';
    msg.innerText = '❌ Server Error: ' + err.message;
  }
  btn.disabled = false;
  btn.innerText = 'রেজিস্টার করুন';
});
</script>
</body>
</html>`;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const headers = cors() as any;

    if (req.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (url.pathname === "/api/volunteer/register" && req.method === "POST") {
      try {
        const d: any = await req.json();
        if (!d.name || !d.father_name || !d.mobile || !d.full_address) {
          return Response.json({ success: false, message: "নাম, পিতার নাম, মোবাইল, ঠিকানা আবশ্যক" }, { headers });
        }
        const mobile = d.mobile.toString().trim().replace(/\s+/g, "");
        if (!/^[6-9]\d{9}$/.test(mobile)) {
          return Response.json({ success: false, message: "সঠিক 10 সংখ্যার মোবাইল দিন" }, { headers });
        }
        const exists = await env.DB.prepare("SELECT id FROM volunteers WHERE mobile = ?").bind(mobile).first();
        if (exists) {
          return Response.json({ success: false, message: "এই মোবাইল নম্বর দিয়ে আগেই রেজিস্টার করা আছে" }, { headers });
        }
        const id = generateId();
        await env.DB.prepare(
          "INSERT INTO volunteers (id, name, father_name, dob, gender, mobile, whatsapp, full_address, district, assembly, qualification, experience, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')"
        ).bind(id, d.name, d.father_name, d.dob || "", d.gender || "", mobile, d.whatsapp || "", d.full_address, d.district || "বীরভূম", d.assembly || "", d.qualification || "", d.experience || "").run();
        return Response.json({ success: true, id, message: "আবেদন সফল! আপনার ID সংরক্ষণ করুন।" }, { headers });
      } catch (e: any) {
        return Response.json({ success: false, message: "Server Error: " + e.message }, { headers });
      }
    }

    if (url.pathname.startsWith("/api/volunteer/status/")) {
      const q = decodeURIComponent(url.pathname.split("/").pop() || "").trim();
      if(!q) return Response.json({ success: false, message: "ID বা মোবাইল দিন" }, {headers});
      const row = await env.DB.prepare("SELECT id, name, mobile, status, created_at FROM volunteers WHERE id = ? OR mobile = ?").bind(q, q).first();
      if (!row) {
        return Response.json({ success: false, message: "ID বা মোবাইল নম্বর খুঁজে পাওয়া যায়নি" }, { headers });
      }
      return Response.json({ success: true, data: row }, { headers });
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(HTML_PAGE, {
        headers: { "Content-Type": "text/html; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    return new Response(JSON.stringify({ message: "API OK", endpoints: ["/api/volunteer/register", "/api/volunteer/status/:id"] }), { headers });
  },
};
