import { neon } from "@netlify/neon";

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { name, arrangement } = await req.json();
    // 输入验证
    if (!name || typeof name !== 'string' || name.length > 30) {
    return new Response(JSON.stringify({ error: '无效的昵称' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
    });
    }

    // 清理输入（移除HTML标签和特殊字符）
    const cleanName = name.replace(/[<>"'`;]/g, '');
    const sql = neon();
    
    // 确保表存在
    await sql(`
      CREATE TABLE IF NOT EXISTS arrangements (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        arrangement TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 检查是否已投稿
    const exist = await sql`SELECT id FROM arrangements WHERE name = ${name} LIMIT 1`;
    if (exist.length > 0) {
      return new Response(JSON.stringify({ error: '每个账号只能投稿一次' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 插入新投稿
    await sql`
      INSERT INTO arrangements (name, arrangement)
      VALUES (${name}, ${arrangement})
    `;
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error saving arrangement:', error);
    return new Response(JSON.stringify({ error: 'Failed to save arrangement' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/save-arrangement',
  method: 'POST'
};