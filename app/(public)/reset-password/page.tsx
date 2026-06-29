'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { customerAuthService } from '@/services/customer-auth.service';
import toast from 'react-hot-toast';

const SERIF = { fontFamily: "var(--font-cormorant), Georgia, serif" };

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string; general?: string }>({});

  if (!token || !email) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 border border-red-200 bg-red-50 flex items-center justify-center mx-auto mb-6 rounded-full">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <p className="text-stone-850 font-semibold text-sm">Liên kết không hợp lệ</p>
        <p className="text-xs text-stone-500 mt-2 px-4 leading-relaxed">
          Đường dẫn khôi phục mật khẩu thiếu thông tin xác thực. Vui lòng kiểm tra lại email hoặc yêu cầu liên kết mới.
        </p>
        <div className="mt-8">
          <Link
            href="/forgot-password"
            className="inline-block px-6 py-3 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-semibold uppercase tracking-[0.2em] transition-all"
          >
            Yêu cầu liên kết mới
          </Link>
        </div>
      </div>
    );
  }

  const validate = () => {
    const e: typeof errors = {};
    if (!newPassword) {
      e.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (newPassword.length < 8) {
      e.newPassword = 'Mật khẩu mới phải từ 8 ký tự trở lên';
    }

    if (!confirmPassword) {
      e.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (newPassword !== confirmPassword) {
      e.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await customerAuthService.resetPassword({
        email,
        token,
        newPassword,
        confirmPassword,
      });
      setSuccess(true);
      toast.success('Đặt lại mật khẩu thành công!');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setErrors({ general: err.message || 'Mã khôi phục không hợp lệ hoặc đã hết hạn.' });
      toast.error(err.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 border border-green-200 bg-green-50 flex items-center justify-center mx-auto mb-6 rounded-full">
          <CheckCircle size={28} className="text-green-500" />
        </div>
        <p className="text-stone-850 font-semibold text-sm">Đặt lại mật khẩu thành công</p>
        <p className="text-xs text-stone-500 mt-2 px-4 leading-relaxed">
          Mật khẩu của quý khách đã được thay đổi. Hệ thống đang tự động chuyển hướng về trang đăng nhập...
        </p>
        <div className="mt-8">
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-semibold uppercase tracking-[0.2em] transition-all"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {errors.general && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-xs text-red-700 leading-relaxed rounded-r">
          <strong>Lỗi:</strong> {errors.general}
        </div>
      )}

      {/* New Password */}
      <div className="space-y-2">
        <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]">
          Mật khẩu mới (tối thiểu 8 ký tự)
        </label>
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type={showPass1 ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: undefined }));
              if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
            }}
            placeholder="••••••••"
            className={`w-full pl-10 pr-12 py-3 bg-[#F8F6F3] border border-stone-200 focus:border-[#C8A97E]/60 focus:ring-0 focus:outline-none text-sm text-stone-750 transition-colors ${errors.newPassword ? 'border-red-400' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPass1(!showPass1)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
          >
            {showPass1 ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.newPassword && <p className="mt-1 text-xs text-red-500 font-medium">{errors.newPassword}</p>}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]">
          Xác nhận mật khẩu mới
        </label>
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type={showPass2 ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
            }}
            placeholder="••••••••"
            className={`w-full pl-10 pr-12 py-3 bg-[#F8F6F3] border border-stone-200 focus:border-[#C8A97E]/60 focus:ring-0 focus:outline-none text-sm text-stone-750 transition-colors ${errors.confirmPassword ? 'border-red-400' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPass2(!showPass2)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
          >
            {showPass2 ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword}</p>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-semibold uppercase tracking-[0.2em] transition-all disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Đang xử lý...
          </span>
        ) : 'Đặt lại mật khẩu'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F3] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-stone-200/60 p-10 shadow-sm">
        {/* Logo */}
        <div className="flex flex-col leading-none mb-10 text-center">
          <span className="text-xl font-light tracking-widest text-stone-900" style={SERIF}>
            HOANG MINH
          </span>
          <span className="text-[8px] uppercase tracking-[0.35em] text-[#C8A97E] font-medium mt-1">
            Resort &amp; Hotel
          </span>
        </div>

        <h2 className="text-2xl font-light text-stone-950 mb-2 text-center" style={SERIF}>Đặt lại mật khẩu</h2>
        <p className="text-stone-400 text-xs uppercase tracking-wider mb-8 text-center">
          Tạo mật khẩu bảo mật mới cho tài khoản của bạn
        </p>

        <Suspense fallback={
          <div className="text-center py-8">
            <div className="w-8 h-8 rounded-full border-2 border-[#C8A97E]/30 border-t-[#C8A97E] animate-spin mx-auto"></div>
            <p className="text-xs text-stone-400 mt-3 font-medium">Đang tải thông tin xác thực...</p>
          </div>
        }>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
