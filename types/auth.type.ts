import { IUser, UserRole } from "./user.type";

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: IUser;
}

export interface IRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface IRegisterResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: IUser;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface IForgotPasswordResponse {
  message: string;
}

export interface IResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface IResetPasswordResponse {
  message: string;
}

export interface IApiError {
  message: string;
  statusCode: number;
  error?: string;
}