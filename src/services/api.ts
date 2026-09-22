import { useAuth } from "@/composables/useAuth";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

interface ApiResponse<T> {
  code: number;
  status: string;
  message: string;
  data: T;
}

interface ApiOptions extends RequestInit {
  auth?: boolean;
  token?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const {
    auth = true,
    token,
    ...requestOptions
  } = options;

  const {
    accessToken,
    ensureSession,
    clearSession,
  } = useAuth();

  let requestToken = token;

  // Use the current session unless a token was provided.
  if (auth && !requestToken) {
    if (!ensureSession()) {
      throw new ApiError(
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        401,
      );
    }

    requestToken = accessToken.value ?? undefined;
  }

  const headers = new Headers(requestOptions.headers);

  if (auth && requestToken) {
    headers.set(
      "Authorization",
      `Bearer ${requestToken}`,
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...requestOptions,
        headers,
      },
    );
  } catch {
    throw new ApiError(
      "Không thể kết nối đến máy chủ. Vui lòng thử lại.",
      0,
    );
  }

  // Parse the backend response.
  let result: ApiResponse<T> | null = null;

  const responseText = await response.text();

  if (responseText) {
    try {
      result = JSON.parse(responseText) as ApiResponse<T>;
    } catch {
      if (response.ok) {
        throw new ApiError(
          "Phản hồi từ máy chủ không hợp lệ.",
          response.status,
        );
      }
    }
  }

  // Handle HTTP errors.
  if (!response.ok) {
    if (
      response.status === 401 &&
      auth &&
      requestToken === accessToken.value
    ) {
      clearSession();
    }

    throw new ApiError(
      result?.message ||
      `Yêu cầu thất bại (HTTP ${response.status}).`,
      response.status,
    );
  }

  // Some successful requests may have no response body.
  if (response.status === 204) {
    return undefined as T;
  }

  if (!result) {
    throw new ApiError(
      "Máy chủ không trả về dữ liệu hợp lệ.",
      response.status,
    );
  }

  // Handle errors reported inside the response body.
  if (
    result.code >= 400 ||
    ["error", "fail", "failed"].includes(
      result.status?.toLowerCase() ?? "",
    )
  ) {
    throw new ApiError(
      result.message || "Yêu cầu không thành công.",
      result.code,
    );
  }

  return result.data;
}
