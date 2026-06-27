// Public blog post detail: render content, comments, and like button.
(function () {
  const root = document.getElementById("postRoot");
  const actions = document.getElementById("postActions");
  const likeBtn = document.getElementById("likeBtn");
  const likeLabel = document.getElementById("likeLabel");
  const likeCount = document.getElementById("likeCount");
  const commentsSection = document.getElementById("commentsSection");
  const commentList = document.getElementById("commentList");
  const commentCount = document.getElementById("commentCount");
  const form = document.getElementById("commentForm");

  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
  function fmtDate(s){try{return new Date(s.replace(" ","T")+"Z").toLocaleString();}catch(_){return s||"";}}

  function slug(){
    if (window.POST_SLUG) return window.POST_SLUG;
    const qs = new URLSearchParams(location.search);
    if (qs.get("slug")) return qs.get("slug");
    const parts = location.pathname.split("/").filter(Boolean);
    return parts[parts.length-1] || "";
  }

  function renderComment(c){
    return `<li class="comment glass">
      <div class="comment-head">
        <strong>${esc(c.name || "Anonymous")}</strong>
        <span class="muted">${fmtDate(c.created_at)}</span>
      </div>
      <p>${esc(c.content)}</p>
    </li>`;
  }

  function paintLike(liked, count){
    likeBtn.setAttribute("aria-pressed", liked ? "true" : "false");
    likeBtn.classList.toggle("liked", !!liked);
    likeLabel.textContent = liked ? "Liked" : "Like";
    likeCount.textContent = count|0;
  }

  async function load(){
    const s = slug();
    if (!s){ root.innerHTML = `<p class="muted">Missing post slug.</p>`; return; }
    try{
      const post = await API.get(`/api/posts/${encodeURIComponent(s)}`);
      document.title = `${post.title} — Blog`;
      root.innerHTML = `
        <header class="post-header">
          <h1>${esc(post.title)}</h1>
          <p class="muted post-byline">By ${esc(post.author || "Admin")} · ${fmtDate(post.created_at)}</p>
        </header>
        <div class="post-content">${esc(post.content).replace(/\n/g,"<br>")}</div>`;
      actions.hidden = false;
      commentsSection.hidden = false;
      paintLike(post.liked, post.likes_count);
      commentList.innerHTML = (post.comments||[]).map(renderComment).join("")
        || `<li class="muted">Be the first to comment.</li>`;
      commentCount.textContent = `(${(post.comments||[]).length})`;
    }catch(e){
      root.innerHTML = `<p class="muted">${e.status===404 ? "Post not found." : "Couldn't load this post."}</p>`;
    }
  }

  likeBtn.addEventListener("click", async ()=>{
    likeBtn.disabled = true;
    try{
      const r = await API.post(`/api/posts/${encodeURIComponent(slug())}/like`, {});
      paintLike(r.liked, r.likes_count);
    }catch(e){ toast(e.message || "Couldn't register like", "error"); }
    finally{ likeBtn.disabled = false; }
  });

  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const name = document.getElementById("cName").value.trim();
    const content = document.getElementById("cContent").value.trim();
    if (content.length < 2){ toast("Comment is too short.", "error"); return; }
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    try{
      const c = await API.post(`/api/posts/${encodeURIComponent(slug())}/comments`, {name, content});
      const item = document.createElement("li");
      item.className = "comment glass";
      item.innerHTML = `<div class="comment-head"><strong>${(c.name||"Anonymous").replace(/[&<>]/g,"")}</strong><span class="muted">just now</span></div><p>${content.replace(/[&<>]/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;"}[m]))}</p>`;
      if (commentList.querySelector(".muted")) commentList.innerHTML = "";
      commentList.appendChild(item);
      form.reset();
      toast("Comment posted.", "success");
    }catch(err){
      toast(err.message || "Couldn't post comment.", "error");
    } finally { btn.disabled = false; }
  });

  load();
})();
