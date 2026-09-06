export default {
  async fetch(request, env) {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    const url = new URL(request.url);

    if (url.pathname === "/api/products") {
      if (request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM products ORDER BY id DESC").all();
        return new Response(JSON.stringify(results), {
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }
      if (request.method === "POST") {
        const data = await request.json();
        await env.DB.prepare("INSERT INTO products (name, price, image) VALUES (?, ?, ?)")
          .bind(data.name, data.price, data.image || '').run();
        return new Response(JSON.stringify({ success: true }), { headers });
      }
    }
    return new Response("API OK - Use /api/products", { headers });
  }
}
