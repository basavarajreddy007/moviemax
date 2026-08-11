import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const normalizeUrls = (data, targetBaseUrl) => {
  if (!data) return data;

  if (typeof data === "string") {
    let replaced = data;

    replaced = replaced.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g, targetBaseUrl);

    if (replaced.startsWith("/uploads/")) {
      replaced = `${targetBaseUrl}${replaced}`;
    } else if (replaced.startsWith("uploads/")) {
      replaced = `${targetBaseUrl}/${replaced}`;
    }

    if (window.location.protocol === "https:" && replaced.startsWith("http://")) {
      if (!replaced.includes("localhost") && !replaced.includes("127.0.0.1")) {
        replaced = replaced.replace("http://", "https://");
      }
    }

    return replaced;
  }

  if (typeof data === "object" && data !== null) {
    if (Array.isArray(data)) {
      return data.map(item => normalizeUrls(item, targetBaseUrl));
    }

    const proto = Object.getPrototypeOf(data);
    if (proto === null || proto === Object.prototype) {
      const newData = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          newData[key] = normalizeUrls(data[key], targetBaseUrl);
        }
      }
      return newData;
    }
  }

  return data;
};

api.interceptors.response.use(
  (response) => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const backendBaseUrl = apiUrl.replace(/\/api$/, "");
    if (response.data) {
      response.data = normalizeUrls(response.data, backendBaseUrl);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const shouldSkipRefresh = originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/forgot-password") ||
      originalRequest.url?.includes("/auth/reset-password") ||
      originalRequest.url?.includes("/auth/refresh-token") ||
      originalRequest.url?.includes("/auth/google") ||
      originalRequest.url?.includes("/auth/verify-login-otp") ||
      originalRequest.url?.includes("/auth/verify-otp");

    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
          localStorage.setItem("token", data.data.token);
          localStorage.setItem("refreshToken", data.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.data.token}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.hash = "#/login";
          return Promise.reject(refreshError);
        }
      }

      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.hash = "#/login";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  verifyOtp: (data) => api.post("/auth/verify-otp", data),
  resendOtp: (data) => api.post("/auth/resend-otp", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  verifyLoginOtp: (data) => api.post("/auth/verify-login-otp", data),
  refreshToken: (data) => api.post("/auth/refresh-token", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  googleLogin: (payload) => api.post("/auth/google", typeof payload === "object" && payload !== null ? payload : { credential: payload }),
  getMe: () => api.get("/auth/me"),
};

export const userAPI = {
  updateProfile: (data) => api.put("/users/profile", data),
  changePassword: (data) => api.put("/users/change-password", data),
  deleteAccount: () => api.delete("/users/account"),
};

export const movieAPI = {
  getAll: (params) => api.get("/movies", { params }),
  getFeatured: () => api.get("/movies/featured"),
  getTrending: () => api.get("/movies/trending"),
  getNewReleases: () => api.get("/movies/new-releases"),
  getTopRated: () => api.get("/movies/top-rated"),
  getUserUploads: (params = {}) => api.get("/movies", {
    params: {
      ...params,
      limit: params.limit || 6,
      sort: params.sort || "new",
    },
  }),
  getByGenre: (genreId) => api.get(`/movies/genre/${genreId}`),
  getBySlug: (slug) => api.get(`/movies/${slug}`),
  getById: (id) => api.get(`/movies/id/${id}`),
  getSimilar: (id) => api.get(`/movies/${id}/similar`),
  create: (data) => api.post("/movies", data),
  update: (id, data) => api.put(`/movies/${id}`, data),
  delete: (id) => api.delete(`/movies/${id}`),
  like: (id) => api.post(`/movies/${id}/like`),
  dislike: (id) => api.post(`/movies/${id}/dislike`),
};

export const tvShowAPI = {
  getAll: (params) => api.get("/tvshows", { params }),
  getFeatured: () => api.get("/tvshows/featured"),
  getBySlug: (slug) => api.get(`/tvshows/${slug}`),
  create: (data) => api.post("/tvshows", data),
  update: (id, data) => api.put(`/tvshows/${id}`, data),
  delete: (id) => api.delete(`/tvshows/${id}`),
  addSeason: (id, data) => api.post(`/tvshows/${id}/seasons`, data),
  addEpisode: (id, seasonNumber, data) => api.post(`/tvshows/${id}/seasons/${seasonNumber}/episodes`, data),
};

export const webSeriesAPI = {
  getAll: (params) => api.get("/webseries", { params }),
  getBySlug: (slug) => api.get(`/webseries/${slug}`),
  create: (data) => api.post("/webseries", data),
  update: (id, data) => api.put(`/webseries/${id}`, data),
  delete: (id) => api.delete(`/webseries/${id}`),
  addSeason: (id, data) => api.post(`/webseries/${id}/seasons`, data),
  addEpisode: (id, seasonNumber, data) => api.post(`/webseries/${id}/seasons/${seasonNumber}/episodes`, data),
};

export const genreAPI = {
  getAll: (params) => api.get("/genres", { params }),
  getById: (id) => api.get(`/genres/${id}`),
  create: (data) => api.post("/genres", data),
  update: (id, data) => api.put(`/genres/${id}`, data),
  delete: (id) => api.delete(`/genres/${id}`),
};

export const categoryAPI = {
  getAll: (params) => api.get("/categories", { params }),
  create: (data) => api.post("/categories", data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const historyAPI = {
  getAll: () => api.get("/history"),
  getContinueWatching: () => api.get("/history/continue-watching"),
  update: (data) => api.post("/history", data),
  clear: () => api.delete("/history/clear"),
  delete: (id) => api.delete(`/history/${id}`),
};

export const favoriteAPI = {
  getAll: () => api.get("/favorites"),
  add: (data) => api.post("/favorites", data),
  check: (contentId, contentType) => api.get(`/favorites/check/${contentId}/${contentType}`),
  checkMany: (items) => api.post("/favorites/check-many", { items }),
  remove: (contentId, contentType) => api.delete(`/favorites/${contentId}/${contentType}`),
};

export const watchlistAPI = {
  getAll: () => api.get("/watchlist"),
  add: (data) => api.post("/watchlist", data),
  check: (contentId, contentType) => api.get(`/watchlist/check/${contentId}/${contentType}`),
  checkMany: (items) => api.post("/watchlist/check-many", { items }),
  remove: (contentId, contentType) => api.delete(`/watchlist/${contentId}/${contentType}`),
};

export const reviewAPI = {
  getByContent: (contentType, contentId) => api.get(`/reviews/${contentType}/${contentId}`),
  create: (data) => api.post("/reviews", data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const subscriptionAPI = {
  getPlans: () => api.get("/subscriptions"),
  getMySubscription: () => api.get("/subscriptions/my-subscription"),
  subscribe: (data) => api.post("/subscriptions/subscribe", data),
  cancel: () => api.post("/subscriptions/cancel"),
  deletePlan: (id) => api.delete(`/subscriptions/${id}`),
};

export const paymentAPI = {
  pay: (data) => api.post("/payments/pay", data),
  getPayments: () => api.get("/payments"),
};

export const notificationAPI = {
  getAll: () => api.get("/notifications"),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put("/notifications/read-all"),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const ratingAPI = {
  rate: (data) => api.post("/ratings", data),
  getRating: (contentId, contentType) => api.get(`/ratings/${contentId}/${contentType}`),
};

export const brandAPI = {
  getAll: (params) => api.get("/brands", { params }),
  getById: (id) => api.get(`/brands/${id}`),
  create: (data) => api.post("/brands", data),
  update: (id, data) => api.put(`/brands/${id}`, data),
  delete: (id) => api.delete(`/brands/${id}`),
};

export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getUsers: (params) => api.get("/admin/users", { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAnalytics: () => api.get("/admin/analytics"),
  getRevenue: () => api.get("/admin/revenue"),
  getReviews: (params) => api.get("/admin/reviews", { params }),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
};

export const channelAPI = {
  getMyChannel: () => api.get("/channels/me"),
  getBySlug: (slug) => api.get(`/channels/${slug}`),
  update: (id, data) => api.put(`/channels/${id}`, data),
  subscribe: (id, data = {}) => api.post(`/channels/${id}/subscribe`, data),
  unsubscribe: (id) => api.delete(`/channels/${id}/subscribe`),
  checkSubscription: (id) => api.get(`/channels/${id}/subscription-status`),
  updateNotificationPreference: (id, preference) => api.patch(`/channels/${id}/notification-preference`, { preference }),
  getMemberships: (id) => api.get(`/channels/${id}/memberships`),
  joinMembership: (id, data = {}) => api.post(`/channels/${id}/join-membership`, data),
  cancelMembership: (id) => api.delete(`/channels/${id}/cancel-membership`),
  getMySubscriptions: () => api.get("/channels/my-subscriptions"),
  getVideos: (id, params) => api.get(`/channels/${id}/videos`, { params }),
  getPlaylists: (id) => api.get(`/channels/${id}/playlists`),
  getPlaylistDetails: (id) => api.get(`/channels/playlists/${id}`),
  createPlaylist: (data) => api.post("/channels/playlists", data),
  updatePlaylist: (id, data) => api.put(`/channels/playlists/${id}`, data),
  deletePlaylist: (id) => api.delete(`/channels/playlists/${id}`),
  getCommunityPosts: (channelId, params) => api.get(`/channels/${channelId}/community`, { params }),
  createCommunityPost: (channelId, data) => api.post(`/channels/${channelId}/community`, data),
  votePoll: (postId, optionIndex) => api.post(`/channels/posts/${postId}/vote`, { optionIndex }),
  likePost: (postId) => api.post(`/channels/posts/${postId}/like`),
  deletePost: (postId) => api.delete(`/channels/posts/${postId}`),
  getAnalytics: (id) => api.get(`/channels/${id}/analytics`),
  getSubscriptionsFeed: () => api.get("/channels/feed/subs"),
  getRecommendedChannels: () => api.get("/channels/discovery/recommended"),
  searchChannels: (q) => api.get(`/channels/search?q=${q}`),
};

export default api;
