import { httpClient } from "./httpClient";

let BASEURL = "/api/auth/";

export const authService = {
  register(payload) {
    return httpClient.post(`${BASEURL}register`, payload);
  },
  login(payload) {
    return httpClient.post(`${BASEURL}login`, payload);
  },
  logout(payload) {
    return httpClient.post(`${BASEURL}logout`, payload);
  },
  refreshToken(payload) {
    return httpClient.post(`${BASEURL}refresh-token`, payload, {
      skipAuthRefresh: true,
    });
  },
};
