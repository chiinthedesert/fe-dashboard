export const candidateStatuses = [
  "Đã đóng phí",
  "Đã nộp bài",
  "Chờ hồ sơ",
  "Đang xét duyệt",
  "Bị loại",
] as const;

export type CandidateStatus = (typeof candidateStatuses)[number];

// Only this division is visible in your screenshot.
// Add the other official divisions here.
export const candidateDivisions = [
  "Bảng A",
  "Bảng B",
];

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  school: string;
  status: CandidateStatus;

  citizenId: string;
  division: string;
  salesPersonId: string;
}

export type CandidateFormValues = Omit<Candidate, "id">;
