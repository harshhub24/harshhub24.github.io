// Admin profile editor.
(async function () {
  const form = document.getElementById("profileForm");
  try {
    const p = await API.get("/api/admin/profile");
    if (p) {
      for (const k of ["full_name", "title", "tagline", "bio", "email", "location", "avatar"]) {
        if (form.elements[k]) form.elements[k].value = p[k] || "";
      }
      form.elements.skills.value = (p.skills || []).join(", ");
      const socials = p.socials || {};
      for (const k of ["github", "linkedin", "twitter", "website"]) {
        form.elements["social_" + k].value = socials[k] || "";
      }
    }
  } catch (_) { toast("Could not load profile.", "error"); }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      full_name: form.elements.full_name.value,
      title: form.elements.title.value,
      tagline: form.elements.tagline.value,
      bio: form.elements.bio.value,
      email: form.elements.email.value,
      location: form.elements.location.value,
      avatar: form.elements.avatar.value,
      skills: form.elements.skills.value.split(",").map((s) => s.trim()).filter(Boolean),
      socials: {
        github: form.elements.social_github.value.trim(),
        linkedin: form.elements.social_linkedin.value.trim(),
        twitter: form.elements.social_twitter.value.trim(),
        website: form.elements.social_website.value.trim(),
      },
    };
    try {
      await API.put("/api/admin/profile", payload);
      toast("Profile updated.", "success");
    } catch (err) {
      toast(err.message || "Update failed.", "error");
    }
  });
})();
