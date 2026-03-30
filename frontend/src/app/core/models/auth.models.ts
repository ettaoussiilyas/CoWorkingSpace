export interface User {
  fullName: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  fullName: string;
  email: string;
  role: string;
}
