export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

export type Session = {
  user: User;
  expires: string;
};

export interface AuthResponse {
  user: User;
  session: Session;
}

export interface LoginCredentials {
  email: string;
  password: string;
}