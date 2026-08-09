const { aiChat, generateScript, continueScript, generateDescription, getRecommendations, getMoodRecommendations, analyzeStory } = require("../services/aiService");

const chat = async (req, res, next) => {
  try {
    const { messages, system, temperature } = req.body;
    if (!messages?.length) {
      return res.status(400).json({ success: false, message: "Messages are required" });
    }
    const result = await aiChat({ messages, system, temperature });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const scriptGenerate = async (req, res, next) => {
  try {
    const { prompt, genre, tone, format, characters, existingScript } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }
    const result = await generateScript({ prompt, genre, tone, format, characters, existingScript });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const scriptContinue = async (req, res, next) => {
  try {
    const { script, direction } = req.body;
    if (!script) {
      return res.status(400).json({ success: false, message: "Script is required" });
    }
    const result = await continueScript({ script, direction });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const describe = async (req, res, next) => {
  try {
    const { title, genre, year, cast, logline } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    const result = await generateDescription({ title, genre, year, cast, logline });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const recommend = async (req, res, next) => {
  try {
    const { genres, favorites, watchHistory, mood } = req.body;
    const result = await getRecommendations({ genres, favorites, watchHistory, mood });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const moodRecommend = async (req, res, next) => {
  try {
    const { mood } = req.body;
    if (!mood) {
      return res.status(400).json({ success: false, message: "Mood is required" });
    }
    const result = await getMoodRecommendations({ mood });
    let recommendations;
    try {
      const cleaned = result.content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      recommendations = JSON.parse(cleaned);
    } catch {
      recommendations = [];
    }
    res.status(200).json({ success: true, data: { content: result.content, recommendations, usage: result.usage } });
  } catch (error) {
    next(error);
  }
};

const storyAnalyze = async (req, res, next) => {
  try {
    const { title, genre, logline, characters, synopsis, aspects } = req.body;
    if (!title && !synopsis) {
      return res.status(400).json({ success: false, message: "Title or synopsis is required" });
    }
    const result = await analyzeStory({ title, genre, logline, characters, synopsis, aspects });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { chat, scriptGenerate, scriptContinue, describe, recommend, moodRecommend, storyAnalyze };
