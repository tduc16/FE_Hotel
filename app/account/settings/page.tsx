'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Settings, Bell, Globe, Trash2, ShieldAlert } from 'lucide-react';

export default function SettingsPage() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [promoNotif, setPromoNotif] = useState(true);
  const [language, setLanguage] = useState('vi');
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Cập nhật cài đặt thành công');
    }, 800);
  };

  const handleDeleteAccount = () => {
    const confirmation = prompt(
      'Để xác nhận xóa tài khoản, vui lòng nhập "DELETE" vào ô bên dưới. Hành động này không thể hoàn tác!'
    );
    if (confirmation === 'DELETE') {
      toast.error('Tính năng này chưa được kích hoạt trên hệ thống thử nghiệm.');
    } else if (confirmation !== null) {
      toast.error('Xác nhận không chính xác. Hủy thao tác.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Cài đặt tài khoản</h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý tùy chọn thông báo, ngôn ngữ và bảo mật tài khoản.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
            {/* Notifications Section */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-50">
                <Bell size={18} className="text-slate-400" />
                Tùy chọn thông báo
              </h2>

              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotif}
                    onChange={(e) => setEmailNotif(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded-sm border-slate-300 text-primary focus:ring-primary/20"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 block">Thông báo qua Email</span>
                    <span className="text-xs text-slate-400">Nhận thông tin cập nhật đặt phòng, hóa đơn và thay đổi trạng thái tài khoản.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsNotif}
                    onChange={(e) => setSmsNotif(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded-sm border-slate-300 text-primary focus:ring-primary/20"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 block">Thông báo qua tin nhắn SMS</span>
                    <span className="text-xs text-slate-400">Nhận tin nhắn cập nhật khẩn cấp hoặc mã xác nhận trực tiếp tới điện thoại.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promoNotif}
                    onChange={(e) => setPromoNotif(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded-sm border-slate-300 text-primary focus:ring-primary/20"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 block">Ưu đãi & Khuyến mãi</span>
                    <span className="text-xs text-slate-400">Không bỏ lỡ các chương trình giảm giá độc quyền, voucher mùa lễ hội của khách sạn.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Language Section */}
            <div className="space-y-4 pt-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-50">
                <Globe size={18} className="text-slate-400" />
                Ngôn ngữ hiển thị
              </h2>

              <div className="max-w-xs">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white text-sm transition-all"
                >
                  <option value="vi">Tiếng Việt (Vietnamese)</option>
                  <option value="en">Tiếng Anh (English)</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2 border-t border-slate-50">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/95 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-primary/15"
              >
                {saving ? 'Đang lưu...' : 'Lưu tùy chọn'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Danger Zone */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5 h-fit">
          <h2 className="text-base font-bold text-rose-600 flex items-center gap-2 pb-3 border-b border-slate-50">
            <ShieldAlert size={18} className="text-rose-500" />
            Vùng nguy hiểm
          </h2>

          <div className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Xóa tài khoản khách hàng đồng nghĩa với việc xóa vĩnh viễn dữ liệu đặt phòng, điểm thưởng tích lũy và voucher hiện có. Hành động này không thể khôi phục lại.
            </p>

            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-rose-200 text-sm font-bold text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
            >
              <Trash2 size={16} />
              Yêu cầu xóa tài khoản
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
