import { neon } from '@netlify/neon';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 这里假设你有用户会话验证，获取当前用户
    const { author, title, content, tags } = await req.json();
    if (!author || !title || !content || !tags) {
      return new Response(JSON.stringify({ error: '所有字段都是必填的' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // 标签必须包含分类
    const validCategories = ['植物提案', '僵尸提案', '其他'];
    if (!validCategories.some(cat => tags.includes(cat))) {
      return new Response(JSON.stringify({ error: '标签必须包含分类' }), {
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
    const result = await sql`
      INSERT INTO proposals (author, title, content, tags)
      VALUES (${author}, ${title}, ${content}, ${tags})
      RETURNING id
    `;
    return new Response(JSON.stringify({ success: true, id: result[0].id }), {
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
  path: '/api/proposal/submit',
  method: 'POST'
};