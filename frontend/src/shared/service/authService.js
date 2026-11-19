import { httpClient } from "./httpClient";

export const authService = {
  register(payload) {
    return httpClient.post("/auth/register", payload);
  },
  login(payload) {
    return httpClient.post("/auth/login", payload);
  },
  logout(payload) {
    return httpClient.post("/auth/logout", payload);
  },
  refreshToken(payload) {
    return httpClient.post("/auth/refresh-token", payload, {
      skipAuthRefresh: true,
    });
  },
};
