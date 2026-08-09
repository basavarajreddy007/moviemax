import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { movieAPI, genreAPI, categoryAPI, subscriptionAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import "../../css/UploadMovie.css";
import "../../css/Admin.css";

const LANGUAGES = ["English", "Hindi", "Spanish", "French", "Korean", "Japanese"];
const QUALITIES = ["SD", "HD", "Full HD", "4K"];

const DEFAULT_FORM = {
  title: "", description: "", releaseYear: new Date().getFullYear(),
  duration: 0, language: "English", imdbRating: 0, director: "",
  quality: "HD", isFeatured: false, isTrending: false, isNewRelease: false,
  genres: [], category: "", subscriptionPlan: "",
  poster: "", posterPublicId: "", banner: "", bannerPublicId: "",
  video: "", videoPublicId: "", trailer: "", trailerPublicId: "",
};

function mapMovieToForm(m) {
  return {
    title: m.title, description: m.description, releaseYear: m.releaseYear,
    duration: m.duration, language: m.language, imdbRating: m.imdbRating,
    director: m.director || "", quality: m.quality,
    isFeatured: m.isFeatured, isTrending: m.isTrending, isNewRelease: m.isNewRelease,
    genres: m.genres?.map((g) => g._id || g) || [],
    category: m.category?._id || m.category || "",
    subscriptionPlan: m.requiredPlan?._id || m.requiredPlan || "",
    poster: m.poster?.url || "", posterPublicId: m.poster?.publicId || "",
    banner: m.banner?.url || "", bannerPublicId: m.banner?.publicId || "",
    video: m.video?.url || "", videoPublicId: m.video?.publicId || "",
    trailer: m.trailer?.url || "", trailerPublicId: m.trailer?.publicId || "",
  };
}

function Field({ label, children }) {
  return (
    <div className="um-field">
      {label && <label className="um-label">{label}</label>}
      {children}
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="um-section">
      <div className="um-section-header">
        <span className="um-section-icon">{icon}</span>
        <h3 className="um-section-title">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function EditMovie() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [genres, setGenres] = useState([]);
  const [categories, setCategories] = useState([]);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const handleVideoUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingVideo(true);
    const toastId = toast.loading("Uploading local video file...");
    try {
      const { data } = await api.post("/movies/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (data?.url) {
        setForm((prev) => ({ ...prev, video: data.url }));
        toast.success("Video uploaded successfully!", { id: toastId });
      } else {
        toast.error("Upload failed: Invalid response", { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload video file", { id: toastId });
    } finally {
      setUploadingVideo(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([
      movieAPI.getById(id).then(({ data }) => setForm(mapMovieToForm(data.data))).catch(() => navigate(user?.role === "admin" ? "/admin" : "/movies")),
      genreAPI.getAll({ all: true }).then(({ data }) => setGenres(data.data)),
      categoryAPI.getAll({ all: true }).then(({ data }) => setCategories(data.data)),
      subscriptionAPI.getPlans().then(({ data }) => setPlans(data.data || [])),
    ]).finally(() => setLoading(false));
  }, [id, navigate, user]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }, []);

  const handleGenreToggle = useCallback((gid) => {
    setForm((prev) => ({
      ...prev,
      genres: prev.genres.includes(gid)
        ? prev.genres.filter((id) => id !== gid)
        : [...prev.genres, gid],
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await movieAPI.update(id, form);
      toast.success("Movie updated");
      navigate(user?.role === "admin" ? "/admin" : "/movies");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update movie");
    } finally {
      setSaving(false);
    }
  }, [id, form, navigate]);

  if (loading) return <div className="a-loading"><span className="a-spinner" /></div>;

  return (
    <div className="um-page">
      <div className="um-header">
        <div className="um-header-glow" />
        <h1 className="um-title">Edit Movie</h1>
        <p className="um-subtitle">Update the details for this movie</p>
      </div>

      <form onSubmit={handleSubmit} className="um-form">

        <Section title="Basic Info" icon="">
          <div className="um-grid-2">
            <Field label="Title *">
              <input name="title" className="um-input" placeholder="Movie title" value={form.title} onChange={handleChange} required />
            </Field>
            <Field label="Release Year">
              <input name="releaseYear" type="number" className="um-input" value={form.releaseYear} onChange={handleChange} />
            </Field>
          </div>
        </Section>

        <Section title="Classification" icon="">
          <div className="um-grid-3">
            <Field label="Language">
              <select name="language" className="um-input" value={form.language} onChange={handleChange}>
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Quality">
              <select name="quality" className="um-input" value={form.quality} onChange={handleChange}>
                {QUALITIES.map((q) => <option key={q}>{q}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select name="category" className="um-input" value={form.category} onChange={handleChange}>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Subscription Plan">
            <select name="subscriptionPlan" className="um-input" value={form.subscriptionPlan} onChange={handleChange}>
              <option value="">Free — available to all users</option>
              {plans.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </Field>
        </Section>

        <Section title="Description" icon="">
          <Field>
            <textarea
              name="description"
              className="um-input um-textarea"
              placeholder="Write a description…"
              rows={5}
              value={form.description}
              onChange={handleChange}
            />
          </Field>
        </Section>

        <Section title="Genres" icon="">
          <Field label="Select Genres">
            <select
              className="um-input"
              onChange={(e) => {
                handleGenreToggle(e.target.value);
                e.target.value = "";
              }}
              defaultValue=""
            >
              <option value="">Choose a genre…</option>
              {genres
                .filter((g) => !form.genres.includes(g._id))
                .map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
            </select>
          </Field>
          {form.genres.length > 0 && (
            <div className="um-genres" style={{ marginTop: 12 }}>
              {genres
                .filter((g) => form.genres.includes(g._id))
                .map((g) => (
                  <button
                    key={g._id}
                    type="button"
                    className="um-genre-chip um-genre-chip--active"
                    onClick={() => handleGenreToggle(g._id)}
                  >
                    {g.name} <span style={{ marginLeft: 6, opacity: 0.7 }}>&times;</span>
                  </button>
                ))}
            </div>
          )}
        </Section>

        <Section title="Media" icon="">
          <div className="um-grid-2">
            <Field label="Poster URL">
              <input name="poster" className="um-input" placeholder="https://…" value={form.poster} onChange={handleChange} />
            </Field>
            <Field label="Video URL / Upload local file">
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                  name="video"
                  className="um-input"
                  placeholder="https://example.com/video.mp4"
                  value={form.video}
                  onChange={handleChange}
                  style={{ flex: 1 }}
                />
                <label className="um-btn-primary" style={{ padding: "10px 18px", margin: 0, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", minHeight: "unset" }}>
                  {uploadingVideo ? <span className="um-ai-spinner" /> : " Choose File"}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    style={{ display: "none" }}
                    disabled={uploadingVideo}
                  />
                </label>
              </div>
            </Field>
          </div>
        </Section>

        <Section title="Visibility" icon="">
          <div className="um-toggles">
            {[
              ["isFeatured", "", "Featured"],
              ["isTrending", "", "Trending"],
              ["isNewRelease", "", "New Release"],
            ].map(([name, icon, label]) => (
              <label key={name} className={`um-toggle ${form[name] ? "um-toggle--on" : ""}`}>
                <input type="checkbox" name={name} checked={form[name]} onChange={handleChange} className="um-toggle-input" />
                <span className="um-toggle-icon">{icon}</span>
                <span className="um-toggle-label">{label}</span>
                <span className="um-toggle-switch"><span className="um-toggle-knob" /></span>
              </label>
            ))}
          </div>
        </Section>

        <div className="um-submit-row">
          <button type="button" className="um-btn-ghost" onClick={() => navigate(user?.role === "admin" ? "/admin" : "/movies")}>Cancel</button>
          <button type="submit" className="um-btn-primary" disabled={saving}>
            {saving
              ? <><span className="um-ai-spinner um-spinner-white" /> Saving…</>
              : <><span></span> Save Changes</>
            }
          </button>
        </div>

      </form>
    </div>
  );
}
