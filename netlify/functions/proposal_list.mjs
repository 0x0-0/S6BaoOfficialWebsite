import { neon } from '@netlify/neon';

export default async (req) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    const sql = neon();
    await sql`CREATE TABLE IF NOT EXISTS proposals (
        id SERIAL PRIMARY KEY,
        author VARCHAR(50) NOT NULL,
        title VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        tags VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
    const proposals = await sql`SELECT id, author, title, tags, created_at FROM proposals ORDER BY created_at DESC`;
    return new Response(JSON.stringify({ proposals }), {
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
  path: '/api/proposal/list',
  method: 'GET'
};