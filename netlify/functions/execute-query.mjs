import { neon } from '@netlify/neon';
import jwt from 'jsonwebtoken';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 验证JWT令牌
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ 
        error: '未授权访问' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return new Response(JSON.stringify({ 
        error: '权限不足' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 解析请求
    const body = await req.json();
    const query = body.query;
    const sql = neon();
    
    // 执行SQL查询
    const result = await sql(query);
    
    return new Response(JSON.stringify({ 
      success: true,
      result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('SQL执行错误:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'SQL执行失败',
      details: process.env.NODE_ENV === 'development' ? error.stack : null
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/admin/execute-query',
  method: 'POST'
};