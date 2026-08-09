import { useState, useRef, useEffect } from "react";
import { aiAPI } from "../services/ai";
import toast from "react-hot-toast";
import "../css/ScriptGenerator.css";
import AnimatedTitle from "../components/common/AnimatedTitle";

const SAVED_SCRIPTS_KEY = "cinemax_saved_scripts";

export default function ScriptGenerator() {
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem("script_chat");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("chat");
  const [params, setParams] = useState({ genre: "", tone: "", format: "scene", characters: "" });
  const [savedScripts, setSavedScripts] = useState(() => {
    const saved = localStorage.getItem(SAVED_SCRIPTS_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [scriptTitle, setScriptTitle] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [analysisForm, setAnalysisForm] = useState({ title: "", genre: "", logline: "", characters: "", synopsis: "" });
  const chatEnd = useRef(null);
  const textareaRef = useRef(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    sessionStorage.setItem("script_chat", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [input]);

  const addMessage = (role, content, extras = {}) => {
    setMessages(prev => [...prev, { role, content, id: Date.now(), ...extras }]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    addMessage("user", text);
    setLoading(true);

    try {
      let result;
      if (mode === "script") {
        result = await aiAPI.generateScript({
          prompt: text,
          genre: params.genre || undefined,
          tone: params.tone || undefined,
          format: params.format,
          characters: params.characters || undefined,
        });
      } else {
        result = await aiAPI.chat([
          ...messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: text },
        ], "script");
      }

      addMessage("assistant", result.data.data.content, { usage: result.data.data.usage });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to get response");
      addMessage("assistant", "Sorry, I encountered an error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
    if (!lastAssistant) return toast.error("Generate a script first");
    setLoading(true);

    try {
      const result = await aiAPI.continueScript({
        script: lastAssistant.content,
        direction: input.trim() || undefined,
      });
      addMessage("assistant", result.data.data.content, { usage: result.data.data.usage });
      setInput("");
    } catch (err) {
      toast.error("Failed to continue script");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAnalyze = async () => {
    if (!analysisForm.title.trim() || loading) return;
    setLoading(true);
    addMessage("user", `Analyze story: ${analysisForm.title}${analysisForm.genre ? ` (${analysisForm.genre})` : ""}${analysisForm.logline ? `\nLogline: ${analysisForm.logline}` : ""}`);
    try {
      const { data } = await aiAPI.analyzeStory({
        title: analysisForm.title,
        genre: analysisForm.genre || undefined,
        logline: analysisForm.logline || undefined,
        characters: analysisForm.characters || undefined,
        synopsis: analysisForm.synopsis || undefined,
      });
      addMessage("assistant", data.data.content, { usage: data.data.usage });
    } catch (err) {
      toast.error(err.response?.data?.message || "Analysis failed");
      addMessage("assistant", "Sorry, analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveScript = () => {
    const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
    if (!lastAssistant) return toast.error("No script to save");
    const title = scriptTitle.trim() || `Script ${savedScripts.length + 1}`;
    const newScript = { id: Date.now(), title, content: lastAssistant.content, date: new Date().toISOString() };
    const updated = [newScript, ...savedScripts];
    setSavedScripts(updated);
    localStorage.setItem(SAVED_SCRIPTS_KEY, JSON.stringify(updated));
    setScriptTitle("");
    toast.success("Script saved");
  };

  const loadScript = (script) => {
    addMessage("system", `Loaded: "${script.title}"`, { isSystem: true });
    addMessage("assistant", script.content);
    toast.success(`Loaded "${script.title}"`);
    setShowSidebar(false);
  };

  const deleteScript = (id) => {
    const updated = savedScripts.filter(s => s.id !== id);
    setSavedScripts(updated);
    localStorage.setItem(SAVED_SCRIPTS_KEY, JSON.stringify(updated));
    toast.success("Script deleted");
  };

  const exportScript = () => {
    const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
    if (!lastAssistant) return toast.error("No script to export");
    const blob = new Blob([lastAssistant.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `script-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Script exported");
  };

  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem("script_chat");
    toast.success("Chat cleared");
  };

  return (
    <div className="sg-page">
      <div className="sg-container">
        <div className="sg-header">
          <div className="sg-header-left">
            <h1 className="sg-title">
              <AnimatedTitle text="AI Script Studio" />
            </h1>
            <p className="sg-subtitle">Cinematic AI-powered screenwriting assistant</p>
          </div>
          <div className="sg-header-actions">
            <button className={`sg-mode-btn ${mode === "chat" ? "active" : ""}`} onClick={() => setMode("chat")}>
              Chat
            </button>
            <button className={`sg-mode-btn ${mode === "script" ? "active" : ""}`} onClick={() => setMode("script")}>
              Generate
            </button>
            <button className={`sg-mode-btn ${mode === "analyze" ? "active" : ""}`} onClick={() => setMode("analyze")}>
              Analyze
            </button>
            <button className="sg-icon-btn" onClick={() => setShowSidebar(!showSidebar)} title="Saved Scripts">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </button>
            <button className="sg-icon-btn" onClick={clearChat} title="Clear Chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>

        <div className="sg-main">
          <div className={`sg-sidebar ${showSidebar ? "open" : ""}`}>
            <div className="sg-sidebar-header">
              <h3>Saved Scripts</h3>
              <span className="sg-script-count">{savedScripts.length}</span>
            </div>
            {savedScripts.length === 0 ? (
              <p className="sg-sidebar-empty">No saved scripts yet</p>
            ) : (
              <div className="sg-script-list">
                {savedScripts.map(s => (
                  <div key={s.id} className="sg-script-item">
                    <div className="sg-script-item-info" onClick={() => loadScript(s)}>
                      <span className="sg-script-item-title">{s.title}</span>
                      <span className="sg-script-item-date">{new Date(s.date).toLocaleDateString()}</span>
                    </div>
                    <button className="sg-script-delete" onClick={() => deleteScript(s.id)} title="Delete">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="sg-content">
            {mode === "script" && (
              <div className="sg-params">
                <div className="sg-param-group">
                  <input className="sg-param-input" placeholder="Genre (e.g., Sci-Fi, Drama)" value={params.genre} onChange={e => setParams(p => ({ ...p, genre: e.target.value }))} />
                  <input className="sg-param-input" placeholder="Tone (e.g., Dark, Comedic)" value={params.tone} onChange={e => setParams(p => ({ ...p, tone: e.target.value }))} />
                </div>
                <div className="sg-param-group">
                  <select className="sg-param-select" value={params.format} onChange={e => setParams(p => ({ ...p, format: e.target.value }))}>
                    <option value="scene">Scene</option>
                    <option value="opening">Opening Scene</option>
                    <option value="pilot">Pilot Episode</option>
                    <option value="montage">Montage</option>
                    <option value="dialogue">Dialogue Scene</option>
                    <option value="monologue">Monologue</option>
                  </select>
                  <input className="sg-param-input" placeholder="Characters (optional)" value={params.characters} onChange={e => setParams(p => ({ ...p, characters: e.target.value }))} />
                </div>
              </div>
            )}

            {mode === "analyze" && (
              <div className="sg-params">
                <div className="sg-param-group">
                  <input className="sg-param-input" placeholder="Story Title *" value={analysisForm.title} onChange={e => setAnalysisForm(f => ({ ...f, title: e.target.value }))} />
                  <input className="sg-param-input" placeholder="Genre" value={analysisForm.genre} onChange={e => setAnalysisForm(f => ({ ...f, genre: e.target.value }))} />
                </div>
                <div className="sg-param-group">
                  <input className="sg-param-input" placeholder="Logline / One-line summary" value={analysisForm.logline} onChange={e => setAnalysisForm(f => ({ ...f, logline: e.target.value }))} />
                  <input className="sg-param-input" placeholder="Characters (comma separated)" value={analysisForm.characters} onChange={e => setAnalysisForm(f => ({ ...f, characters: e.target.value }))} />
                </div>
                <textarea className="sg-param-input" style={{ width: "100%", minHeight: 100, resize: "vertical", padding: 12 }} placeholder="Paste your story synopsis / script here for analysis..." value={analysisForm.synopsis} onChange={e => setAnalysisForm(f => ({ ...f, synopsis: e.target.value }))} />
                <button className="sg-send-btn" style={{ alignSelf: "flex-end", padding: "10px 24px", marginTop: 8 }} onClick={handleAnalyze} disabled={loading || !analysisForm.title.trim()}>
                  {loading ? <span className="sg-spinner" /> : "Analyze Story"}
                </button>
              </div>
            )}

            <div className="sg-chat">
              {messages.length === 0 ? (
                <div className="sg-welcome">
                  <div className="sg-welcome-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4a7 7 0 0 0-7 7c0 1.9.8 3.7 2 4.9V20l4-2.5c.3.1.7.2 1 .2a7 7 0 0 0 7-7 7 7 0 0 0-7-7z"/><path d="M18 4l2 2-2 2"/><path d="M14 8l2 2-2 2"/></svg>
                  </div>
                  <h2>Welcome to AI Script Studio</h2>
                  <p>Your AI-powered screenwriting assistant</p>
                  <div className="sg-welcome-suggestions">
                    <button className="sg-suggestion-btn" onClick={() => setInput("Write a tense opening scene for a psychological thriller set in an abandoned asylum")}>
                      Tense thriller opening
                    </button>
                    <button className="sg-suggestion-btn" onClick={() => setInput("Create a heartwarming dialogue between a grandfather and granddaughter")}>
                      Heartwarming dialogue
                    </button>
                    <button className="sg-suggestion-btn" onClick={() => setInput("Write a monologue for a villain justifying their actions")}>
                      Villain monologue
                    </button>
                    <button className="sg-suggestion-btn" onClick={() => setInput("Pilot episode for a sci-fi series about the first human colony on Mars")}>
                      Sci-fi pilot
                    </button>
                  </div>
                </div>
              ) : (
                <div className="sg-messages">
                  {messages.map(msg => (
                    <div key={msg.id} className={`sg-msg ${msg.role} ${msg.isSystem ? "system" : ""}`}>
                      {msg.role === "assistant" && !msg.isSystem && (
                        <div className="sg-msg-avatar">AI</div>
                      )}
                      <div className="sg-msg-content">
                        <div className="sg-msg-text">{msg.content}</div>
                        {msg.usage && (
                          <div className="sg-msg-usage">{msg.usage.total_tokens} tokens</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="sg-msg assistant">
                      <div className="sg-msg-avatar">AI</div>
                      <div className="sg-msg-content">
                        <div className="sg-typing">
                          <span /><span /><span />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={chatEnd} />
            </div>
          </div>
        </div>

        <div className="sg-footer">
          <div className="container_chat_bot">
            <div className="container-chat-options">
              <div className="chat">
                <div className="chat-bot">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder={mode === "script" ? "Describe the scene you want to write..." : "Ask about scriptwriting, get feedback, or brainstorm..."}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                  />
                </div>
                <div className="options">
                  <div className="btns-add">
                    {messages.some(m => m.role === "assistant") && (
                      <>
                        <button type="button" onClick={handleContinue} disabled={loading} title="Continue Script">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 7 23 1 17 1"/><path d="M16 5a9 9 0 1 1-8 0"/></svg>
                        </button>
                        <button type="button" onClick={saveScript} title="Save Script">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        </button>
                        <button type="button" onClick={exportScript} title="Export Script">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        </button>
                      </>
                    )}
                  </div>
                  <button type="button" className="btn-submit" onClick={handleSend} disabled={loading || !input.trim()}>
                    <i>
                      {loading ? (
                        <span className="sg-spinner" />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      )}
                    </i>
                  </button>
                </div>
              </div>
            </div>
            <div className="tags">
              <span onClick={() => setInput("Write a futuristic sci-fi dialogue between two androids.")}>#SciFi</span>
              <span onClick={() => setInput("Generate a plot twist for a crime mystery.")}>#PlotTwist</span>
              <span onClick={() => setInput("Create a dark fantasy hero monologue.")}>#Monologue</span>
              <span onClick={() => setInput("Write a cinematic opening scene with suspense.")}>#Opening</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
