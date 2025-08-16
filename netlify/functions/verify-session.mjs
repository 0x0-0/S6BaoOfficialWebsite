import jwt from 'jsonwebtoken';

export default async (req) => {
  try {
    // 从Cookie或Authorization头获取令牌
    const token = req.headers.get('cookie')?.split(';')
      .find(c => c.trim().startsWith('authToken='))
      ?.split('=')[1];
    
    if (!token) {
      return new Response(JSON.stringify({ 
        error: '未提供身份验证令牌' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return new Response(JSON.stringify({ 
      success: true,
      user: decoded
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('会话验证错误:', error);
    return new Response(JSON.stringify({ 
      error: '无效或过期的令牌' 
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/auth/verify-session'
};