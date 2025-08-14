import { neon } from "@netlify/neon";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { name, content } = await req.json();
    const sql = neon();
    await sql(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // 添加简单的XSS防护
    const sanitizedName = name.replace(/<[^>]*>/g, "");
    const sanitizedContent = content.replace(/<[^>]*>/g, "");
    
    await sql`
      INSERT INTO comments (name, content, created_at)
      VALUES (${sanitizedName}, ${sanitizedContent}, NOW())
    `;
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Failed to save comment:", error);
    return new Response(JSON.stringify({ error: "Failed to save comment" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = {
  path: "/api/add-comment",
  method: "POST"
};