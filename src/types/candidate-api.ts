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

  bangDau?: string | null;

  trangThai?: string | null;
  trangThaiKey?: string | null;
  trangThaiHoSo?: string | null;
  paymentStatus?: string | null;

  soTien?: number | null;

  ngayDangKy?: string | null;
  createdAt?: string | null;
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
  trangThai?: string;

  page?: number;
  size?: number;

  sortBy?: string;
  sortDir?: "asc" | "desc";
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
  bangDau?: string;

  trangThaiHoSo?: string;
  paymentStatus?: string;
  soTien?: number;
}

export type UpdateCandidateRequest = CreateCandidateRequest;
