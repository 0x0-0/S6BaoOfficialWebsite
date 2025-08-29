import { neon } from "@netlify/neon";

export default async () => {
  try {
    const sql = neon();
    await sql(`
      CREATE TABLE IF NOT EXISTS requirements (
        id SERIAL PRIMARY KEY,
        requirements TEXT NOT NULL
      )
    `);
    const rows = await sql`SELECT requirements FROM requirements ORDER BY id DESC LIMIT 1`;
    return new Response(JSON.stringify({ requirements: rows[0]?.requirements || "" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ requirements: "" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/get-requirements'
};