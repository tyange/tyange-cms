export interface AuthStore {
  isAuth: boolean
  accessToken?: string
  refreshToken?: string
  userRole?: string
}
