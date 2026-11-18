import { api } from "./client";
import type { AuthResponse, LoginRequest, RegisterRequest, User } from "../types.ts";

export async function login(body: LoginRequest): Promise<string> {
  const { data } = await api.post<AuthResponse>("/auth/login", body);
  return data.token;
}

export async function register(body: RegisterRequest): Promise<User> {
  const { data } = await api.post<User>("/auth/register", body);
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
