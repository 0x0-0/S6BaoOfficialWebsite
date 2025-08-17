import { neon } from '@netlify/neon';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    const { proposal_id, username } = await req.json();
    if (!proposal_id || !username) {
      return new Response(JSON.stringify({ error: '参数缺失' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const sql = neon();
    // 检查是否为作者
    const proposal = await sql`SELECT author FROM proposals WHERE id = ${proposal_id}`;
    if (!proposal[0] || proposal[0].author !== username) {
      return new Response(JSON.stringify({ error: '无权限删除' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // 删除评论
    await sql`DELETE FROM comments WHERE proposal_id = ${proposal_id}`;
    // 删除提案
    await sql`DELETE FROM proposals WHERE id = ${proposal_id}`;
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
  path: '/api/proposal/delete',
  method: 'POST'
};