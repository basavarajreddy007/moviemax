const axios = require("axios");
const { OPENROUTER_API_KEY, TINYFISH_API_KEY } = require("../config/env");

const OPENROUTER_API = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";
const TINYFISH_API = process.env.TINYFISH_API_URL || "https://api.tinyfish.io/v1/chat/completions";
const TINYFISH_MODEL = process.env.TINYFISH_MODEL || "gpt-4";
const systemPrompts = {
  chat: `You are CineBot, an AI assistant for MOVIEMAX — a premium OTT streaming platform. Help users with movie recommendations, platform features, scriptwriting tips, and general entertainment questions. Be concise, knowledgeable, and friendly.`,

  script: `You are Script Studio AI, an expert screenwriting assistant, narrative architect, and script doctor. Your role is to help writers draft, refine, structure, and critique screenplays using industry-standard formatting.

CORE DIRECTIVES:
1. Standard Formatting: Always output script excerpts in standard screenplay format (SCENE HEADINGS in ALL CAPS, Character Names centered/uppercase, Parentheticals, Action lines in present tense, and Dialogue).
2. Mode Awareness:
   - CHAT MODE: Act as a story consultant. Brainstorm plot points, develop character arcs, and refine story structure. Provide 2–3 creative options with pros and cons when asked for ideas.
   - GENERATE MODE: Write production-ready screenplay scenes based on user parameters. Keep action lines visually evocative and concise. Craft dialogue with subtext and distinct character voices. Omit conversational intro/outro text.
   - ANALYZE MODE: Critique provided scripts or outlines. Evaluate pacing, dialogue authenticity, visual storytelling, and character consistency. End with 3 concrete, actionable improvements.
3. Collaborative Guidance: At the end of non-generation responses, offer 2–3 logical next steps or creative directions to keep the writer moving forward.`,

  describe: `You are a copywriter for a streaming platform. Generate engaging, SEO-friendly movie and show descriptions based on key details provided. Keep descriptions 2-3 paragraphs, highlight unique selling points, and match the tone (dramatic, comedic, thrilling, etc.).`,

  recommend: `You are a movie recommendation engine for MOVIEMAX. Based on the user's watch history, favorite genres, and preferences, recommend movies, TV shows, and web series. Give brief reasons for each recommendation.`,

  analyze: `You are Script Studio AI acting as an expert story analyst. Critique provided scripts or outlines. Evaluate pacing, dialogue authenticity, visual storytelling, and character consistency. End with 3 concrete, actionable improvements. Offer 2-3 logical next steps or creative directions at the end.`,
};

const fallbackResponses = {
  chat: "The AI assistant is temporarily unavailable due to rate limits. Please try again in a moment.",
  script: "The AI script assistant is temporarily unavailable due to request limits. Please try again shortly or continue drafting your script manually.",
  describe: "Description generation is temporarily unavailable right now. Please add a short summary manually for now.",
  recommend: "Fresh recommendations are temporarily unavailable because the AI service is rate-limited. Please try again shortly.",
  analyze: "Story analysis is temporarily unavailable right now. Please try again shortly.",
  moodRecommend: '[{"title":"Inception","year":2010,"genre":"Sci-Fi","description":"A mind-bending thriller that rewards close attention and keeps the tension high.","reason":"Its layered storytelling makes it a great pick for viewers who enjoy clever, immersive narratives."},{"title":"The Grand Budapest Hotel","year":2014,"genre":"Comedy","description":"A visually charming and witty film with a warm, whimsical tone.","reason":"Its playful energy and rich character work make it ideal for relaxed, uplifting viewing."},{"title":"Parasite","year":2019,"genre":"Thriller","description":"A sharp and suspenseful drama that mixes social commentary with intense pacing.","reason":"It offers a gripping experience for viewers who want something smart and emotionally charged."},{"title":"Paddington 2","year":2017,"genre":"Comedy","description":"A heartfelt and endlessly charming story with a cozy, optimistic mood.","reason":"Its kindness and humor make it perfect when you want comfort and joy."},{"title":"Interstellar","year":2014,"genre":"Adventure","description":"A sweeping sci-fi journey filled with wonder, emotion, and scale.","reason":"It is a great fit for viewers who want something epic and reflective."},{"title":"La La Land","year":2016,"genre":"Romance","description":"A stylish and emotional musical romance with a bittersweet spark.","reason":"Its warmth and romance make it a strong choice for a heartfelt night in."}]',
};

function formatMessages(messages, system, temperature = 0.7, provider) {
  const systemMsg = systemPrompts[system] || systemPrompts.chat;

  return {
    model: provider.model,
    temperature,
    max_tokens: 4096,
    messages: [
      { role: "system", content: systemMsg },
      ...messages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })),
    ],
  };
}

const fallbackMoodRecommendations = {
  happy: [
    { title: "Paddington 2", year: 2017, genre: "Comedy", description: "A heartwarming and cheerful story about a bear spreading joy.", reason: "Perfect for bringing out pure smiles and comfort." },
    { title: "The Grand Budapest Hotel", year: 2014, genre: "Comedy", description: "A whimsical adventure centered around a legendary concierge.", reason: "Its colorful aesthetics and eccentric humor are a great mood elevator." },
    { title: "Toy Story 3", year: 2010, genre: "Animation", description: "A colorful and nostalgic adventure that celebrates friendship and play.", reason: "An uplifting and joyous watch that makes you feel happy." },
    { title: "Chef", year: 2014, genre: "Comedy", description: "A feel-good culinary road trip that focuses on passion and family bonds.", reason: "Bursting with good food, lighthearted tunes, and positive vibes." },
    { title: "Amélie", year: 2001, genre: "Comedy", description: "A charming and quirky French tale of a whimsical woman spreading happiness.", reason: "A delightful movie that celebrates the simple joys of life." },
    { title: "Singin' in the Rain", year: 1952, genre: "Comedy", description: "A joyous and vibrant musical filled with iconic humor and dance.", reason: "Its infectiously positive energy will brighten up any day." }
  ],
  sad: [
    { title: "Good Will Hunting", year: 1997, genre: "Drama", description: "An emotional and comforting story of self-discovery and mentorship.", reason: "Its deep messages on healing and empathy offer solid comfort." },
    { title: "The Pursuit of Happyness", year: 2006, genre: "Drama", description: "An inspiring and touching journey of perseverance against all odds.", reason: "A perfect emotional release that leaves you feeling hopeful." },
    { title: "Dead Poets Society", year: 1989, genre: "Drama", description: "A moving and inspiring tale of breaking free and finding your own voice.", reason: "A beautifully cozy and poetic drama for reflection." },
    { title: "Forrest Gump", year: 1994, genre: "Drama", description: "A heartwarming, cozy journey through the life of a gentle-hearted man.", reason: "Full of emotional comfort and sweet, timeless moments." },
    { title: "The Intouchables", year: 2011, genre: "Drama", description: "A deeply comforting story about an unlikely friendship that brings new hope.", reason: "Warm, funny, and deeply soothing for the soul." },
    { title: "A Beautiful Mind", year: 2001, genre: "Drama", description: "An emotional and triumphant story of resilience, intellect, and love.", reason: "Uplifting and reassuring when you need a gentle pick-me-up." }
  ],
  excited: [
    { title: "Inception", year: 2010, genre: "SciFi", description: "A mind-bending heist film set within the layered architecture of dreams.", reason: "High-paced action and thrill to fuel your excitement." },
    { title: "The Dark Knight", year: 2008, genre: "Action", description: "A high-stakes, gripping action masterpiece with intense pacing.", reason: "Packed with energy and suspense to match your excited mood." },
    { title: "Mad Max: Fury Road", year: 2015, genre: "Action", description: "An absolute non-stop action road odyssey through a desert wasteland.", reason: "Pure adrenaline and spectacular thrills from start to finish." },
    { title: "Spider-Man: Into the Spider-Verse", year: 2018, genre: "Animation", description: "A visually stunning and energetic animated superhero adventure.", reason: "Bursting with creative action sequences and high-octane music." },
    { title: "Baby Driver", year: 2017, genre: "Action", description: "A high-speed action thriller choreographed perfectly to a killer soundtrack.", reason: "Exciting, stylish, and highly engaging for active entertainment." },
    { title: "Whiplash", year: 2014, genre: "Drama", description: "A highly intense and thrilling drama exploring the cost of absolute greatness.", reason: "Edge-of-your-seat intensity that gets your heart pumping." }
  ],
  thriller: [
    { title: "Parasite", year: 2019, genre: "Thriller", description: "A tense and suspenseful black comedy thriller tracking class dynamics.", reason: "Keeps you guessing with incredible tension and plot twists." },
    { title: "Inception", year: 2010, genre: "SciFi", description: "A mind-bending heist film set within the layered architecture of dreams.", reason: "Mind-bending suspense that rewards close attention." },
    { title: "Se7en", year: 1995, genre: "Thriller", description: "A dark and gripping mystery thriller filled with suspense and twists.", reason: "A masterclass in dark atmosphere and high suspense." },
    { title: "Shutter Island", year: 2010, genre: "Thriller", description: "A mind-bending psychological thriller with a dark, mystery-laden atmosphere.", reason: "Perfect for a mysterious, psychological puzzle session." },
    { title: "Prisoners", year: 2013, genre: "Thriller", description: "A gripping and intense mystery thriller about a desperate search.", reason: "Nail-biting tension and a dark, immersive plot." },
    { title: "Get Out", year: 2017, genre: "Thriller", description: "A chilling and socially sharp psychological thriller with stellar pacing.", reason: "Tense, thought-provoking, and deeply thrilling." }
  ],
  romantic: [
    { title: "La La Land", year: 2016, genre: "Romance", description: "A beautiful, musical story of dreams and romance in Los Angeles.", reason: "Perfect for a colorful, emotional, and romantic evening." },
    { title: "About Time", year: 2013, genre: "Romance", description: "A comforting and emotional romantic drama exploring time and family.", reason: "Deeply romantic and heartwarming, highlighting the value of every day." },
    { title: "The Notebook", year: 2004, genre: "Romance", description: "An epic and deeply emotional classic romantic drama across decades.", reason: "A sweeping romance that pulls at all your heartstrings." },
    { title: "Pride & Prejudice", year: 2005, genre: "Romance", description: "A stylish, romantic period drama showing pride and eventual understanding.", reason: "Beautifully shot and wonderfully romantic." },
    { title: "Before Sunrise", year: 1995, genre: "Romance", description: "A conversation-driven, natural romance between two travelers in Vienna.", reason: "Captures the magical spark of deep, instant connection." },
    { title: "Crazy Rich Asians", year: 2018, genre: "Romance", description: "A fun, vibrant romantic comedy centered on family, love, and high society.", reason: "A colorful, glamorous, and heartwarming modern love story." }
  ],
  nostalgic: [
    { title: "Back to the Future", year: 1985, genre: "Adventure", description: "An iconic 80s sci-fi adventure that defined a generation.", reason: "Retro fun that takes you right back to classic retro cinema." },
    { title: "Jurassic Park", year: 1993, genre: "Adventure", description: "A classic 90s thriller bringing dinosaurs back to life on screen.", reason: "Pure nostalgic wonder from the golden era of blockbusters." },
    { title: "The Matrix", year: 1999, genre: "SciFi", description: "A groundbreaking 90s cyber-action sci-fi that reshaped cinema.", reason: "Classic retro-futurism that feels amazingly nostalgic." },
    { title: "The Lion King", year: 1994, genre: "Animation", description: "The beloved 90s animated masterpiece about family, duty, and destiny.", reason: "Brings back fond childhood memories and timeless songs." },
    { title: "E.T. the Extra-Terrestrial", year: 1982, genre: "SciFi", description: "A touching 80s classic about a boy who befriends a gentle alien.", reason: "A magical, emotional retro trip." },
    { title: "Home Alone", year: 1990, genre: "Comedy", description: "A beloved 90s family comedy filled with holiday warmth and retro charm.", reason: "The ultimate cozy retro movie to trigger warm memories." }
  ],
  chill: [
    { title: "My Octopus Teacher", year: 2020, genre: "Documentary", description: "A relaxing and beautiful documentary showing a deep bond with nature.", reason: "Calm, beautiful, and deeply relaxing to watch." },
    { title: "March of the Penguins", year: 2005, genre: "Documentary", description: "A cozy, low-stakes documentary tracking penguins across the icy tundra.", reason: "Perfect background viewing for a completely relaxed night." },
    { title: "Our Planet", year: 2019, genre: "Documentary", description: "A visually stunning and peaceful documentary showcasing Earth's wonders.", reason: "Beautiful natural scenery and soothing narration." },
    { title: "Midnight in Paris", year: 2011, genre: "Fantasy", description: "A relaxed, whimsical journey through the history and art of Paris.", reason: "Delightfully slow-paced, artistic, and peaceful." },
    { title: "Little Miss Sunshine", year: 2006, genre: "Comedy", description: "A quirky, low-stakes road trip comedy about an endearing, chaotic family.", reason: "Slice-of-life storytelling that keeps things cozy and stress-free." },
    { title: "The Secret Life of Walter Mitty", year: 2013, genre: "Comedy", description: "A visually beautiful and relaxing tale of daydreaming and adventure.", reason: "A soothing cinematic escape to help you unwind." }
  ],
  adventurous: [
    { title: "Interstellar", year: 2014, genre: "SciFi", description: "An epic and emotional journey into space and the survival of humanity.", reason: "A grand scale space exploration to satisfy your sense of adventure." },
    { title: "The Lord of the Rings: The Fellowship of the Ring", year: 2001, genre: "Fantasy", description: "An epic, high-fantasy adventure of loyalty, friendship, and exploration.", reason: "An epic quest across a legendary fantasy landscape." },
    { title: "Avatar", year: 2009, genre: "SciFi", description: "A visually spectacular adventure to the beautiful alien world of Pandora.", reason: "An immersive journey into an exotic, beautiful new frontier." },
    { title: "Life of Pi", year: 2012, genre: "Adventure", description: "An epic, survival adventure story filled with wonder and beautiful visuals.", reason: "A magnificent story of survival, hope, and resilience on the ocean." },
    { title: "Dune", year: 2021, genre: "SciFi", description: "A majestic and epic sci-fi adventure exploring power and destiny.", reason: "A majestic planetary voyage with intense scope and atmosphere." },
    { title: "Spirited Away", year: 2001, genre: "Animation", description: "A magical and adventurous fantasy journey into a mysterious spirit world.", reason: "Whimsical, mysterious, and loaded with imaginative exploration." }
  ]
};

function createFallbackResponse(type, promptText = "") {
  if (type === "moodRecommend") {
    const match = promptText.match(/feeling "([^"]+)"/);
    const mood = match ? match[1].toLowerCase() : "happy";
    const recs = fallbackMoodRecommendations[mood] || fallbackMoodRecommendations.happy;
    return {
      content: JSON.stringify(recs),
      usage: { fallback: true },
      fallback: true,
    };
  }

  if (type === "script" && promptText) {
    return {
      content: `[SCENE START]\n\nINT. CREATIVE LAB - NIGHT\n\nThe writer sits in front of a glowing display, fingers poised over the keyboard.\n\nWRITER\n(smiling gently)\nWe will make this story shine. Even in fallback mode, the creativity flows.\n\nThe screen fills with a simulated script responding to: "${promptText.replace(/"/g, "'")}".\n\n[SCENE END]`,
      usage: { simulation: true },
      fallback: true
    };
  }

  if (type === "chat" && promptText) {
    return {
      content: `Hello! I am CineBot, helper bot for MOVIEMAX. The primary AI service is offline or rate-limited, but I can help bounce ideas! You asked about: "${promptText}". Tell me more about your thoughts on this!`,
      usage: { simulation: true },
      fallback: true
    };
  }

  return {
    content: fallbackResponses[type] || fallbackResponses.chat,
    usage: { fallback: true },
    fallback: true,
  };
}

async function aiChat({ messages, system = "chat", temperature = 0.7, fallbackType = "chat" }) {
  const lastUserMsg = [...messages].reverse().find(m => m.role === "user")?.content || "";

  const providers = [];
  if (OPENROUTER_API_KEY) {
    providers.push({ type: "openrouter", key: OPENROUTER_API_KEY, model: OPENROUTER_MODEL });
    providers.push({ type: "openrouter", key: OPENROUTER_API_KEY, model: "google/gemini-2.5-flash" });
    providers.push({ type: "openrouter", key: OPENROUTER_API_KEY, model: "meta-llama/llama-3.1-8b-instruct:free" });
  }
  if (TINYFISH_API_KEY) {
    providers.push({ type: "tinyfish", key: TINYFISH_API_KEY, model: TINYFISH_MODEL });
  }

  if (providers.length === 0) {
    return {
      content: "AI service is currently unconfigured. Please configure OPENROUTER_API_KEY or TINYFISH_API_KEY in backend/.env to enable AI features.",
      usage: {},
      fallback: false
    };
  }

  let lastError = null;
  for (const provider of providers) {
    try {
      const body = formatMessages(messages, system, temperature, provider);

      if (provider.type === "tinyfish") {
        const response = await axios.post(TINYFISH_API, body, {
          headers: {
            "Authorization": `Bearer ${provider.key}`,
            "Content-Type": "application/json",
          },
          timeout: 45000,
        });

        const choice = response.data.choices?.[0];
        const content = typeof choice?.message?.content === "string"
          ? choice.message.content
          : Array.isArray(choice?.message?.content)
            ? choice.message.content.map((part) => part.text || "").join("")
            : "";

        if (content) {
          return { content, usage: response.data.usage || {} };
        }
      }

      if (provider.type === "openrouter") {
        const response = await axios.post(OPENROUTER_API, body, {
          headers: {
            "Authorization": `Bearer ${provider.key}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
            "X-Title": "MOVIEMAX",
          },
          timeout: 45000,
        });

        const choice = response.data.choices?.[0];
        const content = typeof choice?.message?.content === "string"
          ? choice.message.content
          : Array.isArray(choice?.message?.content)
            ? choice.message.content.map((part) => part.text || "").join("")
            : "";

        if (content) {
          return { content, usage: response.data.usage || {} };
        }
      }
    } catch (error) {
      console.warn(`[AI SERVICE WARN] Provider ${provider.type} with model ${provider.model} failed: ${error.message}`);
      lastError = error;
    }
  }

  console.error("[AI SERVICE ERROR] All providers failed. Last error:", lastError?.message);
  return {
    content: "Unable to complete request: AI provider connection failed.",
    usage: {},
    error: lastError?.message
  };
}

async function generateScript({ prompt, genre, tone, format = "scene", characters, existingScript }) {
  let userMsg = `Write a ${format} for a${genre ? ` ${genre}` : ''}${tone ? ` with a ${tone} tone` : ''}.`;
  if (characters) userMsg += `\nCharacters: ${characters}`;
  if (existingScript) userMsg += `\n\nContinue from this existing script:\n${existingScript}`;
  userMsg += `\n\nPrompt: ${prompt}`;

  return aiChat({
    messages: [{ role: 'user', content: userMsg }],
    system: "script",
    temperature: 0.8,
    fallbackType: "script",
  });
}

async function continueScript({ script, direction }) {
  return aiChat({
    messages: [
      { role: "user", content: `Continue this script:\n\n${script}` },
      ...(direction ? [{ role: "user", content: `Direction: ${direction}` }] : []),
    ],
    system: "script",
    temperature: 0.7,
    fallbackType: "script",
  });
}

async function generateDescription({ title, genre, year, cast, logline }) {
  let details = `Title: ${title || "Untitled"}`;
  if (genre) details += `\nGenre: ${genre}`;
  if (year) details += `\nYear: ${year}`;
  if (cast) details += `\nCast: ${cast}`;
  if (logline) details += `\nLogline: ${logline}`;

  return aiChat({
    messages: [{ role: "user", content: `Generate a compelling description for this movie:\n\n${details}` }],
    system: "describe",
    temperature: 0.7,
    fallbackType: "describe",
  });
}

async function getRecommendations({ genres, favorites, watchHistory, mood }) {
  let context = "Generate movie/TV show recommendations";
  if (genres?.length) context += `\nPreferred genres: ${genres.join(', ')}`;
  if (favorites?.length) context += `\nLiked content: ${favorites.join(', ')}`;
  if (watchHistory?.length) context += `\nRecently watched: ${watchHistory.join(', ')}`;
  if (mood) context += `\nCurrent mood: ${mood}`;

  return aiChat({
    messages: [{ role: "user", content: context }],
    system: "recommend",
    temperature: 0.6,
    fallbackType: "recommend",
  });
}

async function getMoodRecommendations({ mood }) {
  const prompt = `Suggest 6 movies/shows for someone feeling "${mood}".
Return ONLY a valid JSON array of objects (no markdown, no backticks). Each object must have exactly these keys:
- title (string): movie or show title
- year (number): release year
- genre (string): primary genre
- description (string): 1-sentence why it fits this mood
- reason (string): 1-sentence why this matches the "${mood}" mood

Example:
[{"title":"Example Movie","year":2024,"genre":"Comedy","description":"A heartwarming story...","reason":"Its uplifting tone..."}]

Return exactly 6 recommendations.`;

  return aiChat({
    messages: [{ role: "user", content: prompt }],
    system: "recommend",
    temperature: 0.7,
    fallbackType: "moodRecommend",
  });
}

async function analyzeStory({ title, genre, logline, characters, synopsis, aspects }) {
  const analysisAspects = aspects || ["plot", "characters", "pacing", "structure", "conflict"];
  const prompt = `Analyze this story and provide detailed feedback.

Title: ${title || "Untitled"}
Genre: ${genre || "Not specified"}${logline ? `\nLogline: ${logline}` : ''}${characters ? `\nCharacters: ${characters}` : ''}${synopsis ? `\nSynopsis: ${synopsis}` : ''}

Analyze the following aspects: ${analysisAspects.join(', ')}

For each aspect, provide:
1. A score out of 10
2. Strengths (what works well)
3. Weaknesses (what needs improvement)
4. Specific actionable recommendations

Format the response with clear section headers for each aspect and a final overall assessment.`;

  return aiChat({
    messages: [{ role: "user", content: prompt }],
    system: "analyze",
    temperature: 0.4,
    fallbackType: "analyze",
  });
}

module.exports = { aiChat, generateScript, continueScript, generateDescription, getRecommendations, getMoodRecommendations, analyzeStory };
