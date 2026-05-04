export const authService = {
  login: async (username: string, password: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/admin/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      let errorMessage = "Đăng nhập thất bại";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // use default error message
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },
  
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("admin_info");
    }
  },
  
  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token");
    }
    return null;
  },

  getAdminInfo: () => {
    if (typeof window !== "undefined") {
      const info = localStorage.getItem("admin_info");
      return info ? JSON.parse(info) : null;
    }
    return null;
  }
};
