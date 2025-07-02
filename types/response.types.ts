export interface AuthResponse {
  access_token: string
  refresh_token: string
}

export interface CMSResponse<T> {
  status: boolean
  data: T
  message: string | null
}
