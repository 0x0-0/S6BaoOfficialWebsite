import { neon } from '@netlify/neon';

export default async (req) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: '缺少提案ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const sql = neon();
    await sql`CREATE TABLE IF NOT EXISTS proposals (
        id SERIAL PRIMARY KEY,
        author VARCHAR(50) NOT NULL,
        title VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        tags VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;
    await sql`CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        proposal_id INTEGER NOT NULL REFERENCES proposals(id),
        author VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;
    const proposal = await sql`SELECT * FROM proposals WHERE id = ${id}`;
    const comments = await sql`SELECT * FROM comments WHERE proposal_id = ${id} ORDER BY created_at ASC`;
    return new Response(JSON.stringify({ proposal: proposal[0], comments }), {
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
  path: '/api/proposal/detail',
  method: 'GET'
};