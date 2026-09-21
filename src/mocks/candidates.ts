import {
  candidateStatuses,
  type Candidate,
} from "@/types/candidate";
import { mockSalesPeople } from "@/mocks/salesPeople";

const candidateNames = [
  // 1–10
  "Nguyễn Kim Lan",
  "Ngô Minh Phong",
  "Võ Thị Quỳnh",
  "Hồ Kim Quỳnh",
  "Vũ Hồng Chi",
  "Vũ Công Thắng",
  "Ngô Ánh Diệp",
  "Huỳnh Thanh Anh",
  "Trần Minh Khang",
  "Lê Ngọc Hân",

  // 11–20
  "Phạm Quốc Bảo",
  "Hoàng Thu Hà",
  "Phan Đức Anh",
  "Đặng Bảo Ngọc",
  "Bùi Gia Huy",
  "Đỗ Khánh Linh",
  "Nguyễn Tuấn Kiệt",
  "Trần Phương Thảo",
  "Lê Hoàng Nam",
  "Phạm Minh Châu",

  // 21–30
  "Hoàng Đức Minh",
  "Phan Thanh Trúc",
  "Đặng Nhật Quang",
  "Bùi Hải Yến",
  "Đỗ Quang Huy",
  "Nguyễn Thùy Dương",
  "Trần Anh Tuấn",
  "Lê Bảo Trâm",
  "Phạm Thành Đạt",
  "Hoàng Ngọc Mai",

  // 31–40
  "Phan Minh Đức",
  "Đặng Hà My",
  "Bùi Trung Hiếu",
  "Đỗ Yến Nhi",
  "Nguyễn Gia Bảo",
  "Trần Khánh Vy",
  "Lê Đức Huy",
  "Phạm Thanh Tâm",
  "Hoàng Anh Khoa",
  "Phan Diệu Linh",

  // 41–50
  "Đặng Quốc Khánh",
  "Bùi Thảo Nguyên",
  "Đỗ Minh Quân",
  "Nguyễn Ngọc Ánh",
  "Trần Hải Đăng",
  "Lê Phương Anh",
  "Phạm Đức Long",
  "Hoàng Bích Ngọc",
  "Phan Tuấn Anh",
  "Đặng Mai Chi",

  // 51–60
  "Bùi Nhật Minh",
  "Đỗ Thu Trang",
  "Nguyễn Hoàng Phúc",
  "Trần Như Quỳnh",
  "Lê Thành Công",
  "Phạm Quỳnh Anh",
  "Hoàng Minh Trí",
  "Phan Ngọc Diệp",
  "Đặng Duy Khánh",
  "Bùi Thanh Huyền",

  // 61–70
  "Đỗ Quốc Huy",
  "Nguyễn Bảo Hân",
  "Trần Đức Duy",
  "Lê Tú Anh",
  "Phạm Gia Khánh",
  "Hoàng Mỹ Linh",
  "Phan Quang Minh",
  "Đặng Thùy Linh",
  "Bùi Anh Dũng",
  "Đỗ Phương Linh",

  // 71–80
  "Nguyễn Chí Kiên",
  "Trần Ngọc Trâm",
  "Lê Duy Anh",
  "Phạm Hải Anh",
  "Hoàng Tiến Đạt",
  "Phan Khánh Ngọc",
  "Đặng Minh Nhật",
  "Bùi Hương Giang",
  "Đỗ Anh Quân",
  "Nguyễn Hà Anh",

  // 81–90
  "Trần Bảo Long",
  "Lê Thảo My",
  "Phạm Trung Kiên",
  "Hoàng Ngọc Hà",
  "Phan Đức Thịnh",
  "Đặng Phương Nhi",
  "Bùi Minh Hoàng",
  "Đỗ Thanh Hà",
  "Nguyễn Việt Anh",
  "Trần Kim Ngân",

  // 91–100
  "Lê Quốc Đạt",
  "Phạm Ngọc Huyền",
  "Hoàng Gia Minh",
  "Phan Bảo Châu",
  "Đặng Hoàng Hải",
  "Bùi Khánh An",
  "Đỗ Tuấn Minh",
  "Nguyễn Minh Thư",
  "Trần Đức Phúc",
  "Lê Quỳnh Như",
];

const schools = [
  "Đại học Bách khoa Hà Nội",
  "Đại học Kinh tế Quốc dân",
  "Đại học Công nghiệp Hà Nội",
  "Trường Đại học Công nghệ, ĐHQGHN",
  "Học viện Công nghệ Bưu chính Viễn thông",
  "Trường Đại học Bách khoa, ĐHQG TP.HCM",
  "Trường Đại học Công nghệ Thông tin, ĐHQG TP.HCM",
  "Trường Đại học Sư phạm Kỹ thuật TP.HCM",
  "Đại học Duy Tân",
  "Trường Đại học Bách khoa, Đại học Đà Nẵng",
  "Đại học Cần Thơ",
  "Đại học FPT",
  "THPT Trần Hưng Đạo",
  "THPT Lương Thế Vinh",
  "THPT Nguyễn Du",
  "THPT Nguyễn Huệ",
  "THPT Chu Văn An",
  "THPT Lê Quý Đôn",
  "THPT chuyên Hà Nội – Amsterdam",
  "THPT chuyên Quốc Học – Huế",
];

function createEmailName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ".");
}

export const mockCandidates: Candidate[] = candidateNames.map(
  (name, index) => {
    const id = 1001 + index;

    const statusIndex =
      (index + Math.floor(index / schools.length)) %
      candidateStatuses.length;

    return {
      id,
      name,
      email: `${createEmailName(name)}.${id}@example.com`,
      phone: `090${String(index + 1).padStart(7, "0")}`,
      school: schools[index % schools.length] ?? "Chưa cập nhật",
      status: candidateStatuses[statusIndex] ?? "Chờ hồ sơ",

      // Synthetic test values, not real identity information.
      citizenId: String(index + 1).padStart(12, "0"),
      division: "Bảng A - Sinh viên",
      salesPersonId:
        mockSalesPeople[index % mockSalesPeople.length]?.id ?? "",
    };
  },
);
