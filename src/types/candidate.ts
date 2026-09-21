export const candidateStatuses = [
  "Đã đóng phí",
  "Đã nộp bài",
  "Chờ hồ sơ",
  "Đang xét duyệt",
  "Bị loại",
] as const;

export type CandidateStatus = (typeof candidateStatuses)[number];

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  school: string;
  status: CandidateStatus;
}
