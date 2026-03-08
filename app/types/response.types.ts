export interface AuthResponse {
  access_token: string
  refresh_token: string
  user_role: string
}

export interface CMSResponse<T> {
  status: boolean
  data: T | null
  message: string | null
}
