import { neon } from "@netlify/neon";

export default async () => {
  try {
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
    
    // 获取所有投稿
    const arrangements = await sql`
      SELECT id, name, arrangement, created_at 
      FROM arrangements 
      ORDER BY created_at DESC
    `;
    
    return new Response(JSON.stringify(arrangements), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting arrangements:', error);
    return new Response(JSON.stringify({ error: 'Failed to get arrangements' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/get-arrangements'
};