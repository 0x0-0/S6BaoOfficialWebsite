import { neon } from '@netlify/neon';
import bcrypt from 'bcryptjs';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { username, password } = await req.json();
    const sql = neon();
    const cleanUsername = username.replace(/[<>"'`;]/g, '');
    
    // 验证输入
    if (!cleanUsername || !password) {
      return new Response(JSON.stringify({ error: '所有字段都是必填的' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    await sql(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    `)
    // 检查用户名/邮箱是否已存在
    const existingUser = await sql`
      SELECT * FROM users 
      WHERE username = ${cleanUsername}
    `;
    
    if (existingUser.length > 0) {
      return new Response(JSON.stringify({ 
        error: '用户名或邮箱已被使用' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 哈希密码
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    
    // 创建用户
    const newUser = await sql`
      INSERT INTO users (username, password_hash)
      VALUES (${cleanUsername}, ${passwordHash})
      RETURNING id, username, created_at
    `;
    
    return new Response(JSON.stringify({ 
      success: true,
      user: newUser[0]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('注册错误:', error);
    return new Response(JSON.stringify({ 
      error: '服务器错误' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/auth/register',
  method: 'POST'
};