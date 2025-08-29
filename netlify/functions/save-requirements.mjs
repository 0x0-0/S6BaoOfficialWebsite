import { neon } from "@netlify/neon";

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }
  try {
    const { requirements } = await req.json();
    const sql = neon();
    await sql(`
      CREATE TABLE IF NOT EXISTS requirements (
        id SERIAL PRIMARY KEY,
        requirements TEXT NOT NULL
      )
    `);
    await sql`INSERT INTO requirements (requirements) VALUES (${requirements})`;
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '保存失败' }), { status: 500 });
  }
};

export const config = {
  path: '/api/save-requirements',
  method: 'POST'
};