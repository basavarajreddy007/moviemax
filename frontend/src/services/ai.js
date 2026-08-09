import api from "./api";

export const aiAPI = {
  chat: (messages, system) => api.post("/ai/chat", { messages, system }),
  generateScript: (data) => api.post("/ai/script/generate", data),
  continueScript: (data) => api.post("/ai/script/continue", data),
  describe: (data) => api.post("/ai/describe", data),
  recommend: (data) => api.post("/ai/recommend", data),
  moodRecommend: (mood) => api.post("/ai/mood-recommend", { mood }),
  analyzeStory: (data) => api.post("/ai/analyze", data),
};
