import axios from "axios";

const REFRESH_URL = "/auth/refresh-token";

let refreshPromise = null;

/**
 * this is our accessToken which lives in a variable in memory not in localstorage.
 * so malicious injected scripts can't easily steal it.
 * downside of this is it's gone on page refresh
 * but we have handle that so dont need to worry about it.
 */
let accessToken = null;

export const httpClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * A little helper that does two things:
 * 1. updates the variable : accessToken = token || null
 * 2. updates axios's default header so every future request automatically carries authorization Bearer token
 */
export function setAccessToken(token) {
  accessToken = token || null;
  if (accessToken) {
    httpClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    return;
  }
  delete httpClient.defaults.headers.common.Authorization;
}

export function getAccessToken() {
  return accessToken;
}

/**
 * avoid duplicate refresh calls
 * if the access token has expired,get a new one - but if 5 request fail at same time,
 * don't fire 5 refresh calls.
 * Only start once, and let everyone else wait on the same one.
 */
function queueRefresh() {
  // is a refresh already in progress? if not then start one.
  if (!refreshPromise) {
    refreshPromise = httpClient
      /**
       * calls the refresh endpoint. the skipAuthRefresh: true flag tags this specific request so that if it fails,
       * interceptor below doesn't try to refresh-and-retry it too so it wouldn't be in loop forever.
       */
      .post(REFRESH_URL, {}, { skipAuthRefresh: true })
      // once the refresh call success, pull the new token out and save it via setAccessToken(token).
      .then((response) => {
        const token = response?.data?.accessToken || null;
        setAccessToken(token);
        return token;
      })
      // whether it succeeded or failed, clear refreshPromise so the next 401 can trigger a fresh refresh attempt.
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/**
 * attach the token to outgoing requests
 * before any request leaves, this runs.
 * it copies the config, and if we have a token in memory, it stamps Authorization: Bearer <token> onto the request headers.
 * in simple words if we have token then attach it.
 */
httpClient.interceptors.request.use((config) => {
  const nextConfig = { ...config };
  if (accessToken) {
    nextConfig.headers = nextConfig.headers || {};
    nextConfig.headers.Authorization = `Bearer ${accessToken}`;
  }
  return nextConfig;
});

/**
 * Catch 401 error and recover
 */
httpClient.interceptors.response.use(
  // successful response pass through untouched.
  (response) => response,
  // runs whenever a request fails.
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;
    // Three early exits when-

    //1. there's no request info to even retry,
    if (!originalRequest) {
      return Promise.reject(error);
    }

    //2. this was the refresh call itself failing
    if (originalRequest.skipAuthRefresh) {
      return Promise.reject(error);
    }

    //3. if the error isn't a 401, or this request already went a retry once stops
    if (status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // marks this request as "already tried to retry" so it can't loop
    originalRequest._retry = true;

    try {
      // get new token from queueRefresh()
      const token = await queueRefresh();
      //if we got no token back, give up and reject with the original error.
      if (!token) {
        return Promise.reject(error);
      }

      // patch the original failed request's headers with the fresh token
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return httpClient(originalRequest);
    } catch (error) {
      // and if the refresh call itself throws, clear the stored token and reject.
      setAccessToken(null);
      return Promise.reject(error);
    }
  },
);
