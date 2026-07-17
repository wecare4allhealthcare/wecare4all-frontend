/**
 * admin/dashboard/BlogPosts.jsx — Admin creates/edits/publishes blog
 * posts directly (client requirement), and can one-time/repeatably
 * import existing posts from the Blogger account as drafts to review.
 * See migration_009_add_blog_posts.sql for the full architecture
 * rationale (self-hosted CMS instead of continuing to rely on Blogger
 * or a third-party embed widget).
 */
import { useEffect, useState } from "react";
import { API, SectionHead } from "./shared";

const emptyForm = {
  title: "", slug: "", excerpt: "", content_html: "", cover_image_url: "",
  author_name: "We Care 4 'all' Team", tags: "", status: "draft",
  meta_title: "", meta_description: "",
};

export default function BlogPosts({ token }) {
  const [list,      setList]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("all"); // all | published | draft
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState(null); // null = new, obj = edit
  const [form,      setForm]      = useState(emptyForm);
  const [saving,    setSaving]    = useState(false);
  const [err,       setErr]       = useState(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/admin/blog/posts`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setList(json.posts || []);
    } catch { setErr("Failed to load posts"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchList(); }, []);

  const openNew  = () => { setEditing(null); setForm(emptyForm); setShowForm(true); setErr(null); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title || "", slug: p.slug || "", excerpt: p.excerpt || "",
      content_html: p.content_html || "", cover_image_url: p.cover_image_url || "",
      author_name: p.author_name || "We Care 4 'all' Team",
      tags: (p.tags || []).join(", "), status: p.status || "draft",
      meta_title: p.meta_title || "", meta_description: p.meta_description || "",
    });
    setShowForm(true); setErr(null);
  };

  const save = async () => {
    if (!form.title.trim()) { setErr("Title is required"); return; }
    setSaving(true); setErr(null);
    const url    = editing ? `${API}/admin/blog/posts/${editing.id}` : `${API}/admin/blog/posts`;
    const method = editing ? "PUT" : "POST";
    const payload = {
      ...form,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      slug: form.slug.trim() || undefined,
      cover_image_url: form.cover_image_url.trim() || null,
      meta_title: form.meta_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
    };
    try {
      const res  = await fetch(url, { method, headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || "Save failed"); return; }
      setShowForm(false);
      fetchList();
    } catch { setErr("Network error"); }
    finally { setSaving(false); }
  };

  const togglePublish = async (p) => {
    await fetch(`${API}/admin/blog/posts/${p.id}`, {
      method:"PUT",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify({
        title: p.title, excerpt: p.excerpt, content_html: p.content_html,
        cover_image_url: p.cover_image_url, author_name: p.author_name,
        tags: p.tags || [], slug: p.slug,
        status: p.status === "published" ? "draft" : "published",
        meta_title: p.meta_title, meta_description: p.meta_description,
      }),
    });
    fetchList();
  };

  const del = async (id) => {
    if (!window.confirm("Delete this post permanently? This can't be undone.")) return;
    await fetch(`${API}/admin/blog/posts/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` }});
    fetchList();
  };

  const importFromBlogger = async () => {
    setImporting(true); setImportMsg(null);
    try {
      const res  = await fetch(`${API}/admin/blog/import-from-blogger`, { method:"POST", headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      if (!res.ok) { setImportMsg({ ok:false, text: json.detail || "Import failed" }); return; }
      setImportMsg({ ok:true, text: json.message });
      fetchList();
    } catch { setImportMsg({ ok:false, text:"Network error" }); }
    finally { setImporting(false); }
  };

  const inp = { width:"100%", border:"1.5px solid #e2eaf4", borderRadius:"9px", padding:"9px 12px",
    fontFamily:"'DM Sans',sans-serif", fontSize:"13.5px", color:"#1e293b", background:"#f8fafc", outline:"none" };
  const lbl = { display:"block", fontFamily:"'DM Sans',sans-serif", fontSize:"12px", fontWeight:"600", color:"#374151", marginBottom:"5px" };

  const filtered = list.filter(p => filter === "all" ? true : p.status === filter);

  return (
    <div>
      <SectionHead title="Blog" count={list.length}/>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"16px"}}>
        Posts written here publish directly on wecare4allhealthcare's own domain — better for this
        site's own SEO than continuing to rely on Blogger or a third-party widget. Use "Import from
        Blogger" once to bring in existing posts as drafts to review before publishing.
      </p>

      <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"14px",alignItems:"center"}}>
        <button onClick={openNew}
          style={{padding:"10px 18px",borderRadius:"9px",border:"none",cursor:"pointer",
            background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px"}}>
          + New Post
        </button>
        <button onClick={importFromBlogger} disabled={importing}
          style={{padding:"10px 18px",borderRadius:"9px",border:"1.5px solid #e2eaf4",
            cursor:importing?"wait":"pointer", background:"#fff",color:"#374151",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px"}}>
          {importing ? "Importing…" : "📥 Import from Blogger"}
        </button>
        <div style={{display:"flex",gap:"6px",marginLeft:"auto"}}>
          {["all","published","draft"].map(f => (
            <button key={f} onClick={()=>setFilter(f)}
              style={{padding:"7px 14px",borderRadius:"7px",
                border:filter===f?"1.5px solid #047857":"1.5px solid #e2eaf4",
                background:filter===f?"#f0fdf4":"#fff",
                color:filter===f?"#047857":"#64748b",
                fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"12px",cursor:"pointer"}}>
              {f==="all"?"All":f==="published"?"Published":"Drafts"}
            </button>
          ))}
        </div>
      </div>

      {importMsg && (
        <div style={{background:importMsg.ok?"#f0fdf4":"#fef2f2",
          border:`1px solid ${importMsg.ok?"#86efac":"#fecaca"}`,borderRadius:"9px",
          padding:"10px 14px",marginBottom:"14px",fontFamily:"'DM Sans',sans-serif",
          fontSize:"12.5px",color:importMsg.ok?"#15803d":"#dc2626"}}>
          {importMsg.text}
        </div>
      )}

      {err && !showForm && <p style={{color:"#dc2626",fontSize:"13px",marginBottom:"12px"}}>❌ {err}</p>}

      {/* Form modal */}
      {showForm && (
        <div style={{position:"fixed",inset:0,background:"rgba(11,31,58,.5)",zIndex:9999,
          display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",overflowY:"auto"}}
          onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div style={{background:"#fff",borderRadius:"16px",padding:"28px",width:"100%",maxWidth:"640px",
            boxShadow:"0 20px 60px rgba(11,31,58,.2)",maxHeight:"90vh",overflowY:"auto"}}>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",fontWeight:"700",
              color:"#0b1f3a",margin:"0 0 20px"}}>
              {editing ? "Edit Post" : "New Post"}
            </h3>

            <label style={lbl} htmlFor="bp-title">Title *</label>
            <input id="bp-title" style={{...inp,marginBottom:"12px"}} value={form.title}
              onChange={e=>setForm(f=>({...f,title:e.target.value}))}
              placeholder="e.g. 5 Tips for Managing Diabetes at Home"/>

            <label style={lbl} htmlFor="bp-slug">URL Slug</label>
            <input id="bp-slug" style={{...inp,marginBottom:"4px"}} value={form.slug}
              onChange={e=>setForm(f=>({...f,slug:e.target.value}))}
              placeholder="Auto-generated from title if left blank"/>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"#6b7688",margin:"0 0 12px"}}>
              Final URL: wecare4allhealthcare.in/blog/{form.slug || "your-title-here"}
            </p>

            <label style={lbl} htmlFor="bp-excerpt">Excerpt (shown on the blog list page)</label>
            <textarea id="bp-excerpt" style={{...inp,marginBottom:"12px"}} rows={2} value={form.excerpt}
              onChange={e=>setForm(f=>({...f,excerpt:e.target.value}))}
              placeholder="A short 1-2 sentence summary"/>

            <label style={lbl} htmlFor="bp-content">Content (HTML) *</label>
            <textarea id="bp-content" style={{...inp,marginBottom:"4px",fontFamily:"monospace",fontSize:"12.5px"}}
              rows={10} value={form.content_html}
              onChange={e=>setForm(f=>({...f,content_html:e.target.value}))}
              placeholder="<p>Write your article here. Basic HTML tags (p, h2, h3, ul, li, a, img, strong) are supported.</p>"/>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"#6b7688",margin:"0 0 12px"}}>
              Supports basic HTML — paragraphs, headings (h2/h3), lists, links, images, bold text.
            </p>

            <label style={lbl} htmlFor="bp-cover">Cover Image URL</label>
            <input id="bp-cover" style={{...inp,marginBottom:"12px"}} value={form.cover_image_url}
              onChange={e=>setForm(f=>({...f,cover_image_url:e.target.value}))}
              placeholder="https://…"/>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
              <div>
                <label style={lbl} htmlFor="bp-author">Author Name</label>
                <input id="bp-author" style={inp} value={form.author_name}
                  onChange={e=>setForm(f=>({...f,author_name:e.target.value}))}/>
              </div>
              <div>
                <label style={lbl} htmlFor="bp-tags">Tags (comma-separated)</label>
                <input id="bp-tags" style={inp} value={form.tags}
                  onChange={e=>setForm(f=>({...f,tags:e.target.value}))}
                  placeholder="diabetes, home care"/>
              </div>
            </div>

            <details style={{marginBottom:"14px"}}>
              <summary style={{...lbl,cursor:"pointer",marginBottom:"8px"}}>SEO (optional — falls back to title/excerpt)</summary>
              <label style={lbl} htmlFor="bp-meta-title">Meta Title</label>
              <input id="bp-meta-title" style={{...inp,marginBottom:"10px"}} value={form.meta_title}
                onChange={e=>setForm(f=>({...f,meta_title:e.target.value}))}/>
              <label style={lbl} htmlFor="bp-meta-desc">Meta Description</label>
              <textarea id="bp-meta-desc" style={inp} rows={2} value={form.meta_description}
                onChange={e=>setForm(f=>({...f,meta_description:e.target.value}))}/>
            </details>

            <label style={{display:"flex",alignItems:"center",gap:"8px",fontFamily:"'DM Sans',sans-serif",
              fontSize:"13px",fontWeight:"600",color:"#374151",marginBottom:"20px",cursor:"pointer"}}>
              <input type="checkbox" checked={form.status==="published"}
                onChange={e=>setForm(f=>({...f,status:e.target.checked?"published":"draft"}))}/>
              Published (visible to visitors)
            </label>

            {err && <p style={{color:"#dc2626",fontSize:"12.5px",marginBottom:"12px"}}>❌ {err}</p>}

            <div style={{display:"flex",gap:"10px"}}>
              <button onClick={()=>setShowForm(false)}
                style={{flex:1,padding:"10px",borderRadius:"9px",border:"1.5px solid #e2eaf4",
                  background:"#f8fafc",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",
                  fontSize:"13px",color:"#64748b",cursor:"pointer"}}>
                Cancel
              </button>
              <button onClick={save} disabled={saving}
                style={{flex:1,padding:"10px",borderRadius:"9px",border:"none",cursor:saving?"not-allowed":"pointer",
                  background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px",opacity:saving?0.7:1}}>
                {saving ? "Saving…" : editing ? "Save Changes" : "Create Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{padding:"40px",textAlign:"center"}}>
          <div style={{width:"28px",height:"28px",border:"3px solid #e2eaf4",
            borderTop:"3px solid #047857",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto"}}/>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{textAlign:"center",padding:"40px",color:"#6b7688",fontFamily:"'DM Sans',sans-serif"}}>
          No posts {filter !== "all" ? `(${filter})` : ""} yet.
        </div>
      ) : (
        filtered.map(p => (
          <div key={p.id} style={{background:"#fff",border:"1.5px solid #e2eaf4",
            borderRadius:"12px",padding:"14px 18px",marginBottom:"10px",
            display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
            <div style={{minWidth:0,flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px",flexWrap:"wrap"}}>
                <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#0b1f3a"}}>{p.title}</strong>
                <span style={{fontSize:"10px",fontWeight:"700",padding:"2px 9px",borderRadius:"50px",
                  fontFamily:"'DM Sans',sans-serif",
                  background:p.status==="published"?"#dcfce7":"#fef9c3",
                  color:p.status==="published"?"#15803d":"#854d0e"}}>
                  {p.status==="published"?"Published":"Draft"}
                </span>
                {p.source==="blogger_import" && (
                  <span style={{fontSize:"10px",fontWeight:"700",padding:"2px 9px",borderRadius:"50px",
                    fontFamily:"'DM Sans',sans-serif",background:"#eff8ff",color:"#0369a1"}}>
                    From Blogger
                  </span>
                )}
              </div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",color:"#94a3b8",margin:0}}>
                /blog/{p.slug}
              </p>
            </div>
            <div style={{display:"flex",gap:"6px",flexShrink:0,flexWrap:"wrap"}}>
              <button onClick={()=>togglePublish(p)}
                style={{padding:"6px 12px",borderRadius:"7px",border:"none",cursor:"pointer",
                  fontSize:"11.5px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",
                  background:p.status==="published"?"#fef9c3":"#dcfce7",
                  color:p.status==="published"?"#92400e":"#15803d"}}>
                {p.status==="published"?"Unpublish":"Publish"}
              </button>
              <button onClick={()=>openEdit(p)}
                style={{padding:"6px 12px",borderRadius:"7px",border:"none",cursor:"pointer",
                  fontSize:"11.5px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",
                  background:"#eff8ff",color:"#0369a1"}}>
                Edit
              </button>
              <button onClick={()=>del(p.id)}
                style={{padding:"6px 12px",borderRadius:"7px",border:"none",cursor:"pointer",
                  fontSize:"11.5px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",
                  background:"#fee2e2",color:"#dc2626"}}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
