import { neon } from '@netlify/neon';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
    await sql(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    `)
    // 查找用户
    const users = await sql`
      SELECT * FROM users WHERE username = ${username}
    `;
    
    if (users.length === 0) {
      return new Response(JSON.stringify({ 
        error: '用户名或密码不正确' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const user = users[0];
    
    // 验证密码
    if (!bcrypt.compareSync(password, user.password_hash)) {
      return new Response(JSON.stringify({ 
        error: '用户名或密码不正确' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // 更新最后登录时间
    await sql`
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP 
      WHERE id = ${user.id}
    `;
    
    return new Response(JSON.stringify({ 
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
      }
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Set-Cookie': `authToken=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure' : ''}`
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    return new Response(JSON.stringify({ 
      error: '服务器错误' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/auth/login',
  method: 'POST'
};