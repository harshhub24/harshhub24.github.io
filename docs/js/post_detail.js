// Public blog post: content, comments and like button (all user text is escaped).
(function () {
  const { esc, API, toast } = Site;
  const $ = (id) => document.getElementById(id);
  const root = $("postRoot"), title = $("postTitle"), actions = $("postActions"), likeBtn = $("likeBtn");
  const likeLabel = $("likeLabel"), likeCount = $("likeCount"), commentsSection = $("commentsSection");
  const commentList = $("commentList"), commentCount = $("commentCount"), form = $("commentForm");
  const siteName = document.title.split(" — ").pop();
  const fmtDate = (s) => { try { return new Date(s.replace(" ", "T") + "Z").toLocaleString(); } catch (_) { return s || ""; } };

  function slug() {
    const q = new URLSearchParams(location.search).get("slug");
    if (q) return q;
    const last = location.pathname.split("/").filter(Boolean).pop() || "";   // legacy /blog/<slug> links
    return last === "post" ? "" : last;
  }
  const comment = (c, when) => '<li class="comment"><div class="comment-head"><strong>' + esc(c.name || "Anonymous") + '</strong><span class="muted">' + esc(when || fmtDate(c.created_at)) + "</span></div><p>" + esc(c.content) + "</p></li>";
  function paintLike(liked, count) {
    likeBtn.setAttribute("aria-pressed", liked ? "true" : "false");
    likeLabel.textContent = liked ? "Liked" : "Like";
    likeCount.textContent = count | 0;
  }

  async function load() {
    const s = slug();
    if (!s) { title.textContent = "Post not found"; root.innerHTML = '<p class="muted">Missing post link.</p>'; return; }
    try {
      const post = await API.get("/api/posts/" + encodeURIComponent(s));
      title.textContent = post.title;
      document.title = post.title + " — " + siteName;
      root.innerHTML = '<p class="muted">By ' + esc(post.author || "Admin") + " · " + esc(fmtDate(post.created_at)) + '</p><div class="post-content">' + esc(post.content) + "</div>";
      actions.hidden = false; commentsSection.hidden = false;
      paintLike(post.liked, post.likes_count);
      commentList.innerHTML = (post.comments || []).map((c) => comment(c)).join("") || '<li class="muted">Be the first to comment.</li>';
      commentCount.textContent = "(" + (post.comments || []).length + ")";
    } catch (e) {
      title.textContent = e.status === 404 ? "Post not found" : "Post unavailable";
      root.innerHTML = '<p class="muted">' + (e.status === 404 ? "This post doesn't exist or has been unpublished." : "Couldn't load this post.") + "</p>";
    }
  }

  likeBtn.addEventListener("click", async () => {
    likeBtn.disabled = true;
    try { const r = await API.post("/api/posts/" + encodeURIComponent(slug()) + "/like", {}); paintLike(r.liked, r.likes_count); }
    catch (e) { toast(e.message || "Couldn't register like", "error"); }
    finally { likeBtn.disabled = false; }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("cName").value.trim(), content = $("cContent").value.trim();
    if (content.length < 2) return toast("Comment is too short.", "error");
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      const c = await API.post("/api/posts/" + encodeURIComponent(slug()) + "/comments", { name, content });
      if (commentList.querySelector(".muted")) commentList.innerHTML = "";
      commentList.insertAdjacentHTML("beforeend", comment(c, "just now"));
      form.reset(); toast("Comment posted.", "success");
    } catch (err) { toast(err.message || "Couldn't post comment.", "error"); }
    finally { btn.disabled = false; }
  });
  load();
})();
