// Always use relative URLs so both local dev (via Vite proxy) 
// and Vercel production (via vercel.json rewrites) work correctly.
// Never hardcode localhost here — that breaks production.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';
