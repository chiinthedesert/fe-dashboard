<script setup lang="ts">
import { computed, ref } from "vue"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  FileUp,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-vue-next"

type CandidateStatus = "Chờ hồ sơ" | "Đã đóng phí"

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  school: string
  status: CandidateStatus
}

const search = ref("")
const selectedStatus = ref("all")
const selectedSchoolType = ref("all")
const selectedIds = ref<string[]>([])
const currentPage = ref(1)
const pageSize = 8
const totalResultCount = 97

const candidates: Candidate[] = [
  { id: "1001", name: "Nguyễn Kim Lan", email: "lankimnguyen105@gmail.com", phone: "0521819600", school: "Đại học Công nghiệp Hà Nội", status: "Chờ hồ sơ" },
  { id: "1002", name: "Ngô Minh Phong", email: "phongminhngo990@gmail.com", phone: "0940265423", school: "Đại học Kinh tế Quốc dân", status: "Chờ hồ sơ" },
  { id: "1003", name: "Võ Thị Quỳnh", email: "quynhthivo206@gmail.com", phone: "0916184959", school: "Đại học Bách Khoa TP.HCM", status: "Chờ hồ sơ" },
  { id: "1004", name: "Hồ Kim Quỳnh", email: "quynhkimho556@gmail.com", phone: "0725534192", school: "Đại học Kinh tế Quốc dân", status: "Đã đóng phí" },
  { id: "1005", name: "Vũ Hồng Chi", email: "chihongvu227@gmail.com", phone: "0505641395", school: "Đại học Duy Tân", status: "Chờ hồ sơ" },
  { id: "1006", name: "Vũ Công Thắng", email: "thangcongvu515@gmail.com", phone: "0796965328", school: "THPT Trần Hưng Đạo", status: "Chờ hồ sơ" },
  { id: "1007", name: "Ngô Ánh Diệp", email: "diepnghngo708@gmail.com", phone: "0869784801", school: "THPT Lương Thế Vinh", status: "Đã đóng phí" },
  { id: "1008", name: "Huỳnh Thành Anh", email: "anhthanhhuynh166@gmail.com", phone: "0782814893", school: "Đại học Sư phạm Kỹ thuật TP.HCM", status: "Đã đóng phí" },
  { id: "1009", name: "Lý Thị Giang", email: "giangthithily845@gmail.com", phone: "0743039117", school: "Đại học Công nghệ - ĐHQGHN", status: "Chờ hồ sơ" },
  { id: "1010", name: "Huỳnh Quốc Sơn", email: "sonquochuynh931@gmail.com", phone: "0963834657", school: "Đại học Khoa học Tự nhiên TP.HCM", status: "Chờ hồ sơ" },
  { id: "1011", name: "Vũ Xuân Hùng", email: "hungxuanvu253@gmail.com", phone: "0310310518", school: "Đại học Khoa học Tự nhiên TP.HCM", status: "Chờ hồ sơ" },
  { id: "1012", name: "Lý Thu Thảo", email: "thaothuly894@gmail.com", phone: "0831165667", school: "Học viện Công nghệ Bưu chính Viễn thông (PTIT)", status: "Chờ hồ sơ" },
  { id: "1013", name: "Phạm Thu Huyền", email: "huyenthupham905@gmail.com", phone: "0587262473", school: "Đại học Bách Khoa Hà Nội", status: "Chờ hồ sơ" },
  { id: "1014", name: "Nguyễn Ngọc Lan", email: "lanngocnguyen12@gmail.com", phone: "0567736026", school: "Đại học Bách Khoa TP.HCM", status: "Chờ hồ sơ" },
  { id: "1015", name: "Lý Thanh Huyền", email: "huyenthanhly608@gmail.com", phone: "0730980500", school: "Đại học Công nghệ - ĐHQGHN", status: "Chờ hồ sơ" },
  { id: "1016", name: "Huỳnh Hữu Việt", email: "viethuynh644@gmail.com", phone: "0336193990", school: "Đại học Công nghiệp Hà Nội", status: "Chờ hồ sơ" },
  { id: "1017", name: "Phan Hồng Lan", email: "lanhongphan646@gmail.com", phone: "0762475107", school: "Đại học Sư phạm Kỹ thuật TP.HCM", status: "Chờ hồ sơ" },
  { id: "1018", name: "Đỗ Hữu Hùng", email: "hunghuudo693@gmail.com", phone: "0742784980", school: "Đại học Công nghệ - ĐHQGHN", status: "Đã đóng phí" },
  { id: "1019", name: "Hoàng Kim Mai", email: "maikimhoang104@gmail.com", phone: "0935348740", school: "Học viện Công nghệ Bưu chính Viễn thông (PTIT)", status: "Chờ hồ sơ" },
  { id: "1020", name: "Võ Thanh Quỳnh", email: "quynhthanhvo864@gmail.com", phone: "0968011280", school: "Đại học Công nghệ - ĐHQGHN", status: "Chờ hồ sơ" },
  { id: "1021", name: "Đỗ Văn Minh", email: "minhvando895@gmail.com", phone: "0531586923", school: "Đại học Kinh tế Quốc dân", status: "Chờ hồ sơ" },
  { id: "1022", name: "Bùi Diễm Lan", email: "landiembui368@gmail.com", phone: "0721607337", school: "Đại học Khoa học Tự nhiên TP.HCM", status: "Chờ hồ sơ" },
  { id: "1023", name: "Bùi Quốc Cường", email: "cuongquocbui192@gmail.com", phone: "0758685014", school: "Đại học Bách Khoa Hà Nội", status: "Chờ hồ sơ" },
  { id: "1024", name: "Bùi Duy Việt", email: "vietduybui542@gmail.com", phone: "0916934060", school: "Đại học FPT", status: "Chờ hồ sơ" },
  { id: "1025", name: "Bùi Ánh My", email: "myanhbui140@gmail.com", phone: "0348465648", school: "Đại học Duy Tân", status: "Chờ hồ sơ" },
  { id: "1026", name: "Hồ Bảo An", email: "anbaoho462@gmail.com", phone: "0743699577", school: "THPT Nguyễn Thị Minh Khai", status: "Chờ hồ sơ" },
  { id: "1027", name: "Bùi Hữu Hùng", email: "hunghuubui880@gmail.com", phone: "0733200379", school: "Đại học Duy Tân", status: "Chờ hồ sơ" },
  { id: "1028", name: "Hồ Mỹ Nhi", email: "nhimyho61@gmail.com", phone: "0520163287", school: "THPT Nguyễn Thị Minh Khai", status: "Chờ hồ sơ" },
  { id: "1029", name: "Bùi Mỹ Yến", email: "yenmybui870@gmail.com", phone: "0968727743", school: "Đại học Việt - Hàn (Đà Nẵng)", status: "Chờ hồ sơ" },
  { id: "1030", name: "Đặng Minh Khang", email: "khangminhdang733@gmail.com", phone: "0758122362", school: "Đại học Kinh tế Quốc dân", status: "Chờ hồ sơ" },
  { id: "1031", name: "Trần Minh Phát", email: "phatminhtran781@gmail.com", phone: "0890967054", school: "THPT Trần Phú", status: "Chờ hồ sơ" },
  { id: "1032", name: "Ngô Thành Anh", email: "anhthanhngo938@gmail.com", phone: "0856272980", school: "Đại học Duy Tân", status: "Chờ hồ sơ" },
  { id: "1033", name: "Hoàng Mỹ Hoa", email: "hoangmyhoang294@gmail.com", phone: "0346537556", school: "Đại học Việt - Hàn (Đà Nẵng)", status: "Chờ hồ sơ" },
  { id: "1034", name: "Đỗ Minh Cường", email: "cuongminhdo494@gmail.com", phone: "0303309232", school: "Đại học Khoa học Tự nhiên TP.HCM", status: "Chờ hồ sơ" },
  { id: "1035", name: "Đỗ Đức Việt", email: "vietducdo703@gmail.com", phone: "0912419049", school: "THPT Nguyễn Huệ", status: "Chờ hồ sơ" },
  { id: "1036", name: "Đặng Ánh Giang", email: "gianganhdang22@gmail.com", phone: "0905865185", school: "Đại học Bách Khoa Hà Nội", status: "Chờ hồ sơ" },
  { id: "1037", name: "Dương Thanh Phương", email: "phuongthanduong284@gmail.com", phone: "0584987769", school: "Đại học Bách Khoa TP.HCM", status: "Đã đóng phí" },
  { id: "1038", name: "Hồ Hồng An", email: "anhongho911@gmail.com", phone: "0852735454", school: "Đại học Sư phạm Kỹ thuật TP.HCM", status: "Đã đóng phí" },
  { id: "1039", name: "Lê Thu Phương", email: "phuongthule236@gmail.com", phone: "0883777014", school: "Đại học Bách Khoa TP.HCM", status: "Chờ hồ sơ" },
  { id: "1040", name: "Đỗ Duy Thắng", email: "thangduydo333@gmail.com", phone: "0757444313", school: "Đại học CNTT - ĐHQG TP.HCM", status: "Chờ hồ sơ" },
  { id: "1041", name: "Lý Quốc Tuấn", email: "tuanquocly319@gmail.com", phone: "0994134352", school: "Đại học Công nghệ - ĐHQGHN", status: "Chờ hồ sơ" },
  { id: "1042", name: "Đặng Thanh Thảo", email: "thaothangdang998@gmail.com", phone: "0309477752", school: "Đại học Bách Khoa Hà Nội", status: "Chờ hồ sơ" },
  { id: "1043", name: "Trần Đức Đạt", email: "datductran819@gmail.com", phone: "0941318699", school: "Đại học Kinh tế Quốc dân", status: "Chờ hồ sơ" },
  { id: "1044", name: "Ngô Quốc Tuấn", email: "tuanquocngo255@gmail.com", phone: "0909133412", school: "Đại học Công nghệ - ĐHQGHN", status: "Chờ hồ sơ" },
  { id: "1045", name: "Lý Quốc Bảo", email: "baoquocly445@gmail.com", phone: "0544713493", school: "Đại học Duy Tân", status: "Chờ hồ sơ" },
  { id: "1046", name: "Lê Thị Hoa", email: "hoathile975@gmail.com", phone: "0799471746", school: "Đại học Việt - Hàn (Đà Nẵng)", status: "Chờ hồ sơ" },
  { id: "1047", name: "Ngô Hồng Yến", email: "yenhongngo51@gmail.com", phone: "0701399049", school: "Đại học Duy Tân", status: "Chờ hồ sơ" },
  { id: "1048", name: "Ngô Thành Cường", email: "cuongthanhngo720@gmail.com", phone: "0856551256", school: "Đại học Sư phạm Kỹ thuật TP.HCM", status: "Chờ hồ sơ" },
  { id: "1049", name: "Võ Anh Dũng", email: "dunganhvo380@gmail.com", phone: "0880876038", school: "Đại học Duy Tân", status: "Chờ hồ sơ" },
  { id: "1050", name: "Hoàng Quốc Phong", email: "phongquochoang575@gmail.com", phone: "0810932480", school: "THPT Trần Hưng Đạo", status: "Chờ hồ sơ" },
  { id: "1051", name: "Hoàng Mỹ Mai", email: "mimyhoang402@gmail.com", phone: "0946773782", school: "Đại học CNTT - ĐHQG TP.HCM", status: "Chờ hồ sơ" },
  { id: "1052", name: "Ngô Anh Sơn", email: "sonanhngo561@gmail.com", phone: "0704499727", school: "Đại học Sư phạm Kỹ thuật TP.HCM", status: "Chờ hồ sơ" },
  { id: "1053", name: "Bùi Minh Hùng", email: "hungminhbui689@gmail.com", phone: "0963605766", school: "Học viện Công nghệ Bưu chính Viễn thông (PTIT)", status: "Chờ hồ sơ" },
  { id: "1054", name: "Bùi Ngọc Quỳnh", email: "quynhngocbui810@gmail.com", phone: "0387026217", school: "Đại học CNTT - ĐHQG TP.HCM", status: "Chờ hồ sơ" },
  { id: "1055", name: "Bùi Công Nam", email: "namcongbui774@gmail.com", phone: "0778091343", school: "Đại học Duy Tân", status: "Chờ hồ sơ" },
  { id: "1056", name: "Đặng Văn Bảo", email: "baovandang431@gmail.com", phone: "0704556238", school: "THPT Việt Đức", status: "Chờ hồ sơ" },
  { id: "1057", name: "Hồ Ánh Lan", email: "lananhho930@gmail.com", phone: "0892374740", school: "Đại học Công nghệ - ĐHQGHN", status: "Chờ hồ sơ" },
  { id: "1058", name: "Đặng Diễm Linh", email: "linhdiemdang377@gmail.com", phone: "0843671369", school: "THPT Chu Văn An", status: "Chờ hồ sơ" },
  { id: "1059", name: "Trần Xuân Quân", email: "quanxuantran653@gmail.com", phone: "0739533942", school: "Đại học Bách Khoa TP.HCM", status: "Đã đóng phí" },
  { id: "1060", name: "Hoàng Ngọc Mai", email: "maingochoang945@gmail.com", phone: "0762328588", school: "Đại học Bách Khoa TP.HCM", status: "Chờ hồ sơ" },
  { id: "1061", name: "Bùi Ngọc Quỳnh", email: "quynhngocbui280@gmail.com", phone: "0323685160", school: "Đại học FPT", status: "Chờ hồ sơ" },
  { id: "1062", name: "Đỗ Hữu Hùng", email: "hunghudo941@gmail.com", phone: "0809859317", school: "Đại học Bách Khoa Hà Nội", status: "Chờ hồ sơ" },
  { id: "1063", name: "Đặng Mỹ Giang", email: "giangmydang611@gmail.com", phone: "0338267586", school: "Đại học Việt - Hàn (Đà Nẵng)", status: "Chờ hồ sơ" },
  { id: "1064", name: "Võ Thị Ngân", email: "nganthivo72@gmail.com", phone: "0577351585", school: "Đại học Bách Khoa Hà Nội", status: "Chờ hồ sơ" },
  { id: "1065", name: "Nguyễn Thị My", email: "mythinguyen842@gmail.com", phone: "0529318393", school: "Đại học Công nghiệp Hà Nội", status: "Đã đóng phí" },
  { id: "1066", name: "Hoàng Thanh Trâm", email: "tramthanhhoang341@gmail.com", phone: "0721020539", school: "Học viện Công nghệ Bưu chính Viễn thông (PTIT)", status: "Chờ hồ sơ" },
  { id: "1067", name: "Lê Thành Phong", email: "phongthanhle754@gmail.com", phone: "0789178390", school: "THPT Nguyễn Thị Minh Khai", status: "Chờ hồ sơ" },
  { id: "1068", name: "Hồ Diễm Giang", email: "giangdiemho291@gmail.com", phone: "0871159212", school: "Đại học Sư phạm Kỹ thuật TP.HCM", status: "Chờ hồ sơ" },
  { id: "1069", name: "Đặng Mỹ Trang", email: "trangmydang433@gmail.com", phone: "0961183673", school: "Đại học Kinh tế Quốc dân", status: "Chờ hồ sơ" },
  { id: "1070", name: "Bùi Quốc Minh", email: "minhquocbui841@gmail.com", phone: "0571111615", school: "Đại học Công nghiệp Hà Nội", status: "Chờ hồ sơ" },
  { id: "1071", name: "Phạm Duy Minh", email: "minhduypham227@gmail.com", phone: "0804945198", school: "Đại học Khoa học Tự nhiên TP.HCM", status: "Chờ hồ sơ" },
  { id: "1072", name: "Đỗ Ngọc Linh", email: "linhngocdo961@gmail.com", phone: "0936899809", school: "THPT Chu Văn An", status: "Đã đóng phí" },
  { id: "1073", name: "Đặng Hồng Ngân", email: "nganhongdang774@gmail.com", phone: "0322961201", school: "THPT Lê Quý Đôn", status: "Chờ hồ sơ" },
  { id: "1074", name: "Đặng Anh Tuấn", email: "tuananhdang463@gmail.com", phone: "0910229014", school: "Đại học Công nghiệp Hà Nội", status: "Chờ hồ sơ" },
  { id: "1075", name: "Phạm Anh Phát", email: "phatanhpham623@gmail.com", phone: "0349784036", school: "Đại học Bách Khoa TP.HCM", status: "Chờ hồ sơ" },
  { id: "1076", name: "Đặng Hồng Giang", email: "gianghongdang582@gmail.com", phone: "0376226838", school: "Đại học Bách Khoa Hà Nội", status: "Chờ hồ sơ" },
  { id: "1077", name: "Dương Hữu Long", email: "longhuuduong999@gmail.com", phone: "0969664160", school: "Đại học Việt - Hàn (Đà Nẵng)", status: "Đã đóng phí" },
  { id: "1078", name: "Phạm Minh Phát", email: "phatminhpham807@gmail.com", phone: "0968164535", school: "Đại học Duy Tân", status: "Đã đóng phí" },
  { id: "1079", name: "Đỗ Anh Đạt", email: "datanhdo191@gmail.com", phone: "0512432921", school: "THPT Lương Thế Vinh", status: "Chờ hồ sơ" },
  { id: "1080", name: "Bùi Hồng Hà", email: "hahongbui529@gmail.com", phone: "081744905", school: "Đại học Việt - Hàn (Đà Nẵng)", status: "Đã đóng phí" },
  { id: "1081", name: "Đặng Hữu Cường", email: "cuonghuudang940@gmail.com", phone: "0998679807", school: "Đại học FPT", status: "Chờ hồ sơ" },
  { id: "1082", name: "Trần Thành Dũng", email: "dungthanhtran545@gmail.com", phone: "0718203778", school: "Đại học FPT", status: "Đã đóng phí" },
  { id: "1083", name: "Bùi Xuân Bảo", email: "baoxuanbui904@gmail.com", phone: "0715186449", school: "Đại học Công nghiệp Hà Nội", status: "Chờ hồ sơ" },
  { id: "1084", name: "Hồ Đức Việt", email: "vietducho530@gmail.com", phone: "0348652816", school: "Đại học Bách Khoa TP.HCM", status: "Chờ hồ sơ" },
  { id: "1085", name: "Lý Minh Hùng", email: "hungminhly687@gmail.com", phone: "0521418880", school: "Đại học Công nghệ - ĐHQGHN", status: "Chờ hồ sơ" },
  { id: "1086", name: "Huỳnh Xuân Duy", email: "duyxuanhuynh249@gmail.com", phone: "0806537947", school: "Đại học Việt - Hàn (Đà Nẵng)", status: "Chờ hồ sơ" },
  { id: "1087", name: "Dương Mỹ Mai", email: "maimyduong63@gmail.com", phone: "0888623924", school: "THPT Trần Phú", status: "Đã đóng phí" },
  { id: "1088", name: "Đặng Ngọc Hoa", email: "hoangocdang962@gmail.com", phone: "0778261375", school: "THPT Lê Quý Đôn", status: "Chờ hồ sơ" },
  { id: "1089", name: "Lê Anh Hùng", email: "hunganle722@gmail.com", phone: "0351522047", school: "THPT Nguyễn Thị Minh Khai", status: "Chờ hồ sơ" },
  { id: "1090", name: "Phan Đức Thắng", email: "thangducphan254@gmail.com", phone: "0986143410", school: "Đại học Việt - Hàn (Đà Nẵng)", status: "Chờ hồ sơ" },
  { id: "1091", name: "Lý Ánh Trâm", email: "tramanhly371@gmail.com", phone: "0389324609", school: "THPT Việt Đức", status: "Chờ hồ sơ" },
  { id: "1092", name: "Lê Bảo Trâm", email: "trambaole269@gmail.com", phone: "0988067065", school: "Đại học FPT", status: "Đã đóng phí" },
  { id: "1093", name: "Bùi Thanh Chi", email: "chithanhbui743@gmail.com", phone: "0785277721", school: "THPT Kim Liên", status: "Chờ hồ sơ" },
  { id: "1094", name: "Bùi Kim Trang", email: "trangkimbui896@gmail.com", phone: "0887403450", school: "Đại học Bách Khoa Hà Nội", status: "Chờ hồ sơ" },
  { id: "1095", name: "Dương Diễm My", email: "mydiemduong450@gmail.com", phone: "0577584161", school: "THPT Trần Phú", status: "Chờ hồ sơ" },
  { id: "1096", name: "Bùi Quốc Khôi", email: "khoiquocbui639@gmail.com", phone: "0896275705", school: "Đại học Bách Khoa Hà Nội", status: "Chờ hồ sơ" },
  { id: "1097", name: "Huỳnh Văn Đạt", email: "datvanhuynh982@gmail.com", phone: "0970213556", school: "Đại học Công nghệ - ĐHQGHN", status: "Chờ hồ sơ" },
]

const filteredCandidates = computed(() => candidates.filter((candidate) => {
  const keyword = search.value.toLowerCase().trim()
  const matchesSearch = [candidate.name, candidate.email, candidate.phone, candidate.school]
    .some((value) => value.toLowerCase().includes(keyword))
  const matchesStatus = selectedStatus.value === "all" || candidate.status === selectedStatus.value
  const matchesSchool = selectedSchoolType.value === "all"
    || (selectedSchoolType.value === "Đại học" && candidate.school.startsWith("Đại học"))
    || (selectedSchoolType.value === "THPT" && candidate.school.startsWith("THPT"))
  return matchesSearch && matchesStatus && matchesSchool
}))

const totalPages = computed(() => Math.max(1, Math.ceil(filteredCandidates.value.length / pageSize)))
const pageStart = computed(() => (currentPage.value - 1) * pageSize + 1)
const pageEnd = computed(() => Math.min(currentPage.value * pageSize, filteredCandidates.value.length))
const pagedCandidates = computed(() => filteredCandidates.value.slice(pageStart.value - 1, pageEnd.value))
const allVisibleSelected = computed(() => pagedCandidates.value.length > 0 && pagedCandidates.value.every((candidate) => selectedIds.value.includes(candidate.id)))

const toggleCandidate = (id: string) => {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((selectedId) => selectedId !== id)
    : [...selectedIds.value, id]
}

const toggleAll = () => {
  const visibleIds = pagedCandidates.value.map((candidate) => candidate.id)
  selectedIds.value = allVisibleSelected.value
    ? selectedIds.value.filter((id) => !visibleIds.includes(id))
    : [...new Set([...selectedIds.value, ...visibleIds])]
}

const changePage = (page: number) => {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value)
}
</script>

<template>
  <section class="candidate-page">
    <header class="candidate-heading">
      <h2>Bảng dữ liệu thí sinh tập trung</h2>
      <p>Quản lý toàn bộ hồ sơ thí sinh dự thi Python Master</p>
    </header>

    <div class="candidate-toolbar">
      <label class="candidate-search">
        <Search class="size-5" />
        <input v-model="search" type="search" placeholder="Tìm tên, SĐT, email, trường..." @input="currentPage = 1" />
      </label>
      <select v-model="selectedStatus" class="candidate-select" aria-label="Lọc trạng thái" @change="currentPage = 1">
        <option value="all">all</option>
        <option value="Chờ hồ sơ">Chờ hồ sơ</option>
        <option value="Đã đóng phí">Đã đóng phí</option>
      </select>
      <select v-model="selectedSchoolType" class="candidate-select" aria-label="Lọc loại trường" @change="currentPage = 1">
        <option value="all">all</option>
        <option value="Đại học">Đại học</option>
        <option value="THPT">THPT</option>
      </select>
      <div class="candidate-actions">
        <button type="button" class="candidate-button candidate-button-primary"><Plus class="size-5" />Thêm thí sinh</button>
        <button type="button" class="candidate-button"><FileUp class="size-4" />Nhập file</button>
        <button type="button" class="candidate-button"><FileSpreadsheet class="size-4" />Xuất Excel</button>
      </div>
    </div>

    <div class="candidate-table-wrap">
      <table class="candidate-table">
        <thead>
          <tr>
            <th class="candidate-check"><input type="checkbox" :checked="allVisibleSelected" aria-label="Chọn tất cả" @change="toggleAll" /></th>
            <th>ID</th><th>Họ và tên</th><th>Email</th><th>Số điện thoại</th><th>Trường đại học</th><th>Trạng thái</th><th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="candidate in pagedCandidates" :key="candidate.id">
            <td class="candidate-check"><input type="checkbox" :checked="selectedIds.includes(candidate.id)" :aria-label="`Chọn ${candidate.name}`" @change="toggleCandidate(candidate.id)" /></td>
            <td class="candidate-muted">{{ candidate.id }}</td>
            <td class="candidate-name">{{ candidate.name }}</td>
            <td class="candidate-muted">{{ candidate.email }}</td>
            <td class="candidate-muted">{{ candidate.phone }}</td>
            <td>{{ candidate.school }}</td>
            <td><span class="candidate-status" :class="candidate.status === 'Đã đóng phí' ? 'candidate-status-paid' : 'candidate-status-pending'"><span />{{ candidate.status }}</span></td>
            <td><div class="candidate-row-actions"><button type="button" title="Xem hồ sơ" aria-label="Xem hồ sơ"><Eye /></button><button type="button" title="Chỉnh sửa" aria-label="Chỉnh sửa"><Pencil /></button><button type="button" title="Xóa" aria-label="Xóa" class="candidate-delete"><Trash2 /></button></div></td>
          </tr>
          <tr v-if="!pagedCandidates.length"><td colspan="8" class="candidate-empty">Không tìm thấy thí sinh phù hợp</td></tr>
        </tbody>
      </table>
    </div>

    <footer class="candidate-pagination">
      <span>Hiển thị <strong>{{ pageStart }} - {{ Math.min(pageEnd, pageStart + filteredCandidates.length - 1) }}</strong> trên tổng số <strong>{{ totalResultCount }}</strong> kết quả</span>
      <div class="candidate-page-controls">
        <button type="button" title="Trang trước" aria-label="Trang trước" :disabled="currentPage === 1" @click="changePage(currentPage - 1)"><ChevronLeft /></button>
        <span>Trang {{ currentPage }} / {{ totalPages }}</span>
        <button type="button" title="Trang sau" aria-label="Trang sau" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)"><ChevronRight /></button>
      </div>
    </footer>
  </section>
</template>

<style scoped>
.candidate-page { min-width: 0; margin: 0; padding: 1.6rem; border: 1px solid var(--border); border-radius: 0.75rem; background: var(--card); color: var(--foreground); }
.candidate-heading { padding: 0 0 1.75rem; border-bottom: 1px solid var(--border); }
.candidate-heading h2 { margin: 0; font-size: 1.25rem; font-weight: 700; }
.candidate-heading p { margin: 0.45rem 0 0; color: var(--muted-foreground); font-size: 0.95rem; }
.candidate-toolbar { display: flex; align-items: center; gap: 0.75rem; padding: 1.75rem 0; }
.candidate-search, .candidate-select, .candidate-button, .candidate-page-controls button { height: 2.35rem; border: 1px solid var(--border); border-radius: 0.6rem; background: color-mix(in oklch, var(--card) 65%, transparent); color: var(--foreground); }
.candidate-search { display: flex; align-items: center; flex: 1 1 23rem; gap: 0.6rem; padding: 0 0.8rem; color: var(--muted-foreground); }
.candidate-search input { min-width: 0; width: 100%; border: 0; outline: 0; background: transparent; color: var(--foreground); font-size: 0.95rem; }
.candidate-search input::placeholder { color: var(--muted-foreground); }
.candidate-select { width: 12.5rem; padding: 0 0.8rem; outline: 0; }
.candidate-actions { display: flex; gap: 0.65rem; margin-left: auto; }
.candidate-button { display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem; padding: 0 0.8rem; white-space: nowrap; font-weight: 600; cursor: pointer; }
.candidate-button:hover, .candidate-page-controls button:hover:not(:disabled) { background: var(--accent); }
.candidate-button-primary { border-color: transparent; background: #4b8ffb; color: white; }
.candidate-button-primary:hover { background: #3c7fe8; }
.candidate-table-wrap { overflow-x: auto; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.candidate-table { width: 100%; min-width: 1120px; border-collapse: collapse; font-size: 0.95rem; }
.candidate-table th, .candidate-table td { height: 3.5rem; padding: 0 0.85rem; border-bottom: 1px solid color-mix(in oklch, var(--border) 70%, transparent); text-align: left; white-space: nowrap; }
.candidate-table th { color: var(--foreground); font-weight: 700; }
.candidate-table tbody tr:last-child td { border-bottom: 0; }
.candidate-table tbody tr:hover { background: color-mix(in oklch, var(--accent) 32%, transparent); }
.candidate-table th:first-child, .candidate-table td:first-child { padding-left: 0; }
.candidate-check { width: 2.25rem; }
.candidate-table input[type="checkbox"] { width: 1.15rem; height: 1.15rem; accent-color: #4b8ffb; cursor: pointer; }
.candidate-muted { color: var(--muted-foreground); }
.candidate-name { font-weight: 700; }
.candidate-status { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.25rem 0.7rem; border-radius: 999px; font-size: 0.82rem; font-weight: 600; }
.candidate-status span { width: 0.45rem; height: 0.45rem; border-radius: 50%; background: currentColor; }
.candidate-status-pending { color: #ffad00; background: color-mix(in oklch, #8a3d00 72%, transparent); }
.candidate-status-paid { color: #00c991; background: color-mix(in oklch, #005a4a 72%, transparent); }
.candidate-row-actions { display: flex; align-items: center; gap: 1rem; }
.candidate-row-actions button { padding: 0; border: 0; background: transparent; color: var(--muted-foreground); cursor: pointer; }
.candidate-row-actions button:hover { color: var(--foreground); }
.candidate-row-actions svg { width: 1.1rem; height: 1.1rem; stroke-width: 2; }
.candidate-row-actions .candidate-delete:hover { color: #ff4d56; }
.candidate-empty { height: 8rem !important; text-align: center !important; color: var(--muted-foreground); }
.candidate-pagination { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding-top: 1.4rem; color: var(--muted-foreground); font-size: 0.9rem; }
.candidate-pagination strong { color: var(--foreground); }
.candidate-page-controls { display: flex; align-items: center; gap: 0.55rem; }
.candidate-page-controls button { display: inline-flex; align-items: center; justify-content: center; width: 2.45rem; padding: 0; cursor: pointer; }
.candidate-page-controls button:disabled { cursor: not-allowed; opacity: 0.4; }
.candidate-page-controls svg { width: 1.1rem; }
@media (max-width: 900px) { .candidate-toolbar { flex-wrap: wrap; } .candidate-search { flex-basis: calc(100% - 13.25rem); } .candidate-actions { width: 100%; margin-left: 0; } }
@media (max-width: 640px) { .candidate-heading { padding-bottom: 1.25rem; } .candidate-toolbar { padding: 1.25rem 0; } .candidate-search, .candidate-select { width: 100%; flex-basis: 100%; } .candidate-actions { overflow-x: auto; } .candidate-button { flex: 0 0 auto; } .candidate-pagination { align-items: flex-start; flex-direction: column; } }
</style>
