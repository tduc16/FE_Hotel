"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Route protection - Redirect if already logged in
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await authService.login(username, password);
      // Ensure token exists in response payload
      // According to backend it might return access_token
      const token = data.access_token || data.token;
      if (token) {
        localStorage.setItem("access_token", token);
      }
      
      // Attempt to save user info if backend provided it
      // Otherwise save basic info
      const userInfo = {
        username: username,
        role: "admin",
        ...data.user
      };
      localStorage.setItem("admin_info", JSON.stringify(userInfo));

      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest w-full max-w-md p-8 rounded-lg shadow-[0_12px_40px_rgba(24,28,31,0.06)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-headline font-semibold tracking-tight text-on-surface mb-2">
            Đăng nhập quản trị
          </h1>
          <p className="text-on-surface-variant font-body">
            Vui lòng nhập thông tin để truy cập hệ thống.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded bg-error-container text-on-error-container text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="username" 
              className="block text-xs font-label uppercase tracking-wider text-on-surface-variant mb-2"
            >
              Tên đăng nhập hoặc Email
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-highest rounded text-on-surface focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/20"
              placeholder="Nhập tên hoặc email..."
              disabled={loading}
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-xs font-label uppercase tracking-wider text-on-surface-variant mb-2"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-highest rounded text-on-surface focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/20"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary text-on-primary rounded font-semibold transition-all hover:bg-primary-container disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>Đăng nhập</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
