import { useState, useEffect } from "react";
import { brandAPI } from "../../services/api";
import toast from "react-hot-toast";
import "../../css/Admin.css";

const EMPTY_FORM = { name: "", description: "", logo: { url: "" }, website: "", isActive: true };

export default function ManageBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchBrands = async () => {
    try {
      const { data } = await brandAPI.getAll({ all: true });
      setBrands(data.data);
    } catch { toast.error("Failed to load brands"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBrands(); }, []);

  const resetForm = () => { setForm(EMPTY_FORM); setEditing(null); setShowForm(false); };

  const handleEdit = (brand) => {
    setForm({ name: brand.name, description: brand.description || "", logo: brand.logo || { url: "" }, website: brand.website || "", isActive: brand.isActive });
    setEditing(brand._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    try {
      editing ? await brandAPI.update(editing, form) : await brandAPI.create(form);
      toast.success(editing ? "Brand updated" : "Brand created");
      resetForm();
      fetchBrands();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to save brand"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this brand?")) return;
    try {
      await brandAPI.delete(id);
      toast.success("Brand deleted");
      fetchBrands();
    } catch { toast.error("Failed to delete brand"); }
  };

  if (loading) return <div className="a-loading"><span className="a-spinner" /></div>;

  return (
    <div className="a-page">
      <div className="a-page-header">
        <div>
          <h1 className="a-page-title">Brands</h1>
          <p className="a-page-sub">Manage partner brands and logos</p>
        </div>
        <button className="um-btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          + Add Brand
        </button>
      </div>

      {showForm && (
        <div className="um-section" style={{ marginBottom: "var(--space-lg)" }}>
          <div className="um-section-header">
            <span className="um-section-icon"></span>
            <h3 className="um-section-title">{editing ? "Edit Brand" : "Add Brand"}</h3>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <div className="um-grid-2">
              <div className="um-field">
                <label className="um-label">Name *</label>
                <input className="um-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="um-field">
                <label className="um-label">Website</label>
                <input className="um-input" placeholder="https://…" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </div>
            </div>
            <div className="um-field">
              <label className="um-label">Logo URL</label>
              <input className="um-input" placeholder="https://…" value={form.logo.url} onChange={(e) => setForm({ ...form, logo: { url: e.target.value } })} />
            </div>
            <div className="um-field">
              <label className="um-label">Description</label>
              <textarea className="um-input um-textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="um-submit-row">
              <button type="button" className="um-btn-ghost" onClick={resetForm}>Cancel</button>
              <button type="submit" className="um-btn-primary">{editing ? "Update" : "Create"}</button>
            </div>
          </form>
        </div>
      )}

      <div className="a-brand-grid">
        {brands.map((brand) => (
          <div key={brand._id} className="a-brand-card">
            <div className="a-brand-logo">
              {brand.logo?.url
                ? <img src={brand.logo.url} alt={brand.name} />
                : <span>{brand.name[0]}</span>
              }
            </div>
            <div className="a-brand-info">
              <h4 className="a-brand-name">{brand.name}</h4>
              {brand.description && <p className="a-brand-desc">{brand.description}</p>}
              <span className={`a-badge ${brand.isActive ? "a-badge--green" : "a-badge--dim"}`}>
                {brand.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="a-brand-actions">
              <button className="a-btn-sm a-btn-secondary" onClick={() => handleEdit(brand)}>Edit</button>
              <button className="a-btn-sm a-btn-danger" onClick={() => handleDelete(brand._id)}>Delete</button>
            </div>
          </div>
        ))}
        {brands.length === 0 && (
          <div className="a-empty"><p>No brands yet. Add one above.</p></div>
        )}
      </div>
    </div>
  );
}
