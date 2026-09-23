
export interface PartnerResponse {
  id: number;
  tenDoanhNghiep: string;
  maSoThue: string | null;
  nguoiDaiDien: string | null;
  email: string | null;
  soDienThoai: string | null;
  diaChi: string | null;
  phanLoai: string | null;
  nhanVienPhuTrach: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// Pagination and filtering

export interface PartnerFilter {
  keyword?: string;
  phanLoai?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface PartnerPage {
  items: PartnerResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Create partner

export interface CreatePartnerRequest {
  tenDoanhNghiep: string;
  maSoThue: string;

  nguoiDaiDien?: string;
  email?: string;
  soDienThoai?: string;
  diaChi?: string;
  nganhNghe?: string;
}

// Update partner

export interface UpdatePartnerRequest {
  tenDoanhNghiep?: string;
  nguoiDaiDien?: string;
  email?: string;
  soDienThoai?: string;
  diaChi?: string;
  nganhNghe?: string;
}

// Form values

export interface PartnerFormValues {
  tenDoanhNghiep: string;
  maSoThue: string;
  nguoiDaiDien: string;
  email: string;
  soDienThoai: string;
  diaChi: string;
  nganhNghe: string;
}
