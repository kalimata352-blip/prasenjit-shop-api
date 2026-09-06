export default {
  async fetch(request, env) {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    const url = new URL(request.url);

    if (url.pathname === "/api/products") {
      if (request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM products").all();
        return Response.json(results, { headers });
      }

      if (request.method === "POST") {
        const d = await request.json();
        await env.DB.prepare(
          "INSERT INTO products (name, price, image) VALUES (?, ?, ?)"
        ).bind(d.name, d.price, d.image).run();
        return Response.json({ success: true }, { headers });
      }
    }

    // /api/products ছাড়া অন্য কোথাও গেলে আর World লেখা আসবে না
    return new Response(
      JSON.stringify({ message: "Prasenjit Shop API is Running. Use /api/products" }),
      { status: 200, headers }
    );
  }
}
