import { defineStore } from "pinia";

const raw = localStorage.getItem("lf_auth");
const parsed = raw ? JSON.parse(raw) : { token: "", user: null };

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: parsed.token || "",
    user: parsed.user || null
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    isAdmin: (state) => state.user?.role === "admin"
  },
  actions: {
    setAuth(token, user) {
      this.token = token;
      this.user = user;
      localStorage.setItem("lf_auth", JSON.stringify({ token, user }));
    },
    logout() {
      this.token = "";
      this.user = null;
      localStorage.removeItem("lf_auth");
    }
  }
});
