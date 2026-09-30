export interface CandidateResponse {
  id: number;

  idThiSinh?: string | null;
  hoTen?: string | null;
  email?: string | null;
  soDienThoai?: string | null;
  cccd?: string | null;

  truongHoc?: string | null;
  tinhThanh?: string | null;
  diaChi?: string | null;
  ngaySinh?: string | null;

  assignedSaleId?: number | null;
  assignedSaleName?: string | null;

  bangDau?: string | null;

  trangThai?: string | null;
  trangThaiKey?: string | null;
  trangThaiHoSo?: string | null;
  paymentStatus?: string | null;

  soTien?: number | null;

  ngayDangKy?: string | null;
  nguonDangKy?: string | null;
  doiTac?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CandidatePage {
  items: CandidateResponse[];

  page: number;
  size: number;

  totalElements: number;
  totalPages: number;

  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CandidateFilter {
  keyword?: string;
  truongHoc?: string;
  tinhThanh?: string;
  trangThai?: string;
  nguonDangKy?: string;
  doiTac?: string;

  page?: number;
  size?: number;

  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface StaffOptionResponse {
  id: number;
  idNhanVien?: string | null;
  hoTen?: string | null;
  email?: string | null;
  soDienThoai?: string | null;
}

export interface CreateCandidateRequest {
  hoTen: string;
  soDienThoai: string;

  email?: string;
  cccd?: string;
  ngaySinh?: string;

  truongHoc?: string;
  tinhThanh?: string;
  diaChi?: string;
  assignedSaleId?: number;
  bangDau?: string;

  trangThaiHoSo?: string;
  paymentStatus?: string;
  doiTac?: string;
  soTien?: number;
}

export type UpdateCandidateRequest = CreateCandidateRequest;
