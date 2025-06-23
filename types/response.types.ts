export interface AuthResponse {
  accessToken: string
  refreshToken: string
}

export interface CMSResponse<T> {
  status: boolean
  data: T
  message: string | null
}
