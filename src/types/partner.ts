export type PartnerType = "Doanh nghiệp" | "Trường học" | "Khác";

export interface Partner {
  id: number;
  name: string;
  type: PartnerType;
  contactName: string;
  email: string;
  phone: string;
  notes: string;
}
