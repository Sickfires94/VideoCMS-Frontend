import { User } from "./user.model";

export interface AuthResponse {
  user: {
    userId: number,
    userName: string,
    userEmail: string,
    token: string
  }}