"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { adminVoucherService } from "@/services/admin-voucher.service";
import toast from "react-hot-toast";
import { 
  Ticket, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Calendar, 
  Users, 
  DollarSign, 
  ToggleLeft, 
  ToggleRight, 
  X,
  Info,
  Clock
} from "lucide-react";

export default function AdminVouchersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [applicableFilter, setApplicableFilter] = useState<string>("all");

  // Stats
  const [stats, setStats] = useState({
    totalVouchers: 0,
    activeVouchers: 0,
    expiredVouchers: 0,
    totalUsages: 0,
  });

  // Modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any | null>(null);

  // Form State
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDiscountType, setFormDiscountType] = useState("PERCENT");
  const [formDiscountValue, setFormDiscountValue] = useState<number>(10);
  const [formMaxDiscountAmount, setFormMaxDiscountAmount] = useState<number | "">("");
  const [formMinBookingAmount, setFormMinBookingAmount] = useState<number | "">("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formUsageLimit, setFormUsageLimit] = useState<number | "">("");
  const [formUsageLimitPerCustomer, setFormUsageLimitPerCustomer] = useState<number | "">("");
  const [formApplicableTo, setFormApplicableTo] = useState("ALL");
  const [formRequiredMembershipLevel, setFormRequiredMembershipLevel] = useState("STANDARD");
  const [formRequiredBookingCount, setFormRequiredBookingCount] = useState<number | "">("");
  const [formRequiredTotalSpent, setFormRequiredTotalSpent] = useState<number | "">("");
  const [formStatus, setFormStatus] = useState("ACTIVE");
  const [formIsPublic, setFormIsPublic] = useState(false);

  // Modal Usages (Lịch sử sử dụng)
  const [isUsagesModalOpen, setIsUsagesModalOpen] = useState(false);
  const [selectedVoucherForUsages, setSelectedVoucherForUsages] = useState<any | null>(null);
  const [usagesList, setUsagesList] = useState<any[]>([]);
  const [loadingUsages, setLoadingUsages] = useState(false);

  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchVouchers();
  }, [router, page, statusFilter, typeFilter, applicableFilter]);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const queryParams: any = {
        page,
        limit,
        search: search.trim() || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        discountType: typeFilter !== "all" ? typeFilter : undefined,
        applicableTo: applicableFilter !== "all" ? applicableFilter : undefined,
      };

      const res = await adminVoucherService.getVouchers(queryParams);
      
      const list = res.data || [];
      setVouchers(list);
      setTotal(res.meta?.total || list.length);

      // Tính toán stats từ danh sách (hoặc fetch từ DB nếu có api, tạm tính từ list hiện tại và tổng)
      const todayStr = new Date().toISOString().substring(0, 10);
      let active = 0;
      let expired = 0;
      let usages = 0;

      list.forEach((v: any) => {
        if (v.status === "ACTIVE" && todayStr <= v.endDate) active++;
        if (todayStr > v.endDate) expired++;
        usages += v.usedCount || 0;
      });

      setStats({
        totalVouchers: res.meta?.total || list.length,
        activeVouchers: active,
        expiredVouchers: expired,
        totalUsages: usages,
      });

    } catch (err: any) {
      if (err.message === "UNAUTHORIZED") {
        authService.logout();
        router.push("/admin/login");
      } else {
        toast.error("Không thể tải danh sách khuyến mãi");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVouchers();
  };

  const handleOpenCreateModal = () => {
    const today = new Date().toISOString().substring(0, 10);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().substring(0, 10);

    setEditingVoucher(null);
    setFormCode("");
    setFormName("");
    setFormDescription("");
    setFormDiscountType("PERCENT");
    setFormDiscountValue(10);
    setFormMaxDiscountAmount("");
    setFormMinBookingAmount("");
    setFormStartDate(today);
    setFormEndDate(nextMonthStr);
    setFormUsageLimit("");
    setFormUsageLimitPerCustomer("");
    setFormApplicableTo("ALL");
    setFormRequiredMembershipLevel("STANDARD");
    setFormRequiredBookingCount("");
    setFormRequiredTotalSpent("");
    setFormStatus("ACTIVE");
    setFormIsPublic(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (voucher: any) => {
    setEditingVoucher(voucher);
    setFormCode(voucher.code);
    setFormName(voucher.name);
    setFormDescription(voucher.description || "");
    setFormDiscountType(voucher.discountType);
    setFormDiscountValue(Number(voucher.discountValue));
    setFormMaxDiscountAmount(voucher.maxDiscountAmount ? Number(voucher.maxDiscountAmount) : "");
    setFormMinBookingAmount(voucher.minBookingAmount ? Number(voucher.minBookingAmount) : "");
    setFormStartDate(voucher.startDate);
    setFormEndDate(voucher.endDate);
    setFormUsageLimit(voucher.usageLimit ? Number(voucher.usageLimit) : "");
    setFormUsageLimitPerCustomer(voucher.usageLimitPerCustomer ? Number(voucher.usageLimitPerCustomer) : "");
    setFormApplicableTo(voucher.applicableTo);
    setFormRequiredMembershipLevel(voucher.requiredMembershipLevel || "STANDARD");
    setFormRequiredBookingCount(voucher.requiredBookingCount ? Number(voucher.requiredBookingCount) : "");
    setFormRequiredTotalSpent(voucher.requiredTotalSpent ? Number(voucher.requiredTotalSpent) : "");
    setFormStatus(voucher.status);
    setFormIsPublic(voucher.isPublic);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await adminVoucherService.updateVoucherStatus(id, newStatus);
      toast.success("Cập nhật trạng thái khuyến mãi thành công");
      fetchVouchers();
    } catch (err: any) {
      toast.error(err.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleDeleteVoucher = async (id: string, code: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa voucher ${code}?`)) return;
    try {
      await adminVoucherService.deleteVoucher(id);
      toast.success("Xóa voucher thành công");
      fetchVouchers();
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa voucher");
    }
  };

  const handleOpenUsagesModal = async (voucher: any) => {
    setSelectedVoucherForUsages(voucher);
    setIsUsagesModalOpen(true);
    setLoadingUsages(true);
    try {
      const res = await adminVoucherService.getVoucherUsages(voucher.id);
      setUsagesList(res.data || []);
    } catch (err: any) {
      toast.error("Không thể tải lịch sử sử dụng voucher");
    } finally {
      setLoadingUsages(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCode.trim()) {
      toast.error("Vui lòng nhập mã voucher");
      return;
    }
    if (!formName.trim()) {
      toast.error("Vui lòng nhập tên voucher");
      return;
    }
    if (formDiscountValue <= 0) {
      toast.error("Giá trị giảm phải lớn hơn 0");
      return;
    }
    if (formDiscountType === "PERCENT" && formDiscountValue > 100) {
      toast.error("Tỷ lệ phần trăm giảm tối đa là 100%");
      return;
    }
    if (!formStartDate || !formEndDate) {
      toast.error("Vui lòng chọn thời hạn áp dụng");
      return;
    }
    if (new Date(formEndDate) < new Date(formStartDate)) {
      toast.error("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu");
      return;
    }

    const payload: any = {
      code: formCode.toUpperCase().trim(),
      name: formName.trim(),
      description: formDescription.trim() || undefined,
      discountType: formDiscountType,
      discountValue: Number(formDiscountValue),
      maxDiscountAmount: formMaxDiscountAmount !== "" ? Number(formMaxDiscountAmount) : null,
      minBookingAmount: formMinBookingAmount !== "" ? Number(formMinBookingAmount) : null,
      startDate: formStartDate,
      endDate: formEndDate,
      usageLimit: formUsageLimit !== "" ? Number(formUsageLimit) : null,
      usageLimitPerCustomer: formUsageLimitPerCustomer !== "" ? Number(formUsageLimitPerCustomer) : null,
      applicableTo: formApplicableTo,
      requiredMembershipLevel: formApplicableTo === "MEMBERSHIP_LEVEL" ? formRequiredMembershipLevel : null,
      requiredBookingCount: formRequiredBookingCount !== "" ? Number(formRequiredBookingCount) : null,
      requiredTotalSpent: formRequiredTotalSpent !== "" ? Number(formRequiredTotalSpent) : null,
      status: formStatus,
      isPublic: formIsPublic,
    };

    try {
      if (editingVoucher) {
        await adminVoucherService.updateVoucher(editingVoucher.id, payload);
        toast.success("Cập nhật voucher thành công");
      } else {
        await adminVoucherService.createVoucher(payload);
        toast.success("Tạo voucher mới thành công");
      }
      setIsModalOpen(false);
      fetchVouchers();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi lưu voucher");
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return "—";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Ticket className="text-primary" />
            Quản lý Khuyến mãi / Voucher
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý các chương trình ưu đãi, mã giảm giá công khai hoặc theo hạng thành viên.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary/95 transition-all shadow-xs"
        >
          <Plus size={18} />
          Thêm Voucher mới
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <Ticket size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Tổng Voucher</p>
            <h3 className="text-xl font-bold text-slate-700 mt-1">{stats.totalVouchers}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Đang hoạt động</p>
            <h3 className="text-xl font-bold text-slate-700 mt-1">{stats.activeVouchers}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Đã hết hạn</p>
            <h3 className="text-xl font-bold text-slate-700 mt-1">{stats.expiredVouchers}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Tổng lượt sử dụng</p>
            <h3 className="text-xl font-bold text-slate-700 mt-1">{stats.totalUsages}</h3>
          </div>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo code, tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Tạm ngừng</option>
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
            >
              <option value="all">Tất cả loại giảm</option>
              <option value="PERCENT">Giảm theo %</option>
              <option value="FIXED_AMOUNT">Giảm số tiền cố định</option>
            </select>
          </div>

          <div>
            <select
              value={applicableFilter}
              onChange={(e) => setApplicableFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
            >
              <option value="all">Tất cả đối tượng</option>
              <option value="ALL">Mọi đối tượng</option>
              <option value="MEMBER_ONLY">Chỉ Thành viên</option>
              <option value="GUEST_ONLY">Chỉ Khách vãng lai</option>
              <option value="MEMBERSHIP_LEVEL">Theo hạng thành viên</option>
            </select>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Đang tải danh sách khuyến mãi...</p>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket size={28} className="text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">Không tìm thấy voucher</h3>
            <p className="text-sm text-slate-500 mt-1">
              Thử thay đổi bộ lọc tìm kiếm hoặc tạo voucher mới.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-5">Code / Tên</th>
                  <th className="py-4 px-5">Loại giảm</th>
                  <th className="py-4 px-5">Giá trị</th>
                  <th className="py-4 px-5">Thời hạn</th>
                  <th className="py-4 px-5">Đã dùng / Giới hạn</th>
                  <th className="py-4 px-5">Công khai</th>
                  <th className="py-4 px-5">Trạng thái</th>
                  <th className="py-4 px-5 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm text-slate-600">
                {vouchers.map((voucher) => {
                  const todayStr = new Date().toISOString().substring(0, 10);
                  const isExpired = todayStr > voucher.endDate;

                  return (
                    <tr key={voucher.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 tracking-wide">{voucher.code}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{voucher.name}</div>
                      </td>
                      <td className="py-4 px-5">
                        {voucher.discountType === "PERCENT" ? (
                          <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                            Phần trăm (%)
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700">
                            Số tiền cố định
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-800">
                          {voucher.discountType === "PERCENT" 
                            ? `${Number(voucher.discountValue)}%` 
                            : formatPrice(Number(voucher.discountValue))}
                        </div>
                        {voucher.maxDiscountAmount && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Tối đa: {formatPrice(Number(voucher.maxDiscountAmount))}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-5 text-xs">
                        <div className="flex items-center gap-1 font-medium text-slate-700">
                          <span>{formatDate(voucher.startDate)}</span>
                          <span className="text-slate-300">→</span>
                          <span>{formatDate(voucher.endDate)}</span>
                        </div>
                        {isExpired && (
                          <span className="inline-flex mt-1 text-[10px] font-semibold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                            Đã quá hạn
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-center sm:text-left">
                        <button
                          onClick={() => handleOpenUsagesModal(voucher)}
                          className="hover:underline flex items-center gap-1.5 font-semibold text-primary"
                        >
                          {voucher.usedCount} / {voucher.usageLimit !== null ? voucher.usageLimit : "∞"}
                          <Eye size={12} />
                        </button>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold ${
                          voucher.isPublic 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {voucher.isPublic ? "Công khai" : "Ẩn"}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${
                          voucher.status === "ACTIVE" && !isExpired
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {voucher.status === "ACTIVE" && !isExpired ? "Đang chạy" : "Tạm dừng"}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(voucher.id, voucher.status)}
                            title={voucher.status === "ACTIVE" ? "Tạm dừng" : "Kích hoạt"}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          >
                            {voucher.status === "ACTIVE" ? <ToggleRight size={18} className="text-primary" /> : <ToggleLeft size={18} />}
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(voucher)}
                            title="Sửa"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteVoucher(voucher.id, voucher.code)}
                            title="Xóa"
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-xl border border-slate-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Ticket className="text-primary" />
                  {editingVoucher ? `Chỉnh sửa Voucher: ${editingVoucher.code}` : "Tạo Voucher mới"}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Điền các thông tin và điều kiện áp dụng cho mã voucher dưới đây.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Cột 1: Thông tin cơ bản */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-700 pb-2 border-b border-slate-100">
                    Thông tin cơ bản
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mã Voucher *</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: WELCOME10"
                        value={formCode}
                        onChange={(e) => setFormCode(e.target.value)}
                        disabled={editingVoucher !== null} // Khóa không cho sửa code nếu đang edit (an toàn DB)
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary disabled:bg-slate-50 font-bold uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tên chương trình *</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Khách hàng mới"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mô tả chi tiết</label>
                    <textarea
                      placeholder="Mô tả điều kiện và lợi ích của voucher..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Loại giảm giá</label>
                      <select
                        value={formDiscountType}
                        onChange={(e) => setFormDiscountType(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
                      >
                        <option value="PERCENT">Giảm theo %</option>
                        <option value="FIXED_AMOUNT">Giảm số tiền cố định (đ)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                        Giá trị giảm ({formDiscountType === "PERCENT" ? "%" : "đ"}) *
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formDiscountValue}
                        onChange={(e) => setFormDiscountValue(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Giảm tối đa (đ)</label>
                      <input
                        type="number"
                        placeholder="Không giới hạn"
                        value={formMaxDiscountAmount}
                        onChange={(e) => setFormMaxDiscountAmount(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Đơn tối thiểu (đ)</label>
                      <input
                        type="number"
                        placeholder="Không có"
                        value={formMinBookingAmount}
                        onChange={(e) => setFormMinBookingAmount(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ngày bắt đầu</label>
                      <input
                        type="date"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ngày kết thúc</label>
                      <input
                        type="date"
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formIsPublic}
                        onChange={(e) => setFormIsPublic(e.target.checked)}
                        className="rounded text-primary focus:ring-primary border-slate-300 w-4 h-4"
                      />
                      <span className="text-sm font-semibold text-slate-600">Voucher công khai</span>
                    </label>
                  </div>
                </div>

                {/* Cột 2: Điều kiện áp dụng */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-700 pb-2 border-b border-slate-100">
                    Điều kiện & Giới hạn áp dụng
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Đối tượng áp dụng</label>
                    <select
                      value={formApplicableTo}
                      onChange={(e) => setFormApplicableTo(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
                    >
                      <option value="ALL">Tất cả khách hàng (Public)</option>
                      <option value="MEMBER_ONLY">Chỉ dành cho Thành viên (Đã đăng ký)</option>
                      <option value="GUEST_ONLY">Chỉ dành cho Khách vãng lai (Chưa đăng ký)</option>
                      <option value="MEMBERSHIP_LEVEL">Theo Hạng thành viên yêu cầu</option>
                    </select>
                  </div>

                  {formApplicableTo === "MEMBERSHIP_LEVEL" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Hạng thành viên yêu cầu</label>
                      <select
                        value={formRequiredMembershipLevel}
                        onChange={(e) => setFormRequiredMembershipLevel(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
                      >
                        <option value="STANDARD">STANDARD (Mặc định)</option>
                        <option value="SILVER">SILVER (Bạc)</option>
                        <option value="GOLD">GOLD (Vàng)</option>
                        <option value="PLATINUM">PLATINUM (Bạch kim)</option>
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Booking checked-out yêu cầu</label>
                      <input
                        type="number"
                        placeholder="Không có"
                        value={formRequiredBookingCount}
                        onChange={(e) => setFormRequiredBookingCount(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Chi tiêu tích lũy yêu cầu (đ)</label>
                      <input
                        type="number"
                        placeholder="Không có"
                        value={formRequiredTotalSpent}
                        onChange={(e) => setFormRequiredTotalSpent(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Giới hạn tổng lượt dùng</label>
                      <input
                        type="number"
                        placeholder="Không giới hạn"
                        value={formUsageLimit}
                        onChange={(e) => setFormUsageLimit(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Giới hạn / Khách hàng</label>
                      <input
                        type="number"
                        placeholder="Không giới hạn"
                        value={formUsageLimitPerCustomer}
                        onChange={(e) => setFormUsageLimitPerCustomer(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Trạng thái phát hành</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
                    >
                      <option value="ACTIVE">ACTIVE (Kích hoạt)</option>
                      <option value="INACTIVE">INACTIVE (Tạm ngưng)</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Modal Actions */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary/95 transition-colors shadow-xs"
                >
                  {editingVoucher ? "Cập nhật" : "Lưu lại"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lịch sử sử dụng (Usages) */}
      {isUsagesModalOpen && selectedVoucherForUsages && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-xl border border-slate-100 flex flex-col max-h-[80vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Users className="text-primary" />
                  Lịch sử sử dụng voucher: {selectedVoucherForUsages.code}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Danh sách khách hàng đã áp dụng thành công mã giảm giá này.
                </p>
              </div>
              <button 
                onClick={() => setIsUsagesModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingUsages ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm text-slate-400">Đang tải lịch sử sử dụng...</p>
                </div>
              ) : usagesList.length === 0 ? (
                <div className="text-center py-12">
                  <Ticket size={36} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 font-semibold text-sm">Chưa có lượt sử dụng nào</p>
                  <p className="text-xs text-slate-400 mt-1">Mã voucher này chưa được áp dụng vào bất kỳ đặt phòng nào.</p>
                </div>
              ) : (
                <div className="overflow-hidden border border-slate-100 rounded-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Ngày dùng</th>
                        <th className="py-3 px-4">Đối tượng</th>
                        <th className="py-3 px-4">ID Đặt phòng</th>
                        <th className="py-3 px-4 text-right">Số tiền đã giảm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs text-slate-600">
                      {usagesList.map((usage) => (
                        <tr key={usage.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-medium">
                            {new Date(usage.usedAt).toLocaleString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3 px-4">
                            {usage.customerId ? (
                              <div>
                                <span className="inline-flex px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold mb-0.5">
                                  Thành viên
                                </span>
                                <div className="text-[10px] text-slate-400">{usage.customerId}</div>
                              </div>
                            ) : (
                              <div>
                                <span className="inline-flex px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold mb-0.5">
                                  Khách vãng lai
                                </span>
                                <div className="text-[10px] text-slate-500">{usage.guestEmail}</div>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400">
                            {usage.bookingId || "—"}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-600">
                            -{formatPrice(Number(usage.discountAmount))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsUsagesModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
              >
                Đóng lại
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
