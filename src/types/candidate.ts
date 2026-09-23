// Application status

export const candidateApplicationStatuses = [
  { value: "created", label: "Mới tạo" },
  { value: "needs_processing", label: "Cần xử lý" },
  { value: "processing", label: "Đang xử lý" },
  { value: "completed", label: "Hoàn tất" },
  { value: "cancelled", label: "Đã huỷ" },
] as const;

export type CandidateApplicationStatus =
  (typeof candidateApplicationStatuses)[number]["value"];

// Payment status

export const candidatePaymentStatuses = [
  { value: "pending", label: "Chờ thanh toán" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "failed", label: "Thất bại" },
  { value: "cancelled", label: "Đã huỷ" },
] as const;

export type CandidatePaymentStatus =
  (typeof candidatePaymentStatuses)[number]["value"];

// Exam divisions

export const candidateDivisions = [
  "Bảng A",
  "Bảng B",
] as const;

export type CandidateDivision =
  (typeof candidateDivisions)[number];
