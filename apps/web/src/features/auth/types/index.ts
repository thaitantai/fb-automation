export interface User {
  id: string;
  email: string;
  subscriptionPlan: string;
}

export interface AuthResponse {
  status: string;
  message?: string;
  data: {
    token: string;
    user: User;
  };
}
