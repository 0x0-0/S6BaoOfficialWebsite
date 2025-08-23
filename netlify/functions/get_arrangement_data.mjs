import { neon } from "@netlify/neon";
import jwt from "jsonwebtoken";

export default async (req) => {
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
    const url = new URL(req.url);
    const query = url.searchParams.get('query') || '';
    const sql = neon();
    await sql(`
      CREATE TABLE IF NOT EXISTS arrangement_data (
        id SERIAL PRIMARY KEY,
        arrangement TEXT NOT NULL,
        times INTEGER[] NOT NULL DEFAULT '{}'
      )
    `);
    let rows;
    if (query) {
      rows = await sql`SELECT arrangement, times FROM arrangement_data WHERE arrangement LIKE ${'%' + query + '%'}`;
    } else {
      rows = await sql`SELECT arrangement, times FROM arrangement_data`;
    }
    // 计算平均时长
    const data = rows.map(row => ({
      arrangement: row.arrangement,
      times: row.times,
      avgTime: row.times.length ? row.times.reduce((a, b) => a + b, 0) / row.times.length : 0
    }));
    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error querying arrangement data:', error);
    return new Response(JSON.stringify({ error: 'Failed to query arrangement data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/admin/query-arrangement-data'
};