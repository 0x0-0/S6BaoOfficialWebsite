import { neon } from '@netlify/neon';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    const { proposal_id, author, content } = await req.json();
    if (!proposal_id || !author || !content) {
      return new Response(JSON.stringify({ error: '所有字段都是必填的' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const sql = neon();
    await sql`CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        proposal_id INTEGER NOT NULL REFERENCES proposals(id),
        author VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;
    await sql`
      INSERT INTO comments (proposal_id, author, content)
      VALUES (${proposal_id}, ${author}, ${content})
    `;
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '服务器错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/proposal/comment',
  method: 'POST'
};