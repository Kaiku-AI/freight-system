import { create } from "zustand";
import { persist } from "zustand/middleware";

// 客户端 UI 状态：仅登录标记（DESIGN §7.3）。
// 无鉴权、不发 token；persist 到 localStorage，刷新不丢。
type AuthState = {
  loggedIn: boolean;
  username: string | null;
  login: (username: string) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      loggedIn: false,
      username: null,
      login: (username) => set({ loggedIn: true, username }),
      logout: () => set({ loggedIn: false, username: null }),
    }),
    { name: "freight-auth" },
  ),
);
