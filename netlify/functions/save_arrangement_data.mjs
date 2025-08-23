import { neon } from "@netlify/neon";
import jwt from "jsonwebtoken";

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 管理员鉴权
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: '未授权' }), { status: 401 });
  }
  const token = auth.replace('Bearer ', '');
  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return new Response(JSON.stringify({ error: '无效token' }), { status: 401 });
  }

  try {
    const { arrangement, time } = await req.json();
    if (!arrangement || arrangement.length !== 5 || typeof time !== 'number' || time <= 0) {
      return new Response(JSON.stringify({ error: '参数错误' }), { status: 400 });
    }
    const sql = neon();
    // 表结构：arrangement_data(arrangement TEXT, times INTEGER[])
    await sql(`
      CREATE TABLE IF NOT EXISTS arrangement_data (
        id SERIAL PRIMARY KEY,
        arrangement TEXT NOT NULL,
        times INTEGER[] NOT NULL DEFAULT '{}'
      )
    `);
    // 查找是否已存在该阵容
    const exist = await sql`SELECT id, times FROM arrangement_data WHERE arrangement = ${arrangement} LIMIT 1`;
    if (exist.length > 0) {
      // 更新times数组
      const newTimes = [...exist[0].times, time];
      await sql`UPDATE arrangement_data SET times = ${newTimes} WHERE id = ${exist[0].id}`;
    } else {
      console.log(1);
      await sql`INSERT INTO arrangement_data (arrangement, times) VALUES (${arrangement}, ARRAY[${time}]::integer[])`;
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error uploading arrangement data:', error);
    return new Response(JSON.stringify({ error: 'Failed to upload arrangement data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/admin/upload-arrangement-data',
  method: 'POST'
};