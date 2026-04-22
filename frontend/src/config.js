// Central API base URL — reads from Render env var, falls back to localhost
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';
export default API_BASE;
