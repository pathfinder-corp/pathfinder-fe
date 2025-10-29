import { IUser } from "./auth";

export interface IUserStore {
  user: IUser | null;
  isAuthenticated: boolean;
  setUser: (user: IUser) => void;
  clearUser: () => void;
  initializeUser: () => void;
}