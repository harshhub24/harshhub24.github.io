// API base URL — single source of truth.
//
// Leave empty ("") when the frontend is served by the Flask backend itself
// (same-origin). When deploying the frontend separately (e.g. GitHub Pages)
// set this to the full backend URL, with no trailing slash:
//
//   window.API_BASE = "https://your-backend.onrender.com";
//
// The backend must also set CORS_ORIGINS to include this frontend's origin.
window.API_BASE = "";
