// Mirrors backend validators so users get instant feedback.
window.Validators = {
  name(v) {
    v = (v || "").trim();
    if (v.length < 2) return "Name must be at least 2 characters";
    if (v.length > 100) return "Name must be at most 100 characters";
    return null;
  },
  email(v) {
    v = (v || "").trim();
    if (!v) return "Email is required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return "Invalid email address";
    return null;
  },
  message(v) {
    v = (v || "").trim();
    if (v.length < 10) return "Message must be at least 10 characters";
    if (v.length > 2000) return "Message must be at most 2000 characters";
    return null;
  },
};
