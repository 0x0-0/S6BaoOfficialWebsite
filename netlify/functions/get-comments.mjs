import { neon } from "@netlify/neon";

export default async () => {
  const sql = neon();
  
  try {
    const comments = await sql("SELECT * FROM comments ORDER BY created_at DESC");
    return new Response(JSON.stringify(comments), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Database error:", error);
    return new Response(JSON.stringify({ error: "Database error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = {
  path: "/api/comments"
};