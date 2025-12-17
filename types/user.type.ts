import { USER_ROLES, USER_STATUS } from "@/constants";

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  avatar: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IUserStore {
  user: IUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setUser: (user: IUser) => void;
  clearUser: () => void;
  initializeUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface ISearchUserResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface IUpdateProfileRequest {
  firstName: string;
  lastName: string;
}

export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface IUserProfile extends IUser {
  emailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationSentAt: string | null;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  lastLogoutAt: string | null;
}