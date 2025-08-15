import jwt from 'jsonwebtoken';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    // 验证密码
    if (password !== adminPassword) {
      return new Response(JSON.stringify({ 
        error: '密码不正确' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 生成短期有效的JWT令牌
    const token = jwt.sign(
      { role: 'admin', accessTime: new Date().toISOString() },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    return new Response(JSON.stringify({ 
      success: true,
      token
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('密码验证错误:', error);
    return new Response(JSON.stringify({ 
      error: '服务器错误' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/admin/verify-password',
  method: 'POST'
};