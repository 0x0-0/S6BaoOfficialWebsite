import { neon } from "@netlify/neon";

export default async (req, context) => {
  if (req.method !== 'DELETE') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const id = context.params.id;
    const sql = neon();
    //id为-1:全部删除
    if (id === '-1') {
      await sql`
        DELETE FROM arrangements
      `;
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // 删除投稿
    const result = await sql`
      DELETE FROM arrangements 
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return new Response(JSON.stringify({ error: '投稿不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting arrangement:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete arrangement' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/delete-arrangement/:id',
  method: 'DELETE'
};