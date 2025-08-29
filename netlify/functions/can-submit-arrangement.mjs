import { neon } from "@netlify/neon";

export default async (req) => {
  const sql = neon();
  await sql(`
    CREATE TABLE IF NOT EXISTS submit_switch (
      id SERIAL PRIMARY KEY,
      can_submit BOOLEAN NOT NULL
    )
  `);
  if (req.method === 'POST') {
    const { canSubmit } = await req.json();
    await sql`INSERT INTO submit_switch (can_submit) VALUES (${!!canSubmit})`;
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    const rows = await sql`SELECT can_submit FROM submit_switch ORDER BY id DESC LIMIT 1`;
    return new Response(JSON.stringify({ canSubmit: rows[0]?.can_submit ?? true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/can-submit-arrangement'
};