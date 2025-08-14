import { neon } from "@netlify/neon";

export default async () => {
  const sql = neon();
  
  try {
    // 创建评论表
    await sql(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    return new Response("Database migrated successfully", { status: 200 });
  } catch (error) {
    console.error("Migration failed:", error);
    return new Response("Database migration failed", { status: 500 });
  }
};

export const config = {
  path: "/api/migrate-db"
};