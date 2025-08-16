var currentUser = null;

// 检查登录状态
export async function checkAuth() {
  try {
    const response = await fetch('/api/auth/verify-session', {
      credentials: 'include' // 包含Cookie
    });
    
    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      return true;
    }
    return false;
  } catch (error) {
    console.error('验证会话失败:', error);
    return false;
  }
}

// 获取当前用户
export function getCurrentUser() {
  return currentUser;
}

// 登录
export async function login(username, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      return true;
    }
    return false;
  } catch (error) {
    console.error('登录失败:', error);
    return false;
  }
}

// 登出
export async function logout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    currentUser = null;
    return true;
  } catch (error) {
    console.error('登出失败:', error);
    return false;
  }
}