export interface RevenueByBoard {
  name: string
  doanh_thu: number
}

export interface RevenueResponse {
  code: number
  status: "success" | "error"
  message: string
  data: {
    tong_doanh_thu: number
    chi_tiet_theo_bang: RevenueByBoard[]
  }
}

export class RevenueApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message)
    this.name = "RevenueApiError"
  }
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "https://api.pythonmaster.vn"

export async function fetchRevenueByBoard(filters: {
  startDate?: string
  endDate?: string
} = {}): Promise<RevenueResponse["data"]> {
  const params = new URLSearchParams()

  if (filters.startDate) params.set("start_date", filters.startDate)
  if (filters.endDate) params.set("end_date", filters.endDate)

  const query = params.toString()
  const url = `${apiBaseUrl}/api/v1/thong-ke/doanh-thu${query ? `?${query}` : ""}`
  const token = localStorage.getItem("access_token")

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  let body: Partial<RevenueResponse> = {}
  try {
    body = await response.json() as Partial<RevenueResponse>
  } catch {
    throw new RevenueApiError("Không thể đọc dữ liệu trả về từ máy chủ.", response.status)
  }

  if (!response.ok || body.status === "error") {
    const message = body.message ?? "Không thể tải dữ liệu doanh thu."
    if (response.status === 401 || body.code === 401) {
      throw new RevenueApiError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", 401)
    }
    if (response.status === 400 || body.code === 400) {
      throw new RevenueApiError(message, 400)
    }
    throw new RevenueApiError(message, response.status)
  }

  if (!body.data) {
    throw new RevenueApiError("Dữ liệu doanh thu không đúng định dạng API contract.", response.status)
  }

  return body.data
}