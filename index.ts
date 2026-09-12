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
        if (!d.name ||!d.father_name ||!d.mobile ||!d.full_address) {
          return Response.json({ success: false, message: "নাম, পিতার নাম, মোবাইল, ঠিকানা বাধ্যতামূলক" }, { headers });
        }
        const mobile = d.mobile.toString().trim().replace(/\s+/g, "");
        if (!/^[6-9]\d{9}$/.test(mobile)) {
          return Response.json({ success: false, message: "সঠিক ১০ সংখ্যার মোবাইল নম্বর দিন" }, { headers });
        }
        const exists = await env.DB.prepare("SELECT id FROM volunteers WHERE mobile =?").bind(mobile).first();
        if (exists) {
          return Response.json({ success: false, message: "এই মোবাইল নম্বর দিয়ে আগেই আবেদন করা হয়েছে" }, { headers });
        }
        const id = generateId();
        await env.DB.prepare(
          "INSERT INTO volunteers (id, name, father_name, dob, gender, mobile, full_address, district, status) VALUES (?,?,?,?,?,?,?,?, 'pending')"
        ).bind(id, d.name, d.father_name, d.dob || "", d.gender || "", mobile, d.full_address, d.district || "").run();
        return Response.json({ success: true, id, message: "আবেদন সফল!" }, { headers });
      } catch (e: any) {
        return Response.json({ success: false, message: "Server Error: " + e.message }, { status: 500, headers });
      }
    }

    if (url.pathname.startsWith("/api/volunteer/status/")) {
      const q = decodeURIComponent(url.pathname.split("/").pop() || "").trim();
      const row = await env.DB.prepare("SELECT id, name, mobile, status, created_at, district FROM volunteers WHERE id =? OR mobile =?").bind(q, q).first();
      if (!row) {
        return Response.json({ success: false, message: "ID বা মোবাইল নম্বর পাওয়া যায়নি" }, { headers });
      }
      return Response.json({ success: true, data: row }, { headers });
    }

    return new Response(JSON.stringify({ message: "API OK", endpoints: ["/api/volunteer/register", "/api/volunteer/status/:id"] }), { headers });
  }
};
