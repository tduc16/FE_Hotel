const AUTH_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const authService = {
  login: async (username: string, password: string) => {
    const url = `${AUTH_BASE}/admin/auth/login`;
    console.log('[authService] POST', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      let errorMessage = 'Đăng nhập thất bại';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // dùng message mặc định
      }
      console.error(`[authService] Login thất bại HTTP ${response.status}:`, errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('[authService] Login thành công');

    // Lưu token vào localStorage sau khi đăng nhập thành công
    if (typeof window !== 'undefined') {
      const token = data?.access_token ?? data?.token;
      if (token) {
        localStorage.setItem('admin_access_token', token);
        console.log('[authService] Token đã lưu vào localStorage (admin_access_token)');
      }
      if (data?.admin) {
        localStorage.setItem('admin_info', JSON.stringify(data.admin));
      }
    }

    return data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_info');
      console.log('[authService] Đã đăng xuất, xóa token');
    }
  },

  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_access_token');
    }
    return null;
  },

  getAdminInfo: () => {
    if (typeof window !== 'undefined') {
      const info = localStorage.getItem('admin_info');
      return info ? JSON.parse(info) : null;
    }
    return null;
  },
};
